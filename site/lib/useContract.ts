import {ethers} from "ethers";
import {useMemo} from "react";


export function useContract(address: string, abi: any, provider: any) {
  return useMemo(() =>
      provider ? new ethers.Contract(address, abi, provider) : undefined, [provider, abi, address]);
}
