// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

//import "hardhat/console.sol";
import "./Randomness.sol";
import "openzeppelin-solidity/contracts/utils/math/Math.sol";


interface IMahin {
    function totalSupply() external view returns (uint256);
    function tokenByIndex(uint256 index) external view returns (uint256);
    function diagnose(uint256 tokenId) external;
}


// The NFT contract itself inherits from `Randomness` - thus include it's own random generator.
// However, it also allows a custom contract to be installed to replace the builtin logic.
//
// This is the current replacement contract. It:
//  - Fixes the broken randomness values.
//  - Considers the mint date in its logic.
//  - Is able to apy a reward.
//
// The reward is funded by the Project Mahin treasury in exchange, and paid for triggering
// the diagnosis function. Through this mechanism, the diagnosis process becomes autonomous
// by way of economic incentives.
//
// Calling `requestRoll` locks in the caller as the recipient of the payment for X blocks.
// After X blocks, anyone may call `applyRoll` to earn the fee.
//
// The contract is funded manually by the Project Treasury. The payment amount increases
// as time since the last roll increases.
contract DoctorV3 is Randomness, Ownable {
    IMahin public nft;

    // For how long the reward is locked to the requestRoll() caller.
    uint public rewardLockDuration = 3600;

    // By default, the reward given is 0.8 ether per year.
    uint public rewardPeriodLength = 3600 * 24 * 365;
    uint public rewardPeriodAmount = 0.8 ether;

    // If the reward is currently locked and to who
    address public rewardLockedTo;
    uint public rewardLockedAt;

    constructor(VRFConfig memory vrfConfig, IMahin _nft)
        // 0.0000000008468506% - This has been pre-calculated to amount to 12.5%
        // start time is the deploy of the main ERC contract.
    Randomness(vrfConfig, 8468506, 1616625854
    ) {
        nft = _nft;
    }

    function _totalSupply() public view override returns (uint256) {
        return nft.totalSupply();
    }

    function _tokenByIndex(uint256 index) public view override returns (uint256) {
        return nft.tokenByIndex(index);
    }

    function _isDisabled() public view override returns (bool) {
        return false;
    }

    function onDiagnosed(uint256 tokenId) internal override {
        nft.diagnose(tokenId);
    }

    /////////////// Reward logic /////////////////////

    // Allow funding
    receive() external payable {}

    function requestRoll(bool useFallback) public override {
        // If a roll is already scheduled, requestRoll() is a noop. So we first have to
        // ensure no roll is active, such that a reward lock cannot be overwritten.
        if (isRolling()) {
            return;
        }

        // Request a roll
        super.requestRoll(useFallback);

        // Lock the reward to the given user.
        rewardLockedTo = msg.sender;
        rewardLockedAt = block.timestamp;
    }

    function applyRoll() public override {
        // Figure out who would be receiving the reward.
        address rewardRecipient;
        uint rewardAmountTargetTime;

        // Ideally, the person who called `requestRoll` will be paid - as long as they don't
        // wait too long. We can't let them "grieve" by refusing to complete the process.
        if (rewardLockedTo != address(0) && (block.timestamp - rewardLockedAt < rewardLockDuration)) {
            rewardRecipient = rewardLockedTo;

            // The caller gains nothing by delaying the call to `applyRoll`.
            // Their reward is determined based on the time `requestRoll` was called.
            rewardAmountTargetTime = rewardLockedAt;
        }

        else {
            // After a certain number of blocks, we will give the reward to whoever calls
            // `applyRoll` to complete the process, even if they were not the ones who called
            // `requestRoll`. This prevents grieving. The reward amount now continues to grow
            // again until someone finds this incentive to be large enough.
            rewardRecipient = msg.sender;
            rewardAmountTargetTime = block.timestamp;
        }

        // Figure out the reward amount. Do this before we "applyRoll()" so that the amount is based
        // on the last roll timestamp still.
        uint256 rewardAmount = getRewardAmount(rewardAmountTargetTime);

        // This will fail if we are not rolling right now.
        super.applyRoll();

        // Pay out ETH
        payable(rewardRecipient).transfer(rewardAmount);
    }

    function getRewardAmount(uint256 rewardAmountTargetTime) public view returns (uint256) {
        // Determine how much ETH to pay out
        uint256 rewardPeriod = rewardAmountTargetTime - lastRollAppliedTime;
        uint256 rewardAmount = Math.min(
            address(this).balance,
            (rewardPeriod * rewardPeriodAmount  / rewardPeriodLength)
        );

//        console.log("rewardAmountTargetTime", rewardAmountTargetTime);
//        console.log("lastCompletedRollTime", lastCompletedRollTime);
//        console.log("rewardPeriod", rewardPeriod);
//        console.log("balance", address(this).balance);
//        console.log("rewardAmount", rewardAmount);
//        console.log("--------");

        return rewardAmount;
    }

    /////////////// Admin functions /////////////////////

    function setPerSecondProbability(uint _probabilityPerSecond) public onlyOwner {
        probabilityPerSecond = _probabilityPerSecond;
    }

    function setLastRollTime(uint timestamp) public onlyOwner {
        lastRollAppliedTime = timestamp;
        lastRollRequestedTime = timestamp;
    }

    function setRewardLockDuration(uint256 newDuration) public onlyOwner {
        rewardLockDuration = newDuration;
    }

    function setRewardPeriodLength(uint256 newLength) public onlyOwner {
        rewardPeriodLength = newLength;
    }

    function setRewardPeriodAmount(uint256 newAmount) public onlyOwner {
        rewardPeriodAmount = newAmount;
    }

    function withdraw() public onlyOwner {
        address payable owner = payable(owner());
        owner.transfer(address(this).balance);
    }
}
