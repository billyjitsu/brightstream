import {HardhatUserConfig} from 'hardhat/types';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import {node_url, accounts} from './utils/network';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.7.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    rinkeby: {
      url: node_url('rinkeby'),
      accounts: accounts('rinkeby'),
    },
    mumbai: {
      url: node_url('mumbai'),
      accounts: accounts('mumbai'),
    },
    xdai: {
      url: node_url('xdai'),
      accounts: accounts('xdai'),
    },
    sokol: {
      url: node_url('sokol'),
      accounts: accounts('sokol'),
    },
  },
  namedAccounts: {
    deployer: 0,
    tokenOwner: 1,
  },
 // paths: {
 //   sources: 'src',
 // },
};
export default config;
