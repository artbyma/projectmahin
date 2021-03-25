import {ethers} from "ethers";
import { curveAbi } from "../../lib/useCurveContract";

const infuraProvider = new ethers.providers.InfuraProvider('mainnet', '134faaf6c8b64741b67fce6ae1683183'); // TODO
const curve = new ethers.Contract(process.env.NEXT_PUBLIC_CURVE_ADDRESS, curveAbi, infuraProvider);

export default async function handler(req, res) {
  const mintPrice = await curve.getPriceToMint(0);
  const nextPrice = await curve.getPriceToMint(1);
  const numRemaining = await curve.numRemaining();

  res.status(200).json({ price: mintPrice.toString(), nextPrice: nextPrice.toString(), numRemaining });
}
