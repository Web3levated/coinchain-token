import { ethers } from "hardhat";

async function main(){
    const bep20Token = await (
        await ethers.getContractFactory("BEP20Token")
    ).deploy();
    await bep20Token.deployed();
    console.log("bep20TokenAddress: ", bep20Token.address);
}

main().catch((error) => {
    console.log(error);
    process.exit(1);
})