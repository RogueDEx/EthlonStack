var Web3 = require('web3'); // in react use import

/* Utils
 */


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

//const CRogueHolder = loadContract(".", "rogueHolder" );
const aRogueHolder =  "0x8F4F8101C9D2017Be850f00B6f927a603475167f";

const erc20abi = require('../src/abi/erc20');
const erc721abi = require('../src/abi/erc721');

const aVibeE = "0xd2e48a20b4c4F733604d336dB872b747Cd0Ffbe6";
const aVibeH = "0x2e7576Ae02831F9A8CA15272D6a16A8c2C9ee6d3";
const aVibePA = "0x4B03d3823e38Da31946794b942177D6D8195966b";
const aVibeMP = "0xea6a68ED57DFaaabC24A2Aed0F2D12B6f1d82942";
const aVibeUSDEQ = "0x4aEb09074448892ea75D34D3e59369F37a166adE";

const tokensOfInterest = [ aVibeE, aVibeE, aVibeH, aVibePA, aVibeMP, aVibeUSDEQ, ];

//var target = "0x43CaB56d71D8f9f62BE8699345447B417dc3ad0F";
var target = "0x1460F4027aCd5870364eB224f9A887b9a31758Af";

/* Who am I with private key...
 */
var whoami = "0x64e877fEA0e030064055a7c811E8f5A1752965f4" ; //rinkby account
//var pkey = "0xAF43938EA33CE2F8BF351F20ADA7131507E470B871C69EE142E02643FA722AAF";

/* Connect...
 */
const web3 = new Web3("ws://localhost:8546");
//const web3 = new Web3( "wss://rinkeby.infura.io/ws/v3/88763c0ddb9b411dbcc2e6d1e4c1a5ac")
//const web3 = new Web3( "wss://mainnet.infura.io/ws" );
//
const E = web3.eth;
const U = web3.utils;

const contractCacheData = {};
const contractCache = (abi, addr) => contractCacheData[addr] || (contractCacheData[addr] = new E.Contract(abi, addr) ) 

/* Check on the chain ...
 */
const checkOnChain = () => Promise.all( [
    E.getBlockNumber().then( x => console.log("current block: ", x) ),
    E.getBalance(whoami).then( b => console.log("my balance: ", b )  ),
    E.getGasPrice().then( x => console.log("current gas price: ", x )  )
  ])

/* Simple data cache ...
 */

let dataCache = {};
const setDataCache = x => dataCache = x ;

const updateContract = (addr, value) => {
  return setDataCache( {
    ...dataCache,
    [addr]: {
      ...dataCache[addr],
      ...value
    }
  } );
}

/*  Rogue Holder tokens stuff...
 */
let rogueHolder = contractCache(erc721abi, aRogueHolder) ;

const id2addr = id => U.toChecksumAddress(U.padLeft(U.toHex(id),40));

const getHolderRogueList = (from) =>
  rogueHolder.methods.balanceOf(from).call({from}) // call as target even though no private key
    .then( n => Promise.all( 
      range(n).map( (_,i) => ( rogueHolder.methods.tokenOfOwnerByIndex(target, i).call({from}) ) )
    ))
    .then( bist => bist.map(id2addr) )
    .then( list => { updateContract(aRogueHolder, {[from]:list} ); return list;} )

const getERC20Statics = (ledger) => {
  const C = contractCache(erc20abi, ledger).methods
  return Promise.all([
    C.decimals().call().then( decimals => updateContract(ledger, {decimals}) ), 
    C.symbol().call().then( symbol => updateContract(ledger, {symbol}) ), 
    C.name().call().then( name => updateContract(ledger, {name}) ), 
  ]);
}

const getRogueBalances = (addr) => Promise.all( tokensOfInterest.map(
      token => contractCache(erc20abi, token).methods.balanceOf(addr).call()
        .then( bal => updateContract( token, {[addr]:bal} ) )
    ));

const getRogueSeller = (addr) => contractCache(CRogueObject.Babi, addr).methods.seller().call()
    .then( seller => updateContract(addr, {seller}) );

const getRogueExpiration = (addr) => contractCache(CRogueObject.Babi, addr).methods.expiration().call()
    .then( expiration => updateContract(addr, {expiration}) );

const getRogueInception = (addr) => contractCache(CRogueObject.Babi, addr).methods.inception().call()
    .then( inception => updateContract(addr, {inception}) );

const getRogueRow = (addr,n) => contractCache(CRogueObject.Babi, addr).methods.getOrderRow(n).call()
    .then( row => updateContract(addr, { [n]: row }) )
    .catch( err => updateContract(addr, { [n]: null} ) );

/* Do the thing ...
 */
(new Promise( r=> r(true) ))
  .then( () => checkOnChain() )
  .then( () => getHolderRogueList(target) )
  .then( list => Promise.all( [
    ...tokensOfInterest.map( y => getERC20Statics(y) ),
    ...list.map( y => getRogueBalances(y) ),
    ...list.map( y => getRogueSeller(y) ),
    ...list.map( y => getRogueInception(y) ),
    ...list.map( y => getRogueExpiration(y) ),
    ...list.map( y => getRogueRow(y,0) ),
   ]) )
  .then( () => console.log( "all> ", dataCache ) )
  .catch(console.log)
 

