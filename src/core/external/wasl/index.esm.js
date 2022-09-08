var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};

// ../../node_modules/blob-polyfill/Blob.js
var require_Blob = __commonJS({
  "../../node_modules/blob-polyfill/Blob.js"(exports) {
    (function(global2) {
      (function(factory) {
        if (typeof define === "function" && define.amd) {
          define(["exports"], factory);
        } else if (typeof exports === "object" && typeof exports.nodeName !== "string") {
          factory(exports);
        } else {
          factory(global2);
        }
      })(function(exports2) {
        "use strict";
        var BlobBuilder = global2.BlobBuilder || global2.WebKitBlobBuilder || global2.MSBlobBuilder || global2.MozBlobBuilder;
        var URL2 = global2.URL || global2.webkitURL || function(href, a) {
          a = document.createElement("a");
          a.href = href;
          return a;
        };
        var origBlob = global2.Blob;
        var createObjectURL = URL2.createObjectURL;
        var revokeObjectURL = URL2.revokeObjectURL;
        var strTag = global2.Symbol && global2.Symbol.toStringTag;
        var blobSupported = false;
        var blobSupportsArrayBufferView = false;
        var blobBuilderSupported = BlobBuilder && BlobBuilder.prototype.append && BlobBuilder.prototype.getBlob;
        try {
          blobSupported = new Blob(["\xE4"]).size === 2;
          blobSupportsArrayBufferView = new Blob([new Uint8Array([1, 2])]).size === 2;
        } catch (e) {
        }
        function mapArrayBufferViews(ary) {
          return ary.map(function(chunk) {
            if (chunk.buffer instanceof ArrayBuffer) {
              var buf = chunk.buffer;
              if (chunk.byteLength !== buf.byteLength) {
                var copy = new Uint8Array(chunk.byteLength);
                copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
                buf = copy.buffer;
              }
              return buf;
            }
            return chunk;
          });
        }
        function BlobBuilderConstructor(ary, options) {
          options = options || {};
          var bb = new BlobBuilder();
          mapArrayBufferViews(ary).forEach(function(part) {
            bb.append(part);
          });
          return options.type ? bb.getBlob(options.type) : bb.getBlob();
        }
        function BlobConstructor(ary, options) {
          return new origBlob(mapArrayBufferViews(ary), options || {});
        }
        if (global2.Blob) {
          BlobBuilderConstructor.prototype = Blob.prototype;
          BlobConstructor.prototype = Blob.prototype;
        }
        function stringEncode(string) {
          var pos = 0;
          var len = string.length;
          var Arr = global2.Uint8Array || Array;
          var at = 0;
          var tlen = Math.max(32, len + (len >> 1) + 7);
          var target = new Arr(tlen >> 3 << 3);
          while (pos < len) {
            var value = string.charCodeAt(pos++);
            if (value >= 55296 && value <= 56319) {
              if (pos < len) {
                var extra = string.charCodeAt(pos);
                if ((extra & 64512) === 56320) {
                  ++pos;
                  value = ((value & 1023) << 10) + (extra & 1023) + 65536;
                }
              }
              if (value >= 55296 && value <= 56319) {
                continue;
              }
            }
            if (at + 4 > target.length) {
              tlen += 8;
              tlen *= 1 + pos / string.length * 2;
              tlen = tlen >> 3 << 3;
              var update = new Uint8Array(tlen);
              update.set(target);
              target = update;
            }
            if ((value & 4294967168) === 0) {
              target[at++] = value;
              continue;
            } else if ((value & 4294965248) === 0) {
              target[at++] = value >> 6 & 31 | 192;
            } else if ((value & 4294901760) === 0) {
              target[at++] = value >> 12 & 15 | 224;
              target[at++] = value >> 6 & 63 | 128;
            } else if ((value & 4292870144) === 0) {
              target[at++] = value >> 18 & 7 | 240;
              target[at++] = value >> 12 & 63 | 128;
              target[at++] = value >> 6 & 63 | 128;
            } else {
              continue;
            }
            target[at++] = value & 63 | 128;
          }
          return target.slice(0, at);
        }
        function stringDecode(buf) {
          var end = buf.length;
          var res = [];
          var i = 0;
          while (i < end) {
            var firstByte = buf[i];
            var codePoint = null;
            var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
            if (i + bytesPerSequence <= end) {
              var secondByte, thirdByte, fourthByte, tempCodePoint;
              switch (bytesPerSequence) {
                case 1:
                  if (firstByte < 128) {
                    codePoint = firstByte;
                  }
                  break;
                case 2:
                  secondByte = buf[i + 1];
                  if ((secondByte & 192) === 128) {
                    tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                    if (tempCodePoint > 127) {
                      codePoint = tempCodePoint;
                    }
                  }
                  break;
                case 3:
                  secondByte = buf[i + 1];
                  thirdByte = buf[i + 2];
                  if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                    tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                    if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                      codePoint = tempCodePoint;
                    }
                  }
                  break;
                case 4:
                  secondByte = buf[i + 1];
                  thirdByte = buf[i + 2];
                  fourthByte = buf[i + 3];
                  if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                    tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                    if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                      codePoint = tempCodePoint;
                    }
                  }
              }
            }
            if (codePoint === null) {
              codePoint = 65533;
              bytesPerSequence = 1;
            } else if (codePoint > 65535) {
              codePoint -= 65536;
              res.push(codePoint >>> 10 & 1023 | 55296);
              codePoint = 56320 | codePoint & 1023;
            }
            res.push(codePoint);
            i += bytesPerSequence;
          }
          var len = res.length;
          var str = "";
          var j = 0;
          while (j < len) {
            str += String.fromCharCode.apply(String, res.slice(j, j += 4096));
          }
          return str;
        }
        var textEncode = typeof TextEncoder === "function" ? TextEncoder.prototype.encode.bind(new TextEncoder()) : stringEncode;
        var textDecode = typeof TextDecoder === "function" ? TextDecoder.prototype.decode.bind(new TextDecoder()) : stringDecode;
        function FakeBlobBuilder() {
          function bufferClone(buf) {
            var view = new Array(buf.byteLength);
            var array = new Uint8Array(buf);
            var i = view.length;
            while (i--) {
              view[i] = array[i];
            }
            return view;
          }
          function array2base64(input) {
            var byteToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var output = [];
            for (var i = 0; i < input.length; i += 3) {
              var byte1 = input[i];
              var haveByte2 = i + 1 < input.length;
              var byte2 = haveByte2 ? input[i + 1] : 0;
              var haveByte3 = i + 2 < input.length;
              var byte3 = haveByte3 ? input[i + 2] : 0;
              var outByte1 = byte1 >> 2;
              var outByte2 = (byte1 & 3) << 4 | byte2 >> 4;
              var outByte3 = (byte2 & 15) << 2 | byte3 >> 6;
              var outByte4 = byte3 & 63;
              if (!haveByte3) {
                outByte4 = 64;
                if (!haveByte2) {
                  outByte3 = 64;
                }
              }
              output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
            }
            return output.join("");
          }
          var create = Object.create || function(a) {
            function c() {
            }
            c.prototype = a;
            return new c();
          };
          function getObjectTypeName(o) {
            return Object.prototype.toString.call(o).slice(8, -1);
          }
          function isPrototypeOf(c, o) {
            return typeof c === "object" && Object.prototype.isPrototypeOf.call(c.prototype, o);
          }
          function isDataView(o) {
            return getObjectTypeName(o) === "DataView" || isPrototypeOf(global2.DataView, o);
          }
          var arrayBufferClassNames = [
            "Int8Array",
            "Uint8Array",
            "Uint8ClampedArray",
            "Int16Array",
            "Uint16Array",
            "Int32Array",
            "Uint32Array",
            "Float32Array",
            "Float64Array",
            "ArrayBuffer"
          ];
          function includes(a, v) {
            return a.indexOf(v) !== -1;
          }
          function isArrayBuffer(o) {
            return includes(arrayBufferClassNames, getObjectTypeName(o)) || isPrototypeOf(global2.ArrayBuffer, o);
          }
          function concatTypedarrays(chunks) {
            var size = 0;
            var j = chunks.length;
            while (j--) {
              size += chunks[j].length;
            }
            var b = new Uint8Array(size);
            var offset = 0;
            for (var i = 0; i < chunks.length; i++) {
              var chunk = chunks[i];
              b.set(chunk, offset);
              offset += chunk.byteLength || chunk.length;
            }
            return b;
          }
          function Blob4(chunks, opts) {
            chunks = chunks || [];
            opts = opts == null ? {} : opts;
            for (var i = 0, len = chunks.length; i < len; i++) {
              var chunk = chunks[i];
              if (chunk instanceof Blob4) {
                chunks[i] = chunk._buffer;
              } else if (typeof chunk === "string") {
                chunks[i] = textEncode(chunk);
              } else if (isDataView(chunk)) {
                chunks[i] = bufferClone(chunk.buffer);
              } else if (isArrayBuffer(chunk)) {
                chunks[i] = bufferClone(chunk);
              } else {
                chunks[i] = textEncode(String(chunk));
              }
            }
            this._buffer = global2.Uint8Array ? concatTypedarrays(chunks) : [].concat.apply([], chunks);
            this.size = this._buffer.length;
            this.type = opts.type || "";
            if (/[^\u0020-\u007E]/.test(this.type)) {
              this.type = "";
            } else {
              this.type = this.type.toLowerCase();
            }
          }
          Blob4.prototype.arrayBuffer = function() {
            return Promise.resolve(this._buffer.buffer || this._buffer);
          };
          Blob4.prototype.text = function() {
            return Promise.resolve(textDecode(this._buffer));
          };
          Blob4.prototype.slice = function(start, end, type) {
            var slice = this._buffer.slice(start || 0, end || this._buffer.length);
            return new Blob4([slice], { type });
          };
          Blob4.prototype.toString = function() {
            return "[object Blob]";
          };
          function File2(chunks, name2, opts) {
            opts = opts || {};
            var a = Blob4.call(this, chunks, opts) || this;
            a.name = name2.replace(/\//g, ":");
            a.lastModifiedDate = opts.lastModified ? new Date(opts.lastModified) : new Date();
            a.lastModified = +a.lastModifiedDate;
            return a;
          }
          File2.prototype = create(Blob4.prototype);
          File2.prototype.constructor = File2;
          if (Object.setPrototypeOf) {
            Object.setPrototypeOf(File2, Blob4);
          } else {
            try {
              File2.__proto__ = Blob4;
            } catch (e) {
            }
          }
          File2.prototype.toString = function() {
            return "[object File]";
          };
          function FileReader2() {
            if (!(this instanceof FileReader2)) {
              throw new TypeError("Failed to construct 'FileReader': Please use the 'new' operator, this DOM object constructor cannot be called as a function.");
            }
            var delegate = document.createDocumentFragment();
            this.addEventListener = delegate.addEventListener;
            this.dispatchEvent = function(evt) {
              var local = this["on" + evt.type];
              if (typeof local === "function")
                local(evt);
              delegate.dispatchEvent(evt);
            };
            this.removeEventListener = delegate.removeEventListener;
          }
          function _read(fr, blob2, kind) {
            if (!(blob2 instanceof Blob4)) {
              throw new TypeError("Failed to execute '" + kind + "' on 'FileReader': parameter 1 is not of type 'Blob'.");
            }
            fr.result = "";
            setTimeout(function() {
              this.readyState = FileReader2.LOADING;
              fr.dispatchEvent(new Event("load"));
              fr.dispatchEvent(new Event("loadend"));
            });
          }
          FileReader2.EMPTY = 0;
          FileReader2.LOADING = 1;
          FileReader2.DONE = 2;
          FileReader2.prototype.error = null;
          FileReader2.prototype.onabort = null;
          FileReader2.prototype.onerror = null;
          FileReader2.prototype.onload = null;
          FileReader2.prototype.onloadend = null;
          FileReader2.prototype.onloadstart = null;
          FileReader2.prototype.onprogress = null;
          FileReader2.prototype.readAsDataURL = function(blob2) {
            _read(this, blob2, "readAsDataURL");
            this.result = "data:" + blob2.type + ";base64," + array2base64(blob2._buffer);
          };
          FileReader2.prototype.readAsText = function(blob2) {
            _read(this, blob2, "readAsText");
            this.result = textDecode(blob2._buffer);
          };
          FileReader2.prototype.readAsArrayBuffer = function(blob2) {
            _read(this, blob2, "readAsText");
            this.result = (blob2._buffer.buffer || blob2._buffer).slice();
          };
          FileReader2.prototype.abort = function() {
          };
          URL2.createObjectURL = function(blob2) {
            return blob2 instanceof Blob4 ? "data:" + blob2.type + ";base64," + array2base64(blob2._buffer) : createObjectURL.call(URL2, blob2);
          };
          URL2.revokeObjectURL = function(url) {
            revokeObjectURL && revokeObjectURL.call(URL2, url);
          };
          var _send = global2.XMLHttpRequest && global2.XMLHttpRequest.prototype.send;
          if (_send) {
            XMLHttpRequest.prototype.send = function(data) {
              if (data instanceof Blob4) {
                this.setRequestHeader("Content-Type", data.type);
                _send.call(this, textDecode(data._buffer));
              } else {
                _send.call(this, data);
              }
            };
          }
          exports2.Blob = Blob4;
          exports2.File = File2;
          exports2.FileReader = FileReader2;
          exports2.URL = URL2;
        }
        function fixFileAndXHR() {
          var isIE = !!global2.ActiveXObject || "-ms-scroll-limit" in document.documentElement.style && "-ms-ime-align" in document.documentElement.style;
          var _send = global2.XMLHttpRequest && global2.XMLHttpRequest.prototype.send;
          if (isIE && _send) {
            XMLHttpRequest.prototype.send = function(data) {
              if (data instanceof Blob) {
                this.setRequestHeader("Content-Type", data.type);
                _send.call(this, data);
              } else {
                _send.call(this, data);
              }
            };
          }
          try {
            new File([], "");
            exports2.File = global2.File;
            exports2.FileReader = global2.FileReader;
          } catch (e) {
            try {
              exports2.File = new Function('class File extends Blob {constructor(chunks, name, opts) {opts = opts || {};super(chunks, opts || {});this.name = name.replace(/\\//g, ":");this.lastModifiedDate = opts.lastModified ? new Date(opts.lastModified) : new Date();this.lastModified = +this.lastModifiedDate;}};return new File([], ""), File')();
            } catch (e2) {
              exports2.File = function(b, d, c) {
                var blob2 = new Blob(b, c);
                var t = c && void 0 !== c.lastModified ? new Date(c.lastModified) : new Date();
                blob2.name = d.replace(/\//g, ":");
                blob2.lastModifiedDate = t;
                blob2.lastModified = +t;
                blob2.toString = function() {
                  return "[object File]";
                };
                if (strTag) {
                  blob2[strTag] = "File";
                }
                return blob2;
              };
            }
          }
        }
        if (blobSupported) {
          fixFileAndXHR();
          exports2.Blob = blobSupportsArrayBufferView ? global2.Blob : BlobConstructor;
        } else if (blobBuilderSupported) {
          fixFileAndXHR();
          exports2.Blob = BlobBuilderConstructor;
        } else {
          FakeBlobBuilder();
        }
        if (strTag) {
          if (!exports2.File.prototype[strTag])
            exports2.File.prototype[strTag] = "File";
          if (!exports2.Blob.prototype[strTag])
            exports2.Blob.prototype[strTag] = "Blob";
          if (!exports2.FileReader.prototype[strTag])
            exports2.FileReader.prototype[strTag] = "FileReader";
        }
        var blob = exports2.Blob.prototype;
        var stream;
        try {
          new ReadableStream({ type: "bytes" });
          stream = function stream2() {
            var position = 0;
            var blob2 = this;
            return new ReadableStream({
              type: "bytes",
              autoAllocateChunkSize: 524288,
              pull: function(controller) {
                var v = controller.byobRequest.view;
                var chunk = blob2.slice(position, position + v.byteLength);
                return chunk.arrayBuffer().then(function(buffer) {
                  var uint8array = new Uint8Array(buffer);
                  var bytesRead = uint8array.byteLength;
                  position += bytesRead;
                  v.set(uint8array);
                  controller.byobRequest.respond(bytesRead);
                  if (position >= blob2.size)
                    controller.close();
                });
              }
            });
          };
        } catch (e) {
          try {
            new ReadableStream({});
            stream = function stream2(blob2) {
              var position = 0;
              return new ReadableStream({
                pull: function(controller) {
                  var chunk = blob2.slice(position, position + 524288);
                  return chunk.arrayBuffer().then(function(buffer) {
                    position += buffer.byteLength;
                    var uint8array = new Uint8Array(buffer);
                    controller.enqueue(uint8array);
                    if (position == blob2.size)
                      controller.close();
                  });
                }
              });
            };
          } catch (e2) {
            try {
              new Response("").body.getReader().read();
              stream = function stream2() {
                return new Response(this).body;
              };
            } catch (e3) {
              stream = function stream2() {
                throw new Error("Include https://github.com/MattiasBuelens/web-streams-polyfill");
              };
            }
          }
        }
        function promisify(obj) {
          return new Promise(function(resolve3, reject) {
            obj.onload = obj.onerror = function(evt) {
              obj.onload = obj.onerror = null;
              evt.type === "load" ? resolve3(obj.result || obj) : reject(new Error("Failed to read the blob/file"));
            };
          });
        }
        if (!blob.arrayBuffer) {
          blob.arrayBuffer = function arrayBuffer() {
            var fr = new FileReader();
            fr.readAsArrayBuffer(this);
            return promisify(fr);
          };
        }
        if (!blob.text) {
          blob.text = function text() {
            var fr = new FileReader();
            fr.readAsText(this);
            return promisify(fr);
          };
        }
        if (!blob.stream) {
          blob.stream = stream;
        }
      });
    })(typeof self !== "undefined" && self || typeof window !== "undefined" && window || typeof global !== "undefined" && global || exports);
  }
});

// ../../node_modules/cross-blob/browser.js
var browser_exports = {};
__export(browser_exports, {
  default: () => browser_default
});
var import_blob_polyfill, browser_default;
var init_browser = __esm({
  "../../node_modules/cross-blob/browser.js"() {
    import_blob_polyfill = __toESM(require_Blob(), 1);
    browser_default = import_blob_polyfill.Blob;
  }
});

// node_modules/blob-polyfill/Blob.js
var require_Blob2 = __commonJS({
  "node_modules/blob-polyfill/Blob.js"(exports) {
    (function(global2) {
      (function(factory) {
        if (typeof define === "function" && define.amd) {
          define(["exports"], factory);
        } else if (typeof exports === "object" && typeof exports.nodeName !== "string") {
          factory(exports);
        } else {
          factory(global2);
        }
      })(function(exports2) {
        "use strict";
        var BlobBuilder = global2.BlobBuilder || global2.WebKitBlobBuilder || global2.MSBlobBuilder || global2.MozBlobBuilder;
        var URL2 = global2.URL || global2.webkitURL || function(href, a) {
          a = document.createElement("a");
          a.href = href;
          return a;
        };
        var origBlob = global2.Blob;
        var createObjectURL = URL2.createObjectURL;
        var revokeObjectURL = URL2.revokeObjectURL;
        var strTag = global2.Symbol && global2.Symbol.toStringTag;
        var blobSupported = false;
        var blobSupportsArrayBufferView = false;
        var blobBuilderSupported = BlobBuilder && BlobBuilder.prototype.append && BlobBuilder.prototype.getBlob;
        try {
          blobSupported = new Blob(["\xE4"]).size === 2;
          blobSupportsArrayBufferView = new Blob([new Uint8Array([1, 2])]).size === 2;
        } catch (e) {
        }
        function mapArrayBufferViews(ary) {
          return ary.map(function(chunk) {
            if (chunk.buffer instanceof ArrayBuffer) {
              var buf = chunk.buffer;
              if (chunk.byteLength !== buf.byteLength) {
                var copy = new Uint8Array(chunk.byteLength);
                copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
                buf = copy.buffer;
              }
              return buf;
            }
            return chunk;
          });
        }
        function BlobBuilderConstructor(ary, options) {
          options = options || {};
          var bb = new BlobBuilder();
          mapArrayBufferViews(ary).forEach(function(part) {
            bb.append(part);
          });
          return options.type ? bb.getBlob(options.type) : bb.getBlob();
        }
        function BlobConstructor(ary, options) {
          return new origBlob(mapArrayBufferViews(ary), options || {});
        }
        if (global2.Blob) {
          BlobBuilderConstructor.prototype = Blob.prototype;
          BlobConstructor.prototype = Blob.prototype;
        }
        function stringEncode(string) {
          var pos = 0;
          var len = string.length;
          var Arr = global2.Uint8Array || Array;
          var at = 0;
          var tlen = Math.max(32, len + (len >> 1) + 7);
          var target = new Arr(tlen >> 3 << 3);
          while (pos < len) {
            var value = string.charCodeAt(pos++);
            if (value >= 55296 && value <= 56319) {
              if (pos < len) {
                var extra = string.charCodeAt(pos);
                if ((extra & 64512) === 56320) {
                  ++pos;
                  value = ((value & 1023) << 10) + (extra & 1023) + 65536;
                }
              }
              if (value >= 55296 && value <= 56319) {
                continue;
              }
            }
            if (at + 4 > target.length) {
              tlen += 8;
              tlen *= 1 + pos / string.length * 2;
              tlen = tlen >> 3 << 3;
              var update = new Uint8Array(tlen);
              update.set(target);
              target = update;
            }
            if ((value & 4294967168) === 0) {
              target[at++] = value;
              continue;
            } else if ((value & 4294965248) === 0) {
              target[at++] = value >> 6 & 31 | 192;
            } else if ((value & 4294901760) === 0) {
              target[at++] = value >> 12 & 15 | 224;
              target[at++] = value >> 6 & 63 | 128;
            } else if ((value & 4292870144) === 0) {
              target[at++] = value >> 18 & 7 | 240;
              target[at++] = value >> 12 & 63 | 128;
              target[at++] = value >> 6 & 63 | 128;
            } else {
              continue;
            }
            target[at++] = value & 63 | 128;
          }
          return target.slice(0, at);
        }
        function stringDecode(buf) {
          var end = buf.length;
          var res = [];
          var i = 0;
          while (i < end) {
            var firstByte = buf[i];
            var codePoint = null;
            var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
            if (i + bytesPerSequence <= end) {
              var secondByte, thirdByte, fourthByte, tempCodePoint;
              switch (bytesPerSequence) {
                case 1:
                  if (firstByte < 128) {
                    codePoint = firstByte;
                  }
                  break;
                case 2:
                  secondByte = buf[i + 1];
                  if ((secondByte & 192) === 128) {
                    tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                    if (tempCodePoint > 127) {
                      codePoint = tempCodePoint;
                    }
                  }
                  break;
                case 3:
                  secondByte = buf[i + 1];
                  thirdByte = buf[i + 2];
                  if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                    tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                    if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                      codePoint = tempCodePoint;
                    }
                  }
                  break;
                case 4:
                  secondByte = buf[i + 1];
                  thirdByte = buf[i + 2];
                  fourthByte = buf[i + 3];
                  if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                    tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                    if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                      codePoint = tempCodePoint;
                    }
                  }
              }
            }
            if (codePoint === null) {
              codePoint = 65533;
              bytesPerSequence = 1;
            } else if (codePoint > 65535) {
              codePoint -= 65536;
              res.push(codePoint >>> 10 & 1023 | 55296);
              codePoint = 56320 | codePoint & 1023;
            }
            res.push(codePoint);
            i += bytesPerSequence;
          }
          var len = res.length;
          var str = "";
          var j = 0;
          while (j < len) {
            str += String.fromCharCode.apply(String, res.slice(j, j += 4096));
          }
          return str;
        }
        var textEncode = typeof TextEncoder === "function" ? TextEncoder.prototype.encode.bind(new TextEncoder()) : stringEncode;
        var textDecode = typeof TextDecoder === "function" ? TextDecoder.prototype.decode.bind(new TextDecoder()) : stringDecode;
        function FakeBlobBuilder() {
          function bufferClone(buf) {
            var view = new Array(buf.byteLength);
            var array = new Uint8Array(buf);
            var i = view.length;
            while (i--) {
              view[i] = array[i];
            }
            return view;
          }
          function array2base64(input) {
            var byteToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var output = [];
            for (var i = 0; i < input.length; i += 3) {
              var byte1 = input[i];
              var haveByte2 = i + 1 < input.length;
              var byte2 = haveByte2 ? input[i + 1] : 0;
              var haveByte3 = i + 2 < input.length;
              var byte3 = haveByte3 ? input[i + 2] : 0;
              var outByte1 = byte1 >> 2;
              var outByte2 = (byte1 & 3) << 4 | byte2 >> 4;
              var outByte3 = (byte2 & 15) << 2 | byte3 >> 6;
              var outByte4 = byte3 & 63;
              if (!haveByte3) {
                outByte4 = 64;
                if (!haveByte2) {
                  outByte3 = 64;
                }
              }
              output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
            }
            return output.join("");
          }
          var create = Object.create || function(a) {
            function c() {
            }
            c.prototype = a;
            return new c();
          };
          function getObjectTypeName(o) {
            return Object.prototype.toString.call(o).slice(8, -1);
          }
          function isPrototypeOf(c, o) {
            return typeof c === "object" && Object.prototype.isPrototypeOf.call(c.prototype, o);
          }
          function isDataView(o) {
            return getObjectTypeName(o) === "DataView" || isPrototypeOf(global2.DataView, o);
          }
          var arrayBufferClassNames = [
            "Int8Array",
            "Uint8Array",
            "Uint8ClampedArray",
            "Int16Array",
            "Uint16Array",
            "Int32Array",
            "Uint32Array",
            "Float32Array",
            "Float64Array",
            "ArrayBuffer"
          ];
          function includes(a, v) {
            return a.indexOf(v) !== -1;
          }
          function isArrayBuffer(o) {
            return includes(arrayBufferClassNames, getObjectTypeName(o)) || isPrototypeOf(global2.ArrayBuffer, o);
          }
          function concatTypedarrays(chunks) {
            var size = 0;
            var j = chunks.length;
            while (j--) {
              size += chunks[j].length;
            }
            var b = new Uint8Array(size);
            var offset = 0;
            for (var i = 0; i < chunks.length; i++) {
              var chunk = chunks[i];
              b.set(chunk, offset);
              offset += chunk.byteLength || chunk.length;
            }
            return b;
          }
          function Blob4(chunks, opts) {
            chunks = chunks || [];
            opts = opts == null ? {} : opts;
            for (var i = 0, len = chunks.length; i < len; i++) {
              var chunk = chunks[i];
              if (chunk instanceof Blob4) {
                chunks[i] = chunk._buffer;
              } else if (typeof chunk === "string") {
                chunks[i] = textEncode(chunk);
              } else if (isDataView(chunk)) {
                chunks[i] = bufferClone(chunk.buffer);
              } else if (isArrayBuffer(chunk)) {
                chunks[i] = bufferClone(chunk);
              } else {
                chunks[i] = textEncode(String(chunk));
              }
            }
            this._buffer = global2.Uint8Array ? concatTypedarrays(chunks) : [].concat.apply([], chunks);
            this.size = this._buffer.length;
            this.type = opts.type || "";
            if (/[^\u0020-\u007E]/.test(this.type)) {
              this.type = "";
            } else {
              this.type = this.type.toLowerCase();
            }
          }
          Blob4.prototype.arrayBuffer = function() {
            return Promise.resolve(this._buffer.buffer || this._buffer);
          };
          Blob4.prototype.text = function() {
            return Promise.resolve(textDecode(this._buffer));
          };
          Blob4.prototype.slice = function(start, end, type) {
            var slice = this._buffer.slice(start || 0, end || this._buffer.length);
            return new Blob4([slice], { type });
          };
          Blob4.prototype.toString = function() {
            return "[object Blob]";
          };
          function File2(chunks, name2, opts) {
            opts = opts || {};
            var a = Blob4.call(this, chunks, opts) || this;
            a.name = name2.replace(/\//g, ":");
            a.lastModifiedDate = opts.lastModified ? new Date(opts.lastModified) : new Date();
            a.lastModified = +a.lastModifiedDate;
            return a;
          }
          File2.prototype = create(Blob4.prototype);
          File2.prototype.constructor = File2;
          if (Object.setPrototypeOf) {
            Object.setPrototypeOf(File2, Blob4);
          } else {
            try {
              File2.__proto__ = Blob4;
            } catch (e) {
            }
          }
          File2.prototype.toString = function() {
            return "[object File]";
          };
          function FileReader2() {
            if (!(this instanceof FileReader2)) {
              throw new TypeError("Failed to construct 'FileReader': Please use the 'new' operator, this DOM object constructor cannot be called as a function.");
            }
            var delegate = document.createDocumentFragment();
            this.addEventListener = delegate.addEventListener;
            this.dispatchEvent = function(evt) {
              var local = this["on" + evt.type];
              if (typeof local === "function")
                local(evt);
              delegate.dispatchEvent(evt);
            };
            this.removeEventListener = delegate.removeEventListener;
          }
          function _read(fr, blob2, kind) {
            if (!(blob2 instanceof Blob4)) {
              throw new TypeError("Failed to execute '" + kind + "' on 'FileReader': parameter 1 is not of type 'Blob'.");
            }
            fr.result = "";
            setTimeout(function() {
              this.readyState = FileReader2.LOADING;
              fr.dispatchEvent(new Event("load"));
              fr.dispatchEvent(new Event("loadend"));
            });
          }
          FileReader2.EMPTY = 0;
          FileReader2.LOADING = 1;
          FileReader2.DONE = 2;
          FileReader2.prototype.error = null;
          FileReader2.prototype.onabort = null;
          FileReader2.prototype.onerror = null;
          FileReader2.prototype.onload = null;
          FileReader2.prototype.onloadend = null;
          FileReader2.prototype.onloadstart = null;
          FileReader2.prototype.onprogress = null;
          FileReader2.prototype.readAsDataURL = function(blob2) {
            _read(this, blob2, "readAsDataURL");
            this.result = "data:" + blob2.type + ";base64," + array2base64(blob2._buffer);
          };
          FileReader2.prototype.readAsText = function(blob2) {
            _read(this, blob2, "readAsText");
            this.result = textDecode(blob2._buffer);
          };
          FileReader2.prototype.readAsArrayBuffer = function(blob2) {
            _read(this, blob2, "readAsText");
            this.result = (blob2._buffer.buffer || blob2._buffer).slice();
          };
          FileReader2.prototype.abort = function() {
          };
          URL2.createObjectURL = function(blob2) {
            return blob2 instanceof Blob4 ? "data:" + blob2.type + ";base64," + array2base64(blob2._buffer) : createObjectURL.call(URL2, blob2);
          };
          URL2.revokeObjectURL = function(url) {
            revokeObjectURL && revokeObjectURL.call(URL2, url);
          };
          var _send = global2.XMLHttpRequest && global2.XMLHttpRequest.prototype.send;
          if (_send) {
            XMLHttpRequest.prototype.send = function(data) {
              if (data instanceof Blob4) {
                this.setRequestHeader("Content-Type", data.type);
                _send.call(this, textDecode(data._buffer));
              } else {
                _send.call(this, data);
              }
            };
          }
          exports2.Blob = Blob4;
          exports2.File = File2;
          exports2.FileReader = FileReader2;
          exports2.URL = URL2;
        }
        function fixFileAndXHR() {
          var isIE = !!global2.ActiveXObject || "-ms-scroll-limit" in document.documentElement.style && "-ms-ime-align" in document.documentElement.style;
          var _send = global2.XMLHttpRequest && global2.XMLHttpRequest.prototype.send;
          if (isIE && _send) {
            XMLHttpRequest.prototype.send = function(data) {
              if (data instanceof Blob) {
                this.setRequestHeader("Content-Type", data.type);
                _send.call(this, data);
              } else {
                _send.call(this, data);
              }
            };
          }
          try {
            new File([], "");
            exports2.File = global2.File;
            exports2.FileReader = global2.FileReader;
          } catch (e) {
            try {
              exports2.File = new Function('class File extends Blob {constructor(chunks, name, opts) {opts = opts || {};super(chunks, opts || {});this.name = name.replace(/\\//g, ":");this.lastModifiedDate = opts.lastModified ? new Date(opts.lastModified) : new Date();this.lastModified = +this.lastModifiedDate;}};return new File([], ""), File')();
            } catch (e2) {
              exports2.File = function(b, d, c) {
                var blob2 = new Blob(b, c);
                var t = c && void 0 !== c.lastModified ? new Date(c.lastModified) : new Date();
                blob2.name = d.replace(/\//g, ":");
                blob2.lastModifiedDate = t;
                blob2.lastModified = +t;
                blob2.toString = function() {
                  return "[object File]";
                };
                if (strTag) {
                  blob2[strTag] = "File";
                }
                return blob2;
              };
            }
          }
        }
        if (blobSupported) {
          fixFileAndXHR();
          exports2.Blob = blobSupportsArrayBufferView ? global2.Blob : BlobConstructor;
        } else if (blobBuilderSupported) {
          fixFileAndXHR();
          exports2.Blob = BlobBuilderConstructor;
        } else {
          FakeBlobBuilder();
        }
        if (strTag) {
          if (!exports2.File.prototype[strTag])
            exports2.File.prototype[strTag] = "File";
          if (!exports2.Blob.prototype[strTag])
            exports2.Blob.prototype[strTag] = "Blob";
          if (!exports2.FileReader.prototype[strTag])
            exports2.FileReader.prototype[strTag] = "FileReader";
        }
        var blob = exports2.Blob.prototype;
        var stream;
        try {
          new ReadableStream({ type: "bytes" });
          stream = function stream2() {
            var position = 0;
            var blob2 = this;
            return new ReadableStream({
              type: "bytes",
              autoAllocateChunkSize: 524288,
              pull: function(controller) {
                var v = controller.byobRequest.view;
                var chunk = blob2.slice(position, position + v.byteLength);
                return chunk.arrayBuffer().then(function(buffer) {
                  var uint8array = new Uint8Array(buffer);
                  var bytesRead = uint8array.byteLength;
                  position += bytesRead;
                  v.set(uint8array);
                  controller.byobRequest.respond(bytesRead);
                  if (position >= blob2.size)
                    controller.close();
                });
              }
            });
          };
        } catch (e) {
          try {
            new ReadableStream({});
            stream = function stream2(blob2) {
              var position = 0;
              return new ReadableStream({
                pull: function(controller) {
                  var chunk = blob2.slice(position, position + 524288);
                  return chunk.arrayBuffer().then(function(buffer) {
                    position += buffer.byteLength;
                    var uint8array = new Uint8Array(buffer);
                    controller.enqueue(uint8array);
                    if (position == blob2.size)
                      controller.close();
                  });
                }
              });
            };
          } catch (e2) {
            try {
              new Response("").body.getReader().read();
              stream = function stream2() {
                return new Response(this).body;
              };
            } catch (e3) {
              stream = function stream2() {
                throw new Error("Include https://github.com/MattiasBuelens/web-streams-polyfill");
              };
            }
          }
        }
        function promisify(obj) {
          return new Promise(function(resolve3, reject) {
            obj.onload = obj.onerror = function(evt) {
              obj.onload = obj.onerror = null;
              evt.type === "load" ? resolve3(obj.result || obj) : reject(new Error("Failed to read the blob/file"));
            };
          });
        }
        if (!blob.arrayBuffer) {
          blob.arrayBuffer = function arrayBuffer() {
            var fr = new FileReader();
            fr.readAsArrayBuffer(this);
            return promisify(fr);
          };
        }
        if (!blob.text) {
          blob.text = function text() {
            var fr = new FileReader();
            fr.readAsText(this);
            return promisify(fr);
          };
        }
        if (!blob.stream) {
          blob.stream = stream;
        }
      });
    })(typeof self !== "undefined" && self || typeof window !== "undefined" && window || typeof global !== "undefined" && global || exports);
  }
});

// node_modules/cross-blob/browser.js
var browser_exports2 = {};
__export(browser_exports2, {
  default: () => browser_default2
});
var import_blob_polyfill2, browser_default2;
var init_browser2 = __esm({
  "node_modules/cross-blob/browser.js"() {
    import_blob_polyfill2 = __toESM(require_Blob2(), 1);
    browser_default2 = import_blob_polyfill2.Blob;
  }
});

// ../common/utils/languages.ts
var languages_exports = {};
__export(languages_exports, {
  js: () => js,
  json: () => json
});
var js = ["js", "mjs", "cjs", "javascript"];
var json = ["json"];

// ../common/utils/path.ts
var fullSuffix = (fileName = "") => fileName.split(".").slice(1);
var suffix = (fileName = "") => {
  const suffix2 = fullSuffix(fileName);
  return suffix2.join(".");
};

// ../../node_modules/remote-esm/utils/path.js
var urlSep = "://";
var get = (path, rel = "", keepRelativeImports = false) => {
  let prefix = "";
  const getPrefix = (str) => {
    prefix = str.includes(urlSep) ? str.split(urlSep).splice(0, 1) : void 0;
    if (prefix)
      return str.replace(`${prefix}${urlSep}`, "");
    else
      return str;
  };
  if (path.includes(urlSep))
    path = getPrefix(path);
  if (rel.includes(urlSep))
    rel = getPrefix(rel);
  if (!keepRelativeImports)
    rel = rel.split("/").filter((v) => v != "..").join("/");
  if (rel[rel.length - 1] === "/")
    rel = rel.slice(0, -1);
  let dirTokens = rel.split("/");
  if (dirTokens.length === 1 && dirTokens[0] === "")
    dirTokens = [];
  const potentialFile = dirTokens.pop();
  if (potentialFile) {
    const splitPath2 = potentialFile.split(".");
    if (splitPath2.length == 1 || splitPath2.length > 1 && splitPath2.includes(""))
      dirTokens.push(potentialFile);
  }
  const splitPath = path.split("/");
  const pathTokens = splitPath.filter((str, i) => !!str);
  const extensionTokens = pathTokens.filter((str, i) => {
    if (str === "..") {
      dirTokens.pop();
      return false;
    } else if (str === ".")
      return false;
    else
      return true;
  });
  const newPath = [...dirTokens, ...extensionTokens].join("/");
  if (prefix)
    return prefix + "://" + newPath;
  else
    return newPath;
};

// ../../node_modules/remote-esm/utils/request.js
var getURL = (path) => {
  let url;
  try {
    url = new URL(path).href;
  } catch {
    url = get(path, globalThis.location.href);
  }
  return url;
};
var handleFetch = async (path, options = {}, progressCallback) => {
  if (!options.mode)
    options.mode = "cors";
  const url = getURL(path);
  const response = await fetchRemote(url, options, progressCallback);
  if (!response)
    throw new Error("No response received.");
  const type = response.type.split(";")[0];
  return {
    url,
    type,
    buffer: response.buffer
  };
};
var fetchRemote = async (url, options = {}, progressCallback) => {
  const response = await globalThis.fetch(url, options);
  return new Promise(async (resolve3) => {
    if (response) {
      const type = response.headers.get("Content-Type");
      if (globalThis.REMOTEESM_NODE) {
        const buffer = await response.arrayBuffer();
        resolve3({ buffer, type });
      } else {
        const reader = response.body.getReader();
        const bytes = parseInt(response.headers.get("Content-Length"), 10);
        let bytesReceived = 0;
        let buffer = [];
        const processBuffer = async ({ done, value }) => {
          if (done) {
            const config = {};
            if (typeof type === "string")
              config.type = type;
            const blob = new Blob(buffer, config);
            const ab = await blob.arrayBuffer();
            resolve3({ buffer: new Uint8Array(ab), type });
            return;
          }
          bytesReceived += value.length;
          const chunk = value;
          buffer.push(chunk);
          if (progressCallback instanceof Function)
            progressCallback(response.headers.get("Range"), bytesReceived / bytes, bytes);
          return reader.read().then(processBuffer);
        };
        reader.read().then(processBuffer);
      }
    } else {
      console.warn("Response not received!", options.headers);
      resolve3(void 0);
    }
  });
};

// ../../node_modules/remote-esm/index.js
var datauri = {};
var ready = new Promise(async (resolve3, reject) => {
  try {
    if (typeof process === "object") {
      globalThis.fetch = (await import("node-fetch")).default;
      if (typeof globalThis.fetch !== "function")
        globalThis.fetch = fetch;
      const Blob4 = (await Promise.resolve().then(() => (init_browser(), browser_exports))).default;
      globalThis.Blob = Blob4;
      if (typeof globalThis.Blob !== "function")
        globalThis.Blob = Blob4;
      resolve3(true);
    } else
      resolve3(true);
  } catch (err) {
    console.log(err);
    reject(err);
  }
});
var re = /import([ \n\t]*(?:(?:\* (?:as .+))|(?:[^ \n\t\{\}]+[ \n\t]*,?)|(?:[ \n\t]*\{(?:[ \n\t]*[^ \n\t"'\{\}]+[ \n\t]*,?)+\}))[ \n\t]*)from[ \n\t]*(['"])([^'"\n]+)(?:['"])([ \n\t]*assert[ \n\t]*{type:[ \n\t]*(['"])([^'"\n]+)(?:['"])})?/g;
var moduleDataURI = (text, mimeType = "text/javascript") => `data:${mimeType};base64,` + btoa(text);
var importFromText = async (text, path, collection = {}) => {
  const extension = path.split(".").slice(-1)[0];
  const isJSON = extension === "json";
  let mimeType = isJSON ? "application/json" : "application/javascript";
  const uri = moduleDataURI(text, mimeType);
  let imported = await (isJSON ? import(uri, { assert: { type: "json" } }) : import(uri)).catch((e) => {
    if (e.message.includes("Unexpected token"))
      throw new Error("Failed to fetch");
    else
      throw e;
  });
  const ref = {};
  for (let key in imported) {
    Object.defineProperty(ref, key, {
      get: () => imported[key],
      enumerable: true
    });
  }
  collection[path] = uri;
  return imported;
};
var resolve = get;
var getText = async (uri) => await globalThis.fetch(uri).then((res) => res.text());
var safeImport = async (uri, opts = {}) => {
  const {
    root,
    onImport = () => {
    },
    outputText,
    forceImportFromText
  } = opts;
  const uriCollection = opts.datauri || datauri;
  await ready;
  if (opts.dependencies)
    opts.dependencies[uri] = {};
  const extension = uri.split(".").slice(-1)[0];
  const isJSON = extension === "json";
  let module = !forceImportFromText ? await (isJSON ? import(uri, { assert: { type: "json" } }) : import(uri)).catch(() => {
  }) : void 0;
  let text, originalText;
  if (!module) {
    text = originalText = await getText(uri);
    try {
      module = await importFromText(text, uri, uriCollection);
    } catch (e) {
      const base = get("", uri);
      let childBase = base;
      const importInfo = [];
      let m;
      do {
        m = re.exec(text);
        if (m == null)
          m = re.exec(text);
        if (m) {
          text = text.replace(m[0], ``);
          const wildcard = !!m[1].match(/\*\s+as/);
          const variables = m[1].replace(/\*\s+as/, "").trim();
          importInfo.push({
            path: m[3],
            variables,
            wildcard
          });
        }
      } while (m);
      for (let i in importInfo) {
        const { variables, wildcard, path } = importInfo[i];
        let correctPath = get(path, childBase);
        const dependentFilePath = get(correctPath);
        const dependentFileWithoutRoot = get(dependentFilePath.replace(root ?? "", ""));
        if (opts.dependencies)
          opts.dependencies[uri][dependentFileWithoutRoot] = importInfo[i];
        let ref = uriCollection[dependentFilePath];
        if (!ref) {
          const extension2 = correctPath.split(".").slice(-1)[0];
          const info = await handleFetch(correctPath);
          let blob = new Blob([info.buffer], { type: info.type });
          const isJS = extension2.includes("js");
          const newURI = dependentFileWithoutRoot;
          const newText = await blob.text();
          let importedText = isJS ? await new Promise(async (resolve3) => {
            await safeImport(newURI, {
              root: uri,
              onImport: (path2, info2) => {
                onImport(path2, info2);
                if (path2 == newURI)
                  resolve3(info2.text);
              },
              outputText: true,
              forceImportFromText
            });
          }) : newText;
          await importFromText(importedText, correctPath, uriCollection);
        }
        text = `import ${wildcard ? "* as " : ""}${variables} from "${uriCollection[correctPath]}";
${text}`;
      }
      module = await importFromText(text, uri, uriCollection);
    }
  }
  let txt = outputText ? text ?? await getText(uri) : void 0;
  onImport(uri, {
    text: txt,
    file: outputText ? originalText ?? txt : void 0,
    module
  });
  return module;
};
var remote_esm_default = safeImport;

// ../common/get.ts
var cache = {};
var get2 = async (relPath, relativeTo = "", onImport) => {
  let type = suffix(relPath);
  const isJSON = !type || type.includes("json");
  const fullPath = resolve(relPath, relativeTo);
  const isFunc = typeof onImport === "function";
  const imported = cache[fullPath]?.imported ?? [];
  if (!cache[fullPath]) {
    const imported2 = [];
    cache[fullPath] = remote_esm_default(fullPath, {
      onImport: (...args) => {
        if (isFunc) {
          imported2.push(args);
          onImport(...args);
        }
      },
      outputText: true
    }).catch((e) => {
      if (e.message.includes("Failed to fetch"))
        throw new Error("404");
      else
        throw e;
    });
    cache[fullPath].imported = imported2;
    const res = await cache[fullPath];
    if (isJSON)
      cache[fullPath] = res?.default ?? {};
    else
      cache[fullPath] = res;
  } else if (isFunc)
    imported.forEach((args) => onImport(...args));
  return isJSON ? JSON.parse(JSON.stringify(cache[fullPath])) : cache[fullPath];
};
var get_default = get2;

// ../common/utils/check.ts
var valid = (input, options, location) => {
  const errors = [];
  const isUndefined = options?.relativeTo === void 0;
  const isString = typeof input === "string";
  const isObject = typeof input === "object";
  let error;
  if (isString) {
    const hasRelTo = !isUndefined && "relativeTo" in options;
    if (!hasRelTo && !options._remote) {
      if (import.meta.url) {
        error = { message: "Not a valid relativeTo key (required) in options", file: input };
        console.warn(`[wasl-${location}] Import Mode Error: Please pass a valid string to options.relativeTo (ideally import.meta.url).`);
      } else {
        error = { message: "import.meta.url is not supported", file: input };
        console.warn(`[wasl-${location}] Import Mode Error: import.meta.url is not available. Does your bundler support it?`);
      }
    }
  } else if (!isObject) {
    error = { message: "Not a valid object passed in the first argument", file: null };
    console.warn(`[wasl-${location}] Reference Mode Error: Please pass a valid object in the first argument and pass file object references via the options.filesystem field.`);
  }
  if (error) {
    error.function = location;
    errors.push(error);
  }
  return errors;
};

// utils.ts
var isSrc = (str) => {
  return typeof str === "string" && Object.values(languages_exports).find((arr) => arr.includes(str.split(".").slice(-1)[0]));
};
var merge = (main, override, deleteSrc = false) => {
  const copy = Object.assign({}, main);
  if (override) {
    if (deleteSrc) {
      const ogSrc = override.src ?? override;
      delete override.src;
      if ("default" in ogSrc)
        return ogSrc.default;
    }
    const keys = Object.keys(copy);
    const newKeys = new Set(Object.keys(override));
    keys.forEach((k) => {
      newKeys.delete(k);
      if (typeof override[k] === "object" && !Array.isArray(override[k]))
        copy[k] = merge(copy[k], override[k]);
      else if (k in override)
        copy[k] = override[k];
    });
    newKeys.forEach((k) => {
      copy[k] = override[k];
    });
  }
  return copy;
};
var checkFiles = (key, filesystem) => {
  const isJSON = suffix(key).slice(-4) === "json" ? true : false;
  const output = isJSON && filesystem[key] ? JSON.parse(JSON.stringify(filesystem[key])) : filesystem[key];
  return output;
};
var remove = (original, search, key = original, o) => {
  console.error(`Source was not ${original ? `resolved for ${original}` : `specified for ${key}`}. ${search ? `If available, refer to this object directly as options.filesystem["${search}"]. ` : ""}${o ? `Automatically removing ${key} from the WASL file.` : ""}`);
  if (o)
    delete o[key];
};

// node_modules/remote-esm/utils/path.js
var urlSep2 = "://";
var get3 = (path, rel = "", keepRelativeImports = false) => {
  let prefix = "";
  const getPrefix = (str) => {
    prefix = str.includes(urlSep2) ? str.split(urlSep2).splice(0, 1) : void 0;
    if (prefix)
      return str.replace(`${prefix}${urlSep2}`, "");
    else
      return str;
  };
  if (path.includes(urlSep2))
    path = getPrefix(path);
  if (rel.includes(urlSep2))
    rel = getPrefix(rel);
  if (!keepRelativeImports)
    rel = rel.split("/").filter((v) => v != "..").join("/");
  if (rel[rel.length - 1] === "/")
    rel = rel.slice(0, -1);
  let dirTokens = rel.split("/");
  if (dirTokens.length === 1 && dirTokens[0] === "")
    dirTokens = [];
  const potentialFile = dirTokens.pop();
  if (potentialFile) {
    const splitPath2 = potentialFile.split(".");
    if (splitPath2.length == 1 || splitPath2.length > 1 && splitPath2.includes(""))
      dirTokens.push(potentialFile);
  }
  const splitPath = path.split("/");
  const pathTokens = splitPath.filter((str, i) => !!str);
  const extensionTokens = pathTokens.filter((str, i) => {
    if (str === "..") {
      dirTokens.pop();
      return false;
    } else if (str === ".")
      return false;
    else
      return true;
  });
  const newPath = [...dirTokens, ...extensionTokens].join("/");
  if (prefix)
    return prefix + "://" + newPath;
  else
    return newPath;
};

// node_modules/remote-esm/index.js
var ready2 = new Promise(async (resolve3, reject) => {
  try {
    if (typeof process === "object") {
      globalThis.fetch = (await import("node-fetch")).default;
      if (typeof globalThis.fetch !== "function")
        globalThis.fetch = fetch;
      const Blob4 = (await Promise.resolve().then(() => (init_browser2(), browser_exports2))).default;
      globalThis.Blob = Blob4;
      if (typeof globalThis.Blob !== "function")
        globalThis.Blob = Blob4;
      resolve3(true);
    } else
      resolve3(true);
  } catch (err) {
    console.log(err);
    reject(err);
  }
});
var moduleDataURI2 = (text, mimeType = "text/javascript") => `data:${mimeType};base64,` + btoa(text);
var importFromText2 = async (text, path, collection = {}) => {
  const extension = path.split(".").slice(-1)[0];
  const isJSON = extension === "json";
  let mimeType = isJSON ? "application/json" : "application/javascript";
  const uri = moduleDataURI2(text, mimeType);
  let imported = await (isJSON ? import(uri, { assert: { type: "json" } }) : import(uri)).catch((e) => {
    if (e.message.includes("Unexpected token"))
      throw new Error("Failed to fetch");
    else
      throw e;
  });
  const ref = {};
  for (let key in imported) {
    Object.defineProperty(ref, key, {
      get: () => imported[key],
      enumerable: true
    });
  }
  collection[path] = uri;
  return imported;
};
var resolve2 = get3;

// node_modules/es-plugins/dist/index.esm.js
function parseFunctionFromText(method = "") {
  let getFunctionBody = (methodString) => {
    return methodString.replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i, "$2$3$4");
  };
  let getFunctionHead = (methodString) => {
    let startindex = methodString.indexOf("=>") + 1;
    if (startindex <= 0) {
      startindex = methodString.indexOf("){");
    }
    if (startindex <= 0) {
      startindex = methodString.indexOf(") {");
    }
    return methodString.slice(0, methodString.indexOf("{", startindex) + 1);
  };
  let newFuncHead = getFunctionHead(method);
  let newFuncBody = getFunctionBody(method);
  let newFunc;
  if (newFuncHead.includes("function")) {
    let varName = newFuncHead.split("(")[1].split(")")[0];
    newFunc = new Function(varName, newFuncBody);
  } else {
    if (newFuncHead.substring(0, 6) === newFuncBody.substring(0, 6)) {
      let varName = newFuncHead.split("(")[1].split(")")[0];
      newFunc = new Function(varName, newFuncBody.substring(newFuncBody.indexOf("{") + 1, newFuncBody.length - 1));
    } else {
      try {
        newFunc = (0, eval)(newFuncHead + newFuncBody + "}");
      } catch {
      }
    }
  }
  return newFunc;
}
var EventHandler = class {
  constructor() {
    this.pushToState = {};
    this.data = {};
    this.triggers = {};
    this.setState = (updateObj) => {
      Object.assign(this.data, updateObj);
      for (const prop of Object.getOwnPropertyNames(updateObj)) {
        if (this.triggers[prop])
          this.triggers[prop].forEach((obj) => obj.onchange(this.data[prop]));
      }
      return this.data;
    };
    this.subscribeTrigger = (key, onchange) => {
      if (key) {
        if (!this.triggers[key]) {
          this.triggers[key] = [];
        }
        let l = this.triggers[key].length;
        this.triggers[key].push({ idx: l, onchange });
        return this.triggers[key].length - 1;
      } else
        return void 0;
    };
    this.unsubscribeTrigger = (key, sub) => {
      let triggers = this.triggers[key];
      if (triggers) {
        if (!sub)
          delete this.triggers[key];
        else {
          let idx = void 0;
          let obj = triggers.find((o, i) => {
            if (o.idx === sub) {
              idx = i;
              return true;
            }
          });
          if (obj)
            triggers.splice(idx, 1);
          return true;
        }
      }
    };
    this.subscribeTriggerOnce = (key, onchange) => {
      let sub;
      let changed = (value) => {
        onchange(value);
        this.unsubscribeTrigger(key, sub);
      };
      sub = this.subscribeTrigger(key, changed);
    };
  }
};
var state = new EventHandler();
function addLocalState(props) {
  if (!this._state)
    this._state = {};
  for (let k in props) {
    if (k === "_state" || k === "graph")
      continue;
    else {
      this._state[k] = props[k];
      if (k in this)
        this[k] = props[k];
      else
        Object.defineProperty(this, k, {
          get: () => {
            this._state[k];
          },
          set: (v) => {
            this._state[k] = v;
            if (this.state.triggers[this._unique])
              this.setState({ [this._unique]: this._state });
          },
          enumerable: true,
          configurable: true
        });
    }
  }
}
var GraphNode = class {
  constructor(properties = {}, parent, graph) {
    this.nodes = /* @__PURE__ */ new Map();
    this._initial = {};
    this._unique = `${Math.random()}`;
    this.state = state;
    this.isLooping = false;
    this.isAnimating = false;
    this.looper = void 0;
    this.animation = void 0;
    this.forward = true;
    this.backward = false;
    this.reactive = false;
    this.runSync = false;
    this.firstRun = true;
    this.DEBUGNODE = false;
    this.addLocalState = addLocalState;
    this.operator = (...args) => {
      return args;
    };
    this.runOp = (...args) => {
      if (this.DEBUGNODE)
        console.time(this.tag);
      let result = this.operator(...args);
      if (result instanceof Promise) {
        result.then((res) => {
          if (res !== void 0)
            this.setState({ [this.tag]: res });
          if (this.DEBUGNODE) {
            console.timeEnd(this.tag);
            if (result !== void 0)
              console.log(`${this.tag} result:`, result);
          }
          ;
          return res;
        });
      } else {
        if (result !== void 0)
          this.setState({ [this.tag]: result });
        if (this.DEBUGNODE) {
          console.timeEnd(this.tag);
          if (result !== void 0)
            console.log(`${this.tag} result:`, result);
        }
        ;
      }
      return result;
    };
    this.setOperator = (operator) => {
      if (typeof operator !== "function")
        return operator;
      this.operator = operator.bind(this);
      return operator;
    };
    this.runAsync = (...args) => {
      return new Promise((res, rej) => {
        res(this.run(...args));
      });
    };
    this.transformArgs = (args = []) => args;
    this.isRunSync = () => {
      return !(this.children && this.forward || this.parent && this.backward || this.repeat || this.delay || this.frame || this.recursive || this.branch);
    };
    this.run = (...args) => {
      if (typeof this.transformArgs === "function")
        args = this.transformArgs(args, this);
      if (this.firstRun) {
        this.firstRun = false;
        this.runSync = this.isRunSync();
        if (this.animate && !this.isAnimating) {
          this.runAnimation(this.animation, args);
        }
        if (this.loop && typeof this.loop === "number" && !this.isLooping) {
          this.runLoop(this.looper, args);
        }
        if (this.loop || this.animate)
          return;
      }
      if (this.runSync) {
        let res = this.runOp(...args);
        return res;
      }
      return new Promise(async (resolve3) => {
        if (this) {
          let run = (node, tick = 0, ...input) => {
            return new Promise(async (r) => {
              tick++;
              let res = await node.runOp(...input);
              if (node.repeat) {
                while (tick < node.repeat) {
                  if (node.delay) {
                    setTimeout(async () => {
                      r(await run(node, tick, ...input));
                    }, node.delay);
                    break;
                  } else if (node.frame && window?.requestAnimationFrame) {
                    requestAnimationFrame(async () => {
                      r(await run(node, tick, ...input));
                    });
                    break;
                  } else
                    res = await node.runOp(...input);
                  tick++;
                }
                if (tick === node.repeat) {
                  r(res);
                  return;
                }
              } else if (node.recursive) {
                while (tick < node.recursive) {
                  if (node.delay) {
                    setTimeout(async () => {
                      r(await run(node, tick, ...res));
                    }, node.delay);
                    break;
                  } else if (node.frame && window?.requestAnimationFrame) {
                    requestAnimationFrame(async () => {
                      r(await run(node, tick, ...res));
                    });
                    break;
                  } else
                    res = await node.runOp(...res);
                  tick++;
                }
                if (tick === node.recursive) {
                  r(res);
                  return;
                }
              } else {
                r(res);
                return;
              }
            });
          };
          let runnode = async () => {
            let res = await run(this, void 0, ...args);
            if (res !== void 0) {
              if (this.backward && this.parent instanceof GraphNode) {
                if (Array.isArray(res))
                  await this.runParent(this, ...res);
                else
                  await this.runParent(this, res);
              }
              if (this.children && this.forward) {
                if (Array.isArray(res))
                  await this.runChildren(this, ...res);
                else
                  await this.runChildren(this, res);
              }
              if (this.branch) {
                this.runBranch(this, res);
              }
            }
            return res;
          };
          if (this.delay) {
            setTimeout(async () => {
              resolve3(await runnode());
            }, this.delay);
          } else if (this.frame && window?.requestAnimationFrame) {
            requestAnimationFrame(async () => {
              resolve3(await runnode());
            });
          } else {
            resolve3(await runnode());
          }
        } else
          resolve3(void 0);
      });
    };
    this.runParent = async (n, ...args) => {
      if (n.backward && n.parent) {
        if (typeof n.parent === "string") {
          if (n.graph && n.graph?.get(n.parent)) {
            n.parent = n.graph;
            if (n.parent)
              this.nodes.set(n.parent.tag, n.parent);
          } else
            n.parent = this.nodes.get(n.parent);
        }
        if (n.parent instanceof GraphNode)
          await n.parent.run(...args);
      }
    };
    this.runChildren = async (n, ...args) => {
      if (typeof n.children === "object") {
        for (const key in n.children) {
          if (typeof n.children[key] === "string") {
            if (n.graph && n.graph?.get(n.children[key])) {
              n.children[key] = n.graph.get(n.children[key]);
              if (!n.nodes.get(n.children[key].tag))
                n.nodes.set(n.children[key].tag, n.children[key]);
            }
            if (!n.children[key] && n.nodes.get(n.children[key]))
              n.children[key] = n.nodes.get(n.children[key]);
          } else if (typeof n.children[key] === "undefined" || n.children[key] === true) {
            if (n.graph && n.graph?.get(key)) {
              n.children[key] = n.graph.get(key);
              if (!n.nodes.get(n.children[key].tag))
                n.nodes.set(n.children[key].tag, n.children[key]);
            }
            if (!n.children[key] && n.nodes.get(key))
              n.children[key] = n.nodes.get(key);
          }
          if (n.children[key]?.runOp)
            await n.children[key].run(...args);
        }
      }
    };
    this.runBranch = async (n, output) => {
      if (n.branch) {
        let keys = Object.keys(n.branch);
        await Promise.all(keys.map(async (k) => {
          if (typeof n.branch[k].if === "object")
            n.branch[k].if = stringifyFast(n.branch[k].if);
          let pass = false;
          if (typeof n.branch[k].if === "function") {
            pass = n.branch[k].if(output);
          } else {
            if (typeof output === "object") {
              if (stringifyFast(output) === n.branch[k].if)
                pass = true;
            } else if (output === n.branch[k].if)
              pass = true;
          }
          if (pass) {
            if (n.branch[k].then.run) {
              if (Array.isArray(output))
                await n.branch[k].then.run(...output);
              else
                await n.branch[k].then.run(...output);
            } else if (typeof n.branch[k].then === "function") {
              if (Array.isArray(output))
                await n.branch[k].then(...output);
              else
                await n.branch[k].then(output);
            } else if (typeof n.branch[k].then === "string") {
              if (n.graph)
                n.branch[k].then = n.graph.nodes.get(n.branch[k].then);
              else
                n.branch[k].then = n.nodes.get(n.branch[k].then);
              if (n.branch[k].then.run) {
                if (Array.isArray(output))
                  await n.branch[k].then.run(...output);
                else
                  await n.branch[k].then.run(...output);
              }
            }
          }
          return pass;
        }));
      }
    };
    this.runAnimation = (animation = this.animation, args = []) => {
      this.animation = animation;
      if (!animation)
        this.animation = this.operator;
      if (this.animate && !this.isAnimating && "requestAnimationFrame" in window) {
        this.isAnimating = true;
        let anim = async () => {
          if (this.isAnimating) {
            if (this.DEBUGNODE)
              console.time(this.tag);
            let result = this.animation.call(this, ...args);
            if (result instanceof Promise) {
              result = await result;
            }
            if (this.DEBUGNODE) {
              console.timeEnd(this.tag);
              if (result !== void 0)
                console.log(`${this.tag} result:`, result);
            }
            ;
            if (result !== void 0) {
              if (this.tag)
                this.setState({ [this.tag]: result });
              if (this.backward && this.parent?.run) {
                if (Array.isArray(result))
                  await this.runParent(this, ...result);
                else
                  await this.runParent(this, result);
              }
              if (this.children && this.forward) {
                if (Array.isArray(result))
                  await this.runChildren(this, ...result);
                else
                  await this.runChildren(this, result);
              }
              if (this.branch) {
                this.runBranch(this, result);
              }
              this.setState({ [this.tag]: result });
            }
            requestAnimationFrame(anim);
          }
        };
        requestAnimationFrame(anim);
      }
    };
    this.runLoop = (loop = this.looper, args = [], timeout = this.loop) => {
      this.looper = loop;
      if (!loop)
        this.looper = this.operator;
      if (typeof timeout === "number" && !this.isLooping) {
        this.isLooping = true;
        let looping = async () => {
          if (this.isLooping) {
            if (this.DEBUGNODE)
              console.time(this.tag);
            let result = this.looper.call(this, ...args);
            if (result instanceof Promise) {
              result = await result;
            }
            if (this.DEBUGNODE) {
              console.timeEnd(this.tag);
              if (result !== void 0)
                console.log(`${this.tag} result:`, result);
            }
            ;
            if (result !== void 0) {
              if (this.tag)
                this.setState({ [this.tag]: result });
              if (this.backward && this.parent?.run) {
                if (Array.isArray(result))
                  await this.runParent(this, ...result);
                else
                  await this.runParent(this, result);
              }
              if (this.children && this.forward) {
                if (Array.isArray(result))
                  await this.runChildren(this, ...result);
                else
                  await this.runChildren(this, result);
              }
              if (this.branch) {
                this.runBranch(this, result);
              }
              this.setState({ [this.tag]: result });
            }
            setTimeout(async () => {
              await looping();
            }, timeout);
          }
        };
        looping();
      }
    };
    this.setParent = (parent2) => {
      this.parent = parent2;
      if (this.backward)
        this.runSync = false;
    };
    this.setChildren = (children) => {
      this.children = children;
      if (this.forward)
        this.runSync = false;
    };
    this.add = (n = {}) => {
      if (typeof n === "function")
        n = { operator: n };
      if (n?.node instanceof GraphNode)
        n = n.node;
      if (!(n instanceof GraphNode))
        n = new GraphNode(n.node ?? n, this, this.graph);
      this.nodes.set(n.tag, n);
      if (this.graph) {
        this.graph.nodes.set(n.tag, n);
        this.graph.nNodes = this.graph.nodes.size;
      }
      return n;
    };
    this.remove = (n) => {
      if (typeof n === "string")
        n = this.nodes.get(n);
      if (n?.tag) {
        this.nodes.delete(n.tag);
        if (this.children[n.tag])
          delete this.children[n.tag];
        if (this.graph) {
          this.graph.nodes.delete(n.tag);
          this.graph.nNodes = this.graph.nodes.size;
        }
        this.nodes.forEach((n2) => {
          if (n2.nodes.get(n2.tag)) {
            n2.nodes.delete(n2.tag);
            if (n2.children[n2.tag])
              delete n2.children[n2.tag];
            if (n2.parent?.tag === n2.tag)
              delete n2.parent;
          }
        });
        if (n.ondelete)
          n.ondelete(n);
      }
      if (typeof this._state === "object") {
        this.state.unsubscribeTrigger(this._unique);
      }
    };
    this.append = (n, parentNode = this) => {
      if (typeof n === "string")
        n = this.nodes.get(n);
      if (n?.nodes) {
        parentNode.addChildren(n);
        if (n.forward)
          n.runSync = false;
      }
    };
    this.subscribe = (callback, tag = this.tag) => {
      if (typeof callback === "string") {
        if (this.graph)
          callback = this.graph.get(callback);
        else
          callback = this.nodes.get(callback);
      }
      if (typeof callback === "function") {
        return this.state.subscribeTrigger(tag, callback);
      } else if (callback)
        return this.state.subscribeTrigger(tag, (res) => {
          callback.run(res);
        });
    };
    this.unsubscribe = (sub, tag = this.tag) => {
      return this.state.unsubscribeTrigger(tag, sub);
    };
    this.subscribeState = (callback) => {
      if (!this.reactive) {
        return void 0;
      } else {
        if (typeof callback === "string") {
          if (this.graph)
            callback = this.graph.get(callback);
          else
            callback = this.nodes.get(callback);
        }
        if (typeof callback === "function") {
          return this.state.subscribeTrigger(this._unique, callback);
        } else if (callback)
          return this.state.subscribeTrigger(this._unique, (_state) => {
            callback.run(_state);
          });
      }
    };
    this.addChildren = (children) => {
      if (!this.children)
        this.children = {};
      if (typeof children === "object") {
        Object.assign(this.children, children);
      }
      this.convertChildrenToNodes();
      if (this.forward)
        this.runSync = false;
    };
    this.callParent = (...args) => {
      if (typeof this.parent === "string") {
        if (this.graph && this.graph?.get(this.parent)) {
          this.parent = this.graph;
          if (this.parent)
            this.nodes.set(this.parent.tag, this.parent);
        } else
          this.parent = this.nodes.get(this.parent);
      }
      if (typeof this.parent?.operator === "function")
        return this.parent.runOp(...args);
    };
    this.callChildren = (...args) => {
      let result;
      if (typeof this.children === "object") {
        for (const key in this.children) {
          if (this.children[key]?.runOp)
            this.children[key].runOp(...args);
        }
      }
      return result;
    };
    this.getProps = (n = this, getInitial = true) => {
      let baseprops = {
        tag: n.tag,
        operator: n.operator,
        graph: n.graph,
        children: n.children,
        parent: n.parent,
        forward: n.forward,
        backward: n.bacward,
        loop: n.loop,
        animate: n.animate,
        frame: n.frame,
        delay: n.delay,
        recursive: n.recursive,
        repeat: n.repeat,
        branch: n.branch,
        oncreate: n.oncreate,
        reactive: n.reactive,
        DEBUGNODE: n.DEBUGNODE
      };
      if (!getInitial) {
        let uniqueprops = {};
        for (const key in this._initial) {
          uniqueprops[key] = this[key];
        }
        return Object.assign(baseprops, uniqueprops);
      } else
        return {
          tag: n.tag,
          operator: n.operator,
          graph: n.graph,
          children: n.children,
          parent: n.parent,
          forward: n.forward,
          backward: n.bacward,
          loop: n.loop,
          animate: n.animate,
          frame: n.frame,
          delay: n.delay,
          recursive: n.recursive,
          repeat: n.repeat,
          branch: n.branch,
          oncreate: n.oncreate,
          reactive: n.reactive,
          DEBUGNODE: n.DEBUGNODE,
          ...this._initial
        };
    };
    this.setProps = (props = {}) => {
      let tmp = Object.assign({}, props);
      if (tmp.children) {
        this.addChildren(props.children);
        delete tmp.children;
      }
      if (tmp.operator) {
        this.setOperator(props.operator);
        delete tmp.operator;
      }
      Object.assign(tmp, props);
      this.runSync = this.isRunSync();
    };
    this.removeTree = (n) => {
      if (n) {
        if (typeof n === "string")
          n = this.nodes.get(n);
      }
      if (n?.nodes) {
        let checked = {};
        const recursivelyRemove = (node) => {
          if (typeof node.children === "object" && !checked[node.tag]) {
            checked[node.tag] = true;
            for (const key in node.children) {
              if (node.children[key].stopNode)
                node.children[key].stopNode();
              if (node.children[key].tag) {
                if (this.nodes.get(node.children[key].tag))
                  this.nodes.delete(node.children[key].tag);
                this.nodes.forEach((n2) => {
                  if (n2.nodes.get(node.children[key].tag))
                    n2.nodes.delete(node.children[key].tag);
                  if (n2.children[key] instanceof GraphNode)
                    delete n2.children[key];
                });
                recursivelyRemove(node.children[key]);
              }
            }
          }
        };
        if (n.stopNode)
          n.stopNode();
        if (n.tag) {
          this.nodes.delete(n.tag);
          if (this.children[n.tag])
            delete this.children[n.tag];
          if (this.parent?.tag === n.tag)
            delete this.parent;
          if (this[n.tag] instanceof GraphNode)
            delete this[n.tag];
          this.nodes.forEach((n2) => {
            if (n2?.tag) {
              if (n2.nodes.get(n2.tag))
                n2.nodes.delete(n2.tag);
              if (n2.children[n2.tag] instanceof GraphNode)
                delete n2.children[n2.tag];
            }
          });
          recursivelyRemove(n);
          if (this.graph)
            this.graph.removeTree(n, checked);
          else if (n.ondelete)
            n.ondelete(n);
        }
      }
    };
    this.checkNodesHaveChildMapped = (n, child, checked = {}) => {
      let tag = n.tag;
      if (!tag)
        tag = n.name;
      if (!checked[tag]) {
        checked[tag] = true;
        if (n.children) {
          if (child.tag in n.children) {
            if (n.children[child.tag] instanceof GraphNode) {
              if (!n.nodes.get(child.tag))
                n.nodes.set(child.tag, child);
              n.children[child.tag] = child;
              if (!n.firstRun)
                n.firstRun = true;
            }
          }
        }
        if (n.parent instanceof GraphNode) {
          if (n.nodes.get(child.tag))
            n.parent.nodes.set(child.tag, child);
          if (n.parent.children) {
            this.checkNodesHaveChildMapped(n.parent, child, checked);
          } else if (n.nodes) {
            n.nodes.forEach((n2) => {
              if (!checked[n2.tag]) {
                this.checkNodesHaveChildMapped(n2, child, checked);
              }
            });
          }
        }
        if (n.graph) {
          if (n.parent && n.parent.name !== n.graph.name) {
            n.graph.nodes.forEach((n2) => {
              if (!checked[n2.tag]) {
                this.checkNodesHaveChildMapped(n2, child, checked);
              }
            });
          }
        }
      }
    };
    this.convertChildrenToNodes = (n = this) => {
      if (n?.children) {
        for (const key in n.children) {
          if (!(n.children[key] instanceof GraphNode)) {
            if (typeof n.children[key] === "object") {
              if (!n.children[key].tag)
                n.children[key].tag = key;
              if (!n.nodes.get(n.children[key].tag)) {
                n.children[key] = new GraphNode(n.children[key], n, n.graph);
                this.checkNodesHaveChildMapped(n, n.children[key]);
              }
            } else {
              if (typeof n.children[key] === "undefined" || n.children[key] == true) {
                n.children[key] = n.graph.get(key);
                if (!n.children[key])
                  n.children[key] = n.nodes.get(key);
              } else if (typeof n.children[key] === "string") {
                let k = n.children[key];
                n.children[key] = n.graph.get(k);
                if (!n.children[key])
                  n.children[key] = n.nodes.get(key);
              }
              if (n.children[key] instanceof GraphNode) {
                n.nodes.set(n.children[key].tag, n.children[key]);
                this.checkNodesHaveChildMapped(n, n.children[key]);
                if (!(n.children[key].tag in n))
                  n[n.children[key].tag] = n.children[key];
              }
            }
          }
        }
      }
      return n.children;
    };
    this.stopLooping = (n = this) => {
      n.isLooping = false;
    };
    this.stopAnimating = (n = this) => {
      n.isAnimating = false;
    };
    this.stopNode = (n = this) => {
      n.stopAnimating(n);
      n.stopLooping(n);
    };
    this.subscribeNode = (n) => {
      if (typeof n === "string")
        n = this.nodes.get(n);
      if (n.tag)
        this.nodes.set(n.tag, n);
      if (n)
        return this.state.subscribeTrigger(this.tag, (res) => {
          if (Array.isArray(res))
            n.run(...res);
          else
            n.run(res);
        });
    };
    this.print = (n = this, printChildren = true, nodesPrinted = []) => {
      let dummyNode = new GraphNode();
      if (typeof n === "string")
        n = this.nodes.get(n);
      if (n instanceof GraphNode) {
        nodesPrinted.push(n.tag);
        let jsonToPrint = {
          tag: n.tag,
          operator: n.operator.toString()
        };
        if (n.parent)
          jsonToPrint.parent = n.parent.tag;
        if (typeof n.children === "object") {
          for (const key in n.children) {
            if (typeof n.children[key] === "string")
              return n.children[key];
            if (nodesPrinted.includes(n.children[key].tag))
              return n.children[key].tag;
            else if (!printChildren) {
              return n.children[key].tag;
            } else
              return n.children[key].print(n.children[key], printChildren, nodesPrinted);
          }
        }
        for (const prop in n) {
          if (prop === "parent" || prop === "children")
            continue;
          if (typeof dummyNode[prop] === "undefined") {
            if (typeof n[prop] === "function") {
              jsonToPrint[prop] = n[prop].toString();
            } else if (typeof n[prop] === "object") {
              jsonToPrint[prop] = JSON.stringifyWithCircularRefs(n[prop]);
            } else {
              jsonToPrint[prop] = n[prop];
            }
          }
        }
        return JSON.stringify(jsonToPrint);
      }
    };
    this.reconstruct = (json2) => {
      let parsed = reconstructObject(json2);
      if (parsed)
        return this.add(parsed);
    };
    this.setState = (data) => {
      this.state.setState(data);
    };
    this.DEBUGNODES = (debugging = true) => {
      this.DEBUGNODE = debugging;
      this.nodes.forEach((n) => {
        if (debugging)
          n.DEBUGNODE = true;
        else
          n.DEBUGNODE = false;
      });
    };
    if (typeof properties === "function") {
      properties = { operator: properties };
    }
    if (typeof properties === "object") {
      if (properties instanceof GraphNode && properties._initial)
        Object.assign(properties, properties._initial);
      if (properties instanceof Graph) {
        let source = properties;
        properties = {
          source,
          operator: (input) => {
            if (typeof input === "object") {
              let result = {};
              for (const key in input) {
                if (typeof source[key] === "function") {
                  if (Array.isArray(input[key]))
                    result[key] = source[key](...input[key]);
                  else
                    result[key] = source[key](input[key]);
                } else {
                  source[key] = input[key];
                  result[key] = source[key];
                }
              }
              return result;
            }
            return source;
          }
        };
        if (source.operator)
          properties.operator = source.operator;
        if (source.children)
          properties.children = source.children;
        if (source.forward)
          properties.forward = source.forward;
        if (source.backward)
          properties.backward = source.backward;
        if (source.repeat)
          properties.repeat = source.repeat;
        if (source.recursive)
          properties.recursive = source.recursive;
        if (source.loop)
          properties.loop = source.loop;
        if (source.animate)
          properties.animate = source.animate;
        if (source.looper)
          properties.looper = source.looper;
        if (source.animation)
          properties.animation = source.animation;
        if (source.delay)
          properties.delay = source.delay;
        if (source.oncreate)
          properties.oncreate = source.oncreate;
        if (source.node) {
          if (source.node._initial)
            Object.assign(properties, source.node._initial);
        }
        if (source._initial)
          Object.assign(properties, source._initial);
        if (source.tag)
          properties.tag = source.tag;
        this.nodes = source.nodes;
        source.node = this;
        if (graph) {
          source.nodes.forEach((n) => {
            if (!graph.nodes.get(n.tag)) {
              graph.nodes.set(n.tag, n);
              graph.nNodes++;
            }
          });
        }
      }
      if (typeof parent === "string") {
        if (graph)
          parent = graph.nodes.get(parent);
        else
          parent = void 0;
      }
      if (properties.tag && (graph || parent)) {
        let hasnode;
        if (graph?.nodes) {
          hasnode = graph.nodes.get(properties.tag);
        }
        if (!hasnode && parent?.nodes) {
          hasnode = parent.nodes.get(properties.tag);
        }
        if (hasnode) {
          if (this.reactive) {
            this.addLocalState(hasnode);
          }
          if (!this.source)
            this.source = hasnode;
          let props = hasnode.getProps();
          delete props.graph;
          delete props.parent;
          for (let k in props)
            properties[k] = props[k];
        }
      }
      if (properties?.operator) {
        properties.operator = this.setOperator(properties.operator);
      }
      if (!properties.tag && graph) {
        properties.tag = `node${graph.nNodes}`;
      } else if (!properties.tag) {
        properties.tag = `node${Math.floor(Math.random() * 1e10)}`;
      }
      let keys = Object.getOwnPropertyNames(this);
      for (const key in properties) {
        if (!keys.includes(key))
          this._initial[key] = properties[key];
      }
      if (properties.children)
        this._initial.children = Object.assign({}, properties.children);
      if (properties.run) {
        console.log("Transferring", properties, "to", this);
      }
      Object.assign(this, properties);
      if (!this.tag) {
        if (graph) {
          this.tag = `node${graph.nNodes}`;
        } else {
          this.tag = `node${Math.floor(Math.random() * 1e10)}`;
        }
      }
      if (graph) {
        this.graph = graph;
        if (graph.nodes.get(this.tag)) {
          this.tag = `${this.tag}${graph.nNodes + 1}`;
        }
        graph.nodes.set(this.tag, this);
        graph.nNodes++;
        this.state = graph.state;
      }
      if (this.reactive) {
        addLocalState(properties);
        if (typeof this.reactive === "function") {
          this.state.subscribeTrigger(this._unique, this.reactive);
        }
      }
      if (typeof parent === "object") {
        this.parent = parent;
        if (parent instanceof GraphNode || parent instanceof Graph)
          parent.nodes.set(this.tag, this);
      }
      if (typeof properties.tree === "object") {
        for (const key in properties.tree) {
          if (typeof properties.tree[key] === "object") {
            if ((!properties.tree[key]).tag) {
              properties.tree[key].tag = key;
            }
          }
          let node = new GraphNode(properties.tree[key], this, graph);
          this.nodes.set(node.tag, node);
        }
      }
      if (this.children)
        this.convertChildrenToNodes(this);
      if (this.parent instanceof GraphNode || this.parent instanceof Graph)
        this.checkNodesHaveChildMapped(this.parent, this);
      if (typeof this.oncreate === "function")
        this.oncreate(this);
      if (!this.firstRun)
        this.firstRun = true;
      if (this.animation && !this.animate)
        this.animate = true;
    } else
      return properties;
  }
};
var Graph = class {
  constructor(tree, tag, props) {
    this.nNodes = 0;
    this.nodes = /* @__PURE__ */ new Map();
    this.state = new EventHandler();
    this._unique = `${Math.random()}`;
    this.tree = {};
    this.addLocalState = addLocalState;
    this.add = (n = {}) => {
      if (n?.node instanceof GraphNode)
        n = n.node;
      let props2 = n;
      if (!(n instanceof GraphNode))
        n = new GraphNode(props2?.node ?? props2, this, this);
      else {
        this.nNodes = this.nodes.size;
        if (n.tag) {
          this.tree[n.tag] = props2;
          this.nodes.set(n.tag, n);
        }
      }
      return n;
    };
    this.setTree = (tree2 = this.tree) => {
      if (!tree2)
        return;
      for (const node in tree2) {
        const n = this.nodes.get(node);
        if (!n) {
          if (typeof tree2[node] === "function") {
            this.add({ tag: node, operator: tree2[node] });
          } else if (typeof tree2[node] === "object" && !Array.isArray(tree2[node])) {
            if (!tree2[node].tag)
              tree2[node].tag = node;
            let newNode = this.add(tree2[node]);
            if (tree2[node].aliases) {
              tree2[node].aliases.forEach((a) => {
                this.nodes.set(a, newNode);
              });
            }
          } else {
            this.add({ tag: node, operator: (...args) => {
              return tree2[node];
            } });
          }
        } else {
          if (typeof tree2[node] === "function") {
            n.setOperator(tree2[node]);
          } else if (typeof tree2[node] === "object") {
            if (tree2[node] instanceof GraphNode) {
              this.add(tree2[node]);
            } else if (tree2[node] instanceof Graph) {
              let source = tree2[node];
              let properties = {};
              if (source.operator)
                properties.operator = source.operator;
              if (source.children)
                properties.children = source.children;
              if (source.forward)
                properties.forward = source.forward;
              if (source.backward)
                properties.backward = source.backward;
              if (source.repeat)
                properties.repeat = source.repeat;
              if (source.recursive)
                properties.recursive = source.recursive;
              if (source.loop)
                properties.loop = source.loop;
              if (source.animate)
                properties.animate = source.animate;
              if (source.looper)
                properties.looper = source.looper;
              if (source.animation)
                properties.animation = source.animation;
              if (source.delay)
                properties.delay = source.delay;
              if (source.tag)
                properties.tag = source.tag;
              if (source.oncreate)
                properties.oncreate = source.oncreate;
              if (source.node?._initial)
                Object.assign(properties, source.node._initial);
              properties.nodes = source.nodes;
              properties.source = source;
              n.setProps(properties);
            } else {
              n.setProps(tree2[node]);
            }
          }
        }
      }
      this.nodes.forEach((node) => {
        if (typeof node.children === "object") {
          for (const key in node.children) {
            if (typeof node.children[key] === "string") {
              if (this.nodes.get(node.children[key])) {
                node.children[key] = this.nodes.get(node.children[key]);
              }
            } else if (node.children[key] === true || typeof node.children[key] === "undefined") {
              if (this.nodes.get(key)) {
                node.children[key] = this.nodes.get(key);
              }
            }
            if (node.children[key] instanceof GraphNode) {
              node.checkNodesHaveChildMapped(node, node.children[key]);
            }
          }
        }
        if (typeof node.parent === "string") {
          if (this.nodes.get(node.parent)) {
            node.parent = this.nodes.get(node.parent);
            node.nodes.set(node.parent.tag, node.parent);
          }
        }
      });
    };
    this.get = (tag2) => {
      return this.nodes.get(tag2);
    };
    this.set = (n) => {
      return this.nodes.set(n.tag, n);
    };
    this.run = (n, ...args) => {
      if (typeof n === "string")
        n = this.nodes.get(n);
      if (n?.run)
        return n.run(...args);
      else
        return void 0;
    };
    this.runAsync = (n, ...args) => {
      if (typeof n === "string")
        n = this.nodes.get(n);
      if (n?.run)
        return new Promise((res, rej) => {
          res(n.run(...args));
        });
      else
        return new Promise((res, rej) => {
          res(void 0);
        });
    };
    this.removeTree = (n, checked) => {
      if (typeof n === "string")
        n = this.nodes.get(n);
      if (n?.nodes) {
        if (!checked)
          checked = {};
        const recursivelyRemove = (node) => {
          if (node.children && !checked[node.tag]) {
            checked[node.tag] = true;
            if (Array.isArray(node.children)) {
              node.children.forEach((c) => {
                if (c.stopNode)
                  c.stopNode();
                if (c.tag) {
                  if (this.nodes.get(c.tag))
                    this.nodes.delete(c.tag);
                }
                this.nodes.forEach((n2) => {
                  if (n2.nodes.get(c.tag))
                    n2.nodes.delete(c.tag);
                });
                recursivelyRemove(c);
              });
            } else if (typeof node.children === "object") {
              if (node.stopNode)
                node.stopNode();
              if (node.tag) {
                if (this.nodes.get(node.tag))
                  this.nodes.delete(node.tag);
              }
              this.nodes.forEach((n2) => {
                if (n2.nodes.get(node.tag))
                  n2.nodes.delete(node.tag);
              });
              recursivelyRemove(node);
            }
          }
        };
        if (n.stopNode)
          n.stopNode();
        if (n.tag) {
          this.nodes.delete(n.tag);
          this.nodes.forEach((n2) => {
            if (n2.nodes.get(n2.tag))
              n2.nodes.delete(n2.tag);
          });
          this.nNodes = this.nodes.size;
          recursivelyRemove(n);
        }
        if (n.ondelete)
          n.ondelete(n);
      }
      return n;
    };
    this.remove = (n) => {
      if (typeof n === "string")
        n = this.nodes.get(n);
      if (n?.nodes) {
        if (n.stopNode)
          n.stopNode();
        if (n?.tag) {
          if (this.nodes.get(n.tag)) {
            this.nodes.delete(n.tag);
            this.nodes.forEach((n2) => {
              if (n2.nodes.get(n2.tag))
                n2.nodes.delete(n2.tag);
            });
          }
        }
        if (n.ondelete)
          n.ondelete(n);
      }
      return n;
    };
    this.append = (n, parentNode) => {
      parentNode.addChildren(n);
    };
    this.callParent = async (n, ...args) => {
      if (n?.parent) {
        return await n.callParent(...args);
      }
    };
    this.callChildren = async (n, ...args) => {
      if (n?.children) {
        return await n.callChildren(...args);
      }
    };
    this.subscribe = (n, callback) => {
      if (!callback)
        return;
      if (n?.subscribe && typeof callback === "function") {
        return n.subscribe(callback);
      } else if (callback instanceof GraphNode || typeof callback === "string")
        return this.subscribeNode(n, callback);
      else if (typeof n == "string") {
        return this.state.subscribeTrigger(n, callback);
      }
    };
    this.unsubscribe = (tag2, sub) => {
      return this.state.unsubscribeTrigger(tag2, sub);
    };
    this.subscribeState = (callback) => {
      if (!this.reactive) {
        return void 0;
      } else {
        if (typeof callback === "string") {
          if (this.graph)
            callback = this.graph.get(callback);
          else
            callback = this.nodes.get(callback);
        }
        if (typeof callback === "function") {
          return this.state.subscribeTrigger(this._unique, callback);
        } else if (callback)
          return this.state.subscribeTrigger(this._unique, (_state) => {
            callback.run(_state);
          });
      }
    };
    this.subscribeNode = (inputNode, outputNode) => {
      let tag2;
      if (inputNode?.tag)
        tag2 = inputNode.tag;
      else if (typeof inputNode === "string")
        tag2 = inputNode;
      if (typeof outputNode === "string")
        outputNode = this.nodes.get(outputNode);
      if (inputNode && outputNode) {
        let sub = this.state.subscribeTrigger(tag2, (res) => {
          if (Array.isArray(res))
            outputNode.run(...res);
          else
            outputNode.run(res);
        });
        return sub;
      }
    };
    this.stopNode = (n) => {
      if (typeof n === "string") {
        n = this.nodes.get(n);
      }
      if (n?.stopNode) {
        n.stopNode();
      }
    };
    this.print = (n, printChildren = true) => {
      if (n?.print)
        return n.print(n, printChildren);
      else {
        let printed = `{`;
        this.nodes.forEach((n2) => {
          printed += `
"${n2.tag}:${n2.print(n2, printChildren)}"`;
        });
        return printed;
      }
    };
    this.reconstruct = (json2) => {
      let parsed = reconstructObject(json2);
      if (parsed)
        return this.add(parsed);
    };
    this.create = (operator, parentNode, props2) => {
      return createNode(operator, parentNode, props2, this);
    };
    this.setState = (data) => {
      this.state.setState(data);
    };
    this.DEBUGNODES = (debugging = true) => {
      this.nodes.forEach((n) => {
        if (debugging)
          n.DEBUGNODE = true;
        else
          n.DEBUGNODE = false;
      });
    };
    this.tag = tag ? tag : `graph${Math.floor(Math.random() * 1e11)}`;
    if (props) {
      if (props.reactive) {
        this.addLocalState(props);
      } else
        Object.assign(this, props);
      this._initial = props;
    }
    if (tree || Object.keys(this.tree).length > 0)
      this.setTree(tree);
  }
};
function reconstructObject(json2 = "{}") {
  try {
    let parsed = typeof json2 === "string" ? JSON.parse(json2) : json2;
    const parseObj = (obj) => {
      for (const prop in obj) {
        if (typeof obj[prop] === "string") {
          let funcParsed = parseFunctionFromText(obj[prop]);
          if (typeof funcParsed === "function") {
            obj[prop] = funcParsed;
          }
        } else if (typeof obj[prop] === "object") {
          parseObj(obj[prop]);
        }
      }
      return obj;
    };
    return parseObj(parsed);
  } catch (err) {
    console.error(err);
    return void 0;
  }
}
var stringifyWithCircularRefs = function() {
  const refs = /* @__PURE__ */ new Map();
  const parents = [];
  const path = ["this"];
  function clear() {
    refs.clear();
    parents.length = 0;
    path.length = 1;
  }
  function updateParents(key, value) {
    var idx = parents.length - 1;
    var prev = parents[idx];
    if (typeof prev === "object") {
      if (prev[key] === value || idx === 0) {
        path.push(key);
        parents.push(value.pushed);
      } else {
        while (idx-- >= 0) {
          prev = parents[idx];
          if (typeof prev === "object") {
            if (prev[key] === value) {
              idx += 2;
              parents.length = idx;
              path.length = idx;
              --idx;
              parents[idx] = value;
              path[idx] = key;
              break;
            }
          }
          idx--;
        }
      }
    }
  }
  function checkCircular(key, value) {
    if (value != null) {
      if (typeof value === "object") {
        if (key) {
          updateParents(key, value);
        }
        let other = refs.get(value);
        if (other) {
          return "[Circular Reference]" + other;
        } else {
          refs.set(value, path.join("."));
        }
      }
    }
    return value;
  }
  return function stringifyWithCircularRefs2(obj, space) {
    try {
      parents.push(obj);
      return JSON.stringify(obj, checkCircular, space);
    } finally {
      clear();
    }
  };
}();
if (JSON.stringifyWithCircularRefs === void 0) {
  JSON.stringifyWithCircularRefs = stringifyWithCircularRefs;
}
var stringifyFast = function() {
  const refs = /* @__PURE__ */ new Map();
  const parents = [];
  const path = ["this"];
  function clear() {
    refs.clear();
    parents.length = 0;
    path.length = 1;
  }
  function updateParents(key, value) {
    var idx = parents.length - 1;
    if (parents[idx]) {
      var prev = parents[idx];
      if (typeof prev === "object") {
        if (prev[key] === value || idx === 0) {
          path.push(key);
          parents.push(value.pushed);
        } else {
          while (idx-- >= 0) {
            prev = parents[idx];
            if (typeof prev === "object") {
              if (prev[key] === value) {
                idx += 2;
                parents.length = idx;
                path.length = idx;
                --idx;
                parents[idx] = value;
                path[idx] = key;
                break;
              }
            }
            idx++;
          }
        }
      }
    }
  }
  function checkValues(key, value) {
    let val;
    if (value != null) {
      if (typeof value === "object") {
        let c = value.constructor.name;
        if (key && c === "Object") {
          updateParents(key, value);
        }
        let other = refs.get(value);
        if (other) {
          return "[Circular Reference]" + other;
        } else {
          refs.set(value, path.join("."));
        }
        if (c === "Array") {
          if (value.length > 20) {
            val = value.slice(value.length - 20);
          } else
            val = value;
        } else if (c.includes("Set")) {
          val = Array.from(value);
        } else if (c !== "Object" && c !== "Number" && c !== "String" && c !== "Boolean") {
          val = "instanceof_" + c;
        } else if (c === "Object") {
          let obj = {};
          for (const prop in value) {
            if (value[prop] == null) {
              obj[prop] = value[prop];
            } else if (Array.isArray(value[prop])) {
              if (value[prop].length > 20)
                obj[prop] = value[prop].slice(value[prop].length - 20);
              else
                obj[prop] = value[prop];
            } else if (value[prop].constructor.name === "Object") {
              obj[prop] = {};
              for (const p in value[prop]) {
                if (Array.isArray(value[prop][p])) {
                  if (value[prop][p].length > 20)
                    obj[prop][p] = value[prop][p].slice(value[prop][p].length - 20);
                  else
                    obj[prop][p] = value[prop][p];
                } else {
                  if (value[prop][p] != null) {
                    let con = value[prop][p].constructor.name;
                    if (con.includes("Set")) {
                      obj[prop][p] = Array.from(value[prop][p]);
                    } else if (con !== "Number" && con !== "String" && con !== "Boolean") {
                      obj[prop][p] = "instanceof_" + con;
                    } else {
                      obj[prop][p] = value[prop][p];
                    }
                  } else {
                    obj[prop][p] = value[prop][p];
                  }
                }
              }
            } else {
              let con = value[prop].constructor.name;
              if (con.includes("Set")) {
                obj[prop] = Array.from(value[prop]);
              } else if (con !== "Number" && con !== "String" && con !== "Boolean") {
                obj[prop] = "instanceof_" + con;
              } else {
                obj[prop] = value[prop];
              }
            }
          }
          val = obj;
        } else {
          val = value;
        }
      } else {
        val = value;
      }
    }
    return val;
  }
  return function stringifyFast2(obj, space) {
    parents.push(obj);
    let res = JSON.stringify(obj, checkValues, space);
    clear();
    return res;
  };
}();
if (JSON.stringifyFast === void 0) {
  JSON.stringifyFast = stringifyFast;
}
function createNode(operator, parentNode, props, graph) {
  if (typeof props === "object") {
    props.operator = operator;
    return new GraphNode(props, parentNode, graph);
  }
  return new GraphNode({ operator }, parentNode, graph);
}
var DOMElement = class extends HTMLElement {
  template = function(self2 = this, props) {
    return `<div> Custom Fragment Props: ${JSON.stringify(props)} </div>`;
  };
  props = {};
  useShadow = false;
  styles;
  oncreate;
  onresize;
  ondelete;
  onchanged;
  renderonchanged = false;
  FRAGMENT;
  STYLE;
  attachedShadow = false;
  obsAttributes = ["props", "options", "onchanged", "onresize", "ondelete", "oncreate", "template"];
  get observedAttributes() {
    return this.obsAttributes;
  }
  get obsAttributes() {
    return this.obsAttributes;
  }
  set obsAttributes(att) {
    if (typeof att === "string") {
      this.obsAttributes.push(att);
    } else if (Array.isArray(att))
      this.obsAttributes = att;
  }
  static get tag() {
    return this.name.toLowerCase() + "-";
  }
  static addElement(tag = this.tag, cls = this, extend = void 0) {
    addCustomElement(cls, tag, extend);
  }
  attributeChangedCallback = (name2, old, val) => {
    if (name2 === "onchanged") {
      let onchanged = val;
      if (typeof onchanged === "string")
        onchanged = parseFunctionFromText2(onchanged);
      if (typeof onchanged === "function") {
        this.onchanged = onchanged;
        this.state.data.props = this.props;
        this.state.unsubscribeTrigger("props");
        this.state.subscribeTrigger("props", this.onchanged);
        let changed = new CustomEvent("changed", { detail: { props: this.props, self: this } });
        this.state.subscribeTrigger("props", () => {
          this.dispatchEvent(changed);
        });
      }
    } else if (name2 === "onresize") {
      let onresize = val;
      if (typeof onresize === "string")
        onresize = parseFunctionFromText2(onresize);
      if (typeof onresize === "function") {
        if (this.ONRESIZE) {
          try {
            window.removeEventListener("resize", this.ONRESIZE);
          } catch (err) {
          }
        }
        this.ONRESIZE = (ev) => {
          this.onresize(this.props, this);
        };
        this.onresize = onresize;
        window.addEventListener("resize", this.ONRESIZE);
      }
    } else if (name2 === "ondelete") {
      let ondelete = val;
      if (typeof ondelete === "string")
        ondelete = parseFunctionFromText2(ondelete);
      if (typeof ondelete === "function") {
        this.ondelete = () => {
          if (this.ONRESIZE)
            window.removeEventListener("resize", this.ONRESIZE);
          this.state.unsubscribeTrigger("props");
          if (ondelete)
            ondelete(this.props, this);
        };
      }
    } else if (name2 === "oncreate") {
      let oncreate = val;
      if (typeof oncreate === "string")
        oncreate = parseFunctionFromText2(oncreate);
      if (typeof oncreate === "function") {
        this.oncreate = oncreate;
      }
    } else if (name2 === "renderonchanged") {
      let rpc = val;
      if (typeof this.renderonchanged === "number")
        this.unsubscribeTrigger(this.renderonchanged);
      if (typeof rpc === "string")
        rpc = parseFunctionFromText2(rpc);
      if (typeof rpc === "function") {
        this.renderonchanged = this.state.subscribeTrigger("props", (p) => {
          this.render(p);
          rpc(this, p);
        });
      } else if (rpc != false)
        this.renderonchanged = this.state.subscribeTrigger("props", this.render);
    } else if (name2 === "props") {
      let newProps = val;
      if (typeof newProps === "string")
        newProps = JSON.parse(newProps);
      Object.assign(this.props, newProps);
      this.state.setState({ props: this.props });
    } else if (name2 === "template") {
      let template = val;
      this.template = template;
      this.render(this.props);
      let created = new CustomEvent("created", { detail: { props: this.props } });
      this.dispatchEvent(created);
    } else {
      let parsed = val;
      if (name2.includes("eval_")) {
        name2 = name2.split("_");
        name2.shift();
        name2 = name2.join();
        parsed = parseFunctionFromText2(val);
      } else if (typeof val === "string") {
        try {
          parsed = JSON.parse(val);
        } catch (err) {
          parsed = val;
        }
      }
      this[name2] = parsed;
      if (name2 !== "props" && this.props)
        this.props[name2] = parsed;
    }
  };
  connectedCallback() {
    if (!this.props)
      this.props = {};
    let newProps = this.getAttribute("props");
    if (typeof newProps === "string")
      newProps = JSON.parse(newProps);
    Object.assign(this.props, newProps);
    this.state.setState({ props: this.props });
    Array.from(this.attributes).forEach((att) => {
      let name2 = att.name;
      let parsed = att.value;
      if (name2.includes("eval_") || name2.includes("()")) {
        if (name2.includes("eval_"))
          name2 = name2.split("_");
        else if (name2.includes("()"))
          name2 = name2.substring(0, name2.indexOf("("));
        name2.shift();
        name2 = name2.join();
        parsed = parseFunctionFromText2(att.value);
      } else if (typeof att.value === "string") {
        try {
          parsed = JSON.parse(att.value);
        } catch (err) {
          parsed = att.value;
        }
      }
      if (!this[name2]) {
        Object.defineProperties(this, att, {
          value: parsed,
          writable: true,
          get() {
            return this[name2];
          },
          set(val) {
            this.setAttribute(name2, val);
          }
        });
      }
      this[name2] = parsed;
      if (name2 !== "props")
        this.props[name2] = parsed;
      this.obsAttributes.push(name2);
    });
    let resizeevent = new CustomEvent("resized", { detail: { props: this.props, self: this } });
    let changed = new CustomEvent("changed", { detail: { props: this.props, self: this } });
    let deleted = new CustomEvent("deleted", { detail: { props: this.props, self: this } });
    let created = new CustomEvent("created", { detail: { props: this.props, self: this } });
    this.render(this.props);
    this.dispatchEvent(created);
    this.state.subscribeTrigger("props", () => {
      this.dispatchEvent(changed);
    });
    if (typeof this.onresize === "function") {
      if (this.ONRESIZE) {
        try {
          window.removeEventListener("resize", this.ONRESIZE);
        } catch (err) {
        }
      }
      this.ONRESIZE = (ev) => {
        this.onresize(this, this.props);
        this.dispatchEvent(resizeevent);
      };
      window.addEventListener("resize", this.ONRESIZE);
    }
    if (typeof this.ondelete === "function") {
      let ondelete = this.ondelete;
      this.ondelete = (props = this.props) => {
        if (this.ONRESIZE)
          window.removeEventListener("resize", this.ONRESIZE);
        this.state.unsubscribeTrigger("props");
        this.dispatchEvent(deleted);
        ondelete(this, props);
      };
    }
    if (typeof this.onchanged === "function") {
      this.state.data.props = this.props;
      this.state.subscribeTrigger("props", this.onchanged);
    }
    if (this.renderonchanged) {
      let rpc = this.renderonchanged;
      if (typeof this.renderonchanged === "number")
        this.unsubscribeTrigger(this.renderonchanged);
      if (typeof rpc === "string")
        rpc = parseFunctionFromText2(rpc);
      if (typeof rpc === "function") {
        this.renderonchanged = this.state.subscribeTrigger("props", (p) => {
          this.render(p);
          rpc(this, p);
        });
      } else if (rpc !== false)
        this.renderonchanged = this.state.subscribeTrigger("props", this.render);
    }
  }
  constructor() {
    super();
  }
  delete = () => {
    this.remove();
    if (typeof this.ondelete === "function")
      this.ondelete(this.props);
  };
  render = (props = this.props) => {
    if (typeof this.template === "function")
      this.templateResult = this.template(this, props);
    else
      this.templateResult = this.template;
    if (this.styles)
      this.templateResult = `<style>${this.styles}</style>${this.templateResult}`;
    const t = document.createElement("template");
    if (typeof this.templateResult === "string")
      t.innerHTML = this.templateResult;
    else if (this.templateResult instanceof HTMLElement) {
      if (this.templateResult.parentNode) {
        this.templateResult.parentNode.removeChild(this.templateResult);
      }
      t.appendChild(this.templateResult);
    }
    const fragment = t.content;
    if (this.FRAGMENT) {
      if (this.useShadow) {
        if (this.STYLE)
          this.shadowRoot.removeChild(this.STYLE);
        this.shadowRoot.removeChild(this.FRAGMENT);
      } else
        this.removeChild(this.FRAGMENT);
    }
    if (this.useShadow) {
      if (!this.attachedShadow) {
        this.attachShadow({ mode: "open" }).innerHTML = "<slot></slot>";
        this.attachedShadow = true;
      }
      if (this.styles) {
        let style = document.createElement("style");
        style.textContent = this.styles;
        this.shadowRoot.prepend(style);
        this.STYLE = style;
      }
      this.shadowRoot.prepend(fragment);
      this.FRAGMENT = this.shadowRoot.childNodes[0];
    } else {
      this.prepend(fragment);
      this.FRAGMENT = this.childNodes[0];
    }
    let rendered = new CustomEvent("rendered", { detail: { props: this.props, self: this } });
    this.dispatchEvent(rendered);
    if (this.oncreate)
      this.oncreate(this, props);
  };
  state = {
    pushToState: {},
    data: {},
    triggers: {},
    setState(updateObj) {
      Object.assign(this.pushToState, updateObj);
      if (Object.keys(this.triggers).length > 0) {
        for (const prop of Object.getOwnPropertyNames(this.triggers)) {
          if (this.pushToState[prop]) {
            this.data[prop] = this.pushToState[prop];
            delete this.pushToState[prop];
            this.triggers[prop].forEach((obj) => {
              obj.onchanged(this.data[prop]);
            });
          }
        }
      }
      return this.pushToState;
    },
    subscribeTrigger(key, onchanged = (res) => {
    }) {
      if (key) {
        if (!this.triggers[key]) {
          this.triggers[key] = [];
        }
        let l = this.triggers[key].length;
        this.triggers[key].push({ idx: l, onchanged });
        return this.triggers[key].length - 1;
      } else
        return void 0;
    },
    unsubscribeTrigger(key, sub) {
      let triggers = this.triggers[key];
      if (triggers) {
        if (!sub)
          delete this.triggers[key];
        else {
          let idx = void 0;
          let obj = triggers.find((o, i) => {
            if (o.idx === sub) {
              idx = i;
              return true;
            }
          });
          if (obj)
            triggers.splice(idx, 1);
          return true;
        }
      }
    },
    subscribeTriggerOnce(key = void 0, onchanged = (value) => {
    }) {
      let sub;
      let changed = (value) => {
        onchanged(value);
        this.unsubscribeTrigger(key, sub);
      };
      sub = this.subscribeTrigger(key, changed);
    }
  };
  get props() {
    return this.props;
  }
  set props(newProps = {}) {
    this.setAttribute("props", newProps);
  }
  get template() {
    return this.template;
  }
  set template(template) {
    this.setAttribute("template", template);
  }
  get render() {
    return this.render;
  }
  get delete() {
    return this.delete;
  }
  get state() {
    return this.state;
  }
  get onchanged() {
    return this.onchanged;
  }
  set onchanged(onchanged) {
    this.setAttribute("onchanged", onchanged);
  }
  get styles() {
    return this.styles;
  }
  set styles(templateStr) {
    this.styles = templateStr;
    if (this.querySelector("style")) {
      this.querySelector("style").innerHTML = templateStr;
    } else {
      this.render();
    }
  }
  get renderonchanged() {
    return this.renderonchanged;
  }
  set renderonchanged(onchanged) {
    this.setAttribute("renderonchanged", onchanged);
  }
  get onresize() {
    return this.props;
  }
  set onresize(onresize) {
    this.setAttribute("onresize", onresize);
  }
  get ondelete() {
    return this.props;
  }
  set ondelete(ondelete) {
    this.setAttribute("ondelete", ondelete);
  }
  get oncreate() {
    return this.oncreate;
  }
  set oncreate(oncreate) {
    this.setAttribute("oncreated", oncreate);
  }
};
function addCustomElement(cls, tag, extend = null) {
  try {
    if (extend) {
      if (tag)
        window.customElements.define(tag, cls, { extends: extend });
      else
        window.customElements.define(cls.name.toLowerCase() + "-", cls, { extends: extend });
    } else {
      if (tag)
        window.customElements.define(tag, cls);
      else
        window.customElements.define(cls.name.toLowerCase() + "-", cls);
    }
  } catch (err) {
  }
}
function parseFunctionFromText2(method) {
  let getFunctionBody = (methodString) => {
    return methodString.replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i, "$2$3$4");
  };
  let getFunctionHead = (methodString) => {
    let startindex = methodString.indexOf(")");
    return methodString.slice(0, methodString.indexOf("{", startindex) + 1);
  };
  let newFuncHead = getFunctionHead(method);
  let newFuncBody = getFunctionBody(method);
  let newFunc;
  try {
    if (newFuncHead.includes("function")) {
      let varName = newFuncHead.split("(")[1].split(")")[0];
      newFunc = new Function(varName, newFuncBody);
    } else {
      if (newFuncHead.substring(0, 6) === newFuncBody.substring(0, 6)) {
        let varName = newFuncHead.split("(")[1].split(")")[0];
        newFunc = new Function(varName, newFuncBody.substring(newFuncBody.indexOf("{") + 1, newFuncBody.length - 1));
      } else {
        try {
          newFunc = (0, eval)(newFuncHead + newFuncBody + "}");
        } catch (err) {
          newFunc = (0, eval)(method);
        }
      }
    }
  } catch (err) {
  }
  return newFunc;
}
var Service = class extends Graph {
  constructor(options = {}) {
    super(void 0, options.name ? options.name : `service${Math.floor(Math.random() * 1e14)}`, options.props);
    this.routes = {};
    this.loadDefaultRoutes = false;
    this.keepState = true;
    this.firstLoad = true;
    this.customRoutes = {};
    this.customChildren = {};
    this.init = (options2) => {
      if (options2)
        options2 = Object.assign({}, options2);
      else
        options2 = {};
      if (options2.customRoutes)
        Object.assign(options2.customRoutes, this.customRoutes);
      else
        options2.customRoutes = this.customRoutes;
      if (options2.customChildren)
        Object.assign(options2.customChildren, this.customChildren);
      else
        options2.customChildren = this.customChildren;
      if (Array.isArray(options2.routes)) {
        options2.routes.forEach((r) => {
          this.load(r, options2.includeClassName, options2.routeFormat, options2.customRoutes, options2.customChildren, options2.sharedState);
        });
      } else if (options2.routes || (Object.keys(this.routes).length > 0 || this.loadDefaultRoutes) && this.firstLoad)
        this.load(options2.routes, options2.includeClassName, options2.routeFormat, options2.customRoutes, options2.customChildren, options2.sharedState);
    };
    this.load = (routes, includeClassName = true, routeFormat = ".", customRoutes, customChildren, sharedState = true) => {
      if (!routes && !this.loadDefaultRoutes && (Object.keys(this.routes).length > 0 || this.firstLoad))
        return;
      if (this.firstLoad)
        this.firstLoad = false;
      if (customRoutes)
        customRoutes = Object.assign(this.customRoutes, customRoutes);
      else
        customRoutes = this.customRoutes;
      let service;
      let allRoutes = {};
      if (routes) {
        if (!(routes instanceof Graph) && routes?.name && !routes.setTree) {
          if (routes.module) {
            let mod = routes;
            routes = {};
            Object.getOwnPropertyNames(routes.module).forEach((prop) => {
              if (includeClassName)
                routes[mod.name + routeFormat + prop] = routes.module[prop];
              else
                routes[prop] = routes.module[prop];
            });
          } else if (typeof routes === "function") {
            service = new routes({ loadDefaultRoutes: this.loadDefaultRoutes });
            service.load();
            if (sharedState)
              service.state = this.state;
            routes = service.routes;
            if (service.customRoutes && !this.customRoutes)
              this.customRoutes = service.customRoutes;
            else if (service.customRoutes && this.customRoutes)
              Object.assign(this.customRoutes, service.customRoutes);
            if (service.customChildren && !this.customChildren)
              this.customChildren = service.customChildren;
            else if (service.customChildren && this.customChildren)
              Object.assign(this.customChildren, service.customChildren);
          }
        } else if (routes instanceof Graph || routes.source instanceof Graph || routes.setTree) {
          service = routes;
          routes = {};
          if (sharedState)
            service.state = this.state;
          if (includeClassName) {
            let name2 = service.name;
            if (!name2) {
              name2 = service.tag;
              service.name = name2;
            }
            if (!name2) {
              name2 = `graph${Math.floor(Math.random() * 1e15)}`;
              service.name = name2;
              service.tag = name2;
            }
          }
          if (service.customRoutes && !this.customRoutes)
            this.customRoutes = service.customRoutes;
          else if (service.customRoutes && this.customRoutes)
            Object.assign(this.customRoutes, service.customRoutes);
          if (service.customChildren && !this.customChildren)
            this.customChildren = service.customChildren;
          else if (service.customChildren && this.customChildren)
            Object.assign(this.customChildren, service.customChildren);
          service.nodes.forEach((node) => {
            routes[node.tag] = node;
            let checked = {};
            let checkChildGraphNodes = (nd, par) => {
              if (!checked[nd.tag] || par && includeClassName && !checked[par?.tag + routeFormat + nd.tag]) {
                if (!par)
                  checked[nd.tag] = true;
                else
                  checked[par.tag + routeFormat + nd.tag] = true;
                if (nd instanceof Graph || nd.source instanceof Graph || nd.setTree) {
                  if (sharedState)
                    nd.state = this.state;
                  if (includeClassName) {
                    let nm = nd.name;
                    if (!nm) {
                      nm = nd.tag;
                      nd.name = nm;
                    }
                    if (!nm) {
                      nm = `graph${Math.floor(Math.random() * 1e15)}`;
                      nd.name = nm;
                      nd.tag = nm;
                    }
                  }
                  nd.nodes.forEach((n) => {
                    if (includeClassName && !routes[nd.tag + routeFormat + n.tag])
                      routes[nd.tag + routeFormat + n.tag] = n;
                    else if (!routes[n.tag])
                      routes[n.tag] = n;
                    checkChildGraphNodes(n, nd);
                  });
                }
              }
            };
            checkChildGraphNodes(node);
          });
        } else if (typeof routes === "object") {
          let name2 = routes.constructor.name;
          if (name2 === "Object") {
            name2 = Object.prototype.toString.call(routes);
            if (name2)
              name2 = name2.split(" ")[1];
            if (name2)
              name2 = name2.split("]")[0];
          }
          if (name2 && name2 !== "Object") {
            let module = routes;
            routes = {};
            Object.getOwnPropertyNames(module).forEach((route) => {
              if (includeClassName)
                routes[name2 + routeFormat + route] = module[route];
              else
                routes[route] = module[route];
            });
          }
        }
        if ((service instanceof Graph || service?.setTree) && service.name && includeClassName) {
          routes = Object.assign({}, routes);
          for (const prop in routes) {
            let route = routes[prop];
            delete routes[prop];
            routes[service.name + routeFormat + prop] = route;
          }
        }
      }
      if (this.loadDefaultRoutes) {
        let rts = Object.assign({}, this.defaultRoutes);
        if (routes) {
          Object.assign(rts, this.routes);
          routes = Object.assign(rts, routes);
        } else
          routes = Object.assign(rts, this.routes);
        this.loadDefaultRoutes = false;
      }
      if (!routes)
        routes = this.routes;
      let incr = 0;
      for (const tag in routes) {
        incr++;
        let childrenIter = (route, routeKey) => {
          if (typeof route === "object") {
            if (!route.tag)
              route.tag = routeKey;
            if (typeof route?.children === "object") {
              nested:
                for (const key in route.children) {
                  incr++;
                  if (typeof route.children[key] === "object") {
                    let rt = route.children[key];
                    if (rt.tag && allRoutes[rt.tag])
                      continue;
                    if (customChildren) {
                      for (const k2 in customChildren) {
                        rt = customChildren[k2](rt, key, route, routes, allRoutes);
                        if (!rt)
                          continue nested;
                      }
                    }
                    if (rt.id && !rt.tag) {
                      rt.tag = rt.id;
                    }
                    let k;
                    if (rt.tag) {
                      if (allRoutes[rt.tag]) {
                        let randkey = `${rt.tag}${incr}`;
                        allRoutes[randkey] = rt;
                        rt.tag = randkey;
                        childrenIter(allRoutes[randkey], key);
                        k = randkey;
                      } else {
                        allRoutes[rt.tag] = rt;
                        childrenIter(allRoutes[rt.tag], key);
                        k = rt.tag;
                      }
                    } else {
                      if (allRoutes[key]) {
                        let randkey = `${key}${incr}`;
                        allRoutes[randkey] = rt;
                        rt.tag = randkey;
                        childrenIter(allRoutes[randkey], key);
                        k = randkey;
                      } else {
                        allRoutes[key] = rt;
                        childrenIter(allRoutes[key], key);
                        k = key;
                      }
                    }
                    if (service?.name && includeClassName) {
                      allRoutes[service.name + routeFormat + k] = rt;
                      delete allRoutes[k];
                    } else
                      allRoutes[k] = rt;
                  }
                }
            }
          }
        };
        allRoutes[tag] = routes[tag];
        childrenIter(routes[tag], tag);
      }
      top:
        for (const route in allRoutes) {
          if (typeof allRoutes[route] === "object") {
            let r = allRoutes[route];
            if (typeof r === "object") {
              if (customRoutes) {
                for (const key in customRoutes) {
                  r = customRoutes[key](r, route, allRoutes);
                  if (!r)
                    continue top;
                }
              }
              if (r.get) {
                if (typeof r.get == "object") {
                }
              }
              if (r.post) {
              }
              if (r.delete) {
              }
              if (r.put) {
              }
              if (r.head) {
              }
              if (r.patch) {
              }
              if (r.options) {
              }
              if (r.connect) {
              }
              if (r.trace) {
              }
              if (r.post && !r.operator) {
                allRoutes[route].operator = r.post;
              } else if (!r.operator && typeof r.get == "function") {
                allRoutes[route].operator = r.get;
              }
            }
          }
        }
      for (const route in routes) {
        if (typeof routes[route] === "object") {
          if (this.routes[route]) {
            if (typeof this.routes[route] === "object")
              Object.assign(this.routes[route], routes[route]);
            else
              this.routes[route] = routes[route];
          } else
            this.routes[route] = routes[route];
        } else if (this.routes[route]) {
          if (typeof this.routes[route] === "object")
            Object.assign(this.routes[route], routes[route]);
          else
            this.routes[route] = routes[route];
        } else
          this.routes[route] = routes[route];
      }
      if (service) {
        for (const key in this.routes) {
          if (this.routes[key] instanceof GraphNode || this.routes[key].constructor.name.includes("GraphNode")) {
            this.nodes.set(key, this.routes[key]);
            this.nNodes = this.nodes.size;
          }
        }
      } else
        this.setTree(this.routes);
      for (const prop in this.routes) {
        if (this.routes[prop]?.aliases) {
          let aliases = this.routes[prop].aliases;
          aliases.forEach((a) => {
            if (service?.name && includeClassName)
              routes[service.name + routeFormat + a] = this.routes[prop];
            else
              routes[a] = this.routes[prop];
          });
        }
      }
      return this.routes;
    };
    this.unload = (routes = this.routes) => {
      if (!routes)
        return;
      let service;
      if (!(routes instanceof Service) && typeof routes === "function") {
        service = new Service();
        routes = service.routes;
      } else if (routes instanceof Service) {
        routes = routes.routes;
      }
      for (const r in routes) {
        delete this.routes[r];
        if (this.nodes.get(r))
          this.remove(r);
      }
      return this.routes;
    };
    this.handleMethod = (route, method, args) => {
      let m = method.toLowerCase();
      let src = this.nodes.get(route);
      if (!src) {
        src = this.routes[route];
        if (!src)
          src = this.tree[route];
      }
      if (src?.[m]) {
        if (!(src[m] instanceof Function)) {
          if (args)
            src[m] = args;
          return src[m];
        } else
          return src[m](args);
      } else
        return this.handleServiceMessage({ route, args, method });
    };
    this.transmit = (...args) => {
      if (typeof args[0] === "object") {
        if (args[0].method) {
          return this.handleMethod(args[0].route, args[0].method, args[0].args);
        } else if (args[0].route) {
          return this.handleServiceMessage(args[0]);
        } else if (args[0].node) {
          return this.handleGraphNodeCall(args[0].node, args[0].args);
        } else if (this.keepState) {
          if (args[0].route)
            this.setState({ [args[0].route]: args[0].args });
          if (args[0].node)
            this.setState({ [args[0].node]: args[0].args });
        }
        return args;
      } else
        return args;
    };
    this.receive = (...args) => {
      if (args[0]) {
        if (typeof args[0] === "string") {
          let substr = args[0].substring(0, 8);
          if (substr.includes("{") || substr.includes("[")) {
            if (substr.includes("\\"))
              args[0] = args[0].replace(/\\/g, "");
            if (args[0][0] === '"') {
              args[0] = args[0].substring(1, args[0].length - 1);
            }
            ;
            args[0] = JSON.parse(args[0]);
          }
        }
      }
      if (typeof args[0] === "object") {
        if (args[0].method) {
          return this.handleMethod(args[0].route, args[0].method, args[0].args);
        } else if (args[0].route) {
          return this.handleServiceMessage(args[0]);
        } else if (args[0].node) {
          return this.handleGraphNodeCall(args[0].node, args[0].args);
        } else if (this.keepState) {
          if (args[0].route)
            this.setState({ [args[0].route]: args[0].args });
          if (args[0].node)
            this.setState({ [args[0].node]: args[0].args });
        }
        return args;
      } else
        return args;
    };
    this.pipe = (source, destination, endpoint, method, callback) => {
      if (source instanceof GraphNode) {
        if (callback)
          return source.subscribe((res) => {
            let mod = callback(res);
            if (mod !== void 0)
              this.transmit({ route: destination, args: mod, method });
            else
              this.transmit({ route: destination, args: res, method }, endpoint);
          });
        else
          return this.subscribe(source, (res) => {
            this.transmit({ route: destination, args: res, method }, endpoint);
          });
      } else if (typeof source === "string")
        return this.subscribe(source, (res) => {
          this.transmit({ route: destination, args: res, method }, endpoint);
        });
    };
    this.pipeOnce = (source, destination, endpoint, method, callback) => {
      if (source instanceof GraphNode) {
        if (callback)
          return source.state.subscribeTriggerOnce(source.tag, (res) => {
            let mod = callback(res);
            if (mod !== void 0)
              this.transmit({ route: destination, args: mod, method });
            else
              this.transmit({ route: destination, args: res, method }, endpoint);
          });
        else
          return this.state.subscribeTriggerOnce(source.tag, (res) => {
            this.transmit({ route: destination, args: res, method }, endpoint);
          });
      } else if (typeof source === "string")
        return this.state.subscribeTriggerOnce(source, (res) => {
          this.transmit({ route: destination, args: res, method }, endpoint);
        });
    };
    this.terminate = (...args) => {
      this.nodes.forEach((n) => {
        n.stopNode();
      });
    };
    this.recursivelyAssign = (target, obj) => {
      for (const key in obj) {
        if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
          if (typeof target[key] === "object" && !Array.isArray(target[key]))
            this.recursivelyAssign(target[key], obj[key]);
          else
            target[key] = this.recursivelyAssign({}, obj[key]);
        } else
          target[key] = obj[key];
      }
      return target;
    };
    this.defaultRoutes = {
      "/": {
        get: () => {
          return this.print();
        },
        aliases: [""]
      },
      ping: () => {
        console.log("ping");
        return "pong";
      },
      echo: (...args) => {
        this.transmit(...args);
        return args;
      },
      assign: (source) => {
        if (typeof source === "object") {
          Object.assign(this, source);
          return true;
        }
        return false;
      },
      recursivelyAssign: (source) => {
        if (typeof source === "object") {
          this.recursivelyAssign(this, source);
          return true;
        }
        return false;
      },
      log: {
        post: (...args) => {
          console.log("Log: ", ...args);
        },
        aliases: ["info"]
      },
      error: (message) => {
        let er = new Error(message);
        console.error(message);
        return er;
      },
      state: (key) => {
        if (key) {
          return this.state.data[key];
        } else
          return this.state.data;
      },
      printState: (key) => {
        if (key) {
          return stringifyWithCircularRefs(this.state.data[key]);
        } else
          return stringifyWithCircularRefs(this.state.data);
      },
      spliceTypedArray: this.spliceTypedArray,
      transmit: this.transmit,
      receive: this.receive,
      load: this.load,
      unload: this.unload,
      pipe: this.pipe,
      terminate: this.terminate,
      run: this.run,
      subscribe: this.subscribe,
      subscribeNode: this.subscribeNode,
      unsubscribe: this.unsubscribe,
      stopNode: this.stopNode,
      get: this.get,
      add: this.add,
      remove: this.remove,
      setTree: this.setTree,
      setState: this.setState,
      print: this.print,
      reconstruct: this.reconstruct,
      handleMethod: this.handleMethod,
      handleServiceMessage: this.handleServiceMessage,
      handleGraphNodeCall: this.handleGraphNodeCall
    };
    if (options.name)
      this.name = options.name;
    else
      options.name = this.tag;
    if ("loadDefaultRoutes" in options) {
      this.loadDefaultRoutes = options.loadDefaultRoutes;
      this.routes = Object.assign(this.defaultRoutes, this.routes);
    }
    if (options || Object.keys(this.routes).length > 0)
      this.init(options);
  }
  handleServiceMessage(message) {
    let call;
    if (typeof message === "object") {
      if (message.route)
        call = message.route;
      else if (message.node)
        call = message.node;
    }
    if (call) {
      if (Array.isArray(message.args))
        return this.run(call, ...message.args);
      else
        return this.run(call, message.args);
    } else
      return message;
  }
  handleGraphNodeCall(route, args) {
    if (!route)
      return args;
    if (args?.args) {
      this.handleServiceMessage(args);
    } else if (Array.isArray(args))
      return this.run(route, ...args);
    else
      return this.run(route, args);
  }
  isTypedArray(x) {
    return ArrayBuffer.isView(x) && Object.prototype.toString.call(x) !== "[object DataView]";
  }
  spliceTypedArray(arr, start, end) {
    let s = arr.subarray(0, start);
    let e;
    if (end) {
      e = arr.subarray(end + 1);
    }
    let n;
    if (s.length > 0 || e?.length > 0)
      n = new arr.constructor(s.length + e.length);
    if (s.length > 0)
      n.set(s);
    if (e && e.length > 0)
      n.set(e, s.length);
    return n;
  }
};
var DOMService = class extends Service {
  constructor(options, parentNode, interpreters) {
    super({ props: options?.props, name: options?.name ? options.name : `dom${Math.floor(Math.random() * 1e15)}` });
    this.loadDefaultRoutes = false;
    this.keepState = true;
    this.parentNode = document.body;
    this.interpreters = {
      md: (template, options2) => {
        if (typeof markdownit === "undefined") {
          document.head.insertAdjacentHTML("beforeend", `
                    <script src='https://unpkg.com/markdown-it@latest/dist/markdown-it.min.js'><\/script>`);
        }
        let md = globalThis.markdownit();
        let html = md.render(template);
        options2.template = html;
      },
      jsx: (template, options2) => {
        if (!options2.parentNode)
          options2.parentNode = this.parentNode;
        if (typeof options2.parentNode === "string")
          options2.parentNode = document.getElementById(options2.parentNode);
        if (typeof ReactDOM === "undefined") {
          document.head.insertAdjacentHTML("beforeend", `
                    <script src='https://unpkg.com/react@latest/umd/react.production.min.js'><\/script>
                    <script src='https://unpkg.com/react-dom@latest/umd/react-dom.production.min.js'><\/script>`);
        }
        options2.template = "";
        let onrender = options2.onrender;
        options2.onrender = (self2, info) => {
          const modal = ReactDOM.createPortal(template, options2.id);
          onrender(self2, info);
        };
      }
    };
    this.customRoutes = {
      "dom": (r, route, routes) => {
        if (!(r instanceof GraphNode)) {
          if (r.element?.parentNode?.id && r.graph?.parentNode?.id) {
            if (r.graph.parentNode.id === r.element.id) {
              r.parentNode = this.parentNode;
            }
          } else {
            if (r.template) {
              if (!r.tag)
                r.tag = route;
              this.addComponent(r, r.generateChildElementNodes);
            } else if (r.context) {
              if (!r.tag)
                r.tag = route;
              this.addCanvasComponent(r);
            } else if (r.tagName || r.element) {
              if (!r.tag)
                r.tag = route;
              this.addElement(r, r.generateChildElementNodes);
            }
          }
        }
        return r;
      }
    };
    this.customChildren = {
      "dom": (rt, routeKey, parent, routes, checked) => {
        if ((parent.tag || parent.id) && (parent.template || parent.context || parent.tagName || parent.element) && (rt.template || rt.context || rt.tagName || rt.element) && !rt.parentNode) {
          if (parent.tag)
            rt.parentNode = parent.tag;
          if (parent.id)
            rt.parentNode = parent.id;
        }
        return rt;
      }
    };
    this.elements = {};
    this.components = {};
    this.templates = {};
    this.addElement = (options2, generateChildElementNodes = false) => {
      let elm = this.createElement(options2);
      if (!options2.element)
        options2.element = elm;
      if (!options2.operator)
        options2.operator = function(props) {
          if (typeof props === "object")
            for (const key in props) {
              if (this.element) {
                if (typeof this.element[key] === "function" && typeof props[key] !== "function") {
                  if (Array.isArray(props[key]))
                    this.element[key](...props[key]);
                  else
                    this.element[key](props[key]);
                } else if (key === "style") {
                  Object.assign(this.element[key], props[key]);
                } else
                  this.element[key] = props[key];
              }
            }
          return props;
        };
      let node = this.resolveGraphNode(elm, options2);
      let divs = Array.from(elm.querySelectorAll("*"));
      if (generateChildElementNodes) {
        divs = divs.map((d, i) => this.addElement({ element: d }));
      }
      this.elements[options2.id] = { element: elm, node, parentNode: options2.parentNode, divs };
      if (!node.ondelete)
        node.ondelete = (node2) => {
          elm.remove();
          if (options2.onremove)
            options2.onremove.call(this.elements[options2.id].node, elm, this.elements[options2.id]);
        };
      if (options2.onresize) {
        let onresize = options2.onresize;
        options2.onresize = (ev) => {
          onresize.call(this.elements[options2.id].node, ev, elm, this.elements[options2.id]);
        };
        window.addEventListener("resize", options2.onresize);
      }
      return this.elements[options2.id];
    };
    this.createElement = (options2) => {
      let elm;
      if (options2.element) {
        if (typeof options2.element === "string") {
          elm = document.querySelector(options2.element);
          if (!elm)
            elm = document.getElementById(options2.element);
        } else
          elm = options2.element;
      } else if (options2.tagName)
        elm = document.createElement(options2.tagName);
      else if (options2.id && document.getElementById(options2.id))
        elm = document.getElementById(options2.id);
      if (!elm)
        return void 0;
      this.updateOptions(options2, elm);
      return elm;
    };
    this.updateOptions = (options2, element) => {
      if (!options2.id && options2.tag)
        options2.id = options2.tag;
      if (!options2.tag && options2.id)
        options2.tag = options2.id;
      if (!options2.id)
        options2.id = `${options2.tagName ?? "element"}${Math.floor(Math.random() * 1e15)}`;
      let p = options2.parentNode;
      delete options2.parentNode;
      Object.defineProperty(options2, "parentNode", {
        get: function() {
          return element.parentNode;
        },
        set: (v) => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
          this.resolveParentNode(element, v ? v : this.parentNode, options2, options2.onrender);
        },
        enumerable: true,
        configurable: true
      });
      options2.parentNode = p ? p : this.parentNode;
      element.id = options2.id;
      if (options2.style)
        Object.assign(element.style, options2.style);
      if (options2.attributes) {
        for (let key in options2.attributes) {
          if (typeof options2.attributes[key] === "function")
            element[key] = (...args) => options2.attributes[key](...args);
          else
            element[key] = options2.attributes[key];
        }
      }
      if (!options2.attributes?.innerHTML && options2.innerHTML) {
        element.innerHTML = options2.innerHTML;
      } else if (!options2.attributes?.innerText && options2.innerText) {
        element.innerText = options2.innerText;
      }
      return options2;
    };
    this.resolveParentNode = (elm, parentNode2, options2, oncreate) => {
      if (!elm.parentNode) {
        setTimeout(() => {
          if (typeof parentNode2 === "string")
            parentNode2 = document.getElementById(parentNode2);
          if (parentNode2 && typeof parentNode2 === "object") {
            parentNode2.appendChild(elm);
          }
          if (oncreate)
            oncreate.call(elm.node, elm, this.elements[options2.id]);
          if (elm.node.animation || elm.node.animate) {
            elm.node.runAnimation();
          }
          if (elm.node.looper || typeof elm.node.loop === "number" && elm.node.loop) {
            elm.node.runLoop();
          }
        }, 0.01);
      }
    };
    this.resolveGraphNode = (element, options2) => {
      let node;
      if (this.nodes.get(options2.id)?.element?.parentNode?.id === options2.parentNode || this.nodes.get(options2.id)?.parentNode === options2.parentNode) {
        node = this.nodes.get(options2.id);
      } else {
        let parentId = options2.parentNode instanceof HTMLElement ? options2.parentNode?.id : typeof options2.parentNode === "string" ? options2.parentNode : void 0;
        let parent;
        if (parentId)
          parent = this.nodes.get(parentId);
        node = new GraphNode(options2 instanceof Graph ? options2 : Object.assign({}, options2), parent, this);
      }
      delete node.parentNode;
      Object.defineProperty(node, "parentNode", {
        get: function() {
          return element.parentNode;
        },
        set: (v) => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
          this.resolveParentNode(element, v ? v : this.parentNode, options2, options2.onrender);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(node, "element", {
        get: () => element,
        set: (v) => {
          element = v;
          node.nodes.forEach((n) => {
            if (node.source?._unique === n.graph?._unique)
              n.parentNode = element;
          });
        }
      });
      node.element = element;
      element.node = node;
      const initialOptions = options2._initial ?? options2;
      for (let key in initialOptions) {
        if (typeof initialOptions[key] === "function")
          initialOptions[key] = initialOptions[key].bind(node);
        else if (key === "attributes") {
          for (let key2 in initialOptions.attributes) {
            if (typeof initialOptions.attributes[key2] === "function") {
              initialOptions.attributes[key2] = initialOptions.attributes[key2].bind(node);
            }
          }
        }
      }
      return node;
    };
    this.addComponent = (options2, generateChildElementNodes = true) => {
      if (options2.onrender) {
        let oncreate = options2.onrender;
        options2.onrender = (element) => {
          oncreate.call(element.node, element, options2);
        };
      }
      if (options2.onresize) {
        let onresize = options2.onresize;
        options2.onresize = (element) => {
          onresize.call(element.node, element, options2);
        };
      }
      if (options2.onremove) {
        let ondelete = options2.onremove;
        options2.onremove = (element) => {
          ondelete.call(element.node, self, options2);
        };
      }
      if (typeof options2.renderonchanged === "function") {
        let renderonchanged = options2.renderonchanged;
        options2.renderonchanged = (element) => {
          renderonchanged.call(element.node, element, options2);
        };
      }
      if (options2.interpreter && options2.interpreter !== "wc") {
        this.interpreters[options2.interpreter](options2.template, options2);
      }
      class CustomElement extends DOMElement {
        constructor() {
          super(...arguments);
          this.props = options2.props;
          this.styles = options2.styles;
          this.useShadow = options2.useShadow;
          this.template = options2.template;
          this.oncreate = options2.onrender;
          this.onresize = options2.onresize;
          this.ondelete = options2.onremove;
          this.renderonchanged = options2.renderonchanged;
        }
      }
      if (!options2.tagName)
        options2.tagName = `custom-element${Math.random() * 1e15}`;
      CustomElement.addElement(options2.tagName);
      let elm = document.createElement(options2.tagName);
      let completeOptions = this.updateOptions(options2, elm);
      this.templates[completeOptions.id] = completeOptions;
      let divs = Array.from(elm.querySelectorAll("*"));
      if (generateChildElementNodes) {
        divs = divs.map((d) => this.addElement({ element: d }));
      }
      if (!options2.element)
        options2.element = elm;
      if (!options2.operator)
        options2.operator = function op(props) {
          if (typeof props === "object")
            for (const key in props) {
              if (this.element) {
                if (typeof this.element[key] === "function" && typeof props[key] !== "function") {
                  if (Array.isArray(props[key]))
                    this.element[key](...props[key]);
                  else
                    this.element[key](props[key]);
                } else if (key === "style") {
                  Object.assign(this.element[key], props[key]);
                } else
                  this.element[key] = props[key];
              }
            }
          return props;
        };
      let node = this.resolveGraphNode(elm, options2);
      if (!node.ondelete)
        node.ondelete = (node2) => {
          elm.delete();
        };
      this.components[completeOptions.id] = {
        element: elm,
        class: CustomElement,
        node,
        divs,
        ...completeOptions
      };
      return this.components[completeOptions.id];
    };
    this.addCanvasComponent = (options2) => {
      if (!options2.canvas) {
        options2.template = `<canvas `;
        if (options2.width)
          options2.template += `width="${options2.width}"`;
        if (options2.height)
          options2.template += `height="${options2.height}"`;
        options2.template += ` ></canvas>`;
      } else
        options2.template = options2.canvas;
      if (options2.onrender) {
        let oncreate = options2.onrender;
        options2.onrender = (element) => {
          oncreate.call(element.node, element, options2);
        };
      }
      if (options2.onresize) {
        let onresize = options2.onresize;
        options2.onresize = (element) => {
          onresize.call(element.node, element, options2);
        };
      }
      if (options2.ondelete) {
        let ondelete = options2.onremove;
        options2.onremove = (element) => {
          ondelete.call(element.node, element, options2);
        };
      }
      if (typeof options2.renderonchanged === "function") {
        let renderonchanged = options2.renderonchanged;
        options2.renderonchanged = (element) => {
          renderonchanged.call(element.node, element, options2);
        };
      }
      class CustomElement extends DOMElement {
        constructor() {
          super(...arguments);
          this.props = options2.props;
          this.styles = options2.styles;
          this.template = options2.template;
          this.oncreate = options2.onrender;
          this.onresize = options2.onresize;
          this.ondelete = options2.onremove;
          this.renderonchanged = options2.renderonchanged;
        }
      }
      if (!options2.tagName)
        options2.tagName = `custom-element${Math.random() * 1e15}`;
      CustomElement.addElement(options2.tagName);
      let elm = document.createElement(options2.tagName);
      const completeOptions = this.updateOptions(options2, elm);
      let animation = () => {
        if (this.components[completeOptions.id]?.animating) {
          this.components[completeOptions.id].draw(this.components[completeOptions.id].element, this.components[completeOptions.id]);
          requestAnimationFrame(animation);
        }
      };
      this.templates[completeOptions.id] = completeOptions;
      if (!options2.element)
        options2.element = elm;
      if (!options2.operator)
        options2.operator = function op(props) {
          if (typeof props === "object")
            for (const key in props) {
              if (this.element) {
                if (typeof this.element[key] === "function" && typeof props[key] !== "function") {
                  if (Array.isArray(props[key]))
                    this.element[key](...props[key]);
                  else
                    this.element[key](props[key]);
                } else if (key === "style") {
                  Object.assign(this.element[key], props[key]);
                } else
                  this.element[key] = props[key];
              }
            }
          return props;
        };
      let node = this.resolveGraphNode(elm, options2);
      if (!node.ondelete)
        node.ondelete = (node2) => {
          elm.delete();
        };
      let canvas = elm.querySelector("canvas");
      if (completeOptions.style)
        Object.assign(canvas.style, completeOptions.style);
      let context;
      if (typeof completeOptions.context === "object")
        context = options2.context;
      else if (typeof completeOptions.context === "string")
        context = canvas.getContext(completeOptions.context);
      this.components[completeOptions.id] = {
        element: elm,
        class: CustomElement,
        template: completeOptions.template,
        canvas,
        node,
        ...completeOptions
      };
      this.components[completeOptions.id].context = context;
      elm.canvas = canvas;
      elm.context = context;
      node.canvas = canvas;
      node.context = context;
      return this.components[completeOptions.id];
    };
    this.terminate = (element) => {
      if (typeof element === "object") {
        if (element.animating)
          element.animating = false;
        if (element.element)
          element = element.element;
      } else if (typeof element === "string" && this.components[element]) {
        if (this.components[element].node.isAnimating)
          this.components[element].node.stopNode();
        if (this.components[element].divs)
          this.components[element].divs.forEach((d) => this.terminate(d));
        let temp = this.components[element].element;
        delete this.components[element];
        element = temp;
      } else if (typeof element === "string" && this.elements[element]) {
        if (this.elements[element].divs)
          this.elements[element].divs.forEach((d) => this.terminate(d));
        let temp = this.elements[element].element;
        if (this.elements[element].onresize)
          window.removeEventListener("resize", this.elements[element].onresize);
        if (this.elements[element].ondelete)
          this.elements[element].ondelete(temp, this.elements[element]);
        delete this.elements[element];
        element = temp;
      }
      if (element) {
        if (this.nodes.get(element.id)) {
          this.removeTree(element.id);
        }
        if (element instanceof DOMElement)
          element.delete();
        else if (element?.parentNode) {
          element.parentNode.removeChild(element);
        }
        return true;
      }
      return false;
    };
    this.defaultRoutes = {
      addElement: this.addElement,
      addComponent: this.addComponent,
      addCanvasComponent: this.addCanvasComponent,
      terminate: this.terminate
    };
    if (options?.parentNode)
      parentNode = options.parentNode;
    if (typeof parentNode === "string")
      parentNode = document.getElementById(parentNode);
    if (parentNode instanceof HTMLElement)
      this.parentNode = parentNode;
    if (interpreters) {
      Object.assign(this.interpreters, interpreters);
    }
    this.init(options);
  }
};
var Router = class extends Service {
  constructor(options) {
    super(options);
    this.name = "router";
    this.connections = {};
    this.sources = {};
    this.services = {};
    this.serviceConnections = {};
    this.users = {};
    this.addUser = async (info, connections, config, receiving) => {
      if (!info._id) {
        info._id = `user${Math.floor(Math.random() * 1e15)}`;
      }
      let user = Object.assign({}, info);
      if (connections) {
        for (const key in connections) {
          if (typeof connections[key] === "object") {
            if (!connections[key].connection._id) {
              await new Promise((res, rej) => {
                let start = performance.now();
                let checker = () => {
                  if (!connections[key].connection._id) {
                    if (performance.now() - start > 3e3) {
                      delete connections[key];
                      rej(false);
                    } else {
                      setTimeout(() => {
                        checker();
                      }, 100);
                    }
                  } else {
                    res(true);
                  }
                };
                checker();
              }).catch((er) => {
                console.error("Connections timed out:", er);
              });
            }
          }
        }
        for (const key in connections) {
          connections[key] = this.addConnection(connections[key], user._id);
        }
      }
      if (config) {
        for (const c in config) {
          this.openConnection(config[c].service, config[c], user._id, config[c].args);
        }
      }
      let send = (message, ...a) => {
        let connection = this.getConnection(user._id, "send");
        if (connection?.send)
          return connection.send(message, ...a);
      };
      let request = (message, method, ...a) => {
        let connection = this.getConnection(user._id, "request");
        if (connection?.request)
          return connection.request(message, method, ...a);
      };
      let post = (route, args, method, ...a) => {
        let connection = this.getConnection(user._id, "post");
        if (connection?.post)
          return connection.post(route, args, method, ...a);
      };
      let run = (route, args, method, ...a) => {
        let connection = this.getConnection(user._id, "run");
        if (connection?.run)
          return connection.run(route, args, method, ...a);
      };
      let subscribe = (route, callback, ...a) => {
        let connection = this.getConnection(user._id, "subscribe");
        if (connection?.subscribe)
          return connection.subscribe(route, callback, ...a);
      };
      let unsubscribe = (route, sub, ...a) => {
        let connection = this.getConnection(user._id, "unsubscribe");
        if (connection?.unsubscribe)
          return connection.unsubscribe(route, sub, ...a);
      };
      let terminate = () => {
        return this.removeUser(user);
      };
      user.send = send;
      user.request = request;
      user.post = post;
      user.run = run;
      user.subscribe = subscribe;
      user.unsubscribe = unsubscribe;
      user.terminate = terminate;
      this.users[user._id] = user;
      if (connections && !receiving) {
        let connectionIds = {};
        let pass = false;
        Object.keys(connections).map((k, i) => {
          if (connections[k]?._id) {
            connectionIds[`${i}`] = connections[k]?._id;
            pass = true;
          }
        });
        if (pass) {
          user.send({
            route: "addUser",
            args: [
              { _id: user._id },
              connectionIds,
              void 0,
              true
            ]
          });
        }
      }
      return user;
    };
    this.getConnection = (sourceId, hasMethod) => {
      if (this.sources[sourceId]) {
        if (this.order) {
          for (let i = 0; i < this.order.length; i++) {
            let k = this.order[i];
            for (const key in this.sources[sourceId]) {
              if (this.sources[sourceId][key].service) {
                if (typeof this.sources[sourceId][key].service === "object") {
                  if (this.sources[sourceId][key].service.tag === k) {
                    if (this.sources[sourceId][key].connectionType && this.sources[sourceId][key].service?.name) {
                      if (!this.serviceConnections[this.sources[sourceId][key].service.name]) {
                        this.removeConnection(this.sources[sourceId][key]);
                        continue;
                      }
                    }
                    return this.sources[sourceId][key];
                  }
                } else if (this.sources[sourceId][key].service === k) {
                  if (this.sources[sourceId][key].connectionType && this.sources[sourceId][key].service?.name) {
                    if (!this.serviceConnections[this.sources[sourceId][key].service.name])
                      this.removeConnection(this.sources[sourceId][key]);
                    continue;
                  }
                  return this.sources[sourceId][key];
                }
              }
            }
          }
        } else {
          for (const k in this.sources[sourceId]) {
            if (this.sources[sourceId][k].connectionType && this.sources[sourceId][k].service?.name) {
              if (!this.serviceConnections[this.sources[sourceId][k].service.name]) {
                this.removeConnection(this.sources[sourceId][k]);
                continue;
              }
            }
            if (hasMethod && this.sources[sourceId][k][hasMethod]) {
              return this.sources[sourceId][k];
            } else {
              return this.sources[sourceId][k];
            }
          }
        }
      } else if (this.order) {
        for (let i = 0; i < this.order.length; i++) {
          let k = this.order[i];
          if (this.sources[k]?.[sourceId]) {
            if (this.sources[k][sourceId].connectionType && this.sources[k][sourceId].service?.name) {
              if (!this.serviceConnections[this.sources[k][sourceId].service.service.name]) {
                this.removeConnection(this.sources[k][sourceId].service);
                continue;
              }
            }
            if (hasMethod && this.sources[k][sourceId]?.[hasMethod]) {
              return this.sources[k][sourceId];
            } else {
              return this.sources[k][sourceId];
            }
          }
        }
      }
      if (typeof sourceId === "string" && this.connections[sourceId] && this.connections[sourceId].send) {
        return this.connections[sourceId];
      }
    };
    this.getConnections = (sourceId, hasMethod, props) => {
      if (this.sources[sourceId]) {
        if (!props && !hasMethod)
          return this.sources[sourceId];
        let found = {};
        for (const key in this.sources[sourceId]) {
          if (typeof this.sources[sourceId][key] === "object") {
            if (!this.sources[sourceId][key]._id) {
              for (const k in this.sources[sourceId][key]) {
                if (typeof this.sources[sourceId][key][k] === "object") {
                  let pass = true;
                  if (hasMethod && !this.sources[sourceId][key][k][hasMethod])
                    pass = false;
                  for (const p in props) {
                    if (typeof this.sources[sourceId][key][k][p] === "object" && typeof props[p] === "object") {
                      for (const pp in props[p]) {
                        if (props[p][pp] !== this.sources[sourceId][key][k][p][pp]) {
                          pass = false;
                          break;
                        }
                      }
                    } else if (this.sources[sourceId][key][k][p] !== props[p]) {
                      pass = false;
                    } else {
                      pass = false;
                      break;
                    }
                  }
                  if (pass) {
                    found[this.sources[sourceId][key][k]._id] = this.sources[sourceId][key][k];
                  }
                }
              }
            } else {
              let pass = true;
              if (hasMethod && !this.sources[sourceId][key][hasMethod])
                pass = false;
              for (const p in props) {
                if (typeof this.sources[sourceId][key][p] === "object" && typeof props[p] === "object") {
                  for (const pp in props[p]) {
                    if (props[p][pp] !== this.sources[sourceId][key][p][pp]) {
                      pass = false;
                      break;
                    }
                  }
                } else if (this.sources[sourceId][key][p] !== props[p]) {
                  pass = false;
                } else {
                  pass = false;
                  break;
                }
              }
              if (pass) {
                if (this.getConnection(this.sources[sourceId][key], hasMethod))
                  found[this.sources[sourceId][key]._id] = this.sources[sourceId][key];
              }
            }
          }
        }
      }
    };
    this.addConnection = (options2, source) => {
      let settings = {};
      if (typeof options2 === "string") {
        if (this.connections[options2]) {
          options2 = this.connections[options2];
        } else {
          for (const j in this.serviceConnections) {
            for (const k in this.serviceConnections[j]) {
              if (this.serviceConnections[j][k][options2]) {
                options2 = { connection: this.serviceConnections[j][k][options2] };
                options2.service = j;
                settings.connectionType = j;
                settings.connectionsKey = k;
                break;
              }
            }
          }
        }
        if (typeof options2 === "string" && this.nodes.get(options2))
          options2 = { connection: this.nodes.get(options2) };
      }
      if (!options2 || typeof options2 === "string")
        return void 0;
      if (source)
        settings.source = source;
      if (options2.connection instanceof GraphNode) {
        settings.connection = options2.connection;
        let node = settings.connection;
        settings.send = async (message) => {
          if (message.method) {
            if (Array.isArray(message.args)) {
              return node[message.method]?.(...message.args);
            } else
              return node[message.method]?.(message.args);
          } else {
            if (Array.isArray(message.args)) {
              return node.run(...message.args);
            } else
              return node.run(message.args);
          }
        };
        settings.request = async (message, method) => {
          if (method) {
            if (Array.isArray(message.args)) {
              return node[method]?.(...message.args);
            } else
              return node[method]?.(message.args);
          } else {
            if (Array.isArray(message.args)) {
              return node.run(...message.args);
            } else
              return node.run(message.args);
          }
        };
        settings.post = async (route, args, method) => {
          if (route && node.get(route)) {
            let n = node.get(route);
            if (method) {
              if (Array.isArray(args)) {
                return n[method]?.(...args);
              } else
                return n[method]?.(args);
            } else {
              if (Array.isArray(args)) {
                return n.run(...args);
              } else
                return n.run(args);
            }
          } else {
            if (method) {
              if (Array.isArray(args)) {
                return node[method]?.(...args);
              } else
                return node[method]?.(args);
            } else {
              if (Array.isArray(args)) {
                return node.run(...args);
              } else
                return node.run(args);
            }
          }
        };
        settings.run = settings.post;
        settings.subscribe = async (route, callback) => {
          return node.subscribe(callback, route);
        };
        settings.unsubscribe = async (route, sub) => {
          return node.unsubscribe(sub, route);
        };
        settings.terminate = () => {
          node.graph.remove(node);
          return true;
        };
        settings.onclose = options2.onclose;
        if (settings.onclose) {
          let oldondelete;
          if (node.ondelete)
            oldondelete = node.ondelete;
          node.ondelete = (n) => {
            if (settings.onclose)
              settings.onclose(settings, n);
            if (oldondelete)
              oldondelete(n);
          };
        }
      } else if (options2.connection instanceof Graph) {
        if (options2.connection.nodes.get("open"))
          settings.service = options2.connection;
        let graph = settings.connection;
        settings.send = async (message) => {
          if (Array.isArray(message.args))
            graph.run(message.route, ...message.args);
          else
            graph.run(message.route, message.args);
        };
        settings.request = async (message, method) => {
          if (!message.route)
            return void 0;
          if (method) {
            if (Array.isArray(message.args)) {
              return graph.nodes.get(message.route)[method]?.(...message.args);
            } else
              return graph.nodes.get(message.route)[method]?.(message.args);
          } else {
            if (Array.isArray(message.args)) {
              return graph.run(message.route, ...message.args);
            } else
              return graph.run(message.route, message.args);
          }
        };
        settings.post = async (route, args, method) => {
          if (route && graph.get(route)) {
            let n = graph.get(route);
            if (method) {
              if (Array.isArray(args)) {
                return n[method]?.(...args);
              } else
                return n[method]?.(args);
            } else {
              if (Array.isArray(args)) {
                return n.run(...args);
              } else
                return n.run(args);
            }
          }
        };
        settings.run = settings.post;
        settings.subscribe = async (route, callback) => {
          return graph.subscribe(route, callback);
        };
        settings.unsubscribe = async (route, sub) => {
          return graph.unsubscribe(route, sub);
        };
        settings.terminate = (n) => {
          graph.remove(n);
          return true;
        };
      } else if (!(options2._id && this.connections[options2._id])) {
        let c = options2.connection;
        if (typeof c === "string") {
          if (this.connections[c])
            c = this.connections[c];
          else if (options2.service) {
            if (typeof options2.service === "string") {
              options2.service = this.services[options2.service];
            }
            if (typeof options2.service === "object") {
              if (options2.service.connections) {
                for (const key in options2.service.connections) {
                  if (options2.service.connections[key][c]) {
                    c = options2.service.connections[key][c];
                    settings.connectionType = key;
                    settings.connectionsKey = c;
                    break;
                  }
                }
              }
            }
          } else {
            for (const j in this.serviceConnections) {
              for (const k in this.serviceConnections[j]) {
                if (this.serviceConnections[j][k][c]) {
                  c = this.serviceConnections[j][k][c];
                  options2.service = j;
                  settings.connectionType = j;
                  settings.connectionsKey = k;
                  break;
                }
              }
            }
          }
        }
        if (typeof c !== "object")
          return void 0;
        settings._id = c._id;
        settings.send = c.send;
        settings.request = c.request;
        settings.run = c.run;
        settings.post = c.post;
        settings.subscribe = c.subscribe;
        settings.unsubscribe = c.unsubscribe;
        settings.terminate = c.terminate;
        settings.onclose = options2.onclose;
        if (settings.onclose) {
          if (!(c.onclose && settings.onclose.toString() === c.onclose.toString())) {
            let oldonclose = c.onclose;
            c.onclose = (...args) => {
              if (settings.onclose)
                settings.onclose(settings, ...args);
              if (this.users[settings.source] && Object.keys(this.sources[settings.source]).length === 0) {
                this.removeUser(settings.source, false);
              }
              if (oldonclose)
                oldonclose(...args);
            };
          }
        } else {
          let oldonclose = c.onclose;
          c.onclose = (...args) => {
            this.removeConnection(settings);
            if (this.users[settings.source] && Object.keys(this.sources[settings.source]).length === 0) {
              this.removeUser(settings.source, false);
            }
            if (oldonclose)
              oldonclose(...args);
          };
        }
        if (options2.service) {
          if (typeof options2.service === "string")
            options2.service = this.services[options2.service];
          settings.service = options2.service;
        } else if (c.graph)
          settings.service = c.graph;
      }
      if (!settings.source && options2.source) {
        settings.source = options2.source;
      } else if (!settings.source && options2.service) {
        settings.source = typeof options2.service === "object" ? options2.service.name : void 0;
      } else if (!settings.source && (settings.connection instanceof GraphNode || settings.connection instanceof Graph)) {
        settings.source = "local";
        if (!this.order.indexOf("local"))
          this.order.unshift("local");
      }
      if (!settings._id)
        settings._id = `connection${Math.floor(Math.random() * 1e15)}`;
      if (settings.source) {
        if (!this.sources[settings.source])
          this.sources[settings.source] = {};
        this.sources[settings.source][settings._id] = settings;
      }
      if (!this.connections[settings._id])
        this.connections[settings._id] = settings;
      return settings;
    };
    this.removeConnection = (connection, terminate = false) => {
      if (typeof connection === "object" && connection._id)
        connection = connection._id;
      if (typeof connection === "string") {
        if (this.connections[connection]) {
          if (terminate && this.connections[connection])
            this.connections[connection].terminate();
          delete this.connections[connection];
          for (const key in this.sources) {
            if (this.sources[key][connection])
              delete this.sources[key][connection];
            else {
              for (const k in this.sources[key]) {
                if (this.sources[key][k]?.[connection]) {
                  delete this.sources[key][connection];
                }
              }
            }
          }
          return true;
        } else if (this.sources[connection]) {
          for (const key in this.sources[connection]) {
            this.removeConnection(this.sources[connection][key], terminate);
          }
          return true;
        }
      }
    };
    this.addService = (service, connections, includeClassName, routeFormat, syncServices, source, order) => {
      this.load(service, includeClassName, routeFormat, this.customRoutes, this.customChildren);
      this.services[service.name] = service;
      if (connections) {
        if (typeof connections === "string")
          this.addServiceConnections(service, connections, source);
        else {
          for (const c in connections) {
            this.addServiceConnections(service, c, source);
          }
        }
      }
      if (syncServices)
        this.syncServices();
      if (order)
        this.order = order;
      else {
        if (!this.order)
          this.order = [];
        this.order.push(service.name);
      }
    };
    this.addServiceConnections = (service, connectionsKey, source) => {
      if (typeof service === "string") {
        service = this.services[service];
      }
      if (connectionsKey && service[connectionsKey]) {
        let newConnections = {};
        if (!this.serviceConnections[service.name])
          this.serviceConnections[service.name] = {};
        this.serviceConnections[service.name][connectionsKey] = service[connectionsKey];
        for (const key in service[connectionsKey]) {
          if (!this.connections[key]) {
            newConnections[key] = this.addConnection({ connection: service[connectionsKey][key], service }, source);
            newConnections[key].connectionType = connectionsKey;
          }
        }
        return newConnections;
      }
    };
    this.openConnection = async (service, options2, source, ...args) => {
      if (typeof service === "string") {
        service = this.services[service];
      }
      if (service instanceof Service) {
        let connection = service.run("open", options2, ...args);
        if (connection instanceof Promise) {
          return connection.then(async (info) => {
            if (!info._id) {
              await new Promise((res, rej) => {
                let start = performance.now();
                let checker = () => {
                  if (!info._id) {
                    if (performance.now() - start > 3e3) {
                      rej(false);
                    } else {
                      setTimeout(() => {
                        checker();
                      }, 100);
                    }
                  } else {
                    res(true);
                  }
                };
                checker();
              }).catch((er) => {
                console.error("Connections timed out:", er);
              });
            }
            if (info._id)
              this.addConnection({ connection: info, service }, source);
          });
        } else if (connection) {
          if (!connection._id) {
            await new Promise((res, rej) => {
              let start = performance.now();
              let checker = () => {
                if (!connection._id) {
                  if (performance.now() - start > 3e3) {
                    rej(false);
                  } else {
                    setTimeout(() => {
                      checker();
                    }, 100);
                  }
                } else {
                  res(true);
                }
              };
              checker();
            }).catch((er) => {
              console.error("Connections timed out:", er);
            });
          }
          if (connection._id)
            return this.addConnection({ connection, service }, source);
        }
      }
    };
    this.terminate = (connection) => {
      if (typeof connection === "string")
        connection = this.connections[connection];
      return connection.terminate();
    };
    this.subscribeThroughConnection = (route, relay, endpoint, callback, ...args) => {
      if (typeof relay === "string") {
        relay = this.getConnection(relay, "run");
      }
      if (typeof relay === "object")
        return new Promise((res, rej) => {
          relay.run("routeConnections", [route, endpoint, relay._id, ...args]).then((sub) => {
            this.subscribe(endpoint, (res2) => {
              if (res2?.callbackId === route) {
                if (!callback)
                  this.setState({ [endpoint]: res2.args });
                else if (typeof callback === "string") {
                  this.setState({ [callback]: res2.args });
                } else
                  callback(res2.args);
              }
            });
            res(sub);
          }).catch(rej);
        });
    };
    this.routeConnections = (route, transmitter, receiver, ...args) => {
      let rxsrc;
      if (typeof receiver === "string") {
        if (this.sources[receiver]) {
          rxsrc = receiver;
        }
        receiver = this.getConnection(receiver, "send");
      }
      if (typeof transmitter === "string") {
        transmitter = this.getConnection(transmitter, "subscribe");
      }
      if (transmitter?.subscribe && receiver?.send) {
        let res = new Promise((res2, rej) => {
          transmitter.subscribe(route, transmitter._id, (res3) => {
            if (!this.connections[receiver._id] && rxsrc) {
              if (this.sources[rxsrc]) {
                rxsrc = receiver;
                Object.keys(this.sources[rxsrc]).forEach((k) => {
                  if (this.sources[receiver][k].send) {
                    receiver = this.sources[receiver][k];
                  }
                });
              }
            }
            if (this.connections[receiver._id])
              receiver.send({ callbackId: route, args: res3 });
          }, ...args).then((sub) => {
            res2(sub);
          });
        });
        return res;
      }
    };
    this.syncServices = () => {
      for (const name2 in this.services) {
        if ("users" in this.services[name2])
          this.services[name2].users = this.users;
        this.nodes.forEach((n, tag) => {
          if (!this.services[name2].nodes.get(n.tag)) {
            this.services[name2].nodes.set(n.tag, n);
          } else {
            if (!this.services[name2].nodes.get(tag) && n._UNIQUE !== this.services[name2].nodes.get(n.tag)._UNIQUE)
              this.services[name2].nodes.set(tag, n);
          }
        });
      }
    };
    this.setUserData = (user, data) => {
      if (user) {
        if (typeof user === "string") {
          user = this.users[user];
          if (!user)
            return false;
        }
      }
      if (data) {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
      }
      if (typeof data === "object") {
        this.recursivelyAssign(user, data);
        return true;
      }
    };
    this.routes = {
      addUser: this.addUser,
      removeUser: this.removeUser,
      getConnection: this.getConnection,
      addConnection: this.addConnection,
      removeConnection: this.removeConnection,
      addService: this.addService,
      addServiceConnections: this.addServiceConnections,
      openConnection: this.openConnection,
      terminate: this.terminate,
      routeConnections: this.routeConnections,
      subscribeThroughConnection: this.subscribeThroughConnection,
      syncServices: this.syncServices
    };
    this.load(this.routes);
    if (options) {
      if (options.order)
        this.order = options.order;
      if (options.services) {
        for (const key in options.services) {
          let opt = options.services[key];
          if (opt instanceof Service) {
            opt.service.name = key;
            opt.service.tag = key;
            this.addService(opt.service, opt.connections, options.includeClassName, options.routeFormat, options.syncServices);
          } else if (typeof opt === "function") {
            let service = new opt();
            service.name = key;
            service.tag = key;
            if (service)
              this.addService(service, service.connections, options.includeClassName, options.routeFormat, options.syncServices);
          } else {
            if (typeof opt.service === "function") {
              let service = new opt.service({ name: key });
              service.name = key;
              service.tag = key;
              if (service)
                this.addService(service, void 0, options.includeClassName, options.routeFormat, options.syncServices);
              opt.service = service;
            } else if (opt.service instanceof Service) {
              opt.service.name = key;
              opt.service.tag = key;
              this.addService(opt.service, void 0, options.includeClassName, options.routeFormat, options.syncServices);
            }
            if (typeof opt.service === "object") {
              if (opt.connections) {
                if (Array.isArray(opt.connections)) {
                  opt.connections.forEach((k) => {
                    this.addServiceConnections(opt[key].service, k);
                  });
                } else
                  this.addServiceConnections(opt.service, opt.connections);
              }
              if (opt.config) {
                for (const c in opt.config) {
                  this.openConnection(opt.service, opt.config[c], opt.config[c].source, opt.config[c].args);
                }
              }
            }
          }
        }
      }
    }
  }
  removeUser(profile, terminate) {
    if (terminate)
      this.removeConnection(profile, terminate);
    if (typeof profile === "string")
      profile = this.users[profile];
    if (typeof profile === "object" && profile._id) {
      delete this.users[profile._id];
      if (profile.onclose)
        profile.onclose(profile);
    }
    return true;
  }
};
var transform_default = (tag, node) => {
  const args = node.arguments;
  let graph;
  Array.from(args.keys()).forEach((arg, i) => node[`${arg}`] = args.get(arg).state);
  const originalOperator = node.operator;
  if (typeof originalOperator === "function") {
    node.operator = function(...argsArr) {
      let updatedArgs = [];
      let i = 0;
      args.forEach((o, k) => {
        const argO = args.get(k);
        const proxy = `${k}`;
        const currentArg = argO.spread ? argsArr.slice(i) : argsArr[i];
        const target = graph.node ?? graph;
        let update = currentArg !== void 0 ? currentArg : target[proxy];
        target[proxy] = update;
        if (!argO.spread)
          update = [update];
        updatedArgs.push(...update);
        i++;
      });
      return originalOperator.call(this ?? node, ...updatedArgs);
    };
  } else {
    console.error("Operator is not a function for", node.tag, node, originalOperator);
    node.operator = (...args2) => args2;
  }
  graph = new Graph({}, tag, node);
  return graph;
};
var ARGUMENT_NAMES = /([^,]*)/g;
function getFnParamInfo(fn) {
  var fstr = fn.toString();
  const openPar = fstr.indexOf("(");
  const closePar = fstr.indexOf(")");
  const getFirstBracket = (str, offset = 0) => {
    const fb = offset + str.indexOf("{");
    if (fb < closePar && fb > openPar) {
      return getFirstBracket(str.slice(fb), offset + fb);
    } else
      return fb;
  };
  const firstBracket = getFirstBracket(fstr);
  let innerMatch;
  if (firstBracket === -1 || closePar < firstBracket)
    innerMatch = fstr.slice(fstr.indexOf("(") + 1, fstr.indexOf(")"));
  else
    innerMatch = fstr.match(/([a-zA-Z]\w*|\([a-zA-Z]\w*(,\s*[a-zA-Z]\w*)*\)) =>/)?.[1];
  if (!innerMatch)
    return void 0;
  const matches = innerMatch.match(ARGUMENT_NAMES).filter((e) => !!e);
  const info = /* @__PURE__ */ new Map();
  matches.forEach((v) => {
    let [name2, value] = v.split("=");
    name2 = name2.trim();
    name2 = name2.replace(/\d+$/, "");
    const spread = name2.includes("...");
    name2 = name2.replace("...", "");
    try {
      if (name2)
        info.set(name2, {
          state: value ? (0, eval)(`(${value})`) : value,
          spread
        });
    } catch (e) {
      info.set(name2, {});
      console.warn(`Argument ${name2} could not be parsed for`, fn.toString(), value);
    }
  });
  return info;
}
var parse_default = getFnParamInfo;
var isNode = "process" in globalThis;
var ESPlugin = class {
  #initial;
  #options;
  #instance;
  #graph;
  #router;
  #cache = {};
  #plugins = {};
  #active = false;
  plugins = {};
  #toRun = false;
  #runProps = true;
  get initial() {
    return this.#initial;
  }
  get instance() {
    return this.#instance;
  }
  get graph() {
    return this.#graph;
  }
  set graph(v) {
    this.#graph = v;
  }
  constructor(node, options = {}) {
    this.#initial = node;
    this.#options = options;
    this.#router = options._router ? options._router : options._router = new Router({
      linkServices: false,
      includeClassName: false
    });
    do {
      this.#initial = this.initial.initial ?? this.initial;
    } while (this.initial instanceof ESPlugin);
    const isFunction = typeof this.initial === "function";
    const hasDefault = "default" in this.initial;
    let hasGraph = !!node.graph;
    if (!hasDefault && !hasGraph) {
      let newNode = { graph: { nodes: {} } };
      for (let namedExport in node)
        newNode.graph.nodes[namedExport] = { default: node[namedExport] };
      this.#initial = newNode;
      hasGraph = true;
      this.#runProps = false;
    }
    if (hasDefault || isFunction) {
      this.graph = this.#create(options.tag ?? "defaultESPluginTag", this.initial);
    }
    if (hasGraph) {
      const toNotify = [];
      const nodes = this.initial.graph.nodes;
      for (let tag in nodes) {
        const node2 = nodes[tag];
        if (!(node2 instanceof ESPlugin)) {
          const clonedOptions = Object.assign({}, Object.assign(options));
          const plugin = new ESPlugin(node2, Object.assign(clonedOptions, { tag }));
          this.#plugins[tag] = plugin;
          toNotify.push(plugin);
        } else
          this.#cache[tag] = this.#plugins[tag] = node2;
      }
      const thisTag = this.#options.tag;
      toNotify.forEach((o) => {
        let tag = o.#options.tag;
        if (thisTag)
          tag = `${thisTag}.${tag}`;
        this.plugins[o.#options.tag] = o;
        if (typeof options.onPlugin === "function")
          options.onPlugin(tag, o);
      });
    }
    Object.defineProperty(this, "tag", {
      get: () => this.graph?.tag,
      enumerable: true
    });
  }
  #createTree = () => {
    let tree = {};
    for (let tag in this.#plugins) {
      let thisNode = this.#plugins[tag].graph;
      if (this.#cache[tag]) {
        let gs = this.#cache[tag].graph;
        const ref = gs.node ? gs.node : gs;
        thisNode = {};
        for (let key in ref._initial)
          thisNode[key] = ref[key];
        thisNode.tag = tag;
        gs.state.triggers = {};
      }
      tree[tag] = this.#create(tag, thisNode);
    }
    let listeningFor = {};
    let quickLookup = {};
    let resolve3 = (path) => {
      if (quickLookup[path] === void 0) {
        const splitEdge = path.split(".");
        const first = splitEdge.shift();
        const lastKey = splitEdge.pop();
        let last = tree[first];
        if (last) {
          splitEdge.forEach((str) => last = last.nodes.get(str));
          const resolved = lastKey ? last.nodes.get(lastKey) : last;
          quickLookup[path] = { resolved, last, lastKey };
        } else
          console.error(`Target associated with ${path} was not found`);
      }
      return quickLookup[path];
    };
    let activate = async (edges2, data) => {
      for (let input in edges2) {
        let { resolved, last, lastKey } = resolve3(input);
        if (resolved) {
          const target = resolved.node ?? resolved;
          if (Array.isArray(data))
            target.run(...data);
          else
            target.run(data);
        } else {
          const target = last.node ?? last;
          let res;
          if (typeof target[lastKey] === "function") {
            if (Array.isArray(data))
              res = await target[lastKey](...data);
            else
              res = await target[lastKey](data);
          } else
            res = target[lastKey] = data;
          if (listeningFor[input])
            activate(listeningFor[input], res);
        }
      }
    };
    const edges = this.initial.graph.edges;
    for (let output in edges) {
      let { resolved } = resolve3(output);
      if (resolved) {
        if (!resolved.children)
          resolved.children = {};
        const callback = (data) => {
          activate(edges[output], data);
        };
        if (resolved instanceof GraphNode)
          resolved.subscribe(callback);
        else
          this.#router.state.subscribeTrigger(resolved.tag, callback);
      } else
        listeningFor[output] = edges[output];
    }
    return tree;
  };
  #activate = () => {
    if (this.initial.graph) {
      let tree = this.#createTree();
      const props = this.#instance ?? this.initial;
      this.graph = isNode ? new Graph(tree, this.#options.tag, props) : new DOMService({ routes: tree, name: this.#options.tag, props: this.#runProps ? props : void 0 }, this.#options.parentNode);
      this.#router.load(this.graph);
      for (let tag in this.#plugins) {
        const cache2 = this.#cache[tag];
        if (cache2)
          cache2.graph = tree[tag];
      }
    }
  };
  start = async (defer) => {
    if (this.#active === false) {
      this.#active = true;
      const activateFuncs = [];
      for (let key in this.plugins) {
        const o = this.plugins[key];
        await o.start((f2) => {
          activateFuncs.push(f2);
        });
      }
      this.#activate();
      const f = async () => {
        for (let f2 of activateFuncs)
          await f2();
        if (this.#toRun)
          await this.run();
      };
      const graph = this.initial.graph;
      if (graph) {
        const ports = graph.ports;
        let firstNode, lastNode;
        if (ports) {
          firstNode = await this.graph.get(ports.input);
          lastNode = this.graph.get(ports.output);
        } else {
          const nodes = Array.from(this.graph.nodes.values());
          firstNode = nodes[0];
          lastNode = nodes.slice(-1)[0];
        }
        if (lastNode)
          lastNode.subscribe((...args) => {
            for (let tag in lastNode.graph.children)
              this.#runGraph(lastNode.graph.children[tag], ...args);
          });
        if (firstNode)
          this.#initial.operator = async function(...args) {
            await firstNode.run(...args);
          };
      }
      if (typeof defer === "function")
        defer(f);
      else
        await f();
    }
  };
  stop = () => {
    if (this.#active === true) {
      for (let k in this.nested)
        this.nested[k].stop();
      if (this.graph)
        this.graph.nodes.forEach((n) => {
          this.graph.removeTree(n);
          n.stopNode();
          this.graph.state.triggers = {};
        });
      this.#active = false;
    }
  };
  #create = (tag, info) => {
    if (typeof info === "function")
      info = { default: info };
    if (!("default" in info) || info instanceof Graph)
      return info;
    else {
      let activeInfo;
      if (info instanceof ESPlugin) {
        activeInfo = info.instance;
        info = info.initial;
      }
      const args = parse_default(info.default) ?? /* @__PURE__ */ new Map();
      if (args.size === 0)
        args.set("default", {});
      let argsArray = Array.from(args.entries());
      const input = argsArray[0][0];
      if (info.arguments) {
        const isArray = Array.isArray(info.arguments);
        let i = 0;
        for (let key in info.arguments) {
          const v = info.arguments[key];
          if (isArray) {
            argsArray[i].state = v;
            if (i == 0)
              this.#toRun = true;
          } else {
            args.get(key).state = v;
            if (input === key)
              this.#toRun = true;
          }
          i++;
        }
      }
      const gsIn = {
        arguments: args,
        operator: info.default,
        tag,
        default: info.default
      };
      var props = Object.getOwnPropertyNames(info);
      const onActive = ["arguments", "default", "tag", "operator"];
      props.forEach((key) => {
        if (!onActive.includes(key))
          gsIn[key] = info[key];
      });
      if (activeInfo) {
        for (let key in activeInfo) {
          if (!onActive.includes(key))
            gsIn[key] = activeInfo[key];
        }
      }
      this.#instance = gsIn;
      return transform_default(tag, gsIn);
    }
  };
  #runGraph = async (graph = this.graph, ...args) => {
    if (graph instanceof Graph) {
      if (graph.node)
        return graph.node.run(...args);
      else {
        if (args.length === 0)
          return this.#runDefault(graph);
        else if (graph.nodes.has(args[0]))
          return graph.run(...args);
        else
          return this.#runDefault(graph, ...args);
      }
    } else
      return await graph.run(...args);
  };
  #runDefault = (graph, ...args) => graph.run(graph.nodes.values().next().value, ...args);
  run = async (...args) => this.#runGraph(this.graph, ...args);
};
var src_default = ESPlugin;

// index.ts
var basePkgPath = "./package.json";
var startTime = Date.now();
var _filesystem, _input, _options, _url, _cache, _main, _mode, _onImport, _throw;
var WASL = class {
  constructor(urlOrObject, options = {}, url) {
    this.errors = [];
    this.warnings = [];
    this.files = {};
    this.original = {};
    this.debug = void 0;
    __privateAdd(this, _filesystem, void 0);
    __privateAdd(this, _input, {});
    __privateAdd(this, _options, {});
    __privateAdd(this, _url, void 0);
    __privateAdd(this, _cache, {});
    __privateAdd(this, _main, "");
    __privateAdd(this, _mode, "import");
    __privateAdd(this, _onImport, (path, info) => this.files[path] = info);
    __privateAdd(this, _throw, (e) => {
      const item = {
        message: e.message,
        file: e.file,
        node: e.node
      };
      const arr = e.type === "warning" ? this.warnings : this.errors;
      arr.push(item);
    });
    this.get = async (...args) => {
      const path = args[0];
      return await get_default(args[0], args[1], __privateGet(this, _onImport)).catch((e) => __privateGet(this, _throw).call(this, {
        message: e.message,
        file: path
      }));
    };
    this.load = async (node, info, options, id, symbols, counter) => {
      if (node.plugins) {
        for (let nestedName in node.plugins) {
          const nestedNode = node.src.graph?.nodes?.[nestedName];
          for (let key in node.plugins[nestedName]) {
            const newInfo = node.plugins[nestedName][key];
            if (typeof newInfo === "object" && !Array.isArray(newInfo)) {
              const ogSrc = newInfo.src;
              let newInfoForNode;
              if (id)
                newInfoForNode = __privateGet(this, _cache)[id]?.[key];
              if (!newInfoForNode) {
                const optsCopy = Object.assign({}, options);
                if (key === "graph")
                  optsCopy._deleteSrc = false;
                else
                  optsCopy._deleteSrc = true;
                newInfoForNode = await this.resolve({ [key]: newInfo }, info, optsCopy, {
                  nodes: newInfo
                }, symbols, counter);
                if (id) {
                  if (!__privateGet(this, _cache)[id])
                    __privateGet(this, _cache)[id] = {};
                  __privateGet(this, _cache)[id][key] = newInfoForNode;
                }
              }
              if (nestedNode) {
                const newVal = newInfoForNode[key];
                if (newVal) {
                  let chosenVal = newVal.src ?? newVal;
                  if ("default" in chosenVal && Object.keys(chosenVal).length === 1)
                    chosenVal = chosenVal.default;
                  if (nestedNode)
                    nestedNode[key] = chosenVal;
                } else {
                  __privateGet(this, _throw).call(this, { message: `Could not resolve ${ogSrc}` });
                }
              }
            } else if (nestedNode)
              nestedNode[key] = newInfo;
          }
          if (node.src.graph && !nestedNode) {
            __privateGet(this, _throw).call(this, {
              message: `Plugin target '${nestedName}' does not exist`,
              node: name
            });
          }
        }
      }
    };
    this.resolve = async (target, info, options, graph = {}, symbols = [], counter) => {
      const nodes = graph.nodes;
      const edges = graph.edges;
      counter++;
      const id = Symbol("unique");
      let { url } = info;
      const mainPath = info.mainPath || __privateGet(this, _main);
      const symbolsRegistry = {};
      for (let name2 in target) {
        let symbolsCopy = symbolsRegistry[name2] = [...symbols];
        const node = target[name2];
        const isObj = node && typeof node === "object" && !Array.isArray(node);
        if (isObj) {
          await this.load(node, info, options, id, symbolsCopy, counter);
          let ogSrc = node.src ?? "";
          if (isSrc(ogSrc) || nodes && edges && !ogSrc) {
            node.src = null;
            let _internal = "";
            let _modeOverride = options._modeOverride;
            let fullPath;
            try {
              new URL(ogSrc);
              if (!options._overrideRemote || options._modeOverride === "import") {
                _modeOverride = "import";
                _internal = fullPath = ogSrc;
              } else
                fullPath = `${ogSrc.split("://").slice(1).join("/")}`;
            } catch {
              if (ogSrc)
                fullPath = mainPath ? resolve2(ogSrc, mainPath) : resolve2(ogSrc);
            }
            let mode = options._modeOverride ?? __privateGet(this, _mode);
            if (ogSrc) {
              if (this.debug) {
                let target2 = this.debug.flow;
                symbolsCopy.forEach((str) => {
                  if (str) {
                    if (!target2[str])
                      target2[str] = {};
                    target2 = target2[str];
                  }
                });
                if (!this.debug.resolutions[name2])
                  this.debug.resolutions[name2] = {};
                let nameRes = this.debug.resolutions[name2];
                if (!nameRes[fullPath])
                  nameRes[fullPath] = { _resolutions: 0, _depth: [], _time: [] };
                nameRes[fullPath]._resolutions++;
                nameRes[fullPath]._depth.push(counter);
                nameRes[fullPath]._time.push(Date.now() - startTime);
                if (target2)
                  target2[fullPath] = {};
              }
              if (_internal || mode === "import") {
                let res = await this.get(fullPath, void 0);
                if (res)
                  node.src = res;
                if (!node.src && !node.graph)
                  remove(ogSrc, fullPath, name2, target);
              } else {
                if (__privateGet(this, _filesystem)) {
                  let res;
                  res = checkFiles(fullPath, __privateGet(this, _filesystem));
                  if (res) {
                    if (res.default || fullPath.includes(".json"))
                      node.src = res;
                    else {
                      __privateGet(this, _throw).call(this, {
                        type: "warning",
                        message: `Node (${name2}) at ${fullPath} does not have a default export.`,
                        file: ogSrc
                      });
                      node.src = { default: res };
                    }
                    _internal = fullPath;
                  } else if (ogSrc)
                    remove(ogSrc, fullPath, name2, target);
                } else {
                  __privateGet(this, _throw).call(this, {
                    message: "No options.filesystem field to get JavaScript objects",
                    file: ogSrc
                  });
                }
              }
            }
            if (!_internal)
              _internal = ogSrc ? resolve2(ogSrc, url, true) : true;
            let _top = false;
            if (node.graph) {
              _top = true;
              if (!node.src)
                node.src = {};
              node.src.graph = node.graph;
              delete node.graph;
            }
            if (node.src && node.src.graph) {
              await this.init(node.src, {
                _internal,
                _deleteSrc: options._deleteSrc,
                _top,
                _modeOverride,
                _overrideRemote: options._overrideRemote
              }, void 0, symbolsCopy, counter);
            } else
              symbolsCopy.push(fullPath);
          }
          for (let key in node) {
            if (!isObj && key === "src" && node.src) {
              const language = node.src.language;
              if (!language || js.includes(language)) {
                if (node.src.text) {
                  const esmImport = async (text) => {
                    try {
                      let imported = await importFromText2(text);
                      if (imported.default && Object.keys(imported).length === 1)
                        imported = imported.default;
                      return imported;
                    } catch (e) {
                      console.error("Import did not work. Probably relies on something...");
                      __privateGet(this, _throw).call(this, {
                        message: e.message,
                        file: name2
                      });
                    }
                  };
                  const esm = await esmImport(node.src.text);
                  if (esm) {
                    delete node.src.text;
                    if (typeof esm === "object")
                      node.src = { default: Object.assign(node.src, esm) };
                    else
                      node.src = esm;
                  } else {
                    __privateGet(this, _throw).call(this, {
                      message: "Could not import this text as ESM",
                      file: node.src
                    });
                  }
                } else {
                  const expectedFunctions = ["default", "oncreate", "onrender"];
                  for (let key2 in node.src) {
                    try {
                      if (expectedFunctions.includes(key2) && typeof node.src[key2] === "string")
                        node.src[key2] = (0, eval)(`(${node.src[key2]})`);
                    } catch (e) {
                      __privateGet(this, _throw).call(this, {
                        message: `Field ${key2} could not be parsed`,
                        file: node.src[key2]
                      });
                    }
                  }
                }
              } else {
                console.warn(`Text is in ${language}, not JavaScript. This is not currently parsable automatically.`);
                __privateGet(this, _throw).call(this, {
                  message: `Source is in ${language}. Currently only JavaScript is supported.`,
                  file: ogSrc
                });
              }
            } else if (node[key]) {
              if (typeof node[key] === "object" && !Array.isArray(node[key])) {
                const optsCopy = Object.assign({}, options);
                optsCopy._deleteSrc = key !== "nodes" && name2 !== "graph";
                await this.resolve(node[key], info, optsCopy, { nodes: node[key] }, symbolsCopy, counter);
              }
            }
          }
        }
      }
      for (let name2 in nodes) {
        const node = nodes[name2];
        if (node?.src && typeof node?.src === "object") {
          if (node.src.graph)
            await this.load(node, info, options, id, symbolsRegistry[name2]);
          else if (edges) {
            if (!("default" in node.src)) {
              __privateGet(this, _throw).call(this, {
                message: "No default export.",
                node: name2
              });
            }
          }
          nodes[name2] = merge(node.src, node, options._deleteSrc);
          if (nodes[name2].src?.graph)
            nodes[name2].src.graph = JSON.parse(JSON.stringify(nodes[name2].graph));
        }
      }
      return target;
    };
    this.init = async (urlOrObject = __privateGet(this, _input), options = __privateGet(this, _options), url = "", symbols = [], counter = 0) => {
      if (options.debug)
        this.debug = { flow: {}, resolutions: {} };
      else
        this.debug = void 0;
      const internalLoadCall = options._internal;
      const isFromValidator = !__privateGet(this, _main) && typeof internalLoadCall === "string";
      if (!__privateGet(this, _input))
        __privateSet(this, _input, urlOrObject);
      if (!__privateGet(this, _options))
        __privateSet(this, _options, options);
      if (!__privateGet(this, _filesystem))
        __privateSet(this, _filesystem, options.filesystem);
      if (!internalLoadCall) {
        if (!url)
          url = __privateGet(this, _url);
        try {
          new URL(url ?? urlOrObject);
          options.relativeTo = "";
        } catch {
        }
      } else if (internalLoadCall === true)
        url = __privateGet(this, _main);
      if (isFromValidator)
        url = __privateSet(this, _main, internalLoadCall);
      const clonedOptions = Object.assign({}, options);
      const innerTopLevel = clonedOptions._top === true;
      const isString = typeof urlOrObject === "string";
      let mode, object, mainPath;
      if (typeof urlOrObject === "object") {
        object = Object.assign({}, urlOrObject);
        if (typeof internalLoadCall === "string")
          url = mainPath = resolve2(internalLoadCall);
        mode = "reference";
      } else if (url || isString) {
        if (!url)
          url = resolve2(urlOrObject, options.relativeTo ?? "");
        mode = "import";
      } else
        console.error("Mode is not supported...");
      if (!internalLoadCall)
        __privateSet(this, _mode, mode);
      mode = clonedOptions._modeOverride ?? __privateGet(this, _mode);
      this.errors.push(...valid(urlOrObject, clonedOptions, "load"));
      switch (mode) {
        case "reference":
          if (!innerTopLevel) {
            if (__privateGet(this, _filesystem)) {
              const pkgPath = resolve2(basePkgPath, url);
              const pkg = checkFiles(pkgPath, __privateGet(this, _filesystem));
              if (pkg)
                object = Object.assign(pkg, isString ? {} : object);
            }
          }
        default:
          if (!object) {
            mainPath = await resolve2(url);
            object = await this.get(mainPath, void 0);
            if (!innerTopLevel) {
              const pkgUrl = resolve2(basePkgPath, mainPath, true);
              const pkg = await this.get(pkgUrl, void 0);
              if (pkg)
                object = Object.assign(pkg, object);
            }
          }
      }
      if (!internalLoadCall)
        __privateSet(this, _main, mainPath);
      else if (__privateGet(this, _mode) === "reference" && !__privateGet(this, _main))
        __privateSet(this, _main, "");
      if (this.debug) {
        let target = this.debug.flow;
        symbols.forEach((str) => target = target[str]);
        target[mainPath] = {};
        symbols.push(mainPath);
        if (mainPath) {
          if (!this.debug.resolutions[mainPath])
            this.debug.resolutions[mainPath] = { _resolutions: 0, _depth: [], _time: [] };
          const res = this.debug.resolutions;
          res[mainPath]._resolutions++;
          res[mainPath]._depth.push(counter);
          res[mainPath]._time.push(Date.now() - startTime);
        }
      }
      if (this.errors.length === 0) {
        const nodes = object.graph.nodes;
        await this.resolve(nodes, {
          mainPath,
          url,
          object
        }, clonedOptions, object.graph, symbols, counter);
        const drill = (parent, callback) => {
          const nodes2 = parent.graph.nodes;
          for (let tag in nodes2) {
            const res = callback(nodes2[tag], {
              tag,
              parent,
              options: clonedOptions
            });
            if (res)
              nodes2[tag] = res;
          }
        };
        const drillToTest = (target) => {
          drill(target, (node, info) => {
            const edges = info.parent.graph.edges;
            for (let output in edges) {
              const getTarget = (o, str) => o.graph?.nodes?.[str] ?? o[str];
              let outTarget = info.parent.graph.nodes;
              output.split(".").forEach((str) => outTarget = getTarget(outTarget, str));
              if (!outTarget) {
                __privateGet(this, _throw).call(this, {
                  message: `Node '${output}' (output) does not exist to create an edge.`,
                  file: url
                });
              }
              for (let input in edges[output]) {
                let inTarget = nodes;
                input.split(".").forEach((str) => inTarget = getTarget(inTarget, str));
                if (!inTarget) {
                  __privateGet(this, _throw).call(this, {
                    message: `Node '${input}' (input) does not exist to create an edge.`,
                    file: url
                  });
                }
              }
            }
          });
        };
        if (internalLoadCall === void 0) {
          if (clonedOptions.output !== "object") {
            this.plugin = new src_default(object, {
              activate: clonedOptions.activate,
              parentNode: clonedOptions.parentNode
            });
            this.original = Object.assign({}, this.plugin.initial);
            let drillCopy = (target) => {
              if (target?.graph) {
                let graph = Object.assign({}, target.graph);
                let nodes2 = graph.nodes = Object.assign({}, graph.nodes);
                if (nodes2) {
                  for (let k in nodes2) {
                    nodes2[k] = Object.assign({}, nodes2[k].initial);
                    drillCopy(nodes2[k]);
                  }
                }
                target.graph = graph;
              }
            };
            drillCopy(this.original);
            return this.plugin;
          } else
            this.original = object;
          drillToTest(object);
        }
        return object;
      }
    };
    this.start = async () => {
      if (this.plugin)
        return await this.plugin.start();
    };
    this.stop = async () => {
      if (this.plugin)
        return await this.plugin.stop();
    };
    __privateSet(this, _input, urlOrObject);
    __privateSet(this, _options, options);
    __privateSet(this, _url, url);
  }
};
_filesystem = new WeakMap();
_input = new WeakMap();
_options = new WeakMap();
_url = new WeakMap();
_cache = new WeakMap();
_main = new WeakMap();
_mode = new WeakMap();
_onImport = new WeakMap();
_throw = new WeakMap();
var core_default = WASL;
export {
  core_default as default
};
