const {setupMahinNFTContract} = require("./utils");
const { expect } = require("chai");
const { waffle, network } = require("hardhat");
const provider = waffle.provider;

describe("FixedPriceSeller", function() {
  let fixedSeller, nftContract;
  beforeEach(async () => {
    nftContract = await setupMahinNFTContract();
    await nftContract.initToken(1, "name", ["hash1", "hash1"],  ["hash1", "hash1"]);
    await nftContract.initToken(2, "name", ["hash1", "hash1"],  ["hash1", "hash1"]);

    const FixedPriceSeller = await ethers.getContractFactory("FixedPriceSeller");
    fixedSeller = await FixedPriceSeller.deploy(nftContract.address, [1, 2]);
    await fixedSeller.deployed();
    await fixedSeller.enable(true);
    await nftContract.setMinter(fixedSeller.address);
  });

  it("can get price", async function() {
    const [signer, account2] = await ethers.getSigners();
    expect(await fixedSeller.mintPrice()).to.equal('400000000000000000'); // 0.4

    // How about after a change?
    let tx = await fixedSeller.setMintPrice('500000000000000000')
    await tx.wait();
    expect(await fixedSeller.mintPrice()).to.equal('500000000000000000');
  });

  it("fails to purchase w/o enough eth", async function() {
    expect(fixedSeller.purchase()).to.be.revertedWith("not enough eth");
  });

  it("can purchase", async function() {
    const [signer, account2, account3] = await ethers.getSigners();

    await fixedSeller.transferOwnership(account3.address);

    // Buy one
    let tx = await fixedSeller.purchase({value: await fixedSeller.mintPrice()})
    await tx.wait();
    expect(await nftContract.tokenOfOwnerByIndex(signer.address, 0)).to.not.equal(0);  // to.not.revert really
    expect(await nftContract.totalSupply()).to.equal(1);

    // Check balance of the owner
    expect(await provider.getBalance(account3.address)).to.equal("10000400000000000000000");

    // Buy another one
    tx = await fixedSeller.purchase({value: await fixedSeller.mintPrice()})
    await tx.wait();
    expect(await nftContract.tokenOfOwnerByIndex(signer.address, 1)).to.not.equal(0);  // to.not.revert really
    expect(await nftContract.totalSupply()).to.equal(2);

    // Only two are in the curve, so this will fail
    expect(fixedSeller.purchase({value: await fixedSeller.mintPrice()})).to.be.revertedWith("sold out");
  });

  it('distributes to beneficiary', async () => {
    const [signer, account2, account3] = await ethers.getSigners();

    await nftContract.setBeneficiary(account2.address);
    await fixedSeller.transferOwnership(account3.address);

    // Buy one
    let tx = await fixedSeller.purchase({value: await fixedSeller.mintPrice()})
    await tx.wait();
    expect(await nftContract.tokenOfOwnerByIndex(signer.address, 0)).to.not.equal(0);  // to.not.revert really
    expect(await nftContract.totalSupply()).to.equal(1);

    expect(await provider.getBalance(account3.address)).to.equal("10000900000000000000000");
    expect(await provider.getBalance(account2.address)).to.equal("10000412500000000000000");
  });
});
