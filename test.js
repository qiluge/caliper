'use strict';

// const NetUtils = require('./src/ontology/net_util');
// const Util = require('./src/comm/util.js');
const Ontology = require('./src/ontology/ontology');
// const transfetr = require('./benchmark/ontology/transfer');

// const BlockChain = require('./src/comm/blockchain');

/**
 *   test
 */
async function main() {
    let ontology = new Ontology('./benchmark/ontology/ontology.json');
    ontology.sendTx('','00d173268f230000000000000000002d310100000000a766c0f13f96578b70d57c9802515ba406d36997260' +
        '86f6e746f6c6f677951c10548656c6c6f6778d25a17957b45782dd5bc8be330cb4dd53a3e61000142410158266f75420f4383' +
        '8f4f2ffe5da5c434b3fb395077f22bfe28ab24a7ee48acaa9200bc27db02b824998df7f894c2730b8b7caa192239ab91ad378' +
        '146e19be28e23210361916e13a7a463db9592919462c34d70835353a6e2747dccd65a68927465d5edac');
    await ontology.getHeight();
}

main();