# Chainforce Updates
## Token launch procedures for anti bot
1. Use function setBlocksToWait(uint8) to set the amount of blocks to wait before allowing swaps after liquidity addition. default=2
2. Use function setTxnTokenLimit(uint256) to set the maximum amount of tokens that can be swapped in a single transaction while maxTxnEnabled flag is set to true.
3. Use function setMaxTxnLimitEnabled(true) to set the maxTxnEnabled flag to true.
4. Use function  whitelistTxnLimit(address) to whitelist an address that should not have a transaction limit.
5. Add liquidity
6. Use function setMaxTxnLimitEnabled(true) when ready.

