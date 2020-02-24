var Web3 = require('web3');
const url = require('url');
const http = require('http');
const { parse } = require('querystring');

let nRogueObject = "rogueObject";
let cRogueObject = nRogueObject+".sol:rogueObject";
//var fRogueObject = "0xFf8BFaba865C8cd0362F2302aaaF74d7409bD65e";
//var fRogueObject = "0xF4042119Aa081df687A563A59503ABdDfbAbCfbB";
var fRogueObject = "0x23628153CbAd2f4B55Dd0c62cEb22104b333d5cB";

let nRogueHolder = "rogueHolder";
let cRogueHolder = 'rogueHolder.sol:rogueHolder';
//var aRogueHolder =  "0xb922A772c07E718208C237E1F90c3948D89AdAef";
var aRogueHolder =  "0x8F4F8101C9D2017Be850f00B6f927a603475167f";

//var target = "0x43CaB56d71D8f9f62BE8699345447B417dc3ad0F";

var aVibeE = "0xd2e48a20b4c4F733604d336dB872b747Cd0Ffbe6";

let jRogueObject = require('../contracts/'+nRogueObject+'/combined' );
let jRogueHolder = require('../contracts/'+nRogueHolder+'/combined' );

let erc20abi = require('../src/abi/erc20' );

// const web3 = new Web3("ws://localhost:8546");
const web3 = new Web3( "wss://rinkeby.infura.io/ws/v3/88763c0ddb9b411dbcc2e6d1e4c1a5ac")
const E = web3.eth;
const A = web3.eth.accounts;
const U = web3.utils;

//var W = new Web3( "wss://mainnet.infura.io/ws" );
var whoami = "0x64e877fEA0e030064055a7c811E8f5A1752965f4" ; //rinkby account
var pkey = "0xAF43938EA33CE2F8BF351F20ADA7131507E470B871C69EE142E02643FA722AAF";


const id2addr = id => U.toChecksumAddress(U.padLeft(U.toHex(id),40))

var x = E.getBlockNumber().then( x=> console.log("blk: ", x) )

E.getBalance(whoami)
  .then( b => console.log("balance: ", b )  )
  .catch(err => { console.log(err); } )

E.getGasPrice()
  .then( x => console.log("gp: ", x )  )
  .catch(err => { console.log(err); } )

let CRogueObject = jRogueObject.contracts[cRogueObject];
let CRogueHolder = jRogueHolder.contracts[cRogueHolder];

let rogueHolder =  new E.Contract(JSON.parse(CRogueHolder.abi), aRogueHolder) ;
console.log("e>", erc20abi);
let vibeE =  new E.Contract(erc20abi, aVibeE) ;

const from = whoami;

const doMint = (target, balance) => {
  console.log("D>", target, balance);
  let y1 = rogueHolder.methods.mintObject( fRogueObject, target );
  let z1 = y1.encodeABI();

  let y2 = vibeE.methods.transfer( target, U.toWei('1') );
  let z2 = y2.encodeABI();

  let gasFloat = 500000;

  return Promise.all([ 
      E.getGasPrice(), 
      /*y.estimateGas()*/ 4000000, /**/
    ])
    .then( ([gasPrice, gas]) => A.signTransaction({ to: aRogueHolder, from, data: z1, gasPrice, gas, value: gasPrice * gasFloat }, pkey) )
    .then( x => { console.log( "t1>", x.transactionHash) ; return x ;} )
    .then( x => E.sendSignedTransaction( x.rawTransaction ) )
    .then( ({status, logs}={}) => {
      if (status ==  "0x01" && logs.length>0) {
        const { topics: [ evnt, from, to, id ] } = logs[0];
        if ( evnt != "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
          throw ("Unknown event: ");
        } else {
          const addr = id2addr(U.toBN(id));
          console.log( "id>", addr );
          return vibeE.methods.transfer( addr, U.toWei('1') )
        }
      }
    })
    .then( y2 => Promise.all([ E.getGasPrice(), y2.estimateGas().catch(()=>4000000), y2.encodeABI() ]) )
    .then( ([gasPrice, gas, data]) => A.signTransaction( { from, data, to: aVibeE, gasPrice, gas, }, pkey) )
    .then( x => { console.log( "t2>", x.transactionHash) ; return x ;} )
    .then( x => E.sendSignedTransaction( x.rawTransaction ) )
    .then( x => console.log("then>", x) )
    .catch( err => console.log( "overall error:", err) )

}


const app = http.createServer((req, response) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
      data = JSON.parse(body);
      doMint( data.address, data.balance );
    });
  }
      response.end('ok');
} );

app.listen(36363);

