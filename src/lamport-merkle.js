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

var random32ByteString = function() {
  return secureRandom.randomArray(32).reduce(function(str, byte) {
    return (str += String.fromCharCode(byte));
  }, '')
};

var randomString2Bytes = function(str) {
  return str.split('').reduce(function(arr, char) {
    return arr.push(char.charCodeAt(0))
  }, [])
};

var char2Byte = function(char) {
  var binary = char.charCodeAt(0).toString(2);
  while (binary.length < 8) {
    binary = '0' + binary;
  }
  return binary;
};

var eachBit = function(msg, callback) {
  var msgArr = msg.split('');
  msgArr.forEach(function(char, charIdx) {
    var bits = char2Byte(char).split('');
    bits.forEach(function(bit, bitI) {
      bitIdx = (charIdx * 8) + bitI;
      callback (bit, bitIdx);
    });
  });
};

/*******************************************************************/
// LAMPORT SIGNATURE IMPLEMENTATION
/*******************************************************************/

var LamportKeypair = function() {
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
};

LamportKeypair.prototype.sign = function(msg) {
  var msgHash = hash(msg);
  var signature = [];

  var that = this;
  eachBit(msgHash, function(bit, bitIdx) {
    signature.push( that._privKey[bitIdx][bit] );
  });

  return signature;
};

LamportKeypair.prototype.verify = function(msg, signature) {
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
};

/*******************************************************************/
// MERKLE SIGNATURE IMPLEMENTATION
/*******************************************************************/
var KEYNUM = 4;

var parentIdx = function(idx) {
  return Math.ceil((idx + 1)/2) - 1;
};

var MerkleKeyTree = function(keyNum) {
  this.size = keyNum || KEYNUM;
  this._leaves = [];
  this.usedKeyCount = 0;
  var firstRow = [];
  for (var leafNum = 0; leafNum < this.size; leafNum++) {
    // var keypair = lamport.generate();
    var keypair = new LamportKeypair();
    this._leaves.push(keypair);
    firstRow.push( hash(keypair.pubKey) );
    // firstRow.push( i );
  }

  this.rows = [firstRow];

  var levels = Math.ceil(Math.log2(this.size));
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

  this.rowNum = this.rows.length;
  this.rootHash = this.rows[this.rows.length - 1][0];
};

MerkleKeyTree.prototype.sign = function(msg) {
  // returns the original sig plus a list of nodes
  // might have to return the pubkey as well
  var finalSig = {};

  if (this.usedKeyCount === this.size - 1) {
    // TODO: GIVE USER WARNING INSTEAD OF THROWING AN ERROR
    throw new Error('This is your last keypair on this tree, USE IT WISELY');
  }

  for (var i = 0; i < this._leaves.length; i++) {
    if (!this._leaves[i].used) {
      var randomKeypair = this._leaves[i];
      var randomKeypairIndex = i;
      break;
    }
  }

  finalSig.keyPairId = randomKeypairIndex;
  finalSig.pubKey = randomKeypair.pubKey;
  finalSig.message = msg;
  finalSig.signature = randomKeypair.sign(msg);
  finalSig.path = [];

  var curRow = 0;
  var idx = randomKeypairIndex;
  while (curRow < this.rowNum) {
    if (idx % 2) {
      finalSig.path.push(this.rows[curRow][idx - 1])
    } else {
      finalSig.path.push(this.rows[curRow][idx + 1])
    }
    curRow++;
    idx = parentIdx(idx);
  }

  finalSig.path[finalSig.path.length - 1] = this.rootHash;
  randomKeypair.used = true;
  this.usedKeyCount++;
  return finalSig;
};

MerkleKeyTree.prototype.verify = function(sigObj) {
  var idx = sigObj.keyPairId;
  var lamport = this._leaves[idx];
  if (lamport.verify(sigObj.message, sigObj.signature)) {

    var h = hash(sigObj.pubKey);
    for (var i = 0; i < sigObj.path.length - 1; i++) {
      var auth = sigObj.path[i];
      if (idx % 2) {
        h = hash(auth + h);
      } else {
        h = hash(h + auth);
      }
      idx = parentIdx(idx);
    }

    if (h === sigObj.path[sigObj.path.length - 1]) {
      return true;
    }
  }
  return false;
};
