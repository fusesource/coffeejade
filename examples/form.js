
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade');

var locals = {
  user: {
    name: 'TJ',
    email: 'tj@vision-media.ca',
    city: 'Victoria',
    province: 'BC'
  }
};

var fs = require('fs');
var filename = __filename.replace(/\.js$/, '.jade');
var template = jade.template(fs.readFileSync(filename, 'UTF-8'), {filename:filename, debug:true});
console.log(template(locals));
