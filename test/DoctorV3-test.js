const {setupMahinNFTContract} = require("./utils");
const {expect} = require("chai");
const {BigNumber} = require("bignumber.js");
const {parseEther, formatEther} = require("ethers/lib/utils");
const {waffle} = require("hardhat");
const {commit} = require("lodash/seq");
const {zip} = require("lodash");
const provider = waffle.provider;

async function initToken(nftContract, tokenId) {
  await nftContract.initToken(
      tokenId,
      "a name",
      [
        "hash1",
        "hash2",
      ],
      [
        "hash1",
        "hash2",
      ],
  );
}

async function setupDoctorV3Contract(nftAddress) {
  // @ts-ignore
  const DoctorV3 = await ethers.getContractFactory("DoctorV3");
  const doctor = await DoctorV3.deploy({
    'coordinator': '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B',
    'token': '0x01be23585060835e02b77ef475b0cc51aa1e0709',
    'keyHash': '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311',
    'price': '100000000000000000',
  }, nftAddress);
  await doctor.deployed();
  return doctor;
}


function parseProbability(probability) {
  return new BigNumber(1).minus(new BigNumber(probability).div(new BigNumber(2).pow(64)));
}


describe("DoctorV3", function() {
  let doctor, nft, createTime;
  beforeEach(async () => {
    nft = await setupMahinNFTContract();
    doctor = await setupDoctorV3Contract(nft.address);

    // init the doctor
    createTime = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
    await nft.setDoctor(doctor.address);
    await doctor.setLastRollTime(createTime);
  });

  // basic roll functionality
  it("can do rolls and diagnose", async function() {
    const [signer] = await ethers.getSigners();
    await initToken(nft, 5);
    await nft.mintToken(5, signer.address);

    // Div by 18446744073709551616 to get the human-readable probability
    expect((await doctor.getProbability(createTime + 3600*24*365*1)).toString()).to.be.equal("17960620322827803969");
    expect((await doctor.getProbability(createTime + 3600*24*365*5)).toString()).to.be.equal("16140900902422624187");
    expect((await doctor.lastRollAppliedTime())).to.be.equal(createTime);
    expect((await doctor.lastRollRequestedTime())).to.be.equal(createTime);

    // +1y
    let currentChainTime = createTime + 3600*24*355*1;
    await hre.network.provider.request({method: "evm_mine", params: [currentChainTime]});

    await doctor.requestRoll(true);
    expect((await doctor.getProbability(createTime + 3600*24*365*5)).toString()).to.be.equal("16565646809409078765");
    expect((await doctor.currentRollRequestedTime())).to.be.equal(createTime + 3600*24*355*1 + 1);
    expect((await doctor.lastRollRequestedTime())).to.be.equal(createTime);
    expect((await doctor.rollProbability()).toString()).to.be.equal("18446744073709551616");
    expect((await doctor.isRolling())).to.be.equal(true);

    // +2 blocks
    await mine2Blocks();

    await doctor.applyRoll();
    expect((await doctor.currentRollRequestedTime())).to.be.equal(0);
    expect((await doctor.getProbability(createTime + 3600*24*365*5)).toString()).to.be.equal("16565646809409078765");
    expect((await doctor.isRolling())).to.be.equal(false);

    // Test what the odds are in 5 years
    //console.log('---', parseProbability((await doctor.getProbability(createTime + 3600*24*365*15)).toString()).toString());
    expect((await doctor.getProbability(createTime + 3600*24*365*5)).toString()).to.be.equal("16565646809409078765");

    // lets trigger a hit with 100% artificial odds (probability value 0 = 100%)
    await doctor.setPerSecondProbability("10000000000000000");
    expect((await doctor.getProbability(currentChainTime + 1000)).toString()).to.be.equal("0");
    await doctor.requestRoll(true);

    await mine2Blocks();

    expect(await nft.tokenURI(5)).to.equal("hash1");
    await doctor.applyRoll();
    expect(await nft.tokenURI(5)).to.equal("hash2");
  });

  it("pays out nothing if not funded", async function() {
    expect(new BigNumber(await rollWithPayout(doctor)).toNumber()).to.equal(0);
  });

  it("pays out the minimum fee", async function() {
    const [signer, _, __, ___, funder] = await ethers.getSigners();
    await funder.sendTransaction({to: doctor.address,  value: parseEther("1.0")});

    // After the minimum time (two blocks).
    expect(await rollWithPayout(doctor)).to.equal('0.000000101471334348');

    // But pays the same amount even if we delay the commit call (if it remains within the reward lock period, that is).
    expect(await rollWithPayout(doctor, createTime + 1800)).to.equal('0.000000025367833587');
    expect(await rollWithPayout(doctor, createTime + 3600)).to.equal('0.000000025367833587');
  });

  it("pays out a larger fee if we increase the duration", async function() {
    const [signer, _, __, ___, funder] = await ethers.getSigners();
    await funder.sendTransaction({to: doctor.address,  value: parseEther("1.0")});
    await hre.network.provider.request({method: "evm_mine", params: [createTime + 3600*24*30]});
    expect(new BigNumber(await rollWithPayout(doctor)).toString()).to.equal("0.065753450025367833");
  });

  it("someone else does the apply while locked", async function() {
    const [signer, _, __, ___, funder, signer2] = await ethers.getSigners();
    await funder.sendTransaction({to: doctor.address,  value: parseEther("1.0")});

    // move into the future, request roll
    await hre.network.provider.request({method: "evm_mine", params: [createTime + 3600*24*30]});
    await withBalanceChange(signer.address, async () => { await doctor.requestRoll(true); });

    // require two blocks until apply
    await mine2Blocks();

    // a different account does the apply
    const doctor2 = doctor.connect(signer2);
    const balanceChange = await withBalanceChange([signer2.address, signer.address], async () => {
      const tx = await doctor2.applyRoll();
      const r = await tx.wait();
      return r.gasUsed.mul(r.effectiveGasPrice);
    });
    expect(balanceChange.toString()).to.equal("0.0,0.065753450025367833");
  });

  it("someone else does the apply after locking expired", async function() {
    const [signer, _, __, ___, funder, signer2] = await ethers.getSigners();
    await funder.sendTransaction({to: doctor.address,  value: parseEther("1.0")});

    // move into the future, request roll
    await hre.network.provider.request({method: "evm_mine", params: [createTime + 3600*24*30]});
    await withBalanceChange(signer.address, async () => { await doctor.requestRoll(true); });

    // require two blocks until apply
    await hre.network.provider.request({method: "evm_mine", params: []});
    await hre.network.provider.request({method: "evm_mine", params: [createTime + 3600*24*30 + 3600*2]});

    // a different account does the apply
    const doctor2 = doctor.connect(signer2);
    const balanceChange = await withBalanceChange([signer2.address, signer.address], async () => {
      const tx = await doctor2.applyRoll();
      const r = await tx.wait();
      return r.gasUsed.mul(r.effectiveGasPrice);
    });

    // the applyRoll() submitter was paid instead.
    expect(balanceChange.toString()).to.equal("0.065936098427194317,0.0");
  });

  it("someone else calls requestRoll when already called", async function() {
    const [signer, _, __, ___, funder, signer2] = await ethers.getSigners();
    await funder.sendTransaction({to: doctor.address,  value: parseEther("1.0")});
    const doctor2 = doctor.connect(signer2);

    // move into the future, request roll
    await hre.network.provider.request({method: "evm_mine", params: [createTime + 3600*24*30]});
    await withBalanceChange(signer.address, async () => { await doctor.requestRoll(true); });

    // have a second signer request roll as well - this should be a noop.
    await withBalanceChange(signer2.address, async () => { await doctor.requestRoll(true); });

    // require two blocks until apply
    await mine2Blocks();

    // second signer submits applyRoll, but it remains locked to the first one.
    const balanceChange = await withBalanceChange([signer2.address, signer.address], async () => {
      const tx = await doctor2.applyRoll();
      const r = await tx.wait();
      return r.gasUsed.mul(r.effectiveGasPrice);
    });
    expect(balanceChange.toString()).to.equal("0.0,0.065753450025367833");
  });

  it("handle case of reward being larger then funding", async function() {
    const [signer, _, __, ___, funder, signer2] = await ethers.getSigners();

    // fund with 0.1 eth only
    await funder.sendTransaction({to: doctor.address,  value: parseEther("0.1")});

    // move 2 years into the future - this should pay out about 1.6 eth
    await hre.network.provider.request({method: "evm_mine", params: [createTime + 3600*24*30 * 24]});
    await withBalanceChange(signer.address, async () => { await doctor.requestRoll(true); });

    // require two blocks until apply
    await mine2Blocks();

    // second signer submits applyRoll, but it remains locked to the first one.
    const balanceChange = await withBalanceChange(signer.address, async () => {
      const tx = await doctor.applyRoll();
      const r = await tx.wait();
      return r.gasUsed.mul(r.effectiveGasPrice);
    });
    expect(balanceChange.toString()).to.equal("0.1");
  });

  it("ensures lastApplied is used correctly", async function() {
    const [signer, _, __, ___, funder, signer2] = await ethers.getSigners();

    // first it's the init value
    expect(await doctor.lastRollAppliedTime()).to.equal(createTime);

    await hre.network.provider.request({method: "evm_mine", params: [createTime + 3600*24]});
    await withBalanceChange(signer.address, async () => { await doctor.requestRoll(true); });

    // it is still the init value after requestRoll
    expect(await doctor.lastRollAppliedTime()).to.equal(createTime);

    // apply at TARGET
    await mine2Blocks(createTime + 3600*24 + 300);

    await withBalanceChange([signer2.address, signer.address], async () => {
      await doctor.applyRoll();
    });

    // timestamp is now set to TARGET + 1
    expect(await doctor.lastRollAppliedTime()).to.equal(createTime + 3600*24 + 300 + 1);
  });

  it("considers the mint date registry", async function() {
  });
});


async function rollWithPayout(doctor, commitAtTimestamp) {
  const [signer,] = await ethers.getSigners();

  // Stage 1: Costs only gas
  await withBalanceChange(signer.address, async () => {
    await doctor.requestRoll(true);
  });

  await mine2Blocks(commitAtTimestamp);

  // Stage 2: payout
  return await withBalanceChange(signer.address, async () => {
    const tx = await doctor.applyRoll();
    const r = await tx.wait();
    return r.gasUsed.mul(r.effectiveGasPrice);
  })
}


// multiple addresses can be given, in which case the first one is treated as the tx submitter
// from which gas costs are excluded.
async function withBalanceChange(address, cb) {
  let addresses;
  let returnArray = false;
  if (Array.isArray(address)) {
    addresses = address;
    returnArray = true;
  } else {
    addresses = [address];
  }

  const beforeBalances = await Promise.all(addresses.map(address => provider.getBalance(address)));
  const gasCost = await cb();  // callback can return the gas cost to substract
  const afterBalances = await Promise.all(addresses.map(address => provider.getBalance(address)));

  const balanceChanges = zip(beforeBalances, afterBalances).map(([before, after]) => {
    return after.sub(before);
  });

  if (gasCost) {
    balanceChanges[0] = balanceChanges[0].add(gasCost);
  }

  const formattedBalanceChanges = balanceChanges.map(change => formatEther(change, 'gwei'));
  return returnArray ? formattedBalanceChanges : formattedBalanceChanges[0];
}

async function mine2Blocks(commitAtTimestamp) {
  const newTimestampArg = commitAtTimestamp ? [commitAtTimestamp] : [];
  await hre.network.provider.request({method: "evm_mine", params: []});
  await hre.network.provider.request({method: "evm_mine", params: newTimestampArg});
}
