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

lamport = {

  generate: function() {

  },

  sign: function() {

  },

  verify: function() {

  }

};

merkle = {

};