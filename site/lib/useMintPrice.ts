import {useAsyncValue} from "./useAsyncValue";
import {BigNumber, Contract} from "ethers";
import {useSaleContract} from "./useSaleContract";

export function useMintPrice() {
  const contract = useSaleContract();
  const [data] = useAsyncValue(async () => getMintPrice(contract), [contract]);

  if (!data) {
    return [undefined, undefined, undefined];
  }
  return data;
}


export async function getMintPrice(contract?: Contract) {
  if (contract) {
    const mintPrice = await contract.getPriceToMint(0);
    const nextPrice = await contract.getPriceToMint(1);
    const numRemaining = await contract.numRemaining();
    return [mintPrice, nextPrice, numRemaining];
  } else {
    try {
      const {price, nextPrice, numRemaining} = await (await fetch('/api/price')).json();
      return [BigNumber.from(price), BigNumber.from(nextPrice), numRemaining];
    } catch(e) {
      console.log("Failed to fetch price from server, probably misconfigured.")
      return [BigNumber.from("0"), BigNumber.from("0"), 0];
    }
  }
}