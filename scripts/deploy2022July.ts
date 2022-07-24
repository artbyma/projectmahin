import {ethers} from 'hardhat';
import { DeployUtil } from './deployHelpers';

export const Configs = {
  rinkeby: {
    chainlink: {
      'coordinator': '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B',
      'token': '0x01be23585060835e02b77ef475b0cc51aa1e0709',
      'keyHash': '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311',
      'price': '100000000000000000',
    },
  },
  mainnet: {
    chainlink: {
      'coordinator': '0xf0d54349aDdcf704F77AE15b96510dEA15cb7952',
      'token': '0x514910771af9ca656af840dff83e8264ecf986ca',
      'keyHash': '0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445',
      'price': '2000000000000000000',
    }
  }
}

/**
 * July 2022 Upgrades.
 */
async function main() {
  // On a local forked hardhat node, this allows the impersonate the actual deployer address.
  //const deployer = await ethers.getImpersonatedSigner("0x4bacb7664404f1a6157d37EA2dCD1669A556d562");
  const deployer = ethers.getSigners()[0];

  const helper = new DeployUtil(deployer);

  // Manually deployed previously already:
  //
  // // Deploy new MintDateRegistry
  // const mintDateRegistry = await helper.deployContract("MintDateRegistry", [], {});
  // // XXX setup some initial token dates
  //
  // // FixedPriceSeller will replace CurveSeller.
  // const fixedPriceSeller = await helper.deployContract("FixedPriceSeller", [
  //   "0xe0ba5a6fc8209e225a9937ce1dfb397f18ad402f",  // nftContract
  //   "0x56819785480d6da5ebdff288b9b27475fe944bff",  // fixedpriceseller
  //   [3, 6, 8, 10, 12, 24, 25, 26, 31, 33, 34, 40, 46, 48, 50]
  // ], {
  //   //maxFeePerGas: parseUnits("35", "gwei"),
  //   //maxPriorityFeePerGas: parseUnits("2", "gwei")
  // });
  //
  // // Allow fixedPriceSeller to write minting dates
  // await mintDateRegistry.addWriter(fixedPriceSeller.address);


  const fixedPriceSeller = await ethers.getContractAt("FixedPriceSeller", "0x62cab40ecc2afed09182c76a5b05d43d86f0a697", deployer);
  const mintDateRegistry = await ethers.getContractAt("MintDateRegistry", "0x56819785480d6da5ebdff288b9b27475fe944bff", deployer);

  // Treasury wallet has not set been set up.
  await fixedPriceSeller.setTreasury("0x336d967ffd8984fb1b00a9e4d17823ae4e068f8a");

  // Shutdown old CurveSeller
  const curveSeller = await ethers.getContractAt("CurveSeller", "0x47746e3563dc8c3ec09878907f8ce3a3f20082f0", deployer);
  await curveSeller.enable(false);

  // Install fixed price minter
  const nftContract = await ethers.getContractAt("MahinNFT", "0xe0ba5a6fc8209e225a9937ce1dfb397f18ad402f", deployer)
  await nftContract.setMinter(fixedPriceSeller.address);

  // Enable the new seller
  await fixedPriceSeller.enable(true);

  // Deploy doctorV3
  const doctorV3 = await helper.deployContract("DoctorV3", [
    Configs.mainnet.chainlink, nftContract.address
  ], {});

  // Make the doctor use the registry
  await doctorV3.setMintDateRegistry(mintDateRegistry.address);

  // Allow the new doctor to diagnose
  await nftContract.setDoctor(doctorV3.address);

  // Fund the doctor with some reward money
  // const [funder,] = await ethers.getSigners();
  // await funder.sendTransaction({to: doctorV3.address,  value: parseEther("1.0")});

  await helper.complete();

  // During testing, this was useful to see how often we got a diagnosis:
  // console.log('[requestRoll]')
  // await doctorV3.requestRoll(true);
  //
  // // Mine at least two blocks
  // await doctorV3.requestRoll(true);
  // await doctorV3.requestRoll(true);
  // // await ethers.provider.send('evm_increaseBlocks', [
  // //   ethers.utils.hexValue(10) // hex encoded number of blocks to increase
  // // ]);
  // //
  // // await ethers.provider.send('evm_increaseTime', [
  // //   ethers.utils.hexValue(24 * 3600 * 360) // hex encoded number of seconds
  // // ])
  //
  // console.log('[applyRoll]')
  // const tx = await doctorV3.applyRoll();
  // const response = await tx.wait();
  // console.log(response.logs.map(l => doctorV3.interface.parseLog(l)));
}
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });



