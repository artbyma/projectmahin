// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/GSN/Context.sol";

/**
 * @dev Uses the Ownable class and adds a second role called the minter.
 */
abstract contract Roles is Context, Ownable {
    address private _minter;

    /**
     * @dev Initializes the contract setting the deployer as the initial minter.
     */
    constructor () {
        address msgSender = _msgSender();
        _minter = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current minter.
     */
    function minter() public view returns (address) {
        return _minter;
    }

    /**
     * @dev Throws if called by any account other than the minter.
     */
    modifier onlyMinter() {
        require(_minter == _msgSender(), "not minter");
        _;
    }

    /**
     * @dev Throws if called by any account other than the minter or the owner.
     */
    modifier onlyMinterOrOwner() {
        require(_minter == _msgSender() || owner() == _msgSender(), "not minter or owner");
        _;
    }

    /**
     * @dev Transfers the minter role of the contract to a new account (`newMinter`).
     * Can only be called by the owner.
     */
    function setMinter(address newMinter) public virtual onlyOwner {
        require(newMinter != address(0), "zero address");
        emit OwnershipTransferred(_minter, newMinter);
        _minter = newMinter;
    }
}
