/**
 * Copyright 2017 HUAWEI. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 */

'use strict';
const TxStatus = require('../comm/transaction');

/**
 * BlockChain class, define operations to interact with the blockchain system under test
 */
class Blockchain {
    /**
     * Constructor
     * @param {String} configPath path of the blockchain configuration file
     */
    constructor(configPath) {
        let config = require(configPath);

        if (config.hasOwnProperty('ontology')) {
            let ontology = require('../ontology/ontology');
            this.bcType = 'ontology';
            this.bcObj = new ontology(configPath);
        }
        else {
            this.bcType = 'unknown';
            throw new Error('Unknown blockchain config file ' + configPath);
        }
    }

    /**
     * return the blockchain's type
     * @return {string} type of the blockchain
     */
    getType() {
        return this.bcType;
    }

    /**
     * Initialise test environment, e.g. create a fabric channel for the test
     * @return {Promise} promise object
     */
    init() {
        return this.bcObj.init();
    }

    /**
     * Perform required preparation for test clients, e.g. enroll clients and obtain key pairs
     * @param {Number} number count of test clients
     * @return {Promise} array of obtained material for test clients
     */
    prepareClients(number) {
        return this.bcObj.prepareClients(number);
    }

    /**
     * Install smart contract(s), detail informations are defined in the blockchain configuration file
     * @return {Promise} promise object
     */
    installSmartContract() {
        return this.bcObj.installSmartContract();
    }

    /**
     * Get a context for subsequent operations, e.g. invoke smart contract or query state
     * @param {String} name name of the context
     * @param {Object} args adapter specific arguments
     * @return {Promise} obtained context object
     */
    getContext(name, args) {
        return this.bcObj.getContext(name, args);
    }

    /**
     * Release a context as well as related resources
     * @param {Object} context adapter specific object
     * @return {Promise} promise object
     */
    releaseContext(context) {
        return this.bcObj.releaseContext(context);
    }

    /**
     * Invoke smart contract/submit transactions and return corresponding transactions' status
     * @param {Object} context context object
     * @param {String} contractID identiy of the contract
     * @param {String} contractVer version of the contract
     * @param {Array} args array of JSON formatted arguments for multiple transactions
     * @param {Number} timeout request timeout, in second
     * @return {Promise} txStatus object or an array of txStatus objects
     */
    invokeSmartContract(context, contractID, contractVer, args, timeout) {
        let arg, time;    // compatible with old version
        if (Array.isArray(args)) {
            arg = args;
        }
        else if (typeof args === 'object') {
            arg = [args];
        }
        else {
            return Promise.reject(new Error('Invalid args for invokeSmartContract()'));
        }

        if (typeof timeout !== 'number' || timeout < 0) {
            time = 120;
        }
        else {
            time = timeout;
        }

        return this.bcObj.invokeSmartContract(context, contractID, contractVer, arg, time);
    }

    /**
     * send transaction
     * @param {Object} context context object
     * @param {string} txHash transaction data
     * @param {string} txData transaction hash
     * @return {TxStatus}The txStatus for the transaction
     */
    sendTx(context, txHash, txData) {
        return this.bcObj.sendTx(context, txHash, txData);
    }

    /**
     * wait a block to catch up destHeight, if arg destHeight not defined, wait a block generate
     * @param {int} destHeight start height
     * @return {Promise} bcObj.waitABlock()
     */
    async waitABlock(destHeight) {
        return this.bcObj.waitABlock(destHeight);
    }

    /**
     * Query state from the ledger
     * @param {Object} context context object from getContext
     * @param {String} contractID identiy of the contract
     * @param {String} contractVer version of the contract
     * @param {String} key lookup key
     * @return {Promise} as invokeSmateContract()
     */
    queryState(context, contractID, contractVer, key) {
        return this.bcObj.queryState(context, contractID, contractVer, key);
    }

    /**
     * Calculate the default transaction statistics
     * @param {Array} results array of txStatus
     * @param {Boolean} detail indicates whether to keep detailed information
     * @return {JSON} txStatistics JSON object
     */
    getDefaultTxStats(results, detail) {
        let succ = 0, fail = 0, delay = 0;
        let minFinal, maxFinal, minCreate, maxCreate;
        let minDelay = 100000, maxDelay = 0;
        let delays = [];
        for (let i = 0; i < results.length; i++) {
            let stat = results[i];
            let create = stat.GetTimeCreate();

            if (typeof minCreate === 'undefined') {
                minCreate = create;
                maxCreate = create;
            }
            else {
                if (create < minCreate) {
                    minCreate = create;
                }
                if (create > maxCreate) {
                    maxCreate = create;
                }
            }

            if (stat.IsCommitted()) {
                succ++;
                let final = stat.GetTimeFinal();
                let d = (final - create) / 1000;
                if (typeof minFinal === 'undefined') {
                    minFinal = final;
                    maxFinal = final;
                }
                else {
                    if (final < minFinal) {
                        minFinal = final;
                    }
                    if (final > maxFinal) {
                        maxFinal = final;
                    }
                }

                delay += d;
                if (d < minDelay) {
                    minDelay = d;
                }
                if (d > maxDelay) {
                    maxDelay = d;
                }

                if (detail) {
                    delays.push(d);
                }
            }
            else {
                fail++;
            }
        }

        let stats = {
            'succ': succ,
            'fail': fail,
            'create': {'min': minCreate / 1000, 'max': maxCreate / 1000},    // convert to second
            'final': {'min': minFinal / 1000, 'max': maxFinal / 1000},
            'delay': {'min': minDelay, 'max': maxDelay, 'sum': delay, 'detail': (detail ? delays : [])},
            'out': []
        };
        return stats;
    }

    /**
     * merge an array of default 'txStatistics', the result is in first object of the array
     * Note even failed the first object of the array may still be changed
     * @param {Array} results txStatistics array
     * @return {Number} 0 if failed; otherwise 1
     */
    static mergeDefaultTxStats(results) {
        try {
            // skip invalid result
            let skip = 0;
            for (let i = 0; i < results.length; i++) {
                let result = results[i];
                if (!result.hasOwnProperty('succ') || !result.hasOwnProperty('fail') || (result.succ + result.fail) === 0) {
                    skip++;
                }
                else {
                    break;
                }
            }
            if (skip > 0) {
                results.splice(0, skip);
            }

            if (results.length === 0) {
                return 0;
            }

            let r = results[0];
            for (let i = 1; i < results.length; i++) {
                let v = results[i];
                if (!v.hasOwnProperty('succ') || !v.hasOwnProperty('fail') || (v.succ + v.fail) === 0) {
                    continue;
                }
                r.succ += v.succ;
                r.fail += v.fail;
                r.out.push.apply(r.out, v.out);
                if (v.create.min < r.create.min) {
                    r.create.min = v.create.min;
                }
                if (v.create.max > r.create.max) {
                    r.create.max = v.create.max;
                }
                if (v.final.min < r.final.min) {
                    r.final.min = v.final.min;
                }
                if (v.final.max > r.final.max) {
                    r.final.max = v.final.max;
                }
                if (v.delay.min < r.delay.min) {
                    r.delay.min = v.delay.min;
                }
                if (v.delay.max > r.delay.max) {
                    r.delay.max = v.delay.max;
                }
                r.delay.sum += v.delay.sum;
                for (let j = 0; j < v.delay.detail.length; j++) {
                    r.delay.detail.push(v.delay.detail[j]);
                }
            }
            return 1;
        }
        catch (err) {
            return 0;
        }
    }

    /**
     * create a 'null' txStatistics object
     * @return {JSON} 'null' txStatistics object
     */
    static createNullDefaultTxStats() {
        return {succ: 0, fail: 0};
    }

    /**
     * get current height
     * @return {int} current height
     */
    getHeight() {
        return this.bcObj.getHeight();
    }

    /**
     * get current height
     * @param {int} height block height
     * @return {string[]} all tx hashes in the block
     */
    getBlockTxHashes(height) {
        return this.bcObj.getBlockTxHashes(height);
    }

    /**
     * insure tx
     * @param {string} txHash tx hash
     * @return {Promise} tx is success or failed
     */
    insureTx(txHash) {
        return this.bcObj.insureTx(txHash);
    }

    /**
     * get block generated time
     * @param{int} height is block height
     * @return {Promise} block
     */
    getBlockGenerateTime(height) {
        return this.bcObj.getBlockGenerateTime(height);
    }

    /**
     * get block by height
     * @param{int} height is block height
     * @return {Promise} block timestamp
     */
    getBlockByHeight(height) {
        return this.bcObj.getBlockByHeight(height);
    }
}

module.exports = Blockchain;