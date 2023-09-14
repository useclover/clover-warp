// SPDX-License-Identifier: APACHE 2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CloverSuiteNFT is ERC721URIStorage{
      using Counters for Counters.Counter;
      Counters.Counter private tokenCounter;
      uint totalSupply = 1000000000;

      string version = "2.10";

      address emergencyMinter = 0xD885bbc384eAC928dF787d3Cf0B38d7f444D1529;
      address owner;
      address minter = 0x0249b7E6bCbfA9F27829d69f305EaED53c4AaA5E;

      mapping(address => uint[]) public voter;

      struct Votes {
            uint[] options;
      }

      Votes[] private polls;

      uint256 public pollCount = 0;


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

      function createVote (uint256[] memory options) public returns(uint256) {

         require(this.balanceOf(msg.sender) > 0, "You cannot vote");

         polls.push(Votes({
            options: options
         }));


         pollCount = pollCount + 1;

         return pollCount;

      }

      // function remakeVote (address user, uint256 poll, uint256 ooption, uint256 noption) public returns(bool) {

      //    require(voter[user][poll] == 1);

      //    require(voter[user][poll] < polls[poll].options.length, "Invalid option");

      //    require(this.balanceOf(user) > 0, "You cannot vote");


      //    polls[poll].options[ooption]--;

      //    polls[poll].options[noption]++;
         
      //    return true;

      // }

      function viewVotes (uint256 poll) public view returns(uint[] memory) {
             return polls[poll].options;
      }
      
      function makeVote (uint256 poll, uint256 option) public returns(bool) {

         for (uint i = 0; i < voter[msg.sender].length; i++) {
            if (voter[msg.sender][i] == poll) {
                revert("Already voted");
            }

            if (option >= polls[poll].options.length) {
                revert("Invalid option");
            }
        }

         voter[msg.sender].push(poll);

         polls[poll].options[option]++;

         return true;
         
      }

      function mintTokens(address[] memory forUser, string memory tokenURI) public OnlyMinter returns(bool) {

               require(totalSupply >= tokenCounter.current(), "Total Limit Reached");

               mintloop(forUser, tokenURI);

               return true;
         } 

   }  