import "@nomiclabs/hardhat-ethers";
import {ethers} from 'hardhat';
import * as fs from "fs";
import * as path from "path";
import {adjustStackTrace} from "hardhat/internal/hardhat-network/stack-traces/mapped-inlined-internal-functions-heuristics";
const Hash = require('ipfs-only-hash');

type FileMeta = {
  imageData: string,
  metadataHash: string
}
type TokenMap = Map<number, Map<number, FileMeta>>;

const PREPARED_DATA_DIR = path.join(__dirname, 'svgdata');

/**
 * Takes an input directory of SVGs with this structure:
 *
 *   ./01-0.svg (default)
 *   ./01-1.svg (diagnosed)
 *   ./01-2.svg (post-op)
 *   ./02-1.svg (default)
 *   ...
 *
 * Will generate an output directory with every SVG compressed, and metadata
 * JSON files generated.
 */
export async function processSVGs(indir: string) {
  const basePath = indir;
  for (const file of fs.readdirSync(basePath)) {
    const [filename, ext] = getExt(file);
    if (ext != 'svg') {
      continue;
    }
    const [tokenIdStr, stateNumStr] = filename.split('-');
    const tokenId = parseInt(tokenIdStr);
    const stateNum = parseInt(stateNumStr);
    if (Number.isNaN(tokenId) || Number.isNaN(stateNum)) {
      throw new Error(`${file} has a name not confirming to the expected schema: $token-$state.svg`)
    }

    // Read the SVG
    const imageData = fs.readFileSync(path.join(basePath, file)).toString();

    // Create a metadata .json file
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
    fs.writeFileSync(path.join(PREPARED_DATA_DIR, file) + ".json", metadataStr);
  }
}

async function loadTokens() {
  const tokenIds: TokenMap = new Map();

  const basePath = PREPARED_DATA_DIR;
  for (const file of fs.readdirSync(basePath)) {
    const [filename, ext] = getExt(file);
    if (ext != 'svg') {
      continue;
    }
    const [tokenIdStr, stateNumStr] = filename.split('-');
    const tokenId = parseInt(tokenIdStr);
    const stateNum = parseInt(stateNumStr);
    if (Number.isNaN(tokenId) || Number.isNaN(stateNum)) {
      throw new Error(`${file} has a name not confirming to the expected schema: $token-$state.svg`)
    }

    if (!tokenIds.has(tokenId)) {
      tokenIds.set(tokenId, new Map());
    }
    if (tokenIds.get(tokenId)!.has(stateNum)) {
      throw new Error(`${file} results in a duplicate token/state record.`)
    }

    // Read the SVG
    const imageData = fs.readFileSync(path.join(basePath, file)).toString();
    const metadataStr = fs.readFileSync(path.join(basePath, file) + ".json").toString();
    const imageDataHash = await ipfsHash(imageData);

    const data: FileMeta = {
      imageData,
      metadataHash: await ipfsHash(metadataStr),
    }
    tokenIds.get(tokenId)!.set(stateNum, data);
  }

  // Validate all tokens have three states
  for (const values of tokenIds.values()) {
    const keys = new Set(values.keys());
    if (!keys.has(0) || !keys.has(1) || !keys.has(2)) {
      throw new Error(`Token does not have all 3 states.`)
    }
  }

  return tokenIds;
}

/**
 * Will sync all SVGs to IPFS and Arweave.
 */
export async function syncSVGs() {
  // TODO
}

/**
 * Will initialize all the tokens - meaning save their IPFS hashes and contents on chain.
 */
export async function initTokens(contractAddress: string) {
  const nft = await getContract(contractAddress);

  const tokenIds = await loadTokens();

  for (const [tokenId, states] of tokenIds.entries()) {
    await nft.initToken(
        tokenId,
        [states.get(0)!.imageData, states.get(1)!.imageData, states.get(2)!.imageData],
        [states.get(0)!.metadataHash, states.get(1)!.metadataHash, states.get(2)!.metadataHash],
        {
          gasLimit: 9500000
        }
    );
  }
}

function getExt(s: string) {
  const re = /(?:\.([^.]+))?$/;
  const result = re.exec(s);
  if (!result) {
    return [s, ""];
  }
  return [s.slice(1, s.length-result[1].length), result[1]];
}


async function ipfsHash(content: string): Promise<string> {
  const data = Buffer.from(content)
  return await Hash.of(data) as string;
}

export async function getContract(address: string) {
  const {ethers} = await import('hardhat');
  const Abi = (await import("../artifacts/contracts/MahinNFT.sol/MahinNFT.json")).abi;
  const [signer] = await ethers.getSigners();

  return new ethers.Contract(address, Abi, signer);
}