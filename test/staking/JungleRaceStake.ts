import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Signers } from "../types";
import { shouldBehaveLikeGreeter,shouldCalculateRewardCheck,shouldChangeLimitCheck,shouldChangeWalletCheck,shouldCheckMaturity,shouldClaimRewardCheck,shouldContractBalanceCheck,shouldPoolActivationCheck,shouldRetrieveFundCheck,shouldStakeCheck } from "./JungleRaceStake.behaviour";
import { deployTokenFixture } from "./JungleRaceStake.fixture";
import { deployStakeFixture } from "./JungleRaceStake.fixture";

describe("Unit tests for Jungle race Staking", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.test1 = signers[1];
    this.signers.test2 = signers[2];

    this.loadFixture = loadFixture;
  });
  describe("Jungle race Staking Functionality check", function () {
    before(async function () {
      const { greeter } = await this.loadFixture(deployTokenFixture);
      this.jungleRace = greeter;
    });
    before(async function () {
      const { greeter } = await this.loadFixture(deployStakeFixture);
      this.jungleRaceStake = greeter;
    });

    shouldBehaveLikeGreeter();
    shouldPoolActivationCheck()
    shouldChangeLimitCheck()
    shouldChangeWalletCheck()
    shouldContractBalanceCheck()
    shouldCheckMaturity()
    shouldStakeCheck();
    shouldCalculateRewardCheck()
    shouldRetrieveFundCheck()
    shouldClaimRewardCheck()
  });
  
});
