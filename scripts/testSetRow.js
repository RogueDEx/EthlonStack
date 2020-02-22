var Web3 = require('web3'); // in react use import

/* Utils
 */

const contractCacheData = {};
const contractCache = (abi, addr) => contractCacheData[addr] || (contractCacheData[addr] = new E.Contract(abi, addr) ) 

const loadContract = (dir, nObj, cname) => {
  const jObj = require('../contracts/'+dir+"/"+nObj+'/combined' );
  const CObj = jObj.contracts[ nObj+".sol:"+ ( cname || nObj ) ] ;
  return {
    ...CObj,
    Babi: JSON.parse( CObj.abi ),
  };
}

const range = n => [...Array(Number(n)).keys()]

/* various definitions and contract ABI imports
 */

const CRogueObject = loadContract(".", "rogueObject" );
const fRogueObject = "0xFf8BFaba865C8cd0362F2302aaaF74d7409bD65e";

const CRogueHolder = loadContract(".", "rogueHolder" );
const aRogueHolder =  "0x8F4F8101C9D2017Be850f00B6f927a603475167f";

const erc20abi = require('../src/abi/erc20');

const aVibeE = "0xd2e48a20b4c4F733604d336dB872b747Cd0Ffbe6";
const aVibeH = "0x2e7576Ae02831F9A8CA15272D6a16A8c2C9ee6d3";
const aVibePA = "0x4B03d3823e38Da31946794b942177D6D8195966b";
const aVibeMP = "0xea6a68ED57DFaaabC24A2Aed0F2D12B6f1d82942";
const aVibeUSDEQ = "0x4aEb09074448892ea75D34D3e59369F37a166adE";

var target = "0x43CaB56d71D8f9f62BE8699345447B417dc3ad0F";

/* Who am I with private key...
 */
var whoami = "0x64e877fEA0e030064055a7c811E8f5A1752965f4" ; //rinkby account
var pkey = "0xAF43938EA33CE2F8BF351F20ADA7131507E470B871C69EE142E02643FA722AAF";

/* Connect...
 */
const web3 = new Web3("ws://localhost:8546");
//var web3 = new Web3( "wss://mainnet.infura.io/ws" );
//
const E = web3.eth;
const U = web3.utils;

/* Check on the chain ...
 */
const checkOnChain = () => Promise.all( [
    E.getBlockNumber().then( x => console.log("current block: ", x) ),
    E.getBalance(whoami).then( b => console.log("my balance: ", b )  ),
    E.getGasPrice().then( x => console.log("current gas price: ", x )  )
  ])

/* Simple token cache ...
 */
let tokenCache = {};
const setTokenCache = x => tokenCache = x ;

const updateToken = (ledger, who, balance) => 
  setTokenCache( {
    ...tokenCache,
    [ledger]: {
      ...tokenCache[ledger],
      [who]: balance,
    }
  } );

let rogueCache = {};
const setRogueCache = x => rogueCache = x ;

const updateRogueObject = (id, value) => {
  const addr = U.toChecksumAddress(U.toHex(id))
  return setRogueCache( {
    ...rogueCache,
    [addr]: {
      ...rogueCache[addr],
      ...value
    }
  } );
}

/*  Rogue Holder tokens stuff...
 */
let rogueHolder = contractCache(CRogueHolder.Babi, aRogueHolder) ;

const getHolderRogueList = (from) =>
  rogueHolder.methods.balanceOf(target).call({from}) // call as target even though no private key
    .then( n => Promise.all( 
      range(n).map( (_,i) => rogueHolder.methods.tokenOfOwnerByIndex(target, i).call({from}) )
    ));

const tokensOfInterest = [ aVibeE, aVibeE, aVibeH, aVibePA, aVibeMP, aVibeUSDEQ, ];

const getRogueBalances = (id) => {
  const addr = U.toChecksumAddress(U.toHex(id))
  return Promise.all(
    tokensOfInterest.map(
      token => contractCache(erc20abi, token).methods.balanceOf(addr).call().then( bal => updateToken( token, addr, bal) )
    )
  );
}

const getRogueSeller = (id) => {
  const addr = U.toChecksumAddress(U.toHex(id))
  return contractCache(CRogueObject.Babi, addr).methods.seller().call()
    .then( seller => updateRogueObject(addr, {seller}) );
}

const getRogueExpiration = (id) => {
  const addr = U.toChecksumAddress(U.toHex(id))
  return contractCache(CRogueObject.Babi, addr).methods.expiration().call()
    .then( expiration => updateRogueObject(addr, {expiration}) );
}

const getRogueInception = (id) => {
  const addr = U.toChecksumAddress(U.toHex(id))
  return contractCache(CRogueObject.Babi, addr).methods.inception().call()
    .then( inception => updateRogueObject(addr, {inception}) );
}

const getRogueRow = (id,n) => {
  const addr = U.toChecksumAddress(U.toHex(id))
  return contractCache(CRogueObject.Babi, addr).methods.getOrderRow(n).call()
    .then( row => updateRogueObject(addr, { [n]: row }) )
    .catch( err => console.log( addr, "no rows set" ) );
}

const updateOrderRow = (id, row, have, wants, askN, askD, wantsTotal) => {
  const addr = U.toChecksumAddress(U.toHex(id))
  const call = contractCache(CRogueObject.Babi, addr).methods.updateRow(row, have, wants, askN, askD, wantsTotal)

  return Promise.all( [
    E.getGasPrice(),
    /*call.estimateGas()*/
    1000000 
    ,
    E.getTransactionCount(whoami),
  ])
  .then( x => { console.log( "gp/ gc/ nonce>", x) ; return x ;} )
  .then( ([gasPrice, gas, nonce]) => E.accounts.signTransaction( {
	    nonce,
      to: aRogueHolder,
      from: whoami,
      data: call.encodeABI(),
      gasPrice,
      gas,
      }, pkey) )
   .then( x => E.sendSignedTransaction( x.rawTransaction ) )

}

/* Do the thing ...
 */
rogue = "0x1b401B86A83b5d9001Fcfd566134BaEB02055F3a"

checkOnChain()
  .then( () => updateOrderRow( rogue, 0, aVibeE, aVibeUSDEQ, "3", "2", "5"  ) )
  .then( x => console.log( "TX>", x ) )
  .catch(console.log)
 

