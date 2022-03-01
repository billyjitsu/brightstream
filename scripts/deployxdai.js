//mumbai addresses - change if using a different network
const host = '0x2dFe937cD98Ab92e59cF3139138f18c823a4efE7';
const cfa = '0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D';
const fDAIx = '0x59988e47A3503AaFaA0368b9deF095c818Fdca01';

//your address here...
const owner = "0xe2b8651bF50913057fF47FC4f02A8e12146083B8";

const main = async () => {
    const nftContractFactory = await hre.ethers.getContractFactory('BrightIDStream');
    const nftContract = await nftContractFactory.deploy(
        owner,
        "xdainft", 
        "XNFT", 
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