const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const express = require("express");
const app = express();
const cors = require("cors");

const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "048f8d4bfe6c33606b0c3c373bbd8efff80e7d25514e0af5f7582d4076dfc4ea8684ef7c824a3c83bf30de808157fd1eb473ee1e25dad26a740b5998d784862cbe": 100,
  "049552b4683e07a7a4fb7d491c54373917a0a3fd00fb094d86b3ba1b167673e2a2891974867a75f2be52f2b4e5e6689168ebb73c7509e40f20add29b2201c304dc": 50,
  "040706b01a530acd51215812f0bb8a2262216b9530e1909fb3f3383bd6976bf9cce67f794f8c8a49fe56af7d2dc66c337656bb8325804940c0a60810789b5b6157": 75,
};

// mapping of public to private keys
const public_to_private = {
  "048f8d4bfe6c33606b0c3c373bbd8efff80e7d25514e0af5f7582d4076dfc4ea8684ef7c824a3c83bf30de808157fd1eb473ee1e25dad26a740b5998d784862cbe":"fb9d0cc9386e21bffb18fef6b846eb10898ca900f0a62cfac8256faacd78461d",
  "049552b4683e07a7a4fb7d491c54373917a0a3fd00fb094d86b3ba1b167673e2a2891974867a75f2be52f2b4e5e6689168ebb73c7509e40f20add29b2201c304dc":"14dcc23f599f7899f6157cc83efac2896b8c8689265e8c127cc0a6d9dded8674",
  "040706b01a530acd51215812f0bb8a2262216b9530e1909fb3f3383bd6976bf9cce67f794f8c8a49fe56af7d2dc66c337656bb8325804940c0a60810789b5b6157":"9d6cb7746a7e4d175d1b4b1c5ca97a0f42c7ca9716b046fbc68161657d9b3674"
}

// message for signing
const message = "hey buddy"

app.get("/balance/:address", async (req, res) => {
  const { address } = req.params;

  // get private key from mapping
  const privateKey = public_to_private[address]

  // sign with private key
  const [signature, recoveryBit] = await secp.sign(keccak256(utf8ToBytes(message)), public_to_private[address], {recovered: true})

  const balance = balances[address] || 0;

  // stringify signature for json response
  res.send({ balance, signature: JSON.stringify(signature), recoveryBit});
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, recoveryBit } = req.body;

  // get original signature array from stringified signature
  signatureArray = Object.values(JSON.parse(signature))

  // convert signature array back to signature
  const updated_signature = Uint8Array.from(signatureArray);

  // recover public key
  const publicKey = toHex(secp.recoverPublicKey(keccak256(utf8ToBytes(message)), updated_signature, recoveryBit))

  // check if the sender has the same public key as the signature
  if (sender == publicKey) {
    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    res.status(400).send({ message: "signature does not match the key" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}