import { expect } from "chai";
import { ethers } from "hardhat";

describe("ResourceNFT1155", () => {
  it("restricts mint/burn to roles", async () => {
    const [admin, alice, bob] = await ethers.getSigners();
    const Resource = await ethers.getContractFactory("ResourceNFT1155");
    const res = await Resource.deploy("ipfs://res/", admin.address);
    await res.waitForDeployment();

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));

    // No one can mint without role
    await expect(res.connect(alice).mint(alice.address, 0, 1)).to.be.revertedWithCustomError
      .or.to.be.reverted; // role revert phrase can vary by OZ version

    await (await res.grantRole(MINTER_ROLE, admin.address)).wait();
    await (await res.mint(alice.address, 0, 2)).wait();
    expect(await res.balanceOf(alice.address, 0)).to.equal(2n);

    await expect(res.connect(alice).burnFrom(alice.address, 0, 1)).to.be.reverted;
    await (await res.grantRole(BURNER_ROLE, admin.address)).wait();
    await (await res.burnFrom(alice.address, 0, 1)).wait();
    expect(await res.balanceOf(alice.address, 0)).to.equal(1n);
  });
});


