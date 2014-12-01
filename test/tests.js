var expect = chai.expect;

describe('lamport signatures', function() {

  describe('hash creation', function () {
    it('should return the same hash for a given message', function () {
      var msg = 'this is a message';
      var output_hash = new jsSHA(msg, 'TEXT').getHash('SHA-256', 'HEX');
      expect(output_hash).to.equal(hash(msg));
    })
  });

  describe('', function () {
    it('', function () {

    })
  });

});