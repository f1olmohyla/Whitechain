// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ResourceNFT1155} from "./ResourceNFT1155.sol";
import {CossackSabre} from "./items/CossackSabre.sol";
import {ElderStaff} from "./items/ElderStaff.sol";
import {CharacternykArmor} from "./items/CharacternykArmor.sol";
import {BattleBracelet} from "./items/BattleBracelet.sol";

/// @title CraftingSearch
/// @notice Contract enabling players to search for resources and craft items. The only minter for items and resources.
contract CraftingSearch is AccessControl {
    /// @notice Cooldown for search in seconds.
    uint256 public constant SEARCH_COOLDOWN = 60;

    ResourceNFT1155 public immutable resources;
    CossackSabre public immutable sabre;
    ElderStaff public immutable staff;
    CharacternykArmor public immutable armor;
    BattleBracelet public immutable bracelet;

    /// @notice Last search timestamp per player.
    mapping(address => uint256) public lastSearchAt;

    /// @param admin Address with DEFAULT_ADMIN_ROLE to manage roles on external contracts if needed.
    constructor(
        address admin,
        ResourceNFT1155 resources_,
        CossackSabre sabre_,
        ElderStaff staff_,
        CharacternykArmor armor_,
        BattleBracelet bracelet_
    ) {
        resources = resources_;
        sabre = sabre_;
        staff = staff_;
        armor = armor_;
        bracelet = bracelet_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Search for 3 random resources once per cooldown period.
    /// @dev Pseudo-randomness based on block data is acceptable for testnet gameplay.
    function search() external {
        uint256 last = lastSearchAt[msg.sender];
        require(block.timestamp >= last + SEARCH_COOLDOWN, "cooldown");
        lastSearchAt[msg.sender] = block.timestamp;

        // Pseudo-random: derive three resource ids in [0,5]
        uint256 seed = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), msg.sender, last)));
        uint256 id1 = seed % 6;
        uint256 id2 = (seed >> 32) % 6;
        uint256 id3 = (seed >> 64) % 6;

        uint256[] memory ids = new uint256[](3);
        ids[0] = id1; ids[1] = id2; ids[2] = id3;
        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 1; amounts[1] = 1; amounts[2] = 1;
        resources.mintBatch(msg.sender, ids, amounts);
    }

    /// @notice Craft "Шабля козака" by burning required resources and minting the item.
    /// @return tokenId Newly minted sabre token id.
    function craftCossackSabre() external returns (uint256 tokenId) {
        // 3× Iron (1), 1× Wood (0), 1× Leather (3)
        resources.burnFrom(msg.sender, uint256(ResourceNFT1155.ResourceId.Iron), 3);
        resources.burnFrom(msg.sender, uint256(ResourceNFT1155.ResourceId.Wood), 1);
        resources.burnFrom(msg.sender, uint256(ResourceNFT1155.ResourceId.Leather), 1);
        tokenId = sabre.mintTo(msg.sender);
    }

    /// @notice Craft "Посох старійшини" by burning required resources and minting the item.
    function craftElderStaff() external returns (uint256 tokenId) {
        // 2× Wood (0), 1× Gold (2), 1× Diamond (5)
        resources.burnFrom(msg.sender, uint256(ResourceNFT1155.ResourceId.Wood), 2);
        resources.burnFrom(msg.sender, uint256(ResourceNFT1155.ResourceId.Gold), 1);
        resources.burnFrom(msg.sender, uint256(ResourceNFT1155.ResourceId.Diamond), 1);
        tokenId = staff.mintTo(msg.sender);
    }

    /// @notice Craft optional "Броня характерника".
    function craftCharacternykArmor() external returns (uint256 tokenId) {
        // 4× Leather (3), 2× Iron (1), 1× Gold (2)
        resources.burnFrom(msg.sender, uint256(ResourceNFT1155.ResourceId.Leather), 4);
        resources.burnFrom(msg.sender, uint256(ResourceNFT1155.ResourceId.Iron), 2);
        resources.burnFrom(msg.sender, uint256(ResourceNFT1155.ResourceId.Gold), 1);
        tokenId = armor.mintTo(msg.sender);
    }

    /// @notice Craft optional "Бойовий браслет".
    function craftBattleBracelet() external returns (uint256 tokenId) {
        // 4× Iron (1), 2× Gold (2), 2× Diamond (5)
        resources.burnFrom(msg.sender, uint256(ResourceNFT1155.ResourceId.Iron), 4);
        resources.burnFrom(msg.sender, uint256(ResourceNFT1155.ResourceId.Gold), 2);
        resources.burnFrom(msg.sender, uint256(ResourceNFT1155.ResourceId.Diamond), 2);
        tokenId = bracelet.mintTo(msg.sender);
    }
}


