import {useAsyncValue} from "./useAsyncValue";
import {BigNumber, Contract} from "ethers";
import {useCurveContract} from "./useCurveContract";

export function useMintPrice() {
  const contract = useCurveContract();
  const [data] = useAsyncValue(async () => getMintPrice(contract), [contract]);

  if (!data) {
    return [undefined, undefined];
  }
  return data;
}


export async function getMintPrice(contract?: Contract) {
  if (contract) {
    const mintPrice = await contract.getPriceToMint(0);
    const nextPrice = await contract.getPriceToMint(1);
    return [mintPrice, nextPrice];
  } else {
    const {price, nextPrice} = await (await fetch('/api/price')).json();
    return [BigNumber.from(price), BigNumber.from(nextPrice)];
  }
}