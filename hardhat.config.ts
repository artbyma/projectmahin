import {task} from "hardhat/config";
require("@nomiclabs/hardhat-waffle");
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import {getContract} from "./scripts/setup";


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

task("prepare-svgs", "Optimize SVGs and prepare metadata JSON files")
    .addParam("directory", "Input directory of SVG files")
    .setAction(async (taskArgs) => {
      const {processSVGs} = await import('./scripts/setup');
      await processSVGs(taskArgs.directory);
    });


task("publish-svgs", "Upload SVGs to IPFS and Arweave")
    .addParam("directory", "Input directory of SVG files")
    .setAction(async (taskArgs) => {
      const {syncSVGs} = await import('./scripts/setup');
      await syncSVGs();
    });


task("init-tokens", "Add SVGs and IPFs hashes to the deployed contract, initializing each token")
    .addParam("contract", "The NFT contract address")
    .setAction(async (taskArgs) => {
      const {initTokens} = await import('./scripts/setup');
      await initTokens(taskArgs.contract);
    });


task("mint-token", "Mint a token for test purposes")
  .addParam("contract", "The NFT contract address")
  .setAction(async (taskArgs) => {
    const {ethers} = await import('hardhat');
    const [signer] = await ethers.getSigners();

    const nft = await getContract(taskArgs.contract);
    await nft.mintToken(1, signer.address);
    console.log(`Minted token ${1} with url=${await nft.tokenURI(1)}`);
  });



/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
};

