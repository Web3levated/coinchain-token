// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 

contract CoinchainToken is Ownable, ERC20{

    bool public maxTransferLimitEnabled;
    uint256 public transferLimit;
    mapping(address => bool) public whitelistForTransferLimit;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) ERC20(_name, _symbol){
        _mint(msg.sender, _totalSupply);
    }

    function setTransferLimit(uint256 _transferLimit) external onlyOwner{
        transferLimit = _transferLimit;
    }

    function setMaxTransferLimitEnabled(bool _maxTransferLimitEnabled) external onlyOwner{
        maxTransferLimitEnabled = _maxTransferLimitEnabled;
    }

    function whitelistAccounts(address[] calldata accounts) external onlyOwner{
        for(uint256 i = 0; i < accounts.length; i++){
            whitelistForTransferLimit[accounts[i]] = true;
        }
    }

    function _beforeTokenTransfer(
        address from, 
        address to, 
        uint256 amount
    ) internal override {
        if(maxTransferLimitEnabled && !(whitelistForTransferLimit[to] || whitelistForTransferLimit[from]) && from != owner()){
            require(amount <= transferLimit, "Token transfer amount exceeds limit");
        }
        super._beforeTokenTransfer(from, to, amount);
    }

}