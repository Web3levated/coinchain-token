import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { CoinchainToken } from "../typechain-types";

describe("CoinchainToken", () => {
    let coinchainToken: CoinchainToken;
    let [owner, addr1, addr2, addr3]: SignerWithAddress[] = [];

    beforeEach(async () => {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        coinchainToken = await(
            await ethers.getContractFactory("CoinchainToken")
        ).deploy("Coinchain", "CCH", ethers.utils.parseEther("200000000"));
        await coinchainToken.deployed();
    })

    describe("constructor()", async () => {
        it("Should deploy with correct initial values", async () => {
            expect(await coinchainToken.name()).to.equal("Coinchain");
            expect(await coinchainToken.symbol()).to.equal("CCH");
            expect(await coinchainToken.decimals()).to.equal(18);
            expect(await coinchainToken.totalSupply()).to.equal(ethers.utils.parseEther("200000000"));
            expect(await coinchainToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("200000000"));
        })
    })

    describe("maxTransferLimit", async () => {
        it("Should revert if transaction exceeds limit", async () => {
            await coinchainToken.setTransferLimit(ethers.utils.parseEther("99"));
            await coinchainToken.setMaxTransferLimitEnabled(true);
            await coinchainToken.connect(owner).transfer(addr1.address, ethers.utils.parseEther("100"));
            await expect(coinchainToken.connect(addr1).transfer(owner.address, ethers.utils.parseEther("100")))
                .to.be.revertedWith("Token transfer amount exceeds limit");
        });
        it("Should not revert if flag is set to false", async () => {
            await coinchainToken.setTransferLimit(ethers.utils.parseEther("99"));
            await coinchainToken.setMaxTransferLimitEnabled(false);
            await coinchainToken.connect(owner).transfer(addr1.address, ethers.utils.parseEther("100"));
            await expect(coinchainToken.connect(addr1).transfer(owner.address, ethers.utils.parseEther("100")))
                .to.not.be.reverted;
        });
        it("Should not revert if seller address is whitelisted", async () => {
            await coinchainToken.setTransferLimit(ethers.utils.parseEther("99"));
            await coinchainToken.setMaxTransferLimitEnabled(true);
            await coinchainToken.whitelistAccounts([addr1.address])
            await coinchainToken.connect(owner).transfer(addr1.address, ethers.utils.parseEther("100"));
            await expect(coinchainToken.connect(addr1).transfer(owner.address, ethers.utils.parseEther("100")))
                .to.not.be.reverted;
        });
        it("Should not revert if buyer address is whitelisted", async () => {
            await coinchainToken.setTransferLimit(ethers.utils.parseEther("99"));
            await coinchainToken.setMaxTransferLimitEnabled(true);
            await coinchainToken.whitelistAccounts([addr1.address])
            await coinchainToken.connect(owner).transfer(addr2.address, ethers.utils.parseEther("100"));
            await expect(coinchainToken.connect(addr2).transfer(addr1.address, ethers.utils.parseEther("100")))
                .to.not.be.reverted;
        });

    })
})