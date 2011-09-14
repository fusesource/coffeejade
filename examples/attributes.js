/**
 * Module dependencies.
 */

var jade = require('./../lib/jade');

var fs = require('fs');
var filename = __filename.replace(/\.js$/, '.jade');
var template = jade.template(fs.readFileSync(filename, 'UTF-8'), {filename:filename});

console.log(template({ 
  name: 'tj'
}));
