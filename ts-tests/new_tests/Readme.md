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


#### Useful links:  
https://polkadot.js.org/docs/   
https://github.com/polkadot-js/api
https://yarnpkg.com/package/@polkadot/types  
https://github.com/paritytech/cargo-contract    