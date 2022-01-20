require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

// use the forking URL if one is available
let networks = {}
if(process.env.FORKING_URL) {
  networks.hardhat = {
    forking: {
      url: process.env.FORKING_URL,
      blockNumber: 13672190
    }
  }
}

module.exports = {
  solidity: "0.8.1",
  networks: {
    ...networks,
    // configure new networks down here
  },
  paths: {
    artifacts: "./app/artifacts",
  }
};
