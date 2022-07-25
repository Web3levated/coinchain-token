import { expect } from "chai";
import { ethers } from "hardhat";
import UniswapRouterABI from "./abi/UniswapRouterV2.json";

async function main(){
    const [signer] = await ethers.getSigners();
    const WETHAddress = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
    const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    
    const weth = await ethers.getContractAt("IBEP20", WETHAddress);
    const router = new ethers.Contract(routerAddress, UniswapRouterABI, signer);
    const bep20Token = await (
        await ethers.getContractFactory("BEP20Token")
    ).deploy();
    await bep20Token.deployed();
    console.log("bep20TokenAddress: ", bep20Token.address);

    const bep20TokenAmount = ethers.utils.parseEther("1");
    const wethAmount = ethers.utils.parseEther("1");

    let bep20TokenApprovalTx = await bep20Token.approve(router.address, ethers.utils.parseEther("100000"));
    await bep20TokenApprovalTx.wait();
    console.log("bepApproval: ", bep20TokenApprovalTx.hash);
    let wethApprovalTx = await weth.approve(router.address, ethers.utils.parseEther("100000"));
    await wethApprovalTx.wait();
    console.log("wethApproval: ", wethApprovalTx.hash);


    let deadline = Math.floor(Date.now() / 1000) + 60;
    const addLiquidity = await router.addLiquidityETH(bep20Token.address, bep20TokenAmount, bep20TokenAmount, wethAmount, signer.address, deadline, {value: wethAmount});
    await addLiquidity.wait();
    console.log("addLiqTx: ", addLiquidity.hash);
    try{
        await router.swapExactETHForTokens(ethers.utils.parseEther("0.01"), [weth.address, bep20Token.address], signer.address, deadline, {value: ethers.utils.parseEther("0.05")})
    } catch(e) {
        console.log("swap blocked in block immediately after liquidity add");
        console.log(e);
    }
    setTimeout(async () => {
        let transferTx = await router.swapExactETHForTokens(ethers.utils.parseEther("0.01"), [weth.address, bep20Token.address], signer.address, deadline, {value: ethers.utils.parseEther("0.05")});
        console.log("swap 20 seconds after liquidity add: ", transferTx.hash);   
    }, 20000);
}

main().catch((error) => {
    console.log(error);
    process.exit(1);
})