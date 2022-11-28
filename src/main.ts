//for interacting w/ sc, square.ts
//required for building
import { Square } from './Square.js';
import {
  // async promise => required by WASM
  isReady,
  shutdown,
  Field,
  //local blockchain
  Mina,
  PrivateKey,
  AccountUpdate,
} from 'snarkyjs';

(async function main() {
  await isReady;

  console.log('SnarkyJS loaded');

  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  const deployerAccount = Local.testAccounts[0].privateKey;

  //creates key pair
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();

  //deploy Square sc to our address (deriv of private key)
  const contract = new Square(zkAppAddress);
  const deployTxn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    contract.deploy({ zkappKey: zkAppPrivateKey });
    contract.sign(zkAppPrivateKey);
  });
  await deployTxn.send();

  //init state after deployign
  const num0 = contract.num.get();
  console.log('state after init: ', num0.toString());

  //updating sc state
  const txn1 = await Mina.transaction(deployerAccount, () => {
    contract.update(Field(9));
    contract.sign(zkAppPrivateKey);
  });
  await txn1.send();

  const num1 = contract.num.get();
  console.log('state after txn1:', num1.toString());

  //a failing txn
  try {
    const txn2 = await Mina.transaction(deployerAccount, () => {
      contract.update(Field(75));
      contract.sign(zkAppPrivateKey);
    });
    await txn2.send();
  } catch (err: any) {
    console.log(err.message);
  }
  const num2 = contract.num.get();
  console.log('state after txn2: ', num2.toString());

  //final txn
  const txn3 = await Mina.transaction(deployerAccount, () => {
    contract.update(Field(81));
    contract.sign(zkAppPrivateKey);
  });
  await txn3.send();

  const num3 = contract.num.get();
  console.log('state after txn3:', num3.toString());

  //final logging
  console.log('Shutting down');

  await shutdown();
})();
