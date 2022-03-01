//mumbai addresses - change if using a different network
const host = '0xEB796bdb90fFA0f28255275e16936D25d3418603';
const cfa = '0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873';
const fDAIx = '0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f';

//your address here...
const owner = "0x9263bFf6ACCb60E83254E95220e7637465298171";

const main = async () => {
    const nftContractFactory = await hre.ethers.getContractFactory('TradeableCashflow');
    const nftContract = await nftContractFactory.deploy(
        owner,
        "advertboard", 
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