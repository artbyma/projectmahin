const {setupMahinNFTContract} = require("./utils");
const {BigNumber} = require("@ethersproject/bignumber");
const { expect } = require("chai");


describe("CurveSeller", function() {
  let curveSeller, nftContract;
  beforeEach(async () => {
    nftContract = await setupMahinNFTContract();
    await nftContract.initToken(1, ["sdf", "sdf",],  ["hash1", "hash1"]);

    const CurveSeller = await ethers.getContractFactory("CurveSeller");
    curveSeller = await CurveSeller.deploy(nftContract.address);
    await curveSeller.deployed();
    await nftContract.setMinter(curveSeller.address);
  });

  it("can get price", async function() {
    const [signer, account2] = await ethers.getSigners();
    expect(await curveSeller.getPriceToMint(0)).to.equal('200000000000000000'); // 0.2
    expect(await curveSeller.getPriceToMint(1)).to.equal('310000000000000000'); // 0.3
    expect(await curveSeller.getPriceToMint(2)).to.equal('420000000000000000'); // 0.4
  });

  it("fails to purchase w/o enough eth", async function() {
    expect(curveSeller.purchase()).to.be.revertedWith("not enough eth");
  });

  it("purchases", async function() {
    const [signer, account2] = await ethers.getSigners();
    const tx = await curveSeller.purchase({value: await curveSeller.getPriceToMint(0)})
    await tx.wait();

    expect(await nftContract.ownerOf(1)).to.equal(signer.address);
  });
});
