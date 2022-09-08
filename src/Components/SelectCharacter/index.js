import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";

/*
 * Não se preocupe com setCharacterNFT ainda, vamos falar dele logo.
 */
const SelectCharacter = ({ setCharacterNFT }) => {
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);

    const mintCharacterNFTAction = (characterId) => async () => {
        try {
          if (gameContract) {
            console.log("Mintando personagem...");
            const mintTxn = await gameContract.mintCharacterNFT(characterId);
            await mintTxn.wait();
            console.log("mintTxn:", mintTxn);
          }
        } catch (error) {
          console.warn("MintCharacterAction Error:", error);
        }
    };
  
    useEffect(() => {
        const getCharacters = async () => {
          try {
            console.log("Trazendo personagens do contrato para mintar");
      
            const charactersTxn = await gameContract.getAllDefaultCharacters();
            console.log("charactersTxn:", charactersTxn);
      
            const characters = charactersTxn.map((characterData) =>
              transformCharacterData(characterData)
            );
      
            setCharacters(characters);
          } catch (error) {
            console.error("Algo deu errado ao trazer personagens:", error);
          }
        };
      
        /*
         * Adiciona um método callback que vai disparar quando o evento for recebido
         */
        const onCharacterMint = async (sender, tokenId, characterIndex) => {
          console.log(
            `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
          );
      
          /*
           * Uma vez que nosso personagem for mintado, podemos buscar os metadados a partir do nosso contrato e configurar no estado para se mover para a Arena.
           */
          if (gameContract) {
            const characterNFT = await gameContract.checkIfUserHasNFT();
            console.log("CharacterNFT: ", characterNFT);
            setCharacterNFT(transformCharacterData(characterNFT));
          }
        };
      
        if (gameContract) {
          getCharacters();
      
          /*
           * Configurar NFT Minted Listener
           */
          gameContract.on("CharacterNFTMinted", onCharacterMint);
        }
      
        return () => {
          /*
           * Quando seu componente se desmonta, vamos limpar esse listener
           */
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
      
          /*
           * Essa é a grande diferença. Configura nosso gameContract no estado.
           */
          setGameContract(gameContract);
        } else {
          console.log("Objeto Ethereum não encontrado");
        }
    }, []);

    const renderCharacters = () =>
    characters.map((character, index) => (
        <div className="character-item" key={character.name}>
        <div className="name-container">
            <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name} />
        <button
            type="button"
            className="character-mint-button"
            onClick={mintCharacterNFTAction(index)} 
            // você deve descomentar essa linha depois que criar a função mintCharacterNFTAction
        >{`Mintar ${character.name}`}</button>
        </div>
    ));

    return (
        <div className="select-character-container">
          <h2>Minte seu Herói. Escolha com sabedoria.</h2>
          {/* Só mostra isso se tiver personagens no estado
           */}
          {characters.length > 0 && (
            <div className="character-grid">{renderCharacters()}</div>
          )}
        </div>
    );
};
  
export default SelectCharacter;
