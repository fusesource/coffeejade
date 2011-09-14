

/**
 * Module dependencies.
 */

var jade = require('./../lib/jade'),
    Compiler = jade.Compiler,
    nodes = jade.nodes;

function CSRF(node, options) {
  Compiler.call(this, node, options);
}

CSRF.prototype.__proto__ = Compiler.prototype;

CSRF.prototype.visitTag = function(node){
  var parent = Compiler.prototype.visitTag;
  switch (node.name) {
    case 'form':
      if ("'post'" == node.getAttribute('method')) {
        var tok = new nodes.Tag('input');
        tok.setAttribute('type', '"hidden"');
        tok.setAttribute('name', '"csrf"');
        tok.setAttribute('value', 'csrf');
        node.block.unshift(tok);
      }
  }
  parent.call(this, node);
};

var fs = require('fs');
var filename = __filename.replace(/\.js$/, '.jade');
var template = jade.template(fs.readFileSync(filename, 'UTF-8'), {filename:filename, debug:true, compiler: CSRF});

console.log(template({
  csrf: 'WAHOOOOOO'
}));


