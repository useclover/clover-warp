// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const Share = await hre.ethers.getContractFactory("CloverSuiteNFT");
  const share = await Share.deploy("JOEL", "JOEL", ["0x50794C749F6E0622e69c72F79f370E9ca7859539"], "https://ipfs.io/ipfs");

  await share.deployed();

  console.log("Contract deployed to:", share.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
