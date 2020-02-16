pragma solidity ^0.5.15;

import "openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "lib/AddressUtils.sol";
import "lib/cloner.sol";
import "IRogueObject.sol";


contract rogueHolder is ERC721Full {
  event Trade2( address indexed _alice, address indexed _bob,
                address _aliceOWO,  address _bobOWO,
                address _Xs, address _Ys,
                uint256 _XAmount, uint256 _YAmount);
  mapping(address => address) public clonedFrom;

  constructor() ERC721Full("Rogue Holder", "RHLDR") public {
  }

  /* The approval array is :
     0 seller, 
     1 sendingTo (a wallet), 
     2 Haves (What is being sent),
     3 Wants (what should come back), 
     4 Amount to send
     5 Amount that should come back
     6 Current balance of wants
     7 current block number
     8 status
     */

  /**
   * @param _a Alice''s OWO.
   * param _rowA Order row in Alice''s OWO.
   * @param _b Bob''s OWO.
   * param _rowB Order row in Bob''s OWO.
   *
   * Cost Model: 4 * STOREREAD      //= 800
   *            + 2* (Approval + verify)      //=  2*(30,000-14,500) = 29,000 
   *            + 2* execute        //=  between 2*13,000 and 2*28,000 = 26,000 and 56,000    (55, 85)
   *            + 6*call + log      //=~ 6*1100 + 1200 =~ 8000
   *            =~ between 64,000 and 94,000
   */

  function resolve(address _a, uint32 _rowA, address _b, uint32 _rowB) external returns (uint256 status) {
    require(ownerOf(uint256(_a)) == ownerOf(uint256(_b)) );

    uint256[9] memory Alice = IRogueObject(_a).approveAsAlice(_a, _rowA, _b, _rowB);

    if ( Alice[8] != 0)
        return Alice[8];

    uint256[9] memory Bob   = IRogueObject(_b).approveAsBob(  _a, _rowA, _b, _rowB);

    if ( Bob[8] != 0)
        return Bob[8];

    require( Alice[2] == Bob[3] && Alice[3] == Bob[2] && Alice[4] == Bob[5] && Alice[5] == Bob[4]);

    IRogueObject(_a).executeTrade(Alice);
    IRogueObject(_b).executeTrade(Bob);

    IRogueObject(_a).verifyTrade(Alice);
    IRogueObject(_b).verifyTrade(Bob);

        //emit Trade2(alice, bob, _a, _b, AXs, AYs, AXAmount, AYAmount);
    emit Trade2(address(Alice[0]), address(Bob[0]), _a, _b, address(Alice[2]), address(Bob[2]), Alice[4], Bob[4]);

    return 0;
  }

  /**
   * @dev if _contract is a clone factory then it should be cloning from a *static* address,
   *      not a dynamic or changable one, in order to prevent the actual code associated with
   *      a token changing without the knowlage of the user or owner!
   * @param _contract the address of the cloner shim contract that will create the object
   *                  that is to be tracked.
   */
  function mintObject(address _contract) external {
    address obj = clonerInterface(_contract).clone(msg.sender);
    clonedFrom[obj] = _contract;
    _mint(msg.sender, uint256(obj));
  }

  /**
   * @param _tokenId the token Id to disassociate.
   */
/*
  function burnObject(uint256 _tokenId) external onlyOwnerOf(_tokenId) {
    address obj = address(_tokenId);
    require( IRogueObject(obj).disassociate() );
    delete clonedFrom[obj];
    _burn(msg.sender, _tokenId);
  }
 */
}

