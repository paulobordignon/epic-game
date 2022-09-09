// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
import "./libraries/Base64.sol";

// This contract inherits from ERC721, which is the standard NFT contract!
contract MyEpicGame is ERC721 {

  struct CharacterAttributes {
    uint characterIndex;
    string name;
    string imageURI;
    uint hp;
    uint maxHp;
    uint attackDamage;
  }

  // The tokenId is the unique identifier of the NFTs, it is a number that increases, like 0, 1, 2, 3, etc.

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  CharacterAttributes[] defaultCharacters;

  mapping(uint256 => CharacterAttributes) public nftHolderAttributes;

  struct BigBoss {
    string name;
    string imageURI;
    uint hp;
    uint maxHp;
    uint attackDamage;
  }

  BigBoss public bigBoss;

  // A mapping of an address => tokenId of NFTs, gives us an 
  // easy way to store the owner of the NFT and reference it later.
  mapping(address => uint256) public nftHolders;

  event CharacterNFTMinted(address sender, uint256 tokenId, uint256 characterIndex);
  event AttackComplete(uint newBossHp, uint newPlayerHp);

  constructor(
    string[] memory characterNames,
    string[] memory characterImageURIs,
    uint[] memory characterHp,
    uint[] memory characterAttackDmg,
    string memory bossName,
    string memory bossImageURI,
    uint bossHp,
    uint bossAttackDamage
  )
    ERC721("Heroes", "HERO")
  {
    // Initialize the boss. Saves in our global state variable "bigBoss".
    bigBoss = BigBoss({
      name: bossName,
      imageURI: bossImageURI,
      hp: bossHp,
      maxHp: bossHp,
      attackDamage: bossAttackDamage
    });

    console.log("Boss successfully initialized %s with HP %s, img %s", bigBoss.name, bigBoss.hp, bigBoss.imageURI);

    for(uint i = 0; i < characterNames.length; i += 1) {
      defaultCharacters.push(CharacterAttributes({
        characterIndex: i,
        name: characterNames[i],
        imageURI: characterImageURIs[i],
        hp: characterHp[i],
        maxHp: characterHp[i],
        attackDamage: characterAttackDmg[i]
      }));

      CharacterAttributes memory c = defaultCharacters[i];

      // Using hardhat's console.log() allows us 4 parameters in any order of the following types: uint, string, bool, address

      console.log("Initialized character: %s with %s of HP, img %s", c.name, c.hp, c.imageURI);
    }

    // I incremented tokenIds here so that my first NFT has ID 1.
    _tokenIds.increment();
  }

  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    CharacterAttributes memory charAttributes = nftHolderAttributes[_tokenId];

    string memory strHp = Strings.toString(charAttributes.hp);
    string memory strMaxHp = Strings.toString(charAttributes.maxHp);
    string memory strAttackDamage = Strings.toString(charAttributes.attackDamage);

    string memory json = Base64.encode(
      bytes(
        string(
          abi.encodePacked(
            '{"name": "',
            charAttributes.name,
            ' -- NFT #: ',
            Strings.toString(_tokenId),
            '", "description": "An epic NFT", "image": "ipfs://',
            charAttributes.imageURI,
            '", "attributes": [ { "trait_type": "Health Points", "value": ',strHp,', "max_value":',strMaxHp,'}, { "trait_type": "Attack Damage", "value": ',
            strAttackDamage,'} ]}'
          )
        )
      )
    );

    string memory output = string(
      abi.encodePacked("data:application/json;base64,", json)
    );

    return output;
  }

  function attackBoss() public {
    // Get the player's NFT status.
    uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
    CharacterAttributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];

    console.log("\nPlayer with character %s will attack. He have %s of HP and %s of PA", player.name, player.hp, player.attackDamage);
    console.log("Boss %s have %s of HP and %s of PA", bigBoss.name, bigBoss.hp, bigBoss.attackDamage);

    // Checks if the player's hp is greater than 0.
    require (
      player.hp > 0,
      "Error: character must have HP to attack the boss."
    );

    // Check that the boss's hp is greater than 0.
    require (
      bigBoss.hp > 0,
      "Error: Boss must have HP to be attacked."
    );

    // Allows the player to attack the boss.
    if (bigBoss.hp < player.attackDamage) {
      bigBoss.hp = 0;
    } else {
      bigBoss.hp = bigBoss.hp - player.attackDamage;
    }

    // Allows the boss to attack the player.
    if (player.hp < bigBoss.attackDamage) {
      player.hp = 0;
    } else {
      player.hp = player.hp - bigBoss.attackDamage;
    }

    emit AttackComplete(bigBoss.hp, player.hp);
    console.log("Player attacked the boss. Boss got HP: %s", bigBoss.hp);
    console.log("Boss attacked the player. Player got hp: %s\n", player.hp);
  }

  // Users will be able to use this function and get the NFT based on the character they send!
  function mintCharacterNFT(uint _characterIndex) external {
    // Get the current tokenId (starts at 1 as we increment in the constructor).
    uint256 newItemId = _tokenIds.current();

    // Assigns the tokenID to the wallet address of the caller of the contract.

    _safeMint(msg.sender, newItemId);

    // We mapped the tokenId => the attributes of the characters. More of that below

    nftHolderAttributes[newItemId] = CharacterAttributes({
      characterIndex: _characterIndex,
      name: defaultCharacters[_characterIndex].name,
      imageURI: defaultCharacters[_characterIndex].imageURI,
      hp: defaultCharacters[_characterIndex].hp,
      maxHp: defaultCharacters[_characterIndex].maxHp,
      attackDamage: defaultCharacters[_characterIndex].attackDamage
    });

    console.log("Minted NFT with tokenId %s and characterIndex %s", newItemId, _characterIndex);

    // Keeps an easy way to see who owns the NFT
    nftHolders[msg.sender] = newItemId;

    _tokenIds.increment();

    emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);
  }

  function checkIfUserHasNFT() public view returns (CharacterAttributes memory) {
  // Get the user's NFT character tokenId
  uint256 userNftTokenId = nftHolders[msg.sender];
  // If the user has a tokenId on the map, return his character
  if (userNftTokenId > 0) {
      return nftHolderAttributes[userNftTokenId];
  }
  else {
      CharacterAttributes memory emptyStruct;
      return emptyStruct;
    }
  }

  function getAllDefaultCharacters() public view returns (CharacterAttributes[] memory) {
    return defaultCharacters;
  }

  function getBigBoss() public view returns (BigBoss memory) {
    return bigBoss;
  }
}
