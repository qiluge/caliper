'use strict';
// const req = require('request');
const ps = require('ps-node');

/**
*   test
*/
function main(){
    // ps.lookup({ command: './ontology',
    //     arguments: '--testmode --networkid 3 --gaslimit 0 --gasprice 0 --rest --localrpc'}, (err, resultList) => {
    //     if (err) {
    //         console.log('failed looking the process up: ' + err);
    //     }
    //     else {
    //         for(let i = 0 ; i < resultList.length ; i++) {
    //             console.log('findprocs pid is ', resultList[i].pid);
    //         }
    //     }
    // });
    ps.lookup({ command: 'ontology',arguments: '--testmode,--networkid,3,--gaslimit,0,--gasprice,0,--rest,--localrpc'
    }, function(err, resultList ) {
        if (err) {
            throw new Error( err );
        }

        resultList.forEach(function( process ){
            if( process ){

                console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
            }
        });
    });
}

main();