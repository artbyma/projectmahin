import { ethers } from "ethers";
import { getProvider } from "../../lib/server/getProvider";
import { doctorAbi } from "../../lib/useDoctorContract";

const provider = getProvider();
const doctor = new ethers.Contract(
  process.env.NEXT_PUBLIC_DOCTOR_ADDRESS,
  doctorAbi,
  provider
);

export default async function handler(req, res) {
  const isRolling = await doctor.isRolling();
  const lastRollTime = await doctor.lastRollRequestedTime();
  const probability = await doctor.getProbability(
    Math.round(Date.now() / 1000)
  );
  const rewardAmount = await doctor.getRewardAmount(
    (
      await provider.getBlock("latest")
    ).timestamp
  );

  res.status(200).json({
    isRolling: isRolling,
    lastRollTime: lastRollTime.toString(),
    probability: probability.toString(),
    rewardAmount: rewardAmount,
  });
}
