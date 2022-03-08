import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer, tokenOwner} = await getNamedAccounts();

 /* 
  //Rinkeby superfluid contracts
  const host = '0xeD5B5b32110c3Ded02a07c8b8e97513FAfb883B6';
  const cfa = '0xF4C5310E51F6079F601a5fb7120bC72a70b96e2A';
  const fDAIx = '0x745861AeD1EEe363b4AaA5F1994Be40b1e05Ff90';
  */
 
  
  //Gnosis superfluid contracts
  const host = '0x2dFe937cD98Ab92e59cF3139138f18c823a4efE7';
  const cfa = '0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D';
  const fDAIx = '0x59988e47A3503AaFaA0368b9deF095c818Fdca01';
  const Brightx = '0x7AecA73f38f8F33AB7FF067fED1268384d12324d';

/*
  //mumbai contracts
  const host = '0xEB796bdb90fFA0f28255275e16936D25d3418603';
  const cfa = '0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873';
  const fDAIx = '0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f';
*/

  //your address here...
  const owner = "0x9263bFf6ACCb60E83254E95220e7637465298171";

  await deploy('BrightIDStream', {
    from: deployer,
    args: [ owner,
    "BrightIDStream", 
    "BID", 
    host,
    cfa,
    Brightx,
    owner],
    log: true,
  });

  
};
export default func;
func.tags = ['BrightIDStream'];
