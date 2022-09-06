// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// Contrato NFT para herdar.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Funcoes de ajuda que o OpenZeppelin providencia.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


import "hardhat/console.sol";

// Nosso contrato herda do ERC721, que eh o contrato padrao de
// NFT!
contract MyEpicGame is ERC721 {

  struct CharacterAttributes {
    uint characterIndex;
    string name;
    string imageURI;
    uint hp;
    uint maxHp;
    uint attackDamage;
  }

  // O tokenId eh o identificador unico das NFTs, eh um numero
  // que vai incrementando, como 0, 1, 2, 3, etc.

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  CharacterAttributes[] defaultCharacters;

  // Criamos um mapping do tokenId => atributos das NFTs.
  mapping(uint256 => CharacterAttributes) public nftHolderAttributes;

  // Um mapping de um endereco => tokenId das NFTs, nos da um
  // jeito facil de armazenar o dono da NFT e referenciar ele
  // depois.
  mapping(address => uint256) public nftHolders;

  constructor(
    string[] memory characterNames,
    string[] memory characterImageURIs,
    uint[] memory characterHp,
    uint[] memory characterAttackDmg
    // Embaixo, voce tambem pode ver que adicionei um simbolo especial para identificar nossas NFTs
    // Esse eh o nome e o simbolo do nosso token, ex Ethereum ETH.
    // Eu chamei o meu de Heroes e HERO. Lembre-se, um NFT eh soh um token!
  )
    ERC721("Heroes", "HERO")
  {
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

      // O uso do console.log() do hardhat nos permite 4 parametros em qualquer order dos seguintes tipos: uint, string, bool, address

      console.log("Personagem inicializado: %s com %s de HP, img %s", c.name, c.hp, c.imageURI);
    }

    // Eu incrementei tokenIds aqui para que minha primeira NFT tenha o ID 1.
    // Mais nisso na aula!
    _tokenIds.increment();
  }

  // Usuarios vao poder usar essa funcao e pegar a NFT baseado no personagem que mandarem!
  function mintCharacterNFT(uint _characterIndex) external {
    // Pega o tokenId atual (começa em 1 já que incrementamos no constructor).
    uint256 newItemId = _tokenIds.current();

    // A funcao magica! Atribui o tokenID para o endereço da carteira de quem chamou o contrato.

    _safeMint(msg.sender, newItemId);

    // Nos mapeamos o tokenId => os atributos dos personagens. Mais disso abaixo

    nftHolderAttributes[newItemId] = CharacterAttributes({
      characterIndex: _characterIndex,
      name: defaultCharacters[_characterIndex].name,
      imageURI: defaultCharacters[_characterIndex].imageURI,
      hp: defaultCharacters[_characterIndex].hp,
      maxHp: defaultCharacters[_characterIndex].maxHp,
      attackDamage: defaultCharacters[_characterIndex].attackDamage
    });

    console.log("Mintou NFT c/ tokenId %s e characterIndex %s", newItemId, _characterIndex);

    // Mantem um jeito facil de ver quem possui a NFT
    nftHolders[msg.sender] = newItemId;

    // Incrementa o tokenId para a proxima pessoa que usar.
    _tokenIds.increment();
  }
}
