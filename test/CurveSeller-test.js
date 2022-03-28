const {setupMahinNFTContract} = require("./utils");
const { expect } = require("chai");
const { waffle, network } = require("hardhat");
const provider = waffle.provider;

describe("CurveSeller", function() {
  let curveSeller, nftContract;
  beforeEach(async () => {
    nftContract = await setupMahinNFTContract();
    await nftContract.initToken(1, "name", ["hash1", "hash1"],  ["hash1", "hash1"]);
    await nftContract.initToken(2, "name", ["hash1", "hash1"],  ["hash1", "hash1"]);

    const CurveSeller = await ethers.getContractFactory("CurveSeller");
    curveSeller = await CurveSeller.deploy(nftContract.address, [1, 2]);
    await curveSeller.deployed();
    await curveSeller.enable(true);
    await nftContract.setMinter(curveSeller.address);
  });

  it("can get price", async function() {
    const [signer, account2] = await ethers.getSigners();
    expect(await curveSeller.getPriceToMint(0)).to.equal('150000000000000000'); // 0.15
    expect(await curveSeller.getPriceToMint(2)).to.equal('150000000000000000'); // 0.15
    expect(await curveSeller.getPriceToMint(5)).to.equal('300000000000000000');

    // How about after a purchase?
    let tx = await curveSeller.purchase({value: await curveSeller.getPriceToMint(0)})
    await tx.wait();
    tx = await curveSeller.purchase({value: await curveSeller.getPriceToMint(0)})
    await tx.wait();

    // +3 is now enough to reach the second level
    expect(await curveSeller.getPriceToMint(3)).to.equal('300000000000000000');
  });

  it("fails to purchase w/o enough eth", async function() {
    await expect(curveSeller.purchase()).to.be.revertedWith("not enough eth");
  });

  it("can purchase", async function() {
    const [signer, account2] = await ethers.getSigners();

    // Buy one
    let tx = await curveSeller.purchase({value: await curveSeller.getPriceToMint(0)})
    await tx.wait();
    expect(await nftContract.tokenOfOwnerByIndex(signer.address, 0)).to.not.equal(0);  // to.not.revert really
    expect(await nftContract.totalSupply()).to.equal(1);

    // Check balance of the contract
    expect(await provider.getBalance(curveSeller.address)).to.equal("150000000000000000");

    // Buy another one
    tx = await curveSeller.purchase({value: await curveSeller.getPriceToMint(0)})
    await tx.wait();
    expect(await nftContract.tokenOfOwnerByIndex(signer.address, 1)).to.not.equal(0);  // to.not.revert really
    expect(await nftContract.totalSupply()).to.equal(2);

    // Only two are in the curve, so this will fail
    await expect(curveSeller.purchase({value: await curveSeller.getPriceToMint(0)})).to.be.revertedWith("sold out");
  });

  it('distributes to beneficiary', async () => {
    const [signer, account2] = await ethers.getSigners();

    await nftContract.setBeneficiary(account2.address);

    // Buy one
    let tx = await curveSeller.purchase({value: await curveSeller.getPriceToMint(0)})
    await tx.wait();
    expect(await nftContract.tokenOfOwnerByIndex(signer.address, 0)).to.not.equal(0);  // to.not.revert really
    expect(await nftContract.totalSupply()).to.equal(1);

    expect(await provider.getBalance(curveSeller.address)).to.equal("37500000000000000");
    expect(await provider.getBalance(account2.address)).to.equal("10000112500000000000000");
  });
});
