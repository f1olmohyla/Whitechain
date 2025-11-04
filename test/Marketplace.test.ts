import { expect } from "chai";
import { ethers } from "hardhat";

describe("Marketplace", () => {
  it("sells item: pulls, burns, mints MAGIC", async () => {
    const [admin, seller] = await ethers.getSigners();

    // Deploy dependencies
    const Magic = await ethers.getContractFactory("MagicToken");
    const magic = await Magic.deploy(admin.address);
    await magic.waitForDeployment();

    const Market = await ethers.getContractFactory("Marketplace");
    const market = await Market.deploy(admin.address, await magic.getAddress());
    await market.waitForDeployment();

    const Sabre = await ethers.getContractFactory("CossackSabre");
    const sabre = await Sabre.deploy("ipfs://sabre/", admin.address);
    await sabre.waitForDeployment();

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));

    await (await magic.grantRole(MINTER_ROLE, await market.getAddress())).wait();
    await (await sabre.grantRole(MINTER_ROLE, admin.address)).wait();
    await (await sabre.grantRole(BURNER_ROLE, await market.getAddress())).wait();

    // Mint sabre to seller
    const mintTx = await sabre.mintTo(seller.address);
    await mintTx.wait();
    const tokenId = await sabre.lastMintedTokenId();

    // Configure reward
    const reward = ethers.parseUnits("100", 18);
    await (await market.setItemReward(await sabre.getAddress(), reward)).wait();

    // Approve and sell
    await (await sabre.connect(seller).approve(await market.getAddress(), tokenId)).wait();
    await (await market.connect(seller).sell(await sabre.getAddress(), tokenId)).wait();

    // Token burned and MAGIC minted
    await expect(sabre.ownerOf(tokenId)).to.be.reverted;
    expect(await magic.balanceOf(seller.address)).to.equal(reward);
  });
});


