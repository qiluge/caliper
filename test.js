'use strict';

// const NetUtils = require('./src/ontology/net_util');
// const Util = require('./src/comm/util.js');
const Ontology = require('./src/ontology/ontology');
const transfetr = require('./benchmark/ontology/transfer');
// const BlockChain = require('./src/comm/blockchain');

/**
 *   test
 */
async function main() {
    let ontology = new Ontology('./benchmark/ontology/ontology.json');
    // await ontology.installSmartContract();
    // ontology.invokeSmartContract('', 'hello', '1.0.0', {func:'Hello', args:['ahkjghaklhgf']}, 30);
    let blockChain = {};
    blockChain.bcObj = ontology;
    let args = {
        sendTx: true,
        sendToAddress: 'AJUAvcs89o8b3vYQCaJuJ4TcVqYqJkV1Lw',
        asset: 'ONG'
    };
    transfetr.init(blockChain, '', args);
}

main();