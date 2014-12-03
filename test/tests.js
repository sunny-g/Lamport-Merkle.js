var expect = chai.expect;

describe('lamport signatures', function() {
  var keypair = lamport.generate();

  describe('keypair creation', function () {
    it('should return the same hash for a given message', function () {
      var msg = 'this is a message';
      var output_hash = new jsSHA(msg, 'TEXT').getHash('SHA-256', 'HEX').slice(0, 32);

      expect(output_hash).to.equal(hash(msg));
    });

    it('should return a correct keypair, each an array of 256 tuples', function() {
      expect(keypair.privKey.length).to.equal(256);
      expect(keypair.pubKey.length).to.equal(256);
      expect(keypair.privKey[0]).to.be.an('array');
      expect(keypair.pubKey[0]).to.be.an('array');

      var i = Math.floor(Math.random() * 256);
      expect(hash(keypair.privKey[i][1])).to.equal(keypair.pubKey[i][1]);
    });

  });

  describe('message signing and verification', function () {
    it('should return an Array[256] with each elem in privKey', function () {
      var msg = 'this is my sample message';
      var signature = lamport.sign(keypair.privKey, msg);

      expect(signature.length).to.equal(256);
      expect(keypair.privKey[1]).to.contain(signature[1]);
    });

    it('should guarantee that the signature is authentic', function() {
      var msg = 'this is another sample message';
      var signature = lamport.sign(keypair.privKey, msg);

      expect(lamport.verify(keypair.pubKey, msg, signature)).to.be.true();
    });
  });

});

describe('merkle signatures', function() {
  var mTree = new MerkleKeyTree(4);


  describe('merkle tree generation', function() {
    it('should generate merkle trees with log2(n) + 1 levels', function() {

      expect(mTree.rowNum).to.equal(3);
    });

    xit('should generate merkle trees of varying size', function() {
      var size = 8;
      var mTree = new MerkleKeyTree(size);

      expect(mTree._leaves.length).to.equal(size);
    })
  });

  describe('message signing and verification', function() {
    it('should generate a valid signature obj', function() {
      var msg = 'this is yet another message to be signed';
      var sig = mTree.sign(msg);

      expect(sig).to.have.property('keyPairId');
      expect(sig).to.have.property('pubKey');
      expect(sig).to.have.property('message');
      expect(sig).to.have.property('signature');
      expect(sig).to.have.property('path');
    });

    it('should guarantee that both signature and tree are authentic', function() {
      var msg = 'this is yet another semi-unique message to be signed';
      var sig = mTree.sign(msg);

      var keyPair = mTree._leaves[sig.keyPairId];
      expect(lamport.verify(keyPair.pubKey, msg, sig.signature)).to.be.true();
      expect(mTree.verify(sig)).to.be.true();
    });

    it('should not let you sign with your last key', function() {
      var msg = 'this is the last message to be signed with this keytree';
      var sig = mTree.sign(msg);

      expect(mTree.sign).to.throw(Error);
    })

  });
});