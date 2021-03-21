import "@nomiclabs/hardhat-ethers";
import {ethers} from 'hardhat';
import * as fs from "fs";
import * as path from "path";
import SVGO from 'svgo';
const Hash = require('ipfs-only-hash');
const svg2img = require('svg2img');
const { deflateSync } = require('zlib');


type FileMeta = {
  imageData: Buffer,
  type: string,
  metadataHash: string
}
type TokenMap = Map<number, Map<number, FileMeta>>;

const PREPARED_DATA_DIR = path.join(__dirname, '..', 'svgdata');

/**
 * Takes an input directory of SVGs with this structure:
 *
 *   ./01-0.svg (default)
 *   ./01-1.svg (diagnosed)
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
    if (ext != 'svg' && ext != 'png') {
      continue;
    }
    const [tokenIdStr, stateNumStr] = filename.split('-');
    const tokenId = parseInt(tokenIdStr);
    const stateNum = parseInt(stateNumStr);
    if (Number.isNaN(tokenId) || Number.isNaN(stateNum)) {
      throw new Error(`${file} has a name not confirming to the expected schema: $token-$state.(svg|png)`)
    }

    const baseName = `${tokenId.toString().padStart(2, "0")}-${stateNum}`;

    // Read the image
    let imageData = fs.readFileSync(path.join(basePath, file));

    if (ext == 'svg') {
      imageData = await compressSvg(imageData.toString());
      fs.writeFileSync(path.join(PREPARED_DATA_DIR, file), imageData);

      // Generate a png
      const buffer: any = await new Promise((resolve) => {
        svg2img(imageData, {'width': 1200, 'height': 1200}, function(error, buffer) {
          resolve(buffer);
        });
      })
      // Not used for now, and .png ext alone makes trouble since we'd consider it pixelart
      fs.writeFileSync(path.join(PREPARED_DATA_DIR, baseName) + '.thumb.png', buffer);

      // Compress it with gzip. I've tried lzma, doesn't make a difference
      const gzipped = deflateSync(imageData, {level: 9, memLevel: 9})
      fs.writeFileSync(path.join(PREPARED_DATA_DIR, baseName) + '.svg.gz', gzipped);
    }

    else {
      // Run it through tinypng
      fs.writeFileSync(path.join(PREPARED_DATA_DIR, baseName) + '.png', imageData);
    }

    // Create a metadata .json file
    const imageDataHash = await ipfsHash(imageData);
    const metadata = {
      "name": `Mahin ${tokenId}`,
      "description": "Part of the Mahin project, this is one of 24 NFTs raising breast cancer awareness.",
      "image": `https://cloudflare-ipfs.com/ipfs/${imageDataHash}`,
      "image_data": ext == 'svg' ? imageData : undefined,
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

    let type;
    if (ext == 'svg.gz') {
      type = 'svg';
    } else if (ext == 'png') {
      type = 'png';
    }
    else {
      continue;
    }

    const [tokenIdStr, stateNumStr] = filename.split('-');
    const tokenId = parseInt(tokenIdStr);
    const stateNum = parseInt(stateNumStr);
    if (Number.isNaN(tokenId) || Number.isNaN(stateNum)) {
      throw new Error(`${file} has a name not conforning to the expected schema: $token-$state.svg`)
    }

    const baseName = `${tokenId.toString().padStart(2, "0")}-${stateNum}`;

    if (!tokenIds.has(tokenId)) {
      tokenIds.set(tokenId, new Map());
    }
    if (tokenIds.get(tokenId)!.has(stateNum)) {
      throw new Error(`${file} results in a duplicate token/state record.`)
    }

    // Read the SVG
    const imageData = fs.readFileSync(path.join(basePath, file));
    const metadataStr = fs.readFileSync(path.join(basePath, baseName) + ".json").toString();
    const imageDataHash = await ipfsHash(imageData);

    const data: FileMeta = {
      imageData,
      type,
      metadataHash: await ipfsHash(metadataStr),
    }
    tokenIds.get(tokenId)!.set(stateNum, data);
  }

  // Validate all tokens have three states
  for (const values of tokenIds.values()) {
    const keys = new Set(values.keys());
    if (!keys.has(0) || !keys.has(1)) {
      throw new Error(`Token does not have both states.`)
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
  const names = getNames();

  const tokenIds = await loadTokens();
  console.log(`${tokenIds.size} tokens found: ${Array.from(tokenIds.keys()).join(', ')}`);

  const startingId = 1;


  for (const [tokenId, states] of tokenIds.entries()) {
    console.log(states.get(0)!.imageData.toString().length)
    const response = await nft.initToken(
        startingId + tokenId,
        names[startingId],
        [states.get(0)!.imageData, states.get(1)!.imageData],
        [states.get(0)!.metadataHash, states.get(1)!.metadataHash],
        {
          gasLimit: 9500000
        }
    );
    await response.wait()
  }
}

function getExt(s: string) {
  const re = /([^.]+)\.(.+)?$/;
  const result = re.exec(s);
  if (!result) {
    return [s, ""];
  }
  return [result[1], result[2]]
}


async function ipfsHash(content: string|Buffer): Promise<string> {
  const data = Buffer.from(content)
  return await Hash.of(data) as string;
}

export async function getNFTContract(address: string) {
  const {ethers} = await import('hardhat');
  const Abi = JSON.parse((fs.readFileSync(__dirname + "/../artifacts/contracts/MahinNFT.sol/MahinNFT.json")).toString()).abi;
  const [signer] = await ethers.getSigners();

  return new ethers.Contract(address, Abi, signer);
}

export async function getCurveContract(address: string) {
  const {ethers} = await import('hardhat');
  const Abi = JSON.parse((fs.readFileSync(__dirname + "/../artifacts/contracts/CurveSeller.sol/CurveSeller.json")).toString()).abi;
  const [signer] = await ethers.getSigners();

  return new ethers.Contract(address, Abi, signer);
}

export function getNames() {
  const data = fs.readFileSync(__dirname + "/../names.txt").toString();
  return data.split("\n").map(s => s.trim());
}