import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";


function Wallet({ address, setAddress, balance, setBalance, signature, setSignature, recoveryBit, setRecoveryBit }) {
  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data: { balance, signature, recoveryBit },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
      setSignature(signature);
      setRecoveryBit(recoveryBit);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input placeholder="Type an address, for example: 0x1" value={address} onChange={onChange}></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
