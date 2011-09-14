
/*!
 * Jade - Compiler
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = require('./nodes')
  , filters = require('./filters')
  , doctypes = require('./doctypes')
  , selfClosing = require('./self-closing')
  , inlineTags = require('./inline-tags')
  , utils = require('./utils');

// if browser
// 
// if (!Object.keys) {
//   Object.keys = function(obj){
//     var arr = [];
//     for (var key in obj) {
//       if (obj.hasOwnProperty(key)) {
//         arr.push(obj);
//       }
//     }
//     return arr;
//   } 
// }
// 
// if (!String.prototype.trimLeft) {
//   String.prototype.trimLeft = function(){
//     return this.replace(/^\s+/, '');
//   }
// }
//
// end

/**
 * Initialize `Compiler` with the given `node`.
 *
 * @param {Node} node
 * @param {Object} options
 * @api public
 */

var Compiler = module.exports = function Compiler(node, options) {
  this.options = options = options || {};
  this.node = node;
  this.hasCompiledDoctype = false;
  this.hasCompiledTag = false;
  this.pp = options.pretty || false;
  this.indents = 0;
  if (options.doctype) this.setDoctype(options.doctype);
};

/**
 * Compiler prototype.
 */

Compiler.prototype = {
  
  /**
   * Compile parse tree to JavaScript.
   *
   * @api public
   */
  
  compile: function(){
    this.buf = [];
    this.indent = 0;
    this.smap = [];

    this.indented = function(value) {
      var b = ""
      for( i=0; i < this.indent; i++) {
        b += "  "
      }
      return b + value;
    };
    
    this.track_source = function(file, line, target_line) {
      file = file ? file : (this.smap.length > 0 ? this.smap[0].file : null);
      target_line = target_line ? target_line : this.buf.length+1
      this.smap.push({sf:file, sl:line, l:target_line});
    };
    
    this.p = function(value) {
      this.buf.push(this.indented(value))
    };
    
    this.block = function(next) {
      this.indent += 1;
      try {
        return next();
      } finally {
        this.indent -= 1;
      }
    };
    
    this.lastBufferedIdx = -1
    this.p('(locals) ->')
    compiler = this;
    this.block(function(){
      compiler.p('__ = jade.init()')
      if(compiler.options.self) {
        compiler.p('self = locals || {}')
        compiler.visit(this.node);
      } else {
        compiler.p('`with (locals || {}) {`')
        compiler.visit(compiler.node);
        compiler.p('`}`')
      }
      compiler.p('__.buf.join("")')
    });
    return {code:this.buf.join('\n'), smap:this.smap};
  },

  /**
   * Sets the default doctype `name`. Sets terse mode to `true` when
   * html 5 is used, causing self-closing tags to end with ">" vs "/>",
   * and boolean attributes are not mirrored.
   *
   * @param {string} name
   * @api public
   */
  
  setDoctype: function(name){
    var doctype = doctypes[(name || 'default').toLowerCase()];
    doctype = doctype || '<!DOCTYPE ' + name + '>';
    this.doctype = doctype;
    this.terse = '5' == name || 'html' == name;
    this.xml = 0 == this.doctype.indexOf('<?xml');
  },
  
  /**
   * Buffer the given `str` optionally escaped.
   *
   * @param {String} str
   * @param {Boolean} esc
   * @api public
   */
  
  buffer: function(str, esc){
    if (esc) str = utils.escape(str);
    
    if (this.lastBufferedIdx == this.buf.length) {
      this.lastBuffered += str;
      this.buf[this.lastBufferedIdx - 1] = this.indented("__.buf.push('" + this.lastBuffered + "')");
    } else {
      this.p("__.buf.push('" + str + "')");
      this.lastBuffered = str;
      this.lastBufferedIdx = this.buf.length;
    }    
  },
  
  /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */
  
  visit: function(node){
    this.track_source(node.filename, node.line)
    this.visitNode(node);
  },
  
  /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */
  
  visitNode: function(node){
    var name = node.constructor.name
      || node.constructor.toString().match(/function ([^(\s]+)()/)[1];
    return this['visit' + name](node);
  },

  /**
   * Visit literal `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitLiteral: function(node){
    var str = node.str.replace(/\n/g, '\\\\n');
    this.buffer(str);
  },

  /**
   * Visit all nodes in `block`.
   *
   * @param {Block} block
   * @api public
   */

  visitBlock: function(block){
    var len = block.nodes.length;
    for (var i = 0; i < len; ++i) {
      this.visit(block.nodes[i]);
    }
  },
  
  /**
   * Visit `doctype`. Sets terse mode to `true` when html 5
   * is used, causing self-closing tags to end with ">" vs "/>",
   * and boolean attributes are not mirrored.
   *
   * @param {Doctype} doctype
   * @api public
   */
  
  visitDoctype: function(doctype){
    if (doctype && (doctype.val || !this.doctype)) {
      this.setDoctype(doctype.val || 'default');
    }

    if (this.doctype) this.buffer(this.doctype);
    this.hasCompiledDoctype = true;
  },

  /**
   * Visit `mixin`, generating a function that
   * may be called within the template.
   *
   * @param {Mixin} mixin
   * @api public
   */

  visitMixin: function(mixin){
    var name = mixin.name.replace(/-/g, '_') + '_mixin'
      , args = mixin.args || '';

    if (mixin.block) {
      this.p(name + ' = (' + args + ')->');
      compiler = this;
      compiler.block(function(){
        compiler.visit(mixin.block);
      });
    } else {
      this.p(name + '(' + args + ')');
    }
  },

  /**
   * Visit `tag` buffering tag markup, generating
   * attributes, visiting the `tag`'s code and block.
   *
   * @param {Tag} tag
   * @api public
   */
  
  visitTag: function(tag){
    this.indents++;
    var name = tag.name;

    if (!this.hasCompiledTag) {
      if (!this.hasCompiledDoctype && 'html' == name) {
        this.visitDoctype();
      }
      this.hasCompiledTag = true;
    }

    // pretty print
    if (this.pp && inlineTags.indexOf(name) == -1) {
      this.buffer('\\n' + Array(this.indents).join('  '));
    }

    if (~selfClosing.indexOf(name) && !this.xml) {
      this.buffer('<' + name);
      this.visitAttributes(tag.attrs);
      this.terse
        ? this.buffer('>')
        : this.buffer('/>');
    } else {
      // Optimize attributes buffering
      if (tag.attrs.length) {
        this.buffer('<' + name);
        if (tag.attrs.length) this.visitAttributes(tag.attrs);
        this.buffer('>');
      } else {
        this.buffer('<' + name + '>');
      }
      if (tag.code) this.visitCode(tag.code);
      if (tag.text) this.buffer(utils.text(tag.text.nodes[0].trimLeft()));
      this.escape = 'pre' == tag.name;
      this.visit(tag.block);

      // pretty print
      if (this.pp && !~inlineTags.indexOf(name) && !tag.textOnly) {
        this.buffer('\\n' + Array(this.indents).join('  '));
      }

      this.buffer('</' + name + '>');
    }
    this.indents--;
  },
  
  /**
   * Visit `filter`, throwing when the filter does not exist.
   *
   * @param {Filter} filter
   * @api public
   */
  
  visitFilter: function(filter){
    var fn = filters[filter.name];

    // unknown filter
    if (!fn) {
      if (filter.isASTFilter) {
        throw new Error('unknown ast filter "' + filter.name + ':"');
      } else {
        throw new Error('unknown filter ":' + filter.name + '"');
      }
    }
    if (filter.isASTFilter) {
      this.p(fn(filter.block, this, filter.attrs));
    } else {
      var text = filter.block.nodes.join('');
      this.buffer(utils.text(fn(text, filter.attrs)));
    }
  },
  
  /**
   * Visit `text` node.
   *
   * @param {Text} text
   * @api public
   */
  
  visitText: function(text){
    text = utils.text(text.nodes.join(''));
    if (this.escape) text = escape(text);
    this.buffer(text);
    this.buffer('\\n');
  },
  
  /**
   * Visit a `comment`, only buffering when the buffer flag is set.
   *
   * @param {Comment} comment
   * @api public
   */
  
  visitComment: function(comment){
    if (!comment.buffer) return;
    if (this.pp) this.buffer('\\n' + Array(this.indents + 1).join('  '));
    this.buffer('<!--' + utils.escape(comment.val) + '-->');
  },
  
  /**
   * Visit a `BlockComment`.
   *
   * @param {Comment} comment
   * @api public
   */
  
  visitBlockComment: function(comment){
    if (!comment.buffer) return;
    if (0 == comment.val.indexOf('if')) {
      this.buffer('<!--[' + comment.val + ']>');
      this.visit(comment.block);
      this.buffer('<![endif]-->');
    } else {
      this.buffer('<!--' + comment.val);
      this.visit(comment.block);
      this.buffer('-->');
    }
  },
  
  /**
   * Visit `code`, respecting buffer / escape flags.
   * If the code is followed by a block, wrap it in
   * a self-calling function.
   *
   * @param {Code} code
   * @api public
   */
  
  visitCode: function(code){
    // Wrap code blocks with {}.
    // we only wrap unbuffered code blocks ATM
    // since they are usually flow control

    // Buffer code
    var val = code.val.trimLeft();
    if (code.buffer) {
      if (code.escape) val = '__.escape(' + val + ')';
      this.p("__.buf.push(" + val + ");");
    } else {
      this.p(val);
    }

    // Block support
    if (code.block) {
      compiler = this;
      this.block(function(){
        compiler.visit(code.block);
      })
    }
  },
  
  /**
   * Visit `each` block.
   *
   * @param {Each} each
   * @api public
   */
  
  visitEach: function(each){
    this.p(''
      + '// iterate ' + each.obj + '\n'
      + '(function(){\n'
      + '  if (\'number\' == typeof ' + each.obj + '.length) {\n'
      + '    for (var ' + each.key + ' = 0, $$l = ' + each.obj + '.length; ' + each.key + ' < $$l; ' + each.key + '++) {\n'
      + '      var ' + each.val + ' = ' + each.obj + '[' + each.key + '];\n');

    this.visit(each.block);

    this.p(''
      + '    }\n'
      + '  } else {\n'
      + '    for (var ' + each.key + ' in ' + each.obj + ') {\n'
      // if browser
      // + '      if (' + each.obj + '.hasOwnProperty(' + each.key + ')){'
      // end
      + '      var ' + each.val + ' = ' + each.obj + '[' + each.key + '];\n');

    this.visit(each.block);

    // if browser
    // this.p('      }\n');
    // end

    this.p('   }\n  }\n}).call(this);\n');
  },
  
  /**
   * Visit `attrs`.
   *
   * @param {Array} attrs
   * @api public
   */
  
  visitAttributes: function(attrs){
    var buf = []
      , classes = [];

    if (this.terse) buf.push('terse: true');

    attrs.forEach(function(attr){
      if (attr.name == 'class') {
        classes.push('(' + attr.val + ')');
      } else {
        var pair = "'" + attr.name + "':(" + attr.val + ')';
        buf.push(pair);
      }
    });

    if (classes.length) {
      classes = classes.join(" + ' ' + ");
      buf.push("'class': " + classes);
    }
    
    buf = buf.join(', ');

    this.p("__.buf.push(__.attrs({ " + buf + " }));");
  }
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

function escape(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
