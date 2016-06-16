'use strict';

var KEYNUM = 4;

var parentIdx = function(idx) {
  return Math.ceil((idx + 1)/2) - 1;
};

class MerkleKeyTree {
  constructor(keyNum) {
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

    this.levels = [firstRow];

    var levels = Math.ceil(Math.log2(this.size));
    for (var i = 1; i <= levels; i++) {
      // for each level in the tree
      var curRow = [];
      var prevRow = this.levels[i-1];
      for (var k = 0; k < prevRow.length; k += 2) {
        // for each hash in the previous row
        // hash(its and next hash's values)
        var h = hash(prevRow[k] + prevRow[k+1]);
        curRow.push(h);
      }

      this.levels[i] = curRow;
    }

    this.numOfLevels = this.levels.length;
    this.numOfKeys = this._leaves.length;
    this.topHash = this.levels[this.levels.length - 1][0];
  }

  sign(msg) {
    // returns the original sig plus a list of nodes
    // might have to return the pubkey as well
    var finalSig = {};

    if (this.usedKeyCount === this.size - 1) {
      // TODO: GIVE USER WARNING INSTEAD OF THROWING AN ERROR
      throw new Error('This is your last keypair on this tree, USE IT WISELY');
    }

    for (var i = 0; i < this.numOfKeys; i++) {
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

    var curLevel = 0;
    var idx = randomKeypairIndex;
    while (curLevel < this.numOfLevels) {
      if (idx % 2) {
        finalSig.path.push(this.levels[curLevel][idx - 1])
      } else {
        finalSig.path.push(this.levels[curLevel][idx + 1])
      }
      curLevel++;
      idx = parentIdx(idx);
    }

    finalSig.path[finalSig.path.length - 1] = this.topHash;
    randomKeypair.used = true;
    this.usedKeyCount++;
    return finalSig;
  }

  verify(msg, sigObj) {
    var idx = sigObj.keyPairId;
    var lamport = this._leaves[idx];
    if (lamport.verify(msg, sigObj.signature)) {

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
  }
}

window.MerkleKeyTree = MerkleKeyTree;
