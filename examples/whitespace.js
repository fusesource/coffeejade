
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade');

var locals={};
var fs = require('fs');
var filename = __filename.replace(/\.js$/, '.jade');
var template = jade.template(fs.readFileSync(filename, 'UTF-8'), {filename:filename, debug:true, pretty:true});
console.log(template(locals));
