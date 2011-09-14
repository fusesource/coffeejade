jade.templates['server-compile-template.jade'] = (function(locals) {
  var __;
  __ = jade.init();
  with (locals || {}) {;
  __.buf.push('<h1>Hello World</h1><p>This is \nA test\n</p>');
  };
  return __.buf.join("");
});