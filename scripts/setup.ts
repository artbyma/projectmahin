import "@nomiclabs/hardhat-ethers";
import {ethers} from 'hardhat';
import * as fs from "fs";
import * as path from "path";

export async function initTokens() {
  // find all svgs within "svg-in".
  // structure is:
  // ./01-0.svg (default)
  // ./01-1.svg (diagnosed)
  // ./01-2.svg (post-op)
  // ./02-1.svg (default)


  const tokenIds: Map<number, Map<number, string>> = new Map();

  const basePath = "./svg-in";
  fs.readdirSync(basePath).forEach(file => {
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
    tokenIds.get(tokenId)!.set(stateNum, fs.readFileSync(path.join(basePath, file)).toString());
  });

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
        [states.get(0), states.get(1), states.get(2)],
        []
    );
  }

  console.log("NFT deployed to:", nft.address);
}

initTokens()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
