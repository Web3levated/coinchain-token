// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { BEP20Token } from "../typechain-types"

// describe("BEP20Token", () => {
//     let bep20Token: BEP20Token;
//     let [owner, addr1]: SignerWithAddress[] = [];

//     beforeEach(async () => {
//         [owner, addr1] = await ethers.getSigners();

//         bep20Token = await(
//             await ethers.getContractFactory("BEP20Token")
//         ).deploy();
//         await bep20Token.deployed();
//     });

//     describe("contructor()", async () => {
//         it("should deploy with correct initial values", async () => {
//             expect(await bep20Token.name()).to.equal("KCoin");
//             expect(await bep20Token.symbol()).to.equal("KCHH");
//             expect(await bep20Token.decimals()).to.equal(18);
//             expect(await bep20Token.totalSupply()).to.equal(ethers.utils.parseEther("200000000"));
//             expect(await bep20Token.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("200000000"));
//         })
//     })

//     describe("maxTransactionLimit", async () => {
//         it("should revert if transaction exceeds limit", async () => {
//             await bep20Token.setTxnTokenLimit(ethers.utils.parseEther("99"));
//             await bep20Token.setMaxTxnLimitEnabled(true);
//             await bep20Token.transfer(addr1.address, ethers.utils.parseEther("100"));
//             await expect(bep20Token.connect(addr1).transfer(owner.address, ethers.utils.parseEther("100"))).to.be.revertedWith("Token amount exceeds limit");
//         });
//         it("Should not revert if flag is set to false", async () => {
//             await bep20Token.setTxnTokenLimit(ethers.utils.parseEther("99"));
//             await bep20Token.setMaxTxnLimitEnabled(false);
//             await bep20Token.transfer(addr1.address, ethers.utils.parseEther("100"));
//             await expect(bep20Token.connect(addr1).transfer(owner.address, ethers.utils.parseEther("100"))).to.not.be.reverted;
//         });
//         it("Should not revert if address is whitelisted", async () => {
//             await bep20Token.setTxnTokenLimit(ethers.utils.parseEther("99"));
//             await bep20Token.setMaxTxnLimitEnabled(true);
//             await bep20Token.whitelistTxnLimit(addr1.address);
//             await bep20Token.transfer(addr1.address, ethers.utils.parseEther("100"));
//             await expect(bep20Token.connect(addr1).transfer(owner.address, ethers.utils.parseEther("100"))).to.not.be.reverted;
//         })
//     })
// })