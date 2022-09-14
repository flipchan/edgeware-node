import { hexToNumber, bnToHex, hexToBigInt } from "@polkadot/util";
import { BN } from "@polkadot/util";
import { encodeAddress, blake2AsHex  } from "@polkadot/util-crypto";
import { ApiPromise, WsProvider } from "@polkadot/api"; 
import { HttpProvider } from '@polkadot/rpc-provider'; // we want to use rpc
import { Option, Struct } from '@polkadot/types';
import { AccountId, Balance, BlockNumber, Hash } from '@polkadot/types/interfaces/runtime';
import { Codec, Registry } from '@polkadot/types/types';
import { assert, expect } from 'chai';
import { compactAddLength } from '@polkadot/util';
import { promises as fspromise } from 'fs';
import { createType } from '@polkadot/types';

import '@polkadot/api-augment';

//https://github.com/polkadot-js/api/releases/tag/v7.0.1


//import { TreasuryProposal } from '@polkadot/types/interfaces';
//import { assert } from "console";
import { Keyring } from '@polkadot/keyring';
import { spec } from '@edgeware/node-types';

export interface TreasuryProposal extends Struct {
    readonly proposer: AccountId;
    readonly value: Balance;
    readonly beneficiary: AccountId;
    readonly bond: Balance;
}


// config me
const config = {
    wsendpoint: 'ws://eagle:5555',//'ws://127.0.0.1:9944',
    rpcendpoint: 'http://eagle:5555',//'http://eagle:9988',//"wss://edgeware.api.onfinality.io/public",
    wasmpath: '../../wasm/latest.wasm'
}


// chain tests

async function test_democracy() {
    
}

async function preupgrade_test_storage(block: BlockNumber){

}


async function afterupgrade_test_storage(block: BlockNumber){

}

function hex_to_string(metadata) {
    return metadata.match(/.{1,2}/g).map(function(v){
      return String.fromCharCode(parseInt(v, 16));
    }).join('');
  }


async function upload_runtime_upgrade(){
    // sudo > system > setCodeWithoutChecks
    const sudoac = get_alice();
    const api = await connect();

    // verify sudo key

    const sudoKey = await api.query.sudo.key();
    if (sudoKey.isEmpty) {
        throw new Error('sudo key not set');
    }

   // const keyring = new Keyring({ type: 'sr25519' });
   // const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });
   // console.log(`${alice.meta.name}: has address ${alice.address} with publicKey [${alice.publicKey.toString()}]`);
   // const sudoPair = keyring.getPair(sudoKey.toString());
    const alicecheck = 'jyUFc7YWkYfVhNbsr1mLLBiVqYnFTfHM7k77Jq3quuNfBBq';
    console.log(`Checking if sudo is alice`);
   // expect(sudoKey.toHuman().toString()).to.equal(alicecheck, 'Sudo is not alice');
   
    console.log(`Reading wasm file ${config.wasmpath}`);
   
    const data = await fspromise.readFile(config.wasmpath);

    const buff = Buffer.from(data);
    const hash = blake2AsHex(buff);
    

    console.log(`Sending Runtime upgrade tx with sudo`);
    // convert wasm file to hex and send it with sudo
   
    const unsub = await api.tx.sudo
    .sudoUncheckedWeight(
        api.tx.system.setCodeWithoutChecks(`0x${buff.toString('hex')}`), 10000

        //  api.tx.balances.setBalance(ADDR, 12345, 678)
    )
    .signAndSend(sudoac);
    
    console.log(`Runtime upgrade sent with ${unsub}`);
 
    /*
2022-09-14 14:58:06  Cannot create a runtime: InvalidModule                   
2022-09-14 14:58:06  Cannot create a runtime: InvalidModule                   
2022-09-14 14:58:06  Unsupported Offchain Worker API version: (Err(VersionInva
id("RuntimeConstruction(InvalidModule)")), Err(VersionInvalid("RuntimeConstruc
ion(InvalidModule)"))). Consider turning off offchain workers if they are not 
art of your runtime..                                                         
                                                                              
2022-09-14 14:58:10  💤 Idle (0 peers), best: #615 (0xba25…90a4), finalized #6
3 (0x8d48…5467), ⬇ 0 ⬆ 0                                                      
                                                                              
2022-09-14 14:58:12  Cannot create a runtime: InvalidModule                   
2022-09-14 14:58:12  Unable to author block in slot 277193382,. `can_author_wi
h` returned: Failed to get runtime version at `BlockId::Hash(0xba253965199db17
1c2ad67281c805c373ec0a3ecee2fce5a8e8d9b6130690a4)` and will disable authoring.
Error: VersionInvalid("RuntimeConstruction(InvalidModule)") Probably a node up
ate is required!                                                              

    */
    
   // const sudoupload = await api.tx.sudo.sudoUncheckedWeight(
   //     api.tx.system.setCodeWithoutChecks(`0x${buff.toString('hex')}`, 1)
   // ).signAndSend(sudoac);

   // console.log(`Runtime upgrade sent with ${sudoupload}`);
    
    
   // const sudotx = await api.tx.sudo.system.setCodeWithoutChecks();

    console.log(`Runtime upgrade pushed`);
}


async function test_identity(){
    console.log(`testing identity`)
    const api = await connect();
   const charlie = get_charlie();
   console.log('Chalie is setting an identity');
   const tx = await api.tx.identity.setIdentity({display:  { raw: 'i am Charlie' }}).signAndSend(charlie);
    console.log(`tx sent: ${tx}`)
    // query identity
    const checkit = await api.query.identity.identityOf(charlie.address);
    if (!checkit.isSome) {
        throw new Error('identity registration not found');
      }
    
    console.log('Checking value')
    expect(hex_to_string(checkit.unwrapOrDefault().info.display.toHex()).toString()).to.equal('\x00\ri am Charlie', 'Charlie identity set fails'); // todo fix encoding
    console.log('Value ok');

      //console.log(`
     // Check it: ${}
     // `);

}


async function test_council(){
    console.log(`Testing council`);
    // get the current election candidates
    const api = await connect();
 //   const { metadata } = await api.rpc.state.getMetadata();
   // const modules = metadata.asLatest.modules;

    const startCandidates = await api.query.elections.candidacy() ;
    const fluff = startCandidates;
    console.log(`start candidates: ${startCandidates}`);
    const charlie = get_charlie();
    console.log(`Charlie runs for council`);
    const submitc_txhash = api.tx.elections.submitCandidacy(startCandidates.encodedLength).signAndSend(charlie);
    console.log(`Charlie tx sent: ${submitc_txhash}`);
    // submit candidacy 


    // vote for charlie

    //current 

    // check that bob has voted 

}


async function test_treasury() {
    console.log("Testing treasury");
    // create a treasure proposal
    const api = await connect();

    // send it with charlie
    const charlie = get_charlie(); // sender
    const bob = get_bob(); // reciever
    // Create the transaction
    console.log("Sending treasury proposeSpend to bob from charlie");
    const tx = api.tx.treasury.proposeSpend('1000000000000', bob.address);
    const txhash =  await tx.signAndSend(charlie); // send tx from charlie
    console.log(`Charlie has sent a propose sent to the treasury with txhash: ${txhash}`);
   
    // query the proposal
    const proposalCount = await api.query.treasury.proposalCount();
    //: Option<TreasuryProposal>: Option<TreasuryProposal>
   // const p2: Option<TreasuryProposal> = await api.query.treasury.proposals(+proposalCount - 1);//.unwrap();
   console.log(`proposal count; ${proposalCount}`);
   const p2 = await api.query.treasury.proposals(+proposalCount - 1);

   
    if (p2.isNone) {
       throw new Error('treasury proposal not found');
      }
    const p2json = p2.unwrapOrDefault();
    console.log(`p2: ${p2json}`);
   // const p: Option<TreasuryProposal> = p2.unwrap(); //TreasuryProposal
      console.log(`
      Charlie: ${charlie.address}
      Bob: ${bob.address}
      `);
   
    // verify that proposal went throw ok
    console.log(`Checking value of proposal`) 
    expect(p2json.value.toNumber()).to.equal(1000000000000, "Value is not okey");
    console.log('Value check ok');
    console.log(`Checking proposer`)
    expect(p2json.proposer.toString()).to.equal('knMfxF2q5ot2e1uZ5SxqzjtBQs5qmj7hgRw97GGomiYasKo', 'proposer is not Charlie');
    console.log("checking beneficiary");
    expect(p2json.beneficiary.toString()).to.equal('kjhbn6zW5vFQ2cF2HrdrLHbMHBhrTrGGuAbc6yAXNY2HgAv', 'beneficiary is not bob! ')
    console.log('beneficiary ok')
    console.log('treasury ok')
}





// main stuff 

async function main() {
    console.log(`Connecting to chain with rpc`);
    const api = await connect();
    console.log(`Connected`);
    console.log(`Make sure you prefund charlie and bob`)
    console.log(`running tests`)
 //   await test_treasury();
//    await test_council();
//    await test_identity();
    await upload_runtime_upgrade();
}

// return charlie
function get_charlie(){
    const keyring = new Keyring({ type: 'sr25519' });
    const charlie = keyring.addFromUri('//Charlie');
    return charlie;
}

export function get_bob(){
    const keyring = new Keyring({ type: 'sr25519' });
    const bob = keyring.addFromUri('//Bob');
    return bob;
}


// get sudo, alice for now
function get_alice(){
    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice');
    return alice;
}

export async function wsconnect(){
 
     const wsProvider = new WsProvider(config.wsendpoint);
    const api = await ApiPromise.create(
        { 
            provider: wsProvider,
          ...spec  // custom spec
        }  );
       
     const lastHeader = await api.rpc.chain.getHeader(); // get last header

  //  const blockHash = await api.rpc.chain.getBlockHash(lastHeader);
    const api_at = await api.at(lastHeader.hash);
    return api_at;
}

export async function connect() {

    const provider = new HttpProvider(config.rpcendpoint);
    const api = await ApiPromise.create({
        provider,
        types: {
            TreasuryProposal : {
                proposer: 'AccountId',
                value: 'Balance',
                beneficiary: 'AccountId',
                bond: 'Balance',
            }
            
        },
        ...spec
       });
    return api;
}


main();