import {task} from "hardhat/config";
require("@nomiclabs/hardhat-waffle");
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";

task("accounts", "Prints the list of accounts", async () => {
  const {ethers} = await import('hardhat');
  const accounts = await ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});


task("deploy", "Deploy the contract", async () => {
  const {ethers} = await import('hardhat');
  const MahinNFT = await ethers.getContractFactory("MahinNFT");
  const nft = await MahinNFT.deploy();
  await nft.deployed();
  console.log("NFT deployed to:", nft.address);
  console.log(`Verify with: npx hardhat verify --network ... ${nft.address}`);
});

task("init-tokens", "Call the contract to init a directory of input tokens", async () => {
  const {initTokens} = await import('./scripts/setup');
  await initTokens();
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
};

