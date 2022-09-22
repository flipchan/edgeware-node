### First Configure your node endpoint    
Edit script src/upgrade.ts config and set your endpoint and the location of the wasm file you want to push as an runtime upgrade
```js
const config = {
    wsendpoint: 'ws://mynode:9944',// ws host
    rpcendpoint: 'http://mynode:9933', // rpc http host
    wasmpath: '../../wasm/burp28.compact.wasm' // copy target/release/wbuild/ compacted wasm file for the runtime upgrade you want to push to this local file path
}
```

### Second build and run me   
yarn install   

yarn run start

The script will ask you to manually switch the node binary after it has submitted the runtime upgrade, stop your node and restart it with the new target/release/edgeware file and watch the migrations kick in.

## How to add more tests:  
The tests comes with both a WS socket connect function (`wsconnect`) and an 
rpc connection function (`connect`). The rpc connect function is the recommended way to connect   
to a chain, because rpc allows us to use bigger payloads for sending and recieving more data from the node.

The polkadot.js typescript syntax is pretty straight forward:
```js
const api = await connect(); // we connect over rpc to our chain and get the chain at the latest finalized block

// use our api instance
// we can choose between query, tx and const
// than we pick our pallet
// lastly we pick the function we want to use from our pallet
var myresponse = await api.query.pallet.method(input);
```



### Currrent functionality: 
*  Saves and compares runtime version and several pallet constants after the upgrade takes places
*  Support both rpc and ws connects, defaults to rpc   
*  Prefunds tests accounts before runtime upgrade and checks balances after runtime upgrade   
*  Uploads new Runtime upgrade with Sudo key    
*  Waits and detects new runtime upgrade based on networks spec_Version     
*  Tests new v7 contract pallet by uploading an ink contract   
*  Test idenity, treasury pallet   
*  Compares old data with new data with `expect` from chai    
*  Test council by submitting candidacy before upgrade and checking if candidate is still running after   
*  Connects to old metadata format and new v14 after upgrade one      
*  Removes edgeware custom types and connects withouthem to verify metadata v14 upgrade
*  Fixed edgeware fork-off connection bug
*  Elections > phragmenElection
*  Before and after voting with elections
*  Wasm only ws socket connect  
*  Council voting tests   

### Development tips:   
When this was developed I(flipchan) had two chains running at the same time, the old/current one and the new one. The config makes it super easy to just change port as I was running on instance with `--ws-port 5555 --rpc-port 5558` and the other with `--ws-port 5556  --rpc-port 5559`.
Copy the wasm file to local disk.    

This test suit also comes with the support of uploading a ink contract. Change the 'src/contract/lib.rs' and `cargo +nightly contract build --release`. 



#### Council after voting output:   
```shell

Council Voting test, connecting with wasm ws socket
2022-09-22 02:06:59        API/INIT: edgeware/52: Not decorating unknown runtime apis: 0xa33d43f58731ad84/2
Connection with wasm ws socket ok
Candidates: []
used address: 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty
submitted bob as candidacy with txid 0x645cc4a2abea6863559299a3554369390a042d002846321537fc6cac592f2406
sleeping until next block
wakes up
2022-09-22 02:07:10        API/INIT: edgeware/52: Not decorating unknown runtime apis: 0xa33d43f58731ad84/2
Checking new that new candidate has been added 
new candidates: [["kjhbn6zW5vFQ2cF2HrdrLHbMHBhrTrGGuAbc6yAXNY2HgAv","0x000000000000003635c9adc5dea00000"]]
New candidacy added ok
2022-09-22 02:07:14        API/INIT: edgeware/52: Not decorating unknown runtime apis: 0xa33d43f58731ad84/2
voting for bob
Voted for bob with tx: 0x71817c5173d6ab885cf4b793f8a4bb2b8912cabc8beeeb321606a5369dd0470c
2022-09-22 02:07:24        API/INIT: edgeware/52: Not decorating unknown runtime apis: 0xa33d43f58731ad84/2
Checking vote
votes: [kjhbn6zW5vFQ2cF2HrdrLHbMHBhrTrGGuAbc6yAXNY2HgAv]
loopme; [kjhbn6zW5vFQ2cF2HrdrLHbMHBhrTrGGuAbc6yAXNY2HgAv] kjhbn6zW5vFQ2cF2HrdrLHbMHBhrTrGGuAbc6yAXNY2HgAv
vote registered ok
removing all votes
Removing vote with tx id: 0x85be61e4181dce38de112415125f0e396226e9383e77968e44d4f11376864479
Waiting for next block
wakes up
2022-09-22 02:07:34        API/INIT: edgeware/52: Not decorating unknown runtime apis: 0xa33d43f58731ad84/2
Checking bobs votes
Votes removed ok

```
Note:   
pallet is now called phragmenElection instead of Elections.

#### Useful links:  
https://polkadot.js.org/docs/   
https://github.com/polkadot-js/api
https://yarnpkg.com/package/@polkadot/types  
https://github.com/paritytech/cargo-contract    
https://ink.substrate.io/getting-started/building-your-contract   

