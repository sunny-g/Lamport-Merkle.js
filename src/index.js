/*
EXAMPLE USAGE:
var keys = lamport.generate();

var signature = lamport.sign(keys.privKey, 'MESSAGE TO SIGN')

if (lamport.verify(keys.pubKey, 'MESSAGE TO SIGN', signature)) {
  console.log('Authentic.');
} else {
  console.log('Not Authentic!');
}
 */

var HASH_FUNC = 'SHA-256';

var MSG_TYPE = 'TEXT';
var HASH_OUTPUT = 'HEX';

var hash = function(msg, msg_type, output_type) {
  msg_type = msg_type || MSG_TYPE;
  output_type = output_type || HASH_OUTPUT;

  if (typeof msg !== 'string') {
    msg = JSON.stringify(msg);
  }
  var hashObj = new jsSHA(msg, msg_type);
  return hashObj.getHash(HASH_FUNC, output_type).slice(0, 32);
};

var random32Bytes = function() {
  return secureRandom.randomArray(32);
};

var char2Binary = function(char) {
  var binary = char.charCodeAt(0).toString(2);
  while (binary.length < 8) {
    binary = '0' + binary;
  }
  return binary;
};

var eachBit = function(msg, callback) {
  var msgArr = msg.split('');
  msgArr.forEach(function(char, charIdx) {
    var bits = char2Binary(char).split('');
    bits.forEach(function(bit, bitI) {
      bitIdx = (charIdx * 8) + bitI;
      callback (bit, bitIdx);
    });
  });
};

var lamport = {

  generate: function() {
    var priv = [];
    var pub = [];

    for (var i = 0; i < 256; i++) {
      var num1 = random32Bytes();
      var num2 = random32Bytes();
      var hash1 = hash(num1);
      var hash2 = hash(num2);

      priv.push([num1, num2]);
      pub.push([hash1, hash2]);
    }

    return {
      privKey: priv,
      pubKey: pub,
      used: false     // used by merkle sigs
    }
  },

  sign: function(privKey, msg) {
    var msgHash = hash(msg);
    var signature = [];

    eachBit(msgHash, function(bit, bitIdx) {
      signature.push( privKey[bitIdx][bit] );
    });

    return signature;
  },

  verify: function(pubKey, msg, signature) {
    var msgHash = hash(msg);
    var authentic = true;

    eachBit(msgHash, function(bit, bitIdx) {
      if (hash(signature[bitIdx]) !== pubKey[bitIdx][bit]) {
        authentic = false;
      }
    });
    return authentic;
  }

};

/*******************************************************************/
// MERKLE SIGNATURE IMPLEMENTATION
/*******************************************************************/
var KEYNUM = 4;

var MerkleKeyTree = function() {
  this._leaves = [];
  var firstRow = [];
  for (var leafNum = 0; leafNum < KEYNUM; leafNum++) {
    var keypair = lamport.generate();
    this._leaves.push(keypair);
    firstRow.push( hash(keypair.pubKey) );
    // firstRow.push( i );
  }

  this.rows = {
    0: firstRow
  };

  var levels = Math.sqrt(KEYNUM);
  for (var i = 1; i <= levels; i++) {
    // for each level in the tree
    var curRow = [];
    var prevRow = this.rows[i-1];
    for (var k = 0; k < prevRow.length; k += 2) {
      // for each hash in the previous row
      // hash(its and next hash's values)
      var h = hash(prevRow[k] + prevRow[k+1]);
      curRow.push(h);
    }

    this.rows[i] = curRow;
  }
};

// MerkleKeyTree.prototype

// TODO: figure out this stuff
/*
* what do we publish when we sign a message?
*
 */



