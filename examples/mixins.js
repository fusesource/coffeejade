
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade');

var user = {
    name: 'tj'
  , pets: ['tobi', 'loki', 'jane', 'manny']
};

var locals={ user: user }

var fs = require('fs');
var filename = __filename.replace(/\.js$/, '.jade');
var template = jade.template(fs.readFileSync(filename, 'UTF-8'), {filename:filename, debug:true});
console.log(template(locals));
