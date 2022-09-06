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
      [15, 90, 80] // Attack damage values
    );
    await gameContract.deployed();
    console.log("Contrato implantado no endereço:", gameContract.address);

    let txn;
    // Só temos três personagens.
    // Uma NFT com personagem no index 2 da nossa array.
    txn = await gameContract.mintCharacterNFT(2);
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
