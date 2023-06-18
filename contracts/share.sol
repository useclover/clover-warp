// SPDX-License-Identifier: APACHE 2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SimpleNFT is ERC721URIStorage{
      using Counters for Counters.Counter;
      Counters.Counter private tokenCounter;
      uint totalSupply = 100000;
      address owner;
      constructor() ERC721("Clover FS", "CFS") { 
         owner = msg.sender;
      }

      function totalMinted() public view returns (uint256){
            return tokenCounter.current();
      }

      modifier onlyOwner{
         require(msg.sender == owner, "Only owner");
         _;
      }

      
      function addSupply(uint256 add) public onlyOwner {
         totalSupply = totalSupply + add;
      }

      function mintTokens(address[] memory forUser, string memory tokenURI) public returns(bool) {

               require(totalSupply >= tokenCounter.current(), "Total Limit Reached");

               for (uint256 i = 0; i < forUser.length; i++) {

                  uint256 newItemId = tokenCounter.current();
                  _mint(forUser[i], newItemId);
                  _setTokenURI(newItemId, tokenURI);

                  tokenCounter.increment();

               }

               return true;
         } 
}