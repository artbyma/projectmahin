pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "./ERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract MahinNFT is ERC721("Mahin", "MAHIN"), Ownable {
  event TokenDataStorage(
    uint256 indexed _tokenId,
    string[] states
);

  struct Piece {
    string[] states;
    string[] ipfsHashes;
    uint8 currentState;
  }

  // TODO: withdraw functions

  uint public constant projectRuntimeSeconds = 365 days * 5;   // Runs for 5 years
  uint public constant targetProbability     = 2000000000000000;  // 0.2% - over the course of the project
  uint public constant denominator           = 10000000000000000; // 100%
  // This has been pre-calculated based on the values above
  uint public constant probabilityPerSecond  = 14151671;        // 0.0000000014151671%

  mapping(uint256 => Piece) pieces;
  uint256 randomSeedBlock = 0;
  int128 public rollProbability = 0;
  uint32 public lastRollTime = 0;

  constructor() public {
    lastRollTime = uint32(block.timestamp);
  }

  // Returns the current SVG of the piece.
  function getSvg(uint256 tokenId) public view returns (string memory) {
    require(_exists(tokenId), "not a valid token");
    return pieces[tokenId].states[0];
  }

  // Will be used by the owner during setup to create all pieces of the work, before renouncing ownership.
  // states - the svg code for each state.
  // ipfsHashes - the ipfs location of each state - needed so provided an off-chain metadata url.
  function initToken(uint256 tokenId, string[] memory states, string[] memory ipfsHashes) public onlyOwner {
    pieces[tokenId].states = states;
    pieces[tokenId].ipfsHashes = ipfsHashes;
    pieces[tokenId].currentState = 0;
    emit TokenDataStorage(tokenId, states);
  }

  // Allow contract owner to set the IPFS host
  function setIPFSHost(string memory baseURI_) public onlyOwner {
    _setBaseURI(baseURI_);
  }

  // Allow contract owner to mint a token and assigned to to anyone they please.
  function mintToken(uint256 tokenId, address firstOwner) public onlyOwner {
    require(pieces[tokenId].states.length > 0, "Invalid token id");
    if (!_exists(tokenId)) {
      _mint(firstOwner, tokenId);
    }
  }

  // Return the current IPFS link based on state
  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "URI query for nonexistent token");

    Piece memory piece = pieces[tokenId];
    string memory tokenPath = piece.ipfsHashes[piece.currentState];
    return string(abi.encodePacked(baseURI(), tokenPath));
  }
}

