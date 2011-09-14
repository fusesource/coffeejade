
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade');

var locals={ 
  name: 'tj', 
  email: 'tj@vision-media.ca' 
};
var fs = require('fs');
var filename = __filename.replace(/\.js$/, '.jade');
var template = jade.template(fs.readFileSync(filename, 'UTF-8'), {filename:filename, debug:true});
console.log(template(locals));
