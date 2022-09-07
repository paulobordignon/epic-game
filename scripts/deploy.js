const main = async () => {
  const gameContractFactory = await hre.ethers.getContractFactory("MyEpicGame");
  const gameContract = await gameContractFactory.deploy(
    ["Homer", "Static Shock", "Choji"],
        [
            "https://i.imgur.com/y9dH2bJ.jpeg",
            "https://i.imgur.com/bpJzFOM.png",
            "https://i.imgur.com/GbWU1wR.png",
        ],
    [10, 70, 90], // HP values
    [15, 90, 80], // Attack damage values
    "Laziness",
    "https://i.imgur.com/nSGZ0y1.jpeg",
    200,
    40
  );
  await gameContract.deployed();
  console.log("Contrato implantado no endereço:", gameContract.address);

  let txn;
  txn = await gameContract.mintCharacterNFT(2);
  await txn.wait();

  txn = await gameContract.attackBoss();
  await txn.wait();

  txn = await gameContract.attackBoss();
  await txn.wait();

  // Pega o valor da URI da NFT
  let returnedTokenUri = await gameContract.tokenURI(1);
  console.log("Token URI:", returnedTokenUri);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
