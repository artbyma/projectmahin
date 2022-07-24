import {useAsyncValue} from "./useAsyncValue";
import {Contract} from "ethers";
import {useDoctorContract} from "./useDoctorContract";
import { BigNumber } from "bignumber.js";


// XXX ability to auto-refresh this...
export function useRandomState() {
  const contract = useDoctorContract();
  const [data] = useAsyncValue(async () => getRandomState(contract), [contract]);

  if (!data) {
    return [undefined, undefined, undefined, undefined];
  }
  return data;
}


export async function getRandomState(contract?: Contract) {
  // We could use `contract` here to get it locally, but in fact we always use the server for now.
  try {
    // 18083835725893044429 - 56.59% - 1.97% is the old style!
    // 18264389612779672094 - 34.11% - 0.99% is the new style
    const {isRolling, lastRollTime, probability, rewardAmount} = await (await fetch('/api/randomstate')).json();
    const p = parseProbability(probability);
    //console.log(p, probability)
    return [isRolling, lastRollTime, p, rewardAmount];
  } catch(e) {
    console.error("Failed to fetch random state from server, probably misconfigured.")
    return [0, 0, new BigNumber("0")];
  }
}

// Parse a 64.64 fixed point number from the smart contract.
export function parseProbability(probability: string): BigNumber {
  return new BigNumber(1).minus(new BigNumber(probability).div(new BigNumber(2).pow(64)));
}

export function useProbabilities() {
  const [isRolling, lastRollTime, probability] = useRandomState();
  const numberOfTokens = 42;
  const collectiveProbability = new BigNumber(1).minus((new BigNumber(1).minus(probability)).pow(numberOfTokens));
  return {probability, collectiveProbability};
}