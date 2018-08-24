'use strict';

module.exports.info = 'transfer';
const Util = require('../../src/comm/util.js');
const log = Util.log;
const ontSdk = require('ontology-ts-sdk');

let txNum, txIndex;
let bc;
let txHash = [], txData = [];
let sendTx = true; // false means that client monitor only
let isRunDuration = false;
let asset, toAddress;
let amountPerTx = 1;
let cxt;

// read tx from file, or use sdk to generate tx
module.exports.init = async function (blockchain, context, args) {
    if (!args.hasOwnProperty('sendTx')) {
        return Promise.reject(new Error('sendTx init - "sendTx" is missed in the arguments'));
    }
    sendTx = args.sendTx;
    bc = blockchain;
    cxt = context;
    txIndex = -1;
    bc.bcObj.monitorOnly = !sendTx;
    if (sendTx) {
        await bc.bcObj.initAsset();
    }
    if (sendTx && !args.hasOwnProperty('sendToAddress')) {
        return Promise.reject(new Error('sendTx init - "sendToAddress" is missed in the arguments'));
    } else {
        toAddress = args.sendToAddress;
    }
    if (!args.hasOwnProperty('asset')) {
        asset = 'ONG';
    } else {
        asset = args.asset;
    }
    if (asset === 'ONT') {
        amountPerTx = 1;
    }
    log('start generate transfer tx');
    let txPromise = [];
    txNum = args.txNum;
    if (txNum < 0) {
        isRunDuration = true;
    }
    if (sendTx && !isRunDuration) {
        for (let i = 0; i < txNum; i++) {
            txPromise.push(new Promise((resolve, reject) => {
                let tx = ontSdk.OntAssetTxBuilder.makeTransferTx(asset, bc.bcObj.account.address,
                    new ontSdk.Crypto.Address(toAddress), amountPerTx, '0', '20000', bc.bcObj.account.address);
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
                txHash.push('fbbc71163e20c95f7a33643b74f7e73fba68983caa95a71e6f929b1e686acb1e');
                resolve();
            }));
        }
    }
    await Promise.all(txPromise);
    log('generate transfer tx down');
    return Promise.resolve();
};


// should sendTx one time in one invoke
module.exports.run = function () {
    txIndex++;
    if (sendTx) {
        if (isRunDuration) {
            return new Promise((resolve, reject) => {
                let tx = ontSdk.OntAssetTxBuilder.makeTransferTx(asset, bc.bcObj.account.address,
                    new ontSdk.Crypto.Address(toAddress), amountPerTx, '0', '20000', bc.bcObj.account.address);
                ontSdk.TransactionBuilder.signTransaction(tx, bc.bcObj.privateKey);
                return resolve([ontSdk.utils.reverseHex(tx.getHash()), tx.serialize()]);
            }).then((tx) => {
                return bc.sendTx(cxt, tx[0], tx[1]);
            });
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
