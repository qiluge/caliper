'use strict';

module.exports.info  = 'transfer ont';
const fs = require('fs');
const Util = require('../../src/comm/util.js');
const log = Util.log;

let txNum, txIndex;
let bc, contx;
let txHash=[], tx=[];


// read tx from file, or use sdk to generate tx
module.exports.init = function(blockchain, context, args) {
    bc = blockchain;
    contx = context;
    txIndex = -1;
    let fileContent = fs.readFileSync('./transfer.txt', 'utf-8');
    let lineNum = 0;
    fileContent.split(/\r?\n/).forEach(function (line) {
        let lineContent = line.split(',');
        txHash[lineNum] = lineContent[0];
        tx[lineNum] = lineContent[1];
        lineNum++;
    });
    // last line is empty
    txNum = lineNum - 1;
    tx = tx.slice(0, tx.length - 1);
    txHash = txHash.slice(0, txHash.length - 1);
    log('read %d tx from file.', tx.length);
    return Promise.resolve();
};


// should transfer one time in one invoke
module.exports.run = function() {
    txIndex++;
    if (txIndex >= txNum) {
        txIndex = 0;
        log('there are no new tx, send duplicate tx to ontology!');
    }
    return bc.invokeSmartContract(contx, 'simple', 'v0', {txHash: txHash[txIndex], txData:tx[txIndex]}, 30);
};

module.exports.end = function() {
    txHash = [];
    tx = [];
    return Promise.resolve();
};
