'use strict';

const BlockchainInterface = require('../comm/blockchain-interface.js');
const TxStatus = require('../comm/transaction');
const Util = require('../comm/util.js');
const log = Util.log;
const NetUtil = require('./net_util.js');

/**
 * Implements {BlockchainInterface} for a Fabric backend.
 */
class Ontology extends BlockchainInterface {
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
     * transfer ont or ong
     * @param {string} txHash transaction data
     * @param {string} txData transaction hash
     * @return {TxStatus}The txStatus for the transaction
     */
    transfer(txHash, txData) {
        let invokeStatus = new TxStatus(txHash);
        return NetUtil.postTx(txData).then((result) => {
            if (result < 0) {
                invokeStatus.SetStatusFail();
                log('tx %s failed', result.GetID());
            }
            log('sendtx');
            return invokeStatus;
        });
    }

    /**
     * get current height
     * @return {int} current height
     */
    async getHeight() {
        return await NetUtil.getHeight();
    }

    /**
     * get current height
     * @param {int} height block height
     * @return {string[]} all tx hashes in the block
     */
    async getBlockTxHashes(height) {
        return await NetUtil.getTxNumOfHeight(height);
    }

    /**
     * insure tx
     * @param {string} txHash tx hash
     * @return {Promise} tx is success or failed
     */
    async insureTx(txHash) {
        return await NetUtil.insureTx(txHash);
    }
}

module.exports = Ontology;