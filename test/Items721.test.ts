import { expect } from "chai";
import { ethers } from "hardhat";

async function deploySabre(admin: string) {
  const F = await ethers.getContractFactory("CossackSabre");
  const c = await F.deploy("ipfs://sabre/", admin);
  await c.waitForDeployment();
  return c;
}

describe("Item721Base", () => {
  it("mints only by MINTER and burns only by BURNER", async () => {
    const [admin, minter, burner, alice] = await ethers.getSigners();
    const sabre = await deploySabre(admin.address);
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));

    await expect(sabre.connect(alice).mintTo(alice.address)).to.be.reverted;
    await (await sabre.grantRole(MINTER_ROLE, minter.address)).wait();
    const tx = await sabre.connect(minter).mintTo(alice.address);
    const receipt = await tx.wait();
    const tokenId = await sabre.lastMintedTokenId();
    expect(await sabre.ownerOf(tokenId)).to.equal(alice.address);

    await expect(sabre.connect(alice).burn(tokenId)).to.be.reverted;
    await (await sabre.grantRole(BURNER_ROLE, burner.address)).wait();
    await (await sabre.connect(burner).burn(tokenId)).wait();
    await expect(sabre.ownerOf(tokenId)).to.be.reverted;
  });
});


