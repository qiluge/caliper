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
            log(error);
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
                    return -1;
                }
                return response.data.Result;
            })
            .catch(function (error) {
                log(error);
                return -1;
            });
    }

    /**
     * get all tx hashes in the block
     * @param {int} height block height
     * @return {string[]} all tx hashes in the block
     */
    static getTxNumOfHeight(height) {
        return axios.get('http://localhost:20334/api/v1/block/transactions/height/' + height)
            .then(function (response) {
                if (response.data.Error !== 0){
                    return;
                }
                return response.data.Result.Transactions;
            })
            .catch(function (error) {
                log(error);
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
                log(error);
                return false;
            });
    }
}


module.exports = NetUtil;
