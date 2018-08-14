'use strict';

module.exports.info = 'sendTx ont';
const Util = require('../../src/comm/util.js');
const log = Util.log;
const ontSdk = require('ontology-ts-sdk');

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
    txNum = args.txNum;
    if (invokeContract && (!args.hasOwnProperty('contractName') || !args.hasOwnProperty('func'))) {
        return Promise.reject(new Error('sendTx init - "contractName" or "func" is missed in the arguments'));
    }
    log('start generate tx');
    if (invokeContract) {
        for (let i = 0; i < txNum; i++) {
            let invokeArgs;
            invokeArgs.func = args.func;
            invokeArgs.args = args.args;
            let tx = bc.bcObj.genInvokeSmartContractTx(args.contractName, args.version, invokeArgs);
            ontSdk.TransactionBuilder.signTransaction(tx, bc.bcObj.privateKey);
            txHash.push(ontSdk.utils.reverseHex(tx.getHash()));
            txData.push(tx.serialize());
        }
    } else {
        for (let i = 0; i < txNum; i++) {
            // if the client only monitor, push a fake tx hash
            // the fake hash is not queried in chain
            txHash.push('37e017cb9de93aa93ef817e82c555812a0a6d5c3f7d6c521c7808a5a77fc93c7');
        }
    }
    log('generate down');
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
        return bc.sendTx(txData[txIndex], txHash[txIndex]);
    } else {
        return bc.sendNon(txHash[txIndex]);
    }
};

module.exports.end = function () {
    txHash = [];
    txData = [];
    return Promise.resolve();
};
