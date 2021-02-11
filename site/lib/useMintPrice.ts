import {useContract} from "./useContract";
import {useWeb3React} from "./web3wallet/core";
import {useAsyncValue} from "./useAsyncValue";
import { BigNumber } from "ethers";

export function useMintPrice() {
  const { library, active } = useWeb3React();
  const contract = useContract(process.env.NEXT_PUBLIC_CURVE_ADDRESS, curveAbi, library);

  const [data] = useAsyncValue(async () => {
    if (library) {
      const mintPrice = await contract.getPriceToMint(0);
      const nextPrice = await contract.getPriceToMint(1);
      return [mintPrice, nextPrice];
    } else {
      const {price, nextPrice} = await (await fetch('/api/price')).json();
      return [BigNumber.from(price), BigNumber.from(nextPrice)];
    }
  }, [library, active]);

  if (!data) {
    return [undefined, undefined];
  }
  return data;
}


export const curveAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "mahinAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "FIRST_ID",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "LAST_ID",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_PRICE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_PRICE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "idx",
        "type": "uint256"
      }
    ],
    "name": "getPriceToMint",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nftContract",
    "outputs": [
      {
        "internalType": "contract MahinNFT",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "purchase",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
]