const main = async () => {
  const gameContractFactory = await hre.ethers.getContractFactory("MyEpicGame");
  const gameContract = await gameContractFactory.deploy(
    ["Homer", "Static Shock", "Choji"],
        [
            "QmZk64ZpHdLrMkcKU23Vz7TgVY86U6Mz4KVmVSUEg8dM22",
            "QmZkzBygUQTkYnD5sVn3edtRrY2xfdf3RAKsaG7DrGH1Rd",
            "Qmf75nh245s5peYxnpRiZN6Hoh8SFf6k62hCUNwgbQmy5X",
        ],
    [10, 70, 90], // HP values
    [15, 90, 80], // Attack damage values
    "Laziness",
    "QmUHx5PTGVyeGHJ8ruLQsVYqYJY6b2ru9Lv1oPwjWAdJU9",
    200,
    40
  );
  await gameContract.deployed();
  console.log("Contrato implantado no endereço:", gameContract.address);

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
