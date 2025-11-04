// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Item721Base} from "./Item721Base.sol";

/// @title BattleBracelet
/// @notice ERC721 representing the crafted item "Бойовий браслет".
contract BattleBracelet is Item721Base {
    constructor(string memory baseUri, address admin)
        Item721Base("Battle Bracelet", "BRACELET", baseUri, admin)
    {}
}


