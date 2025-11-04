import { ethers, run, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function tryVerify(address: string, constructorArguments: any[] = []) {
  try {
    await run("verify:verify", { address, constructorArguments });
    console.log(`Verified: ${address}`);
  } catch (err: any) {
    const msg = (err?.message || err?.toString?.() || "").toLowerCase();
    if (msg.includes("already verified") || msg.includes("contract source code already verified")) {
      console.log(`Already verified: ${address}`);
    } else {
      console.warn(`Verification failed for ${address}:`, err?.message || err);
    }
  }
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address} on ${network.name}`);

  const base1155 = process.env.BASE_URI_1155 || "https://example.com/resources/";
  const baseSabre = process.env.BASE_URI_SABRE || "https://example.com/sabre/";
  const baseStaff = process.env.BASE_URI_STAFF || "https://example.com/staff/";
  const baseArmor = process.env.BASE_URI_ARMOR || "https://example.com/armor/";
  const baseBracelet = process.env.BASE_URI_BRACELET || "https://example.com/bracelet/";

  // Deploy ResourceNFT1155
  const Resource = await ethers.getContractFactory("ResourceNFT1155");
  const resources = await Resource.deploy(base1155, deployer.address);
  await resources.waitForDeployment();
  console.log("ResourceNFT1155:", await resources.getAddress());

  // Deploy Items
  const Sabre = await ethers.getContractFactory("CossackSabre");
  const sabre = await Sabre.deploy(baseSabre, deployer.address);
  await sabre.waitForDeployment();
  console.log("CossackSabre:", await sabre.getAddress());

  const Staff = await ethers.getContractFactory("ElderStaff");
  const staff = await Staff.deploy(baseStaff, deployer.address);
  await staff.waitForDeployment();
  console.log("ElderStaff:", await staff.getAddress());

  const Armor = await ethers.getContractFactory("CharacternykArmor");
  const armor = await Armor.deploy(baseArmor, deployer.address);
  await armor.waitForDeployment();
  console.log("CharacternykArmor:", await armor.getAddress());

  const Bracelet = await ethers.getContractFactory("BattleBracelet");
  const bracelet = await Bracelet.deploy(baseBracelet, deployer.address);
  await bracelet.waitForDeployment();
  console.log("BattleBracelet:", await bracelet.getAddress());

  // Deploy MagicToken
  const Magic = await ethers.getContractFactory("MagicToken");
  const magic = await Magic.deploy(deployer.address);
  await magic.waitForDeployment();
  console.log("MagicToken:", await magic.getAddress());

  // Deploy Marketplace
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(deployer.address, await magic.getAddress());
  await marketplace.waitForDeployment();
  console.log("Marketplace:", await marketplace.getAddress());

  // Deploy Crafting/Search
  const Crafting = await ethers.getContractFactory("CraftingSearch");
  const crafting = await Crafting.deploy(
    deployer.address,
    await resources.getAddress(),
    await sabre.getAddress(),
    await staff.getAddress(),
    await armor.getAddress(),
    await bracelet.getAddress()
  );
  await crafting.waitForDeployment();
  console.log("CraftingSearch:", await crafting.getAddress());

  // Grant roles
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));

  // Resource: allow Crafting to mint/burn
  await (await resources.grantRole(MINTER_ROLE, await crafting.getAddress())).wait();
  await (await resources.grantRole(BURNER_ROLE, await crafting.getAddress())).wait();

  // Items: allow Crafting to mint, Marketplace to burn
  for (const item of [sabre, staff, armor, bracelet]) {
    await (await item.grantRole(MINTER_ROLE, await crafting.getAddress())).wait();
    await (await item.grantRole(BURNER_ROLE, await marketplace.getAddress())).wait();
  }

  // MagicToken: allow Marketplace to mint
  await (await magic.grantRole(MINTER_ROLE, await marketplace.getAddress())).wait();

  // Configure Marketplace rewards (example values; adjust as needed)
  const rewardSabre = ethers.parseUnits(process.env.REWARD_SABRE || "100", 18);
  const rewardStaff = ethers.parseUnits(process.env.REWARD_STAFF || "150", 18);
  const rewardArmor = ethers.parseUnits(process.env.REWARD_ARMOR || "220", 18);
  const rewardBracelet = ethers.parseUnits(process.env.REWARD_BRACELET || "280", 18);

  await (await marketplace.setItemReward(await sabre.getAddress(), rewardSabre)).wait();
  await (await marketplace.setItemReward(await staff.getAddress(), rewardStaff)).wait();
  await (await marketplace.setItemReward(await armor.getAddress(), rewardArmor)).wait();
  await (await marketplace.setItemReward(await bracelet.getAddress(), rewardBracelet)).wait();

  // Save addresses
  const addresses = {
    network: network.name,
    resource1155: await resources.getAddress(),
    items: {
      sabre: await sabre.getAddress(),
      staff: await staff.getAddress(),
      armor: await armor.getAddress(),
      bracelet: await bracelet.getAddress(),
    },
    magicToken: await magic.getAddress(),
    marketplace: await marketplace.getAddress(),
    craftingSearch: await crafting.getAddress(),
  };

  const outDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${network.name}.json`), JSON.stringify(addresses, null, 2));
  console.log("Saved deployments to:", path.join(outDir, `${network.name}.json`));

  // Attempt verification (requires explorer config)
  await tryVerify(await resources.getAddress(), [base1155, deployer.address]);
  await tryVerify(await sabre.getAddress(), [baseSabre, deployer.address]);
  await tryVerify(await staff.getAddress(), [baseStaff, deployer.address]);
  await tryVerify(await armor.getAddress(), [baseArmor, deployer.address]);
  await tryVerify(await bracelet.getAddress(), [baseBracelet, deployer.address]);
  await tryVerify(await magic.getAddress(), [deployer.address]);
  await tryVerify(await marketplace.getAddress(), [deployer.address, await magic.getAddress()]);
  await tryVerify(await crafting.getAddress(), [
    deployer.address,
    await resources.getAddress(),
    await sabre.getAddress(),
    await staff.getAddress(),
    await armor.getAddress(),
    await bracelet.getAddress(),
  ]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


