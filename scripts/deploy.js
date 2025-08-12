import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const initialSupply = 1_000_000;

  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockusdt = await MockUSDT.deploy(initialSupply);

  await mockusdt.waitForDeployment();

  console.log("MockUSDT deployed to:", mockusdt.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
