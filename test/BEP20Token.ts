import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BEP20Token } from "../typechain-types"

describe("BEP20Token", () => {
    let bep20Token: BEP20Token;
    let [owner, addr1]: SignerWithAddress[] = [];

    beforeEach(async () => {
        [owner, addr1] = await ethers.getSigners();

        bep20Token = await(
            await ethers.getContractFactory("BEP20Token")
        ).deploy();
        await bep20Token.deployed();
    });

    describe("contructor()", async () => {
        it("should deploy with correct initial values", async () => {
            expect(await bep20Token.name()).to.equal("KCoin");
            expect(await bep20Token.symbol()).to.equal("KCHH");
            expect(await bep20Token.decimals()).to.equal(18);
            expect(await bep20Token.totalSupply()).to.equal(ethers.utils.parseEther("200000000"));
            expect(await bep20Token.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("200000000"));
        })
    })
})