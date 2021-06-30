import {ethers} from "ethers";
import { getProvider } from "../../lib/server/getProvider";
import {doctorAbi} from "../../lib/useDoctorContract";

const infuraProvider = getProvider();
const doctor = new ethers.Contract(process.env.NEXT_PUBLIC_DOCTOR_ADDRESS, doctorAbi, infuraProvider);

export default async function handler(req, res) {
  const isRolling = await doctor.isRolling();
  const lastRollTime = await doctor.lastRollTime();
  const probability = await doctor.getProbability(Math.round(Date.now() / 1000));

  res.status(200).json({
    isRolling: isRolling.toString(),
    lastRollTime: lastRollTime.toString(),
    probability: probability.toString()
  });
}
