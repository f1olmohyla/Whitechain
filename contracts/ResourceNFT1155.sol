// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title ResourceNFT1155
/// @notice ERC1155 contract for base resources used in crafting. Direct mint/burn by users is forbidden.
/// @dev Only accounts with MINTER_ROLE / BURNER_ROLE can mint/burn. Intended callers: Crafting/Search.
contract ResourceNFT1155 is ERC1155, AccessControl {
    /// @notice Role allowed to mint new resource tokens.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /// @notice Role allowed to burn existing resource tokens from player accounts.
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    /// @notice Enum of all resource IDs for convenience.
    enum ResourceId {
        Wood,    // 0
        Iron,    // 1
        Gold,    // 2
        Leather, // 3
        Stone,   // 4
        Diamond  // 5
    }

    /// @param baseUri HTTP(s) base URI for metadata; token id is appended.
    constructor(string memory baseUri, address admin) ERC1155(baseUri) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Mint resources to a player. Only MINTER_ROLE.
    /// @param to Recipient address.
    /// @param id Resource id.
    /// @param amount Amount to mint.
    function mint(address to, uint256 id, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, id, amount, "");
    }

    /// @notice Mint batch of resources to a player. Only MINTER_ROLE.
    function mintBatch(address to, uint256[] calldata ids, uint256[] calldata amounts) external onlyRole(MINTER_ROLE) {
        _mintBatch(to, ids, amounts, "");
    }

    /// @notice Burn resources from a player's account. Only BURNER_ROLE.
    /// @param from Owner whose balance will be reduced.
    /// @param id Resource id.
    /// @param amount Amount to burn.
    function burnFrom(address from, uint256 id, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(from, id, amount);
    }

    /// @notice Burn batch of resources from a player's account. Only BURNER_ROLE.
    function burnBatchFrom(address from, uint256[] calldata ids, uint256[] calldata amounts) external onlyRole(BURNER_ROLE) {
        _burnBatch(from, ids, amounts);
    }

    /// @dev Override to disable direct burns by token holders via ERC1155Burnable pattern.
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
        // No-op: transfer allowed; restriction is on calling burn functions which are not exposed publicly.
    }
}


