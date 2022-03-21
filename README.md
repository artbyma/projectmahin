Deploy:

$ npx hardhat prepare --directory ./nft-assets/
$ npx hardhat upload-assets
$ npx hardhat deploy --network rinkeby
$ npx hardhat init-tokens --network rinkeby --contract ADDRESS

For a local testnet, start `npx hardhat node` and use `--network localhost`.


------

# Oracle services

- http://rinkeby.chain.link/

- http://docs.provable.xyz/#ethereum-quick-start-schedule-a-query-in-the-future
- Chainlink VRF
- BTCRelay as described here: https://blog.positive.com/predicting-random-numbers-in-ethereum-smart-contracts-e5358c6b8620

Should we allow new sources to be added? Ask all sources for randomness?

# Good links

- https://fravoll.github.io/solidity-patterns/randomness.html
- https://blog.positive.com/predicting-random-numbers-in-ethereum-smart-contracts-e5358c6b8620
- https://github.com/rolandkofler/ether-entrophy
- https://github.com/axiomzen/eth-random
- https://ethereum.stackexchange.com/questions/419/when-can-blockhash-be-safely-used-for-a-random-number-when-would-it-be-unsafe
- https://medium.com/dedaub/bad-randomness-is-even-dicier-than-you-think-7fa2c6e0c2cd

# Things I learned

- Anyone knows the past block hashes including up to the current one (by mining in the same block).
  Therefore, solutions such as `blockhash(block.number-1)` are at best acceptable if the bet happened
  before that block; however, miners can still withold the block, thus getting a small advantage.
  
- A better solution is to use a future block number.
  
- To solve the miner problem, you can add a user commit/reveal. Then, the miner can not make any 
  prediction when they are mining their block hash that will become part of the seed. However, we now
  have to penalize the user who may fail to submit their reveal transaction, knowing they have already 
  lost. You could also declare the submitter "trusted". Described here: 
  https://fravoll.github.io/solidity-patterns/randomness.html
  
- Consider that people can run code in smart contracts to get the same "current block" info that you do,
  and even if they don't, will be able to call your smart contract, then abort if they do not get the 
  desired result.
  


roll()
  -> fixes the block number that will decide

apply()
  -> apply tne result of a roll. if you are trying to be clever and not apply it because you did 
     not get the result you wanted, first, we count it as a roll anyway. so worst case scenario,
     it will take *longer* for the 3 nfts to be diagnosed, but we cannot increase the frequency.
 
  -> we combat grieving by letting anyone call apply() and having events. 


  pick two blocks: +2  +500

