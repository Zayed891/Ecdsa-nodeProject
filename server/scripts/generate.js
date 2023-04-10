const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const privateKey = secp.utils.randomPrivateKey();



const publicKey = secp.getPublicKey(privateKey);

const address = keccak256(publicKey.slice(-20));

console.log("private key:", toHex(privateKey));

console.log('public key:', toHex(publicKey));

console.log('address:', `0x${toHex(address)}`);

async function signMessage() {
    const signature = await secp.sign(hashMessage('hey buddy'), privateKey, {recovered: true});
    console.log('signature', signature);
    const [sig, recoveryBit] = signature;
    const x = secp.recoverPublicKey(hashMessage('hey buddy'), sig, recoveryBit)
    console.log(toHex(x))
  }
   
  signMessage();
