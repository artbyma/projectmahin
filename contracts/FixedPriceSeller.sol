// SPDX-License-Identifier: MIT


pragma solidity ^0.7.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./MahinNFT.sol";
//import "hardhat/console.sol";


contract FixedPriceSeller is Ownable {
    using SafeMath for uint256;

    // Sells these token ids in ascending order
    uint[] public idsToSell;
    uint256 public beneficiarySplit = 75;
    uint256 public mintPrice = 0.4 ether;
    bool public enabled = false;
    uint256 public numSold = 0;
    MahinNFT public nftContract;

    constructor (address mahinAddress, uint[] memory _idsToSell) {
        nftContract = MahinNFT(mahinAddress);
        idsToSell = _idsToSell;
    }

    function setIdsToSell(uint[] memory _idsToSell) public onlyOwner {
        idsToSell = _idsToSell;
    }

    function enable(bool _enable) public onlyOwner {
        enabled = _enable;
    }

    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }

    function numRemaining() public view returns (uint256) {
        return idsToSell.length;
    }

    function purchase() public virtual payable returns (uint256 _tokenId) {
        require(idsToSell.length > 0, "sold out");
        require(enabled, "disabled");

        require(msg.value >= mintPrice, "not enough eth");

        // Cut for the beneficiary
        address beneficiary = nftContract.beneficiary();
        uint256 toCharity = 0;
        if (beneficiary != address(0)) {
            toCharity = mintPrice.mul(beneficiarySplit).div(100);
            payable(beneficiary).transfer(toCharity);
        }

        // remainder to treasury
        uint256 remainder = msg.value.sub(toCharity);
        if (remainder > 0) {
            payable(owner()).transfer(remainder);
        }

        uint idx = block.timestamp % idsToSell.length;
        uint256 tokenId = idsToSell[idx];

        // Delete the element - move the last element to the deleted slot
        idsToSell[idx] = idsToSell[idsToSell.length-1];
        idsToSell.pop();

        numSold = numSold+1;

        // Send the token to the buyer
        nftContract.mintToken(tokenId, msg.sender);

        return tokenId;
    }
}
