import "@nomiclabs/hardhat-ethers";
import {ethers} from 'hardhat';
import * as fs from "fs";
import * as path from "path";
import SVGO from 'svgo';
const Hash = require('ipfs-only-hash');
const svg2img = require('svg2img');
const { deflateSync } = require('zlib');
const pinataSDK = require('@pinata/sdk');
const tmp = require('tmp');
import {chunk} from 'lodash';
const { spawnSync } = require('child_process');


type FileMeta = {
  imageData: Buffer,
  imageDataCompressed: Buffer|undefined,
  type: string,
  metadataStr: string,
  metadataHash: string
}
type TokenMap = Map<number, Map<number, FileMeta>>;

const PREPARED_DATA_DIR = path.join(__dirname, '..', 'svgdata');

/**
 * Takes an input directory of SVGs with this structure:
 *
 *   ./set1-01.0.svg (default)
 *   ./set1-01.1.svg (diagnosed)
 *   ./set1-02.1.svg (default)
 *   ...
 *
 * Will generate an output directory with every SVG compressed, and metadata JSON files generated.
 */
export async function processSVGs(indir: string) {
  const basePath = indir;

  const names = getNames();

  // Assign a token id to each unique NFT
  let nextTokenId = 1;
  let tokenMapping: {[key: string]: number} = {};

  for (const file of fs.readdirSync(basePath)) {
    const [filename, ext] = getSingleExt(file);
    console.log(file, filename, ext)
    if (ext != 'svg' && ext != 'png') {
      continue;
    }

    const {imageId, stateNum, setNum} = parseFilename(filename);

    const key = `${setNum}/${imageId}`;
    let tokenId;
    if (tokenMapping[key]) {
      tokenId = tokenMapping[key];
    } else {
      tokenId = nextTokenId;
      tokenMapping[key] = tokenId;
      nextTokenId++;
    }

    const characterName = names[tokenId-1];
    if (!characterName) {
      throw new Error("Not enough names in names file.")
    }
    const baseName = `${tokenId.toString().padStart(2, "0")}-${stateNum}`;

    // Read the image
    let imageData = fs.readFileSync(path.join(basePath, file));

    let outPath;
    if (ext == 'svg') {
      imageData = await compressSvg(imageData.toString());
      outPath = path.join(PREPARED_DATA_DIR, baseName + '.svg');
      fs.writeFileSync(outPath, imageData);

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
      // TODO: Run it through tinypng
      outPath = path.join(PREPARED_DATA_DIR, baseName + '.png');

      spawnSync(
          'convert',
          [
              path.join(basePath, file),
              '-filter', 'point',
              '-interpolate', 'nearest',
              '-resize', '800%',
              outPath
          ]
      );
    }

    // Also copy it to the next.js public dir
    fs.copyFileSync(outPath, path.join(__dirname, '../site/public/assets', file))

    // Create a metadata .json file
    let newImageData = fs.readFileSync(outPath);
    const imageDataHash = await ipfsHash(newImageData);
    const metadata = {
      "name": `Project Mahin: ${characterName}`,
      "description": "Part of Project Mahin, an experiment with autonomous, dynamic NFTs on the Ethereum blockchain, and raising awareness for Breast Cancer.",
      "image": `https://cloudflare-ipfs.com/ipfs/${imageDataHash}`,
      "image_data": ext == 'svg' ? newImageData.toString() : undefined,
      "attributes": [
        {
          "trait_type": "Diagnosed",
          "value": stateNum == 2 ? "Yes" : "No"
        },
        {
          "trait_type": "Name",
          "value": characterName
        }
      ]
    }

    const metadataStr = JSON.stringify(metadata, null, 4);
    fs.writeFileSync(path.join(PREPARED_DATA_DIR, baseName) + ".json", metadataStr);
  }
}

function parseFilename(filename: string) {
  const [_, setNumStr, imageIdStr, stateNumStr] = filename.match(/set(\d)-(\d\d).(\d)/)!;
  const imageId = parseInt(imageIdStr);
  const stateNum = parseInt(stateNumStr);
  const setNum = parseInt(setNumStr);
  if (Number.isNaN(imageId) || Number.isNaN(stateNum) || Number.isNaN(setNum)) {
    throw new Error(`${filename} has a name not conforming to the expected schema: set-$setid-$token.$state.(svg|png)`)
  }
  return {imageId, stateNum, setNum};
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
        {removeXMLNS: false},  // This makes smart contract storage, but outside of that, we need it.
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
        {convertPathData: {floatPrecision: 2}},
        {convertTransform: true},
        {removeUnknownsAndDefaults: true},
        {removeNonInheritableGroupAttrs: true},
        {removeUselessStrokeAndFill: true},
        {removeUnusedNS: true},
        {cleanupIDs: true},
        {cleanupNumericValues: {floatPrecision: 2}},
        {cleanupListOfValues: {floatPrecision: 2}},
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
  for (const filename of fs.readdirSync(basePath)) {
    const [stemOfFilename, ext] = getExt(filename);

    let type;
    if (ext == 'svg') {
      type = 'svg';
    } else if (ext == 'png') {
      type = 'png';
    }
    else {
      continue;
    }

    // parse the filename
    const [tokenIdStr, stateNumStr] = stemOfFilename.split('-');
    const tokenId = parseInt(tokenIdStr);
    const stateNum = parseInt(stateNumStr);
    if (Number.isNaN(tokenId) || Number.isNaN(stateNum)) {
      throw new Error(`${filename} has a name not conforming to the expected schema: $token-$state.svg`)
    }

    // base name allows us to construct and open related filenames
    const baseName = `${tokenId.toString().padStart(2, "0")}-${stateNum}`;

    // Validate token id and states
    if (!tokenIds.has(tokenId)) {
      tokenIds.set(tokenId, new Map());
    }
    if (tokenIds.get(tokenId)!.has(stateNum)) {
      throw new Error(`${filename} results in a duplicate token/state record.`)
    }

    // Put together a dataset
    const imageData = fs.readFileSync(path.join(basePath, filename));
    const imageDataCompressed = type == 'svg' ? fs.readFileSync(path.join(basePath, baseName) + '.svg.gz') : undefined;
    const metadataStr = fs.readFileSync(path.join(basePath, baseName) + ".json").toString();
    const imageDataHash = await ipfsHash(imageData);

    const data: FileMeta = {
      imageData,
      imageDataCompressed,
      type,
      metadataHash: await ipfsHash(metadataStr),
      metadataStr: metadataStr
    }
    tokenIds.get(tokenId)!.set(stateNum, data);
  }

  // Validate all tokens have three states
  for (const [key, values] of tokenIds.entries()) {
    const keys = new Set(values.keys());
    if (!keys.has(1) || !keys.has(2)) {
      throw new Error(`Token does not have both states: ${key}, ${Array.from(keys)}`)
    }
  }

  return tokenIds;
}

/**
 * Will sync all SVGs to IPFS and Arweave.
 */
export async function syncFiles() {
  const tokenIds = await loadTokens();
  console.log(`${tokenIds.size} tokens found: ${Array.from(tokenIds.keys()).join(', ')}`);

  // Sync both the image and the JSON file to IPFS. NB: The hash of the image file inside the JSON has been pre-calculated.
  for (const [tokenId, states] of tokenIds.entries()) {
    for (const state of states.values()) {
      console.log("Uploading to pinata: " + tokenId)
      await uploadToPinata(Buffer.from(state.metadataStr));
      await uploadToPinata(state.imageData);
    }
  }

  // Sync the image files to Arweave. Store the image.
}


async function uploadToPinata(filedata: Buffer) {
  const pinata = pinataSDK(process.env.PINATA_API_KEY as string, process.env.PINATA_API_SECRET_KEY as string);

  // I was absolutely not able to use this function (or the http request) with anything other than fs.createReadStream().
  // Readable.from() does not seem to work.
  const name = tmp.tmpNameSync();
  fs.writeFileSync(name, filedata);
  const r = await pinata.pinFileToIPFS(fs.createReadStream(name))

  console.log('Hash is: ', r.IpfsHash);
  console.log('Expected hash', await ipfsHash(filedata))
}

/**
 * Will initialize all the tokens - meaning save their IPFS hashes and contents on chain.
 */
export async function initTokens(contractAddress: string) {
  const nft = await getNFTContract(contractAddress);
  const namesList = getNames();

  const tokenIds = await loadTokens();
  console.log(`${tokenIds.size} tokens found: ${Array.from(tokenIds.keys()).join(', ')}`);

  for (const tokenChunk of chunk(Array.from(tokenIds.entries()), 20)) {
    console.log("Initializing tokens: " + tokenChunk.map(x => x[0]).join(", "));

    // Collect args for the initTokens() call
    const args = {
      tokenIds: [] as number[],
      names: [] as string[],
      ipfsHashSets: [] as string[][],
      arweaveHashSets: [] as string[][]
    }

    for (const [tokenId, states] of tokenChunk) {
      //console.log(states.get(1)!.imageData.toString().length)
      args.tokenIds.push(tokenId);
      args.names.push(namesList[tokenId-1]);
      args.ipfsHashSets.push([states.get(1)!.metadataHash, states.get(2)!.metadataHash]);
      args.arweaveHashSets.push(["", ""]);
    }

    const response = await nft.initTokens(
        args.tokenIds,
        args.names,
        args.arweaveHashSets,
        args.ipfsHashSets,
        // {
        //   gasLimit: 2000000
        // }
        );
    await response.wait()
  }
}

// Returns svg.gz for foo.svg.gz
function getExt(s: string) {
  const re = /([^.]+)\.(.+)?$/;
  const result = re.exec(s);
  if (!result) {
    return [s, ""];
  }
  return [result[1], result[2]]
}

// Returns gz for foo.svg.gz
function getSingleExt(s: string) {
  const re = /(?:\.([^.]+))?$/;
  const result = re.exec(s);
  if (!result) {
    return [s, ""];
  }
  return [s.slice(0, s.length-result[1].length-1), result[1]];
}

async function ipfsHash(content: string|Buffer): Promise<string> {
  const data = Buffer.from(content);
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


// Return a list of names
export function getNames(): string[] {
  const data = fs.readFileSync(__dirname + "/../names.txt").toString();
  return data.split("\n").map(s => s.trim());
}