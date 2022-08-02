// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol"; 

contract CoinchainToken is AccessControl, ERC20, ERC20Burnable{

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  /*///////////////////////////////////////////////////////////////
                    GLOBAL STATE
    //////////////////////////////////////////////////////////////*/

    // boolean to control whether transfer limit is active
    bool public transferLimitEnabled;
    // maximum amount of tokens that can be transfered when transfer limit is active. used to mitigate bot impact
    uint256 public transferLimit;
    // address of the uniswap pair
    address public pairAddress;
    // block number when initial liquidity added to uniswap used to disable transfers within the same block as liquidity add
    uint256 public liqAddBlock;
    // private boolean to that liquidity bot protection is only activated on initial liquidity add
    bool private liquidityAdded; 


  /*///////////////////////////////////////////////////////////////
                    CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
        @notice constructor
        @param _name name of the token
        @param _symbol symbol for the token
        @param _initialSupply number of tokens that will be minted to owner wallet on creation
        @param WETH address of wrapped ETH used to compute uniswap pair address
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        address WETH,
        address tokenReceiver
    ) ERC20(_name, _symbol){
        _setupRole(DEFAULT_ADMIN_ROLE, tokenReceiver);
        _setupRole(ADMIN_ROLE, msg.sender);
        pairAddress = generatePairAddress(address(this), WETH);
        _mint(tokenReceiver, _initialSupply);
    }

    /*///////////////////////////////////////////////////////////////
                   MINTING FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
        @notice mint function that can only be called by authorized address
        @param to address to mint the tokens to
        @param amount amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE){
        _mint(to, amount);
    }

    /*///////////////////////////////////////////////////////////////
                   INTERNAL HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
        @notice helper function to generate uniswap pair address
        @param token0 address of first token in pair
        @param token1 address of second token in pair
        @return address of uniswap pair 
     */
    function generatePairAddress(address token0, address token1) internal pure returns(address){
        address factory = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
        return address(uint160(uint256(keccak256(abi.encodePacked(
                    hex'ff',
                    factory,
                    keccak256(abi.encodePacked(token0, token1)),
                    hex'96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f'
                )))));
    }

    /*///////////////////////////////////////////////////////////////
                   ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
        @notice sets the max transfer limit
        @param _transferLimit new transfer limit to be set
     */
    function setTransferLimit(uint256 _transferLimit) external onlyRole(ADMIN_ROLE){
        transferLimit = _transferLimit;
    }

    /**
        @notice sets the boolean to enable and disable transfer limit 
        @param _transferLimitEnabled boolean for which to set the transferLimitEnabled flag
     */
    function setTransferLimitEnabled(bool _transferLimitEnabled) external onlyRole(ADMIN_ROLE){
        transferLimitEnabled = _transferLimitEnabled;
    }

    /*///////////////////////////////////////////////////////////////
                   HOOKS
    //////////////////////////////////////////////////////////////*/
    
    function _beforeTokenTransfer(
        address from, 
        address to, 
        uint256 amount
    ) internal virtual override {
        require(hasRole(ADMIN_ROLE, from) || block.number > liqAddBlock, "Token transfers disallowed in same block as liquidity add");
        if(transferLimitEnabled && !hasRole(ADMIN_ROLE, from)){
            require(amount <= transferLimit, "Token transfer amount exceeds limit");
        }
        if(pairAddress != address(0) && !liquidityAdded && to == pairAddress){
            liqAddBlock = block.number;
        }
        super._beforeTokenTransfer(from, to, amount);
    }

}