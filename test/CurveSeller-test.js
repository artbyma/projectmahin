const {BigNumber} = require("@ethersproject/bignumber");
const { expect } = require("chai");


describe("CurveSeller", function() {
  let curveSeller;
  beforeEach(async () => {
    const CurveSeller = await ethers.getContractFactory("CurveSeller");
    curveSeller = await CurveSeller.deploy("0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B");
    await curveSeller.deployed();
  });

  it("get price", async function() {
    const [signer, account2] = await ethers.getSigners();

    expect(await curveSeller.getPriceToMint(0)).to.equal('200000000000000000'); // 0.2
    expect(await curveSeller.getPriceToMint(1)).to.equal('310000000000000000'); // 0.3
    expect(await curveSeller.getPriceToMint(2)).to.equal('420000000000000000'); // 0.4
  });
});
