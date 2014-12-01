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

var lamport = {

  generate: function() {
    var priv = [];
    var pub = [];

    for (var i = 0; i < 256; i++) {
      var num1 = random32Bytes();
      var num2 = random32Bytes();
      var hash1 = hash(JSON.stringify(num1));
      var hash2 = hash(JSON.stringify(num2));
      // var hash1 = hash(num1.toString());
      // var hash2 = hash(num2.toString());

      priv.push([num1, num2]);
      pub.push([hash1, hash2]);
    }

    return {
      privKey: priv,
      pubKey: pub
    }
  },

  sign: function(privKey, msg) {
    /*
    for each bit in the msgHash,
      push to signature either the 0th or 1st hash in each pair of the pubkey

     */
    var msgHash = hash(msg);
    var hashArray = msgHash.split('');
    var signature = [];

    hashArray.forEach(function(letter, index) {
      var binary = char2Binary(letter).split('');
      binary.forEach(function(bit, bitIdx) {
        // signature.push( pubKey[index + bitIdx][bit] );
        signature.push(privKey[index + bitIdx][bit]);
      })
    });

    return signature;
  },

  verify: function(pubKey, msg) {

  }

};

var merkle = {

};