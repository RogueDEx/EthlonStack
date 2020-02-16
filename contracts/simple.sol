pragma solidity ^0.6.2;

import "openzeppelin/contracts/token/ERC721/ERC721Full.sol";

contract Holder is ERC721Full {
    constructor() ERC721Full("ERC", "ERC") public {
    }
}

