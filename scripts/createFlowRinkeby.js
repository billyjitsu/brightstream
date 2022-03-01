const hre = require("hardhat");
require("dotenv");
const Web3 = require("web3");

//all addresses hardcoded for mumbai
const hostJSON = require("../artifacts/@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol/ISuperfluid.json")
const hostABI = hostJSON.abi;
const hostAddress = "0xeD5B5b32110c3Ded02a07c8b8e97513FAfb883B6";

const cfaJSON = require("../artifacts/@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol/IConstantFlowAgreementV1.json")
const cfaABI = cfaJSON.abi;
const cfaAddress = "0xF4C5310E51F6079F601a5fb7120bC72a70b96e2A";

const tradeableCashflowJSON = require("../artifacts/contracts/NFT.sol/BrightIDStream.json");
const tradeableCashflowABI = tradeableCashflowJSON.abi; 

//temporarily hardcode contract address and sender address
//need to manually enter contract address and sender address here
const deployedTradeableCashflow = require("../artifacts/contracts/NFT.sol/BrightIDStream.json");
const tradeableCashflowAddress = "0xf61F00673661D521bbf74e85cab841e811701956"; //hardcoded address
//your address here:
const _sender = "0xe2b8651bF50913057fF47FC4f02A8e12146083B8";

//create a flow
async function main() {


  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RINKEBY_RPC_URL));

  //create contract instances for each of these
  const host = new web3.eth.Contract(hostABI, hostAddress);
  const cfa = new web3.eth.Contract(cfaABI, cfaAddress);
  const tradeableCashflow = new web3.eth.Contract(tradeableCashflowABI, tradeableCashflowAddress);
  
  const fDAIx = "0x745861AeD1EEe363b4AaA5F1994Be40b1e05Ff90"
  const userData = web3.eth.abi.encodeParameter('string', 'ipfs://QmRS8pzf13rbhJuxTfoT2yXDbpywHpiVQkF1cczq8jpVHc/1.json');

  const nonce = await web3.eth.getTransactionCount(_sender, 'latest'); // nonce starts counting from 0

  //create flow by calling host directly in this function
  //create flow from sender to tradeable cashflow address
  //pass in userData to the flow as a parameter
  async function startFlow() {
      let cfaTx = (await cfa.methods
     .createFlow(
      fDAIx,
      // _sender,
      tradeableCashflowAddress,
      "3858024691358",
      "0x"
     )
     .encodeABI())

     

     let txData = (await host.methods.callAgreement(
      cfaAddress, 
      cfaTx, 
      userData
    ).encodeABI());

   // console.log("txDaTa:", txData);

    let tx = {
      'to': hostAddress,
      'gas': 3000000,
      'nonce': nonce,
      'data': txData
    }

    let signedTx = await web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY);

    await web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(error, hash) {
      if (!error) {
        console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
      } else {
        console.log("❗Something went wrong while submitting your transaction:", error)
      }
     });

    }
  

  await startFlow();

  }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });