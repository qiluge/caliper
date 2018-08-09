'use strict';

const NetUtils = require('./src/ontology/net_util');
const Util = require('./src/comm/util.js');


/**
 *   test
 */
async function main(){
    let newHeight = 0;
    let i = 0;
    while (i < 3){
        await Util.sleep(6000).then(() => {
        });
        // await NetUtils.getHeight().then((height) =>{
        //     newHeight = height;
        // });
        newHeight = await NetUtils.getHeight();
        console.log(newHeight);
        i++;
    }
    // console.log(await NetUtils.getHeight().then());
}

main();