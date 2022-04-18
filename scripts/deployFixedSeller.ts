import { getWeeksInMonth } from 'date-fns';
import { parseUnits } from 'ethers/lib/utils';
import {ethers} from 'hardhat';
import { DeployUtil } from './deployHelpers';

async function main() {
  const helper = new DeployUtil();
  await helper.deployContract("FixedPriceSeller", [
    "0xe0ba5a6fc8209e225a9937ce1dfb397f18ad402f",
    "0x56819785480d6da5ebdff288b9b27475fe944bff",
    [3, 6, 8, 10, 12, 24, 25, 26, 31, 33, 34, 40, 46, 48, 50]
  ], {
    //maxFeePerGas: parseUnits("35", "gwei"),
    //maxPriorityFeePerGas: parseUnits("2", "gwei")
  });
  await helper.complete();  
}
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
