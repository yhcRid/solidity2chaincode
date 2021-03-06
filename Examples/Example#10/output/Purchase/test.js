 'use strict';
const shim = require('fabric-shim');
const util = require('util');
const createKeccakHash = require('keccak');
var sha256 = require('js-sha256').sha256;

class ConstantClass {

  static async AddContract(stub, contractName, balance) { //tested

    let args = ['addContract', contractName, balance];
    let response = await stub.invokeChaincode('balance', args);
    await stub.putState('This', Buffer.from(contractName)); //using This as this is a keyword in javascript storing contract address
    await stub.putState('IsContractAlive', Buffer.from('true'));
  }

  static async getSenderAddress(stub) { //tested
    let address = await stub.getCreator();
    let detail = address.id_bytes.buffer.toString('utf8');
    let index = detail.indexOf('-----BEGIN CERTIFICATE-----');
    let endIndex = detail.indexOf('-----END CERTIFICATE-----') + 25;
    let certificate = detail.slice(index, endIndex);
    certificate+='\n'
    return certificate;
  }

  static async getChainCodeName(stub) { //tested

    let chaincodeName = await stub.getState('chaincodeName');
    return chaincodeName;
    // let signedProposal = stub.getSignedProposal();
    // let detail = signedProposal.proposal.payload.input.buffer.toString('utf8');
    // let array = detail.split("\n");
    // let chaincodeDetail = array[24].split("\b")[1];
    // let chainCodeName = chaincodeDetail.split('\u001a')[0].replace(/[\u00A0\u1680​\u180e\u2000-\u2009\u200a​\u200b​\u202f\u205f​\u3000\u000b]/g, '').replace('\t', '');
    // return chainCodeName;

  }

  static async send(stub, msg, addressTo, amount) { // tested
    if (msg.value > amount) {
      let args = ['send', msg.sender, addressTo, amount.toString()];
      await stub.invokeChaincode('balance', args);
      msg.value = msg.value - amount;
      return true;
    }
    return false;
  }

  static async transfer(stub, msg, addressTo, amount) { // tested

    if (msg.value > amount) {
      let args = ['send', msg.sender, addressTo, amount.toString()];
      await stub.invokeChaincode('balance', args);
      msg.value = msg.value - amount;
    }
    else
    {
      throw new Error('Exception during Transfer');
    }
  }

  static async balance(stub, address) { // not tested yet

    let args = ['getBalance', address];
    let balance = await stub.invokeChaincode('balance', args);
    return parseFloat(balance);
  }

  static async selfdestruct(stub, _this, owner) { // not tested yet
    let args = ['getBalance', _this];
    let balance = await stub.invokeChaincode('balance', args);
    args = ['transfer', _this, owner, balance];
    await stub.invokeChaincode('balance', args);
    await stub.putState('IsContractAlive', Buffer.from('false'));
    args = ['removeContract', _this];
    await stub.invokeChaincode('balance', args);
  }

  static async getNowValue() { 
    return Math.round(new Date().getTime() / 1000.0);  //Not final we can use stub.GetTxTimestamp()
  }

  static async keccak256(value, fake, secret) { 
    return createKeccakHash('keccak256').update(value + fake + secret).digest('hex');
  }

  static async sha256(document) {
    return sha256(document);
  }

};


class Purchase {async value(stub, args, thisClass) { 
let returnTemp = await stub.getState('value');
      return Buffer.from(returnTemp.toString());
     
      }
      async seller(stub, args, thisClass) { 
let returnTemp = await stub.getState('seller');
      return Buffer.from(returnTemp.toString());
     
      }
      async buyer(stub, args, thisClass) { 
let returnTemp = await stub.getState('buyer');
      return Buffer.from(returnTemp.toString());
     
      }
      async state(stub, args, thisClass) { 
let returnTemp = await stub.getState('state');
      return Buffer.from(returnTemp.toString());
     
      }
      
async Invoke(stub) {
  let ret = stub.getFunctionAndParameters();

  let method = this[ret.fcn];
  if (!method) {
    throw new Error('Received unknown function ' + ret.fcn + ' invocation');
  }
  try {

    let IsContractAlive = await stub.getState('IsContractAlive');
    if(IsContractAlive == 'false')
    {
      throw new Error('Contract has been destroyed');
    }
    let payload = await method(stub, ret.params, this);
    return shim.success(payload);
  } catch (err) {
    return shim.error(err);
  }
}



async Init(stub) {

  let ret = stub.getFunctionAndParameters();
  let args = ret.params;
  if (args.length != 1) {
    throw new Error('Incorrect number of arguments. Expecting 1, chaincode name is required at the time of instantiate');
  }
  let chaincodeName = args[0];
  await stub.putState('chaincodeName', Buffer.from(chaincodeName.toString()));
  return shim.success();
}

async Init1(stub ,args,thisClass) {

  let isDeployed = await stub.getState('deployed');
  if (!isDeployed || !isDeployed.toString()) { // check already deployed
        await stub.putState('deployed', Buffer.from('true'));
        let chaincodeName = await ConstantClass.getChainCodeName(stub);
        await ConstantClass.AddContract(stub, chaincodeName, '0');
        let method = thisClass['Constructor'];
        await method(stub, args, thisClass);
    }
}
  async Constructor(stub, args, thisClass) { 

  
 let value = 0;
    await stub.putState('value', Buffer.from(value.toString()));
 let seller = '';
    await stub.putState('seller', Buffer.from(seller.toString()));
 let buyer = '';
    await stub.putState('buyer', Buffer.from(buyer.toString()));
 let state = 0;
    await stub.putState('state', Buffer.from(state.toString()));

if (args.length != 1 ){
            throw new Error('Incorrect number of arguments. Expecting 1');
          }

          let now = await ConstantClass.getNowValue(); 
          let block = { timestamp:now }; //block.timestamp is alias for now 
          let msg = { value:parseFloat(args[0]) , sender:await ConstantClass.getSenderAddress(stub)};
          let _this = await stub.getState('This');  // contract address

  seller=msg.sender;
  value=msg.value/2;
  if(!((2*value)==msg.value)){
throw new Error("Value has to be even.");
};
  
  await stub.putState('seller', Buffer.from(seller.toString()));
await stub.putState('value', Buffer.from(value.toString()));

 } 
async abort(stub, args, thisClass) {
if (args.length != 1 ){
            throw new Error('Incorrect number of arguments. Expecting 1');
          }

          let now = await ConstantClass.getNowValue(); 
          let block = { timestamp:now }; //block.timestamp is alias for now 
          let msg = { value:parseFloat(args[0]) , sender:await ConstantClass.getSenderAddress(stub)};
          let _this = await stub.getState('This');  // contract address
let temp0 = await stub.getState('value');
      let value = parseFloat(temp0);
let temp1 = await stub.getState('seller');
      let seller = temp1.toString();
let temp2 = await stub.getState('buyer');
      let buyer = temp2.toString();
let temp3 = await stub.getState('state');
      let state = temp3.toString();

  if(!(msg.sender==seller)){
throw new Error("Only seller can call this.");
};
  
  if(!(state== undefined )){
throw new Error("Invalid state.");
};
  
  let payload4 = {

}
payload4  = JSON.stringify(payload4 );
 stub.setEvent('Aborted', payload4 );
  state= undefined /* use index of Enum Type */;
let result5 = await  ConstantClass.balance(stub ,_this);
let result6 = await  ConstantClass.transfer(stub , msg ,seller,JSON.parse(result5));
  ;
  
  
  
  await stub.putState('state', Buffer.from(state.toString()));

}
async confirmPurchase(stub, args, thisClass) {
if (args.length != 1 ){
            throw new Error('Incorrect number of arguments. Expecting 1');
          }

          let now = await ConstantClass.getNowValue(); 
          let block = { timestamp:now }; //block.timestamp is alias for now 
          let msg = { value:parseFloat(args[0]) , sender:await ConstantClass.getSenderAddress(stub)};
          let _this = await stub.getState('This');  // contract address
let temp0 = await stub.getState('value');
      let value = parseFloat(temp0);
let temp1 = await stub.getState('seller');
      let seller = temp1.toString();
let temp2 = await stub.getState('buyer');
      let buyer = temp2.toString();
let temp3 = await stub.getState('state');
      let state = temp3.toString();

  if(!(state== undefined )){
throw new Error("Invalid state.");
};
  
  if(!( msg.value==(2*value) )){
throw new Error( "Condition Failed" );
};
  
  let payload4 = {

}
payload4  = JSON.stringify(payload4 );
 stub.setEvent('PurchaseConfirmed', payload4 );
  buyer=msg.sender;
  state= undefined /* use index of Enum Type */;
  
  
  
  await stub.putState('buyer', Buffer.from(buyer.toString()));
await stub.putState('state', Buffer.from(state.toString()));

}
async confirmReceived(stub, args, thisClass) {
if (args.length != 1 ){
            throw new Error('Incorrect number of arguments. Expecting 1');
          }

          let now = await ConstantClass.getNowValue(); 
          let block = { timestamp:now }; //block.timestamp is alias for now 
          let msg = { value:parseFloat(args[0]) , sender:await ConstantClass.getSenderAddress(stub)};
          let _this = await stub.getState('This');  // contract address
let temp0 = await stub.getState('value');
      let value = parseFloat(temp0);
let temp1 = await stub.getState('seller');
      let seller = temp1.toString();
let temp2 = await stub.getState('buyer');
      let buyer = temp2.toString();
let temp3 = await stub.getState('state');
      let state = temp3.toString();

  if(!(msg.sender==buyer)){
throw new Error("Only buyer can call this.");
};
  
  if(!(state== undefined )){
throw new Error("Invalid state.");
};
  
  let payload4 = {

}
payload4  = JSON.stringify(payload4 );
 stub.setEvent('ItemReceived', payload4 );
  state= undefined /* use index of Enum Type */;
let result5 = await  ConstantClass.transfer(stub , msg ,buyer,value);
  ;
let result6 = await  ConstantClass.balance(stub ,_this);
let result7 = await  ConstantClass.transfer(stub , msg ,seller,JSON.parse(result6));
  ;
  
  
  
  await stub.putState('state', Buffer.from(state.toString()));

}

 } 

 shim.start(new Purchase());