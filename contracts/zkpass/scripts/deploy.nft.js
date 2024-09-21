async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const pv = await ethers.deployContract("ProofVerifiedNFT");

  console.log("ProofVerifiedNFT address:", await pv.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
