<strong> About </strong>

Epic game is nft game where each nft has properties like attack and health. Each wallet address can have only one nft. You can choose one of three characters and the objective is to defeat the boss with your friends. The contract was deployed on Goerli network.

See the contract on opensea: https://testnets.opensea.io/collection/heroes-rtdswiwmlz

Etherscan: https://goerli.etherscan.io/address/0xd8aaffa175cdd7a285190f0adef43f68bf48b1ca

<strong> Execution </strong>

1 - To initialize a new contract I runed:

`mkdir epic-game`

`cd epic-game`

`npm init -y`

`npm install --save-dev hardhat@2.9.9`

`npx hardhat`

and added a new basic project;

2 - To make a contract deploy on a local network I ran:

`npx hardhat run scripts/sample-script.js`

3 - To make the deployment on Goerli, first, create an account on Alchemy and create a new project, then fill the project key on .env also fill your wallet private key and after:

`npx hardhat run scripts/deploy.js --network goerli`

4 - Then fill out in constants.js the contract address and:

`npm install`

`npm start`


Ps: The project images were uploaded on pinata, an ipfs provider.

This project is a web3dev Bootcamp
