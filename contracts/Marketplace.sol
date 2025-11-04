// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Item721Base} from "./items/Item721Base.sol";
import {MagicToken} from "./MagicToken.sol";

/// @title Marketplace
/// @notice Sells crafted items for MagicToken by burning the item and minting tokens to the seller.
/// @dev There is no external buyer; the marketplace acts as sink for items and source for MagicToken.
contract Marketplace is AccessControl {
    bytes32 public constant CONFIG_ROLE = keccak256("CONFIG_ROLE");

    MagicToken public immutable magic;

    /// @notice Fixed reward (in MAGIC wei) per item contract address.
    mapping(address => uint256) public itemReward;

    event Sold(address indexed seller, address indexed itemContract, uint256 indexed tokenId, uint256 reward);
    event RewardUpdated(address indexed itemContract, uint256 reward);

    /// @param admin Address with DEFAULT_ADMIN_ROLE & CONFIG_ROLE to set rewards.
    /// @param magicToken MagicToken contract to mint rewards.
    constructor(address admin, MagicToken magicToken) {
        magic = magicToken;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CONFIG_ROLE, admin);
    }

    /// @notice Set fixed reward for an item contract.
    function setItemReward(address itemContract, uint256 reward) external onlyRole(CONFIG_ROLE) {
        itemReward[itemContract] = reward;
        emit RewardUpdated(itemContract, reward);
    }

    /// @notice Sell an item: transfer from seller to marketplace, burn it, and mint MAGIC to seller.
    /// @dev Seller must approve marketplace for the token prior to calling.
    function sell(address itemContract, uint256 tokenId) external {
        uint256 reward = itemReward[itemContract];
        require(reward > 0, "no reward");

        // Pull the NFT into escrow
        IERC721(itemContract).safeTransferFrom(msg.sender, address(this), tokenId);

        // Burn via BURNER_ROLE on concrete item contract
        Item721Base(itemContract).burn(tokenId);

        // Mint tokens to seller
        magic.mint(msg.sender, reward);

        emit Sold(msg.sender, itemContract, tokenId, reward);
    }
}


