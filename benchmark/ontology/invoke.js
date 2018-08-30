'use strict';

module.exports.info = 'invoke contract';
const Util = require('../../src/comm/util.js');
const log = Util.log;
const ontSdk = require('ontology-ts-sdk');
const fs = require('fs');

let txNum, txIndex;
let bc;
let txHash = [], txData = [];
let invokeContract = true; // false means that client monitor only
let isRunDuration = false;
let invokeArgs = {};
let abiInfo = {};
let cxt;


// read tx from file, or use sdk to generate tx
module.exports.init = async function (blockchain, context, args) {
    if (!args.hasOwnProperty('invokeContract')) {
        return Promise.reject(new Error('sendTx init - "invokeContract" is missed in the arguments'));
    }
    invokeContract = args.invokeContract;
    bc = blockchain;
    cxt = context;
    bc.bcObj.monitorOnly = !invokeContract;
    txIndex = -1;
    if (invokeContract && !args.hasOwnProperty('func')) {
        return Promise.reject(new Error('sendTx init - "contractName" or "func" is missed in the arguments'));
    }
    txNum = args.txNum;
    if (txNum < 0) {
        isRunDuration = true;
    }
    // read abi info
    let abiFileContent = fs.readFileSync(args.abi, 'utf-8');
    abiInfo = ontSdk.AbiInfo.parseJson(abiFileContent);
    abiInfo.vmCode = fs.readFileSync(args.vmcode, 'utf-8');
    invokeArgs.func = args.func;
    invokeArgs.args = args.args;
    invokeArgs.version = args.version;
    log('start generate transfer %d tx', txNum);
    if (invokeContract && !isRunDuration) {
        for (let i = 0; i < txNum; i++) {
            let tx = bc.bcObj.genInvokeSmartContractTx(abiInfo, invokeArgs.version, invokeArgs);
            ontSdk.TransactionBuilder.signTransaction(tx, bc.bcObj.privateKey);
            txHash.push(ontSdk.utils.reverseHex(tx.getHash()));
            txData.push(tx.serialize());
        }
    } else {
        for (let i = 0; i < txNum; i++) {
            // if the client only monitor, push a fake tx hash
            // the fake hash is not queried in chain
            txHash.push('fbbc71163e20c95f7a33643b74f7e73fba68983caa95a71e6f929b1e686acb1e');
        }
    }
    log('generate invoke tx down');
    return Promise.resolve();
};


// should sendTx one time in one invoke
module.exports.run = function () {
    txIndex++;
    if (invokeContract) {
        if (isRunDuration) {
            let tx = bc.bcObj.genInvokeSmartContractTx(abiInfo, invokeArgs.version, invokeArgs);
            ontSdk.TransactionBuilder.signTransaction(tx, bc.bcObj.privateKey);
            return bc.sendTx(cxt, ontSdk.utils.reverseHex(tx.getHash()), tx.serialize());
        } else {
            return bc.sendTx(cxt, txHash[txIndex], txData[txIndex]);
        }
    } else {
        return bc.sendNon(cxt, txHash[txIndex]);
    }
};

module.exports.end = function () {
    txHash = [];
    txData = [];
    return Promise.resolve();
};
