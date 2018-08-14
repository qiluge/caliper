'use strict';

const axios = require('axios');
const Util = require('../comm/util.js');
const log  = Util.log;

/**
 * net util of ontology
 */
class NetUtil {
    /**
     * post tx to ontology
     * @param {string} txData The Fabric context returned by {getContext}.
     * @return {Promise} post result
     */
    static postTx(txData) {
        return axios.post('http://localhost:20334/api/v1/transaction', {
            'Action': 'sendrawtransaction',
            'Version': '1.0.0',
            'Data': txData
        }).then(function (response) {
            if (response.data.Error !== 0){
                return -1;
            }
            return 1;
        }).catch(function (error) {
            log('postTx err:', error.message);
            return -1;
        });
    }

    /**
     * get network current height
     * @return {Promise} the block height
     */
    static getHeight() {
        return axios.get('http://localhost:20334/api/v1/block/height')
            .then(function (response) {
                if (response.data.Error !== 0){
                    return 0;
                }
                return response.data.Result;
            })
            .catch(function (error) {
                log('getHeight err:', error.message);
                return 0;
            });
    }

    /**
     * get all tx hashes in the block
     * @param {int} height block height
     * @return {string[]} all tx hashes in the block
     */
    static getBlockTxHashes(height) {
        return axios.get('http://localhost:20334/api/v1/block/transactions/height/' + height)
            .then(function (response) {
                if (response.data.Error !== 0){
                    return;
                }
                return response.data.Result.Transactions;
            })
            .catch(function (error) {
                log('getBlockTxHashes err:', error.message);
            });
    }

    /**
     * insure tx is processed
     * @param {string} txHash tx hash
     * @return {Promise} tx is confirmed or not
     */
    static insureTx(txHash){
        return axios.get('http://localhost:20334/api/v1/transaction/' + txHash)
            .then(function (response) {
                return response.data.Error === 0;
            })
            .catch(function (error) {
                log('insureTx err:', error.message);
                return false;
            });
    }

    /**
     * get block by height
     * @param{int} height is block height
     * @return {Promise} block
     */
    static getBlock(height){
        return axios.get('http://localhost:20334/api/v1/block/details/height/' + height)
            .then(function (response) {
                if (response.data.Error !== 0){
                    return -1;
                }
                return response.data.Result;
            })
            .catch(function (error) {
                log('getBlock err:', error.message);
                return false;
            });
    }

    /**
     * get block by height
     * @param{string} addr is account base58 address
     * @return {Promise} balance json, contained ont and ong
     */
    static getBalance(addr){
        return axios.get('http://localhost:20334/api/v1/balance/' + addr)
            .then(function (response) {
                if (response.data.Error !== 0){
                    return -1;
                }
                return response.data.Result;
            })
            .catch(function (error) {
                log('getBlock err:', error.message);
                return false;
            });
    }
}


module.exports = NetUtil;
