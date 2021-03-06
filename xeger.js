module.exports = function (cb, options) {
  var r = new Xeger(cb, options);

  return r.regex();
};


var Xeger = function (cb, options) {
  options = options || {};
  this.regexStr = '';
  this.flags = '';

  if (options.multiline) {
    this.flags += 'm';
  }
  if (options.global) {
    this.flags += 'g';
  }
  if (options.insensitive) {
    this.flags += 'i';
  }
  cb.call(this, this);
};

/* Public */
Xeger.prototype.literal = function (str, options) {
  var hasOptions = typeof options === 'object' &&
                   Object.keys(options).length > 0 &&
                   str.length > 1;
  if (hasOptions) {
    this.add('(?:');
  }

  this.add(escape(str));

  if (hasOptions) {
    this.add(')');
  }
  this.addOptions(options);
};

Xeger.prototype.alphanumeric = function (options) {
  this.add('\\w');
  this.addOptions(options);
};

Xeger.prototype.number = function (options) {
  this.add('\\d');
  this.addOptions(options);
};

Xeger.prototype.newline = function (options) {
  this.add('\\n');
  this.addOptions(options);
};

Xeger.prototype.whitespace = function(options){
  this.add('\\s');
  this.addOptions(options);
};

Xeger.prototype.start = function () {
  this.add('^');
};

Xeger.prototype.end = function () {
  this.add('$');
};

Xeger.prototype.to = function () {
  this.add('-');
};

Xeger.prototype.any = function (str, options) {
  if (typeof str === 'string') {
    this.add('[' + escape(str) + ']');
  } else if (typeof str === 'function') {
    var cb = str;
    this.add('[');
    cb.call(this, this);
    this.add(']');
  } else {
    options = str;
    this.add('.');
  }
  this.addOptions(options);
};

Xeger.prototype.not = function (str, options) {
  if (typeof str === 'string') {
    this.add('[^' + escape(str) + ']');
  } else if (typeof str === 'function') {
    var cb = str;
    this.add('[^');
    cb.call(this, this);
    this.add(']');
  }
  this.addOptions(options);
};

Xeger.prototype.group = function (cb, options) {
  this.add('(');
  if (options && options.ignore) {
    this.add('?:');
  }
  cb.call(this, this);
  this.add(')');
  this.addOptions(options);
};

/* Private */

Xeger.prototype.regex = function () {
  return new RegExp(this.regexStr, this.flags);
};

Xeger.prototype.addOptions = function (options) {
  options = options || {};

  if (options.multiple && options.optional) {
    this.add('*');
  } else if (options.multiple) {
    this.add('+');
  } else if (options.optional) {
    this.add('?');
  } else if (typeof options.repeat === 'number') {
    this.add('{' + options.repeat + '}');
  } else if (
             typeof options.from === 'number' ||
             typeof options.to   === 'number'
            ) {
    this.add('{');
    if (typeof options.from === 'number') {
      this.add(options.from);
    }
    this.add(',');
    if (typeof options.to === 'number') {
      this.add(options.to);
    }
    this.add('}');
  }
};

Xeger.prototype.add = function (str) {
  this.regexStr += str;
};

var escape = function (str) {
  return str.split('').map(function (char) {
    if (/\w/.test(char)) {
      return char;
    } else {
      return '\\' + char;
    }
  }).join('');
};
