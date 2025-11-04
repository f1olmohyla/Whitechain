// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title Item721Base
/// @notice Base ERC721 for in-game crafted items. Minting only by crafting; burning only by marketplace.
abstract contract Item721Base is ERC721, AccessControl {
    using Strings for uint256;

    /// @notice Role allowed to mint new items (Crafting/Search).
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /// @notice Role allowed to burn items during sale (Marketplace only).
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    uint256 private _nextTokenId = 1;
    string private _baseTokenURI;

    /// @param name_ Token name.
    /// @param symbol_ Token symbol.
    /// @param baseTokenURI_ Base URI for token metadata.
    /// @param admin Admin to manage roles.
    constructor(string memory name_, string memory symbol_, string memory baseTokenURI_, address admin)
        ERC721(name_, symbol_)
    {
        _baseTokenURI = baseTokenURI_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Mint a new item to `to`. Only MINTER_ROLE.
    /// @return tokenId Newly minted token id.
    function mintTo(address to) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    /// @notice Burn an item by id. Only BURNER_ROLE.
    /// @dev Marketplace should transfer the token to itself before burning, to assert seller consent via approval.
    function burn(uint256 tokenId) external onlyRole(BURNER_ROLE) {
        _burn(tokenId);
    }

    /// @inheritdoc ERC721
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @notice Total minted so far (including burned tokens).
    function lastMintedTokenId() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}


