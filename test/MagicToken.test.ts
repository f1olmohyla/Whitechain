import { expect } from "chai";
import { ethers } from "hardhat";

describe("MagicToken", () => {
  it("mints only by MINTER_ROLE", async () => {
    const [admin, market, user] = await ethers.getSigners();
    const Magic = await ethers.getContractFactory("MagicToken");
    const magic = await Magic.deploy(admin.address);
    await magic.waitForDeployment();

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    await expect(magic.connect(user).mint(user.address, 1)).to.be.reverted;
    await (await magic.grantRole(MINTER_ROLE, market.address)).wait();
    await (await magic.connect(market).mint(user.address, 123)).wait();
    expect(await magic.balanceOf(user.address)).to.equal(123n);
  });
});


