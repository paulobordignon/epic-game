import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import LoadingIndicator from "../LoadingIndicator";

const SelectCharacter = ({ setCharacterNFT }) => {
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);
    const [mintingCharacter, setMintingCharacter] = useState(false);

    const mintCharacterNFTAction = (characterId) => async () => {
        try {
          if (gameContract) {
            setMintingCharacter(true);
            console.log("Minting character...");
            const mintTxn = await gameContract.mintCharacterNFT(characterId);
            await mintTxn.wait();
            console.log(mintTxn);
            // Hide loading indicator when mint is finished
            setMintingCharacter(false);
          }
        } catch (error) {
          console.warn("Minting error: ", error);
          setMintingCharacter(false);
        }
    };
  
    useEffect(() => {
        const getCharacters = async () => {
          try {
            console.log("Bringing Contract Characters to mint");
      
            const charactersTxn = await gameContract.getAllDefaultCharacters();
            console.log("charactersTxn:", charactersTxn);
      
            const characters = charactersTxn.map((characterData) =>
              transformCharacterData(characterData)
            );
      
            setCharacters(characters);
          } catch (error) {
            console.error("Error during get characters:", error);
          }
        };

        const onCharacterMint = async (sender, tokenId, characterIndex) => {
          console.log(
            `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
          );
      
          // Once the character is minted, we can fetch the metadata from our contract and set it in the state to move to the Arena.
          if (gameContract) {
            const characterNFT = await gameContract.checkIfUserHasNFT();
            console.log("CharacterNFT: ", characterNFT);
            setCharacterNFT(transformCharacterData(characterNFT));
          }
        };
      
        if (gameContract) {
          getCharacters();
          gameContract.on("CharacterNFTMinted", onCharacterMint);
        }
      
        return () => {
          // When your component dismounts, let's clean this listener
          if (gameContract) {
            gameContract.off("CharacterNFTMinted", onCharacterMint);
          }
        };
    }, [gameContract]);
    
    useEffect(() => {
        const { ethereum } = window;
      
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const gameContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            myEpicGame.abi,
            signer
          );
      
          //Sets our gameContract on state.
          setGameContract(gameContract);
        } else {
          console.log("Ethereum was not found");
        }
    }, []);

    const renderCharacters = () =>
    characters.map((character, index) => (
        <div className="character-item" key={character.name}>
        <div className="name-container">
            <p>{character.name}</p>
        </div>
        <img src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`} alt={character.name} />
        <button
            type="button"
            className="character-mint-button"
            onClick={mintCharacterNFTAction(index)} 
        >{`Mint ${character.name}`}</button>
        </div>
    ));

    return (
        <div className="select-character-container">
          <h2>Mint your hero. Choose wisely.</h2>
          {characters.length > 0 && (
            <div className="character-grid">{renderCharacters()}</div>
          )}
          {mintingCharacter && (
            <div className="loading">
              <div className="indicator">
                <LoadingIndicator />
                <p>Minting character...</p>
              </div>
              <img
                src="http://pa1.narvii.com/6623/1d810c548fc9695d096d54372b625d207373130a_00.gif"
                alt="Indicador de Mintagem"
              />
            </div>
          )}
        </div>
    );
};
  
export default SelectCharacter;
