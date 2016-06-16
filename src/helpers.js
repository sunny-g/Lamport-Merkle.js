'use strict';

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
    bits.forEach(function(bit, bitIdx) {
      bitIdx = (charIdx * 8) + bitIdx;
      callback (bit, bitIdx);
    });
  });
};