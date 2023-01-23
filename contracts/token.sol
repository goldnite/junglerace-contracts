// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract JungleRace is ERC20 {
    constructor()
         ERC20("Jungle Race", "JRG") {
            _mint(msg.sender, 1 * (10 ** uint256(18)) * (10 ** uint256(18)));
        }
}