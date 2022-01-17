//SPDX-License-Identifier: Unlicense
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CyberPunk is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenId;

    constructor() ERC721("Cyber Punk", "CP") {}

    function mintNft(address recepient, string memory tokenUri)
        public
        onlyOwner
        returns (uint256)
    {
        _tokenId.increment();

        uint256 itemId = _tokenId.current();
        _mint(recepient, itemId);
        _setTokenURI(itemId, tokenUri);
        return itemId;
    }
}
