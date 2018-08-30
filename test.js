'use strict';

// const NetUtils = require('./src/ontology/net_util');
// const Util = require('./src/comm/util.js');
const Ontology = require('./src/ontology/ontology');
// const transfetr = require('./benchmark/ontology/transfer');

// const BlockChain = require('./src/comm/blockchain');
// const _ = require('lodash');
/**
 *   test
 */
async function main() {
    let bc = new Ontology('benchmark/ontology/ontology.json');
    await bc.waitABlock();
    let currentHeight = await bc.getHeight();
    let generateTime = await bc.getBlockGenerateTime(currentHeight);
    let nodeTime = Date.now();
    console.log('generateTime is %d, nodeTime is %d, difference is %d', generateTime * 1000, nodeTime,
        generateTime * 1000 - nodeTime);
}

main();