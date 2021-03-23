import {task} from "hardhat/config";
require("@nomiclabs/hardhat-waffle");
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
require('hardhat-contract-sizer');
import {getNFTContract, syncFiles} from "./scripts/setup";
import {compilerOutput as LinkToken} from "@chainlink/contracts/abi/v0.7/LinkTokenInterface.json";
import { Contract } from "ethers";
import fs from "fs";
import path from "path";
import {arrayify} from "ethers/lib/utils";


require('dotenv').config({path: path.join(__dirname, '.env.local')});


task("accounts", "Prints the list of accounts", async () => {
  const {ethers} = await import('hardhat');
  const accounts = await ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});



const Configs = {
  rinkeby: {
    chainlink: {
      'coordinator': '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B',
      'token': '0x01be23585060835e02b77ef475b0cc51aa1e0709',
      'keyHash': '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311',
      'price': '100000000000000000',
    }
  }
}

task("deploy", "Deploy the contract", async () => {
  const {ethers, run, network} = await import('hardhat');

  let sourceCodeSubmitters: any[] = [];
  async function deployContract(name, args) {
    console.log(`Deploying ${name}...`);
    const Class = await ethers.getContractFactory(name);
    const contract = await Class.deploy(...args);
    console.log('  ...[waiting to mine]')
    await contract.deployed();

    sourceCodeSubmitters.push(async () => {
      console.log(`  ...[${name}]`)
      await run("verify:verify", {
        address: contract.address,
        constructorArguments: args
      });
    })

    return contract;
  }

  const nft = await deployContract('MahinNFT', [Configs.rinkeby.chainlink]);
  const curve = await deployContract("CurveSeller", [nft.address, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,28,28,29,30]]);
  console.log("ERC721 deployed to:", nft.address);
  console.log("Curve deployed to:", curve.address);

  console.log("Making Curve the minter");
  await (await nft.setMinter(curve.address)).wait();

  console.log("Set IPFS Host");
  await (await nft.setIPFSHost("https://cloudflare-ipfs.com/ipfs/")).wait();

  if (network.name == "main" || network.name == "rinkeby") {
    console.log("Waiting 5 confirmations for Etherscan before we submit the source code");
    await new Promise(resolve => {
      setTimeout(resolve, 60 * 1000);
    });
    for (const submitter of sourceCodeSubmitters) {
      try {
        await submitter();
      } catch (e) {
        console.log("Error submitting validation", e)
      }
    }
  }
});

task("prepare", "Optimize SVGs and prepare metadata JSON files")
    .addParam("directory", "Input directory of SVG files")
    .setAction(async (taskArgs) => {
      const {processSVGs} = await import('./scripts/setup');
      await processSVGs(taskArgs.directory);
    });


task("publish-svgs", "Upload SVGs to IPFS and Arweave")
    .addParam("directory", "Input directory of SVG files")
    .setAction(async (taskArgs) => {
      const {syncFiles} = await import('./scripts/setup');
      await syncFiles();
    });


task("init-tokens", "Add SVGs and IPFs hashes to the deployed contract, initializing each token")
    .addParam("contract", "The NFT contract address")
    .setAction(async (taskArgs) => {
      const {initTokens} = await import('./scripts/setup');
      await initTokens(taskArgs.contract);
    });


task("upload-assets", "Upload assets to IPFS and Arweave")
    .setAction(async (taskArgs) => {
      const {syncFiles} = await import('./scripts/setup');
      await syncFiles();
    });


task("print-stats", "Print stats from the curve")
    .addParam("contract", "The Curve contract address")
    .setAction(async (taskArgs) => {
      const {getCurveContract} = await import('./scripts/setup');
      const contract = await getCurveContract(taskArgs.contract);
      console.log(await contract.getPriceToMint(0));
      console.log(await contract.getPriceToMint(1));
    });


task("mint-token", "Mint a token for test purposes")
  .addParam("contract", "The NFT contract address")
  .addParam("token", "The Token ID")
  .setAction(async (taskArgs) => {
    const {ethers} = await import('hardhat');
    const [signer] = await ethers.getSigners();
    const tokenId = parseInt(taskArgs.token);

    const nft = await getNFTContract(taskArgs.contract);
    await nft.mintToken(tokenId, signer.address);
    console.log(`Minted token ${tokenId} with url=${await nft.tokenURI(tokenId)}`);
  });


task("fetch-token-data", "Fetch token data from the contract")
    .addParam("contract", "The NFT contract address")
    .setAction(async (taskArgs) => {
      const {ethers} = await import('hardhat');
      const [signer] = await ethers.getSigners();

      const nft = await getNFTContract(taskArgs.contract);
      const logs = await nft.queryFilter(nft.filters.TokenDataStorage(2));
      const [normal, diagnosed] = logs[0].args!.states;

      fs.writeFileSync(path.join(__dirname, 'state1-out.gz'), Buffer.from(arrayify(normal)));
      fs.writeFileSync(path.join(__dirname, 'state2-out.gz'), Buffer.from(arrayify(diagnosed)));

      // fs.writeFileSync(path.join(__dirname, 'state1-out.png'), Buffer.from(arrayify(normal)));
      // fs.writeFileSync(path.join(__dirname, 'state2-out.png'), Buffer.from(arrayify(diagnosed)));
    });


task("request-roll", "Request a preroll")
    .addParam("contract", "The NFT contract address")
    .setAction(async (taskArgs) => {
      const {ethers} = await import('hardhat');
      const [signer] = await ethers.getSigners();

      const useChainLink = true;

      // Fund the contract with LINK
      if (useChainLink) {
        const link = new Contract('0x01be23585060835e02b77ef475b0cc51aa1e0709', LinkToken.abi, signer);
        console.log('Funding contract with LINK')
        console.log(await link.transfer(taskArgs.contract, '100000000000000000'));
      }

      const nft = await getNFTContract(taskArgs.contract);
      await nft.requestRoll(!useChainLink);
      console.log(`Requested a roll`);
    });


task("apply-roll", "Apply roll results")
    .addParam("contract", "The NFT contract address")
    .setAction(async (taskArgs) => {
      const {ethers} = await import('hardhat');

      const nft = await getNFTContract(taskArgs.contract);
      await nft.applyRoll();
      console.log(`Applied the roll`);
    });


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.7.3",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  //defaultNetwork: "rinkeby",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_JSON_RPC_URL,
      accounts: {
        mnemonic: process.env.RINKEBY_MNEMONIC
      }
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

