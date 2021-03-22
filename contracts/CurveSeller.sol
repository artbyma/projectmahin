// SPDX-License-Identifier: MIT


pragma solidity ^0.7.0;

import "./MahinNFT.sol";
import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


// Sell NFTs using a step function.
contract CurveSeller {
    using SafeMath for uint256;

    // Sells these token ids in ascending order
    uint[] public idsToSell;

    uint[2][6] public steps = [
        [5, 0.15 ether],
        [10, 0.3 ether],
        [15, 0.5 ether],
        [10, 0.65 ether],
        [7, 0.75 ether],
        [3, 1 ether]
    ];

    uint256 numSold = 0;

    MahinNFT public nftContract;

    constructor (address mahinAddress, uint[] memory _idsToSell) {
        nftContract = MahinNFT(mahinAddress);
        idsToSell = _idsToSell;
    }

    function purchase() public virtual payable returns (uint256 _tokenId) {
        require(idsToSell.length > 0, "sold out");

        uint256 mintPrice = getPriceToMint(0);
        require(msg.value >= mintPrice, "not enough eth");

        uint256 tokenId = idsToSell[block.timestamp % idsToSell.length];
        numSold = numSold+1;

        // Send the token to the buyer
        nftContract.mintToken(tokenId, msg.sender);

        // Send back remainder if overpaid
        if (msg.value - mintPrice > 0) {
            msg.sender.transfer(msg.value - mintPrice);
        }

        return tokenId;
    }

    function getPriceToMint(uint256 idx) public virtual view returns (uint256) {
        uint256 target = numSold + idx;
        uint256 count = 0;
        for (uint s=0; s<steps.length-1; s++) {
            count = count + steps[s][0];
            if (count > target) {
                return steps[s][1];
            }
        }
        revert("failed-pr");
    }
}
