'use strict';

// const NetUtils = require('./src/ontology/net_util');
// const Util = require('./src/comm/util.js');
const Ontology = require('./src/ontology/ontology');

/**
 *   test
 */
async function main(){
    let ontology = new Ontology('./benchmark/ontology/config.json');
    await ontology.installSmartContract();
    ontology.invokeSmartContract('', 'hello', '1.0.0', {func:'Hello', args:['ahkjghaklhgf']}, 30);
}

main();