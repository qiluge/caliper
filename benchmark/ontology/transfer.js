'use strict';

module.exports.info  = 'transfer ont';

let txNum;
let bc, contx;
let txHash, tx;


// read tx from file, or use sdk to generate tx
module.exports.init = function(blockchain, context, args) {
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};


// should transfer one time in one invoke
module.exports.run = function() {
    return bc.invokeSmartContract(contx, 'simple', 'v0', {txHash: txHash[0], txData:tx[0]}, 30);
};

module.exports.end = function() {
    return Promise.resolve();
};
