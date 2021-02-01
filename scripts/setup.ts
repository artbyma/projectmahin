import "@nomiclabs/hardhat-ethers";
import {ethers} from 'hardhat';
import * as fs from "fs";
import * as path from "path";
import SVGO from 'svgo';
const Hash = require('ipfs-only-hash');
const svg2img = require('svg2img');

type FileMeta = {
  svgData: string,
  metadataHash: string
}
type TokenMap = Map<number, Map<number, FileMeta>>;

const PREPARED_DATA_DIR = path.join(__dirname, '..', 'svgdata');

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

    const baseName = `${tokenId.toString().padStart(2, "0")}-${stateNum}`;

    // Read the SVG
    const imageData = fs.readFileSync(path.join(basePath, file)).toString();
    const compressedImage = await compressSvg(imageData);
    fs.writeFileSync(path.join(PREPARED_DATA_DIR, file), compressedImage);

    // Generate a png
    const buffer: any = await new Promise((resolve) => {
      svg2img(compressedImage, {'width': 1200, 'height': 1200}, function(error, buffer) {
        resolve(buffer);
      });
    })
    fs.writeFileSync(path.join(PREPARED_DATA_DIR, baseName) + '.png', buffer);

    // Create a metadata .json file
    const imageDataHash = await ipfsHash(compressedImage);
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
    fs.writeFileSync(path.join(PREPARED_DATA_DIR, baseName) + ".json", metadataStr);
  }
}

async function compressSvg(data: string) {
  const svgo = new SVGO({
    plugins: [
        {cleanupAttrs: true},
        {inlineStyles: true},
        {removeDoctype: true},
        {removeXMLProcInst: true},
        {removeComments: true},
        {removeMetadata: true},
        {removeTitle: true},
        {removeDesc: true},
        {removeUselessDefs: true},
        {removeXMLNS: true},
        {removeEditorsNSData: true},
        {removeEmptyAttrs: true},
        {removeHiddenElems: true},
        {removeEmptyText: true},
        {removeEmptyContainers: true},
        {removeViewBox: true},
        {cleanupEnableBackground: true},
        {minifyStyles: true},
        {convertStyleToAttrs: true},
        {convertColors: true},
        {convertPathData: {floatPrecision: 0}},
        {convertTransform: true},
        {removeUnknownsAndDefaults: true},
        {removeNonInheritableGroupAttrs: true},
        {removeUselessStrokeAndFill: true},
        {removeUnusedNS: true},
        {cleanupIDs: true},
        {cleanupNumericValues: {floatPrecision: 0}},
        {cleanupListOfValues: {floatPrecision: 0}},
        {moveElemsAttrsToGroup: true},
        {moveGroupAttrsToElems: true},
        {collapseGroups: true},
        {removeRasterImages: false},
        {mergePaths: true},
        {convertShapeToPath: true},
        {sortAttrs: true},
        {sortDefsChildren: true},
        {removeDimensions: true},
        {reusePaths: true},
        {
          removeAttrs: {attrs: '(data-name)'},
        }
    ]
  });
  const result = await svgo.optimize(data);
  return result.data;
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

    const baseName = `${tokenId.toString().padStart(2, "0")}-${stateNum}`;

    if (!tokenIds.has(tokenId)) {
      tokenIds.set(tokenId, new Map());
    }
    if (tokenIds.get(tokenId)!.has(stateNum)) {
      throw new Error(`${file} results in a duplicate token/state record.`)
    }

    // Read the SVG
    const imageData = fs.readFileSync(path.join(basePath, file)).toString();
    const metadataStr = fs.readFileSync(path.join(basePath, baseName) + ".json").toString();
    const imageDataHash = await ipfsHash(imageData);

    const data: FileMeta = {
      svgData: imageData,
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
  const nft = await getNFTContract(contractAddress);

  const tokenIds = await loadTokens();
  console.log(`${tokenIds.size} tokens found.`);

  for (const [tokenId, states] of tokenIds.entries()) {
    await nft.initToken(
        tokenId,
        [states.get(0)!.svgData, states.get(2)!.svgData],
        [states.get(0)!.metadataHash, states.get(2)!.metadataHash],
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

export async function getNFTContract(address: string) {
  const {ethers} = await import('hardhat');
  const Abi = JSON.parse((fs.readFileSync(__dirname + "/../artifacts/contracts/MahinNFT.sol/MahinNFT.json")).toString()).abi;
  const [signer] = await ethers.getSigners();

  return new ethers.Contract(address, Abi, signer);
}