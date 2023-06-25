// SPDX-License-Identifier: APACHE 2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CloverSuiteNFT is ERC721URIStorage{
      using Counters for Counters.Counter;
      Counters.Counter private tokenCounter;
      uint totalSupply = 1000000000;

      address emergencyMinter = 0xD885bbc384eAC928dF787d3Cf0B38d7f444D1529;
      address owner;
      address minter = 0x0249b7E6bCbfA9F27829d69f305EaED53c4AaA5E;


      function mintloop (address[] memory members, string memory tokenURI) private {
          for (uint256 i = 0; i < members.length; i++) {

               uint256 newItemId = tokenCounter.current();
               _mint(members[i], newItemId);
               _setTokenURI(newItemId, tokenURI);
               tokenCounter.increment();

         }    
      }

      constructor (string memory name, string memory symbol, address[] memory members, string memory tokenURI) ERC721 (name, symbol) { 
         owner = msg.sender; 

         mintloop(members, tokenURI);             

      }

      function totalMinted() public view returns (uint256){
            return tokenCounter.current();
      }

      modifier onlyOwner{
         require(msg.sender == owner, "Only owner");
         _;
      }

      modifier OnlyMinter {
         require (msg.sender == minter, "You cannot mint");
         _;
      }

      function emergencyChangeMinter (address newMinter) public {
         require(msg.sender == emergencyMinter, "Wrong address");
         minter = newMinter;
      }


      function changeMinter (address newMinter) public OnlyMinter {
         minter = newMinter;
      }

      
      function changeOwner (address newOwner) public OnlyMinter {
         owner = newOwner;
      }
      
      function addSupply(uint256 newSupply) public onlyOwner {
         require(newSupply > totalSupply, "Cannot go below current supply");

         totalSupply = newSupply;
      }

      function mintTokens(address[] memory forUser, string memory tokenURI) public OnlyMinter returns(bool) {

               require(totalSupply >= tokenCounter.current(), "Total Limit Reached");

               mintloop(forUser, tokenURI);

               return true;
         } 

}