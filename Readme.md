# CoffeeScript Jade - template engine

 CoffeeScript Jade is a fork of [JavaScript Jade](https://github.com/visionmedia/jade)
 which uses CoffeeScript for the embedded logic instead of JavaScript.  It's command line tool
 also focuses generating CoffeeScript/JavaScript from the `.jade` files which you can
 later load in you application without needing the compiler.
 
 Jade is high performance template engine heavily influenced by [Haml](http://haml-lang.com)
 and implemented with JavaScript for [node](http://nodejs.org).

## Features

  - client-side support
  - great readability
  - flexible indentation
  - block-expansion
  - mixins
  - static includes
  - attribute interpolation
  - code is escaped by default for security
  - contextual error reporting at compile &amp; run time
  - executable for compiling jade templates to javascript via the command line
  - html 5 mode (using the _!!! 5_ doctype)
  - optional memory caching
  - combine dynamic and static tag classes
  - parse tree manipulation via _filters_
  - template inheritance
  - supports [Express JS](http://expressjs.com) out of the box
  - block comments
  - no tag prefix
  - AST filters
  - filters
    - :sass must have [sass.js](http://github.com/visionmedia/sass.js) installed
    - :less must have [less.js](http://github.com/cloudhead/less.js) installed
    - :markdown must have [markdown-js](http://github.com/evilstreak/markdown-js) installed or [node-discount](http://github.com/visionmedia/node-discount)
    - :cdata
  - [Vim Syntax](https://github.com/digitaltoad/vim-jade)
  - [TextMate Bundle](http://github.com/miksago/jade-tmbundle)
  - [Screencasts](http://tjholowaychuk.com/post/1004255394/jade-screencast-template-engine-for-nodejs)
  - [html2jade](https://github.com/donpark/html2jade) converter

## Implementations

  - [php](http://github.com/everzet/jade.php)
  - [scala](http://scalate.fusesource.org/versions/snapshot/documentation/scaml-reference.html)
  - [ruby](http://github.com/stonean/slim)

## Installation

via git/npm:

    git clone https://github.com/fusesource/coffeejade
    sudo npm install -g coffeejade

## Browser Support

To compile jade to a single file compatible for client-side use simply execute:

   $ make all

### Client Side Template Compiling

The above generates the `coffeejade.js` and `coffeejade.min.js`.  Just include
one of those in your HTML file along with the coffee-script compiler javascript
file.  Example:

```html
<script src="coffee-script.js"></script>
<script src="coffeejade.js"></script>
```

Then you can compile and render templates like the following example
shows:

```html
<script type="text/javascript"> 
  var template = jade.template('h1= "Hello #{name}"');
  alert(template({name: 'Hiram'}));
</script>
```

### Precompiled Templates

You can also precompile the `.jade` templates into java script files which 
are then loaded on the browser.  In this case you only need to load the 
`coffeejade-runtime.js` file into your browser.

Lets say you have a Jade file called `example.jade` with the following 
contents:

```
h1= "Hello #{name}
```

You would precompile it using the following command:

    coffeejade example.jade

The above will generate an `example.js` file in the same directory. You then
loaded it into your browser as follows:

```html
<script src="coffeejade-runtime.js"></script>
<script src="example.js"></script>
```

And then access and render the template using:

```html
<script type="text/javascript"> 
  var template = jade.templates["example.jade"];
  alert(template({name: 'Hiram'}));
</script>
```

## Public API

```javascript
var jade = require('jade');

// Compile a function
var fn = jade.template('string of jade', options);
fn(locals);
```

### Options

 - `self`      Use a `self` namespace to hold the locals. _false by default_
 - `filename`  Used in exceptions, and required when using includes
 - `debug`     Outputs tokens and function body generated
 - `compiler`  Compiler to replace jade's default

## Syntax

### Line Endings

**CRLF** and **CR** are converted to **LF** before parsing.

### Tags

A tag is simply a leading word:

    html

for example is converted to `<html></html>`

tags can also have ids:

    div#container

which would render `<div id="container"></div>`

how about some classes?

    div.user-details

renders `<div class="user-details"></div>`

multiple classes? _and_ an id? sure:

    div#foo.bar.baz

renders `<div id="foo" class="bar baz"></div>`

div div div sure is annoying, how about:

    #foo
    .bar

which is syntactic sugar for what we have already been doing, and outputs:

    `<div id="foo"></div><div class="bar"></div>`

### Tag Text

Simply place some content after the tag:

    p wahoo!

renders `<p>wahoo!</p>`.

well cool, but how about large bodies of text:

    p
      | foo bar baz
      | rawr rawr
      | super cool
      | go jade go

renders `<p>foo bar baz rawr.....</p>`

interpolation? yup! both types of text can utilize interpolation,
if we passed `{ name: 'tj', email: 'tj@vision-media.ca' }` to the compiled function we can do the following:

    #user #{name} &lt;#{email}&gt;

outputs `<div id="user">tj &lt;tj@vision-media.ca&gt;</div>`

Actually want `#{}` for some reason? escape it!

    p \#{something}

now we have `<p>#{something}</p>`

We can also utilize the unescaped variant `!{html}`, so the following
will result in a literal script tag:

    - html = "<script></script>"
    | !{html}

Nested tags that also contain text can optionally use a text block:

    label
      | Username:
      input(name='user[name]')

or immediate tag text:

    label Username:
      input(name='user[name]')

Tags that accept _only_ text such as `script`, `style`, and `textarea` do not
need the leading `|` character, for example:

      html
        head
          title Example
          script
            if (foo) {
              bar();
            } else {
              baz();
            }

It should be noted that text blocks should be doubled escaped.  For example if you desire the following output.

    </p>foo\bar</p>

use:

    p.
      foo\\bar

### Comments

Single line comments currently look the same as JavaScript comments,
aka "//" and must be placed on their own line:

    // just some paragraphs
    p foo
    p bar

would output

    <!-- just some paragraphs -->
    <p>foo</p>
    <p>bar</p>

Jade also supports unbuffered comments, by simply adding a hyphen:

    //- will not output within markup
    p foo
    p bar

outputting

    <p>foo</p>
    <p>bar</p>

### Block Comments

 A block comment is legal as well:

      body
        //
          #content
            h1 Example

outputting

    <body>
      <!--
      <div id="content">
        <h1>Example</h1>
      </div>
      -->
    </body>

Jade supports conditional-comments as well, for example:

    body
      //if IE
        a(href='http://www.mozilla.com/en-US/firefox/') Get Firefox

outputs:

    <body>
      <!--[if IE]>
        <a href="http://www.mozilla.com/en-US/firefox/">Get Firefox</a>
      <![endif]-->
    </body>


### Nesting

 Jade supports nesting to define the tags in a natural way:

    ul
      li.first
        a(href='#') foo
      li
        a(href='#') bar
      li.last
        a(href='#') baz

### Block Expansion

 Block expansion allows you to create terse single-line nested tags,
 the following example is equivalent to the nesting example above.

      ul
        li.first: a(href='#') foo
        li: a(href='#') bar
        li.last: a(href='#') baz


### Attributes

Jade currently supports '(' and ')' as attribute delimiters.

    a(href='/login', title='View login page') Login

When a value is `undefined` or `null` the attribute is _not_ added,
so this is fine, it will not compile 'something="null"'.

    div(something=null)

Boolean attributes are also supported:

    input(type="checkbox" checked)

Boolean attributes with code will only output the attribute when `true`:

    input(type="checkbox" checked=someValue)
    
Multiple lines work too:

    input(type='checkbox'
      name='agreement'
      checked)

Multiple lines without the comma work fine:

    input(type='checkbox'
      name='agreement'
      checked)

Funky whitespace? fine:


    input(
      type='checkbox'
      name='agreement'
      checked)

Colons work:

    rss(xmlns:atom="atom")

Suppose we have the `user` local `{ id: 12, name: 'tobi' }`
and we wish to create an anchor tag with `href` pointing to "/user/12"
we could use regular javascript concatenation:

    a(href='/user/' + user.id)= user.name

or we could use jade's interpolation, which I added because everyone
using Ruby or CoffeeScript seems to think this is legal js..:

   a(href='/user/#{user.id}')= user.name

The `class` attribute is special-cased when an array is given,
allowing you to pass an array such as `bodyClasses = ['user', 'authenticated']` directly:

    body(class=bodyClasses)

### HTML

 Inline html is fine, we can use the pipe syntax to 
 write arbitrary text, in this case some html:

```
html
  body
    | <h1>Title</h1>
    | <p>foo bar baz</p>
```

 Or we can use the trailing `.` to indicate to Jade that we
 only want text in this block, allowing us to omit the pipes:

```
html
  body.
    <h1>Title</h1>
    <p>foo bar baz</p>
```

 Both of these examples yield the same result:

```
<html><body><h1>Title</h1>
<p>foo bar baz</p>
</body></html>
```

 The same rule applies for anywhere you can have text
 in jade, raw html is fine:

```
html
  body
    h1 User <em>#{name}</em>
```

### Doctypes

To add a doctype simply use `!!!`, or `doctype` followed by an optional value:

    !!!

Will output the _transitional_ doctype, however:

    !!! 5

or

    !!! html

or

    doctype html

doctypes are case-insensitive, so the following are equivalent:

    doctype Basic
    doctype basic

Will output the _html 5_ doctype. Below are the doctypes
defined by default, which can easily be extended:

```javascript
    var doctypes = exports.doctypes = {
	    '5': '<!DOCTYPE html>',
	    'xml': '<?xml version="1.0" encoding="utf-8" ?>',
	    'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
	    'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
	    'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
	    'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
	    '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
	    'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
	    'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
	};
```

To alter the default simply change:

```javascript
    jade.doctypes.default = 'whatever you want';
```

## Filters

Filters are prefixed with `:`, for example `:markdown` and
pass the following block of text to an arbitrary function for processing. View the _features_
at the top of this document for available filters.

    body
      :markdown
        Woah! jade _and_ markdown, very **cool**
        we can even link to [stuff](http://google.com)

Renders:

       <body><p>Woah! jade <em>and</em> markdown, very <strong>cool</strong> we can even link to <a href="http://google.com">stuff</a></p></body>

## Code

Jade currently supports three classifications of executable code. The first
is prefixed by `-`, and is not rendered.  All executable code but 
be valid CoffeeScript:

    - foo = 'bar'

This can be used for conditionals, or iteration:

    - for key,value of obj
      p(id=key)= value

The following is valid as well:

    - if (foo)
      ul
        li yay
        li foo
        li worked
    - else
      p oh no! didnt work

Hell, even verbose iteration:

    - if (items.length)
      ul
        - for item in items
          li= item

Anything you want!

Next up we have _escaped_ code, which is used to
return value, which is prefixed by `=`:

    - foo = 'bar'
    = foo
    h1= foo

Which outputs `bar<h1>bar</h1>`. Code rendered by `=` is escaped 
by default for security, however to output unescaped return values
you may use `!=`:

    p!= aVarContainingMoreHTML

## Includes

 Includes allow you to statically include chunks of Jade
 which lives in a separate file. The classical example is
 including a header and footer. Suppose we have the following
 directory structure:

     ./layout.jade
     ./includes/
       ./head.jade
       ./tail.jade

and the following _layout.jade_:

      html
        include includes/head  
        body
          h1 My Site
          p Welcome to my super amazing site.
          include includes/foot

both includes _includes/head_ and _includes/foot_ are
read relative to the `filename` option given to _layout.jade_,
which should be an absolute path to this file, however Express does this for you. Include then parses these files, and injects the AST produced to render what you would expect:

```html
<html>
  <head>
    <title>My Site</title>
    <script src="/javascripts/jquery.js">
    </script><script src="/javascripts/app.js"></script>
  </head>
  <body>
    <h1>My Site</h1>
    <p>Welcome to my super lame site.</p>
    <div id="footer">
      <p>Copyright>(c) foobar</p>
    </div>
  </body>
</html>
```

## Mixins

 Mixins are converted to regular functions in
 the compiled template that Jade constructs. Mixins may
 take arguments, though not required:

      mixin list
        ul
          li foo
          li bar
          li baz

  Utilizing a mixin without args looks similar, just without a block:
  
      h2 Groceries
      mixin list

  Mixins may take one or more arguments as well, the arguments
  are regular javascripts expressions, so for example the following:

      mixin pets(pets)
        ul.pets
          - each pet in pets
            li= pet

      mixin profile(user)
        .user
          h2= user.name
          mixin pets(user.pets)

   Would yield something similar to the following html:

```html
<div class="user">
  <h2>tj</h2>
  <ul class="pets">
    <li>tobi</li>
    <li>loki</li>
    <li>jane</li>
    <li>manny</li>
  </ul>
</div>
```

## Generated Output

 Suppose we have the following Jade:

```jade
- title = 'yay'
h1.title #{title}
p Just an example
```
When compiled with `coffeejade` it will produce java script similar to:

```js
jade.templates['example.jade'] = function(locals) {
  var title, __;
  __ = jade.init();
  with (locals || {}) {;
  title = 'yay';
  __.buf.push('<h1');
  __.buf.push(__.attrs({
    'class': 'title'
  }));
  __.buf.push('>' + __.escape(title) + '</h1><p>Just an example</p>');
  };
  return __.buf.join("");
};
```

You can also `coffeejade` generate CoffeeScript instead of java script by adding
the `-c` argument.  It would then produce a `.coffee` file with the following:

```coffee
jade.templates['example.jade'] =
  (locals) ->
    __ = jade.init()
    `with (locals || {}) {`
    title = 'yay'
    __.buf.push('<h1')
    __.buf.push(__.attrs({ 'class': ('title') }));
    __.buf.push('>' + __.escape(title) + '</h1><p>Just an example</p>')
    `}`
    __.buf.join("")
```

If you want to use the template as an Asynchronous Module Definition (AMD),
then then add the `-a file.js` option.  It will wrap the templates
in a module definition.

## coffeejade(1)

```

  Usage: coffeejade [options] file.jade target.

  Options:

    -h, --help                  output usage information
    -v, --version               output the version number
    -c, --coffee                Compile to CoffeeScript instead of JavaScript
    -p, --pretty                Pretty print the HTML
    -d, --doctype <type>        Sets the doctype in the generated HTML
    -s, --self                  Use a `self` namespace to hold the locals
    -d, --debug                 Enable debug mode
    -a, --amdout <file>         Wrap all the templates in an Asynchronous Module Definition (AMD)
    -r, --amdrequire <require>  Add a require to the AMD

  Examples:

    # translate all the jade files the templates dir
    $ coffeejade templates

    # Like the the previous example, but generate one javascript file.
    $ coffeejade --amdout templates.js templates

```

## License 

(The MIT License)

Copyright (c) 2009-2010 TJ Holowaychuk &lt;tj@vision-media.ca&gt;
Copyright (c) 2011 FuseSource Corp <http://fusesource.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
