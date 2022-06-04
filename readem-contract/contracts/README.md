# install packages
    npm install

# install tools  
    npm install -g truffle ganache-cli solt

# compile  
    truffle compile

# deploy to ganache  
    truffle migrate

# test  
    truffle test

# deploy to kovan  
    truffle migrate --network kovan

# generate json to verify etherscan  
    solt write contracts/Blindbox.sol --npm --runs 200

# verify etherscan  
    solt verify solc-input-blindbox.json [address] Blindbox --compiler v0.8.7 --license 1 --network kovan --infura [infura-key]

# deploy to mainnet  
    truffle migrate --network mainnet
