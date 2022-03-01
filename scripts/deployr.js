//mumbai addresses - change if using a different network
const host = '0xeD5B5b32110c3Ded02a07c8b8e97513FAfb883B6';
const cfa = '0xF4C5310E51F6079F601a5fb7120bC72a70b96e2A';
const fDAIx = '0x745861AeD1EEe363b4AaA5F1994Be40b1e05Ff90';

//your address here...
const owner = "0xe2b8651bF50913057fF47FC4f02A8e12146083B8";

const main = async () => {
    const nftContractFactory = await hre.ethers.getContractFactory('TradeableCashflow');
    const nftContract = await nftContractFactory.deploy(
        owner,
        "advert", 
        "ADV", 
        host,
        cfa,
        fDAIx,
        owner
        );
    await nftContract.deployed();
    console.log("Contract deployed to:", nftContract.address);
  
    // Call the function.
  // let txn = await nftContract.mint(1)
    // Wait for it to be mined.
   // await txn.wait()
   // console.log("Minted NFT #1")

    /*
    let info = await nftContract.baseURI();
    console.log(info)
    let token = await nftContract.tokenURI(1);
    console.log(token)
    let rev = await nftContract.reveal();
    await rev.wait()
    token = await nftContract.tokenURI(1);
    console.log(token)
*/
  /*
    txn = await nftContract.makeAnEpicNFT()
    // Wait for it to be mined.
    await txn.wait()
    console.log("Minted NFT #2")
    */
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();