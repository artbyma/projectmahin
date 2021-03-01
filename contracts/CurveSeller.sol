// SPDX-License-Identifier: MIT


pragma solidity ^0.7.0;

import "./MahinNFT.sol";
import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


// Sell NFTs on a decaying curve.
contract CurveSeller {
    using SafeMath for uint256;

    // Sells these token ids in ascending order
    uint public constant FIRST_ID = 1;
    uint public constant LAST_ID = 8;

    uint public constant MIN_PRICE = 0.2 ether;
    uint public constant MAX_PRICE = 1 ether;

    uint256 currentId = FIRST_ID;
    uint256 lastMintPrice = 0;
    uint256 lastSoldAt = 0;

    MahinNFT public nftContract;

    constructor (address mahinAddress) {
        nftContract = MahinNFT(mahinAddress);
    }

    function purchase() public virtual payable returns (uint256 _tokenId) {
        require(currentId <= LAST_ID, "sold out");

        uint256 mintPrice = getPriceToMint(0);
        require(msg.value >= mintPrice, "not enough eth");
        lastMintPrice = mintPrice;

        uint256 tokenId = currentId;
        currentId = currentId+1;

        lastSoldAt = block.timestamp;

        // Send the token to the buyer
        nftContract.mintToken(tokenId, msg.sender);

        // Send back remainder if overpaid
        if (msg.value - mintPrice > 0) {
            msg.sender.transfer(msg.value - mintPrice);
        }

        return tokenId;
    }

    function getPriceToMint(uint256 idx) public virtual view returns (uint256) {
        uint256 floor = lastMintPrice == 0 ? MIN_PRICE : lastMintPrice;
        uint256 nextIncrease = MAX_PRICE.sub(floor).div(LAST_ID-currentId);

        // Start at the floor, increase for each token
        uint256 mintPrice;
        if (lastMintPrice == 0) {
            mintPrice = MIN_PRICE.add(nextIncrease.mul(idx));
        } else {
            mintPrice = lastMintPrice.add(nextIncrease.mul(idx.add(1)));
        }

        // Add the current decay
        if (lastSoldAt > 0) {
            uint256 secondsPassed = block.timestamp.sub(lastSoldAt);
            uint256 periods = secondsPassed / 3600 / 6;
            uint256 discount = nextIncrease / 4 * periods;

            mintPrice = Math.max(MIN_PRICE, mintPrice.sub(discount));
        }

        // Restrict to 2 decimal places
        mintPrice = mintPrice / 0.01 ether * 0.01 ether;

        return mintPrice;
    }
}
