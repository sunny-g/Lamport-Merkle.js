'use strict';

class LamportKeypair {
  constructor() {
    this._privKey = [];
    this.pubKey = [];
    this.used = false;

    for (var i = 0; i < 256; i++) {
      var num1 = random32ByteString();
      var num2 = random32ByteString();
      var hash1 = hash(num1);
      var hash2 = hash(num2);

      this._privKey.push([num1, num2]);
      this.pubKey.push([hash1, hash2]);
    }
  }

  sign(msg) {
    var msgHash = hash(msg);
    var signature = [];

    var that = this;
    eachBit(msgHash, function(bit, bitIdx) {
      signature.push( that._privKey[bitIdx][bit] );
    });

    return signature;
  }

  verify(msg, signature) {
    var msgHash = hash(msg);
    var authentic = true;

    // TODO: BREAK OUT THE MINUTE THE SIGNATURE HASH DONT MATCH THE PUBKEY
    var that = this;
    eachBit(msgHash, function(bit, bitIdx) {
      if (hash(signature[bitIdx]) !== that.pubKey[bitIdx][bit]) {
        authentic = false;
      }
    });
    return authentic;
  }
}

window.LamportKeypair = LamportKeypair;
