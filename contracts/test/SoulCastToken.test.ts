import { expect } from "chai";
import * as hre from "hardhat";
const { ethers, upgrades } = hre;
import { SoulCastToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("SoulCastToken", function () {
    let soulToken: SoulCastToken;
    let owner: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const SoulCastTokenFactory = await ethers.getContractFactory("SoulCastToken");
        soulToken = (await upgrades.deployProxy(SoulCastTokenFactory, [owner.address], {
            initializer: "initialize",
        })) as unknown as SoulCastToken;
        await soulToken.waitForDeployment();
    });

    describe("Initialization", function () {
        it("Should set the correct name and symbol", async function () {
            expect(await soulToken.name()).to.equal("SoulCast Token");
            expect(await soulToken.symbol()).to.equal("SOUL");
        });

        it("Should mint total supply to admin", async function () {
            const totalSupply = await soulToken.TOTAL_SUPPLY();
            expect(await soulToken.balanceOf(owner.address)).to.equal(totalSupply);
        });

        it("Should set default fees and rates", async function () {
            expect(await soulToken.issuanceFeeBps()).to.equal(100);
            expect(await soulToken.stakingRewardRateBps()).to.equal(500);
        });
    });

    describe("Transfers with Issuance Fee", function () {
        it("Should burn fee on transferWithIssuanceFee", async function () {
            const amount = ethers.parseEther("1000");
            const feeBps = await soulToken.issuanceFeeBps();
            const expectedFee = (amount * feeBps) / 10000n;
            const expectedNet = amount - expectedFee;

            await soulToken.transferWithIssuanceFee(user1.address, amount);

            expect(await soulToken.balanceOf(user1.address)).to.equal(expectedNet);
            expect(await soulToken.totalIssuanceFeeBurned()).to.equal(expectedFee);
        });
    });

    describe("Staking", function () {
        it("Should allow users to stake tokens", async function () {
            const stakeAmount = ethers.parseEther("500");
            await soulToken.transfer(user1.address, stakeAmount);
            await soulToken.connect(user1).stake(stakeAmount);

            const stakeInfo = await soulToken.stakes(user1.address);
            expect(stakeInfo.amount).to.equal(stakeAmount);
            expect(await soulToken.totalStaked()).to.equal(stakeAmount);
        });

        it("Should allow users to unstake tokens", async function () {
            const stakeAmount = ethers.parseEther("500");
            await soulToken.transfer(user1.address, stakeAmount);
            await soulToken.connect(user1).stake(stakeAmount);

            await soulToken.connect(user1).unstake(stakeAmount);

            const stakeInfo = await soulToken.stakes(user1.address);
            expect(stakeInfo.amount).to.equal(0);
            expect(await soulToken.balanceOf(user1.address)).to.equal(stakeAmount);
        });
    });
});
