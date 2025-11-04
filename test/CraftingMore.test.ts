import { expect } from "chai";
import { ethers } from "hardhat";

describe("CraftingSearch more recipes", () => {
  it("crafts staff, armor, bracelet", async () => {
    const [admin, player] = await ethers.getSigners();
    const Res = await ethers.getContractFactory("ResourceNFT1155");
    const resources = await Res.deploy("ipfs://res/", admin.address);
    await resources.waitForDeployment();

    const Sabre = await ethers.getContractFactory("CossackSabre");
    const sabre = await Sabre.deploy("ipfs://sabre/", admin.address);
    await sabre.waitForDeployment();
    const Staff = await ethers.getContractFactory("ElderStaff");
    const staff = await Staff.deploy("ipfs://staff/", admin.address);
    await staff.waitForDeployment();
    const Armor = await ethers.getContractFactory("CharacternykArmor");
    const armor = await Armor.deploy("ipfs://armor/", admin.address);
    await armor.waitForDeployment();
    const Bracelet = await ethers.getContractFactory("BattleBracelet");
    const bracelet = await Bracelet.deploy("ipfs://bracelet/", admin.address);
    await bracelet.waitForDeployment();

    const Craft = await ethers.getContractFactory("CraftingSearch");
    const crafting = await Craft.deploy(
      admin.address,
      await resources.getAddress(),
      await sabre.getAddress(),
      await staff.getAddress(),
      await armor.getAddress(),
      await bracelet.getAddress()
    );
    await crafting.waitForDeployment();

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));
    await (await resources.grantRole(MINTER_ROLE, await crafting.getAddress())).wait();
    await (await resources.grantRole(BURNER_ROLE, await crafting.getAddress())).wait();
    for (const item of [sabre, staff, armor, bracelet]) {
      await (await item.grantRole(MINTER_ROLE, await crafting.getAddress())).wait();
    }

    // Helper to fund resources
    await (await resources.grantRole(MINTER_ROLE, admin.address)).wait();
    // Staff: 2 Wood (0), 1 Gold (2), 1 Diamond (5)
    await (await resources.mint(player.address, 0, 2)).wait();
    await (await resources.mint(player.address, 2, 1)).wait();
    await (await resources.mint(player.address, 5, 1)).wait();
    await (await crafting.connect(player).craftElderStaff()).wait();
    expect(await staff.lastMintedTokenId()).to.equal(1n);

    // Armor: 4 Leather (3), 2 Iron (1), 1 Gold (2)
    await (await resources.mint(player.address, 3, 4)).wait();
    await (await resources.mint(player.address, 1, 2)).wait();
    await (await resources.mint(player.address, 2, 1)).wait();
    await (await crafting.connect(player).craftCharacternykArmor()).wait();
    expect(await armor.lastMintedTokenId()).to.equal(1n);

    // Bracelet: 4 Iron (1), 2 Gold (2), 2 Diamond (5)
    await (await resources.mint(player.address, 1, 4)).wait();
    await (await resources.mint(player.address, 2, 2)).wait();
    await (await resources.mint(player.address, 5, 2)).wait();
    await (await crafting.connect(player).craftBattleBracelet()).wait();
    expect(await bracelet.lastMintedTokenId()).to.equal(1n);
  });
});


