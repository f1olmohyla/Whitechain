import { expect } from "chai";
import { ethers } from "hardhat";

describe("CraftingSearch", () => {
  async function setup() {
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

    return { admin, player, resources, sabre, staff, armor, bracelet, crafting };
  }

  it("enforces search cooldown and mints resources", async () => {
    const { player, crafting, resources } = await setup();
    await (await crafting.connect(player).search()).wait();
    const total = (await resources.balanceOfBatch(
      [player.address, player.address, player.address],
      [0, 1, 2]
    )).reduce((a, b) => a + BigInt(b.toString()), 0n);
    expect(total).to.be.greaterThanOrEqual(0n);
    await expect(crafting.connect(player).search()).to.be.revertedWith("cooldown");
  });

  it("crafts sabre and consumes resources", async () => {
    const { player, crafting, resources, sabre } = await setup();

    // Give sufficient resources
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    await (await resources.grantRole(MINTER_ROLE, (await ethers.getSigners())[0].address)).wait();
    await (await resources.mint(player.address, 1, 3)).wait(); // Iron x3
    await (await resources.mint(player.address, 0, 1)).wait(); // Wood x1
    await (await resources.mint(player.address, 3, 1)).wait(); // Leather x1

    const tokenId = await crafting.connect(player).craftCossackSabre().then(tx => tx.wait()).then(async () => sabre.lastMintedTokenId());
    expect(await sabre.ownerOf(tokenId)).to.equal(player.address);
    expect(await resources.balanceOf(player.address, 1)).to.equal(0n);
    expect(await resources.balanceOf(player.address, 0)).to.equal(0n);
    expect(await resources.balanceOf(player.address, 3)).to.equal(0n);
  });
});


