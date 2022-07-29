import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { CoinchainToken } from "../typechain-types";
import { FACTORY_ADDRESS, INIT_CODE_HASH } from '@uniswap/sdk'
import { mineBlock, setAutoMine } from "./utils/helpers";


describe("CoinchainToken", () => {
    let coinchainToken: CoinchainToken;
    let [owner, addr1, addr2, addr3]: SignerWithAddress[] = [];

    beforeEach(async () => {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        coinchainToken = await(
            await ethers.getContractFactory("CoinchainToken")
        ).deploy("Coinchain", "CCH", ethers.utils.parseEther("200000000"), addr3.address);
        await coinchainToken.deployed();
    })

    describe("constructor()", async () => {
        it("Should deploy with correct initial values", async () => {
            const expectedPairAddress = ethers.utils.getCreate2Address(
                FACTORY_ADDRESS,
                ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.solidityPack(['address', 'address'], [coinchainToken.address, addr3.address])]),
                INIT_CODE_HASH
              )

            expect(await coinchainToken.name()).to.equal("Coinchain");
            expect(await coinchainToken.symbol()).to.equal("CCH");
            expect(await coinchainToken.decimals()).to.equal(18);
            expect(await coinchainToken.totalSupply()).to.equal(ethers.utils.parseEther("200000000"));
            expect(await coinchainToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("200000000"));
            expect(await coinchainToken.pairAddress()).to.equal(expectedPairAddress);
        })
    })

    describe("maxTransferLimit", async () => {
        it("Should revert if transaction exceeds limit", async () => {
            await coinchainToken.connect(owner).transfer(addr1.address, ethers.utils.parseEther("100"));
            await coinchainToken.setTransferLimit(ethers.utils.parseEther("99"));
            await coinchainToken.setTransferLimitEnabled(true);
            await expect(coinchainToken.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("100")))
                .to.be.revertedWith("Token transfer amount exceeds limit");
        });
        it("Should not revert if flag is set to false", async () => {
            await coinchainToken.connect(owner).transfer(addr1.address, ethers.utils.parseEther("100"));
            await coinchainToken.setTransferLimit(ethers.utils.parseEther("99"));
            await coinchainToken.setTransferLimitEnabled(false);
            await expect(coinchainToken.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("100")))
                .to.not.be.reverted;
        });

    });

    describe("liquidity snipe protection", async () => {
        it("Should revert if transfer within same block as liquidity add", async () => {
            await coinchainToken.connect(owner).transfer(addr1.address, ethers.utils.parseEther("100"));
            await setAutoMine(false);
            await coinchainToken.connect(owner).transfer(await coinchainToken.pairAddress(), ethers.utils.parseEther("100000"));
            let botTx = await coinchainToken.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("100"));
            await setAutoMine(true);
            await expect( botTx.wait()).to.be.reverted;
        });
        it("Should not revert if transfer in block after liquidity add", async () => {
            await coinchainToken.connect(owner).transfer(addr1.address, ethers.utils.parseEther("100"));
            await setAutoMine(false);
            await coinchainToken.connect(owner).transfer(await coinchainToken.pairAddress(), ethers.utils.parseEther("100000"));
            await mineBlock();
            let botTx = await coinchainToken.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("100"));
            await setAutoMine(true);
            await expect( botTx.wait()).to.not.be.reverted;
        });
    })
})