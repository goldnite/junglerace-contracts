import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";
import type { JungleRaceStake } from "../../src/types/FlattenJungleRaceStake.sol/JungleRaceStake";
import type { JungleRaceStake__factory } from "../../src/types/factories/FlattenJungleRaceStake.sol/JungleRaceStake__factory";

import type { JungleRace } from "../../src/types/contracts/token.sol/JungleRace";
import type { JungleRace__factory } from "../../src/types/factories/contracts/token.sol/JungleRace__factory";

var tokenAddress :any;

export async function deployTokenFixture(): Promise<{ greeter: JungleRace }> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const admin: SignerWithAddress = signers[0];
  
    const greeterFactory: JungleRace__factory = <JungleRace__factory>await ethers.getContractFactory("JungleRace");
    const greeter: JungleRace = <JungleRace>await greeterFactory.connect(admin).deploy();
    await greeter.deployed();
    tokenAddress = greeter.address;
    return { greeter };
  }

export async function deployStakeFixture(): Promise<{ greeter: JungleRaceStake }> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];

  const greeterFactory: JungleRaceStake__factory = <JungleRaceStake__factory>await ethers.getContractFactory("JungleRaceStake");
  const greeter: JungleRaceStake = <JungleRaceStake>await greeterFactory.connect(admin).deploy(tokenAddress,20,10,30,400,100,10000,"0xAd9b97fa8f28daCa6731d116d6fD2C72A164Ae0b");
  await greeter.deployed();

  return { greeter };
}