// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Item721Base} from "./Item721Base.sol";

/// @title CharacternykArmor
/// @notice ERC721 representing the crafted item "Броня характерника".
contract CharacternykArmor is Item721Base {
    constructor(string memory baseUri, address admin)
        Item721Base("Characternyk Armor", "ARMOR", baseUri, admin)
    {}
}


