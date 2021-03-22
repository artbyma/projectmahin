// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./ERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "./Roles.sol";
import "./Randomness.sol";
import "./Fees.sol";


contract MahinNFT is ERC721("Mahin", "MAHIN"), Randomness, Roles, HasFees  {
  event TokenDataStorage(
    uint256 indexed tokenId,
    bytes[] states
  );

  event Diagnosed(
    uint256 indexed tokenId
  );

  struct Piece {
    string name;
    bytes[] states;
    string[] ipfsHashes;
    uint8 currentState;
  }

  // The beneficiary (the charity or someone acting in their name) - receives royalties.
  address public beneficiary;

  mapping(uint256 => Piece) public pieces;

  constructor(VRFConfig memory vrfConfig) Randomness(vrfConfig) {
  }

  function withdraw() public onlyOwner {
    address payable owner = payable(owner());
    owner.transfer(address(this).balance);
  }

  function withdrawToken(address tokenAddress) public onlyOwner {
    IERC20 token = IERC20(tokenAddress);
    token.transfer(owner(), token.balanceOf(address(this)));
  }

  // Returns the current SVG of the piece.
//  function getImageData(uint256 tokenId) public view returns (bytes memory) {
//    require(_exists(tokenId), "not a valid token");
//    return pieces[tokenId].states[0];
//  }

  // Will be used by the owner during setup to create all pieces of the work.
  // states - the svg code for each state.
  // ipfsHashes - the ipfs location of each state - needed so provided an off-chain metadata url.
  function initToken(uint256 tokenId, string memory name, bytes[] memory states, string[] memory ipfsHashes) public onlyOwner {
//    require(pieces[tokenId].ipfsHashes.length == 0, "invalid id");
//
//    pieces[tokenId].name = name;
      pieces[tokenId].states = states;
      pieces[tokenId].ipfsHashes = ipfsHashes;
//    pieces[tokenId].currentState = 0;
    //emit TokenDataStorage(tokenId, states);
  }

  // Allow contract owner&minter to mint a token and assigned to to anyone they please.
  function mintToken(uint256 tokenId, address firstOwner) public onlyMinterOrOwner {
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
    require(pieces[tokenId].states.length > 0, "invalid id");

    Piece memory piece = pieces[tokenId];
    string memory tokenPath = piece.ipfsHashes[piece.currentState];
    return string(abi.encodePacked(baseURI(), tokenPath));
  }

  function onDiagnosed(uint256 tokenId) internal override {
    pieces[tokenId].currentState = 1;
    emit Diagnosed(tokenId);
  }

  function getBeneficiary() internal override view returns (address) {
    return beneficiary;
  }

  function getFee(uint256 tokenId) override internal view returns (uint256) {
    if (pieces[tokenId].currentState >= 1) {
      return 15;
    } else {
      return 5;
    }
  }
}

