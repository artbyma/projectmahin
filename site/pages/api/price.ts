import {ethers} from "ethers";
import { sellerAbi } from "../../lib/useSaleContract";
import {getProvider} from "../../lib/server/getProvider";

const infuraProvider = getProvider();
const seller = new ethers.Contract(process.env.NEXT_PUBLIC_SELLER_ADDRESS, sellerAbi, infuraProvider);

export default async function handler(req, res) {
  const mintPrice = await seller.mintPrice();
  const numRemaining = await seller.numRemaining();

  res.status(200).json({
    price: mintPrice.toString(),
    nextPrice: mintPrice.toString(),
    numRemaining: numRemaining.toString()
  });
}
