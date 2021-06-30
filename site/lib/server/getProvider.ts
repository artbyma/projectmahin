import {ethers} from "ethers";

export function getProvider() {
  return new ethers.providers.InfuraProvider(
      'mainnet', process.env.INFURA_KEY);
}