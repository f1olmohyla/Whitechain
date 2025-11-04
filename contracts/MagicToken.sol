// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title MagicToken
/// @notice ERC20 token minted only by the Marketplace when items are sold. Direct minting is forbidden.
contract MagicToken is ERC20, AccessControl {
    /// @notice Role allowed to mint tokens (Marketplace only).
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @param admin Address granted DEFAULT_ADMIN_ROLE.
    constructor(address admin) ERC20("MagicToken", "MAGIC") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Mint tokens to `to`. Only MINTER_ROLE (Marketplace).
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}


