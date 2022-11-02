import { ethers } from "hardhat";
import UniswapRouterABI from "../abi/UniswapRouterV2.json";

async function main(){
    const hre = require("hardhat");
    const [signer] = await ethers.getSigners();
    const tokenContractAddress = "0x5D9bC20cF5bE64A47016196C2a4597629F6bc63A"; // 
    const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap Router
    const receiverAddress = "0x51aF8E6dA2502777A34c5D37c7bb90cCE5AdcCb4"; // Fireblocks
    const tokenName = "CoinchainTest1";
    const tokenSymbol = "CCHTEST1";
    const initialSupply = ethers.utils.parseEther("200000000");
    const maxSupply = ethers.utils.parseEther("400000000");

    
    const router = new ethers.Contract(routerAddress, UniswapRouterABI, signer);
    const WETHAddress = await router.WETH();
    console.log("WETHAddress: ", WETHAddress)

    // const coinchainToken = await (
    //     await ethers.getContractFactory("CoinchainToken")
    // ).deploy(tokenName, tokenSymbol, initialSupply, maxSupply, WETHAddress, receiverAddress);
    // await coinchainToken.deployed();
    // console.log("coinchainTokenAddress: ", coinchainToken.address);

    setTimeout(async () => {
        try{
            await hre.run("verify:verify", {
                address: tokenContractAddress,
                constructorArguments: [
                    tokenName,
                    tokenSymbol,
                    initialSupply,
                    maxSupply,
                    WETHAddress,
                    receiverAddress
                ]
            })
        }catch(e){
            console.log("Unable to verify: ", e);
        }
    }, 120000)
 
}

main().catch((error) => {
    console.log(error);
    process.exit(1);
})