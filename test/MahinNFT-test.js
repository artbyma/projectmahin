const { expect } = require("chai");

describe("MahinNFT", function() {
  let nft;
  beforeEach(async () => {
    const [signer, account2] = await ethers.getSigners();

    const MahinNFT = await ethers.getContractFactory("MahinNFT");
    nft = await MahinNFT.deploy();
    await nft.deployed();
  });

  it("should handle init, mint and query", async function() {
    await nft.initToken(
      5,
      [
        "sdf",
        "sdf",
        "sdf",
      ],
      [
        "hash1",
        "hash1",
        "hash1",
      ],
    );

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
    await nft.initToken(
        5,
        [
          "sdf",
          "sdf",
          "sdf",
        ],
        [
          "hash1",
          "hash1",
          "hash1",
        ],
    );

    expect(await nft.tokenURI(5)).to.equal("hash1");

    // with the base host set
    await nft.setIPFSHost("https://foobar.de/");
    expect(await nft.tokenURI(5)).to.equal("https://foobar.de/hash1");
  });

  it("should revert if trying to mint an invalid token", async function() {
    expect(await nft.mintToken(7, signer.address)).to.be.revertedWith("Invalid token id");
  })
});
