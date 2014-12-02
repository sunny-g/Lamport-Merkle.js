var expect = chai.expect;

describe('lamport signatures', function() {

  describe('keypair creation', function () {
    it('should return the same hash for a given message', function () {
      var msg = 'this is a message';
      var output_hash = new jsSHA(msg, 'TEXT').getHash('SHA-256', 'HEX').slice(0, 32);
      expect(output_hash).to.equal(hash(msg));
    });

    it('should return a correct keypair, each an array of 256 tuples', function() {
      var keypair = lamport.generate();

      expect(keypair.privKey.length).to.equal(256);
      expect(keypair.pubKey.length).to.equal(256);
      expect(keypair.privKey[0]).to.be.an('array');
      expect(keypair.pubKey[0]).to.be.an('array');

      var i = Math.floor(Math.random() * 256);
      expect(hash(keypair.privKey[i][1])).to.equal(keypair.pubKey[i][1]);
      // expect(hash( keypair.privKey[i][1].toString() )).to.equal(keypair.pubKey[i][1]);
    });

  });

  describe('message signing and verification', function () {
    it('should return an Array[256] with each elem in privKey', function () {
      var keypair = lamport.generate();
      var msg = 'this is my sample message';
      var signature = lamport.sign(keypair.privKey, msg);

      expect(signature.length).to.equal(256);
      expect(keypair.privKey[1]).to.contain(signature[1]);
    });

    it('should guarantee that the signature is authentic', function() {
      var keypair = lamport.generate();
      var msg = 'this is another sample message';
      var signature = lamport.sign(keypair.privKey, msg);

      expect(lamport.verify(keypair.pubKey, msg, signature)).to.be.ok();
    })
  });

});