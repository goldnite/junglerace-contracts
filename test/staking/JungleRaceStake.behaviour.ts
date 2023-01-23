import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";

export function shouldBehaveLikeGreeter(): void {
  it("Should Check Token Connectivity", async function () {
    expect(await this.jungleRace.connect(this.signers.admin).symbol()).to.equal("JRG");
  });
}
export function shouldChangeLimitCheck(): void {
  it("Should Check Changing Limit", async function() {
    await this.jungleRaceStake.connect(this.signers.admin).changePoolLimit(BigNumber.from("500"))
    expect((await this.jungleRaceStake.poolInfo(0)).poolLimit).to.be.equal(BigNumber.from("500").mul(BigNumber.from("10").pow(BigNumber.from("18"))))
  })
}
export function shouldChangeWalletCheck(): void {
  it("Should Check Changing Fee Wallet", async function() {
    // reverted with "Ownable: caller is not the owner"
    await expect(this.jungleRaceStake.connect(this.signers.test1).changeFeeWallet(this.signers.test2.address)).to.be.revertedWith("Ownable: caller is not the owner")

    // change fee wallet
    await this.jungleRaceStake.connect(this.signers.admin).changeFeeWallet(this.signers.test2.address);
    expect(await this.jungleRaceStake.penaltyFeeAddress()).to.be.equal(this.signers.test2.address)
  })
}
export function shouldPoolActivationCheck(): void {
  it("Should Check Pool Activation", async function() {
    await this.jungleRaceStake.connect(this.signers.admin).poolActivation(false);
    expect(await (await this.jungleRaceStake.poolInfo(0)).active).to.be.equal(false)
  })
}
export function shouldContractBalanceCheck(): void {
  it("Should Check the balance of Stake Contract", async function() {
    // check the token balance
    expect(await this.jungleRaceStake.tokenBalance(this.jungleRace.address)).to.be.equal(await this.jungleRace.balanceOf(this.jungleRaceStake.address))

    // check the eth balance
    expect(await this.jungleRaceStake.ethBalance()).to.be.equal(await ethers.provider.getBalance(this.jungleRaceStake.address))
  })
}
export function shouldRetrieveFundCheck(): void {
  it("Should Check Fund Retrievement", async function() {
    const ethStake = await this.jungleRaceStake.ethBalance();
    const tokenStake = await this.jungleRaceStake.tokenBalance(this.jungleRace.address)
    const ethOwner = await ethers.provider.getBalance(this.signers.admin.address)
    const tokenOwner = await this.jungleRace.balanceOf(this.signers.admin.address)

    // eth retrievement
    const tx = await this.jungleRaceStake.retrieveEthStuck()
    const receipt = await tx.wait()
    expect(await ethers.provider.getBalance(this.signers.admin.address)).to.be.equal(ethStake.add(ethOwner).sub(receipt.gasUsed.mul(receipt.effectiveGasPrice)))

    // token retrievement
    await this.jungleRaceStake.retrieveERC20TokenStuck(this.jungleRace.address, tokenStake)
    expect(await this.jungleRace.balanceOf(this.signers.admin.address)).to.be.equal(tokenStake.add(tokenOwner))
  })
}
export function shouldStakeCheck(): void {
  it("Should Check Staking Status", async function () {
    // reverted with 'Pool not Active'
    await expect(this.jungleRaceStake.connect(this.signers.test1).PoolStake(BigNumber.from("100"))).to.be.revertedWith("Pool not Active");

    // reverted with 'Token Balance of user is less'
    await this.jungleRaceStake.connect(this.signers.admin).poolActivation(true)
    await expect(this.jungleRaceStake.connect(this.signers.test1).PoolStake(BigNumber.from("100"))).to.be.revertedWith("Token Balance of user is less");

    // reverted with 'Pool Limit Exceeded'
    await expect(this.jungleRaceStake.connect(this.signers.admin).PoolStake(BigNumber.from('600').mul(BigNumber.from('10').pow(18)))).to.be.revertedWith("Pool Limit Exceeded");

    // reverted with 'Minimum Stake Condition should be Satisfied'
    await expect(this.jungleRaceStake.connect(this.signers.admin).PoolStake(BigNumber.from("1"))).to.be.revertedWith("Minimum Stake Condition should be Satisfied");

    // reverted with 'Maximum Stake Condition should be Satisfied'
    await this.jungleRaceStake.connect(this.signers.admin).changePoolLimit(BigNumber.from("15000"))
    await expect(this.jungleRaceStake.connect(this.signers.admin).PoolStake(BigNumber.from('12000').mul(BigNumber.from('10').pow(18)))).to.be.revertedWith("Maximum Stake Condition should be Satisfied");

    // admin stake 100 jungle
    await this.jungleRace.connect(this.signers.admin).approve(this.jungleRaceStake.address, BigNumber.from("100").mul(BigNumber.from('10').pow(18)));
    await this.jungleRaceStake.connect(this.signers.admin).PoolStake(BigNumber.from("100").mul(BigNumber.from("10").pow(18)))
    expect(await this.jungleRace.balanceOf(this.jungleRaceStake.address)).to.be.equal(BigNumber.from("100").mul(BigNumber.from("10").pow(18)))

    // reverted with 'Already Staked in this Pool'
    await expect(this.jungleRaceStake.connect(this.signers.admin).PoolStake(BigNumber.from('100').mul(BigNumber.from('10').pow(18)))).to.be.revertedWith("Already Staked in this Pool");
  });
}
export function shouldCalculateRewardCheck(): void {
  it("Should Check Reward Calculation", async function() {
    // check the reward of non-stake user
    expect(await this.jungleRaceStake.rewardsCalculate(this.signers.test1.address)).to.be.equal(0)

    // check the reward of staked user
    const pool = await this.jungleRaceStake.poolInfo(0);
    const user = await this.jungleRaceStake.userInfo(0, this.signers.admin.address)
    const rewardA = await this.jungleRaceStake.rewardsCalculate(this.signers.admin.address);
    const blockNo = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNo);
    expect(rewardA).to.be.equal(user.poolBal.mul(pool.poolRewardPercent).div(360).div(1000).mul(BigNumber.from(block.timestamp - user.pool_deposit_time).div(86400)));

    // check the reward over max-payout
    await network.provider.send('evm_increaseTime', [40 * 24 * 60 * 60])
    await network.provider.send('evm_mine');
    const rewardB = await this.jungleRaceStake.rewardsCalculate(this.signers.admin.address);
    expect(rewardB).to.be.equal(user.poolBal.mul(pool.poolRewardPercent).div(1000).div(360).mul(pool.poolDays))
  })
}
export function shouldCheckMaturity(): void {
  it("Should Check Maturity", async function() {
    // maturity date
    const pool = await this.jungleRaceStake.poolInfo(0)
    const user = await this.jungleRaceStake.userInfo(0, this.signers.admin.address)
    expect(await this.jungleRaceStake.maturityDate(this.signers.admin.address)).to.be.equal(pool.fullMaturityTime.add(user.pool_deposit_time))

    // fully maturity reward
    expect(await this.jungleRaceStake.fullMaturityReward(this.signers.admin.address)).to.be.equal(user.poolBal.mul(pool.poolRewardPercent).div(1000).div(360).mul(pool.poolDays))
  })
}
export function shouldClaimRewardCheck(): void {
  it("Should Check Reward Claim", async function() {
    const blockNo = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNo);
    const pool = await this.jungleRaceStake.poolInfo(0)
    const user = await this.jungleRaceStake.userInfo(0, this.signers.admin.address)
    await this.jungleRace.connect(this.signers.admin).transfer(this.jungleRaceStake.address, BigNumber.from("100000").mul(BigNumber.from(10).pow(18)))

    // after full maturity
    await this.jungleRaceStake.connect(this.signers.admin).claimPool();
    expect(await (await this.jungleRaceStake.userInfo(0, this.signers.admin.address)).rewardEarned).to.be.equal(user.poolBal.mul(pool.poolRewardPercent).div(1000).div(360).mul(pool.poolDays))
    expect(await (await this.jungleRaceStake.userInfo(0, this.signers.admin.address)).pool_payouts).to.be.equal(user.poolBal)

    // before full maturity
    await this.jungleRace.connect(this.signers.admin).transfer(this.signers.test2.address, BigNumber.from("1000").mul(BigNumber.from(10).pow(18)))
    const user2 = this.jungleRaceStake.userInfo(0, this.signers.test2.address);
    const amount = BigNumber.from(100).mul(BigNumber.from(10).pow(18));
    const panelty = amount.mul(pool.poolPenaltyPercent).div(1000);

    await this.jungleRace.connect(this.signers.test2).approve(this.jungleRaceStake.address, amount)
    await this.jungleRaceStake.connect(this.signers.test2).PoolStake(amount)
    await network.provider.send('evm_increaseTime', [2 * 24 * 60 * 60])
    await network.provider.send('evm_mine')
    await this.jungleRaceStake.connect(this.signers.test2).claimPool()
    expect((await this.jungleRaceStake.userInfo(0, this.signers.test2.address)).rewardEarned).to.be.equal(0);
    expect((await this.jungleRaceStake.userInfo(0, this.signers.test2.address)).pool_payouts).to.be.equal(amount.sub(panelty))
  })
}
