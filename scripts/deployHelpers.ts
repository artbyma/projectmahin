export class DeployUtil {
  sourceCodeSubmitters: any[] = [];

  async deployContract(name, args: any[] = [], opts?: any) {
    const {ethers, run, network} = await import('hardhat');

    console.log(`Deploying ${name}...`);
    const Class = await ethers.getContractFactory(name);
    const contract = await Class.deploy(...args, opts);
    console.log(`  address: ${contract.address}`)
    console.log(`  hash: ${contract.deployTransaction.hash}`)
    console.log(`  [waiting to mine...]`)
    await contract.deployed();
    console.log('  [complete]')
  
    this.sourceCodeSubmitters.push(async () => {
      console.log(`  ...[${name}]`)
      await run("verify:verify", {
        address: contract.address,
        constructorArguments: args
      });
    })
    return contract;
  }

  async complete() {
    const {ethers, run, network} = await import('hardhat');

    if (network.name == "mainnet" || network.name == "rinkeby") {
      console.log("Waiting 5 confirmations for Etherscan before we submit the source code");
      await new Promise(resolve => {
        setTimeout(resolve, 60 * 1000);
      });
      for (const submitter of this.sourceCodeSubmitters) {
        try {
          await submitter();
        } catch (e) {
          console.log("Error submitting validation", e)
        }
      }
    }
  }
}