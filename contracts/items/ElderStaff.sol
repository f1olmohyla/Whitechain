// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Item721Base} from "./Item721Base.sol";

/// @title ElderStaff
/// @notice ERC721 representing the crafted item "Посох старійшини".
contract ElderStaff is Item721Base {
    constructor(string memory baseUri, address admin)
        Item721Base("Elder Staff", "STAFF", baseUri, admin)
    {}
}


