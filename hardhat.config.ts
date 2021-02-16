import {task} from "hardhat/config";
require("@nomiclabs/hardhat-waffle");
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import {getNFTContract} from "./scripts/setup";
import {compilerOutput as LinkToken} from "@chainlink/contracts/abi/v0.7/LinkTokenInterface.json";
import { Contract } from "ethers";

require('dotenv').config({path: '.env.local'});


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
  const curve = await deployContract("CurveSeller", [nft.address]);
  console.log("ERC721 deployed to:", nft.address);
  console.log("Curve deployed to:", curve.address);

  console.log("Making Curve the minter");
  await (await nft.setMinter(curve.address)).wait();

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
      const {syncSVGs} = await import('./scripts/setup');
      await syncSVGs();
    });


task("init-tokens", "Add SVGs and IPFs hashes to the deployed contract, initializing each token")
    .addParam("contract", "The NFT contract address")
    .setAction(async (taskArgs) => {
      const {initTokens} = await import('./scripts/setup');
      await initTokens(taskArgs.contract);
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
  .setAction(async (taskArgs) => {
    const {ethers} = await import('hardhat');
    const [signer] = await ethers.getSigners();

    const nft = await getNFTContract(taskArgs.contract);
    await nft.mintToken(1, signer.address);
    console.log(`Minted token ${1} with url=${await nft.tokenURI(1)}`);
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
  solidity: "0.7.3",
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

