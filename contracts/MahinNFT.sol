// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "./ERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "./ABDKMath64x64.sol";
import "./Roles.sol";


contract MahinNFT is ERC721("Mahin", "MAHIN"), Roles {
  event TokenDataStorage(
    uint256 indexed tokenId,
    string[] states
  );

  event RollInProgress(
    int128 probability
  );

  event RollComplete();

  event Diagnosed(
    uint256 indexed tokenId
  );

  struct Piece {
    string[] states;
    string[] ipfsHashes;
    uint8 currentState;
  }

  // TODO: withdraw functions

  uint public constant MAX_TOKENS = 24;

  uint public constant projectRuntimeSeconds = 365 days * 5;   // Runs for 5 years
  uint public constant targetProbability     = 2000000000000000;  // 0.2% - over the course of the project
  uint public constant denominator           = 10000000000000000; // 100%
  // This has been pre-calculated based on the values above
  uint public constant probabilityPerSecond  = 14151671;        // 0.0000000014151671%

  mapping(uint256 => Piece) pieces;
  uint256 randomSeedBlock = 0;
  int128 public rollProbability = 0;
  uint32 public lastRollTime = 0;

  constructor() {
    lastRollTime = uint32(block.timestamp);
  }

  // Returns the current SVG of the piece.
  function getSvg(uint256 tokenId) public view returns (string memory) {
    require(_exists(tokenId), "not a valid token");
    return pieces[tokenId].states[0];
  }

  // Will be used by the owner during setup to create all pieces of the work.
  // states - the svg code for each state.
  // ipfsHashes - the ipfs location of each state - needed so provided an off-chain metadata url.
  function initToken(uint256 tokenId, string[] memory states, string[] memory ipfsHashes) public onlyOwner {
    require(tokenId > 0 && tokenId <= MAX_TOKENS, "invalid id");
    require(pieces[tokenId].states.length > 0, "invalid id");

    pieces[tokenId].states = states;
    pieces[tokenId].ipfsHashes = ipfsHashes;
    pieces[tokenId].currentState = 0;
    emit TokenDataStorage(tokenId, states);
  }

  // Allow contract owner&minter to mint a token and assigned to to anyone they please.
  function mintToken(uint256 tokenId, address firstOwner) public onlyMinterOrOwner {
    require(tokenId > 0 && tokenId <= MAX_TOKENS, "invalid id");
    require(pieces[tokenId].states.length > 0, "invalid id");
    
    if (!_exists(tokenId)) {
      _mint(firstOwner, tokenId);
    }
  }

  // Allow contract owner to set the IPFS host
  function setIPFSHost(string memory baseURI_) public onlyOwner {
    _setBaseURI(baseURI_);
  }

  // Return the current IPFS link based on state
  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "URI query for nonexistent token");

    Piece memory piece = pieces[tokenId];
    string memory tokenPath = piece.ipfsHashes[piece.currentState];
    return string(abi.encodePacked(baseURI(), tokenPath));
  }


  // Will return the probability of a (non-)diagnosis for an individual NFT, assuming the roll will happen at
  // `timestamp`. This will be based on the last time a roll happened, targeting a certain total probability
  // over the period the project is running.
  // Will return 0.80 to indicate that the probability of a diagnosis is 20%.
  function getProbability(uint256 timestamp) public view returns (int128 probability) {
    uint32 secondsSinceLastRoll = uint32(timestamp) - lastRollTime;

    // Say we want totalProbability = 20% over the course of the project's runtime.
    // If we roll 12 times, what should be the probability of each roll so they compound to 20%?
    //    (1 - x) ** 12 = (1 - 20%)
    // Or generalized:
    //    (1 - x) ** numTries = (1 - totalProbability)
    // Solve by x:
    //     x = 1 - (1 - totalProbability) ** (1/numTries)
    //

    // We use the 64.64 fixed point math library here. More info about this kind of math in Solidity:
    // https://medium.com/hackernoon/10x-better-fixed-point-math-in-solidity-32441fd25d43
    // https://ethereum.stackexchange.com/questions/83785/what-fixed-or-float-point-math-libraries-are-available-in-solidity

    // We already pre-calculated the probability for a 1-second interval
    int128 _denominator = ABDKMath64x64.fromUInt(denominator);
    int128 _probabilityPerSecond = ABDKMath64x64.fromUInt(probabilityPerSecond);

    // From the *probability per second* number, calculate the probability for this dice roll based on
    // the number of seconds since the last roll. randomNumber must be larger than this.
    probability = ABDKMath64x64.pow(
    // Convert from our fraction using our denominator, to a 64.64 fixed point number
      ABDKMath64x64.div(
      // reverse-probability of x: (1-x)
        ABDKMath64x64.sub(
          _denominator,
            _probabilityPerSecond
        ),
          _denominator
      ),
      secondsSinceLastRoll
    );

    // `randomNumber / (2**64)` would now give us the random number as a 10-base decimal number.
    // To show it in Solidity, which does not support non-integers, we could multiply to shift the
    // decimal point, for example:
    //    console.log("randomNumber",
    //      uint256(ABDKMath64x64.toUInt(
    //        ABDKMath64x64.mul(randomNumber, ABDKMath64x64.fromUInt(1000000))
    //      ))
    //    );
  }

  // Anyone can roll, but the beneficiary is incentivized to do so.
  // A future block is picked, whose hash will provide the randomness.
  // We accept as low-impact that a miner mining this block could withhold it. A user seed/reveal system
  //   to counteract miner witholding introduces too much complexity (need to penalize users etc).
  function preroll() external {
    // If a roll is already scheduled, do nothing.
    if (randomSeedBlock > 0) {
      return;
    }

    // Two blocks from now, the block hash will provide the randomness to decide the outcome
    randomSeedBlock = block.number + 2;

    // Calculate the probability for this roll, based on the current lastRollTime, before we update the latter.
    rollProbability = getProbability(block.timestamp);

    // Set the last roll time, which "consumes" parts of the total probability for a diagnosis
    lastRollTime = uint32(block.timestamp);

    emit RollInProgress(rollProbability);
  }

  // Apply the results of the roll (run the randomness function, update NFTs).
  // If this is not called within 250 odd blocks, the hash of that block will no longer be accessible to us.
  // The roller thus has a possible reason *not* to call apply(), if the outcome is not as they desire.
  // We counteract this as follows:
  // - We consider an incomplete roll as a completed (which did not cause a state chance) for purposes of the
  //   compound probability. That is, you cannot increase the chance of any of the NFTs being diagnosed, you
  //   can only prevent it from happening. A caller looking to manipulate a roll would presumably desire a
  //   diagnosis, as they otherwise would simply do nothing.
  // - We counteract grieving (the repeated calling of pre-roll without calling apply, thus resetting the
  //   probability of a diagnosis) by letting anyone call `apply`, and emitting an event on `preroll`, to make
  //   it easy to watch for that.
  function applyRoll() external {
    require(randomSeedBlock > 0, "no-preroll");
    require(block.number > randomSeedBlock, "too-early");

    bytes32 baseHash = blockhash(randomSeedBlock);

    // The seed block is no longer available. We act as if the roll led to zero Diagnoses.
    if (baseHash <= 0) {
      console.log("ABORT");
      resetRoll();
      return;
    }

    for (uint i=0; i<totalSupply(); i++) {
      uint256 tokenId = tokenByIndex(i);

      // For each token, mix in the token id to get a new random number
      bytes32 hash = keccak256(abi.encodePacked(baseHash, tokenId));

      // Now we want to convert the token hash to a number between 0 and 1.
      // - 64.64-bit fixed point is a int128  which represents the fraction `{int128}/(64**2)`.
      // - Thus, the lowest 64 bits of the int128 are essentially what is after the decimal point -
      //   the fractional part of the number.
      // - So taking only the lowest 64 bits from a token hash essentially gives us a random number
      //   between 0 and 1.

      // block hash is 256 bits - shift the left-most 64 bits into the right-most position, essentially
      // giving us a 64-bit number. Stored as an int128, this represents a fractional value between 0 and 1
      // in the format used by the 64.64 - fixed point library.
      int128 randomNumber = int128(uint256(hash) >> 192);
      console.log("RANDOMNUMBER", uint256(randomNumber));

      if (randomNumber > rollProbability) {
        pieces[tokenId].currentState = 2;
        emit Diagnosed(tokenId);
      }
    }

    resetRoll();
  }

  function resetRoll() internal {
    randomSeedBlock = 0;
    rollProbability = 0;
    emit RollComplete();
  }
}

