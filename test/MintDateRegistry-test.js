const { expect } = require("chai");
const { waffle, network } = require("hardhat");
const provider = waffle.provider;

describe("MintDateRegistry", function() {
  let mintDateRegistry;

  beforeEach(async () => {
    const MintDateRegistry = await ethers.getContractFactory("MintDateRegistry");
    mintDateRegistry = await MintDateRegistry.deploy();
    await mintDateRegistry.deployed();
  });

  it("fallback value", async function() {
    const [owner, account2] = await ethers.getSigners();

    // the fallback value by default
    expect(await mintDateRegistry.getMintDateForToken(1)).to.equal(1616634003);

    // but can be manually set
    await mintDateRegistry.setMintDateForToken(1, 3);
    expect(await mintDateRegistry.getMintDateForToken(1)).to.equal(3);
  });

  it("write permissions", async function() {
    const [owner, account2] = await ethers.getSigners();

    // owner can write
    await mintDateRegistry.setMintDateForToken(1, 3);
    expect(await mintDateRegistry.getMintDateForToken(1)).to.equal(3);

    // another account cannot write
    const account2Registry = mintDateRegistry.connect(account2);
    await expect(account2Registry.setMintDateForToken(2, 42)).to.be.revertedWith("not writer");
    expect(await mintDateRegistry.getMintDateForToken(2)).to.equal(1616634003);

    // add that account as a writer, and test a write
    await mintDateRegistry.addWriter(account2.address);
    await mintDateRegistry.setMintDateForToken(2, 66);
    expect(await mintDateRegistry.getMintDateForToken(2)).to.equal(66);

    // remove that account as a writer, and test a write
    await mintDateRegistry.removeWriter(account2.address);
    await expect(account2Registry.setMintDateForToken(2, 1999)).to.be.revertedWith("not writer");
    expect(await mintDateRegistry.getMintDateForToken(2)).to.equal(66);
  });
});
