import {task} from "hardhat/config";
require("@nomiclabs/hardhat-waffle");
import "@tenderly/hardhat-tenderly"
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
require('hardhat-contract-sizer');
import {getNFTContract, syncFiles} from "./scripts/setup";
import {compilerOutput as LinkToken} from "@chainlink/contracts/abi/v0.7/LinkTokenInterface.json";
import { Contract } from "ethers";
import fs from "fs";
import path from "path";
import {arrayify, parseUnits} from "ethers/lib/utils";
import { util } from "chai";
import { DeployUtil } from "./scripts/deployHelpers";


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
    },
  },
  mainnet: {
    chainlink: {
      'coordinator': '0xf0d54349aDdcf704F77AE15b96510dEA15cb7952',
      'token': '0x514910771af9ca656af840dff83e8264ecf986ca',
      'keyHash': '0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445',
      'price': '2000000000000000000',
    }
  }
}

task("deploy-doctor", "Deploy the doctor contract", async () => {
  const {ethers, run, network} = await import('hardhat');

  let sourceCodeSubmitters: any[] = [];
  async function deployContract(name, args) {
    console.log(`Deploying ${name}...`);
    const Class = await ethers.getContractFactory(name);
    const contract = await Class.deploy(...args, {gasPrice: parseUnits('11', 'gwei')});
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

  let nft = await getNFTContract("0xe0ba5a6fc8209e225a9937ce1dfb397f18ad402f");
  const doctor = await deployContract("DoctorV2",
      [Configs.mainnet.chainlink, nft.address]);
  console.log('setting the doctor to ', doctor.address)
  //await (await nft.applyRoll()).wait();
  await (await nft.setDoctor(doctor.address, {gasPrice: parseUnits('12', 'gwei')})).wait();
  //console.log(await nft.projectRuntimeSeconds())

  if (network.name == "mainnet" || network.name == "rinkeby") {
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

task("deploy", "Deploy the contract", async () => {
  const {ethers, run, network} = await import('hardhat');
  const [signer] = await ethers.getSigners();
  console.log("Working as", signer.address);

  const helper = new DeployUtil();

  const nft = await helper.deployContract("MahinNFT", [Configs.mainnet.chainlink]);
  const curve = await helper.deployContract("CurveSeller", [
      nft.address,
      [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
       17,18,
       20,21,22,23,24,25,26,27,
       30, 31, 32, 33, 34, 35, 36, 37, 38,
       40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
       53, 54, 55, 56
      ]
  ]);
  console.log("ERC721 deployed to:", nft.address);
  console.log("Curve deployed to:", curve.address);

  console.log("Making Curve the minter");
  await (await nft.setMinter(curve.address)).wait();

  console.log("Set IPFS Host");
  await (await nft.setIPFSHost("https://cloudflare-ipfs.com/ipfs/")).wait();

  await helper.complete();
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


task("test-run", "Purchase all tokens")
    .addParam("curve", "The Curve contract address")
    .setAction(async (taskArgs) => {
      const {ethers} = await import('hardhat');
      const {getCurveContract, getNFTContract} = await import('./scripts/setup');


      // await ethers.provider.send("hardhat_impersonateAccount", ["owner"]);
      // const signer = ethers.provider.getSigner("owner")
      // const whaleWallet = await SignerWithAddress.create(signer);

      // const curve2 = await getCurveContract(taskArgs.curve, whaleWallet);
      // await curve2.enable(true);

      const curve = await getCurveContract(taskArgs.curve);

      // const nft = await getNFTContract(await curve.nftContract());
      // await nft.setBeneficiary("0x83cB05402E875B5ca953e6eAa639F723d92BC4fc")

      for (let i=0; i<50; i++) {
        console.log("Purchasing", i);
        const tx = await curve.purchase({value: await curve.getPriceToMint(0)});
        await tx.wait();
        console.log();
      }

      console.log((await ethers.provider.getBalance(curve.address)).toString());
      console.log((await ethers.provider.getBalance("0x83cB05402E875B5ca953e6eAa639F723d92BC4fc")).toString());
    });


task("upload-assets", "Upload assets to IPFS and Arweave")
    .setAction(async (taskArgs) => {
      const {syncFiles} = await import('./scripts/setup');
      await syncFiles();
    });


task("print-stats", "Print stats from the curve")
    .addParam("curve", "The Curve contract address")
    .setAction(async (taskArgs) => {
      const {getCurveContract} = await import('./scripts/setup');
      const contract = await getCurveContract(taskArgs.curve);
      console.log('This price', await contract.getPriceToMint(0));
      console.log('Next price', await contract.getPriceToMint(1));
      const numRemaining = (await contract.numRemaining()).toNumber();
      console.log('Ids left to Sell', numRemaining);
      for (let i=0; i<numRemaining; i++) {
        console.log('   ', (await contract.idsToSell(i)).toString());
      }
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
        const link = new Contract('0x01be23585060835e02b77ef475b0cc51aa1e0709', LinkToken.abi, signer as any);
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

      await ethers.provider.send("evm_mine", []);
      await ethers.provider.send("evm_mine", []);

      const nft = await getNFTContract(taskArgs.contract);
      await nft.applyRoll();
      console.log(`Applied the roll`);
    });


task("diagnose", "Diagnose")
    .addParam("contract", "The NFT contract address")
    .addParam("token", "The token id")
    .setAction(async (taskArgs) => {
      const {ethers} = await import('hardhat');
      const [signer] = await ethers.getSigners();

      const {getNFTContract} = await import('./scripts/setup');
      const contract = await getNFTContract(taskArgs.contract);
      await (await contract.setDoctor(signer.address)).wait();

      const before = await contract.tokenURI(parseInt(taskArgs.token));
      await contract.diagnose(parseInt(taskArgs.token));
      const after = await contract.tokenURI(parseInt(taskArgs.token));
      console.log(`Done, url changed from ${before} to ${after}`);
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
    },
    mainnet: {
      url: process.env.MAIN_JSON_RPC_URL,
      accounts: {
        mnemonic: process.env.MAIN_MNEMONIC
      }
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

