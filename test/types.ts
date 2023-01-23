import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { Greeter } from "../src/types/Greeter";
import type { JungleRaceStake } from "../src/types/FlattenJungleRaceStake.sol/JungleRaceStake";
import type { JungleRace } from "../src/types/contracts/token.sol/JungleRace";


type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    greeter: Greeter;
    jungleRaceStake :JungleRaceStake;
    jungleRace :JungleRace;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  test1: SignerWithAddress;
  test2: SignerWithAddress;
}
