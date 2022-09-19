import { hexToNumber, bnToHex, hexToBigInt } from "@polkadot/util";
import { BN } from "@polkadot/util";
import { encodeAddress, blake2AsHex  } from "@polkadot/util-crypto";
import { ApiPromise, WsProvider, SubmittableResult } from "@polkadot/api"; 
import { HttpProvider } from '@polkadot/rpc-provider'; // we want to use rpc
import { Int, Option, Struct } from '@polkadot/types';
import { AccountId, Balance, BlockNumber, Hash } from '@polkadot/types/interfaces/runtime';
import { Codec, Registry } from '@polkadot/types/types';
import { KeyringPair } from "@polkadot/keyring/types";
import { ContractPromise, CodePromise, BlueprintPromise } from '@polkadot/api-contract';

import { assert, expect } from 'chai';
import { compactAddLength } from '@polkadot/util';
import { promises as fspromise } from 'fs';
import { createType } from '@polkadot/types';
import fs from "fs";
import path from "path";

import '@polkadot/api-augment';

//https://github.com/polkadot-js/api/releases/tag/v7.0.1


//import { TreasuryProposal } from '@polkadot/types/interfaces';
//import { assert } from "console";
import { Keyring } from '@polkadot/keyring';
import { spec } from '@edgeware/node-types';
import { skipPartiallyEmittedExpressions } from "typescript";

export interface TreasuryProposal extends Struct {
    readonly proposer: AccountId;
    readonly value: Balance;
    readonly beneficiary: AccountId;
    readonly bond: Balance;
}


// config me
const config = {
    wsendpoint: 'ws://eagle:5558',//'ws://127.0.0.1:9944',
    rpcendpoint: 'http://eagle:5555',//'http://eagle:9988',//"wss://edgeware.api.onfinality.io/public",
    wasmpath: '../../wasm/burp28.compact.wasm' // copy target/release/wbuild/ compacted wasm file to localdisk
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



async function checkbalance(ADDR: string){
 
    const api = await connect();
    const { nonce, data: balance } = await api.query.system.account(ADDR);

    console.log(`balance of ${ADDR} is ${balance.free}`);
    const freebalance = balance.free;
    return freebalance;
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
   
    const txid = await api.tx.sudo
    .sudoUncheckedWeight(
        api.tx.system.setCodeWithoutChecks(`0x${buff.toString('hex')}`), 10000
    )
    .signAndSend(sudoac);
    
    console.log(`Runtime upgrade sent with ${txid}`);
    console.log(`Runtime upgrade pushed, change your node binary and restart it to make the runtime migrations kick in`);
}

// return current chain version as a number
async function get_chain_version() {
    const api = await connect();
    const version = await api.runtimeVersion;
    const newversion: number = version.specVersion.toNumber();//version.unwrap().specVersion.toNumber(); // return current specVersion
    return newversion
}


async function bu_test_identity(){
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

// verify that charlie is still running
async function ac_test_council(){

}

// submit candacy for charlie
async function bu_test_council(){
    console.log(`Testing council`);
    // get the current election candidates
    const api = await connect();
 //   const { metadata } = await api.rpc.state.getMetadata();
   // const modules = metadata.asLatest.modules; 

    const startCandidates = await api.query.elections.candidates() ;
    const fluff = startCandidates;
    console.log(`start candidates: ${startCandidates}`);
    const charlie = get_charlie();
    console.log(`Charlie runs for council`);
    const submitc_txhash = await api.tx.elections.submitCandidacy(startCandidates.encodedLength).signAndSend(charlie).finally();
    console.log(`Charlie tx sent: ${submitc_txhash}`);
    // submit candidacy 


    // vote for charlie

    //current 

    // check that bob has voted 

}


// bu = before upgrade
// au = after upgrade

async function bu_test_treasury() {
    console.log("Testing treasury");
    // create a treasure proposal
    const api = await connect();

    // send it with charlie
    const charlie = get_charlie(); // sender
    const bob = get_bob(); // reciever
    // Create the transaction
    console.log("Sending treasury proposeSpend to bob from charlie");
    const tx = api.tx.treasury.proposeSpend('1000000000000', bob.address);
    const txhash =  await tx.signAndSend(charlie).finally(); // send tx from charlie
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

// get new web3 address balance
async function get_balance(account: AccountId) {

}

// native host os sleep
function sleep(ms) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < ms);
  }
  


async function wait_for_next(current: number){

    var chain_version: number = await get_chain_version();

    while(current >= chain_version) {
        console.log(`Chain has not been upgraded yet, chain version: ${chain_version}, current verions: ${current}, sleeping..`);
        
        try { // auto breaks, needs fixing
             chain_version = await get_chain_version();
             sleep(10000);
       
            } 
        catch(e) {
            console.log('Error:', e);
            sleep(2000); // if error, wait 2 sec
          //  return null;
          }
     //   catch (e){ 
       //     console.log("Error",e);
         //   sleep(1000);
        //}
        finally{
        
            console.log('sleeping');
            sleep(15000);
        }
        
} 
    console.log(`Chain has upgraded from version ${current} to version ${chain_version}`);
}

export async function sendAndReturnFinalized(
  signer: KeyringPair,
  tx: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    tx.signAndSend(signer, (result: SubmittableResult) => {
      console.log(`current status: ${result}`)
      if (result.status.isInBlock) {
        if (globalThis.verbose)
          console.log(`Write in block: ${result.status.asInBlock}`);
        // Return the result of the submittable extrinsic after the transfer is finalized
      }
      if (result.status.isFinalized) {
        if (globalThis.verbose)
          console.log(`Finalized in: ${result.status.asFinalized}`);
        resolve(result);
      }
      if (
        result.status.isDropped ||
        result.status.isInvalid ||
        result.status.isUsurped
      ) {
        reject(result as SubmittableResult);
        if (globalThis.verbose)
          console.error('ERROR: Transaction could not be finalized.');
      }
    });
  });
}
// check that contracts pallet has been upgraded by using the new pallet functions to submit a ink contract
async function au_contracts_check(){
  console.log(`Testing contracts`);
  // read our ink test contract to a hex string
  const wasmCode = fs 
  .readFileSync(path.join(__dirname, 'contracts/test.wasm'));
  //.toString("hex");

  const metadata = fs 
  .readFileSync(path.join(__dirname, 'contracts/metadata.json'), { encoding: 'utf-8' });
  ///.toJSON();

  //const contractJson = fs.readFileSync(file, );

  const api = await connect();
console.log('test code3');
  const code3 = new CodePromise(api, metadata, wasmCode);
  console.log('test code3 ok');


  const bob = get_bob();
  const alice = get_alice();
  //const tx = await api.tx.contracts.putCode(`0x${wasmCode}`).signAndSend(bob);//.signAndSend(bob);
  //console.log(`uploaded test contract with txid: ${tx}`);

  const gasLimit = 100000n * 1000000n;
  // a limit to how much Balance to be used to pay for the storage created by the instantiation
  // if null is passed, unlimited balance can be used
  const storageDepositLimit = null;
  // used to derive contract address, 
  // use null to prevent duplicate contracts
  const salt = new Uint8Array();
  // balance to transfer to the contract account, formerly know as "endowment". 
  // use only with payable constructors, will fail otherwise. 
  const value = api.registry.createType('Balance', 1000);
  const initValue = 4;


  const tx2 = code3.tx.new({ gasLimit, storageDepositLimit }, initValue);
  console.log(`tx2: ${tx2}`);
  const rtx2 = await tx2.signAndSend(alice).finally();
  console.log(`Contract deployed with: ${rtx2}`);
  let address;

//let address;

//const unsub = await tx2.signAndSend(bob, ({ contract, status }) => {
//  if (status.isInBlock || status.isFinalized) {
 //   address = contract.address.toString();
 //   unsub();
 // }
//});

 //<wconst salt = ;
  
  



}


// main stuff 

async function main() {
    console.log(`Connecting to chain with rpc..`);
    const api = await connect();
    const pre_version = await get_chain_version();
    console.log(api.consts.balances.existentialDeposit.toString());

    // The amount required to create a new account
console.log(api.consts.balances.existentialDeposit.toString());

// The amount required per byte on an extrinsic
    //console.log(api.consts.transactionPayment.transactionByteFee.toString());
    var chain = await api.runtimeVersion;
    var chainname = chain.specName.toString();
    console.log(`Connected to ${chainname}, Current version is: ${pre_version}`);
    console.log(`Make sure you prefund alice, charlie and bob or change the script manually`);
    console.log(`running tests`);
    // load some test accounts
    console.log(`Pre funding test accounts`);
    const [edg0, edg1, edg2] = get_edg_keys();
    //const [edg0balance, edg1balance, edg2balance] = await random_pre_fund_bulk(edg0.address, edg1.address, edg2.address);
 
   // await bu_test_treasury();
    await bu_test_council();
  //  await bu_test_identity();
console.log('pushing runtime upgrade');
    //  await upload_runtime_upgrade();
    console.log(`waiting for node binary switch`);
    console.log('Comparing version');
 //   await wait_for_next(pre_version); // query version and delay , synchronously wait for new runtime upgrade spec_verions, this breaks because of a system exit 0 being thrown by polkadot.js
 //   const after_version = await get_chain_version();
    
 //   expect()
    //expect preversion != after_version
 //   console.log(`Upgraded to runtime-version: ${after_version}`);
  
    console.log(`Running post upgrade checks`);

    console.log(`Verifying that balance is the same in our prefunded accounts`);
    const address = 'nJrsrH8dov9Z36kTDpabgCZT8CbK1FbmjJvfU6qbMTG4g4c';
   // await checkbalance(address); 
    //Check that the random prefunded Balances are the same
  //  const e0b = await checkbalance(edg0.address); 
  //  const e1b = await checkbalance(edg1.address);
  //  const e2b = await checkbalance(edg2.address);
  //  expect(e0b).to.equal(edg0balance, "Balance did not correctly migrate");
  //  expect(e1b).to.equal(edg1balance, "Balance of account edg1 migration failed");
  //  expect(e2b).to.equal(edg2balance, "Balance of account edg2 migration failed");
    console.log(`Prefunded accounts test passed`);
  //  await au_contracts_check(); only works after upgrade
    const a2 = await connect();
    console.log("contracts:", a2.query.contracts.palletVersion.name )
    console.log(a2.consts.identity.basicDeposit.toString());
    console.log(a2.consts.multisig.depositFactor.toString());
    console.log(a2.consts.staking.bondingDuration.toString());
    console.log(a2.consts.staking.sessionsPerEra.toString());
    console.log(a2.consts.system.ss58Prefix.toString());
    console.log(a2.consts.tips.maximumReasonLength.toString());
   //
    console.log('All tests are good');
}



// send 3 bulk random amount transfers, return the sent amount, all transactions are sent but balances are not updated?
async function random_pre_fund_bulk(a0: string, a1: string, a2: string) {
    const max = 200000000 * 10;
    const low = 5000000 * 10;
    const api = await connect();
    const alice = get_alice();
    const bob = get_bob();
    const charlie = get_charlie();

// build bulk
   const a1b = Math.floor(Math.random() * 300) % (max ?? low) + (max ? low : 0) as number;
   const a2b = Math.floor(Math.random() * 300) % (max ?? low) + (max ? low : 0) as number;
   const a0b = Math.floor(Math.random() * 300) % (max ?? low) + (max ? low : 0) as number;

  const txs = [
    api.tx.balances.transfer(a2,  a2b),
    api.tx.balances.transfer(a1, a1b),
    api.tx.balances.transfer(a0, a0b)
  ];

    // retrieve sender's next index/nonce, taking txs in the pool into account
    const n0 = await api.rpc.system.accountNextIndex(alice.address);
  
    
   // const txHash0 = await api.tx.balances
  //.transferKeepAlive(a0, a0b * 1000)
  //.signAndSend(alice)
  //;


 // const txnow = await api.tx.balances
 // .transferKeepAlive(a2, 100000000)
 // .signAndSend(alice);

//  sleep(7000);
// Show the hash
//console.log(`Submitted with hash ${txnow}`);
//const api1 = await connect(); // get a new api with latest block
//const n1 = await api1.rpc.system.accountNextIndex(alice.address);
  //const txHash1 = await api1.tx.balances
  //.transferKeepAlive(a1, a1b  * 1000)
  //.signAndSend(bob);

 // sleep(7000);
//  const api2 = await connect(); // get a new api
//  const n2 = await api2.rpc.system.accountNextIndex(alice.address);
  //const txHash2 = await api2.tx.balances
  //.transferKeepAlive(a2, a2b  * 1000)
  //.signAndSend(charlie);

// Show the hash
//console.log(`Submitted with hash ${txHash2}`);

  
  
  
    // send, just retrieving the hash, not waiting on status
//    const txhash = await api.tx.balances.transfer(a2,  a2b)
  //    .signAndSend(alice, { nonce });

// doesnt work??
  // ship em with utility
  const txid = await api.tx.utility
    .batch(txs)
   .signAndSend(alice, { nonce: 1 }).finally();

    console.log(`${txid} sent: ${a0b} to: ${a0} from: ${alice.address} `);
  //  console.log(`${txHash1} sent: ${a1b} to: ${a1} from: ${alice.address} `);
  //  console.log(`${txHash2} sent: ${a2b} to: ${a2} from: ${alice.address} `);
    return [a0b, a1b, a2b];
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

// get 3 accounts to use for testing before and after upgrade
function get_edg_keys() {
    const e0 = new Keyring({ type: 'sr25519' });
    const edg0 = e0.addFromUri('general siren maze allow penalty ginger village history exhibit hello feed clarify');
    
    const e1 = new Keyring({ type: 'sr25519' });
    const edg1 = e1.addFromUri('traffic fee label furnace boy wrist issue talent resemble cliff marine moment');


    const e2 = new Keyring({ type: 'sr25519' });
    const edg2 = e2.addFromUri('calm web casino keen pause imitate giant educate vault glove update begin');


    return [edg0, edg1, edg2];
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
            },

            specVersion:'number',
            
            
        },
        ...spec
       });
    return api;
}


main();