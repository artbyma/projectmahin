// SPDX-License-Identifier: MIT


pragma solidity ^0.7.0;

import "./MahinNFT.sol";
import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


// Sell NFTs on a decaying curve.
contract CurveSeller {
    using SafeMath for uint256;

    uint public constant FIRST_ID = 1;
    uint public constant LAST_ID = 8;

    uint public constant MIN_PRICE = 0.2 ether;

    uint256 currentId = FIRST_ID;
    uint256 lastMintPrice;
    uint256 lastSoldAt;

    MahinNFT public nftContract;

    constructor (address mahinAddress) {
        nftContract = MahinNFT(mahinAddress);
    }

    function purchase() public virtual payable returns (uint256 _tokenId) {
        require(currentId <= LAST_ID, "sold out");

        uint256 mintPrice = getCurrentPriceToMint();
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

    function getCurrentPriceToMint() public virtual view returns (uint256) {
        uint256 nextIncrease = 0.1 ether;

        // Start at the floor, increase for each token
        uint256 mintPrice = lastMintPrice == 0 ? MIN_PRICE : lastMintPrice + nextIncrease;

        // Add the current decay
        if (lastSoldAt > 0) {
            uint256 secondsPassed = block.timestamp.sub(lastSoldAt);
            uint256 periods = secondsPassed / 3600 / 6;
            uint256 discount = nextIncrease / 4 * periods;

            mintPrice = Math.max(MIN_PRICE, mintPrice.sub(discount));
        }

        return mintPrice;
    }
}
