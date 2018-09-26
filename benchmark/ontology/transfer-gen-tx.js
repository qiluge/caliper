'use strict';

module.exports.info = 'transfer';
const ontSdk = require('ontology-ts-sdk');

let bc;
let sendTx = true; // false means that client monitor only
let cxt;

// read tx from file, or use sdk to generate tx
module.exports.init = async function (blockchain, context, args) {
    if (!args.hasOwnProperty('sendTx')) {
        return Promise.reject(new Error('sendTx init - "sendTx" is missed in the arguments'));
    }
    sendTx = args.sendTx;
    bc = blockchain;
    cxt = context;
    if (sendTx) {
        await bc.bcObj.initAsset();
    }
    return Promise.resolve(sendTx);
};


// should sendTx one time in one invoke
module.exports.run = function () {
    const transferOngTx = ontSdk.OntAssetTxBuilder.makeTransferTx('ONG', bc.bcObj.account.address,
        new ontSdk.Crypto.Address('AX31az5amZaxYXikCGcZp1PN5kNm81cYWy'), 1000000000, '0', '20000',
        bc.bcObj.account.address);
    ontSdk.TransactionBuilder.signTransaction(transferOngTx, bc.bcObj.privateKey);
    let txHash = ontSdk.utils.reverseHex(transferOngTx.getHash());
    let txData = transferOngTx.serialize();
    return bc.sendTx(cxt, txHash, txData);
};

module.exports.end = function () {
    return Promise.resolve();
};
