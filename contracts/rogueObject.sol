pragma solidity ^0.5.15;

import "lib/hashOneTimeSemaphore.sol";
import "lib/rational.sol";
import "lib/MUtils.sol";

import "openzeppelin/contracts/token/ERC721/IERC721.sol";
import "openzeppelin/contracts/token/ERC20/IERC20.sol";
import "lib/cloner.sol";

contract rogueObject {
    using rational for uint256;

    event Disassociate(address indexed self, address indexed tokenAdmin,
                        address indexed seller);

    struct orderRow {
       address haves;       // 160 Address of the token to sell
       uint96  askPriceD;   //  96 ask price denominator  (wants per have)
       address wants;       // 160 Address of the token to buy
       uint96  askPriceN;   //  96 ask price numerator  (wants per have)
       uint256 wantsTotal;  // 256 The total amount of wants wanted.
       address nextAddr;    // 160 address of the wallet of the next order in list
       int32   nextInx;     //  32 index in the wallet of the next order in list.
       bool    notInUse;    //   1 Mark this order as deleted and reusable.
    }

    using hashOneTimeSemaphore for hashOneTimeSemaphore.t;

    hashOneTimeSemaphore.t transactionSemaphore;

    // controller and seller cannot be changed.
    address public controller; // 160 The admin contract of the token managing this.
    address public seller;     // 160 The initial and final owner.

    uint32 public inception;  //  32 time at which orders become active.
    uint32 public expiration; //  32 time at which orders expires.
    
    orderRow[] public orders;  // The array of orders to be matched.

    constructor(address _seller, address _controller) public {
        controller = _controller;
        seller = _seller;
    }

    /**
     * @dev The wallet is locked if the current owner is not the seller. It is not locked
     * if the owner is the seller or it has been dissacosiated.
     */
    function notLocked() internal view returns (bool) {
        return address(0) == controller || IERC721(controller).ownerOf(uint256(address(this))) == seller;
    }

    /**
     * @dev some calls can only come from the controling token, if the object has been
     * disasociated then those calls can come from the seller.
     */
    function onlyController() internal view returns (bool) {
        return( msg.sender == controller || (address(0) == controller && msg.sender == seller) );
    }
  
    function disassociate() external returns (bool) {
        require( notLocked() );
        require( onlyController() );
        controller = address(0);

        emit Disassociate(address(this), msg.sender, seller);
        return true;
    } 
    /**
     * @param _inception unix UTC time at which this order row becomes valid.
     * @param _expiration unix UTC time at which this order row becomes invalid.
     * @dev a value of '0' mean 'now' where now is the time of the previous mined block,
     *      that is, 'now' has always just happened.
     */ 
    function setTimes(uint32 _inception, uint32 _expiration) external {
        require(notLocked());
        require(msg.sender == seller);
        if (inception != _inception)
            inception = _inception;

        if(expiration != _expiration) 
            expiration = _expiration;
    }

   /**
    * @param _row Order row to retrive
    * @dev getter for order rows because of solidity structure issues.
    * @dev Returns order row members required for resolving trades.
    */

   function getOrderRow(uint256 _row) public view 
       returns (uint256[5] memory z)
       {
       orderRow storage x = orders[_row];

       if (x.notInUse){
          z[0] = uint256(0);
          z[1] = uint256(0);
          z[2] = uint256(0);
          z[3] = uint256(0);
          z[4] = uint256(0);
          return z;
       }

       z[0] = uint256(x.haves);
       z[1] = uint256(x.wants);
       z[2] = uint256(x.askPriceN);
       z[3] = uint256(x.askPriceD);
       z[4] = x.wantsTotal;

       return z;
   }


    /**
     * @param _rowNum the row number to update. To add a row, use a _rowNum that is equal to the
     *        current length (that is the one-passed-the-end index).
     * @param _haves Address of the token to buy cast to an int256. a -1 or the contract address means Ether. 
     * @param _wants Address of the token to sell cast to an int256. a -1  or the contract addressmeans Ether.
     * @param _askPriceN the neumerator of the ask price in wants per have
     * @param _askPriceD the denominator of the ask price in wants per have
     * @param _wantsTotal the total amount of wants desired.
     */
    function updateRow(uint32 _rowNum, int256 _haves, int256 _wants, uint96 _askPriceN,
                       uint96 _askPriceD, uint256 _wantsTotal) external {
        require(notLocked());
        require(msg.sender == seller);
        address haves;
        address wants;

        if (_haves == -1 )
            haves = address(this);
        else
            haves = address(_haves);

        if (_wants == -1 )
            wants = address(this);
        else
            wants = address(_wants);

        if (_rowNum == orders.length)
            orders.push( orderRow( haves, _askPriceD, wants, _askPriceN, _wantsTotal, address(0), 0, false) );
        else {
            orderRow storage x = orders[_rowNum];

            require( address(0) == x.nextAddr );
            
            if (x.haves != haves) 
              x.haves = haves;

            if (x.wants != wants) 
              x.wants = wants;

            x.notInUse = false;

            if (x.askPriceN != _askPriceN)
              x.askPriceN = _askPriceN;

            if (x.askPriceD != _askPriceD)
              x.askPriceD = _askPriceD;

            if (x.wantsTotal != _wantsTotal)
              x.wantsTotal = _wantsTotal ;

            x.nextInx = 0;
        }
    }

    /**
     * @param _rowNum The row number to mark as deleted or inactive.
     */
    function deleteRow(uint32 _rowNum) external {
        require(notLocked());
        require(msg.sender == seller);
        orders[_rowNum].notInUse = true;
    }

    /**
     * @param _what the address of the token type to withdraw, use this contracts
     *              own address for ether.
     * @param _amount the amount to transfer.
     */
    function withdraw(address _what, uint256 _amount) external {
        require(notLocked());
        require(msg.sender == seller);
        IERC20(_what).transfer(seller, _amount);
    }

   /**
    * @dev  Alice is listing. Bob is listed. Alice''s price is a limit. Bob's price is used.
            Everything is views as a sale. (switch viewpoints when neccessary).
     
            ask price (selling) is in wants/have. Best ask is the lowest asking price.
            bid price (buying) is in haves/want. Best bid is the highest bid price.
     
            Therefore if Alice is selling haves (say 4.5 beans) and buying wants (say 5 dollars),
            Alice''s ask price is 1.111 $/bean, and will be beaten by anything lower.
            Alice''s bid price is 0.9 bean/$, and will be beaten by anything higher.
    
            Bob must be selling dollars and buying beans.
              
            The BBO (best bid or offer) rule is: Alice''s order should be executed against the best
            avaiable bid price (highest) listed when viewed as a sale, and the best avaiable ask
            (lowest) price when viewed as a buy. Alice''s price is used as a limit only, that is,
            Bob''s bid must be at or higher than Alices''s ask, and similarly Bob''s ask must be at
            or lower than Alice''s bid, and Bob''s price is used for the trade.

            So, if bob had already listed a sale of $20 for 10 Beans, bid=2 $/bean, ask=0.5 bean/$, then 
            Alice''s order would be executed.

            The order is limited by the amount of haves each has avaiable and the total amount each wants.
            The amount traded is the largest it can be within those limits; so one of those four numbers
            will always be reduced to zero by a successful trade.

alice ask => 1.111 $/bean  N = 1111 D=1000
bob   ask => 0.5   bean/$  N = 5    D=10
   */        

   /* Three phase escrow protocol.
    * 1: everyone computes, checks, and approves the trade they are offered.
    * 2: everyone executes the trade they approved.
    * 3: everyone verifies they recieved what they approved.
    *
    * The steps do not have to be reentrant; in fact it is better if they are not!
    *
    * Each phase needs access to the Wants address and balances, the Haves address and balances and the
    * values calculated on both sides. These values have to be sent as base types via arguments and
    * return tupples. A keccak256 hash is used to ensure that no tampering happens to the transfered
    * data.
    *
    * executeTrade needs: destination address, haves address, and amount to send.
    * verifyTrade needs: Wants address, the old wants balance, and the amount that was to be transfered.
    *
    * So the tupple returned from an approval is :
    * ( Xs, Ys, XAmount, YAmount, Balance)
    * And the hash, used as an inter-call semaphore is :  
    * [ destination, sending, receiving, amount to send, amount to recieve,
    *   old (recieve) balance, block number ]
    */

       /* notation: Xs are Alice''s haves and Bob''s wants, so are from Alice to Bob.
        *           Ys are Alice''s wants and Bob''s haves, so are from Bob to Alice.
        */
 
    uint256 constant SKIP = 32;
    uint256 constant DONE = 64;

    uint256 constant E_INCEPTION_DATE = SKIP + 1;
    uint256 constant E_EXPIRED = SKIP + 2;
    uint256 constant E_BOB_WANTS_FULL = SKIP + 3;
    uint256 constant E_BOB_BALANCE_ZERO = SKIP + 4;

    uint256 constant E_ALICE_WANTS_FULL = DONE + 1 ;
    uint256 constant E_ALICE_BALANCE_ZERO = DONE + 2;
    uint256 constant E_TRADE_MISSMATCH = DONE + 3;
    uint256 constant E_PRICE_LIMITED = DONE + 4;

/* The returned array is the half trade that will be executed.
(Arrays are used to avoid some complications in the external proof. )
   [ 0 seller, 
     1 sendingTo (a wallet), 
     2 Haves (What is being sent),
     3 Wants (what should come back), 
     4 Amount to send
     5 Amount that should come back
     6 Current balance of wants
     7 current block number
     8 status
     ]
    */

   /* approveAsAlice and approveAsBob differ in how the arguments to computeTrade() are
    * constructed; if it were not for that then it would be equivilant to swapping _a and _b.
    *
    * It should, therefor, be posible to consolidate these two functions in the future with a
    * simple conditional on the computeTrade() call, and an argument to indicate role. In
    * which case _a becomes _x and _b becomes _y with the previously defined meanings.
    *
    * Note the price check is symetrical under alice/bob swap, because alice''s price is
    * the reciprical of bob''s.
    */


    /**
     * @param _a Alice''s OrderWalletObject.
     * @param _aliceRow Order row in Alice''s OrderWalletObject.
     * @param _b Bob''s OrderWalletObject.
     * @param _bobRow Order row in Bob''s OrderWalletObject.
     * @return a 9 element approval array (see notes)
     */

    function approveAsAlice(address _a, uint256 _aliceRow, address _b, uint256 _bobRow) external
    returns (uint256[9] memory r)
    {
        require(onlyController());
        require(address(this) == _a);

        //[address AHaves, address AWants, uint256 AAskPriceN, uint256 AAskPriceD, uint256 AWantsTotal]
        uint256[5] memory ARow = getOrderRow(_aliceRow );
        uint256[5] memory BRow = rogueObject(_b).getOrderRow(_bobRow);

        if ( ARow[0] != BRow[0] || ARow[1] != BRow[1] )
            r[8] = E_TRADE_MISSMATCH;

        else if ( BRow[3] * ARow[3] < ARow[2] * BRow[2] )
            r[8] = E_PRICE_LIMITED;

        else {
            r[0] = uint256(seller);
            r[1] = uint256(_b);
            r[2] = ARow[0]; // These two are
            r[3] = BRow[0]; // swapped for Alice/Bob
            r[7] = block.number;
        
            uint256 AHavesBalance = IERC20(ARow[0]).balanceOf(_a);
            uint256 BHavesBalance = IERC20(BRow[0]).balanceOf(_b);
            r[6]                  = IERC20(ARow[1]).balanceOf(_a); // AWantsBalance
            uint256 BWantsBalance = IERC20(BRow[1]).balanceOf(_b);
    
            (r[4], r[5], r[8]) = computeTrade(          // ( XAmount, YAmount, status ) swapped for Alice/Bob
                     AHavesBalance, BHavesBalance,
                     r[6], BWantsBalance,
                     ARow[4],                           // AWantsTotal,
                     BRow[2], BRow[3], BRow[4] );       // BAskPriceN, BAskPriceD, BWantsTotal

            transactionSemaphore.setIfClear( keccak256(abi.encodePacked(r)));
        }
    }

    /* Cost model: see approveAsAlice
     */

    /**
     * @param _a Alice''s OrderWalletObject.
     * @param _aliceRow Order row in Alice''s OrderWalletObject.
     * @param _b Bob''s OrderWalletObject.
     * @param _bobRow Order row in Bob''s OrderWalletObject.
     * @return a 9 element approval array (see notes)
     */
    function approveAsBob(address _a, uint256 _aliceRow, address _b, uint256 _bobRow) external
    returns (uint256[9] memory r)
    {
        require(onlyController());
        require(address(this) == _b);

        //[address AHaves, address AWants, uint256 AAskPriceN, uint256 AAskPriceD, uint256 AWantsTotal]
        uint256[5] memory ARow = rogueObject(_a).getOrderRow(_aliceRow );
        uint256[5] memory BRow = getOrderRow(_bobRow);

        if ( ARow[0] != BRow[0] || ARow[1] != BRow[1] )
            r[8] = E_TRADE_MISSMATCH;

        else if ( BRow[3] * ARow[3] < ARow[2] * BRow[2] )
            r[8] = E_PRICE_LIMITED;

        else {
            r[0] = uint256(seller);
            r[1] = uint256(_a);
            r[2] = BRow[0]; // These two are
            r[3] = ARow[0]; // swapped for Alice/Bob
            r[7] = block.number;
            
            uint256 AHavesBalance = IERC20(ARow[0]).balanceOf(_a);
            uint256 BHavesBalance = IERC20(BRow[0]).balanceOf(_b);
            uint256 AWantsBalance = IERC20(ARow[1]).balanceOf(_a);
            r[6]                  = IERC20(BRow[1]).balanceOf(_b); // BWantsBalance
    
            (r[5], r[4], r[8]) = computeTrade(          // ( XAmount, YAmount, status ) swapped for Alice/Bob
                     AHavesBalance, BHavesBalance,
                     AWantsBalance, r[6],
                     ARow[4],                           // AWantsTotal,
                     BRow[2], BRow[3], BRow[4] );       // BAskPriceN, BAskPriceD, BWantsTotal

            transactionSemaphore.setIfClear( keccak256(abi.encodePacked(r)));
        }
    }

    function computeTrade(uint256 AHavesAmount, uint256 BHavesAmount, 
                uint256 AWantsTotal, uint256 BWantsTotal, uint256 BAskPriceN, uint256 BAskPriceD,
                uint256 AWantsBalance, uint256 BWantsBalance)
        internal
        returns (uint256 XAmount, uint256 YAmount, uint256 status)
    {
        //alice ask => 1.111 $/bean  N = 1111 D=1000
        //bob   ask => 0.5   bean/$  N = 5    D=10

        // 10 * 1000 >?= 1111 * 5
        // 10,000 >?= 5,555  true. 
        require (transactionSemaphore.isClearOrClear(), "PPE1");

        if ( inception < now )
            status = E_INCEPTION_DATE;

        else if ( expiration > now)
            status = E_EXPIRED;

        else if (AWantsBalance >= AWantsTotal)
            status = E_ALICE_WANTS_FULL;

        else if (BWantsBalance >= BWantsTotal)
            status = E_BOB_WANTS_FULL;

        else if ( AHavesAmount == 0 )
            status = E_ALICE_BALANCE_ZERO;

        else if ( BHavesAmount == 0 )
            status = E_BOB_BALANCE_ZERO;

        else {
            YAmount = MUtils.min( AWantsTotal - AWantsBalance, BHavesAmount ); 
            XAmount = MUtils.min( BWantsTotal - BWantsBalance, AHavesAmount ); 

            XAmount = MUtils.min( XAmount, YAmount.mult(BAskPriceN, BAskPriceD) );
            YAmount = XAmount.mult(BAskPriceD, BAskPriceN);
        }      
    }

    function executeTrade(uint256[9] calldata r) external
       // address _to, address _send, address _recv, uint256 _sAmount,
       // _rAmount, uint256 _balance) external
    {
        require(onlyController());
        require(r[7] == block.number && r[8]==0);

        bytes32 hash = keccak256( abi.encodePacked(r));
        require( transactionSemaphore.check(hash),"PPE2" );

        IERC20(r[2]).transfer(address(r[1]), r[4]);
    }

    function verifyTrade(uint256[9] calldata r) external
    {
        require(onlyController());
        require(r[7] == block.number && r[8]==0);

        bytes32 hash = keccak256(abi.encodePacked(r));

        require( transactionSemaphore.checkAndClear(hash), "PPE3");
        require (IERC20(r[3]).balanceOf(address(this)) == r[5] + r[6]) ;
    }
}

/** Contract cloning contract.
 */

contract rogueObjectCloner {
    /**
     * @param _addr The address of the ERC721 token contract tracking
     *              and wrapping the object cloned.
     */
    function clone(address _addr, address _seller) external returns (address) {
      rogueObject O = new rogueObject(_addr, _seller) ;
      return address( O );
    }
}

