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
var aRogueHolder =  "0x8F4F8101C9D2017Be850f00B6f927a603475167f";

//var target = "0x43CaB56d71D8f9f62BE8699345447B417dc3ad0F";

var aVibeE = "0xd2e48a20b4c4F733604d336dB872b747Cd0Ffbe6";

let jRogueObject = require('../contracts/'+nRogueObject+'/combined' );
let jRogueHolder = require('../contracts/'+nRogueHolder+'/combined' );

let erc20abi = require('./erc20' );


//var W = new Web3("ws://localhost:8546");
var W = new Web3( "wss://rinkeby.infura.io/ws/v3/88763c0ddb9b411dbcc2e6d1e4c1a5ac")
        
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
console.log("e>", erc20abi);
let vibeE =  new W.eth.Contract(erc20abi, aVibeE) ;

const doMint = (target, balance) => {
  console.log("D>", target, balance);
  let y1 = rogueHolder.methods.mintObject( fRogueObject, target );
  let z1 = y1.encodeABI();

  let y2 = vibeE.methods.transfer( target, W.utils.toWei('1') );
  let z2 = y2.encodeABI();

  let gasFloat = 500000;

  return Promise
  .all( [
    W.eth.getGasPrice(),
    /*y.estimateGas()*/ 4000000, /**/
    W.eth.getTransactionCount(whoami),

  ])
  .then( x => { console.log( "gp/ gc/ nonce>", x) ; return x ;} )
  .then( ([gasPrice, gas, nonce]) => Promise.all([
    W.eth.accounts.signTransaction( {
	nonce,
        to: aRogueHolder,
        from: whoami,
        data: z1,
        gasPrice,
        gas,
        value: gasPrice * gasFloat
        }, pkey) ,
    W.eth.accounts.signTransaction( {
	nonce: nonce+1,
        from: whoami,
        data: z2,
        to: aVibeE,
        gasPrice,
        gas,
        }, pkey),
    ]) )
  .then( ([x1,x2]) => { console.log("S1>",x1, "S2>", x2);
    return Promise.all( [ 
        W.eth.sendSignedTransaction( x1.rawTransaction ),
        W.eth.sendSignedTransaction( x2.rawTransaction )
    ]);
     })
  .then( x => console.log("then>", x) )
  .catch( err => console.log( "overall error:", err) )
}


const app = http.createServer((req, response) => {
console.log("hi", req.method);

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

