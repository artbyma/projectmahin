import "@nomiclabs/hardhat-ethers";
import {ethers} from 'hardhat';
import * as fs from "fs";
import * as path from "path";
const Hash = require('ipfs-only-hash')


export async function initTokens() {
  // find all svgs within "svg-in".
  // structure is:
  // ./01-0.svg (default)
  // ./01-1.svg (diagnosed)
  // ./01-2.svg (post-op)
  // ./02-1.svg (default)


  type FileMeta = {
    imageData: string,
    metadataHash: string
  }
  const tokenIds: Map<number, Map<number, FileMeta>> = new Map();

  const basePath = "./svg-in";
  for (const file of fs.readdirSync(basePath)) {
    const [filename] = file.split('.');
    const [tokenIdStr, stateNumStr] = filename.split('-');
    const tokenId = parseInt(tokenIdStr);
    const stateNum = parseInt(stateNumStr);
    if (Number.isNaN(tokenId) || Number.isNaN(stateNum)) {
      throw new Error(`${file} has a name not confirming to the expected schema: $token-$state.svg`)
    }

    if (!tokenIds.has(tokenId)) { tokenIds.set(tokenId, new Map()); }
    if (tokenIds.get(tokenId)!.has(stateNum)) {
      throw new Error(`${file} results in a duplicate token/state record.`)
    }

    const imageData = fs.readFileSync(path.join(basePath, file)).toString();
    const imageDataHash = await ipfsHash(imageData);
    const metadata = {
      "name": `Mahin ${tokenId}`,
      "description": "Part of the Mahin project, this is one of 24 NFTs raising breast cancer awareness.",
      "image": `https://cloudflare-ipfs.com/ipfs/${imageDataHash}`,
      "image_data": imageData,
      "attributes": [
        {
          "kind": stateNum
        }
      ]
    }
    const metadataStr = JSON.stringify(metadata, null, 4);
    const data: FileMeta = {
      imageData,
      metadataHash: await ipfsHash(metadataStr),
    }
    tokenIds.get(tokenId)!.set(stateNum, data);

    // Write this file to the target directory
    fs.writeFileSync(path.join(basePath, file) + ".json", metadataStr);
  }

  // Validate all tokens have three states
  for (const values of tokenIds.values()) {
    const keys = new Set(values.keys());
    if (!keys.has(0) || !keys.has(1) || !keys.has(2)) {
      throw new Error(`Token does not have all 3 states.`)
    }
  }

  const MahinNFT = await ethers.getContractFactory("MahinNFT");
  const nft = await MahinNFT.deploy();
  await nft.deployed();

  for (const [tokenId, states] of tokenIds.entries()) {
    await nft.initToken(
        tokenId,
        [states.get(0)!.imageData, states.get(1)!.imageData, states.get(2)!.imageData],
        [states.get(0)!.metadataHash, states.get(1)!.metadataHash, states.get(2)!.metadataHash]
    );
  }

  await nft.mintToken(1, nft.address);
  console.log(await nft.tokenURI(1));

  console.log("NFT deployed to:", nft.address);
}

initTokens()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


async function ipfsHash(content: string): Promise<string> {
  const data = Buffer.from(content)
  return await Hash.of(data) as string;
}