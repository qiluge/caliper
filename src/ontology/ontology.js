'use strict';

const BlockchainInterface = require('../comm/blockchain-interface.js');
const axios = require('axios');
const TxStatus  = require('../comm/transaction');

/**
 * Implements {BlockchainInterface} for a Fabric backend.
 */
class Ontology extends BlockchainInterface{
    /**
     * Create a new instance of the {Fabric} class.
     * @param {string} config_path The path of the Fabric network configuration file.
     */
    constructor(config_path) {
        super(config_path);
    }

    /**
     * ontology no need init
     * @return {Promise} The return promise.
     */
    init() {
        return Promise.resolve();
    }

    /**
     * ontology no need install smart contract
     * @return {Promise} The return promise.
     */
    installSmartContract() {
        return Promise.resolve();
    }

    /**
     * ontology no need context
     * @param {string} name The name of the callback module as defined in the configuration files.
     * @param {object} args Unused.
     * @return {object} The assembled Fabric context.
     */
    getContext(name, args) {
        return Promise.resolve();
    }

    /**
     * ontology no need context
     * @param {object} context The Fabric context to release.
     * @return {Promise} The return promise.
     */
    releaseContext(context) {
        return Promise.resolve();
    }

    /**
     * Invoke the given chaincode according to the specified options. Multiple transactions will be generated according to the length of args.
     * @param {object} context The Fabric context returned by {getContext}.
     * @param {string} contractID The name of the chaincode.
     * @param {string} contractVer The version of the chaincode.
     * @param {Array} args Array of JSON formatted arguments for transaction(s). Each element containts arguments (including the function name) passing to the chaincode. JSON attribute named transaction_type is used by default to specify the function name. If the attribute does not exist, the first attribute will be used as the function name.
     * @param {number} timeout The timeout to set for the execution in seconds.
     * @return {Promise<object>} The promise for the result of the execution.
     */
    invokeSmartContract(context, contractID, contractVer, args, timeout) {
        let data;
        let txId;
        args.forEach((item, index)=>{
            if (item.hasOwnProperty('txData')){
                data = item.txData;
            }
            if (item.hasOwnProperty('txHash')){
                txId = item.txHash;
            }
        });
        let invokeStatus = new TxStatus(txId);
        invokeStatus.SetStatusSuccess();
        axios.post('http://localhost:20334/api/v1/transaction', {
            'Action': 'sendrawtransaction',
            'Version': '1.0.0',
            'Data': data
        });
        return Promise.resolve(invokeStatus);
    }
}
module.exports = Ontology;