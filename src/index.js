/*
EXAMPLE USAGE:
var lamport = require('lamport')
var keys = lamport.generate();

var signature = lamport.sign(keys.private, 'MESSAGE TO SIGN')

if (lamport.verify(keys.public, 'MESSAGE TO SIGN', signature)) {
  console.log('Authentic.');
} else {
  console.log('Not Authentic!');
}
 */

var HASH_FUNC = 'SHA-256';
var MSG_TYPE = 'TEXT';
var HASH_OUTPUT = 'HEX';

var hash = function(msg) {
  MSG_TYPE = MSG_TYPE || 'TEXT';
  HASH_OUTPUT = HASH_OUTPUT || 'HEX';
  var hashObj = new jsSHA(msg, 'TEXT');
  return hashObj.getHash(HASH_FUNC, HASH_OUTPUT);
};

var lamport = {

  generate: function() {

  },

  sign: function() {

  },

  verify: function() {

  }

};

var merkle = {

};