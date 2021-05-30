const {setupMahinNFTContract} = require('./utils');
const { expect } = require("chai");


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

async function setupDoctorV2Contract(nftAddress) {
  // @ts-ignore
  const DoctorV2 = await ethers.getContractFactory("DoctorV2");
  const doctor = await DoctorV2.deploy({
    'coordinator': '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B',
    'token': '0x01be23585060835e02b77ef475b0cc51aa1e0709',
    'keyHash': '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311',
    'price': '100000000000000000',
  }, nftAddress);
  await doctor.deployed();
  return doctor;
}


describe("DoctorV2", function() {
  let doctor, nft;
  beforeEach(async () => {
    nft = await setupMahinNFTContract();
    doctor = await setupDoctorV2Contract(nft.address);
  });

  it("do a roll", async function() {
    const createTime = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
    await nft.setDoctor(doctor.address);
    await doctor.setLastRollTime(createTime);

    const [signer] = await ethers.getSigners();
    await initToken(nft, 5);
    await nft.mintToken(5, signer.address);

    // Div by 18446744073709551616 to get the human-readable probability
    expect((await doctor.getProbability(createTime + 3600*24*365*1)).toString()).to.be.equal("17960620322827803969");
    expect((await doctor.getProbability(createTime + 3600*24*365*5)).toString()).to.be.equal("16140900902422624187");
    expect((await doctor.lastRollTime())).to.be.equal(createTime);
    expect((await doctor.rollProbability())).to.be.equal(0);

    // +1y
    await hre.network.provider.request({method: "evm_mine", params: [createTime + 3600*24*355*1]});

    await doctor.requestRoll(true);
    expect((await doctor.getProbability(createTime + 3600*24*365*5)).toString()).to.be.equal("16565646809409078765");
    expect((await doctor.lastRollTime())).to.be.equal(createTime + 3600*24*355*1 + 1);
    expect((await doctor.rollProbability()).toString()).to.be.equal("17973766523682076299");
    expect((await doctor.isRolling())).to.be.equal(true);

    // +2 blocks
    await hre.network.provider.request({method: "evm_mine", params: []});
    await hre.network.provider.request({method: "evm_mine", params: []});

    await doctor.applyRoll();
    expect((await doctor.rollProbability())).to.be.equal(0);
    expect((await doctor.isRolling())).to.be.equal(false);

    // lets trigger a hit
    await doctor.setPerSecondProbability("0");
    await doctor.requestRoll(true);
    expect((await doctor.getProbability(createTime + 3600*24*365*5)).toString()).to.be.equal("0");

    await hre.network.provider.request({method: "evm_mine", params: []});
    await hre.network.provider.request({method: "evm_mine", params: []});

    expect(await nft.tokenURI(5)).to.equal("hash1");
    await doctor.applyRoll();
    expect(await nft.tokenURI(5)).to.equal("hash2");
  });
});