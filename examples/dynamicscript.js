
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade');

var locals = {
  users: {
    tj: { age: 23, email: 'tj@vision-media.ca', isA: 'human' },
    tobi: { age: 1, email: 'tobi@is-amazing.com', isA: 'ferret' }
  }
};

var fs = require('fs');
var filename = __filename.replace(/\.js$/, '.jade');
var template = jade.template(fs.readFileSync(filename, 'UTF-8'), {filename:filename, debug:true});
console.log(template(locals));
