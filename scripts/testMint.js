var Web3 = require('web3');
const url = require('url');
const http = require('http');
const { parse } = require('querystring');

let nRogueObject = "rogueObject";
let cRogueObject = nRogueObject+".sol:rogueObject";
var fRogueObject = "0xFf8BFaba865C8cd0362F2302aaaF74d7409bD65e";

let nRogueHolder = "rogueHolder";
let cRogueHolder = 'rogueHolder.sol:rogueHolder';
//var aRogueHolder =  "0xb922A772c07E718208C237E1F90c3948D89AdAef";
var aRogueHolder =  "0x7199E99f7daFEb5A3B37Bdf11a685Ac6F97105f9";

var target = "0x43CaB56d71D8f9f62BE8699345447B417dc3ad0F";


let jRogueObject = require('../contracts/'+nRogueObject+'/combined' );
let jRogueHolder = require('../contracts/'+nRogueHolder+'/combined' );

var W = new Web3("ws://localhost:8546");

//var W = new Web3( "wss://mainnet.infura.io/ws" );
var whoami = "0x64e877fEA0e030064055a7c811E8f5A1752965f4" ; //rinkby account
var pkey = "0xAF43938EA33CE2F8BF351F20ADA7131507E470B871C69EE142E02643FA722AAF";



var x = W.eth.getBlockNumber().then( x=> console.log("blk: ", x) )

W.eth.getBalance(whoami)
  .then( b => console.log("balance: ", b )  )
  .catch(err => { console.log(err); } )

W.eth.getGasPrice()
  .then( x => console.log("gp: ", x )  )
  .catch(err => { console.log(err); } )

let CRogueObject = jRogueObject.contracts[cRogueObject];
let CRogueHolder = jRogueHolder.contracts[cRogueHolder];

let rogueHolder =  new W.eth.Contract(JSON.parse(CRogueHolder.abi), aRogueHolder) ;


const doMint = (target, balance) => {
  let y = rogueHolder.methods.mintObject( fRogueObject, target );
  let z = y.encodeABI();

  Promise
  .all( [
    W.eth.getGasPrice(),
    /*y.estimateGas()*/ 4000000, /**/,
  ])
  .then( x => { console.log( "gp/ gc>", x) ; return x ;} )
  .then( ([gasPrice, gas]) => W.eth.accounts.signTransaction( { to:aRogueHolder, from:whoami, data:z, gasPrice, gas, }, pkey) )
  .then( x => { console.log("ST> ",x); return W.eth.sendSignedTransaction( x.rawTransaction ); } )
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
      data = parse(body);
      doMint( data.address, data.balance );
      response.end('ok');
    });
  }
} );


  
