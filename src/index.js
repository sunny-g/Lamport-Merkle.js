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
  var hashObj = new jsSHA(msg, msg_type);
  return hashObj.getHash(HASH_FUNC, output_type);
};

var random32ByteString = function() {
  return JSON.stringify(secureRandom.randomArray(32))
};

var lamport = {

  generate: function() {

    var priv = [];
    var pub = [];

    for (var i = 0; i < 256; i++) {
      var num1 = random32ByteString();
      var num2 = random32ByteString();
      var hash1 = hash(num1);
      var hash2 = hash(num2);

      priv.push([num1, num2]);
      pub.push([hash1, hash2]);
    }

    return {
      privKey: priv,
      pubKey: pub
    }
  },

  sign: function() {

  },

  verify: function() {

  }

};

var merkle = {

};