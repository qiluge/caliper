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
    ontology.initAsset();
}

main();