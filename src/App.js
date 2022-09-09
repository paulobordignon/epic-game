import React, { useEffect, useState } from "react";
import "./App.css";
import SelectCharacter from "./Components/SelectCharacter";
import { CONTRACT_ADDRESS, transformCharacterData } from "./constants"
import myEpicGame from "./utils/MyEpicGame.json";
import { ethers } from "ethers";
import Arena from './Components/Arena';
import LoadingIndicator from "./Components/LoadingIndicator";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
  
      if (!ethereum) {
        console.log("It looks like you don't have the metamask installed!");
        setIsLoading(false);
        return;
      } else {
        console.log("Ethereum object found:", ethereum);
  
        const accounts = await ethereum.request({ method: "eth_accounts" });
  
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Wallet Connected:", account);
          setCurrentAccount(account);
        } else {
          console.log("No connected wallet found");
        }
      }
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }
  
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://thumbs.gfycat.com/AnchoredPleasedBergerpicard-size_restricted.gif"
            alt="Nascimento Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect wallet
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return (
        <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
      );
    }
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Install MetaMask!");
        return;
      }

      // Method to request access to the account.
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log("Checking for NFT character at address:", currentAccount)
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
      
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log("User has a nft")
        setCharacterNFT(transformCharacterData(txn))
      } else {
        console.log("No nft found")
      }

      setIsLoading(false);
    };
  
    if (currentAccount) {
      console.log("Current account:", currentAccount)
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Metaverse Slayer ⚔️</p>
          <p className="sub-text">Gather your friends and protect the Metaverse!!</p>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;
