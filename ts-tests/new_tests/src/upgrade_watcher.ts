// subscribe to a chain and let the user know when a runtime upgrade is happening
import { connect, wsconnect, get_bob } from "./upgrade";
import { Header } from '@polkadot/types/interfaces';


// https://github.com/polkadot-js/api/blob/e94af85e6914006ef9902906a4b7c7c6840c7d46/CHANGELOG.md


async function listen_for_upgrade(){
    const api = wsconnect();
    console.log(`Listening for upgrades on `)

 //   ...
//const firstHead = api.rpc.chain.getHeader();
  const addr = get_bob().address;

  const now = await api.query.timestamp.now();
  const { nonce, data: balance } = await api.query.system.account(addr);
  const nextNonce = await api.rpc.system.accountNextIndex(addr);

  console.log(`${now}: balance of ${balance.free} and a current nonce of ${nonce} and next nonce of ${nextNonce}`);

  await api.rpc.chain.subscribeNewHeads((lastHead: Header): void => {
    console.log('current header:', JSON.stringify(lastHead));
  });

 //   await api.rpc.chain.subscribeNewHeads().subscribe((header) => {
   ///        console.log(`Chain is at #${header.number}`);
       //  }); 
  /*
    const unsubscribe = await (await api).derive.chain.subscribeNewHeads((header) => {
        console.log(`Chain is at block: #${header.number}`);
        let count = 0;
        if (++count === 256) {
          unsubscribe();
          process.exit(0);
        }
      });

*/
    }

listen_for_upgrade();