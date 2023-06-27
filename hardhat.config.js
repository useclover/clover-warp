require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = process.env.NEXT_PUBLIC_MATIC_PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.7",
    networks: {
      calibration: {
        chainId: 314159,
        url: "https://rpc.ankr.com/filecoin_testnet",
        accounts: [PRIVATE_KEY],
      },
    },
     settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    }
  },
};
