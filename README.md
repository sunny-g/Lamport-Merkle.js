# Lamport and Merkle Signatures
This library generates one-time Lamport keypairs to be used for one-time message signing.

This also generates Merkle keytrees that can be used to sign muliple messages.

NOTE: :warning: This library was created as an experiment, it's API is non-ideal, and should not be used in production! See the [issues](https://github.com/sunny-g/Lamport-Merkle.js/issues) for performance enhancements and API changes to come! :warning:

## Usage

Lamport keypair generation, signing and verification:
```js
let keypair = new LamportKeyPair();

// signing
let message = 'this is the message that I want to sign';
let signatureObj = keypair.sign(message);

// verification
keypair.verify(message, signatureObj);  // true
message = 'this is a message I did not sign';
keypair.verify(message, signatureObj);  // false
```

Merkle keytree generation, signing and verification:
```js
// constructor takes in the number of Lamport keypairs you want this tree to maintain
let keytree = new MerkleKeyTree(4);

// signing
let message = 'this is another message that I want to sign';
let signatureObj = keytree.sign(message);

// verification
keytree.verify(message, signatureObj);  // true
message = 'this is a message I did not sign';
keytree.verify(message, signatureObj);  // false
```

## LICENSE
MIT
