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


// read tx from file, or use sdk to generate tx
module.exports.init = async function (blockchain, context, args) {
    if (!args.hasOwnProperty('invokeContract')) {
        return Promise.reject(new Error('sendTx init - "invokeContract" is missed in the arguments'));
    }
    invokeContract = args.invokeContract;
    bc = blockchain;
    bc.bcObj.monitorOnly = !invokeContract;
    txIndex = -1;
    txNum = args.txNum;
    if (invokeContract && !args.hasOwnProperty('func')) {
        return Promise.reject(new Error('sendTx init - "contractName" or "func" is missed in the arguments'));
    }
    log('start generate invoke tx');
    let txPromise = [];
    if (invokeContract) {
        // read abi info
        let abiFileContent = fs.readFileSync(args.abi, 'utf-8');
        let abiInfo = ontSdk.AbiInfo.parseJson(abiFileContent);
        abiInfo.vmCode = fs.readFileSync(args.vmcode, 'utf-8');
        for (let i = 0; i < txNum; i++) {
            txPromise.push(new Promise((resolve, reject) => {
                let invokeArgs = {};
                invokeArgs.func = args.func;
                invokeArgs.args = args.args;
                let tx = bc.bcObj.genInvokeSmartContractTx(abiInfo, args.version, invokeArgs);
                ontSdk.TransactionBuilder.signTransaction(tx, bc.bcObj.privateKey);
                txHash.push(ontSdk.utils.reverseHex(tx.getHash()));
                txData.push(tx.serialize());
                resolve();
            }));
        }
    } else {
        for (let i = 0; i < txNum; i++) {
            txPromise.push(new Promise((resolve, reject) => {
                // if the client only monitor, push a fake tx hash
                // the fake hash is not queried in chain
                txHash.push('37e017cb9de93aa93ef817e82c555812a0a6d5c3f7d6c521c7808a5a77fc93c7');
                resolve();
            }));
        }
    }
    log('generate invoke tx down');
    return Promise.resolve();
};


// should sendTx one time in one invoke
module.exports.run = function () {
    txIndex++;
    if (txIndex >= txNum) {
        txIndex = 0;
        log('there are no new tx, send duplicate tx to ontology!');
    }
    if (invokeContract) {
        return bc.sendTx(txHash[txIndex], txData[txIndex]);
    } else {
        return bc.sendNon(txHash[txIndex]);
    }
};

module.exports.end = function () {
    txHash = [];
    txData = [];
    return Promise.resolve();
};
