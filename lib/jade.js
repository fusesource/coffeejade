
/*!
 * Jade
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Parser = require('./parser')
  , Compiler = require('./compiler')
  , runtime = require('./runtime')
// if node
  , fs = require('fs');
// end

/**
 * Library version.
 */
exports.version = '1.0.0';

/**
 * Expose self closing tags.
 */

exports.selfClosing = require('./self-closing');

/**
 * Default supported doctypes.
 */

exports.doctypes = require('./doctypes');

/**
 * Text filters.
 */

exports.filters = require('./filters');

/**
 * Utilities.
 */

exports.utils = require('./utils');

/**
 * Expose `Compiler`.
 */

exports.Compiler = Compiler;

/**
 * Expose `Parser`.
 */

exports.Parser = Parser;

/**
 * Nodes.
 */

exports.nodes = require('./nodes');

/**
 * Jade runtime helpers.
 */

exports.runtime = runtime;

exports.compile = function(str, options){
  var options = options || {}
  var filename = options.filename ? JSON.stringify(options.filename) : 'undefined'
  var fn;

  try {
    // Parse
    var parser = new Parser(str, options.filename, options);

    // Compile
    var compiler = new (options.compiler || Compiler)(parser.parse(), options)
    var result = compiler.compile();

    // Debug compiler
    if (options.debug) {
      console.error('\nGenerated CoffeeScript:\n\n\033[90m%s\033[0m', result.code.replace(/^/gm, '  '));
    }
    
    return result;
  } catch (err) {
    parser = parser.context();
    runtime.rethrow(err, parser.filename, parser.lexer.lineno);
  }

};

/**
 */
exports.compile_to_js = function(str, options){
  var coffee = require('coffee-script');
  var fn = exports.compile(str, options).code
  fn = coffee.compile(fn, {bare:true, filename:options.filename})
  if (options.debug) {
    console.error('\nGenerated JavaScript:\n\n\033[90m%s\033[0m', fn.replace(/^/gm, '  '));
  }
  return fn;
};

exports.template = function(str, options){
  var fn = exports.compile_to_js(str, options)
  fn = new Function('locals, jade', "var fn="+fn+"; return fn(locals);");
  return function(locals){
    return fn(locals, runtime);
  };
};