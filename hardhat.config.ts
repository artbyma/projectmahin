import {task} from "hardhat/config";
require("@nomiclabs/hardhat-waffle");
import "@nomiclabs/hardhat-ethers";

task("accounts", "Prints the list of accounts", async () => {
  const {ethers} = await import('hardhat');
  const accounts = await ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

task("init-tokens", "Call the contract to init a directory of input tokens", async () => {
  const {initTokens} = await import('./scripts/setup');
  await initTokens();
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
};

