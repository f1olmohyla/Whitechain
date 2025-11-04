// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Item721Base} from "./Item721Base.sol";

/// @title CossackSabre
/// @notice ERC721 representing the crafted item "Шабля козака".
contract CossackSabre is Item721Base {
    constructor(string memory baseUri, address admin)
        Item721Base("Cossack Sabre", "SABRE", baseUri, admin)
    {}
}


