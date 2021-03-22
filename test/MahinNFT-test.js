const {BigNumber} = require("@ethersproject/bignumber");
const { expect } = require("chai");
const {setupMahinNFTContract} = require('./utils');

async function initToken(nftContract, tokenId) {
  await nftContract.initToken(
      tokenId,
      "a name",
      [
        Buffer.from("sdf"),
        Buffer.from("sdf"),
      ],
      [
        "hash1",
        "hash1",
      ],
  );
}



describe("MahinNFT", function() {
  let nft;
  beforeEach(async () => {
    nft = await setupMahinNFTContract();
  });

  it("should handle init, mint and query", async function() {
    const [signer, account2] = await ethers.getSigners();

    await initToken(nft, 5);

    // Check the empty state (pre-mint)
    expect(await nft.balanceOf(signer.address)).to.equal(0);
    expect(await nft.totalSupply()).to.equal(0);

    // mint the token
    await nft.mintToken(5, signer.address);
    expect(await nft.balanceOf(signer.address)).to.equal(1);
    expect(await nft.totalSupply()).to.equal(1);

    // try a transfer
    await nft.transferFrom(signer.address, account2.address, 5);
    expect(await nft.balanceOf(signer.address)).to.equal(0);
    expect(await nft.balanceOf(account2.address)).to.equal(1);
  });

  it("should return the right token URI", async function() {
    await initToken(nft, 5);

    expect(await nft.tokenURI(5)).to.equal("hash1");

    // with the base host set
    await nft.setIPFSHost("https://foobar.de/");
    expect(await nft.tokenURI(5)).to.equal("https://foobar.de/hash1");
  });

  it("should revert if trying to mint an invalid token", async function() {
    const [signer, account2] = await ethers.getSigners();
    expect(nft.mintToken(7, signer.address)).to.be.revertedWith("invalid id");
  });

  it("do a roll", async function() {
    const createTime = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;

    const [signer] = await ethers.getSigners();
    await initToken(nft, 5);
    await nft.mintToken(5, signer.address);

    // Div by 18446744073709551616 to get the human-readable probability
    expect((await nft.getProbability(createTime + 3600*24*365*1)).toString()).to.be.equal("17641589817835271556");
    expect((await nft.getProbability(createTime + 3600*24*365*5)).toString()).to.be.equal("14757395300609573938");
    expect((await nft.lastRollTime())).to.be.equal(createTime);
    expect((await nft.rollProbability())).to.be.equal(0);

    // +1y
    await hre.network.provider.request({method: "evm_mine", params: [createTime + 3600*24*355*1]});

    await nft.requestRoll(true);
    expect((await nft.getProbability(createTime + 3600*24*365*5)).toString()).to.be.equal("15412060313834570220");
    expect((await nft.lastRollTime())).to.be.equal(createTime + 3600*24*355*1 + 1);
    expect((await nft.rollProbability()).toString()).to.be.equal("17663173434413984989");
    expect((await nft.isRolling())).to.be.equal(true);

    // +2 blocks
    await hre.network.provider.request({method: "evm_mine", params: []});
    await hre.network.provider.request({method: "evm_mine", params: []});

    await nft.applyRoll();
    expect((await nft.rollProbability())).to.be.equal(0);
    expect((await nft.isRolling())).to.be.equal(false);
  });
});

// TODO: test we cannot requestRoll() twice
// TODO: test we cannot applyRoll() out-of-order