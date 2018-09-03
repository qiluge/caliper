'use strict';

// const NetUtils = require('./src/ontology/net_util');
// const Util = require('./src/comm/util.js');
// const Ontology = require('./src/ontology/ontology');
// const transfetr = require('./benchmark/ontology/transfer');

// const BlockChain = require('./src/comm/blockchain');
// const _ = require('lodash');

const readline = require('readline');
const fs = require('fs');
/**
 *   test
 */
async function main() {
    const read = readline.createInterface({
        input:fs.createReadStream('./transfer.txt')
    });
    let i = 1;
    read.on('line', (line) => {
        console.log('Line from file:' + i + ':' + line);
        i += 1;
    });
}

main();