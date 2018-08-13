'use strict';

module.exports.info  = 'transfer ont';
const fs = require('fs');
const Util = require('../../src/comm/util.js');
const log = Util.log;

let txNum, txIndex;
let bc;
let txHash=[], tx=[];
let sendTx = true; // false means that client monitor only


// read tx from file, or use sdk to generate tx
module.exports.init = function(blockchain, context, args) {
    if (!args.hasOwnProperty('sendTx')) {
        return Promise.reject(new Error('transfer init - "sendTx" is missed in the arguments'));
    }
    sendTx = args.sendTx;
    bc = blockchain;
    // contx = context;
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
    if (sendTx){
        return bc.transfer(tx[txIndex], txHash[txIndex]);
    }else {
        return bc.transferNon(txHash[txIndex]);
    }
};

module.exports.end = function() {
    txHash = [];
    tx = [];
    return Promise.resolve();
};
