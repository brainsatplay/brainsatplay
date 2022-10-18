var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name4 in all)
    __defProp(target, name4, { get: all[name4], enumerable: true });
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
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

// src/core/external/wasl/index.esm.js
var __create = Object.create;
var __defProp2 = Object.defineProperty;
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
var __export2 = (target, all) => {
  for (var name22 in all)
    __defProp2(target, name22, { get: all[name22], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target, mod));
var __accessCheck2 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet2 = (obj, member, getter) => {
  __accessCheck2(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd2 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet2 = (obj, member, value, setter) => {
  __accessCheck2(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
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
        function BlobBuilderConstructor(ary, options2) {
          options2 = options2 || {};
          var bb = new BlobBuilder();
          mapArrayBufferViews(ary).forEach(function(part) {
            bb.append(part);
          });
          return options2.type ? bb.getBlob(options2.type) : bb.getBlob();
        }
        function BlobConstructor(ary, options2) {
          return new origBlob(mapArrayBufferViews(ary), options2 || {});
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
              var update3 = new Uint8Array(tlen);
              update3.set(target);
              target = update3;
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
          var create3 = Object.create || function(a) {
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
            var size2 = 0;
            var j = chunks.length;
            while (j--) {
              size2 += chunks[j].length;
            }
            var b = new Uint8Array(size2);
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
          Blob4.prototype.slice = function(start2, end, type8) {
            var slice = this._buffer.slice(start2 || 0, end || this._buffer.length);
            return new Blob4([slice], { type: type8 });
          };
          Blob4.prototype.toString = function() {
            return "[object Blob]";
          };
          function File2(chunks, name22, opts) {
            opts = opts || {};
            var a = Blob4.call(this, chunks, opts) || this;
            a.name = name22.replace(/\//g, ":");
            a.lastModifiedDate = opts.lastModified ? new Date(opts.lastModified) : new Date();
            a.lastModified = +a.lastModifiedDate;
            return a;
          }
          File2.prototype = create3(Blob4.prototype);
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
            var position2 = 0;
            var blob2 = this;
            return new ReadableStream({
              type: "bytes",
              autoAllocateChunkSize: 524288,
              pull: function(controller) {
                var v = controller.byobRequest.view;
                var chunk = blob2.slice(position2, position2 + v.byteLength);
                return chunk.arrayBuffer().then(function(buffer) {
                  var uint8array = new Uint8Array(buffer);
                  var bytesRead = uint8array.byteLength;
                  position2 += bytesRead;
                  v.set(uint8array);
                  controller.byobRequest.respond(bytesRead);
                  if (position2 >= blob2.size)
                    controller.close();
                });
              }
            });
          };
        } catch (e) {
          try {
            new ReadableStream({});
            stream = function stream2(blob2) {
              var position2 = 0;
              return new ReadableStream({
                pull: function(controller) {
                  var chunk = blob2.slice(position2, position2 + 524288);
                  return chunk.arrayBuffer().then(function(buffer) {
                    position2 += buffer.byteLength;
                    var uint8array = new Uint8Array(buffer);
                    controller.enqueue(uint8array);
                    if (position2 == blob2.size)
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
var browser_exports = {};
__export2(browser_exports, {
  default: () => browser_default
});
var import_blob_polyfill;
var browser_default;
var init_browser = __esm({
  "../../node_modules/cross-blob/browser.js"() {
    import_blob_polyfill = __toESM(require_Blob(), 1);
    browser_default = import_blob_polyfill.Blob;
  }
});
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
        function BlobBuilderConstructor(ary, options2) {
          options2 = options2 || {};
          var bb = new BlobBuilder();
          mapArrayBufferViews(ary).forEach(function(part) {
            bb.append(part);
          });
          return options2.type ? bb.getBlob(options2.type) : bb.getBlob();
        }
        function BlobConstructor(ary, options2) {
          return new origBlob(mapArrayBufferViews(ary), options2 || {});
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
              var update3 = new Uint8Array(tlen);
              update3.set(target);
              target = update3;
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
          var create3 = Object.create || function(a) {
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
            var size2 = 0;
            var j = chunks.length;
            while (j--) {
              size2 += chunks[j].length;
            }
            var b = new Uint8Array(size2);
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
          Blob4.prototype.slice = function(start2, end, type8) {
            var slice = this._buffer.slice(start2 || 0, end || this._buffer.length);
            return new Blob4([slice], { type: type8 });
          };
          Blob4.prototype.toString = function() {
            return "[object Blob]";
          };
          function File2(chunks, name22, opts) {
            opts = opts || {};
            var a = Blob4.call(this, chunks, opts) || this;
            a.name = name22.replace(/\//g, ":");
            a.lastModifiedDate = opts.lastModified ? new Date(opts.lastModified) : new Date();
            a.lastModified = +a.lastModifiedDate;
            return a;
          }
          File2.prototype = create3(Blob4.prototype);
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
            var position2 = 0;
            var blob2 = this;
            return new ReadableStream({
              type: "bytes",
              autoAllocateChunkSize: 524288,
              pull: function(controller) {
                var v = controller.byobRequest.view;
                var chunk = blob2.slice(position2, position2 + v.byteLength);
                return chunk.arrayBuffer().then(function(buffer) {
                  var uint8array = new Uint8Array(buffer);
                  var bytesRead = uint8array.byteLength;
                  position2 += bytesRead;
                  v.set(uint8array);
                  controller.byobRequest.respond(bytesRead);
                  if (position2 >= blob2.size)
                    controller.close();
                });
              }
            });
          };
        } catch (e) {
          try {
            new ReadableStream({});
            stream = function stream2(blob2) {
              var position2 = 0;
              return new ReadableStream({
                pull: function(controller) {
                  var chunk = blob2.slice(position2, position2 + 524288);
                  return chunk.arrayBuffer().then(function(buffer) {
                    position2 += buffer.byteLength;
                    var uint8array = new Uint8Array(buffer);
                    controller.enqueue(uint8array);
                    if (position2 == blob2.size)
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
var browser_exports2 = {};
__export2(browser_exports2, {
  default: () => browser_default2
});
var import_blob_polyfill2;
var browser_default2;
var init_browser2 = __esm({
  "node_modules/cross-blob/browser.js"() {
    import_blob_polyfill2 = __toESM(require_Blob2(), 1);
    browser_default2 = import_blob_polyfill2.Blob;
  }
});
var languages_exports = {};
__export2(languages_exports, {
  js: () => js,
  json: () => json
});
var js = ["js", "mjs", "cjs", "javascript"];
var json = ["json"];
var fullSuffix = (fileName = "") => fileName.split(".").slice(1);
var suffix = (fileName = "") => {
  const suffix22 = fullSuffix(fileName);
  return suffix22.join(".");
};
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
var getURL = (path) => {
  let url;
  try {
    url = new URL(path).href;
  } catch {
    url = get(path, globalThis.location.href);
  }
  return url;
};
var handleFetch = async (path, options2 = {}, progressCallback) => {
  if (!options2.mode)
    options2.mode = "cors";
  const url = getURL(path);
  const response = await fetchRemote(url, options2, progressCallback);
  if (!response)
    throw new Error("No response received.");
  const type8 = response.type.split(";")[0];
  return {
    url,
    type: type8,
    buffer: response.buffer
  };
};
var fetchRemote = async (url, options2 = {}, progressCallback) => {
  const response = await globalThis.fetch(url, options2);
  return new Promise(async (resolve3) => {
    if (response) {
      const type8 = response.headers.get("Content-Type");
      if (globalThis.REMOTEESM_NODE) {
        const buffer = await response.arrayBuffer();
        resolve3({ buffer, type: type8 });
      } else {
        const reader = response.body.getReader();
        const bytes = parseInt(response.headers.get("Content-Length"), 10);
        let bytesReceived = 0;
        let buffer = [];
        const processBuffer = async ({ done, value }) => {
          if (done) {
            const config2 = {};
            if (typeof type8 === "string")
              config2.type = type8;
            const blob = new Blob(buffer, config2);
            const ab = await blob.arrayBuffer();
            resolve3({ buffer: new Uint8Array(ab), type: type8 });
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
      console.warn("Response not received!", options2.headers);
      resolve3(void 0);
    }
  });
};
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
  } catch (err3) {
    console.log(err3);
    reject(err3);
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
  const ref2 = {};
  for (let key in imported) {
    Object.defineProperty(ref2, key, {
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
        let ref2 = uriCollection[dependentFilePath];
        if (!ref2) {
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
var cache = {};
var get2 = async (relPath, relativeTo = "", onImport) => {
  let type8 = suffix(relPath);
  const isJSON = !type8 || type8.includes("json");
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
var valid = (input, options2, location) => {
  const errors = [];
  const isUndefined = options2?.relativeTo === void 0;
  const isString = typeof input === "string";
  const isObject = typeof input === "object";
  let error;
  if (isString) {
    const hasRelTo = !isUndefined && "relativeTo" in options2;
    if (!hasRelTo && !options2._remote) {
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
var isSrc = (str) => {
  return typeof str === "string" && Object.values(languages_exports).find((arr) => arr.includes(str.split(".").slice(-1)[0]));
};
var merge = (main2, override, deleteSrc = false) => {
  const copy = Object.assign({}, main2);
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
  } catch (err3) {
    console.log(err3);
    reject(err3);
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
  const ref2 = {};
  for (let key in imported) {
    Object.defineProperty(ref2, key, {
      get: () => imported[key],
      enumerable: true
    });
  }
  collection[path] = uri;
  return imported;
};
var resolve2 = get3;
function parseFunctionFromText(method2 = "") {
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
  let newFuncHead = getFunctionHead(method2);
  let newFuncBody = getFunctionBody(method2);
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
  } catch (err3) {
    console.error(err3);
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
  constructor() {
    super();
    __publicField(this, "template", function(self2 = this, props) {
      return `<div> Custom Fragment Props: ${JSON.stringify(props)} </div>`;
    });
    __publicField(this, "props", {});
    __publicField(this, "useShadow", false);
    __publicField(this, "styles");
    __publicField(this, "oncreate");
    __publicField(this, "onresize");
    __publicField(this, "ondelete");
    __publicField(this, "onchanged");
    __publicField(this, "renderonchanged", false);
    __publicField(this, "FRAGMENT");
    __publicField(this, "STYLE");
    __publicField(this, "attachedShadow", false);
    __publicField(this, "obsAttributes", ["props", "options", "onchanged", "onresize", "ondelete", "oncreate", "template"]);
    __publicField(this, "attributeChangedCallback", (name22, old, val) => {
      if (name22 === "onchanged") {
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
      } else if (name22 === "onresize") {
        let onresize = val;
        if (typeof onresize === "string")
          onresize = parseFunctionFromText2(onresize);
        if (typeof onresize === "function") {
          if (this.ONRESIZE) {
            try {
              window.removeEventListener("resize", this.ONRESIZE);
            } catch (err3) {
            }
          }
          this.ONRESIZE = (ev) => {
            this.onresize(this.props, this);
          };
          this.onresize = onresize;
          window.addEventListener("resize", this.ONRESIZE);
        }
      } else if (name22 === "ondelete") {
        let ondelete2 = val;
        if (typeof ondelete2 === "string")
          ondelete2 = parseFunctionFromText2(ondelete2);
        if (typeof ondelete2 === "function") {
          this.ondelete = () => {
            if (this.ONRESIZE)
              window.removeEventListener("resize", this.ONRESIZE);
            this.state.unsubscribeTrigger("props");
            if (ondelete2)
              ondelete2(this.props, this);
          };
        }
      } else if (name22 === "oncreate") {
        let oncreate2 = val;
        if (typeof oncreate2 === "string")
          oncreate2 = parseFunctionFromText2(oncreate2);
        if (typeof oncreate2 === "function") {
          this.oncreate = oncreate2;
        }
      } else if (name22 === "renderonchanged") {
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
      } else if (name22 === "props") {
        let newProps = val;
        if (typeof newProps === "string")
          newProps = JSON.parse(newProps);
        Object.assign(this.props, newProps);
        this.state.setState({ props: this.props });
      } else if (name22 === "template") {
        let template = val;
        this.template = template;
        this.render(this.props);
        let created = new CustomEvent("created", { detail: { props: this.props } });
        this.dispatchEvent(created);
      } else {
        let parsed = val;
        if (name22.includes("eval_")) {
          name22 = name22.split("_");
          name22.shift();
          name22 = name22.join();
          parsed = parseFunctionFromText2(val);
        } else if (typeof val === "string") {
          try {
            parsed = JSON.parse(val);
          } catch (err3) {
            parsed = val;
          }
        }
        this[name22] = parsed;
        if (name22 !== "props" && this.props)
          this.props[name22] = parsed;
      }
    });
    __publicField(this, "delete", () => {
      this.remove();
      if (typeof this.ondelete === "function")
        this.ondelete(this.props);
    });
    __publicField(this, "render", (props = this.props) => {
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
    });
    __publicField(this, "state", {
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
    });
  }
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
  connectedCallback() {
    if (!this.props)
      this.props = {};
    let newProps = this.getAttribute("props");
    if (typeof newProps === "string")
      newProps = JSON.parse(newProps);
    Object.assign(this.props, newProps);
    this.state.setState({ props: this.props });
    Array.from(this.attributes).forEach((att) => {
      let name22 = att.name;
      let parsed = att.value;
      if (name22.includes("eval_") || name22.includes("()")) {
        if (name22.includes("eval_"))
          name22 = name22.split("_");
        else if (name22.includes("()"))
          name22 = name22.substring(0, name22.indexOf("("));
        name22.shift();
        name22 = name22.join();
        parsed = parseFunctionFromText2(att.value);
      } else if (typeof att.value === "string") {
        try {
          parsed = JSON.parse(att.value);
        } catch (err3) {
          parsed = att.value;
        }
      }
      if (!this[name22]) {
        Object.defineProperties(this, att, {
          value: parsed,
          writable: true,
          get() {
            return this[name22];
          },
          set(val) {
            this.setAttribute(name22, val);
          }
        });
      }
      this[name22] = parsed;
      if (name22 !== "props")
        this.props[name22] = parsed;
      this.obsAttributes.push(name22);
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
        } catch (err3) {
        }
      }
      this.ONRESIZE = (ev) => {
        this.onresize(this, this.props);
        this.dispatchEvent(resizeevent);
      };
      window.addEventListener("resize", this.ONRESIZE);
    }
    if (typeof this.ondelete === "function") {
      let ondelete2 = this.ondelete;
      this.ondelete = (props = this.props) => {
        if (this.ONRESIZE)
          window.removeEventListener("resize", this.ONRESIZE);
        this.state.unsubscribeTrigger("props");
        this.dispatchEvent(deleted);
        ondelete2(this, props);
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
  set ondelete(ondelete2) {
    this.setAttribute("ondelete", ondelete2);
  }
  get oncreate() {
    return this.oncreate;
  }
  set oncreate(oncreate2) {
    this.setAttribute("oncreated", oncreate2);
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
  } catch (err3) {
  }
}
function parseFunctionFromText2(method2) {
  let getFunctionBody = (methodString) => {
    return methodString.replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i, "$2$3$4");
  };
  let getFunctionHead = (methodString) => {
    let startindex = methodString.indexOf(")");
    return methodString.slice(0, methodString.indexOf("{", startindex) + 1);
  };
  let newFuncHead = getFunctionHead(method2);
  let newFuncBody = getFunctionBody(method2);
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
        } catch (err3) {
          newFunc = (0, eval)(method2);
        }
      }
    }
  } catch (err3) {
  }
  return newFunc;
}
var Service = class extends Graph {
  constructor(options2 = {}) {
    super(void 0, options2.name ? options2.name : `service${Math.floor(Math.random() * 1e14)}`, options2.props);
    this.routes = {};
    this.loadDefaultRoutes = false;
    this.keepState = true;
    this.firstLoad = true;
    this.customRoutes = {};
    this.customChildren = {};
    this.init = (options22) => {
      if (options22)
        options22 = Object.assign({}, options22);
      else
        options22 = {};
      if (options22.customRoutes)
        Object.assign(options22.customRoutes, this.customRoutes);
      else
        options22.customRoutes = this.customRoutes;
      if (options22.customChildren)
        Object.assign(options22.customChildren, this.customChildren);
      else
        options22.customChildren = this.customChildren;
      if (Array.isArray(options22.routes)) {
        options22.routes.forEach((r) => {
          this.load(r, options22.includeClassName, options22.routeFormat, options22.customRoutes, options22.customChildren, options22.sharedState);
        });
      } else if (options22.routes || (Object.keys(this.routes).length > 0 || this.loadDefaultRoutes) && this.firstLoad)
        this.load(options22.routes, options22.includeClassName, options22.routeFormat, options22.customRoutes, options22.customChildren, options22.sharedState);
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
            let name22 = service.name;
            if (!name22) {
              name22 = service.tag;
              service.name = name22;
            }
            if (!name22) {
              name22 = `graph${Math.floor(Math.random() * 1e15)}`;
              service.name = name22;
              service.tag = name22;
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
          let name22 = routes.constructor.name;
          if (name22 === "Object") {
            name22 = Object.prototype.toString.call(routes);
            if (name22)
              name22 = name22.split(" ")[1];
            if (name22)
              name22 = name22.split("]")[0];
          }
          if (name22 && name22 !== "Object") {
            let module = routes;
            routes = {};
            Object.getOwnPropertyNames(module).forEach((route) => {
              if (includeClassName)
                routes[name22 + routeFormat + route] = module[route];
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
    this.handleMethod = (route, method2, args) => {
      let m = method2.toLowerCase();
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
        return this.handleServiceMessage({ route, args, method: method2 });
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
    this.pipe = (source, destination, endpoint, method2, callback) => {
      if (source instanceof GraphNode) {
        if (callback)
          return source.subscribe((res) => {
            let mod = callback(res);
            if (mod !== void 0)
              this.transmit({ route: destination, args: mod, method: method2 });
            else
              this.transmit({ route: destination, args: res, method: method2 }, endpoint);
          });
        else
          return this.subscribe(source, (res) => {
            this.transmit({ route: destination, args: res, method: method2 }, endpoint);
          });
      } else if (typeof source === "string")
        return this.subscribe(source, (res) => {
          this.transmit({ route: destination, args: res, method: method2 }, endpoint);
        });
    };
    this.pipeOnce = (source, destination, endpoint, method2, callback) => {
      if (source instanceof GraphNode) {
        if (callback)
          return source.state.subscribeTriggerOnce(source.tag, (res) => {
            let mod = callback(res);
            if (mod !== void 0)
              this.transmit({ route: destination, args: mod, method: method2 });
            else
              this.transmit({ route: destination, args: res, method: method2 }, endpoint);
          });
        else
          return this.state.subscribeTriggerOnce(source.tag, (res) => {
            this.transmit({ route: destination, args: res, method: method2 }, endpoint);
          });
      } else if (typeof source === "string")
        return this.state.subscribeTriggerOnce(source, (res) => {
          this.transmit({ route: destination, args: res, method: method2 }, endpoint);
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
    if (options2.name)
      this.name = options2.name;
    else
      options2.name = this.tag;
    if ("loadDefaultRoutes" in options2) {
      this.loadDefaultRoutes = options2.loadDefaultRoutes;
      this.routes = Object.assign(this.defaultRoutes, this.routes);
    }
    if (options2 || Object.keys(this.routes).length > 0)
      this.init(options2);
  }
  handleServiceMessage(message) {
    let call2;
    if (typeof message === "object") {
      if (message.route)
        call2 = message.route;
      else if (message.node)
        call2 = message.node;
    }
    if (call2) {
      if (Array.isArray(message.args))
        return this.run(call2, ...message.args);
      else
        return this.run(call2, message.args);
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
  spliceTypedArray(arr, start2, end) {
    let s = arr.subarray(0, start2);
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
  constructor(options2, parentNode, interpreters) {
    super({ props: options2?.props, name: options2?.name ? options2.name : `dom${Math.floor(Math.random() * 1e15)}` });
    this.loadDefaultRoutes = false;
    this.keepState = true;
    this.parentNode = document.body;
    this.interpreters = {
      md: (template, options22) => {
        if (typeof markdownit === "undefined") {
          document.head.insertAdjacentHTML("beforeend", `
                    <script src='https://unpkg.com/markdown-it@latest/dist/markdown-it.min.js'><\/script>`);
        }
        let md = globalThis.markdownit();
        let html = md.render(template);
        options22.template = html;
      },
      jsx: (template, options22) => {
        if (!options22.parentNode)
          options22.parentNode = this.parentNode;
        if (typeof options22.parentNode === "string")
          options22.parentNode = document.getElementById(options22.parentNode);
        if (typeof ReactDOM === "undefined") {
          document.head.insertAdjacentHTML("beforeend", `
                    <script src='https://unpkg.com/react@latest/umd/react.production.min.js'><\/script>
                    <script src='https://unpkg.com/react-dom@latest/umd/react-dom.production.min.js'><\/script>`);
        }
        options22.template = "";
        let onrender = options22.onrender;
        options22.onrender = (self2, info) => {
          const modal = ReactDOM.createPortal(template, options22.id);
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
    this.addElement = (options22, generateChildElementNodes = false) => {
      let elm = this.createElement(options22);
      if (!options22.element)
        options22.element = elm;
      if (!options22.operator)
        options22.operator = function(props) {
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
      let node = this.resolveGraphNode(elm, options22);
      let divs = Array.from(elm.querySelectorAll("*"));
      if (generateChildElementNodes) {
        divs = divs.map((d, i) => this.addElement({ element: d }));
      }
      this.elements[options22.id] = { element: elm, node, parentNode: options22.parentNode, divs };
      if (!node.ondelete)
        node.ondelete = (node2) => {
          elm.remove();
          if (options22.onremove)
            options22.onremove.call(this.elements[options22.id].node, elm, this.elements[options22.id]);
        };
      if (options22.onresize) {
        let onresize = options22.onresize;
        options22.onresize = (ev) => {
          onresize.call(this.elements[options22.id].node, ev, elm, this.elements[options22.id]);
        };
        window.addEventListener("resize", options22.onresize);
      }
      return this.elements[options22.id];
    };
    this.createElement = (options22) => {
      let elm;
      if (options22.element) {
        if (typeof options22.element === "string") {
          elm = document.querySelector(options22.element);
          if (!elm)
            elm = document.getElementById(options22.element);
        } else
          elm = options22.element;
      } else if (options22.tagName)
        elm = document.createElement(options22.tagName);
      else if (options22.id && document.getElementById(options22.id))
        elm = document.getElementById(options22.id);
      if (!elm)
        return void 0;
      this.updateOptions(options22, elm);
      return elm;
    };
    this.updateOptions = (options22, element) => {
      if (!options22.id && options22.tag)
        options22.id = options22.tag;
      if (!options22.tag && options22.id)
        options22.tag = options22.id;
      if (!options22.id)
        options22.id = `${options22.tagName ?? "element"}${Math.floor(Math.random() * 1e15)}`;
      let p = options22.parentNode;
      delete options22.parentNode;
      Object.defineProperty(options22, "parentNode", {
        get: function() {
          return element.parentNode;
        },
        set: (v) => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
          this.resolveParentNode(element, v ? v : this.parentNode, options22, options22.onrender);
        },
        enumerable: true,
        configurable: true
      });
      options22.parentNode = p ? p : this.parentNode;
      element.id = options22.id;
      if (options22.style)
        Object.assign(element.style, options22.style);
      if (options22.attributes) {
        for (let key in options22.attributes) {
          if (typeof options22.attributes[key] === "function")
            element[key] = (...args) => options22.attributes[key](...args);
          else
            element[key] = options22.attributes[key];
        }
      }
      if (!options22.attributes?.innerHTML && options22.innerHTML) {
        element.innerHTML = options22.innerHTML;
      } else if (!options22.attributes?.innerText && options22.innerText) {
        element.innerText = options22.innerText;
      }
      return options22;
    };
    this.resolveParentNode = (elm, parentNode2, options22, oncreate2) => {
      if (!elm.parentNode) {
        setTimeout(() => {
          if (typeof parentNode2 === "string")
            parentNode2 = document.getElementById(parentNode2);
          if (parentNode2 && typeof parentNode2 === "object") {
            parentNode2.appendChild(elm);
          }
          if (oncreate2)
            oncreate2.call(elm.node, elm, this.elements[options22.id]);
          if (elm.node.animation || elm.node.animate) {
            elm.node.runAnimation();
          }
          if (elm.node.looper || typeof elm.node.loop === "number" && elm.node.loop) {
            elm.node.runLoop();
          }
        }, 0.01);
      }
    };
    this.resolveGraphNode = (element, options22) => {
      let node;
      if (this.nodes.get(options22.id)?.element?.parentNode?.id === options22.parentNode || this.nodes.get(options22.id)?.parentNode === options22.parentNode) {
        node = this.nodes.get(options22.id);
      } else {
        let parentId = options22.parentNode instanceof HTMLElement ? options22.parentNode?.id : typeof options22.parentNode === "string" ? options22.parentNode : void 0;
        let parent;
        if (parentId)
          parent = this.nodes.get(parentId);
        node = new GraphNode(options22 instanceof Graph ? options22 : Object.assign({}, options22), parent, this);
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
          this.resolveParentNode(element, v ? v : this.parentNode, options22, options22.onrender);
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
      const initialOptions = options22._initial ?? options22;
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
    this.addComponent = (options22, generateChildElementNodes = true) => {
      if (options22.onrender) {
        let oncreate2 = options22.onrender;
        options22.onrender = (element) => {
          oncreate2.call(element.node, element, options22);
        };
      }
      if (options22.onresize) {
        let onresize = options22.onresize;
        options22.onresize = (element) => {
          onresize.call(element.node, element, options22);
        };
      }
      if (options22.onremove) {
        let ondelete2 = options22.onremove;
        options22.onremove = (element) => {
          ondelete2.call(element.node, self, options22);
        };
      }
      if (typeof options22.renderonchanged === "function") {
        let renderonchanged = options22.renderonchanged;
        options22.renderonchanged = (element) => {
          renderonchanged.call(element.node, element, options22);
        };
      }
      if (options22.interpreter && options22.interpreter !== "wc") {
        this.interpreters[options22.interpreter](options22.template, options22);
      }
      class CustomElement extends DOMElement {
        constructor() {
          super(...arguments);
          this.props = options22.props;
          this.styles = options22.styles;
          this.useShadow = options22.useShadow;
          this.template = options22.template;
          this.oncreate = options22.onrender;
          this.onresize = options22.onresize;
          this.ondelete = options22.onremove;
          this.renderonchanged = options22.renderonchanged;
        }
      }
      if (!options22.tagName)
        options22.tagName = `custom-element${Math.random() * 1e15}`;
      CustomElement.addElement(options22.tagName);
      let elm = document.createElement(options22.tagName);
      let completeOptions = this.updateOptions(options22, elm);
      this.templates[completeOptions.id] = completeOptions;
      let divs = Array.from(elm.querySelectorAll("*"));
      if (generateChildElementNodes) {
        divs = divs.map((d) => this.addElement({ element: d }));
      }
      if (!options22.element)
        options22.element = elm;
      if (!options22.operator)
        options22.operator = function op(props) {
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
      let node = this.resolveGraphNode(elm, options22);
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
    this.addCanvasComponent = (options22) => {
      if (!options22.canvas) {
        options22.template = `<canvas `;
        if (options22.width)
          options22.template += `width="${options22.width}"`;
        if (options22.height)
          options22.template += `height="${options22.height}"`;
        options22.template += ` ></canvas>`;
      } else
        options22.template = options22.canvas;
      if (options22.onrender) {
        let oncreate2 = options22.onrender;
        options22.onrender = (element) => {
          oncreate2.call(element.node, element, options22);
        };
      }
      if (options22.onresize) {
        let onresize = options22.onresize;
        options22.onresize = (element) => {
          onresize.call(element.node, element, options22);
        };
      }
      if (options22.ondelete) {
        let ondelete2 = options22.onremove;
        options22.onremove = (element) => {
          ondelete2.call(element.node, element, options22);
        };
      }
      if (typeof options22.renderonchanged === "function") {
        let renderonchanged = options22.renderonchanged;
        options22.renderonchanged = (element) => {
          renderonchanged.call(element.node, element, options22);
        };
      }
      class CustomElement extends DOMElement {
        constructor() {
          super(...arguments);
          this.props = options22.props;
          this.styles = options22.styles;
          this.template = options22.template;
          this.oncreate = options22.onrender;
          this.onresize = options22.onresize;
          this.ondelete = options22.onremove;
          this.renderonchanged = options22.renderonchanged;
        }
      }
      if (!options22.tagName)
        options22.tagName = `custom-element${Math.random() * 1e15}`;
      CustomElement.addElement(options22.tagName);
      let elm = document.createElement(options22.tagName);
      const completeOptions = this.updateOptions(options22, elm);
      let animation = () => {
        if (this.components[completeOptions.id]?.animating) {
          this.components[completeOptions.id].draw(this.components[completeOptions.id].element, this.components[completeOptions.id]);
          requestAnimationFrame(animation);
        }
      };
      this.templates[completeOptions.id] = completeOptions;
      if (!options22.element)
        options22.element = elm;
      if (!options22.operator)
        options22.operator = function op(props) {
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
      let node = this.resolveGraphNode(elm, options22);
      if (!node.ondelete)
        node.ondelete = (node2) => {
          elm.delete();
        };
      let canvas = elm.querySelector("canvas");
      if (completeOptions.style)
        Object.assign(canvas.style, completeOptions.style);
      let context;
      if (typeof completeOptions.context === "object")
        context = options22.context;
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
    if (options2?.parentNode)
      parentNode = options2.parentNode;
    if (typeof parentNode === "string")
      parentNode = document.getElementById(parentNode);
    if (parentNode instanceof HTMLElement)
      this.parentNode = parentNode;
    if (interpreters) {
      Object.assign(this.interpreters, interpreters);
    }
    this.init(options2);
  }
};
var Router = class extends Service {
  constructor(options2) {
    super(options2);
    this.name = "router";
    this.connections = {};
    this.sources = {};
    this.services = {};
    this.serviceConnections = {};
    this.users = {};
    this.addUser = async (info, connections, config2, receiving) => {
      if (!info._id) {
        info._id = `user${Math.floor(Math.random() * 1e15)}`;
      }
      let user = Object.assign({}, info);
      if (connections) {
        for (const key in connections) {
          if (typeof connections[key] === "object") {
            if (!connections[key].connection._id) {
              await new Promise((res, rej) => {
                let start2 = performance.now();
                let checker = () => {
                  if (!connections[key].connection._id) {
                    if (performance.now() - start2 > 3e3) {
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
      if (config2) {
        for (const c in config2) {
          this.openConnection(config2[c].service, config2[c], user._id, config2[c].args);
        }
      }
      let send = (message, ...a) => {
        let connection = this.getConnection(user._id, "send");
        if (connection?.send)
          return connection.send(message, ...a);
      };
      let request = (message, method2, ...a) => {
        let connection = this.getConnection(user._id, "request");
        if (connection?.request)
          return connection.request(message, method2, ...a);
      };
      let post = (route, args, method2, ...a) => {
        let connection = this.getConnection(user._id, "post");
        if (connection?.post)
          return connection.post(route, args, method2, ...a);
      };
      let run = (route, args, method2, ...a) => {
        let connection = this.getConnection(user._id, "run");
        if (connection?.run)
          return connection.run(route, args, method2, ...a);
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
    this.addConnection = (options22, source) => {
      let settings = {};
      if (typeof options22 === "string") {
        if (this.connections[options22]) {
          options22 = this.connections[options22];
        } else {
          for (const j in this.serviceConnections) {
            for (const k in this.serviceConnections[j]) {
              if (this.serviceConnections[j][k][options22]) {
                options22 = { connection: this.serviceConnections[j][k][options22] };
                options22.service = j;
                settings.connectionType = j;
                settings.connectionsKey = k;
                break;
              }
            }
          }
        }
        if (typeof options22 === "string" && this.nodes.get(options22))
          options22 = { connection: this.nodes.get(options22) };
      }
      if (!options22 || typeof options22 === "string")
        return void 0;
      if (source)
        settings.source = source;
      if (options22.connection instanceof GraphNode) {
        settings.connection = options22.connection;
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
        settings.request = async (message, method2) => {
          if (method2) {
            if (Array.isArray(message.args)) {
              return node[method2]?.(...message.args);
            } else
              return node[method2]?.(message.args);
          } else {
            if (Array.isArray(message.args)) {
              return node.run(...message.args);
            } else
              return node.run(message.args);
          }
        };
        settings.post = async (route, args, method2) => {
          if (route && node.get(route)) {
            let n = node.get(route);
            if (method2) {
              if (Array.isArray(args)) {
                return n[method2]?.(...args);
              } else
                return n[method2]?.(args);
            } else {
              if (Array.isArray(args)) {
                return n.run(...args);
              } else
                return n.run(args);
            }
          } else {
            if (method2) {
              if (Array.isArray(args)) {
                return node[method2]?.(...args);
              } else
                return node[method2]?.(args);
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
        settings.onclose = options22.onclose;
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
      } else if (options22.connection instanceof Graph) {
        if (options22.connection.nodes.get("open"))
          settings.service = options22.connection;
        let graph = settings.connection;
        settings.send = async (message) => {
          if (Array.isArray(message.args))
            graph.run(message.route, ...message.args);
          else
            graph.run(message.route, message.args);
        };
        settings.request = async (message, method2) => {
          if (!message.route)
            return void 0;
          if (method2) {
            if (Array.isArray(message.args)) {
              return graph.nodes.get(message.route)[method2]?.(...message.args);
            } else
              return graph.nodes.get(message.route)[method2]?.(message.args);
          } else {
            if (Array.isArray(message.args)) {
              return graph.run(message.route, ...message.args);
            } else
              return graph.run(message.route, message.args);
          }
        };
        settings.post = async (route, args, method2) => {
          if (route && graph.get(route)) {
            let n = graph.get(route);
            if (method2) {
              if (Array.isArray(args)) {
                return n[method2]?.(...args);
              } else
                return n[method2]?.(args);
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
      } else if (!(options22._id && this.connections[options22._id])) {
        let c = options22.connection;
        if (typeof c === "string") {
          if (this.connections[c])
            c = this.connections[c];
          else if (options22.service) {
            if (typeof options22.service === "string") {
              options22.service = this.services[options22.service];
            }
            if (typeof options22.service === "object") {
              if (options22.service.connections) {
                for (const key in options22.service.connections) {
                  if (options22.service.connections[key][c]) {
                    c = options22.service.connections[key][c];
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
                  options22.service = j;
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
        settings.onclose = options22.onclose;
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
        if (options22.service) {
          if (typeof options22.service === "string")
            options22.service = this.services[options22.service];
          settings.service = options22.service;
        } else if (c.graph)
          settings.service = c.graph;
      }
      if (!settings.source && options22.source) {
        settings.source = options22.source;
      } else if (!settings.source && options22.service) {
        settings.source = typeof options22.service === "object" ? options22.service.name : void 0;
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
    this.openConnection = async (service, options22, source, ...args) => {
      if (typeof service === "string") {
        service = this.services[service];
      }
      if (service instanceof Service) {
        let connection = service.run("open", options22, ...args);
        if (connection instanceof Promise) {
          return connection.then(async (info) => {
            if (!info._id) {
              await new Promise((res, rej) => {
                let start2 = performance.now();
                let checker = () => {
                  if (!info._id) {
                    if (performance.now() - start2 > 3e3) {
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
              let start2 = performance.now();
              let checker = () => {
                if (!connection._id) {
                  if (performance.now() - start2 > 3e3) {
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
      for (const name22 in this.services) {
        if ("users" in this.services[name22])
          this.services[name22].users = this.users;
        this.nodes.forEach((n, tag) => {
          if (!this.services[name22].nodes.get(n.tag)) {
            this.services[name22].nodes.set(n.tag, n);
          } else {
            if (!this.services[name22].nodes.get(tag) && n._UNIQUE !== this.services[name22].nodes.get(n.tag)._UNIQUE)
              this.services[name22].nodes.set(tag, n);
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
    if (options2) {
      if (options2.order)
        this.order = options2.order;
      if (options2.services) {
        for (const key in options2.services) {
          let opt = options2.services[key];
          if (opt instanceof Service) {
            opt.service.name = key;
            opt.service.tag = key;
            this.addService(opt.service, opt.connections, options2.includeClassName, options2.routeFormat, options2.syncServices);
          } else if (typeof opt === "function") {
            let service = new opt();
            service.name = key;
            service.tag = key;
            if (service)
              this.addService(service, service.connections, options2.includeClassName, options2.routeFormat, options2.syncServices);
          } else {
            if (typeof opt.service === "function") {
              let service = new opt.service({ name: key });
              service.name = key;
              service.tag = key;
              if (service)
                this.addService(service, void 0, options2.includeClassName, options2.routeFormat, options2.syncServices);
              opt.service = service;
            } else if (opt.service instanceof Service) {
              opt.service.name = key;
              opt.service.tag = key;
              this.addService(opt.service, void 0, options2.includeClassName, options2.routeFormat, options2.syncServices);
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
        let update3 = currentArg !== void 0 ? currentArg : target[proxy];
        target[proxy] = update3;
        if (!argO.spread)
          update3 = [update3];
        updatedArgs.push(...update3);
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
    let [name22, value] = v.split("=");
    name22 = name22.trim();
    name22 = name22.replace(/\d+$/, "");
    const spread = name22.includes("...");
    name22 = name22.replace("...", "");
    try {
      if (name22)
        info.set(name22, {
          state: value ? (0, eval)(`(${value})`) : value,
          spread
        });
    } catch (e) {
      info.set(name22, {});
      console.warn(`Argument ${name22} could not be parsed for`, fn.toString(), value);
    }
  });
  return info;
}
var parse_default = getFnParamInfo;
var isNode = "process" in globalThis;
var _initial, _options, _instance, _graph, _router, _cache, _plugins, _active, _toRun, _runProps, _createTree, _activate, _create, _runGraph, _runDefault, _a;
var ESPlugin = (_a = class {
  constructor(node, options2 = {}) {
    __privateAdd(this, _initial, void 0);
    __privateAdd(this, _options, void 0);
    __privateAdd(this, _instance, void 0);
    __privateAdd(this, _graph, void 0);
    __privateAdd(this, _router, void 0);
    __privateAdd(this, _cache, {});
    __privateAdd(this, _plugins, {});
    __privateAdd(this, _active, false);
    __publicField(this, "plugins", {});
    __privateAdd(this, _toRun, false);
    __privateAdd(this, _runProps, true);
    __privateAdd(this, _createTree, () => {
      let tree = {};
      for (let tag in __privateGet(this, _plugins)) {
        let thisNode = __privateGet(this, _plugins)[tag].graph;
        if (__privateGet(this, _cache)[tag]) {
          let gs = __privateGet(this, _cache)[tag].graph;
          const ref2 = gs.node ? gs.node : gs;
          thisNode = {};
          for (let key in ref2._initial)
            thisNode[key] = ref2[key];
          thisNode.tag = tag;
          gs.state.triggers = {};
        }
        tree[tag] = __privateGet(this, _create).call(this, tag, thisNode);
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
            __privateGet(this, _router).state.subscribeTrigger(resolved.tag, callback);
        } else
          listeningFor[output] = edges[output];
      }
      return tree;
    });
    __privateAdd(this, _activate, () => {
      if (this.initial.graph) {
        let tree = __privateGet(this, _createTree).call(this);
        const props = __privateGet(this, _instance) ?? this.initial;
        this.graph = isNode ? new Graph(tree, __privateGet(this, _options).tag, props) : new DOMService({ routes: tree, name: __privateGet(this, _options).tag, props: __privateGet(this, _runProps) ? props : void 0 }, __privateGet(this, _options).parentNode);
        __privateGet(this, _router).load(this.graph);
        for (let tag in __privateGet(this, _plugins)) {
          const cache2 = __privateGet(this, _cache)[tag];
          if (cache2)
            cache2.graph = tree[tag];
        }
      }
    });
    __publicField(this, "start", async (defer) => {
      if (__privateGet(this, _active) === false) {
        __privateSet(this, _active, true);
        const activateFuncs = [];
        for (let key in this.plugins) {
          const o = this.plugins[key];
          await o.start((f2) => {
            activateFuncs.push(f2);
          });
        }
        __privateGet(this, _activate).call(this);
        const f = async () => {
          for (let f2 of activateFuncs)
            await f2();
          if (__privateGet(this, _toRun))
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
            const nodes2 = Array.from(this.graph.nodes.values());
            firstNode = nodes2[0];
            lastNode = nodes2.slice(-1)[0];
          }
          if (lastNode)
            lastNode.subscribe((...args) => {
              for (let tag in lastNode.graph.children)
                __privateGet(this, _runGraph).call(this, lastNode.graph.children[tag], ...args);
            });
          if (firstNode)
            __privateGet(this, _initial).operator = async function(...args) {
              await firstNode.run(...args);
            };
        }
        if (typeof defer === "function")
          defer(f);
        else
          await f();
      }
    });
    __publicField(this, "stop", () => {
      if (__privateGet(this, _active) === true) {
        for (let k in this.nested)
          this.nested[k].stop();
        if (this.graph)
          this.graph.nodes.forEach((n) => {
            this.graph.removeTree(n);
            n.stopNode();
            this.graph.state.triggers = {};
          });
        __privateSet(this, _active, false);
      }
    });
    __privateAdd(this, _create, (tag, info) => {
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
                __privateSet(this, _toRun, true);
            } else {
              args.get(key).state = v;
              if (input === key)
                __privateSet(this, _toRun, true);
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
        __privateSet(this, _instance, gsIn);
        return transform_default(tag, gsIn);
      }
    });
    __privateAdd(this, _runGraph, async (graph = this.graph, ...args) => {
      if (graph instanceof Graph) {
        if (graph.node)
          return graph.node.run(...args);
        else {
          if (args.length === 0)
            return __privateGet(this, _runDefault).call(this, graph);
          else if (graph.nodes.has(args[0]))
            return graph.run(...args);
          else
            return __privateGet(this, _runDefault).call(this, graph, ...args);
        }
      } else
        return await graph.run(...args);
    });
    __privateAdd(this, _runDefault, (graph, ...args) => graph.run(graph.nodes.values().next().value, ...args));
    __publicField(this, "run", async (...args) => __privateGet(this, _runGraph).call(this, this.graph, ...args));
    __privateSet(this, _initial, node);
    __privateSet(this, _options, options2);
    __privateSet(this, _router, options2._router ? options2._router : options2._router = new Router({
      linkServices: false,
      includeClassName: false
    }));
    do {
      __privateSet(this, _initial, this.initial.initial ?? this.initial);
    } while (this.initial instanceof ESPlugin);
    const isFunction = typeof this.initial === "function";
    const hasDefault = "default" in this.initial;
    let hasGraph = !!node.graph;
    if (!hasDefault && !hasGraph) {
      let newNode = { graph: { nodes: {} } };
      for (let namedExport in node)
        newNode.graph.nodes[namedExport] = { default: node[namedExport] };
      __privateSet(this, _initial, newNode);
      hasGraph = true;
      __privateSet(this, _runProps, false);
    }
    if (hasDefault || isFunction) {
      this.graph = __privateGet(this, _create).call(this, options2.tag ?? "defaultESPluginTag", this.initial);
    }
    if (hasGraph) {
      const toNotify = [];
      const nodes2 = this.initial.graph.nodes;
      for (let tag in nodes2) {
        const node2 = nodes2[tag];
        if (!(node2 instanceof ESPlugin)) {
          const clonedOptions = Object.assign({}, Object.assign(options2));
          const plugin = new ESPlugin(node2, Object.assign(clonedOptions, { tag }));
          __privateGet(this, _plugins)[tag] = plugin;
          toNotify.push(plugin);
        } else
          __privateGet(this, _cache)[tag] = __privateGet(this, _plugins)[tag] = node2;
      }
      const thisTag = __privateGet(this, _options).tag;
      toNotify.forEach((o) => {
        let tag = __privateGet(o, _options).tag;
        if (thisTag)
          tag = `${thisTag}.${tag}`;
        this.plugins[__privateGet(o, _options).tag] = o;
        if (typeof options2.onPlugin === "function")
          options2.onPlugin(tag, o);
      });
    }
    Object.defineProperty(this, "tag", {
      get: () => this.graph?.tag,
      enumerable: true
    });
  }
  get initial() {
    return __privateGet(this, _initial);
  }
  get instance() {
    return __privateGet(this, _instance);
  }
  get graph() {
    return __privateGet(this, _graph);
  }
  set graph(v) {
    __privateSet(this, _graph, v);
  }
}, _initial = new WeakMap(), _options = new WeakMap(), _instance = new WeakMap(), _graph = new WeakMap(), _router = new WeakMap(), _cache = new WeakMap(), _plugins = new WeakMap(), _active = new WeakMap(), _toRun = new WeakMap(), _runProps = new WeakMap(), _createTree = new WeakMap(), _activate = new WeakMap(), _create = new WeakMap(), _runGraph = new WeakMap(), _runDefault = new WeakMap(), _a);
var src_default = ESPlugin;
var basePkgPath = "./package.json";
var startTime = Date.now();
var _filesystem;
var _input;
var _options2;
var _url;
var _cache2;
var _main;
var _mode;
var _onImport;
var _throw;
var WASL = class {
  constructor(urlOrObject, options2 = {}, url) {
    this.errors = [];
    this.warnings = [];
    this.files = {};
    this.original = {};
    this.debug = void 0;
    __privateAdd2(this, _filesystem, void 0);
    __privateAdd2(this, _input, {});
    __privateAdd2(this, _options2, {});
    __privateAdd2(this, _url, void 0);
    __privateAdd2(this, _cache2, {});
    __privateAdd2(this, _main, "");
    __privateAdd2(this, _mode, "import");
    __privateAdd2(this, _onImport, (path, info) => this.files[path] = info);
    __privateAdd2(this, _throw, (e) => {
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
      return await get_default(args[0], args[1], __privateGet2(this, _onImport)).catch((e) => __privateGet2(this, _throw).call(this, {
        message: e.message,
        file: path
      }));
    };
    this.load = async (node, info, options3, id, symbols, counter) => {
      if (node.plugins) {
        for (let nestedName in node.plugins) {
          const nestedNode = node.src.graph?.nodes?.[nestedName];
          for (let key in node.plugins[nestedName]) {
            const newInfo = node.plugins[nestedName][key];
            if (typeof newInfo === "object" && !Array.isArray(newInfo)) {
              const ogSrc = newInfo.src;
              let newInfoForNode;
              if (id)
                newInfoForNode = __privateGet2(this, _cache2)[id]?.[key];
              if (!newInfoForNode) {
                const optsCopy = Object.assign({}, options3);
                if (key === "graph")
                  optsCopy._deleteSrc = false;
                else
                  optsCopy._deleteSrc = true;
                newInfoForNode = await this.resolve({ [key]: newInfo }, info, optsCopy, {
                  nodes: newInfo
                }, symbols, counter);
                if (id) {
                  if (!__privateGet2(this, _cache2)[id])
                    __privateGet2(this, _cache2)[id] = {};
                  __privateGet2(this, _cache2)[id][key] = newInfoForNode;
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
                  __privateGet2(this, _throw).call(this, { message: `Could not resolve ${ogSrc}` });
                }
              }
            } else if (nestedNode)
              nestedNode[key] = newInfo;
          }
          if (node.src.graph && !nestedNode) {
            __privateGet2(this, _throw).call(this, {
              message: `Plugin target '${nestedName}' does not exist`,
              node: name
            });
          }
        }
      }
    };
    this.resolve = async (target, info, options3, graph = {}, symbols = [], counter) => {
      const nodes2 = graph.nodes;
      const edges = graph.edges;
      counter++;
      const id = Symbol("unique");
      let { url: url2 } = info;
      const mainPath = info.mainPath || __privateGet2(this, _main);
      const symbolsRegistry = {};
      for (let name22 in target) {
        let symbolsCopy = symbolsRegistry[name22] = [...symbols];
        const node = target[name22];
        const isObj = node && typeof node === "object" && !Array.isArray(node);
        if (isObj) {
          await this.load(node, info, options3, id, symbolsCopy, counter);
          let ogSrc = node.src ?? "";
          if (isSrc(ogSrc) || nodes2 && edges && !ogSrc) {
            node.src = null;
            let _internal = "";
            let _modeOverride = options3._modeOverride;
            let fullPath;
            try {
              new URL(ogSrc);
              if (!options3._overrideRemote || options3._modeOverride === "import") {
                _modeOverride = "import";
                _internal = fullPath = ogSrc;
              } else
                fullPath = `${ogSrc.split("://").slice(1).join("/")}`;
            } catch {
              if (ogSrc)
                fullPath = mainPath ? resolve2(ogSrc, mainPath) : resolve2(ogSrc);
            }
            let mode = options3._modeOverride ?? __privateGet2(this, _mode);
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
                if (!this.debug.resolutions[name22])
                  this.debug.resolutions[name22] = {};
                let nameRes = this.debug.resolutions[name22];
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
                  remove(ogSrc, fullPath, name22, target);
              } else {
                if (__privateGet2(this, _filesystem)) {
                  let res;
                  res = checkFiles(fullPath, __privateGet2(this, _filesystem));
                  if (res) {
                    if (res.default || fullPath.includes(".json"))
                      node.src = res;
                    else {
                      __privateGet2(this, _throw).call(this, {
                        type: "warning",
                        message: `Node (${name22}) at ${fullPath} does not have a default export.`,
                        file: ogSrc
                      });
                      node.src = { default: res };
                    }
                    _internal = fullPath;
                  } else if (ogSrc)
                    remove(ogSrc, fullPath, name22, target);
                } else {
                  __privateGet2(this, _throw).call(this, {
                    message: "No options.filesystem field to get JavaScript objects",
                    file: ogSrc
                  });
                }
              }
            }
            if (!_internal)
              _internal = ogSrc ? resolve2(ogSrc, url2, true) : true;
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
                _deleteSrc: options3._deleteSrc,
                _top,
                _modeOverride,
                _overrideRemote: options3._overrideRemote
              }, void 0, symbolsCopy, counter);
            } else
              symbolsCopy.push(fullPath);
          }
          for (let key in node) {
            if (!isObj && key === "src" && node.src) {
              const language = node.src.language;
              if (!language || js.includes(language)) {
                if (node.src.text) {
                  const esmImport2 = async (text) => {
                    try {
                      let imported = await importFromText2(text);
                      if (imported.default && Object.keys(imported).length === 1)
                        imported = imported.default;
                      return imported;
                    } catch (e) {
                      console.error("Import did not work. Probably relies on something...");
                      __privateGet2(this, _throw).call(this, {
                        message: e.message,
                        file: name22
                      });
                    }
                  };
                  const esm3 = await esmImport2(node.src.text);
                  if (esm3) {
                    delete node.src.text;
                    if (typeof esm3 === "object")
                      node.src = { default: Object.assign(node.src, esm3) };
                    else
                      node.src = esm3;
                  } else {
                    __privateGet2(this, _throw).call(this, {
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
                      __privateGet2(this, _throw).call(this, {
                        message: `Field ${key2} could not be parsed`,
                        file: node.src[key2]
                      });
                    }
                  }
                }
              } else {
                console.warn(`Text is in ${language}, not JavaScript. This is not currently parsable automatically.`);
                __privateGet2(this, _throw).call(this, {
                  message: `Source is in ${language}. Currently only JavaScript is supported.`,
                  file: ogSrc
                });
              }
            } else if (node[key]) {
              if (typeof node[key] === "object" && !Array.isArray(node[key])) {
                const optsCopy = Object.assign({}, options3);
                optsCopy._deleteSrc = key !== "nodes" && name22 !== "graph";
                await this.resolve(node[key], info, optsCopy, { nodes: node[key] }, symbolsCopy, counter);
              }
            }
          }
        }
      }
      for (let name22 in nodes2) {
        const node = nodes2[name22];
        if (node?.src && typeof node?.src === "object") {
          if (node.src.graph)
            await this.load(node, info, options3, id, symbolsRegistry[name22]);
          else if (edges) {
            if (!("default" in node.src)) {
              __privateGet2(this, _throw).call(this, {
                message: "No default export.",
                node: name22
              });
            }
          }
          nodes2[name22] = merge(node.src, node, options3._deleteSrc);
          if (nodes2[name22].src?.graph)
            nodes2[name22].src.graph = JSON.parse(JSON.stringify(nodes2[name22].graph));
        }
      }
      return target;
    };
    this.init = async (urlOrObject2 = __privateGet2(this, _input), options3 = __privateGet2(this, _options2), url2 = "", symbols = [], counter = 0) => {
      if (options3.debug)
        this.debug = { flow: {}, resolutions: {} };
      else
        this.debug = void 0;
      const internalLoadCall = options3._internal;
      const isFromValidator = !__privateGet2(this, _main) && typeof internalLoadCall === "string";
      if (!__privateGet2(this, _input))
        __privateSet2(this, _input, urlOrObject2);
      if (!__privateGet2(this, _options2))
        __privateSet2(this, _options2, options3);
      if (!__privateGet2(this, _filesystem))
        __privateSet2(this, _filesystem, options3.filesystem);
      if (!internalLoadCall) {
        if (!url2)
          url2 = __privateGet2(this, _url);
        try {
          new URL(url2 ?? urlOrObject2);
          options3.relativeTo = "";
        } catch {
        }
      } else if (internalLoadCall === true)
        url2 = __privateGet2(this, _main);
      if (isFromValidator)
        url2 = __privateSet2(this, _main, internalLoadCall);
      const clonedOptions = Object.assign({}, options3);
      const innerTopLevel = clonedOptions._top === true;
      const isString = typeof urlOrObject2 === "string";
      let mode, object, mainPath;
      if (typeof urlOrObject2 === "object") {
        object = Object.assign({}, urlOrObject2);
        if (typeof internalLoadCall === "string")
          url2 = mainPath = resolve2(internalLoadCall);
        mode = "reference";
      } else if (url2 || isString) {
        if (!url2)
          url2 = resolve2(urlOrObject2, options3.relativeTo ?? "");
        mode = "import";
      } else
        console.error("Mode is not supported...");
      if (!internalLoadCall)
        __privateSet2(this, _mode, mode);
      mode = clonedOptions._modeOverride ?? __privateGet2(this, _mode);
      this.errors.push(...valid(urlOrObject2, clonedOptions, "load"));
      switch (mode) {
        case "reference":
          if (!innerTopLevel) {
            if (__privateGet2(this, _filesystem)) {
              const pkgPath = resolve2(basePkgPath, url2);
              const pkg = checkFiles(pkgPath, __privateGet2(this, _filesystem));
              if (pkg)
                object = Object.assign(pkg, isString ? {} : object);
            }
          }
        default:
          if (!object) {
            mainPath = await resolve2(url2);
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
        __privateSet2(this, _main, mainPath);
      else if (__privateGet2(this, _mode) === "reference" && !__privateGet2(this, _main))
        __privateSet2(this, _main, "");
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
        const nodes2 = object.graph.nodes;
        await this.resolve(nodes2, {
          mainPath,
          url: url2,
          object
        }, clonedOptions, object.graph, symbols, counter);
        const drill = (parent, callback) => {
          const nodes22 = parent.graph.nodes;
          for (let tag in nodes22) {
            const res = callback(nodes22[tag], {
              tag,
              parent,
              options: clonedOptions
            });
            if (res)
              nodes22[tag] = res;
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
                __privateGet2(this, _throw).call(this, {
                  message: `Node '${output}' (output) does not exist to create an edge.`,
                  file: url2
                });
              }
              for (let input in edges[output]) {
                let inTarget = nodes2;
                input.split(".").forEach((str) => inTarget = getTarget(inTarget, str));
                if (!inTarget) {
                  __privateGet2(this, _throw).call(this, {
                    message: `Node '${input}' (input) does not exist to create an edge.`,
                    file: url2
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
                let nodes22 = graph.nodes = Object.assign({}, graph.nodes);
                if (nodes22) {
                  for (let k in nodes22) {
                    nodes22[k] = Object.assign({}, nodes22[k].initial);
                    drillCopy(nodes22[k]);
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
    __privateSet2(this, _input, urlOrObject);
    __privateSet2(this, _options2, options2);
    __privateSet2(this, _url, url);
  }
};
_filesystem = /* @__PURE__ */ new WeakMap();
_input = /* @__PURE__ */ new WeakMap();
_options2 = /* @__PURE__ */ new WeakMap();
_url = /* @__PURE__ */ new WeakMap();
_cache2 = /* @__PURE__ */ new WeakMap();
_main = /* @__PURE__ */ new WeakMap();
_mode = /* @__PURE__ */ new WeakMap();
_onImport = /* @__PURE__ */ new WeakMap();
_throw = /* @__PURE__ */ new WeakMap();
var core_default = WASL;

// src/core/external/freerange/index.esm.js
var __create2 = Object.create;
var __defProp3 = Object.defineProperty;
var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames2 = Object.getOwnPropertyNames;
var __getProtoOf2 = Object.getPrototypeOf;
var __hasOwnProp2 = Object.prototype.hasOwnProperty;
var __esm2 = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames2(fn)[0]])(fn = 0)), res;
};
var __commonJS2 = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames2(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export3 = (target, all) => {
  for (var name22 in all)
    __defProp3(target, name22, { get: all[name22], enumerable: true });
};
var __copyProps2 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames2(from))
      if (!__hasOwnProp2.call(to, key) && key !== except)
        __defProp3(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create2(__getProtoOf2(mod)) : {}, __copyProps2(isNodeMode || !mod || !mod.__esModule ? __defProp3(target, "default", { value: mod, enumerable: true }) : target, mod));
var require_Blob3 = __commonJS2({
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
        function BlobBuilderConstructor(ary, options2) {
          options2 = options2 || {};
          var bb = new BlobBuilder();
          mapArrayBufferViews(ary).forEach(function(part) {
            bb.append(part);
          });
          return options2.type ? bb.getBlob(options2.type) : bb.getBlob();
        }
        function BlobConstructor(ary, options2) {
          return new origBlob(mapArrayBufferViews(ary), options2 || {});
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
              var update3 = new Uint8Array(tlen);
              update3.set(target);
              target = update3;
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
          var create3 = Object.create || function(a) {
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
            var size2 = 0;
            var j = chunks.length;
            while (j--) {
              size2 += chunks[j].length;
            }
            var b = new Uint8Array(size2);
            var offset = 0;
            for (var i = 0; i < chunks.length; i++) {
              var chunk = chunks[i];
              b.set(chunk, offset);
              offset += chunk.byteLength || chunk.length;
            }
            return b;
          }
          function Blob3(chunks, opts) {
            chunks = chunks || [];
            opts = opts == null ? {} : opts;
            for (var i = 0, len = chunks.length; i < len; i++) {
              var chunk = chunks[i];
              if (chunk instanceof Blob3) {
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
          Blob3.prototype.arrayBuffer = function() {
            return Promise.resolve(this._buffer.buffer || this._buffer);
          };
          Blob3.prototype.text = function() {
            return Promise.resolve(textDecode(this._buffer));
          };
          Blob3.prototype.slice = function(start2, end, type72) {
            var slice = this._buffer.slice(start2 || 0, end || this._buffer.length);
            return new Blob3([slice], { type: type72 });
          };
          Blob3.prototype.toString = function() {
            return "[object Blob]";
          };
          function File2(chunks, name22, opts) {
            opts = opts || {};
            var a = Blob3.call(this, chunks, opts) || this;
            a.name = name22.replace(/\//g, ":");
            a.lastModifiedDate = opts.lastModified ? new Date(opts.lastModified) : new Date();
            a.lastModified = +a.lastModifiedDate;
            return a;
          }
          File2.prototype = create3(Blob3.prototype);
          File2.prototype.constructor = File2;
          if (Object.setPrototypeOf) {
            Object.setPrototypeOf(File2, Blob3);
          } else {
            try {
              File2.__proto__ = Blob3;
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
            if (!(blob2 instanceof Blob3)) {
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
            return blob2 instanceof Blob3 ? "data:" + blob2.type + ";base64," + array2base64(blob2._buffer) : createObjectURL.call(URL2, blob2);
          };
          URL2.revokeObjectURL = function(url) {
            revokeObjectURL && revokeObjectURL.call(URL2, url);
          };
          var _send = global2.XMLHttpRequest && global2.XMLHttpRequest.prototype.send;
          if (_send) {
            XMLHttpRequest.prototype.send = function(data) {
              if (data instanceof Blob3) {
                this.setRequestHeader("Content-Type", data.type);
                _send.call(this, textDecode(data._buffer));
              } else {
                _send.call(this, data);
              }
            };
          }
          exports2.Blob = Blob3;
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
            var position2 = 0;
            var blob2 = this;
            return new ReadableStream({
              type: "bytes",
              autoAllocateChunkSize: 524288,
              pull: function(controller) {
                var v = controller.byobRequest.view;
                var chunk = blob2.slice(position2, position2 + v.byteLength);
                return chunk.arrayBuffer().then(function(buffer) {
                  var uint8array = new Uint8Array(buffer);
                  var bytesRead = uint8array.byteLength;
                  position2 += bytesRead;
                  v.set(uint8array);
                  controller.byobRequest.respond(bytesRead);
                  if (position2 >= blob2.size)
                    controller.close();
                });
              }
            });
          };
        } catch (e) {
          try {
            new ReadableStream({});
            stream = function stream2(blob2) {
              var position2 = 0;
              return new ReadableStream({
                pull: function(controller) {
                  var chunk = blob2.slice(position2, position2 + 524288);
                  return chunk.arrayBuffer().then(function(buffer) {
                    position2 += buffer.byteLength;
                    var uint8array = new Uint8Array(buffer);
                    controller.enqueue(uint8array);
                    if (position2 == blob2.size)
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
var browser_exports3 = {};
__export3(browser_exports3, {
  default: () => browser_default3
});
var import_blob_polyfill3;
var browser_default3;
var init_browser3 = __esm2({
  "../../node_modules/cross-blob/browser.js"() {
    import_blob_polyfill3 = __toESM2(require_Blob3(), 1);
    browser_default3 = import_blob_polyfill3.Blob;
  }
});
var zipped = (suffix22, mimeType, codecs) => mimeType && mimeType === codecs.getType("gz") || suffix22.includes("gz");
var fullSuffix2 = (fileName = "") => fileName.split(".").slice(1);
var suffix2 = (fileName = "") => {
  const suffix22 = fullSuffix2(fileName);
  const isZip = zipped(suffix22);
  if (isZip)
    suffix22.pop();
  return suffix22.join(".");
};
var name2 = (path) => path ? path.split("/").slice(-1)[0] : void 0;
var directory = (path) => path ? path.split("/").slice(0, -1).join("/") : void 0;
var esm = (suffix22, type72) => {
  if (suffix22.slice(-2) === "js")
    return true;
  else if (type72 && type72.includes("javascript"))
    return true;
  else
    return false;
};
var get4 = (type72, name22, codecs) => {
  let mimeType = type72;
  const isZipped = zipped(fullSuffix2(name22), mimeType, codecs);
  const sfx = suffix2(name22);
  if (isZipped || !mimeType || mimeType === "text/plain")
    mimeType = codecs.getType(sfx);
  if (esm(sfx, mimeType))
    mimeType = codecs.getType("js");
  return { mimeType, zipped: isZipped, suffix: sfx };
};
var gzip_exports = {};
__export3(gzip_exports, {
  decode: () => decode,
  encode: () => encode,
  suffixes: () => suffixes,
  type: () => type
});
var Z_FIXED$1 = 4;
var Z_BINARY = 0;
var Z_TEXT = 1;
var Z_UNKNOWN$1 = 2;
function zero$1(buf) {
  let len = buf.length;
  while (--len >= 0) {
    buf[len] = 0;
  }
}
var STORED_BLOCK = 0;
var STATIC_TREES = 1;
var DYN_TREES = 2;
var MIN_MATCH$1 = 3;
var MAX_MATCH$1 = 258;
var LENGTH_CODES$1 = 29;
var LITERALS$1 = 256;
var L_CODES$1 = LITERALS$1 + 1 + LENGTH_CODES$1;
var D_CODES$1 = 30;
var BL_CODES$1 = 19;
var HEAP_SIZE$1 = 2 * L_CODES$1 + 1;
var MAX_BITS$1 = 15;
var Buf_size = 16;
var MAX_BL_BITS = 7;
var END_BLOCK = 256;
var REP_3_6 = 16;
var REPZ_3_10 = 17;
var REPZ_11_138 = 18;
var extra_lbits = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]);
var extra_dbits = new Uint8Array([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
var extra_blbits = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]);
var bl_order = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var DIST_CODE_LEN = 512;
var static_ltree = new Array((L_CODES$1 + 2) * 2);
zero$1(static_ltree);
var static_dtree = new Array(D_CODES$1 * 2);
zero$1(static_dtree);
var _dist_code = new Array(DIST_CODE_LEN);
zero$1(_dist_code);
var _length_code = new Array(MAX_MATCH$1 - MIN_MATCH$1 + 1);
zero$1(_length_code);
var base_length = new Array(LENGTH_CODES$1);
zero$1(base_length);
var base_dist = new Array(D_CODES$1);
zero$1(base_dist);
function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
  this.static_tree = static_tree;
  this.extra_bits = extra_bits;
  this.extra_base = extra_base;
  this.elems = elems;
  this.max_length = max_length;
  this.has_stree = static_tree && static_tree.length;
}
var static_l_desc;
var static_d_desc;
var static_bl_desc;
function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;
  this.max_code = 0;
  this.stat_desc = stat_desc;
}
var d_code = (dist) => {
  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
};
var put_short = (s, w) => {
  s.pending_buf[s.pending++] = w & 255;
  s.pending_buf[s.pending++] = w >>> 8 & 255;
};
var send_bits = (s, value, length) => {
  if (s.bi_valid > Buf_size - length) {
    s.bi_buf |= value << s.bi_valid & 65535;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> Buf_size - s.bi_valid;
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= value << s.bi_valid & 65535;
    s.bi_valid += length;
  }
};
var send_code = (s, c, tree) => {
  send_bits(s, tree[c * 2], tree[c * 2 + 1]);
};
var bi_reverse = (code, len) => {
  let res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
};
var bi_flush = (s) => {
  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;
  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 255;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
};
var gen_bitlen = (s, desc) => {
  const tree = desc.dyn_tree;
  const max_code = desc.max_code;
  const stree = desc.stat_desc.static_tree;
  const has_stree = desc.stat_desc.has_stree;
  const extra = desc.stat_desc.extra_bits;
  const base = desc.stat_desc.extra_base;
  const max_length = desc.stat_desc.max_length;
  let h;
  let n, m;
  let bits;
  let xbits;
  let f;
  let overflow = 0;
  for (bits = 0; bits <= MAX_BITS$1; bits++) {
    s.bl_count[bits] = 0;
  }
  tree[s.heap[s.heap_max] * 2 + 1] = 0;
  for (h = s.heap_max + 1; h < HEAP_SIZE$1; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1] = bits;
    if (n > max_code) {
      continue;
    }
    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2];
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1] + xbits);
    }
  }
  if (overflow === 0) {
    return;
  }
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) {
      bits--;
    }
    s.bl_count[bits]--;
    s.bl_count[bits + 1] += 2;
    s.bl_count[max_length]--;
    overflow -= 2;
  } while (overflow > 0);
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) {
        continue;
      }
      if (tree[m * 2 + 1] !== bits) {
        s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
        tree[m * 2 + 1] = bits;
      }
      n--;
    }
  }
};
var gen_codes = (tree, max_code, bl_count) => {
  const next_code = new Array(MAX_BITS$1 + 1);
  let code = 0;
  let bits;
  let n;
  for (bits = 1; bits <= MAX_BITS$1; bits++) {
    next_code[bits] = code = code + bl_count[bits - 1] << 1;
  }
  for (n = 0; n <= max_code; n++) {
    let len = tree[n * 2 + 1];
    if (len === 0) {
      continue;
    }
    tree[n * 2] = bi_reverse(next_code[len]++, len);
  }
};
var tr_static_init = () => {
  let n;
  let bits;
  let length;
  let code;
  let dist;
  const bl_count = new Array(MAX_BITS$1 + 1);
  length = 0;
  for (code = 0; code < LENGTH_CODES$1 - 1; code++) {
    base_length[code] = length;
    for (n = 0; n < 1 << extra_lbits[code]; n++) {
      _length_code[length++] = code;
    }
  }
  _length_code[length - 1] = code;
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < 1 << extra_dbits[code]; n++) {
      _dist_code[dist++] = code;
    }
  }
  dist >>= 7;
  for (; code < D_CODES$1; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  for (bits = 0; bits <= MAX_BITS$1; bits++) {
    bl_count[bits] = 0;
  }
  n = 0;
  while (n <= 143) {
    static_ltree[n * 2 + 1] = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n * 2 + 1] = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n * 2 + 1] = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n * 2 + 1] = 8;
    n++;
    bl_count[8]++;
  }
  gen_codes(static_ltree, L_CODES$1 + 1, bl_count);
  for (n = 0; n < D_CODES$1; n++) {
    static_dtree[n * 2 + 1] = 5;
    static_dtree[n * 2] = bi_reverse(n, 5);
  }
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS$1 + 1, L_CODES$1, MAX_BITS$1);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES$1, MAX_BITS$1);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES$1, MAX_BL_BITS);
};
var init_block = (s) => {
  let n;
  for (n = 0; n < L_CODES$1; n++) {
    s.dyn_ltree[n * 2] = 0;
  }
  for (n = 0; n < D_CODES$1; n++) {
    s.dyn_dtree[n * 2] = 0;
  }
  for (n = 0; n < BL_CODES$1; n++) {
    s.bl_tree[n * 2] = 0;
  }
  s.dyn_ltree[END_BLOCK * 2] = 1;
  s.opt_len = s.static_len = 0;
  s.last_lit = s.matches = 0;
};
var bi_windup = (s) => {
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
};
var copy_block = (s, buf, len, header) => {
  bi_windup(s);
  if (header) {
    put_short(s, len);
    put_short(s, ~len);
  }
  s.pending_buf.set(s.window.subarray(buf, buf + len), s.pending);
  s.pending += len;
};
var smaller = (tree, n, m, depth) => {
  const _n2 = n * 2;
  const _m2 = m * 2;
  return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
};
var pqdownheap = (s, tree, k) => {
  const v = s.heap[k];
  let j = k << 1;
  while (j <= s.heap_len) {
    if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    if (smaller(tree, v, s.heap[j], s.depth)) {
      break;
    }
    s.heap[k] = s.heap[j];
    k = j;
    j <<= 1;
  }
  s.heap[k] = v;
};
var compress_block = (s, ltree, dtree) => {
  let dist;
  let lc;
  let lx = 0;
  let code;
  let extra;
  if (s.last_lit !== 0) {
    do {
      dist = s.pending_buf[s.d_buf + lx * 2] << 8 | s.pending_buf[s.d_buf + lx * 2 + 1];
      lc = s.pending_buf[s.l_buf + lx];
      lx++;
      if (dist === 0) {
        send_code(s, lc, ltree);
      } else {
        code = _length_code[lc];
        send_code(s, code + LITERALS$1 + 1, ltree);
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);
        }
        dist--;
        code = d_code(dist);
        send_code(s, code, dtree);
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);
        }
      }
    } while (lx < s.last_lit);
  }
  send_code(s, END_BLOCK, ltree);
};
var build_tree = (s, desc) => {
  const tree = desc.dyn_tree;
  const stree = desc.stat_desc.static_tree;
  const has_stree = desc.stat_desc.has_stree;
  const elems = desc.stat_desc.elems;
  let n, m;
  let max_code = -1;
  let node;
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE$1;
  for (n = 0; n < elems; n++) {
    if (tree[n * 2] !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;
    } else {
      tree[n * 2 + 1] = 0;
    }
  }
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
    tree[node * 2] = 1;
    s.depth[node] = 0;
    s.opt_len--;
    if (has_stree) {
      s.static_len -= stree[node * 2 + 1];
    }
  }
  desc.max_code = max_code;
  for (n = s.heap_len >> 1; n >= 1; n--) {
    pqdownheap(s, tree, n);
  }
  node = elems;
  do {
    n = s.heap[1];
    s.heap[1] = s.heap[s.heap_len--];
    pqdownheap(s, tree, 1);
    m = s.heap[1];
    s.heap[--s.heap_max] = n;
    s.heap[--s.heap_max] = m;
    tree[node * 2] = tree[n * 2] + tree[m * 2];
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1] = tree[m * 2 + 1] = node;
    s.heap[1] = node++;
    pqdownheap(s, tree, 1);
  } while (s.heap_len >= 2);
  s.heap[--s.heap_max] = s.heap[1];
  gen_bitlen(s, desc);
  gen_codes(tree, max_code, s.bl_count);
};
var scan_tree = (s, tree, max_code) => {
  let n;
  let prevlen = -1;
  let curlen;
  let nextlen = tree[0 * 2 + 1];
  let count = 0;
  let max_count = 7;
  let min_count = 4;
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1] = 65535;
  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1];
    if (++count < max_count && curlen === nextlen) {
      continue;
    } else if (count < min_count) {
      s.bl_tree[curlen * 2] += count;
    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        s.bl_tree[curlen * 2]++;
      }
      s.bl_tree[REP_3_6 * 2]++;
    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10 * 2]++;
    } else {
      s.bl_tree[REPZ_11_138 * 2]++;
    }
    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;
    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};
var send_tree = (s, tree, max_code) => {
  let n;
  let prevlen = -1;
  let curlen;
  let nextlen = tree[0 * 2 + 1];
  let count = 0;
  let max_count = 7;
  let min_count = 4;
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1];
    if (++count < max_count && curlen === nextlen) {
      continue;
    } else if (count < min_count) {
      do {
        send_code(s, curlen, s.bl_tree);
      } while (--count !== 0);
    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count - 3, 2);
    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count - 3, 3);
    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count - 11, 7);
    }
    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;
    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};
var build_bl_tree = (s) => {
  let max_blindex;
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
  build_tree(s, s.bl_desc);
  for (max_blindex = BL_CODES$1 - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
      break;
    }
  }
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  return max_blindex;
};
var send_all_trees = (s, lcodes, dcodes, blcodes) => {
  let rank22;
  send_bits(s, lcodes - 257, 5);
  send_bits(s, dcodes - 1, 5);
  send_bits(s, blcodes - 4, 4);
  for (rank22 = 0; rank22 < blcodes; rank22++) {
    send_bits(s, s.bl_tree[bl_order[rank22] * 2 + 1], 3);
  }
  send_tree(s, s.dyn_ltree, lcodes - 1);
  send_tree(s, s.dyn_dtree, dcodes - 1);
};
var detect_data_type = (s) => {
  let black_mask = 4093624447;
  let n;
  for (n = 0; n <= 31; n++, black_mask >>>= 1) {
    if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
      return Z_BINARY;
    }
  }
  if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS$1; n++) {
    if (s.dyn_ltree[n * 2] !== 0) {
      return Z_TEXT;
    }
  }
  return Z_BINARY;
};
var static_init_done = false;
var _tr_init$1 = (s) => {
  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }
  s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
  s.bi_buf = 0;
  s.bi_valid = 0;
  init_block(s);
};
var _tr_stored_block$1 = (s, buf, stored_len, last) => {
  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
  copy_block(s, buf, stored_len, true);
};
var _tr_align$1 = (s) => {
  send_bits(s, STATIC_TREES << 1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
};
var _tr_flush_block$1 = (s, buf, stored_len, last) => {
  let opt_lenb, static_lenb;
  let max_blindex = 0;
  if (s.level > 0) {
    if (s.strm.data_type === Z_UNKNOWN$1) {
      s.strm.data_type = detect_data_type(s);
    }
    build_tree(s, s.l_desc);
    build_tree(s, s.d_desc);
    max_blindex = build_bl_tree(s);
    opt_lenb = s.opt_len + 3 + 7 >>> 3;
    static_lenb = s.static_len + 3 + 7 >>> 3;
    if (static_lenb <= opt_lenb) {
      opt_lenb = static_lenb;
    }
  } else {
    opt_lenb = static_lenb = stored_len + 5;
  }
  if (stored_len + 4 <= opt_lenb && buf !== -1) {
    _tr_stored_block$1(s, buf, stored_len, last);
  } else if (s.strategy === Z_FIXED$1 || static_lenb === opt_lenb) {
    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);
  } else {
    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  init_block(s);
  if (last) {
    bi_windup(s);
  }
};
var _tr_tally$1 = (s, dist, lc) => {
  s.pending_buf[s.d_buf + s.last_lit * 2] = dist >>> 8 & 255;
  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 255;
  s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
  s.last_lit++;
  if (dist === 0) {
    s.dyn_ltree[lc * 2]++;
  } else {
    s.matches++;
    dist--;
    s.dyn_ltree[(_length_code[lc] + LITERALS$1 + 1) * 2]++;
    s.dyn_dtree[d_code(dist) * 2]++;
  }
  return s.last_lit === s.lit_bufsize - 1;
};
var _tr_init_1 = _tr_init$1;
var _tr_stored_block_1 = _tr_stored_block$1;
var _tr_flush_block_1 = _tr_flush_block$1;
var _tr_tally_1 = _tr_tally$1;
var _tr_align_1 = _tr_align$1;
var trees = {
  _tr_init: _tr_init_1,
  _tr_stored_block: _tr_stored_block_1,
  _tr_flush_block: _tr_flush_block_1,
  _tr_tally: _tr_tally_1,
  _tr_align: _tr_align_1
};
var adler32 = (adler, buf, len, pos) => {
  let s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
  while (len !== 0) {
    n = len > 2e3 ? 2e3 : len;
    len -= n;
    do {
      s1 = s1 + buf[pos++] | 0;
      s2 = s2 + s1 | 0;
    } while (--n);
    s1 %= 65521;
    s2 %= 65521;
  }
  return s1 | s2 << 16 | 0;
};
var adler32_1 = adler32;
var makeTable = () => {
  let c, table = [];
  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    }
    table[n] = c;
  }
  return table;
};
var crcTable = new Uint32Array(makeTable());
var crc32 = (crc, buf, len, pos) => {
  const t = crcTable;
  const end = pos + len;
  crc ^= -1;
  for (let i = pos; i < end; i++) {
    crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
  }
  return crc ^ -1;
};
var crc32_1 = crc32;
var messages = {
  2: "need dictionary",
  1: "stream end",
  0: "",
  "-1": "file error",
  "-2": "stream error",
  "-3": "data error",
  "-4": "insufficient memory",
  "-5": "buffer error",
  "-6": "incompatible version"
};
var constants$2 = {
  Z_NO_FLUSH: 0,
  Z_PARTIAL_FLUSH: 1,
  Z_SYNC_FLUSH: 2,
  Z_FULL_FLUSH: 3,
  Z_FINISH: 4,
  Z_BLOCK: 5,
  Z_TREES: 6,
  Z_OK: 0,
  Z_STREAM_END: 1,
  Z_NEED_DICT: 2,
  Z_ERRNO: -1,
  Z_STREAM_ERROR: -2,
  Z_DATA_ERROR: -3,
  Z_MEM_ERROR: -4,
  Z_BUF_ERROR: -5,
  Z_NO_COMPRESSION: 0,
  Z_BEST_SPEED: 1,
  Z_BEST_COMPRESSION: 9,
  Z_DEFAULT_COMPRESSION: -1,
  Z_FILTERED: 1,
  Z_HUFFMAN_ONLY: 2,
  Z_RLE: 3,
  Z_FIXED: 4,
  Z_DEFAULT_STRATEGY: 0,
  Z_BINARY: 0,
  Z_TEXT: 1,
  Z_UNKNOWN: 2,
  Z_DEFLATED: 8
};
var { _tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align } = trees;
var {
  Z_NO_FLUSH: Z_NO_FLUSH$2,
  Z_PARTIAL_FLUSH,
  Z_FULL_FLUSH: Z_FULL_FLUSH$1,
  Z_FINISH: Z_FINISH$3,
  Z_BLOCK: Z_BLOCK$1,
  Z_OK: Z_OK$3,
  Z_STREAM_END: Z_STREAM_END$3,
  Z_STREAM_ERROR: Z_STREAM_ERROR$2,
  Z_DATA_ERROR: Z_DATA_ERROR$2,
  Z_BUF_ERROR: Z_BUF_ERROR$1,
  Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$1,
  Z_FILTERED,
  Z_HUFFMAN_ONLY,
  Z_RLE,
  Z_FIXED,
  Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY$1,
  Z_UNKNOWN,
  Z_DEFLATED: Z_DEFLATED$2
} = constants$2;
var MAX_MEM_LEVEL = 9;
var MAX_WBITS$1 = 15;
var DEF_MEM_LEVEL = 8;
var LENGTH_CODES = 29;
var LITERALS = 256;
var L_CODES = LITERALS + 1 + LENGTH_CODES;
var D_CODES = 30;
var BL_CODES = 19;
var HEAP_SIZE = 2 * L_CODES + 1;
var MAX_BITS = 15;
var MIN_MATCH = 3;
var MAX_MATCH = 258;
var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
var PRESET_DICT = 32;
var INIT_STATE = 42;
var EXTRA_STATE = 69;
var NAME_STATE = 73;
var COMMENT_STATE = 91;
var HCRC_STATE = 103;
var BUSY_STATE = 113;
var FINISH_STATE = 666;
var BS_NEED_MORE = 1;
var BS_BLOCK_DONE = 2;
var BS_FINISH_STARTED = 3;
var BS_FINISH_DONE = 4;
var OS_CODE = 3;
var err = (strm, errorCode) => {
  strm.msg = messages[errorCode];
  return errorCode;
};
var rank = (f) => {
  return (f << 1) - (f > 4 ? 9 : 0);
};
var zero = (buf) => {
  let len = buf.length;
  while (--len >= 0) {
    buf[len] = 0;
  }
};
var HASH_ZLIB = (s, prev, data) => (prev << s.hash_shift ^ data) & s.hash_mask;
var HASH = HASH_ZLIB;
var flush_pending = (strm) => {
  const s = strm.state;
  let len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) {
    return;
  }
  strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
  strm.next_out += len;
  s.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
};
var flush_block_only = (s, last) => {
  _tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
};
var put_byte = (s, b) => {
  s.pending_buf[s.pending++] = b;
};
var putShortMSB = (s, b) => {
  s.pending_buf[s.pending++] = b >>> 8 & 255;
  s.pending_buf[s.pending++] = b & 255;
};
var read_buf = (strm, buf, start2, size2) => {
  let len = strm.avail_in;
  if (len > size2) {
    len = size2;
  }
  if (len === 0) {
    return 0;
  }
  strm.avail_in -= len;
  buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start2);
  if (strm.state.wrap === 1) {
    strm.adler = adler32_1(strm.adler, buf, len, start2);
  } else if (strm.state.wrap === 2) {
    strm.adler = crc32_1(strm.adler, buf, len, start2);
  }
  strm.next_in += len;
  strm.total_in += len;
  return len;
};
var longest_match = (s, cur_match) => {
  let chain_length = s.max_chain_length;
  let scan = s.strstart;
  let match;
  let len;
  let best_len = s.prev_length;
  let nice_match = s.nice_match;
  const limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
  const _win = s.window;
  const wmask = s.w_mask;
  const prev = s.prev;
  const strend = s.strstart + MAX_MATCH;
  let scan_end1 = _win[scan + best_len - 1];
  let scan_end = _win[scan + best_len];
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  if (nice_match > s.lookahead) {
    nice_match = s.lookahead;
  }
  do {
    match = cur_match;
    if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
      continue;
    }
    scan += 2;
    match++;
    do {
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;
    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1 = _win[scan + best_len - 1];
      scan_end = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
};
var fill_window = (s) => {
  const _w_size = s.w_size;
  let p, n, m, more, str;
  do {
    more = s.window_size - s.lookahead - s.strstart;
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
      s.window.set(s.window.subarray(_w_size, _w_size + _w_size), 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      s.block_start -= _w_size;
      n = s.hash_size;
      p = n;
      do {
        m = s.head[--p];
        s.head[p] = m >= _w_size ? m - _w_size : 0;
      } while (--n);
      n = _w_size;
      p = n;
      do {
        m = s.prev[--p];
        s.prev[p] = m >= _w_size ? m - _w_size : 0;
      } while (--n);
      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;
    if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];
      s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
      while (s.insert) {
        s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
};
var deflate_stored = (s, flush) => {
  let max_block_size = 65535;
  if (max_block_size > s.pending_buf_size - 5) {
    max_block_size = s.pending_buf_size - 5;
  }
  for (; ; ) {
    if (s.lookahead <= 1) {
      fill_window(s);
      if (s.lookahead === 0 && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break;
      }
    }
    s.strstart += s.lookahead;
    s.lookahead = 0;
    const max_start = s.block_start + max_block_size;
    if (s.strstart === 0 || s.strstart >= max_start) {
      s.lookahead = s.strstart - max_start;
      s.strstart = max_start;
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s.strstart > s.block_start) {
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_NEED_MORE;
};
var deflate_fast = (s, flush) => {
  let hash_head;
  let bflush;
  for (; ; ) {
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break;
      }
    }
    hash_head = 0;
    if (s.lookahead >= MIN_MATCH) {
      s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
    }
    if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
      s.match_length = longest_match(s, hash_head);
    }
    if (s.match_length >= MIN_MATCH) {
      bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
      s.lookahead -= s.match_length;
      if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
        s.match_length--;
        do {
          s.strstart++;
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        } while (--s.match_length !== 0);
        s.strstart++;
      } else {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);
      }
    } else {
      bflush = _tr_tally(s, 0, s.window[s.strstart]);
      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH$3) {
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
var deflate_slow = (s, flush) => {
  let hash_head;
  let bflush;
  let max_insert;
  for (; ; ) {
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break;
      }
    }
    hash_head = 0;
    if (s.lookahead >= MIN_MATCH) {
      s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
    }
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH - 1;
    if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
      s.match_length = longest_match(s, hash_head);
      if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) {
        s.match_length = MIN_MATCH - 1;
      }
    }
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH - 1;
      s.strstart++;
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    } else if (s.match_available) {
      bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
      if (bflush) {
        flush_block_only(s, false);
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  if (s.match_available) {
    bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH$3) {
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
var deflate_rle = (s, flush) => {
  let bflush;
  let prev;
  let scan, strend;
  const _win = s.window;
  for (; ; ) {
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break;
      }
    }
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
        } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
    }
    if (s.match_length >= MIN_MATCH) {
      bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);
      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      bflush = _tr_tally(s, 0, s.window[s.strstart]);
      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
var deflate_huff = (s, flush) => {
  let bflush;
  for (; ; ) {
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH$2) {
          return BS_NEED_MORE;
        }
        break;
      }
    }
    s.match_length = 0;
    bflush = _tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
function Config(good_length, max_lazy, nice_length, max_chain, func) {
  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}
var configuration_table = [
  new Config(0, 0, 0, 0, deflate_stored),
  new Config(4, 4, 8, 4, deflate_fast),
  new Config(4, 5, 16, 8, deflate_fast),
  new Config(4, 6, 32, 32, deflate_fast),
  new Config(4, 4, 16, 16, deflate_slow),
  new Config(8, 16, 32, 32, deflate_slow),
  new Config(8, 16, 128, 128, deflate_slow),
  new Config(8, 32, 128, 256, deflate_slow),
  new Config(32, 128, 258, 1024, deflate_slow),
  new Config(32, 258, 258, 4096, deflate_slow)
];
var lm_init = (s) => {
  s.window_size = 2 * s.w_size;
  zero(s.head);
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;
  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
};
function DeflateState() {
  this.strm = null;
  this.status = 0;
  this.pending_buf = null;
  this.pending_buf_size = 0;
  this.pending_out = 0;
  this.pending = 0;
  this.wrap = 0;
  this.gzhead = null;
  this.gzindex = 0;
  this.method = Z_DEFLATED$2;
  this.last_flush = -1;
  this.w_size = 0;
  this.w_bits = 0;
  this.w_mask = 0;
  this.window = null;
  this.window_size = 0;
  this.prev = null;
  this.head = null;
  this.ins_h = 0;
  this.hash_size = 0;
  this.hash_bits = 0;
  this.hash_mask = 0;
  this.hash_shift = 0;
  this.block_start = 0;
  this.match_length = 0;
  this.prev_match = 0;
  this.match_available = 0;
  this.strstart = 0;
  this.match_start = 0;
  this.lookahead = 0;
  this.prev_length = 0;
  this.max_chain_length = 0;
  this.max_lazy_match = 0;
  this.level = 0;
  this.strategy = 0;
  this.good_match = 0;
  this.nice_match = 0;
  this.dyn_ltree = new Uint16Array(HEAP_SIZE * 2);
  this.dyn_dtree = new Uint16Array((2 * D_CODES + 1) * 2);
  this.bl_tree = new Uint16Array((2 * BL_CODES + 1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);
  this.l_desc = null;
  this.d_desc = null;
  this.bl_desc = null;
  this.bl_count = new Uint16Array(MAX_BITS + 1);
  this.heap = new Uint16Array(2 * L_CODES + 1);
  zero(this.heap);
  this.heap_len = 0;
  this.heap_max = 0;
  this.depth = new Uint16Array(2 * L_CODES + 1);
  zero(this.depth);
  this.l_buf = 0;
  this.lit_bufsize = 0;
  this.last_lit = 0;
  this.d_buf = 0;
  this.opt_len = 0;
  this.static_len = 0;
  this.matches = 0;
  this.insert = 0;
  this.bi_buf = 0;
  this.bi_valid = 0;
}
var deflateResetKeep = (strm) => {
  if (!strm || !strm.state) {
    return err(strm, Z_STREAM_ERROR$2);
  }
  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;
  const s = strm.state;
  s.pending = 0;
  s.pending_out = 0;
  if (s.wrap < 0) {
    s.wrap = -s.wrap;
  }
  s.status = s.wrap ? INIT_STATE : BUSY_STATE;
  strm.adler = s.wrap === 2 ? 0 : 1;
  s.last_flush = Z_NO_FLUSH$2;
  _tr_init(s);
  return Z_OK$3;
};
var deflateReset = (strm) => {
  const ret = deflateResetKeep(strm);
  if (ret === Z_OK$3) {
    lm_init(strm.state);
  }
  return ret;
};
var deflateSetHeader = (strm, head) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$2;
  }
  if (strm.state.wrap !== 2) {
    return Z_STREAM_ERROR$2;
  }
  strm.state.gzhead = head;
  return Z_OK$3;
};
var deflateInit2 = (strm, level, method2, windowBits, memLevel, strategy) => {
  if (!strm) {
    return Z_STREAM_ERROR$2;
  }
  let wrap = 1;
  if (level === Z_DEFAULT_COMPRESSION$1) {
    level = 6;
  }
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  } else if (windowBits > 15) {
    wrap = 2;
    windowBits -= 16;
  }
  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method2 !== Z_DEFLATED$2 || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED) {
    return err(strm, Z_STREAM_ERROR$2);
  }
  if (windowBits === 8) {
    windowBits = 9;
  }
  const s = new DeflateState();
  strm.state = s;
  s.strm = strm;
  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;
  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
  s.window = new Uint8Array(s.w_size * 2);
  s.head = new Uint16Array(s.hash_size);
  s.prev = new Uint16Array(s.w_size);
  s.lit_bufsize = 1 << memLevel + 6;
  s.pending_buf_size = s.lit_bufsize * 4;
  s.pending_buf = new Uint8Array(s.pending_buf_size);
  s.d_buf = 1 * s.lit_bufsize;
  s.l_buf = (1 + 2) * s.lit_bufsize;
  s.level = level;
  s.strategy = strategy;
  s.method = method2;
  return deflateReset(strm);
};
var deflateInit = (strm, level) => {
  return deflateInit2(strm, level, Z_DEFLATED$2, MAX_WBITS$1, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY$1);
};
var deflate$2 = (strm, flush) => {
  let beg, val;
  if (!strm || !strm.state || flush > Z_BLOCK$1 || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR$2) : Z_STREAM_ERROR$2;
  }
  const s = strm.state;
  if (!strm.output || !strm.input && strm.avail_in !== 0 || s.status === FINISH_STATE && flush !== Z_FINISH$3) {
    return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR$1 : Z_STREAM_ERROR$2);
  }
  s.strm = strm;
  const old_flush = s.last_flush;
  s.last_flush = flush;
  if (s.status === INIT_STATE) {
    if (s.wrap === 2) {
      strm.adler = 0;
      put_byte(s, 31);
      put_byte(s, 139);
      put_byte(s, 8);
      if (!s.gzhead) {
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
        put_byte(s, OS_CODE);
        s.status = BUSY_STATE;
      } else {
        put_byte(s, (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16));
        put_byte(s, s.gzhead.time & 255);
        put_byte(s, s.gzhead.time >> 8 & 255);
        put_byte(s, s.gzhead.time >> 16 & 255);
        put_byte(s, s.gzhead.time >> 24 & 255);
        put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
        put_byte(s, s.gzhead.os & 255);
        if (s.gzhead.extra && s.gzhead.extra.length) {
          put_byte(s, s.gzhead.extra.length & 255);
          put_byte(s, s.gzhead.extra.length >> 8 & 255);
        }
        if (s.gzhead.hcrc) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending, 0);
        }
        s.gzindex = 0;
        s.status = EXTRA_STATE;
      }
    } else {
      let header = Z_DEFLATED$2 + (s.w_bits - 8 << 4) << 8;
      let level_flags = -1;
      if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
        level_flags = 0;
      } else if (s.level < 6) {
        level_flags = 1;
      } else if (s.level === 6) {
        level_flags = 2;
      } else {
        level_flags = 3;
      }
      header |= level_flags << 6;
      if (s.strstart !== 0) {
        header |= PRESET_DICT;
      }
      header += 31 - header % 31;
      s.status = BUSY_STATE;
      putShortMSB(s, header);
      if (s.strstart !== 0) {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 65535);
      }
      strm.adler = 1;
    }
  }
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra) {
      beg = s.pending;
      while (s.gzindex < (s.gzhead.extra.length & 65535)) {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            break;
          }
        }
        put_byte(s, s.gzhead.extra[s.gzindex] & 255);
        s.gzindex++;
      }
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (s.gzindex === s.gzhead.extra.length) {
        s.gzindex = 0;
        s.status = NAME_STATE;
      }
    } else {
      s.status = NAME_STATE;
    }
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name) {
      beg = s.pending;
      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.gzindex = 0;
        s.status = COMMENT_STATE;
      }
    } else {
      s.status = COMMENT_STATE;
    }
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment) {
      beg = s.pending;
      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.status = HCRC_STATE;
      }
    } else {
      s.status = HCRC_STATE;
    }
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
      }
      if (s.pending + 2 <= s.pending_buf_size) {
        put_byte(s, strm.adler & 255);
        put_byte(s, strm.adler >> 8 & 255);
        strm.adler = 0;
        s.status = BUSY_STATE;
      }
    } else {
      s.status = BUSY_STATE;
    }
  }
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      s.last_flush = -1;
      return Z_OK$3;
    }
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH$3) {
    return err(strm, Z_BUF_ERROR$1);
  }
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR$1);
  }
  if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH$2 && s.status !== FINISH_STATE) {
    let bstate = s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
      }
      return Z_OK$3;
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        _tr_align(s);
      } else if (flush !== Z_BLOCK$1) {
        _tr_stored_block(s, 0, 0, false);
        if (flush === Z_FULL_FLUSH$1) {
          zero(s.head);
          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        return Z_OK$3;
      }
    }
  }
  if (flush !== Z_FINISH$3) {
    return Z_OK$3;
  }
  if (s.wrap <= 0) {
    return Z_STREAM_END$3;
  }
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 255);
    put_byte(s, strm.adler >> 8 & 255);
    put_byte(s, strm.adler >> 16 & 255);
    put_byte(s, strm.adler >> 24 & 255);
    put_byte(s, strm.total_in & 255);
    put_byte(s, strm.total_in >> 8 & 255);
    put_byte(s, strm.total_in >> 16 & 255);
    put_byte(s, strm.total_in >> 24 & 255);
  } else {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 65535);
  }
  flush_pending(strm);
  if (s.wrap > 0) {
    s.wrap = -s.wrap;
  }
  return s.pending !== 0 ? Z_OK$3 : Z_STREAM_END$3;
};
var deflateEnd = (strm) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$2;
  }
  const status = strm.state.status;
  if (status !== INIT_STATE && status !== EXTRA_STATE && status !== NAME_STATE && status !== COMMENT_STATE && status !== HCRC_STATE && status !== BUSY_STATE && status !== FINISH_STATE) {
    return err(strm, Z_STREAM_ERROR$2);
  }
  strm.state = null;
  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR$2) : Z_OK$3;
};
var deflateSetDictionary = (strm, dictionary) => {
  let dictLength = dictionary.length;
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$2;
  }
  const s = strm.state;
  const wrap = s.wrap;
  if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
    return Z_STREAM_ERROR$2;
  }
  if (wrap === 1) {
    strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
  }
  s.wrap = 0;
  if (dictLength >= s.w_size) {
    if (wrap === 0) {
      zero(s.head);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    let tmpDict = new Uint8Array(s.w_size);
    tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  const avail = strm.avail_in;
  const next = strm.next_in;
  const input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s);
  while (s.lookahead >= MIN_MATCH) {
    let str = s.strstart;
    let n = s.lookahead - (MIN_MATCH - 1);
    do {
      s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
      s.prev[str & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = str;
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH - 1;
    fill_window(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK$3;
};
var deflateInit_1 = deflateInit;
var deflateInit2_1 = deflateInit2;
var deflateReset_1 = deflateReset;
var deflateResetKeep_1 = deflateResetKeep;
var deflateSetHeader_1 = deflateSetHeader;
var deflate_2$1 = deflate$2;
var deflateEnd_1 = deflateEnd;
var deflateSetDictionary_1 = deflateSetDictionary;
var deflateInfo = "pako deflate (from Nodeca project)";
var deflate_1$2 = {
  deflateInit: deflateInit_1,
  deflateInit2: deflateInit2_1,
  deflateReset: deflateReset_1,
  deflateResetKeep: deflateResetKeep_1,
  deflateSetHeader: deflateSetHeader_1,
  deflate: deflate_2$1,
  deflateEnd: deflateEnd_1,
  deflateSetDictionary: deflateSetDictionary_1,
  deflateInfo
};
var _has = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
var assign = function(obj) {
  const sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    const source = sources.shift();
    if (!source) {
      continue;
    }
    if (typeof source !== "object") {
      throw new TypeError(source + "must be non-object");
    }
    for (const p in source) {
      if (_has(source, p)) {
        obj[p] = source[p];
      }
    }
  }
  return obj;
};
var flattenChunks = (chunks) => {
  let len = 0;
  for (let i = 0, l = chunks.length; i < l; i++) {
    len += chunks[i].length;
  }
  const result = new Uint8Array(len);
  for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
    let chunk = chunks[i];
    result.set(chunk, pos);
    pos += chunk.length;
  }
  return result;
};
var common = {
  assign,
  flattenChunks
};
var STR_APPLY_UIA_OK = true;
try {
  String.fromCharCode.apply(null, new Uint8Array(1));
} catch (__) {
  STR_APPLY_UIA_OK = false;
}
var _utf8len = new Uint8Array(256);
for (let q = 0; q < 256; q++) {
  _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
}
_utf8len[254] = _utf8len[254] = 1;
var string2buf = (str) => {
  if (typeof TextEncoder === "function" && TextEncoder.prototype.encode) {
    return new TextEncoder().encode(str);
  }
  let buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 64512) === 56320) {
        c = 65536 + (c - 55296 << 10) + (c2 - 56320);
        m_pos++;
      }
    }
    buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
  }
  buf = new Uint8Array(buf_len);
  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 64512) === 56320) {
        c = 65536 + (c - 55296 << 10) + (c2 - 56320);
        m_pos++;
      }
    }
    if (c < 128) {
      buf[i++] = c;
    } else if (c < 2048) {
      buf[i++] = 192 | c >>> 6;
      buf[i++] = 128 | c & 63;
    } else if (c < 65536) {
      buf[i++] = 224 | c >>> 12;
      buf[i++] = 128 | c >>> 6 & 63;
      buf[i++] = 128 | c & 63;
    } else {
      buf[i++] = 240 | c >>> 18;
      buf[i++] = 128 | c >>> 12 & 63;
      buf[i++] = 128 | c >>> 6 & 63;
      buf[i++] = 128 | c & 63;
    }
  }
  return buf;
};
var buf2binstring = (buf, len) => {
  if (len < 65534) {
    if (buf.subarray && STR_APPLY_UIA_OK) {
      return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
    }
  }
  let result = "";
  for (let i = 0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
};
var buf2string = (buf, max) => {
  const len = max || buf.length;
  if (typeof TextDecoder === "function" && TextDecoder.prototype.decode) {
    return new TextDecoder().decode(buf.subarray(0, max));
  }
  let i, out;
  const utf16buf = new Array(len * 2);
  for (out = 0, i = 0; i < len; ) {
    let c = buf[i++];
    if (c < 128) {
      utf16buf[out++] = c;
      continue;
    }
    let c_len = _utf8len[c];
    if (c_len > 4) {
      utf16buf[out++] = 65533;
      i += c_len - 1;
      continue;
    }
    c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
    while (c_len > 1 && i < len) {
      c = c << 6 | buf[i++] & 63;
      c_len--;
    }
    if (c_len > 1) {
      utf16buf[out++] = 65533;
      continue;
    }
    if (c < 65536) {
      utf16buf[out++] = c;
    } else {
      c -= 65536;
      utf16buf[out++] = 55296 | c >> 10 & 1023;
      utf16buf[out++] = 56320 | c & 1023;
    }
  }
  return buf2binstring(utf16buf, out);
};
var utf8border = (buf, max) => {
  max = max || buf.length;
  if (max > buf.length) {
    max = buf.length;
  }
  let pos = max - 1;
  while (pos >= 0 && (buf[pos] & 192) === 128) {
    pos--;
  }
  if (pos < 0) {
    return max;
  }
  if (pos === 0) {
    return max;
  }
  return pos + _utf8len[buf[pos]] > max ? pos : max;
};
var strings = {
  string2buf,
  buf2string,
  utf8border
};
function ZStream() {
  this.input = null;
  this.next_in = 0;
  this.avail_in = 0;
  this.total_in = 0;
  this.output = null;
  this.next_out = 0;
  this.avail_out = 0;
  this.total_out = 0;
  this.msg = "";
  this.state = null;
  this.data_type = 2;
  this.adler = 0;
}
var zstream = ZStream;
var toString$1 = Object.prototype.toString;
var {
  Z_NO_FLUSH: Z_NO_FLUSH$1,
  Z_SYNC_FLUSH,
  Z_FULL_FLUSH,
  Z_FINISH: Z_FINISH$2,
  Z_OK: Z_OK$2,
  Z_STREAM_END: Z_STREAM_END$2,
  Z_DEFAULT_COMPRESSION,
  Z_DEFAULT_STRATEGY,
  Z_DEFLATED: Z_DEFLATED$1
} = constants$2;
function Deflate$1(options2) {
  this.options = common.assign({
    level: Z_DEFAULT_COMPRESSION,
    method: Z_DEFLATED$1,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY
  }, options2 || {});
  let opt = this.options;
  if (opt.raw && opt.windowBits > 0) {
    opt.windowBits = -opt.windowBits;
  } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
    opt.windowBits += 16;
  }
  this.err = 0;
  this.msg = "";
  this.ended = false;
  this.chunks = [];
  this.strm = new zstream();
  this.strm.avail_out = 0;
  let status = deflate_1$2.deflateInit2(this.strm, opt.level, opt.method, opt.windowBits, opt.memLevel, opt.strategy);
  if (status !== Z_OK$2) {
    throw new Error(messages[status]);
  }
  if (opt.header) {
    deflate_1$2.deflateSetHeader(this.strm, opt.header);
  }
  if (opt.dictionary) {
    let dict;
    if (typeof opt.dictionary === "string") {
      dict = strings.string2buf(opt.dictionary);
    } else if (toString$1.call(opt.dictionary) === "[object ArrayBuffer]") {
      dict = new Uint8Array(opt.dictionary);
    } else {
      dict = opt.dictionary;
    }
    status = deflate_1$2.deflateSetDictionary(this.strm, dict);
    if (status !== Z_OK$2) {
      throw new Error(messages[status]);
    }
    this._dict_set = true;
  }
}
Deflate$1.prototype.push = function(data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  let status, _flush_mode;
  if (this.ended) {
    return false;
  }
  if (flush_mode === ~~flush_mode)
    _flush_mode = flush_mode;
  else
    _flush_mode = flush_mode === true ? Z_FINISH$2 : Z_NO_FLUSH$1;
  if (typeof data === "string") {
    strm.input = strings.string2buf(data);
  } else if (toString$1.call(data) === "[object ArrayBuffer]") {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }
  strm.next_in = 0;
  strm.avail_in = strm.input.length;
  for (; ; ) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH) && strm.avail_out <= 6) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }
    status = deflate_1$2.deflate(strm, _flush_mode);
    if (status === Z_STREAM_END$2) {
      if (strm.next_out > 0) {
        this.onData(strm.output.subarray(0, strm.next_out));
      }
      status = deflate_1$2.deflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return status === Z_OK$2;
    }
    if (strm.avail_out === 0) {
      this.onData(strm.output);
      continue;
    }
    if (_flush_mode > 0 && strm.next_out > 0) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }
    if (strm.avail_in === 0)
      break;
  }
  return true;
};
Deflate$1.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};
Deflate$1.prototype.onEnd = function(status) {
  if (status === Z_OK$2) {
    this.result = common.flattenChunks(this.chunks);
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};
function deflate$1(input, options2) {
  const deflator = new Deflate$1(options2);
  deflator.push(input, true);
  if (deflator.err) {
    throw deflator.msg || messages[deflator.err];
  }
  return deflator.result;
}
function deflateRaw$1(input, options2) {
  options2 = options2 || {};
  options2.raw = true;
  return deflate$1(input, options2);
}
function gzip$1(input, options2) {
  options2 = options2 || {};
  options2.gzip = true;
  return deflate$1(input, options2);
}
var Deflate_1$1 = Deflate$1;
var deflate_2 = deflate$1;
var deflateRaw_1$1 = deflateRaw$1;
var gzip_1$1 = gzip$1;
var constants$1 = constants$2;
var deflate_1$1 = {
  Deflate: Deflate_1$1,
  deflate: deflate_2,
  deflateRaw: deflateRaw_1$1,
  gzip: gzip_1$1,
  constants: constants$1
};
var BAD$1 = 30;
var TYPE$1 = 12;
var inffast = function inflate_fast(strm, start2) {
  let _in;
  let last;
  let _out;
  let beg;
  let end;
  let dmax;
  let wsize;
  let whave;
  let wnext;
  let s_window;
  let hold;
  let bits;
  let lcode;
  let dcode;
  let lmask;
  let dmask;
  let here;
  let op;
  let len;
  let dist;
  let from;
  let from_source;
  let input, output;
  const state2 = strm.state;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start2 - strm.avail_out);
  end = _out + (strm.avail_out - 257);
  dmax = state2.dmax;
  wsize = state2.wsize;
  whave = state2.whave;
  wnext = state2.wnext;
  s_window = state2.window;
  hold = state2.hold;
  bits = state2.bits;
  lcode = state2.lencode;
  dcode = state2.distcode;
  lmask = (1 << state2.lenbits) - 1;
  dmask = (1 << state2.distbits) - 1;
  top:
    do {
      if (bits < 15) {
        hold += input[_in++] << bits;
        bits += 8;
        hold += input[_in++] << bits;
        bits += 8;
      }
      here = lcode[hold & lmask];
      dolen:
        for (; ; ) {
          op = here >>> 24;
          hold >>>= op;
          bits -= op;
          op = here >>> 16 & 255;
          if (op === 0) {
            output[_out++] = here & 65535;
          } else if (op & 16) {
            len = here & 65535;
            op &= 15;
            if (op) {
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
              len += hold & (1 << op) - 1;
              hold >>>= op;
              bits -= op;
            }
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }
            here = dcode[hold & dmask];
            dodist:
              for (; ; ) {
                op = here >>> 24;
                hold >>>= op;
                bits -= op;
                op = here >>> 16 & 255;
                if (op & 16) {
                  dist = here & 65535;
                  op &= 15;
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                    }
                  }
                  dist += hold & (1 << op) - 1;
                  if (dist > dmax) {
                    strm.msg = "invalid distance too far back";
                    state2.mode = BAD$1;
                    break top;
                  }
                  hold >>>= op;
                  bits -= op;
                  op = _out - beg;
                  if (dist > op) {
                    op = dist - op;
                    if (op > whave) {
                      if (state2.sane) {
                        strm.msg = "invalid distance too far back";
                        state2.mode = BAD$1;
                        break top;
                      }
                    }
                    from = 0;
                    from_source = s_window;
                    if (wnext === 0) {
                      from += wsize - op;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = _out - dist;
                        from_source = output;
                      }
                    } else if (wnext < op) {
                      from += wsize + wnext - op;
                      op -= wnext;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = 0;
                        if (wnext < len) {
                          op = wnext;
                          len -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = _out - dist;
                          from_source = output;
                        }
                      }
                    } else {
                      from += wnext - op;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = _out - dist;
                        from_source = output;
                      }
                    }
                    while (len > 2) {
                      output[_out++] = from_source[from++];
                      output[_out++] = from_source[from++];
                      output[_out++] = from_source[from++];
                      len -= 3;
                    }
                    if (len) {
                      output[_out++] = from_source[from++];
                      if (len > 1) {
                        output[_out++] = from_source[from++];
                      }
                    }
                  } else {
                    from = _out - dist;
                    do {
                      output[_out++] = output[from++];
                      output[_out++] = output[from++];
                      output[_out++] = output[from++];
                      len -= 3;
                    } while (len > 2);
                    if (len) {
                      output[_out++] = output[from++];
                      if (len > 1) {
                        output[_out++] = output[from++];
                      }
                    }
                  }
                } else if ((op & 64) === 0) {
                  here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                  continue dodist;
                } else {
                  strm.msg = "invalid distance code";
                  state2.mode = BAD$1;
                  break top;
                }
                break;
              }
          } else if ((op & 64) === 0) {
            here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
            continue dolen;
          } else if (op & 32) {
            state2.mode = TYPE$1;
            break top;
          } else {
            strm.msg = "invalid literal/length code";
            state2.mode = BAD$1;
            break top;
          }
          break;
        }
    } while (_in < last && _out < end);
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
  strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
  state2.hold = hold;
  state2.bits = bits;
  return;
};
var MAXBITS = 15;
var ENOUGH_LENS$1 = 852;
var ENOUGH_DISTS$1 = 592;
var CODES$1 = 0;
var LENS$1 = 1;
var DISTS$1 = 2;
var lbase = new Uint16Array([
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  13,
  15,
  17,
  19,
  23,
  27,
  31,
  35,
  43,
  51,
  59,
  67,
  83,
  99,
  115,
  131,
  163,
  195,
  227,
  258,
  0,
  0
]);
var lext = new Uint8Array([
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  17,
  17,
  17,
  17,
  18,
  18,
  18,
  18,
  19,
  19,
  19,
  19,
  20,
  20,
  20,
  20,
  21,
  21,
  21,
  21,
  16,
  72,
  78
]);
var dbase = new Uint16Array([
  1,
  2,
  3,
  4,
  5,
  7,
  9,
  13,
  17,
  25,
  33,
  49,
  65,
  97,
  129,
  193,
  257,
  385,
  513,
  769,
  1025,
  1537,
  2049,
  3073,
  4097,
  6145,
  8193,
  12289,
  16385,
  24577,
  0,
  0
]);
var dext = new Uint8Array([
  16,
  16,
  16,
  16,
  17,
  17,
  18,
  18,
  19,
  19,
  20,
  20,
  21,
  21,
  22,
  22,
  23,
  23,
  24,
  24,
  25,
  25,
  26,
  26,
  27,
  27,
  28,
  28,
  29,
  29,
  64,
  64
]);
var inflate_table = (type72, lens, lens_index, codes, table, table_index, work, opts) => {
  const bits = opts.bits;
  let len = 0;
  let sym = 0;
  let min = 0, max = 0;
  let root = 0;
  let curr = 0;
  let drop = 0;
  let left = 0;
  let used = 0;
  let huff = 0;
  let incr;
  let fill;
  let low;
  let mask;
  let next;
  let base = null;
  let base_index = 0;
  let end;
  const count = new Uint16Array(MAXBITS + 1);
  const offs = new Uint16Array(MAXBITS + 1);
  let extra = null;
  let extra_index = 0;
  let here_bits, here_op, here_val;
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) {
      break;
    }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {
    table[table_index++] = 1 << 24 | 64 << 16 | 0;
    table[table_index++] = 1 << 24 | 64 << 16 | 0;
    opts.bits = 1;
    return 0;
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) {
      break;
    }
  }
  if (root < min) {
    root = min;
  }
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }
  }
  if (left > 0 && (type72 === CODES$1 || max !== 1)) {
    return -1;
  }
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }
  if (type72 === CODES$1) {
    base = extra = work;
    end = 19;
  } else if (type72 === LENS$1) {
    base = lbase;
    base_index -= 257;
    extra = lext;
    extra_index -= 257;
    end = 256;
  } else {
    base = dbase;
    extra = dext;
    end = -1;
  }
  huff = 0;
  sym = 0;
  len = min;
  next = table_index;
  curr = root;
  drop = 0;
  low = -1;
  used = 1 << root;
  mask = used - 1;
  if (type72 === LENS$1 && used > ENOUGH_LENS$1 || type72 === DISTS$1 && used > ENOUGH_DISTS$1) {
    return 1;
  }
  for (; ; ) {
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    } else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    } else {
      here_op = 32 + 64;
      here_val = 0;
    }
    incr = 1 << len - drop;
    fill = 1 << curr;
    min = fill;
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
    } while (fill !== 0);
    incr = 1 << len - 1;
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }
    sym++;
    if (--count[len] === 0) {
      if (len === max) {
        break;
      }
      len = lens[lens_index + work[sym]];
    }
    if (len > root && (huff & mask) !== low) {
      if (drop === 0) {
        drop = root;
      }
      next += min;
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) {
          break;
        }
        curr++;
        left <<= 1;
      }
      used += 1 << curr;
      if (type72 === LENS$1 && used > ENOUGH_LENS$1 || type72 === DISTS$1 && used > ENOUGH_DISTS$1) {
        return 1;
      }
      low = huff & mask;
      table[low] = root << 24 | curr << 16 | next - table_index | 0;
    }
  }
  if (huff !== 0) {
    table[next + huff] = len - drop << 24 | 64 << 16 | 0;
  }
  opts.bits = root;
  return 0;
};
var inftrees = inflate_table;
var CODES = 0;
var LENS = 1;
var DISTS = 2;
var {
  Z_FINISH: Z_FINISH$1,
  Z_BLOCK,
  Z_TREES,
  Z_OK: Z_OK$1,
  Z_STREAM_END: Z_STREAM_END$1,
  Z_NEED_DICT: Z_NEED_DICT$1,
  Z_STREAM_ERROR: Z_STREAM_ERROR$1,
  Z_DATA_ERROR: Z_DATA_ERROR$1,
  Z_MEM_ERROR: Z_MEM_ERROR$1,
  Z_BUF_ERROR,
  Z_DEFLATED
} = constants$2;
var HEAD = 1;
var FLAGS = 2;
var TIME = 3;
var OS = 4;
var EXLEN = 5;
var EXTRA = 6;
var NAME = 7;
var COMMENT = 8;
var HCRC = 9;
var DICTID = 10;
var DICT = 11;
var TYPE = 12;
var TYPEDO = 13;
var STORED = 14;
var COPY_ = 15;
var COPY = 16;
var TABLE = 17;
var LENLENS = 18;
var CODELENS = 19;
var LEN_ = 20;
var LEN = 21;
var LENEXT = 22;
var DIST = 23;
var DISTEXT = 24;
var MATCH = 25;
var LIT = 26;
var CHECK = 27;
var LENGTH = 28;
var DONE = 29;
var BAD = 30;
var MEM = 31;
var SYNC = 32;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
var MAX_WBITS = 15;
var DEF_WBITS = MAX_WBITS;
var zswap32 = (q) => {
  return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
};
function InflateState() {
  this.mode = 0;
  this.last = false;
  this.wrap = 0;
  this.havedict = false;
  this.flags = 0;
  this.dmax = 0;
  this.check = 0;
  this.total = 0;
  this.head = null;
  this.wbits = 0;
  this.wsize = 0;
  this.whave = 0;
  this.wnext = 0;
  this.window = null;
  this.hold = 0;
  this.bits = 0;
  this.length = 0;
  this.offset = 0;
  this.extra = 0;
  this.lencode = null;
  this.distcode = null;
  this.lenbits = 0;
  this.distbits = 0;
  this.ncode = 0;
  this.nlen = 0;
  this.ndist = 0;
  this.have = 0;
  this.next = null;
  this.lens = new Uint16Array(320);
  this.work = new Uint16Array(288);
  this.lendyn = null;
  this.distdyn = null;
  this.sane = 0;
  this.back = 0;
  this.was = 0;
}
var inflateResetKeep = (strm) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$1;
  }
  const state2 = strm.state;
  strm.total_in = strm.total_out = state2.total = 0;
  strm.msg = "";
  if (state2.wrap) {
    strm.adler = state2.wrap & 1;
  }
  state2.mode = HEAD;
  state2.last = 0;
  state2.havedict = 0;
  state2.dmax = 32768;
  state2.head = null;
  state2.hold = 0;
  state2.bits = 0;
  state2.lencode = state2.lendyn = new Int32Array(ENOUGH_LENS);
  state2.distcode = state2.distdyn = new Int32Array(ENOUGH_DISTS);
  state2.sane = 1;
  state2.back = -1;
  return Z_OK$1;
};
var inflateReset = (strm) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$1;
  }
  const state2 = strm.state;
  state2.wsize = 0;
  state2.whave = 0;
  state2.wnext = 0;
  return inflateResetKeep(strm);
};
var inflateReset2 = (strm, windowBits) => {
  let wrap;
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$1;
  }
  const state2 = strm.state;
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  } else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR$1;
  }
  if (state2.window !== null && state2.wbits !== windowBits) {
    state2.window = null;
  }
  state2.wrap = wrap;
  state2.wbits = windowBits;
  return inflateReset(strm);
};
var inflateInit2 = (strm, windowBits) => {
  if (!strm) {
    return Z_STREAM_ERROR$1;
  }
  const state2 = new InflateState();
  strm.state = state2;
  state2.window = null;
  const ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK$1) {
    strm.state = null;
  }
  return ret;
};
var inflateInit = (strm) => {
  return inflateInit2(strm, DEF_WBITS);
};
var virgin = true;
var lenfix;
var distfix;
var fixedtables = (state2) => {
  if (virgin) {
    lenfix = new Int32Array(512);
    distfix = new Int32Array(32);
    let sym = 0;
    while (sym < 144) {
      state2.lens[sym++] = 8;
    }
    while (sym < 256) {
      state2.lens[sym++] = 9;
    }
    while (sym < 280) {
      state2.lens[sym++] = 7;
    }
    while (sym < 288) {
      state2.lens[sym++] = 8;
    }
    inftrees(LENS, state2.lens, 0, 288, lenfix, 0, state2.work, { bits: 9 });
    sym = 0;
    while (sym < 32) {
      state2.lens[sym++] = 5;
    }
    inftrees(DISTS, state2.lens, 0, 32, distfix, 0, state2.work, { bits: 5 });
    virgin = false;
  }
  state2.lencode = lenfix;
  state2.lenbits = 9;
  state2.distcode = distfix;
  state2.distbits = 5;
};
var updatewindow = (strm, src, end, copy) => {
  let dist;
  const state2 = strm.state;
  if (state2.window === null) {
    state2.wsize = 1 << state2.wbits;
    state2.wnext = 0;
    state2.whave = 0;
    state2.window = new Uint8Array(state2.wsize);
  }
  if (copy >= state2.wsize) {
    state2.window.set(src.subarray(end - state2.wsize, end), 0);
    state2.wnext = 0;
    state2.whave = state2.wsize;
  } else {
    dist = state2.wsize - state2.wnext;
    if (dist > copy) {
      dist = copy;
    }
    state2.window.set(src.subarray(end - copy, end - copy + dist), state2.wnext);
    copy -= dist;
    if (copy) {
      state2.window.set(src.subarray(end - copy, end), 0);
      state2.wnext = copy;
      state2.whave = state2.wsize;
    } else {
      state2.wnext += dist;
      if (state2.wnext === state2.wsize) {
        state2.wnext = 0;
      }
      if (state2.whave < state2.wsize) {
        state2.whave += dist;
      }
    }
  }
  return 0;
};
var inflate$2 = (strm, flush) => {
  let state2;
  let input, output;
  let next;
  let put;
  let have, left;
  let hold;
  let bits;
  let _in, _out;
  let copy;
  let from;
  let from_source;
  let here = 0;
  let here_bits, here_op, here_val;
  let last_bits, last_op, last_val;
  let len;
  let ret;
  const hbuf = new Uint8Array(4);
  let opts;
  let n;
  const order = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) {
    return Z_STREAM_ERROR$1;
  }
  state2 = strm.state;
  if (state2.mode === TYPE) {
    state2.mode = TYPEDO;
  }
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state2.hold;
  bits = state2.bits;
  _in = have;
  _out = left;
  ret = Z_OK$1;
  inf_leave:
    for (; ; ) {
      switch (state2.mode) {
        case HEAD:
          if (state2.wrap === 0) {
            state2.mode = TYPEDO;
            break;
          }
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state2.wrap & 2 && hold === 35615) {
            state2.check = 0;
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state2.check = crc32_1(state2.check, hbuf, 2, 0);
            hold = 0;
            bits = 0;
            state2.mode = FLAGS;
            break;
          }
          state2.flags = 0;
          if (state2.head) {
            state2.head.done = false;
          }
          if (!(state2.wrap & 1) || (((hold & 255) << 8) + (hold >> 8)) % 31) {
            strm.msg = "incorrect header check";
            state2.mode = BAD;
            break;
          }
          if ((hold & 15) !== Z_DEFLATED) {
            strm.msg = "unknown compression method";
            state2.mode = BAD;
            break;
          }
          hold >>>= 4;
          bits -= 4;
          len = (hold & 15) + 8;
          if (state2.wbits === 0) {
            state2.wbits = len;
          } else if (len > state2.wbits) {
            strm.msg = "invalid window size";
            state2.mode = BAD;
            break;
          }
          state2.dmax = 1 << state2.wbits;
          strm.adler = state2.check = 1;
          state2.mode = hold & 512 ? DICTID : TYPE;
          hold = 0;
          bits = 0;
          break;
        case FLAGS:
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state2.flags = hold;
          if ((state2.flags & 255) !== Z_DEFLATED) {
            strm.msg = "unknown compression method";
            state2.mode = BAD;
            break;
          }
          if (state2.flags & 57344) {
            strm.msg = "unknown header flags set";
            state2.mode = BAD;
            break;
          }
          if (state2.head) {
            state2.head.text = hold >> 8 & 1;
          }
          if (state2.flags & 512) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state2.check = crc32_1(state2.check, hbuf, 2, 0);
          }
          hold = 0;
          bits = 0;
          state2.mode = TIME;
        case TIME:
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state2.head) {
            state2.head.time = hold;
          }
          if (state2.flags & 512) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            hbuf[2] = hold >>> 16 & 255;
            hbuf[3] = hold >>> 24 & 255;
            state2.check = crc32_1(state2.check, hbuf, 4, 0);
          }
          hold = 0;
          bits = 0;
          state2.mode = OS;
        case OS:
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state2.head) {
            state2.head.xflags = hold & 255;
            state2.head.os = hold >> 8;
          }
          if (state2.flags & 512) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state2.check = crc32_1(state2.check, hbuf, 2, 0);
          }
          hold = 0;
          bits = 0;
          state2.mode = EXLEN;
        case EXLEN:
          if (state2.flags & 1024) {
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state2.length = hold;
            if (state2.head) {
              state2.head.extra_len = hold;
            }
            if (state2.flags & 512) {
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              state2.check = crc32_1(state2.check, hbuf, 2, 0);
            }
            hold = 0;
            bits = 0;
          } else if (state2.head) {
            state2.head.extra = null;
          }
          state2.mode = EXTRA;
        case EXTRA:
          if (state2.flags & 1024) {
            copy = state2.length;
            if (copy > have) {
              copy = have;
            }
            if (copy) {
              if (state2.head) {
                len = state2.head.extra_len - state2.length;
                if (!state2.head.extra) {
                  state2.head.extra = new Uint8Array(state2.head.extra_len);
                }
                state2.head.extra.set(input.subarray(next, next + copy), len);
              }
              if (state2.flags & 512) {
                state2.check = crc32_1(state2.check, input, copy, next);
              }
              have -= copy;
              next += copy;
              state2.length -= copy;
            }
            if (state2.length) {
              break inf_leave;
            }
          }
          state2.length = 0;
          state2.mode = NAME;
        case NAME:
          if (state2.flags & 2048) {
            if (have === 0) {
              break inf_leave;
            }
            copy = 0;
            do {
              len = input[next + copy++];
              if (state2.head && len && state2.length < 65536) {
                state2.head.name += String.fromCharCode(len);
              }
            } while (len && copy < have);
            if (state2.flags & 512) {
              state2.check = crc32_1(state2.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            if (len) {
              break inf_leave;
            }
          } else if (state2.head) {
            state2.head.name = null;
          }
          state2.length = 0;
          state2.mode = COMMENT;
        case COMMENT:
          if (state2.flags & 4096) {
            if (have === 0) {
              break inf_leave;
            }
            copy = 0;
            do {
              len = input[next + copy++];
              if (state2.head && len && state2.length < 65536) {
                state2.head.comment += String.fromCharCode(len);
              }
            } while (len && copy < have);
            if (state2.flags & 512) {
              state2.check = crc32_1(state2.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            if (len) {
              break inf_leave;
            }
          } else if (state2.head) {
            state2.head.comment = null;
          }
          state2.mode = HCRC;
        case HCRC:
          if (state2.flags & 512) {
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (hold !== (state2.check & 65535)) {
              strm.msg = "header crc mismatch";
              state2.mode = BAD;
              break;
            }
            hold = 0;
            bits = 0;
          }
          if (state2.head) {
            state2.head.hcrc = state2.flags >> 9 & 1;
            state2.head.done = true;
          }
          strm.adler = state2.check = 0;
          state2.mode = TYPE;
          break;
        case DICTID:
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          strm.adler = state2.check = zswap32(hold);
          hold = 0;
          bits = 0;
          state2.mode = DICT;
        case DICT:
          if (state2.havedict === 0) {
            strm.next_out = put;
            strm.avail_out = left;
            strm.next_in = next;
            strm.avail_in = have;
            state2.hold = hold;
            state2.bits = bits;
            return Z_NEED_DICT$1;
          }
          strm.adler = state2.check = 1;
          state2.mode = TYPE;
        case TYPE:
          if (flush === Z_BLOCK || flush === Z_TREES) {
            break inf_leave;
          }
        case TYPEDO:
          if (state2.last) {
            hold >>>= bits & 7;
            bits -= bits & 7;
            state2.mode = CHECK;
            break;
          }
          while (bits < 3) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state2.last = hold & 1;
          hold >>>= 1;
          bits -= 1;
          switch (hold & 3) {
            case 0:
              state2.mode = STORED;
              break;
            case 1:
              fixedtables(state2);
              state2.mode = LEN_;
              if (flush === Z_TREES) {
                hold >>>= 2;
                bits -= 2;
                break inf_leave;
              }
              break;
            case 2:
              state2.mode = TABLE;
              break;
            case 3:
              strm.msg = "invalid block type";
              state2.mode = BAD;
          }
          hold >>>= 2;
          bits -= 2;
          break;
        case STORED:
          hold >>>= bits & 7;
          bits -= bits & 7;
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
            strm.msg = "invalid stored block lengths";
            state2.mode = BAD;
            break;
          }
          state2.length = hold & 65535;
          hold = 0;
          bits = 0;
          state2.mode = COPY_;
          if (flush === Z_TREES) {
            break inf_leave;
          }
        case COPY_:
          state2.mode = COPY;
        case COPY:
          copy = state2.length;
          if (copy) {
            if (copy > have) {
              copy = have;
            }
            if (copy > left) {
              copy = left;
            }
            if (copy === 0) {
              break inf_leave;
            }
            output.set(input.subarray(next, next + copy), put);
            have -= copy;
            next += copy;
            left -= copy;
            put += copy;
            state2.length -= copy;
            break;
          }
          state2.mode = TYPE;
          break;
        case TABLE:
          while (bits < 14) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state2.nlen = (hold & 31) + 257;
          hold >>>= 5;
          bits -= 5;
          state2.ndist = (hold & 31) + 1;
          hold >>>= 5;
          bits -= 5;
          state2.ncode = (hold & 15) + 4;
          hold >>>= 4;
          bits -= 4;
          if (state2.nlen > 286 || state2.ndist > 30) {
            strm.msg = "too many length or distance symbols";
            state2.mode = BAD;
            break;
          }
          state2.have = 0;
          state2.mode = LENLENS;
        case LENLENS:
          while (state2.have < state2.ncode) {
            while (bits < 3) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state2.lens[order[state2.have++]] = hold & 7;
            hold >>>= 3;
            bits -= 3;
          }
          while (state2.have < 19) {
            state2.lens[order[state2.have++]] = 0;
          }
          state2.lencode = state2.lendyn;
          state2.lenbits = 7;
          opts = { bits: state2.lenbits };
          ret = inftrees(CODES, state2.lens, 0, 19, state2.lencode, 0, state2.work, opts);
          state2.lenbits = opts.bits;
          if (ret) {
            strm.msg = "invalid code lengths set";
            state2.mode = BAD;
            break;
          }
          state2.have = 0;
          state2.mode = CODELENS;
        case CODELENS:
          while (state2.have < state2.nlen + state2.ndist) {
            for (; ; ) {
              here = state2.lencode[hold & (1 << state2.lenbits) - 1];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (here_val < 16) {
              hold >>>= here_bits;
              bits -= here_bits;
              state2.lens[state2.have++] = here_val;
            } else {
              if (here_val === 16) {
                n = here_bits + 2;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                if (state2.have === 0) {
                  strm.msg = "invalid bit length repeat";
                  state2.mode = BAD;
                  break;
                }
                len = state2.lens[state2.have - 1];
                copy = 3 + (hold & 3);
                hold >>>= 2;
                bits -= 2;
              } else if (here_val === 17) {
                n = here_bits + 3;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                len = 0;
                copy = 3 + (hold & 7);
                hold >>>= 3;
                bits -= 3;
              } else {
                n = here_bits + 7;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                len = 0;
                copy = 11 + (hold & 127);
                hold >>>= 7;
                bits -= 7;
              }
              if (state2.have + copy > state2.nlen + state2.ndist) {
                strm.msg = "invalid bit length repeat";
                state2.mode = BAD;
                break;
              }
              while (copy--) {
                state2.lens[state2.have++] = len;
              }
            }
          }
          if (state2.mode === BAD) {
            break;
          }
          if (state2.lens[256] === 0) {
            strm.msg = "invalid code -- missing end-of-block";
            state2.mode = BAD;
            break;
          }
          state2.lenbits = 9;
          opts = { bits: state2.lenbits };
          ret = inftrees(LENS, state2.lens, 0, state2.nlen, state2.lencode, 0, state2.work, opts);
          state2.lenbits = opts.bits;
          if (ret) {
            strm.msg = "invalid literal/lengths set";
            state2.mode = BAD;
            break;
          }
          state2.distbits = 6;
          state2.distcode = state2.distdyn;
          opts = { bits: state2.distbits };
          ret = inftrees(DISTS, state2.lens, state2.nlen, state2.ndist, state2.distcode, 0, state2.work, opts);
          state2.distbits = opts.bits;
          if (ret) {
            strm.msg = "invalid distances set";
            state2.mode = BAD;
            break;
          }
          state2.mode = LEN_;
          if (flush === Z_TREES) {
            break inf_leave;
          }
        case LEN_:
          state2.mode = LEN;
        case LEN:
          if (have >= 6 && left >= 258) {
            strm.next_out = put;
            strm.avail_out = left;
            strm.next_in = next;
            strm.avail_in = have;
            state2.hold = hold;
            state2.bits = bits;
            inffast(strm, _out);
            put = strm.next_out;
            output = strm.output;
            left = strm.avail_out;
            next = strm.next_in;
            input = strm.input;
            have = strm.avail_in;
            hold = state2.hold;
            bits = state2.bits;
            if (state2.mode === TYPE) {
              state2.back = -1;
            }
            break;
          }
          state2.back = 0;
          for (; ; ) {
            here = state2.lencode[hold & (1 << state2.lenbits) - 1];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 255;
            here_val = here & 65535;
            if (here_bits <= bits) {
              break;
            }
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (here_op && (here_op & 240) === 0) {
            last_bits = here_bits;
            last_op = here_op;
            last_val = here_val;
            for (; ; ) {
              here = state2.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (last_bits + here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            hold >>>= last_bits;
            bits -= last_bits;
            state2.back += last_bits;
          }
          hold >>>= here_bits;
          bits -= here_bits;
          state2.back += here_bits;
          state2.length = here_val;
          if (here_op === 0) {
            state2.mode = LIT;
            break;
          }
          if (here_op & 32) {
            state2.back = -1;
            state2.mode = TYPE;
            break;
          }
          if (here_op & 64) {
            strm.msg = "invalid literal/length code";
            state2.mode = BAD;
            break;
          }
          state2.extra = here_op & 15;
          state2.mode = LENEXT;
        case LENEXT:
          if (state2.extra) {
            n = state2.extra;
            while (bits < n) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state2.length += hold & (1 << state2.extra) - 1;
            hold >>>= state2.extra;
            bits -= state2.extra;
            state2.back += state2.extra;
          }
          state2.was = state2.length;
          state2.mode = DIST;
        case DIST:
          for (; ; ) {
            here = state2.distcode[hold & (1 << state2.distbits) - 1];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 255;
            here_val = here & 65535;
            if (here_bits <= bits) {
              break;
            }
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if ((here_op & 240) === 0) {
            last_bits = here_bits;
            last_op = here_op;
            last_val = here_val;
            for (; ; ) {
              here = state2.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (last_bits + here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            hold >>>= last_bits;
            bits -= last_bits;
            state2.back += last_bits;
          }
          hold >>>= here_bits;
          bits -= here_bits;
          state2.back += here_bits;
          if (here_op & 64) {
            strm.msg = "invalid distance code";
            state2.mode = BAD;
            break;
          }
          state2.offset = here_val;
          state2.extra = here_op & 15;
          state2.mode = DISTEXT;
        case DISTEXT:
          if (state2.extra) {
            n = state2.extra;
            while (bits < n) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state2.offset += hold & (1 << state2.extra) - 1;
            hold >>>= state2.extra;
            bits -= state2.extra;
            state2.back += state2.extra;
          }
          if (state2.offset > state2.dmax) {
            strm.msg = "invalid distance too far back";
            state2.mode = BAD;
            break;
          }
          state2.mode = MATCH;
        case MATCH:
          if (left === 0) {
            break inf_leave;
          }
          copy = _out - left;
          if (state2.offset > copy) {
            copy = state2.offset - copy;
            if (copy > state2.whave) {
              if (state2.sane) {
                strm.msg = "invalid distance too far back";
                state2.mode = BAD;
                break;
              }
            }
            if (copy > state2.wnext) {
              copy -= state2.wnext;
              from = state2.wsize - copy;
            } else {
              from = state2.wnext - copy;
            }
            if (copy > state2.length) {
              copy = state2.length;
            }
            from_source = state2.window;
          } else {
            from_source = output;
            from = put - state2.offset;
            copy = state2.length;
          }
          if (copy > left) {
            copy = left;
          }
          left -= copy;
          state2.length -= copy;
          do {
            output[put++] = from_source[from++];
          } while (--copy);
          if (state2.length === 0) {
            state2.mode = LEN;
          }
          break;
        case LIT:
          if (left === 0) {
            break inf_leave;
          }
          output[put++] = state2.length;
          left--;
          state2.mode = LEN;
          break;
        case CHECK:
          if (state2.wrap) {
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold |= input[next++] << bits;
              bits += 8;
            }
            _out -= left;
            strm.total_out += _out;
            state2.total += _out;
            if (_out) {
              strm.adler = state2.check = state2.flags ? crc32_1(state2.check, output, _out, put - _out) : adler32_1(state2.check, output, _out, put - _out);
            }
            _out = left;
            if ((state2.flags ? hold : zswap32(hold)) !== state2.check) {
              strm.msg = "incorrect data check";
              state2.mode = BAD;
              break;
            }
            hold = 0;
            bits = 0;
          }
          state2.mode = LENGTH;
        case LENGTH:
          if (state2.wrap && state2.flags) {
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (hold !== (state2.total & 4294967295)) {
              strm.msg = "incorrect length check";
              state2.mode = BAD;
              break;
            }
            hold = 0;
            bits = 0;
          }
          state2.mode = DONE;
        case DONE:
          ret = Z_STREAM_END$1;
          break inf_leave;
        case BAD:
          ret = Z_DATA_ERROR$1;
          break inf_leave;
        case MEM:
          return Z_MEM_ERROR$1;
        case SYNC:
        default:
          return Z_STREAM_ERROR$1;
      }
    }
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state2.hold = hold;
  state2.bits = bits;
  if (state2.wsize || _out !== strm.avail_out && state2.mode < BAD && (state2.mode < CHECK || flush !== Z_FINISH$1)) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out))
      ;
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state2.total += _out;
  if (state2.wrap && _out) {
    strm.adler = state2.check = state2.flags ? crc32_1(state2.check, output, _out, strm.next_out - _out) : adler32_1(state2.check, output, _out, strm.next_out - _out);
  }
  strm.data_type = state2.bits + (state2.last ? 64 : 0) + (state2.mode === TYPE ? 128 : 0) + (state2.mode === LEN_ || state2.mode === COPY_ ? 256 : 0);
  if ((_in === 0 && _out === 0 || flush === Z_FINISH$1) && ret === Z_OK$1) {
    ret = Z_BUF_ERROR;
  }
  return ret;
};
var inflateEnd = (strm) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$1;
  }
  let state2 = strm.state;
  if (state2.window) {
    state2.window = null;
  }
  strm.state = null;
  return Z_OK$1;
};
var inflateGetHeader = (strm, head) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$1;
  }
  const state2 = strm.state;
  if ((state2.wrap & 2) === 0) {
    return Z_STREAM_ERROR$1;
  }
  state2.head = head;
  head.done = false;
  return Z_OK$1;
};
var inflateSetDictionary = (strm, dictionary) => {
  const dictLength = dictionary.length;
  let state2;
  let dictid;
  let ret;
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$1;
  }
  state2 = strm.state;
  if (state2.wrap !== 0 && state2.mode !== DICT) {
    return Z_STREAM_ERROR$1;
  }
  if (state2.mode === DICT) {
    dictid = 1;
    dictid = adler32_1(dictid, dictionary, dictLength, 0);
    if (dictid !== state2.check) {
      return Z_DATA_ERROR$1;
    }
  }
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state2.mode = MEM;
    return Z_MEM_ERROR$1;
  }
  state2.havedict = 1;
  return Z_OK$1;
};
var inflateReset_1 = inflateReset;
var inflateReset2_1 = inflateReset2;
var inflateResetKeep_1 = inflateResetKeep;
var inflateInit_1 = inflateInit;
var inflateInit2_1 = inflateInit2;
var inflate_2$1 = inflate$2;
var inflateEnd_1 = inflateEnd;
var inflateGetHeader_1 = inflateGetHeader;
var inflateSetDictionary_1 = inflateSetDictionary;
var inflateInfo = "pako inflate (from Nodeca project)";
var inflate_1$2 = {
  inflateReset: inflateReset_1,
  inflateReset2: inflateReset2_1,
  inflateResetKeep: inflateResetKeep_1,
  inflateInit: inflateInit_1,
  inflateInit2: inflateInit2_1,
  inflate: inflate_2$1,
  inflateEnd: inflateEnd_1,
  inflateGetHeader: inflateGetHeader_1,
  inflateSetDictionary: inflateSetDictionary_1,
  inflateInfo
};
function GZheader() {
  this.text = 0;
  this.time = 0;
  this.xflags = 0;
  this.os = 0;
  this.extra = null;
  this.extra_len = 0;
  this.name = "";
  this.comment = "";
  this.hcrc = 0;
  this.done = false;
}
var gzheader = GZheader;
var toString = Object.prototype.toString;
var {
  Z_NO_FLUSH,
  Z_FINISH,
  Z_OK,
  Z_STREAM_END,
  Z_NEED_DICT,
  Z_STREAM_ERROR,
  Z_DATA_ERROR,
  Z_MEM_ERROR
} = constants$2;
function Inflate$1(options2) {
  this.options = common.assign({
    chunkSize: 1024 * 64,
    windowBits: 15,
    to: ""
  }, options2 || {});
  const opt = this.options;
  if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) {
      opt.windowBits = -15;
    }
  }
  if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options2 && options2.windowBits)) {
    opt.windowBits += 32;
  }
  if (opt.windowBits > 15 && opt.windowBits < 48) {
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }
  this.err = 0;
  this.msg = "";
  this.ended = false;
  this.chunks = [];
  this.strm = new zstream();
  this.strm.avail_out = 0;
  let status = inflate_1$2.inflateInit2(this.strm, opt.windowBits);
  if (status !== Z_OK) {
    throw new Error(messages[status]);
  }
  this.header = new gzheader();
  inflate_1$2.inflateGetHeader(this.strm, this.header);
  if (opt.dictionary) {
    if (typeof opt.dictionary === "string") {
      opt.dictionary = strings.string2buf(opt.dictionary);
    } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
      opt.dictionary = new Uint8Array(opt.dictionary);
    }
    if (opt.raw) {
      status = inflate_1$2.inflateSetDictionary(this.strm, opt.dictionary);
      if (status !== Z_OK) {
        throw new Error(messages[status]);
      }
    }
  }
}
Inflate$1.prototype.push = function(data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  const dictionary = this.options.dictionary;
  let status, _flush_mode, last_avail_out;
  if (this.ended)
    return false;
  if (flush_mode === ~~flush_mode)
    _flush_mode = flush_mode;
  else
    _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;
  if (toString.call(data) === "[object ArrayBuffer]") {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }
  strm.next_in = 0;
  strm.avail_in = strm.input.length;
  for (; ; ) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    status = inflate_1$2.inflate(strm, _flush_mode);
    if (status === Z_NEED_DICT && dictionary) {
      status = inflate_1$2.inflateSetDictionary(strm, dictionary);
      if (status === Z_OK) {
        status = inflate_1$2.inflate(strm, _flush_mode);
      } else if (status === Z_DATA_ERROR) {
        status = Z_NEED_DICT;
      }
    }
    while (strm.avail_in > 0 && status === Z_STREAM_END && strm.state.wrap > 0 && data[strm.next_in] !== 0) {
      inflate_1$2.inflateReset(strm);
      status = inflate_1$2.inflate(strm, _flush_mode);
    }
    switch (status) {
      case Z_STREAM_ERROR:
      case Z_DATA_ERROR:
      case Z_NEED_DICT:
      case Z_MEM_ERROR:
        this.onEnd(status);
        this.ended = true;
        return false;
    }
    last_avail_out = strm.avail_out;
    if (strm.next_out) {
      if (strm.avail_out === 0 || status === Z_STREAM_END) {
        if (this.options.to === "string") {
          let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
          let tail = strm.next_out - next_out_utf8;
          let utf8str = strings.buf2string(strm.output, next_out_utf8);
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail)
            strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);
          this.onData(utf8str);
        } else {
          this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
        }
      }
    }
    if (status === Z_OK && last_avail_out === 0)
      continue;
    if (status === Z_STREAM_END) {
      status = inflate_1$2.inflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return true;
    }
    if (strm.avail_in === 0)
      break;
  }
  return true;
};
Inflate$1.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};
Inflate$1.prototype.onEnd = function(status) {
  if (status === Z_OK) {
    if (this.options.to === "string") {
      this.result = this.chunks.join("");
    } else {
      this.result = common.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};
function inflate$1(input, options2) {
  const inflator = new Inflate$1(options2);
  inflator.push(input);
  if (inflator.err)
    throw inflator.msg || messages[inflator.err];
  return inflator.result;
}
function inflateRaw$1(input, options2) {
  options2 = options2 || {};
  options2.raw = true;
  return inflate$1(input, options2);
}
var Inflate_1$1 = Inflate$1;
var inflate_2 = inflate$1;
var inflateRaw_1$1 = inflateRaw$1;
var ungzip$1 = inflate$1;
var constants = constants$2;
var inflate_1$1 = {
  Inflate: Inflate_1$1,
  inflate: inflate_2,
  inflateRaw: inflateRaw_1$1,
  ungzip: ungzip$1,
  constants
};
var { Deflate, deflate, deflateRaw, gzip } = deflate_1$1;
var { Inflate, inflate, inflateRaw, ungzip } = inflate_1$1;
var Deflate_1 = Deflate;
var deflate_1 = deflate;
var deflateRaw_1 = deflateRaw;
var gzip_1 = gzip;
var Inflate_1 = Inflate;
var inflate_1 = inflate;
var inflateRaw_1 = inflateRaw;
var ungzip_1 = ungzip;
var constants_1 = constants$2;
var pako = {
  Deflate: Deflate_1,
  deflate: deflate_1,
  deflateRaw: deflateRaw_1,
  gzip: gzip_1,
  Inflate: Inflate_1,
  inflate: inflate_1,
  inflateRaw: inflateRaw_1,
  ungzip: ungzip_1,
  constants: constants_1
};
var decode = (o) => {
  return new Promise((resolve3, reject) => {
    try {
      o.buffer = pako.inflate(o.buffer).buffer;
      resolve3(o);
    } catch (e) {
      console.error(e);
      return reject(false);
    }
  });
};
var encode = (o) => pako.deflate(o);
var type = "application/x-gzip";
var suffixes = "gz";
var text_exports = {};
__export3(text_exports, {
  decode: () => decode2,
  encode: () => encode2,
  suffixes: () => suffixes2,
  type: () => type2
});
var type2 = "text/plain";
var suffixes2 = "txt";
var encode2 = (o) => new TextEncoder().encode(o ? o.toString() : "");
var decode2 = (o) => new TextDecoder().decode(o.buffer);
var decode3 = async (o, type72, name22, config2, defaultCodec = text_exports, codecs) => {
  const { mimeType, zipped: zipped22 } = get4(type72, name22, codecs);
  if (zipped22)
    o = await decode(o);
  if (mimeType && (mimeType.includes("image/") || mimeType.includes("video/")))
    return o.dataurl;
  const codec = codecs ? codecs.get(mimeType) : null;
  if (codec && codec.decode instanceof Function)
    return codec.decode(o, config2);
  else {
    console.warn(`No decoder for ${mimeType}. Defaulting to ${defaultCodec.type}...`);
    return defaultCodec.decode(o, config2);
  }
};
var decode_default = decode3;
var encode3 = (o) => {
  var byteString = atob(o.split(",")[1]);
  const ab = new ArrayBuffer(byteString.length);
  var iab = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    iab[i] = byteString.charCodeAt(i);
  }
  return iab;
};
var encode4 = async (o, type72, name22, config2, defaultCodec = text_exports, codecs) => {
  let buffer = new ArrayBuffer(0);
  const { mimeType, zipped: zipped22 } = get4(type72, name22, codecs);
  if (mimeType && (mimeType.includes("image/") || mimeType.includes("video/")))
    return encode3(o);
  const codec = codecs ? codecs.get(mimeType) : null;
  if (codec && codec.encode instanceof Function)
    buffer = codec.encode(o, config2);
  else {
    console.warn(`No encoder for ${mimeType}. Defaulting to ${defaultCodec.type}...`);
    buffer = defaultCodec.encode(o, config2);
  }
  if (zipped22)
    buffer = await encode(buffer);
  return buffer;
};
var encode_default = encode4;
var transferEach = async (f, system) => {
  const path = f.path;
  if (!f.storage.buffer)
    f.storage = await f.getFileData();
  const blob = new Blob([f.storage.buffer]);
  blob.name = f.name;
  await system.open(path, true);
  await f.sync();
};
var transfer = async (previousSystem, targetSystem, transferList) => {
  if (!transferList)
    transferList = Array.from(previousSystem.files.list.values());
  const notTransferred = transferList.filter((f) => f.method != "transferred");
  if (notTransferred.length > 0) {
    if (!targetSystem) {
      const SystemConstructor = previousSystem.constructor;
      targetSystem = new SystemConstructor(void 0, {
        native: previousSystem.native,
        debug: previousSystem.debug,
        ignore: previousSystem.ignore,
        writable: true,
        progress: previousSystem.progress,
        codecs: previousSystem.codecs
      });
      await targetSystem.init();
    }
    console.warn(`Starting transfer of ${notTransferred.length} files from ${previousSystem.name} to ${targetSystem.name}`, transferList);
    const tic = performance.now();
    await Promise.all(notTransferred.map(async (f) => transferEach(f, targetSystem)));
    const toc = performance.now();
    console.warn(`Time to transfer files to ${targetSystem.name}: ${toc - tic}ms`);
    targetSystem.writable = false;
    await previousSystem.apply(targetSystem);
    await Promise.all(notTransferred.map(async (f) => f.save(true)));
  }
};
var transfer_default = transfer;
function isClass(obj = {}) {
  const isCtorClass = obj.constructor && obj.constructor.toString().substring(0, 5) === "class";
  if (obj.prototype === void 0) {
    return isCtorClass;
  }
  const isPrototypeCtorClass = obj.prototype.constructor && obj.prototype.constructor.toString && obj.prototype.constructor.toString().substring(0, 5) === "class";
  return isCtorClass || isPrototypeCtorClass;
}
var urlSep3 = "://";
var get22 = (path, rel = "", keepRelativeImports = false, relIsDirectory = false) => {
  let prefix = "";
  const getPrefix = (str) => {
    prefix = str.includes(urlSep3) ? str.split(urlSep3).splice(0, 1) : void 0;
    if (prefix)
      return str.replace(`${prefix}${urlSep3}`, "");
    else
      return str;
  };
  if (path.includes(urlSep3))
    path = getPrefix(path);
  if (rel.includes(urlSep3))
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
    if (relIsDirectory || splitPath2.length == 1 || splitPath2.length > 1 && splitPath2.includes(""))
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
var networkErrorMessages = ["Failed to fetch", "NetworkError when attempting to fetch resource.", "Network request failed"];
var isNetworkErrorMessage = (msg) => networkErrorMessages.includes(msg);
var isNetworkError = (error) => error.name === "TypeError" && isNetworkErrorMessage(error.message);
var getURL2 = (path) => {
  let url;
  try {
    url = new URL(path).href;
  } catch {
    url = get22(path, globalThis.location.href);
  }
  return url;
};
var handleFetch2 = async (path, options2 = {}, progressCallback) => {
  if (!options2.mode)
    options2.mode = "cors";
  const url = getURL2(path);
  const response = await fetchRemote2(url, options2, progressCallback);
  if (!response)
    throw new Error("No response received.");
  const type72 = response.type.split(";")[0];
  return {
    url,
    type: type72,
    buffer: response.buffer
  };
};
var fetchRemote2 = async (url, options2 = {}, progressCallback) => {
  options2.timeout = 3e3;
  const response = await fetchWithTimeout(url, options2);
  return new Promise(async (resolve3) => {
    if (response) {
      const type72 = response.headers.get("Content-Type");
      if (globalThis.FREERANGE_NODE) {
        const buffer = await response.arrayBuffer();
        resolve3({ buffer, type: type72 });
      } else {
        const reader = response.body.getReader();
        const bytes = parseInt(response.headers.get("Content-Length"), 10);
        let bytesReceived = 0;
        let buffer = [];
        const processBuffer = async ({ done, value }) => {
          if (done) {
            const config2 = {};
            if (typeof type72 === "string")
              config2.type = type72;
            const blob = new Blob(buffer, config2);
            const ab = await blob.arrayBuffer();
            resolve3({ buffer: new Uint8Array(ab), type: type72 });
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
      console.warn("Response not received!", options2.headers);
      resolve3(void 0);
    }
  });
};
async function fetchWithTimeout(resource, options2 = {}) {
  const { timeout = 8e3 } = options2;
  const controller = new AbortController();
  const id = setTimeout(() => {
    console.warn(`Request to ${resource} took longer than ${(timeout / 1e3).toFixed(2)}s`);
    controller.abort();
    throw new Error(`Request timeout`);
  }, timeout);
  const response = await globalThis.fetch(resource, {
    ...options2,
    signal: controller.signal
  }).catch((e) => {
    clearTimeout(id);
    const networkError = isNetworkError(e);
    if (networkError) {
      throw new Error("No internet.");
    } else
      throw e;
  });
  clearTimeout(id);
  if (!response.ok) {
    if (response.status === 404)
      throw new Error(`Resource not found.`);
    else
      throw response;
  }
  return response;
}
var iterAsync = async (iterable, asyncCallback) => {
  const promises = [];
  let i = 0;
  for await (const entry of iterable) {
    promises.push(asyncCallback(entry, i));
    i++;
  }
  const arr = await Promise.all(promises);
  return arr;
};
var iterate_default = iterAsync;
var useRawArrayBuffer = ["nii", "nwb"];
var RangeFile = class {
  constructor(file, options2) {
    this.rangeConfig = null;
    this.rangeSupported = false;
    this.createFile = async (buffer, oldFile = this.file, create3 = false) => {
      let newFile = new Blob([buffer], oldFile);
      newFile.lastModified = oldFile.lastModified;
      newFile.name = oldFile.name;
      newFile.webkitRelativePath = oldFile.webkitRelativePath || get22(this.path || this.name, this.system.root);
      if (create3 && !this.fileSystemHandle) {
        console.warn(`Native file handle for ${this.path} does not exist. Choosing a filesystem to mount...`);
        await transfer_default(this.system);
        return;
      }
      return newFile;
    };
    this.loadFileInfo = (file2 = this.file) => {
      if (file2) {
        this.name = file2.name;
        this.type = file2.type;
        const { mimeType, zipped: zipped22, suffix: suffix22 } = get4(file2.type, file2.name, this.system.codecs);
        this.mimeType = mimeType;
        this.zipped = zipped22;
        this.suffix = suffix22;
      } else
        console.warn("Valid file object not provided...");
    };
    this.init = async (file2 = this.file) => {
      if (!file2 && this.fileSystemHandle) {
        file2 = await this.fileSystemHandle.getFile();
        this.loadFileInfo(file2);
      }
      const loader = this.system.codecs.get(this.mimeType);
      const rangeConfig = loader?.config;
      if (rangeConfig)
        this.rangeConfig = rangeConfig;
      else {
        if (!loader)
          console.warn(`Cannot find a configuration file for ${this.path}. Please provide the correct codec.`);
      }
      this.rangeSupported = !!this.rangeConfig;
      let converted = false;
      if (this.method != "remote") {
        this.storage = await this.getFileData(file2).catch(this.onError);
        if (!converted) {
          if (this.storage?.buffer)
            this.file = await this.createFile(this.storage.buffer);
          else if (this.debug)
            console.warn(`No buffer created for ${this.path}...`);
        }
      }
      await this.setupByteGetters();
    };
    this.setOriginal = async (reference = "body") => {
      if (this.rangeSupported) {
        this[`#original${reference}`] = null;
        if (this.debug)
          console.warn("Will not stringify bodies that support range requests.");
      } else if (isClass(this[`#${reference}`])) {
        this[`#original${reference}`] = null;
        if (this.debug)
          console.warn("Will not deep clone file bodies that are class instances");
      } else {
        try {
          const tic = performance.now();
          const value = await this[`#${reference}`];
          if (typeof this[`#${reference}`] === "object")
            this[`#original${reference}`] = JSON.parse(JSON.stringify(value));
          else
            this[`#original${reference}`] = value;
          const toc = performance.now();
          if (this.debug)
            console.warn(`Time to Deep Clone (${this.path}): ${toc - tic}ms`);
        } catch (e) {
          this[`#original${reference}`] = null;
          if (this.debug)
            console.warn("Could not deep clone", e);
        }
      }
    };
    this.get = async (ref2 = "body", codec) => {
      try {
        if (!this[`#${ref2}`]) {
          const ticDecode = performance.now();
          const storageExists = this.storage.buffer;
          if (!storageExists && !this.rangeSupported)
            this.storage = await this.getFileData();
          this[`#${ref2}`] = codec ? await codec.decode(this.storage, this.config) : await this.system.codecs.decode(this.storage, this.mimeType, this.file.name, this.config).catch(this.onError);
          const tocDecode = performance.now();
          if (this.debug)
            console.warn(`Time to Decode (${this.path}): ${tocDecode - ticDecode}ms`);
        }
        if (this[`#original${ref2}`] === void 0)
          await this.setOriginal(ref2);
        return this[`#${ref2}`];
      } catch (e) {
        const msg = `Decoder failed for ${this.path} - ${this.mimeType || "No file type recognized"}`;
        if (this.debug)
          console.warn(msg, e);
        return {};
      }
    };
    this.set = (val, ref2 = "body") => this[`#${ref2}`] = val;
    this.reencode = async (ref2 = "body", codec) => {
      try {
        const value = await this[`${ref2}`];
        const modifiedString = JSON.stringify(value);
        const ogString = JSON.stringify(this[`#original${ref2}`]);
        const different = modifiedString !== ogString;
        if (different) {
          if (this.debug)
            console.warn(`Synching file contents with buffer (${this.path})`, different ? `${ogString} > ${modifiedString}` : modifiedString);
          const toEncode = value ?? "";
          try {
            const ticEncode = performance.now();
            const buffer = codec ? await codec.encode(toEncode, this.config) : await this.system.codecs.encode(toEncode, this.mimeType, this.file.name, this.config);
            const tocEncode = performance.now();
            if (this.debug)
              console.warn(`Time to Encode (${this.path}): ${tocEncode - ticEncode}ms`);
            return buffer;
          } catch (e) {
            console.error("Could not encode as a buffer", toEncode, this.mimeType, this.zipped, codec);
            this.onError(e);
          }
        }
      } catch (e) {
        console.warn(e, this[`#${ref2}`], this[`#original${ref2}`]);
      }
    };
    this.sync = async (autosync = !(this.file instanceof Blob) || !!this.remote, create3 = void 0) => {
      if (this.rangeSupported) {
        if (this.debug)
          console.warn(`Write access is disabled for RangeFile with range-gettable properties (${this.path})`);
        return true;
      } else {
        const bodyEncoded = await this.reencode();
        const textEncoded = await this.reencode("text", text_exports);
        const toSave = bodyEncoded ?? textEncoded;
        if (Array.isArray(autosync))
          autosync = autosync.reduce((a, b) => {
            if (this.name === b)
              return a * 0;
            else if (this.path.includes(`${b}/`))
              return a * 0;
            else if (b.includes("*")) {
              const main2 = b.replace("*", "");
              if (this.path.slice(-main2.length) === main2)
                return a * 0;
              else
                return a * 1;
            } else
              return a * 1;
          }, 1) ? true : false;
        if (this.debug && autosync)
          console.warn(`Forcing save of ${this.path}`);
        if (autosync || toSave) {
          if (toSave)
            this.storage.buffer = toSave;
          const newFile = await this.createFile(this.storage.buffer, this.file, create3);
          if (newFile)
            this.file = newFile;
          else {
            if (this.debug)
              console.warn(`New file not created for ${this.path}`);
            return;
          }
          if (toSave) {
            if (textEncoded)
              this["#body"] = null;
            if (bodyEncoded)
              this["#text"] = null;
          } else {
            await this.setOriginal();
            await this.setOriginal("text");
          }
          return this.file;
        } else
          return true;
      }
    };
    this.save = async (autosync = !!this.remote) => {
      const file2 = await this.sync(autosync, true);
      if (file2 instanceof Blob) {
        const writable = await this.fileSystemHandle.createWritable();
        const stream = file2.stream();
        const tic = performance.now();
        await stream.pipeTo(writable);
        const toc = performance.now();
        if (this.debug)
          console.warn(`Time to stream into file (${this.path}): ${toc - tic}ms`);
      }
      const dependents = this.system.dependents[this.path];
      if (dependents)
        await iterate_default(dependents.values(), async (f) => f["#body"] = null);
    };
    this.onError = (e) => {
      console.error(e);
    };
    this.getFromBytes = async (key, property = this.rangeConfig.properties[key], parent, i) => {
      if (property) {
        let start2 = await this.getProperty(property.start, parent, i);
        const length = await this.getProperty(property.length, parent, i);
        let bytes = new ArrayBuffer(0);
        if (this.method === "remote") {
          bytes = await this.getRemote({ start: start2, length });
        } else {
          let tempBytes = [];
          if (!Array.isArray(start2))
            start2 = [start2];
          start2.forEach((i2) => tempBytes.push(this.storage.buffer.slice(i2, i2 + length)));
          const totalLen = tempBytes.reduce((a, b) => a + b.length, 0);
          const tic2 = performance.now();
          let offset = 0;
          let uBytes = new Uint8Array(totalLen);
          tempBytes.forEach((arr) => {
            uBytes.set(arr, offset);
            offset += arr.length;
          });
          bytes = uBytes;
          const toc2 = performance.now();
          if (this.debug && start2.length > 1)
            console.warn(`Time to merge arrays (${this.path}): ${toc2 - tic2}ms`);
        }
        const tic = performance.now();
        let output = property.ignoreGlobalPostprocess ? bytes : this.rangeConfig.preprocess(bytes);
        if (property.postprocess instanceof Function)
          output = await property.postprocess(output, this["#body"], i);
        const toc = performance.now();
        if (this.debug)
          console.warn(`Time to postprocess bytes (${this.path}, ${key}, ${start2}-${start2 + length}): ${toc - tic}ms`);
        return output;
      } else {
        if (this.debug)
          console.warn(`No getter for ${key}`);
      }
    };
    this.getProperty = async (property, parent, i = void 0) => {
      if (property instanceof Function) {
        try {
          return property(this["#body"], parent, i).catch((e) => console.error(e));
        } catch {
          return property(this["#body"], parent, i);
        }
      } else
        return property;
    };
    this.defineProperty = async (key, property, parent, i = void 0) => {
      if ("start" in property && property.length) {
        Object.defineProperties(parent, {
          [key]: {
            enumerable: true,
            get: () => {
              if (!parent[`#${key}`])
                parent[`#${key}`] = this.getFromBytes(key, property, parent, i);
              return parent[`#${key}`];
            }
          },
          [`#${key}`]: {
            writable: true,
            enumerable: false
          }
        });
      } else if (property.n && property.properties) {
        this["#body"][key] = [];
        const n = await this.getProperty(property.n, property);
        for (let i2 = 0; i2 < n; i2++) {
          const value = {};
          Object.defineProperty(value, "n", { get: () => n });
          for (let prop in property.properties) {
            await this.defineProperty(prop, property.properties[prop], value, i2);
          }
          this["#body"][key].push(value);
        }
      }
    };
    this.setupByteGetters = async () => {
      if (!("body" in this)) {
        Object.defineProperties(this, {
          ["body"]: {
            enumerable: true,
            get: async () => this.get(),
            set: (val) => this.set(val)
          },
          [`#body`]: {
            writable: true,
            enumerable: false
          }
        });
      }
      if (!("text" in this)) {
        Object.defineProperties(this, {
          ["text"]: {
            enumerable: true,
            get: async () => this.get("text", text_exports),
            set: (val) => this.set(val, "text")
          },
          [`#text`]: {
            writable: true,
            enumerable: false
          }
        });
      }
      this["#body"] = "";
      this["#text"] = "";
      if (this.rangeSupported) {
        this[`#body`] = {};
        for (let key in this.rangeConfig.properties)
          await this.defineProperty(key, this.rangeConfig.properties[key], this["#body"]);
        if (this.rangeConfig.metadata instanceof Function)
          await this.rangeConfig.metadata(this["#body"], this.rangeConfig);
      }
    };
    this.apply = async (newFile, applyData = true) => {
      if (!this.fileSystemHandle) {
        this.fileSystemHandle = newFile.fileSystemHandle;
        this.method = "transferred";
      }
      if (applyData)
        await this.init(newFile.file);
      this["#body"] = null;
      this["#text"] = null;
    };
    this.getRemote = async (property = {}) => {
      let { start: start2, length } = property;
      const options3 = Object.assign({}, this.remoteOptions);
      if (!Array.isArray(start2))
        start2 = [start2];
      if (start2.length < 1)
        return new Uint8Array();
      else {
        const isDefined = start2[0] != void 0;
        if (isDefined) {
          let Range = `bytes=${start2.map((val) => `${length ? `${val}-${val + length - 1}` : val}`).join(", ")}`;
          const maxHeaderLength = 15e3;
          if (Range.length > maxHeaderLength) {
            const splitRange = Range.slice(0, maxHeaderLength).split(", ");
            console.warn(`Only sending ${splitRange.length - 1} from ${start2.length} range requests to remain under the --max-http-header-size=${1600} limit`);
            Range = splitRange.slice(0, splitRange.length - 1).join(", ");
          }
          options3.headers = Object.assign({ Range }, options3.headers);
        }
        const o = await fetchRemote2(get22(this.remote.path, this.remote.origin), options3);
        return o.buffer;
      }
    };
    this.getFileData = (file2 = this.file) => {
      return new Promise(async (resolve3, reject) => {
        if (this.method === "remote") {
          const buffer = await this.getRemote();
          this.file = file2 = await this.createFile(buffer);
          resolve3({ file: file2, buffer });
        } else {
          this.file = file2;
          let method2 = "buffer";
          if (file2.type && (file2.type.includes("image/") || file2.type.includes("video/")))
            method2 = "dataurl";
          if (globalThis.FREERANGE_NODE) {
            const methods = {
              "dataurl": "dataURL",
              "buffer": "arrayBuffer"
            };
            const data = await file2[methods[method2]]();
            resolve3({ file: file2, [method2]: this.handleData(data) });
          } else {
            const methods = {
              "dataurl": "readAsDataURL",
              "buffer": "readAsArrayBuffer"
            };
            const reader = new FileReader();
            reader.onloadend = (e) => {
              if (e.target.readyState == FileReader.DONE) {
                if (!e.target.result)
                  return reject(`No result returned using the ${method2} method on ${this.file.name}`);
                let data = e.target.result;
                resolve3({ file: file2, [method2]: this.handleData(data) });
              } else if (e.target.readyState == FileReader.EMPTY) {
                if (this.debug)
                  console.warn(`${this.file.name} is empty`);
                resolve3({ file: file2, [method2]: new Uint8Array() });
              }
            };
            reader[methods[method2]](file2);
          }
        }
      });
    };
    this.handleData = (data) => {
      if ((data["byteLength"] ?? data["length"]) === 0) {
        if (this.debug)
          console.warn(`${this.file.name} appears to be empty`);
        return new Uint8Array();
      } else if (data instanceof ArrayBuffer && !useRawArrayBuffer.includes(this.suffix))
        return new Uint8Array(data);
      else
        return data;
    };
    if (file.constructor.name === "FileSystemFileHandle")
      this.fileSystemHandle = file;
    else
      this.file = file;
    this.config = options2;
    this.debug = options2.debug;
    this.system = options2.system;
    this.path = options2.path;
    this.method = file.origin != void 0 && file.path != void 0 ? "remote" : "native";
    if (this.method === "remote") {
      this.remote = file;
      const split = file.path.split("/");
      file.name = split[split.length - 1];
      this.remoteOptions = file.options;
      this.type = null;
    }
    if (this.file)
      this.loadFileInfo(this.file);
    this.storage = {};
    this.rangeSupported = false;
    this[`#originalbody`] = void 0;
    this[`#originaltext`] = void 0;
  }
};
var codecs_exports = {};
__export3(codecs_exports, {
  csv: () => csv_exports,
  gzip: () => gzip_exports,
  js: () => js_exports,
  json: () => json_exports,
  text: () => text_exports,
  tsv: () => tsv_exports
});
var json_exports = {};
__export3(json_exports, {
  decode: () => decode4,
  encode: () => encode5,
  suffixes: () => suffixes3,
  type: () => type3
});
var type3 = "application/json";
var suffixes3 = ["json", "wasl"];
var encode5 = (o) => encode2(JSON.stringify(o));
var decode4 = (o) => {
  const textContent = !o.text ? decode2(o) : o.text;
  return JSON.parse(textContent || `{}`);
};
var tsv_exports = {};
__export3(tsv_exports, {
  decode: () => decode6,
  encode: () => encode7,
  suffixes: () => suffixes5,
  type: () => type5
});
var csv_exports = {};
__export3(csv_exports, {
  decode: () => decode5,
  encode: () => encode6,
  suffixes: () => suffixes4,
  type: () => type4
});
var stripBOM = (str) => str.replace(/^\uFEFF/, "");
var normalizeEOL = (str) => str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
var isContentfulRow = (row) => row && !/^\s*$/.test(row);
var addBOM = (str) => `\uFEFF${str}`;
var suffixes4 = "csv";
var type4 = "text/csv";
var encode6 = (arr, separator) => {
  const rows = arr.length ? [Object.keys(arr[0]), ...arr.map((o) => Object.values(o))] : [];
  let content = rows.map((row) => row.join(separator)).join("\n");
  content = addBOM(content);
  return new TextEncoder().encode(content);
};
var decode5 = (o, separator = ",") => {
  if (!o.text)
    o.text = new TextDecoder().decode(o.buffer);
  let contents = o.text;
  const collection = [];
  contents = stripBOM(contents);
  const rows = normalizeEOL(contents).split("\n").filter(isContentfulRow).map((str) => str.split(separator));
  const headers = rows.length ? rows.splice(0, 1)[0] : [];
  rows.forEach((arr, i) => {
    let strObject = `{`;
    strObject += arr.map((val, j) => {
      try {
        const parsed = JSON.parse(val);
        return `"${headers[j]}":${parsed}`;
      } catch {
        return `"${headers[j]}":"${val}"`;
      }
    }).join(",");
    strObject += "}";
    collection.push(strObject);
  });
  return collection.map((v) => JSON.parse(v));
};
var type5 = "text/tab-separated-values";
var suffixes5 = "tsv";
var encode7 = (arr) => encode6(arr, "	");
var decode6 = (arr) => decode5(arr, "	");
var js_exports = {};
__export3(js_exports, {
  decode: () => decode7,
  encode: () => encode8,
  suffixes: () => suffixes6,
  type: () => type6
});
var urlSep22 = "://";
var get32 = (path, rel = "", keepRelativeImports = false) => {
  let prefix = "";
  const getPrefix = (str) => {
    prefix = str.includes(urlSep22) ? str.split(urlSep22).splice(0, 1) : void 0;
    if (prefix)
      return str.replace(`${prefix}${urlSep22}`, "");
    else
      return str;
  };
  if (path.includes(urlSep22))
    path = getPrefix(path);
  if (rel.includes(urlSep22))
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
var getURL22 = (path) => {
  let url;
  try {
    url = new URL(path).href;
  } catch {
    url = get32(path, globalThis.location.href);
  }
  return url;
};
var handleFetch22 = async (path, options2 = {}, progressCallback) => {
  if (!options2.mode)
    options2.mode = "cors";
  const url = getURL22(path);
  const response = await fetchRemote22(url, options2, progressCallback);
  if (!response)
    throw new Error("No response received.");
  const type72 = response.type.split(";")[0];
  return {
    url,
    type: type72,
    buffer: response.buffer
  };
};
var fetchRemote22 = async (url, options2 = {}, progressCallback) => {
  const response = await globalThis.fetch(url, options2);
  return new Promise(async (resolve3) => {
    if (response) {
      const type72 = response.headers.get("Content-Type");
      if (globalThis.REMOTEESM_NODE) {
        const buffer = await response.arrayBuffer();
        resolve3({ buffer, type: type72 });
      } else {
        const reader = response.body.getReader();
        const bytes = parseInt(response.headers.get("Content-Length"), 10);
        let bytesReceived = 0;
        let buffer = [];
        const processBuffer = async ({ done, value }) => {
          if (done) {
            const config2 = {};
            if (typeof type72 === "string")
              config2.type = type72;
            const blob = new Blob(buffer, config2);
            const ab = await blob.arrayBuffer();
            resolve3({ buffer: new Uint8Array(ab), type: type72 });
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
      console.warn("Response not received!", options2.headers);
      resolve3(void 0);
    }
  });
};
var datauri2 = {};
var ready3 = new Promise(async (resolve3, reject) => {
  try {
    if (typeof process === "object") {
      globalThis.fetch = (await import("node-fetch")).default;
      if (typeof globalThis.fetch !== "function")
        globalThis.fetch = fetch;
      const Blob3 = (await Promise.resolve().then(() => (init_browser3(), browser_exports3))).default;
      globalThis.Blob = Blob3;
      if (typeof globalThis.Blob !== "function")
        globalThis.Blob = Blob3;
      resolve3(true);
    } else
      resolve3(true);
  } catch (err22) {
    console.log(err22);
    reject(err22);
  }
});
var re2 = /import([ \n\t]*(?:(?:\* (?:as .+))|(?:[^ \n\t\{\}]+[ \n\t]*,?)|(?:[ \n\t]*\{(?:[ \n\t]*[^ \n\t"'\{\}]+[ \n\t]*,?)+\}))[ \n\t]*)from[ \n\t]*(['"])([^'"\n]+)(?:['"])([ \n\t]*assert[ \n\t]*{type:[ \n\t]*(['"])([^'"\n]+)(?:['"])})?/g;
var moduleDataURI3 = (text, mimeType = "text/javascript") => `data:${mimeType};base64,` + btoa(text);
var importFromText3 = async (text, path, collection = {}) => {
  const extension = path.split(".").slice(-1)[0];
  const isJSON = extension === "json";
  let mimeType = isJSON ? "application/json" : "application/javascript";
  const uri = moduleDataURI3(text, mimeType);
  let imported = await (isJSON ? import(uri, { assert: { type: "json" } }) : import(uri)).catch((e) => {
    if (e.message.includes("Unexpected token"))
      throw new Error("Failed to fetch");
    else
      throw e;
  });
  const ref2 = {};
  for (let key in imported) {
    Object.defineProperty(ref2, key, {
      get: () => imported[key],
      enumerable: true
    });
  }
  collection[path] = uri;
  return imported;
};
var getText2 = async (uri) => await globalThis.fetch(uri).then((res) => res.text());
var safeImport2 = async (uri, opts = {}) => {
  const {
    root,
    onImport = () => {
    },
    outputText,
    forceImportFromText
  } = opts;
  const uriCollection = opts.datauri || datauri2;
  await ready3;
  if (opts.dependencies)
    opts.dependencies[uri] = {};
  const extension = uri.split(".").slice(-1)[0];
  const isJSON = extension === "json";
  let module = !forceImportFromText ? await (isJSON ? import(uri, { assert: { type: "json" } }) : import(uri)).catch(() => {
  }) : void 0;
  let text, originalText;
  if (!module) {
    text = originalText = await getText2(uri);
    try {
      module = await importFromText3(text, uri, uriCollection);
    } catch (e) {
      const base = get32("", uri);
      let childBase = base;
      const importInfo = [];
      let m;
      do {
        m = re2.exec(text);
        if (m == null)
          m = re2.exec(text);
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
        let correctPath = get32(path, childBase);
        const dependentFilePath = get32(correctPath);
        const dependentFileWithoutRoot = get32(dependentFilePath.replace(root ?? "", ""));
        if (opts.dependencies)
          opts.dependencies[uri][dependentFileWithoutRoot] = importInfo[i];
        let ref2 = uriCollection[dependentFilePath];
        if (!ref2) {
          const extension2 = correctPath.split(".").slice(-1)[0];
          const info = await handleFetch22(correctPath);
          let blob = new Blob([info.buffer], { type: info.type });
          const isJS = extension2.includes("js");
          const newURI = dependentFileWithoutRoot;
          const newText = await blob.text();
          let importedText = isJS ? await new Promise(async (resolve3) => {
            await safeImport2(newURI, {
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
          await importFromText3(importedText, correctPath, uriCollection);
        }
        text = `import ${wildcard ? "* as " : ""}${variables} from "${uriCollection[correctPath]}";
${text}`;
      }
      module = await importFromText3(text, uri, uriCollection);
    }
  }
  let txt = outputText ? text ?? await getText2(uri) : void 0;
  onImport(uri, {
    text: txt,
    file: outputText ? originalText ?? txt : void 0,
    module
  });
  return module;
};
var remote_esm_default2 = safeImport2;
var type6 = "application/javascript";
var suffixes6 = "js";
var encode8 = () => void 0;
var decode7 = async (o, config2) => {
  if (!config2.onImport)
    config2.onImport = async (path, info) => {
      console.error("NOT REPLICATING ONBLOB BY LOADING EXTERNAL FILES INTO THE SYSTEM");
    };
  const textContent = !o.text ? await decode2(o) : o.text;
  const daturi = moduleDataURI3(textContent);
  const imported = await remote_esm_default2(daturi, config2);
  if (imported)
    return imported;
  else
    return textContent;
};
var Codecs = class {
  constructor(codecsInput) {
    this.suffixToType = {};
    this.collection = /* @__PURE__ */ new Map();
    this.add = (codec) => {
      this.collection.set(codec.type, codec);
      let suffixes72 = codec.suffixes ? codec.suffixes : codec.type.split("-").splice(-1)[0];
      if (!Array.isArray(suffixes72))
        suffixes72 = [suffixes72];
      suffixes72.forEach((suffix22) => this.suffixToType[suffix22] = codec.type);
    };
    this.get = (mimeType) => this.collection.get(mimeType);
    this.getType = (suffix22) => {
      let k = Object.keys(this.suffixToType).find((k2) => suffix22.slice(-k2.length) === k2);
      return this.suffixToType[k];
    };
    this.decode = (o, type72, name22, config2) => decode_default(o, type72, name22, config2, void 0, this);
    this.encode = (o, type72, name22, config2) => encode_default(o, type72, name22, config2, void 0, this);
    this.hasDependencies = (file) => {
      return file.mimeType === "application/javascript";
    };
    if (!Array.isArray(codecsInput))
      codecsInput = [codecsInput];
    codecsInput.forEach((codecs) => {
      if (codecs instanceof Codecs)
        codecs.collection.forEach(this.add);
      else
        for (let key in codecs)
          this.add(codecs[key]);
    });
  }
};
var deepClone = (o = {}) => {
  return JSON.parse(JSON.stringify(o));
};
var clone_default = deepClone;
var open = async (paths, config2) => {
  config2 = Object.assign({}, config2);
  const useNative = !!config2.system?.native;
  if (typeof paths === "string") {
    paths = { base: paths };
  }
  for (let key in paths) {
    paths[key] = get22(paths[key], "");
  }
  ;
  let file = config2.system.files.list.get(paths.base) ?? config2.system.files.list.get(paths.remote);
  if (file)
    return file;
  else {
    if (useNative && config2.system.openNative instanceof Function)
      file = await config2.system.openNative(paths.base, config2);
    else {
      if (paths.remote)
        file = await config2.system.openRemote(paths.remote, config2);
      if (!file)
        file = await config2.system.openRemote(paths.base, config2);
    }
    if (file)
      return file;
  }
};
var open_default = open;
var createFile = (file = {}, path, system) => {
  return Object.assign(file, {
    origin: system.root,
    path,
    options: {
      mode: "cors"
    }
  });
};
var load = async (file, config2) => {
  let { path, system, codecs, debug } = config2;
  if (!path)
    path = file.webkitRelativePath ?? file.relativePath ?? file.path ?? "";
  config2.path = path;
  let fileConfig = config2;
  if (!(file instanceof RangeFile)) {
    if (system.native) {
      if (file.constructor.name !== "FileSystemFileHandle") {
        const openInfo = await open_default(path, {
          path,
          system,
          create: config2.create,
          codecs,
          debug
        });
        if (openInfo && openInfo.constructor.name === "FileSystemDirectoryHandle") {
          file = openInfo;
        }
      }
    } else {
      if (fileConfig.system.root) {
        const directoryPath = new URL(fileConfig.system.root).pathname.split("/");
        const url = new URL(fileConfig.path);
        path = file.path = fileConfig.path = url.pathname.split("/").filter((str, i) => directoryPath?.[i] != str).join("/");
      } else
        path = file.path = fileConfig.path;
    }
    file = new RangeFile(file, fileConfig);
    await file.init();
  }
  system.add(file);
  return file;
};
var createFile2 = (file = {}, path, system) => {
  if (system.native)
    return file;
  else
    return createFile(file, path, system);
};
var saveEach = async (rangeFile, config2, counter, length) => {
  await rangeFile.save(config2.force);
  counter = counter + 1;
  if (config2.progressCallback instanceof Function)
    config2.progressCallback(config2.name, counter / length, length);
};
var save = (name22, files, force, progressCallback) => {
  let length = files;
  return new Promise(async (resolve3, reject) => {
    let i = 0;
    const firstFile = files.shift();
    if (firstFile) {
      await saveEach(firstFile, { progressCallback, name: name22, force }, i, length);
      await iterate_default(files, (f) => saveEach(f, { progressCallback, name: name22, force }, i, length));
      resolve3(true);
    } else {
      console.warn("No files to save");
      resolve3(false);
    }
  });
};
var save_default = save;
var openRemote = async (path, config2) => {
  let {
    system
  } = config2;
  return await handleFetch2(path).then(async (info) => {
    const splitURL = info.url.split("/");
    const fileName = splitURL.pop();
    let blob = new Blob([info.buffer], { type: info.type });
    blob.name = fileName;
    const file = createFile(blob, info.url, system);
    const rangeFile = await system.load(file, info.url);
    return rangeFile;
  });
};
var open_default2 = openRemote;
var mountRemote = async (url, config2) => {
  let filePath;
  await handleFetch2(url, void 0, config2.progress).then(async (response) => {
    if (response.type === "application/json") {
      config2.system.name = config2.system.root = filePath = response.url;
      const datasets = JSON.parse(new TextDecoder().decode(response.buffer));
      let files = [];
      const drill = (o) => {
        for (let key in o) {
          const target = o[key];
          if (typeof target === "string") {
            const path = `${response.url}/${target}`;
            const file = createFile(void 0, path, config2.system);
            files.push({ file, path });
          } else
            drill(target);
        }
      };
      drill(datasets);
      let filesIterable = files.entries();
      await iterate_default(filesIterable, async ([i, { file, path }]) => await config2.system.load(file, path));
    } else
      throw "Endpoint is not a freerange filesystem!";
  }).catch((e) => {
    throw "Unable to connect to freerange filesystem!";
  });
  return filePath;
};
var mount_default = mountRemote;
var isURL = (path) => {
  try {
    const url = new URL(path);
    return true;
  } catch {
    return false;
  }
};
var System = class {
  constructor(name22, systemInfo = {}) {
    this.dependencies = {};
    this.dependents = {};
    this.changelog = [];
    this.files = {};
    this.ignore = [];
    this.autosync = [];
    this.groups = {};
    this.groupConditions = /* @__PURE__ */ new Set();
    this.init = async () => {
      let mountConfig = {
        system: this,
        progress: this.progress
      };
      if (this.name !== null) {
        if (this.isNative(this.name)) {
          const native = await this.mountNative(this.name, mountConfig);
          if (!native)
            console.error("Unable to mount native filesystem!");
          else if (this.oninit instanceof Function)
            this.oninit(native);
          return;
        } else {
          const path = this.name;
          const isURL22 = isURL(path);
          const fileName = name2(path);
          const suffix22 = suffix2(path);
          if (isURL22) {
            if (fileName && suffix22) {
              const path2 = this.name;
              this.root = directory(path2);
              const file = await this.open(fileName);
              await file.body;
            } else {
              await this.mountRemote(this.name, mountConfig).catch((e) => console.warn("System initialization failed.", e));
            }
          } else if (this.name)
            this.root = "";
        }
      }
      if (this.oninit instanceof Function)
        this.oninit(this.name);
    };
    this.addGroup = (name23, initial, condition) => {
      this.files[name23] = initial;
      this.groups[name23] = this.cloneGroup({ initial, condition });
      this.groupConditions.add(condition);
    };
    this.cloneGroup = (o) => {
      let newO = { condition: o.condition };
      if (o.initial instanceof Map)
        newO.initial = new Map(o.initial);
      else
        newO.initial = clone_default(o.initial);
      return newO;
    };
    this.subsystem = async (path) => {
      const split = path.split("/");
      const name23 = split[split.length - 1];
      const subDir = split.shift();
      path = split.join("/");
      let target = this.files.system[subDir];
      split.forEach((str) => target = target[str]);
      const systemConstructor = this.constructor;
      const system = new systemConstructor(name23, {
        native: this.native,
        debug: this.debug,
        ignore: this.ignore,
        writable: this.writable,
        progress: this.progress,
        codecs: this.codecs
      });
      await system.init();
      let drill = async (target2, base) => {
        for (let key in target2) {
          const newBase = get22(key, base);
          const file = target2[key];
          if (file instanceof RangeFile)
            await system.load(file, get22(key, base));
          else
            await drill(file, newBase);
        }
      };
      await drill(target, path);
      return system;
    };
    this.reset = () => {
      this.changelog = [];
      this.files = this.createFileSystemInfo();
    };
    this.createFileSystemInfo = () => {
      const files = {};
      for (let name23 in this.groups) {
        let group = this.groups[name23];
        const groupInfo = this.cloneGroup(group);
        files[name23] = groupInfo.initial;
      }
      return files;
    };
    this.checkToLoad = (path) => {
      const split = path.split("/");
      const fileName = split.pop();
      const toLoad = this.ignore.reduce((a, b) => {
        if (fileName === b)
          return a * 0;
        else if (path.includes(`${b}/`))
          return a * 0;
        else
          return a * 1;
      }, 1);
      return toLoad;
    };
    this.load = async (file, path, dependent) => {
      const existingFile = this.files.list.get(path);
      if (existingFile)
        return existingFile;
      else {
        if (!file.name)
          file.name = name2(path);
        if (!this.native)
          file = createFile(file, path, this);
        const toLoad = this.checkToLoad(file.path ?? path);
        if (toLoad) {
          const rangeFile = await load(file, {
            path,
            system: this,
            debug: this.debug,
            codecs: this.codecs,
            create: this.writable
          });
          if (dependent) {
            if (!this.dependencies[dependent])
              this.dependencies[dependent] = /* @__PURE__ */ new Map();
            this.dependencies[dependent].set(rangeFile.path, rangeFile);
            if (!this.dependents[rangeFile.path])
              this.dependents[rangeFile.path] = /* @__PURE__ */ new Map();
            const file2 = this.files.list.get(dependent);
            this.dependents[rangeFile.path].set(file2.path, file2);
          }
          return rangeFile;
        } else
          console.warn(`Ignoring ${file.name}`);
      }
    };
    this.trackDependency = (path, dependent) => {
      const rangeFile = this.files.list.get(path);
      if (!this.dependencies[dependent])
        this.dependencies[dependent] = /* @__PURE__ */ new Map();
      this.dependencies[dependent].set(path, rangeFile);
      if (!this.dependents[path])
        this.dependents[path] = /* @__PURE__ */ new Map();
      const file = this.files.list.get(dependent);
      this.dependents[path].set(file.path, file);
    };
    this.addExternal = async (path, file) => {
      if (typeof file === "string") {
        const o = get4(void 0, path, this.codecs);
        var enc = new TextEncoder();
        file = new Blob([enc.encode(file)], { type: o.mimeType });
      }
      console.log("adding external", file, path);
      return await this.load(file, path);
    };
    this.add = (file) => {
      let has = false;
      let check = (path) => {
        const res = this.files.list.has(path);
        if (res)
          has = path;
        return res;
      };
      let found = check(file.path);
      if (!found)
        found = check(`https://${file.path}`);
      if (!found)
        found = check(`http://${file.path}`);
      if (has) {
        const oldFile = this.files.list.get(has);
        oldFile.apply(file);
      }
      this.groupConditions.forEach((func) => func(file, file.path, this.files));
    };
    this.isNative = () => false;
    this.openRemote = open_default2;
    this.mountRemote = mount_default;
    this.open = async (path, create3) => {
      const paths = {
        base: path
      };
      if (!this.native)
        paths.remote = get22(path, this.root);
      const rangeFile = await open_default(paths, {
        path,
        debug: this.debug,
        system: this,
        create: create3 ?? this.writable,
        codecs: this.codecs
      });
      return rangeFile;
    };
    this.save = async (autosync, progress = this.progress) => await save_default(this.name, Array.from(this.files.list.values()), autosync || this.autosync, progress);
    this.sync = async (autosync) => await iterate_default(this.files.list.values(), async (entry) => await entry.sync(autosync || this.autosync));
    this.transfer = async (target) => await transfer_default(this, target);
    this.apply = async (system) => {
      this.name = system.name;
      if (system.native)
        this.native = system.native;
      if (system.debug)
        this.debug = system.debug;
      if (system.ignore)
        this.ignore = system.ignore ?? [];
      if (system.writable)
        this.writable = system.writable;
      if (system.progress)
        this.progress = system.progress;
      if (system.codecs instanceof Codecs)
        this.codecs = system.codecs;
      else
        this.codecs = new Codecs([codecs_exports, system.codecs]);
      const files = system.files?.list;
      if (files) {
        await iterate_default(Array.from(files.values()), async (newFile) => {
          const path = newFile.path;
          let f = this.files.list.get(newFile.path);
          if (!f)
            await this.load(newFile, path);
          else
            await f.apply(newFile, false);
        });
      }
      this.root = system.root;
    };
    const info = Object.assign({}, systemInfo);
    this.apply(Object.assign(info, { name: name22 }));
    this.addGroup("system", {}, (file, path, files) => {
      let target = files.system;
      let split = path.split("/");
      split = split.slice(0, split.length - 1);
      if (path)
        split.forEach((k, i) => {
          if (!target[k])
            target[k] = {};
          target = target[k];
        });
      target[file.name] = file;
    });
    this.addGroup("types", {}, (file, _, files) => {
      const suffix22 = file.suffix ?? file.name;
      if (suffix22) {
        if (!files.types[suffix22])
          files.types[suffix22] = [];
        files.types[suffix22].push(file);
      }
    });
    this.addGroup("n", 0, (_, __, files) => files.n++);
    this.addGroup("list", /* @__PURE__ */ new Map(), (file, _, files) => files.list.set(file.path, file));
  }
};
var openNative = async (path, config2) => {
  let nativeHandle = config2.system.native;
  let fileSystem = config2.system?.files?.["system"];
  let { system, create: create3 } = config2;
  let pathTokens = path.split("/");
  let fileName = config2.type === "directory" ? null : pathTokens.pop();
  pathTokens = pathTokens.filter((f) => !!f);
  if (pathTokens.length > 0) {
    for (const token of pathTokens) {
      const handle = await nativeHandle.getDirectoryHandle(token, { create: create3 }).catch((e) => {
        if (create3)
          console.warn(`${token} is an invalid file system handle`, e);
        else
          console.warn(`Directory ${token} does not already exist.`);
      });
      if (handle) {
        nativeHandle = handle;
        if (!fileSystem[token])
          fileSystem[token] = {};
        if (!(fileSystem[token] instanceof RangeFile))
          fileSystem = fileSystem[token];
      }
    }
  }
  if (fileName) {
    let existingFile = fileSystem[fileName];
    if (!(existingFile instanceof RangeFile)) {
      const fileHandle = await nativeHandle.getFileHandle(fileName, { create: create3 }).catch((e) => {
        if (config2.create)
          console.warn(`Could not create ${fileName}. There may be a directory of the same name...`, e);
        else
          console.warn(`No file found at ${path}.`);
      });
      if (!fileHandle)
        return;
      const file = createFile2(fileHandle, path, system);
      existingFile = await system.load(file, path);
    }
    return existingFile;
  } else
    return nativeHandle;
};
var open_default3 = openNative;
var verifyPermission = async (fileHandle, withWrite = false) => {
  const opts = {};
  if (withWrite)
    opts.mode = "readwrite";
  const state2 = await fileHandle.queryPermission(opts);
  if (await state2 === "granted")
    return true;
  const requestState = await fileHandle.requestPermission(opts);
  if (requestState === "granted")
    return true;
  return false;
};
var verify_default = verifyPermission;
var onhandle = async (handle, base = "", system, progressCallback = void 0) => {
  await verify_default(handle, true);
  if (handle.name != system.name)
    base = base ? get22(handle.name, base, false, true) : handle.name;
  const files = [];
  if (handle.kind === "file") {
    if (progressCallback instanceof Function)
      files.push({ handle, base });
    else
      await system.load(handle, base);
  } else if (handle.kind === "directory") {
    const arr = await iterate_default(handle.values(), (entry) => {
      return onhandle(entry, base, system, progressCallback);
    });
    files.push(...arr.flat());
  }
  if (!base) {
    let count = 0;
    await iterate_default(files, async (o) => {
      await system.load(o.handle, o.base);
      count++;
      progressCallback(system.name, count / files.length, files.length);
    });
  }
  return files;
};
var mountNative = async (handle, config2) => {
  if (!handle)
    handle = await window.showDirectoryPicker();
  if (config2?.system) {
    config2.system.name = config2.system.root = handle.name;
    config2.system.native = handle;
  }
  await onhandle(handle, null, config2?.system, config2?.progress);
  return handle;
};
var mount_default2 = mountNative;
function promisifyRequest(request) {
  return new Promise((resolve3, reject) => {
    request.oncomplete = request.onsuccess = () => resolve3(request.result);
    request.onabort = request.onerror = () => reject(request.error);
  });
}
function createStore(dbName, storeName) {
  const request = indexedDB.open(dbName);
  request.onupgradeneeded = () => request.result.createObjectStore(storeName);
  const dbp = promisifyRequest(request);
  return (txMode, callback) => dbp.then((db) => callback(db.transaction(storeName, txMode).objectStore(storeName)));
}
var defaultGetStoreFunc;
function defaultGetStore() {
  if (!defaultGetStoreFunc) {
    defaultGetStoreFunc = createStore("keyval-store", "keyval");
  }
  return defaultGetStoreFunc;
}
function get42(key, customStore = defaultGetStore()) {
  return customStore("readonly", (store) => promisifyRequest(store.get(key)));
}
function set(key, value, customStore = defaultGetStore()) {
  return customStore("readwrite", (store) => {
    store.put(value, key);
    return promisifyRequest(store.transaction);
  });
}
var cacheName = `freerange-history`;
var maxHistory = 10;
var setCache = async (info) => {
  let history = await get42(cacheName);
  if (!history)
    history = [info];
  else if (!history.includes(info)) {
    history.push(info);
    if (history.length > maxHistory)
      history.shift();
  }
  console.log(cacheName, history);
  set(cacheName, history);
};
var LocalSystem = class extends System {
  constructor(name22, info) {
    super(name22, info);
    this.isNative = (info2) => !info2 || info2 instanceof FileSystemDirectoryHandle;
    this.openNative = open_default3;
    this.mountNative = mount_default2;
    this.oninit = setCache;
  }
};

// src/core/src/utils.ts
var urlSep4 = "://";
var join = (...paths) => {
  const prefix = paths[0].includes(urlSep4) ? paths[0].split(urlSep4).splice(0, 1) : void 0;
  if (prefix)
    paths[0] = paths[0].replace(`${prefix}${urlSep4}`, "");
  const split = paths.map((path) => {
    return path.split("/");
  }).flat();
  const main2 = split.reduce((a, b) => {
    if (!a)
      a = b;
    else if (!b)
      return a;
    else if (a.split("/")[0] !== b)
      a = a + "/" + b;
    else
      console.log("skip", a, b);
    return a;
  }, "");
  if (prefix)
    return prefix + "://" + main2;
  else
    return main2;
};
var noProtocol = (path) => {
  return path.split("://").slice(-1)[0];
};
var isWASL = (path) => {
  return path.slice(-5) === ".wasl";
};
var getBase = (path) => {
  return path.split("/").slice(0, -1).join("/");
};

// src/core/src/App.ts
var defaultOptions = {
  ignore: [".DS_Store", ".git"],
  debug: false,
  autosync: [
    "*.wasl.json"
  ]
};
var _input2, _sameRoot;
var App = class {
  constructor(input, options2 = {}) {
    __privateAdd(this, _input2, void 0);
    this.ignore = [".DS_Store", ".git"];
    this.debug = false;
    this.options = defaultOptions;
    this.editable = null;
    __privateAdd(this, _sameRoot, 4);
    this.setOptions = (options2) => {
      this.options = Object.assign(this.options, options2);
      if (this.options.sameRoot)
        __privateSet(this, _sameRoot, this.options.sameRoot);
      return this.options;
    };
    this.compile = async () => {
      const packageContents = await (await this.filesystem.open("package.json")).body;
      let mainPath = packageContents?.main ?? "index.wasl.json";
      const file = await this.filesystem.open(mainPath);
      let filesystem = {};
      if (file) {
        const body = await file.body;
        const toFilterOut = noProtocol(file.path).split("/");
        await Promise.allSettled(Array.from(this.filesystem.files.list.entries()).map(async (arr) => {
          let path = noProtocol(arr[0]);
          const file2 = arr[1];
          const splitPath = path.split("/");
          let i = 0;
          let ogLength = splitPath.length;
          let keepGoing = true;
          do {
            keepGoing = splitPath[0] === toFilterOut[i];
            if (keepGoing)
              splitPath.shift();
            if (i >= ogLength - 2)
              keepGoing = false;
            i++;
          } while (keepGoing);
          if (i > __privateGet(this, _sameRoot))
            path = splitPath.join("/");
          filesystem[path] = await file2.body;
        }));
        this.wasl = await this.create(body, Object.assign(this.options, { filesystem, _modeOverride: "reference", _overrideRemote: true }));
        return this.wasl;
      } else if (packageContents?.main)
        console.error('The "main" field in the supplied package.json is not pointing to an appropriate entrypoint.');
      else
        console.error("No index.wasl.json file found at the expected root location.");
    };
    this.join = join;
    this.createFilesystem = async (input, options2 = this.options) => {
      let clonedOptions = Object.assign({}, options2);
      let system = new LocalSystem(input, clonedOptions);
      await system.init();
      this.editable = true;
      if (this.wasl) {
        let createPkg = true;
        for (let path in this.wasl.files) {
          console.log("Checking", this.wasl.files[path]);
          await system.addExternal(path, this.wasl.files[path].text);
          if (path === "package.json")
            createPkg = false;
        }
        if (createPkg) {
          console.warn("Creating package.json file at the root to reference later!");
          await system.addExternal("package.json", `{"main": "${__privateGet(this, _input2)}"}`);
        }
      }
      return system;
    };
    this.create = async (input, options2, toStart = true) => {
      let wasl = new core_default(input, options2);
      await wasl.init();
      if (toStart)
        await wasl.start();
      return wasl;
    };
    this.start = async (input = __privateGet(this, _input2), options2 = this.options, fromSave) => {
      console.log("OG Input", input);
      __privateSet(this, _input2, input);
      options2 = this.setOptions(options2);
      if (this.filesystem instanceof LocalSystem)
        this.save(false);
      await this.stop();
      if (!fromSave) {
        let isUrl = false;
        try {
          new URL(input ?? "").href;
          input = this.join(input);
          isUrl = true;
        } catch {
        }
        const isObject = typeof input === "object";
        if (isObject || isUrl) {
          this.wasl = await this.create(input, options2, !options2.edit);
          this.filesystem = await this.createFilesystem(null);
        } else
          this.filesystem = await this.createFilesystem(input);
        if (this.wasl && Object.keys(this.wasl.files).length === 0) {
          console.warn("No files have been loaded. Cannot edit files loaded in Reference Mode.");
          this.editable = false;
        }
      }
      if (this.editable)
        await this.compile();
      return this.wasl;
    };
    this.stop = async () => {
      if (this.wasl)
        await this.wasl.stop();
    };
    this.save = async (restart = true) => {
      if (this.editable) {
        if (!this.filesystem)
          this.filesystem = await this.createFilesystem();
        if (this.filesystem)
          await this.filesystem.save();
        await this.compile();
      }
      if (restart && this.wasl)
        await this.start(void 0, void 0, true);
    };
    __privateSet(this, _input2, input);
    this.setOptions(options2);
  }
};
_input2 = new WeakMap();
_sameRoot = new WeakMap();

// node_modules/freerange/dist/index.esm.js
var __defProp4 = Object.defineProperty;
var __export4 = (target, all) => {
  for (var name22 in all)
    __defProp4(target, name22, { get: all[name22], enumerable: true });
};
var zipped2 = (suffix22, mimeType, codecs) => mimeType && mimeType === codecs.getType("gz") || suffix22.includes("gz");
var fullSuffix3 = (fileName = "") => fileName.split(".").slice(1);
var suffix3 = (fileName = "") => {
  const suffix22 = fullSuffix3(fileName);
  const isZip = zipped2(suffix22);
  if (isZip)
    suffix22.pop();
  return suffix22.join(".");
};
var name3 = (path) => path ? path.split("/").slice(-1)[0] : void 0;
var directory2 = (path) => path ? path.split("/").slice(0, -1).join("/") : void 0;
var esm2 = (suffix22, type72) => {
  if (suffix22.slice(-2) === "js")
    return true;
  else if (type72 && type72.includes("javascript"))
    return true;
  else
    return false;
};
var get5 = (type72, name22, codecs) => {
  let mimeType = type72;
  const isZipped = zipped2(fullSuffix3(name22), mimeType, codecs);
  const sfx = suffix3(name22);
  if (isZipped || !mimeType || mimeType === "text/plain")
    mimeType = codecs.getType(sfx);
  if (esm2(sfx, mimeType))
    mimeType = codecs.getType("js");
  return { mimeType, zipped: isZipped, suffix: sfx };
};
var gzip_exports2 = {};
__export4(gzip_exports2, {
  decode: () => decode8,
  encode: () => encode9,
  suffixes: () => suffixes7,
  type: () => type7
});
var Z_FIXED$12 = 4;
var Z_BINARY2 = 0;
var Z_TEXT2 = 1;
var Z_UNKNOWN$12 = 2;
function zero$12(buf) {
  let len = buf.length;
  while (--len >= 0) {
    buf[len] = 0;
  }
}
var STORED_BLOCK2 = 0;
var STATIC_TREES2 = 1;
var DYN_TREES2 = 2;
var MIN_MATCH$12 = 3;
var MAX_MATCH$12 = 258;
var LENGTH_CODES$12 = 29;
var LITERALS$12 = 256;
var L_CODES$12 = LITERALS$12 + 1 + LENGTH_CODES$12;
var D_CODES$12 = 30;
var BL_CODES$12 = 19;
var HEAP_SIZE$12 = 2 * L_CODES$12 + 1;
var MAX_BITS$12 = 15;
var Buf_size2 = 16;
var MAX_BL_BITS2 = 7;
var END_BLOCK2 = 256;
var REP_3_62 = 16;
var REPZ_3_102 = 17;
var REPZ_11_1382 = 18;
var extra_lbits2 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]);
var extra_dbits2 = new Uint8Array([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
var extra_blbits2 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]);
var bl_order2 = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var DIST_CODE_LEN2 = 512;
var static_ltree2 = new Array((L_CODES$12 + 2) * 2);
zero$12(static_ltree2);
var static_dtree2 = new Array(D_CODES$12 * 2);
zero$12(static_dtree2);
var _dist_code2 = new Array(DIST_CODE_LEN2);
zero$12(_dist_code2);
var _length_code2 = new Array(MAX_MATCH$12 - MIN_MATCH$12 + 1);
zero$12(_length_code2);
var base_length2 = new Array(LENGTH_CODES$12);
zero$12(base_length2);
var base_dist2 = new Array(D_CODES$12);
zero$12(base_dist2);
function StaticTreeDesc2(static_tree, extra_bits, extra_base, elems, max_length) {
  this.static_tree = static_tree;
  this.extra_bits = extra_bits;
  this.extra_base = extra_base;
  this.elems = elems;
  this.max_length = max_length;
  this.has_stree = static_tree && static_tree.length;
}
var static_l_desc2;
var static_d_desc2;
var static_bl_desc2;
function TreeDesc2(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;
  this.max_code = 0;
  this.stat_desc = stat_desc;
}
var d_code2 = (dist) => {
  return dist < 256 ? _dist_code2[dist] : _dist_code2[256 + (dist >>> 7)];
};
var put_short2 = (s, w) => {
  s.pending_buf[s.pending++] = w & 255;
  s.pending_buf[s.pending++] = w >>> 8 & 255;
};
var send_bits2 = (s, value, length) => {
  if (s.bi_valid > Buf_size2 - length) {
    s.bi_buf |= value << s.bi_valid & 65535;
    put_short2(s, s.bi_buf);
    s.bi_buf = value >> Buf_size2 - s.bi_valid;
    s.bi_valid += length - Buf_size2;
  } else {
    s.bi_buf |= value << s.bi_valid & 65535;
    s.bi_valid += length;
  }
};
var send_code2 = (s, c, tree) => {
  send_bits2(s, tree[c * 2], tree[c * 2 + 1]);
};
var bi_reverse2 = (code, len) => {
  let res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
};
var bi_flush2 = (s) => {
  if (s.bi_valid === 16) {
    put_short2(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;
  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 255;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
};
var gen_bitlen2 = (s, desc) => {
  const tree = desc.dyn_tree;
  const max_code = desc.max_code;
  const stree = desc.stat_desc.static_tree;
  const has_stree = desc.stat_desc.has_stree;
  const extra = desc.stat_desc.extra_bits;
  const base = desc.stat_desc.extra_base;
  const max_length = desc.stat_desc.max_length;
  let h;
  let n, m;
  let bits;
  let xbits;
  let f;
  let overflow = 0;
  for (bits = 0; bits <= MAX_BITS$12; bits++) {
    s.bl_count[bits] = 0;
  }
  tree[s.heap[s.heap_max] * 2 + 1] = 0;
  for (h = s.heap_max + 1; h < HEAP_SIZE$12; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1] = bits;
    if (n > max_code) {
      continue;
    }
    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2];
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1] + xbits);
    }
  }
  if (overflow === 0) {
    return;
  }
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) {
      bits--;
    }
    s.bl_count[bits]--;
    s.bl_count[bits + 1] += 2;
    s.bl_count[max_length]--;
    overflow -= 2;
  } while (overflow > 0);
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) {
        continue;
      }
      if (tree[m * 2 + 1] !== bits) {
        s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
        tree[m * 2 + 1] = bits;
      }
      n--;
    }
  }
};
var gen_codes2 = (tree, max_code, bl_count) => {
  const next_code = new Array(MAX_BITS$12 + 1);
  let code = 0;
  let bits;
  let n;
  for (bits = 1; bits <= MAX_BITS$12; bits++) {
    next_code[bits] = code = code + bl_count[bits - 1] << 1;
  }
  for (n = 0; n <= max_code; n++) {
    let len = tree[n * 2 + 1];
    if (len === 0) {
      continue;
    }
    tree[n * 2] = bi_reverse2(next_code[len]++, len);
  }
};
var tr_static_init2 = () => {
  let n;
  let bits;
  let length;
  let code;
  let dist;
  const bl_count = new Array(MAX_BITS$12 + 1);
  length = 0;
  for (code = 0; code < LENGTH_CODES$12 - 1; code++) {
    base_length2[code] = length;
    for (n = 0; n < 1 << extra_lbits2[code]; n++) {
      _length_code2[length++] = code;
    }
  }
  _length_code2[length - 1] = code;
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist2[code] = dist;
    for (n = 0; n < 1 << extra_dbits2[code]; n++) {
      _dist_code2[dist++] = code;
    }
  }
  dist >>= 7;
  for (; code < D_CODES$12; code++) {
    base_dist2[code] = dist << 7;
    for (n = 0; n < 1 << extra_dbits2[code] - 7; n++) {
      _dist_code2[256 + dist++] = code;
    }
  }
  for (bits = 0; bits <= MAX_BITS$12; bits++) {
    bl_count[bits] = 0;
  }
  n = 0;
  while (n <= 143) {
    static_ltree2[n * 2 + 1] = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree2[n * 2 + 1] = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree2[n * 2 + 1] = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree2[n * 2 + 1] = 8;
    n++;
    bl_count[8]++;
  }
  gen_codes2(static_ltree2, L_CODES$12 + 1, bl_count);
  for (n = 0; n < D_CODES$12; n++) {
    static_dtree2[n * 2 + 1] = 5;
    static_dtree2[n * 2] = bi_reverse2(n, 5);
  }
  static_l_desc2 = new StaticTreeDesc2(static_ltree2, extra_lbits2, LITERALS$12 + 1, L_CODES$12, MAX_BITS$12);
  static_d_desc2 = new StaticTreeDesc2(static_dtree2, extra_dbits2, 0, D_CODES$12, MAX_BITS$12);
  static_bl_desc2 = new StaticTreeDesc2(new Array(0), extra_blbits2, 0, BL_CODES$12, MAX_BL_BITS2);
};
var init_block2 = (s) => {
  let n;
  for (n = 0; n < L_CODES$12; n++) {
    s.dyn_ltree[n * 2] = 0;
  }
  for (n = 0; n < D_CODES$12; n++) {
    s.dyn_dtree[n * 2] = 0;
  }
  for (n = 0; n < BL_CODES$12; n++) {
    s.bl_tree[n * 2] = 0;
  }
  s.dyn_ltree[END_BLOCK2 * 2] = 1;
  s.opt_len = s.static_len = 0;
  s.last_lit = s.matches = 0;
};
var bi_windup2 = (s) => {
  if (s.bi_valid > 8) {
    put_short2(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
};
var copy_block2 = (s, buf, len, header) => {
  bi_windup2(s);
  if (header) {
    put_short2(s, len);
    put_short2(s, ~len);
  }
  s.pending_buf.set(s.window.subarray(buf, buf + len), s.pending);
  s.pending += len;
};
var smaller2 = (tree, n, m, depth) => {
  const _n2 = n * 2;
  const _m2 = m * 2;
  return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
};
var pqdownheap2 = (s, tree, k) => {
  const v = s.heap[k];
  let j = k << 1;
  while (j <= s.heap_len) {
    if (j < s.heap_len && smaller2(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    if (smaller2(tree, v, s.heap[j], s.depth)) {
      break;
    }
    s.heap[k] = s.heap[j];
    k = j;
    j <<= 1;
  }
  s.heap[k] = v;
};
var compress_block2 = (s, ltree, dtree) => {
  let dist;
  let lc;
  let lx = 0;
  let code;
  let extra;
  if (s.last_lit !== 0) {
    do {
      dist = s.pending_buf[s.d_buf + lx * 2] << 8 | s.pending_buf[s.d_buf + lx * 2 + 1];
      lc = s.pending_buf[s.l_buf + lx];
      lx++;
      if (dist === 0) {
        send_code2(s, lc, ltree);
      } else {
        code = _length_code2[lc];
        send_code2(s, code + LITERALS$12 + 1, ltree);
        extra = extra_lbits2[code];
        if (extra !== 0) {
          lc -= base_length2[code];
          send_bits2(s, lc, extra);
        }
        dist--;
        code = d_code2(dist);
        send_code2(s, code, dtree);
        extra = extra_dbits2[code];
        if (extra !== 0) {
          dist -= base_dist2[code];
          send_bits2(s, dist, extra);
        }
      }
    } while (lx < s.last_lit);
  }
  send_code2(s, END_BLOCK2, ltree);
};
var build_tree2 = (s, desc) => {
  const tree = desc.dyn_tree;
  const stree = desc.stat_desc.static_tree;
  const has_stree = desc.stat_desc.has_stree;
  const elems = desc.stat_desc.elems;
  let n, m;
  let max_code = -1;
  let node;
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE$12;
  for (n = 0; n < elems; n++) {
    if (tree[n * 2] !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;
    } else {
      tree[n * 2 + 1] = 0;
    }
  }
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
    tree[node * 2] = 1;
    s.depth[node] = 0;
    s.opt_len--;
    if (has_stree) {
      s.static_len -= stree[node * 2 + 1];
    }
  }
  desc.max_code = max_code;
  for (n = s.heap_len >> 1; n >= 1; n--) {
    pqdownheap2(s, tree, n);
  }
  node = elems;
  do {
    n = s.heap[1];
    s.heap[1] = s.heap[s.heap_len--];
    pqdownheap2(s, tree, 1);
    m = s.heap[1];
    s.heap[--s.heap_max] = n;
    s.heap[--s.heap_max] = m;
    tree[node * 2] = tree[n * 2] + tree[m * 2];
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1] = tree[m * 2 + 1] = node;
    s.heap[1] = node++;
    pqdownheap2(s, tree, 1);
  } while (s.heap_len >= 2);
  s.heap[--s.heap_max] = s.heap[1];
  gen_bitlen2(s, desc);
  gen_codes2(tree, max_code, s.bl_count);
};
var scan_tree2 = (s, tree, max_code) => {
  let n;
  let prevlen = -1;
  let curlen;
  let nextlen = tree[0 * 2 + 1];
  let count = 0;
  let max_count = 7;
  let min_count = 4;
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1] = 65535;
  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1];
    if (++count < max_count && curlen === nextlen) {
      continue;
    } else if (count < min_count) {
      s.bl_tree[curlen * 2] += count;
    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        s.bl_tree[curlen * 2]++;
      }
      s.bl_tree[REP_3_62 * 2]++;
    } else if (count <= 10) {
      s.bl_tree[REPZ_3_102 * 2]++;
    } else {
      s.bl_tree[REPZ_11_1382 * 2]++;
    }
    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;
    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};
var send_tree2 = (s, tree, max_code) => {
  let n;
  let prevlen = -1;
  let curlen;
  let nextlen = tree[0 * 2 + 1];
  let count = 0;
  let max_count = 7;
  let min_count = 4;
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1];
    if (++count < max_count && curlen === nextlen) {
      continue;
    } else if (count < min_count) {
      do {
        send_code2(s, curlen, s.bl_tree);
      } while (--count !== 0);
    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code2(s, curlen, s.bl_tree);
        count--;
      }
      send_code2(s, REP_3_62, s.bl_tree);
      send_bits2(s, count - 3, 2);
    } else if (count <= 10) {
      send_code2(s, REPZ_3_102, s.bl_tree);
      send_bits2(s, count - 3, 3);
    } else {
      send_code2(s, REPZ_11_1382, s.bl_tree);
      send_bits2(s, count - 11, 7);
    }
    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;
    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};
var build_bl_tree2 = (s) => {
  let max_blindex;
  scan_tree2(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree2(s, s.dyn_dtree, s.d_desc.max_code);
  build_tree2(s, s.bl_desc);
  for (max_blindex = BL_CODES$12 - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order2[max_blindex] * 2 + 1] !== 0) {
      break;
    }
  }
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  return max_blindex;
};
var send_all_trees2 = (s, lcodes, dcodes, blcodes) => {
  let rank22;
  send_bits2(s, lcodes - 257, 5);
  send_bits2(s, dcodes - 1, 5);
  send_bits2(s, blcodes - 4, 4);
  for (rank22 = 0; rank22 < blcodes; rank22++) {
    send_bits2(s, s.bl_tree[bl_order2[rank22] * 2 + 1], 3);
  }
  send_tree2(s, s.dyn_ltree, lcodes - 1);
  send_tree2(s, s.dyn_dtree, dcodes - 1);
};
var detect_data_type2 = (s) => {
  let black_mask = 4093624447;
  let n;
  for (n = 0; n <= 31; n++, black_mask >>>= 1) {
    if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
      return Z_BINARY2;
    }
  }
  if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
    return Z_TEXT2;
  }
  for (n = 32; n < LITERALS$12; n++) {
    if (s.dyn_ltree[n * 2] !== 0) {
      return Z_TEXT2;
    }
  }
  return Z_BINARY2;
};
var static_init_done2 = false;
var _tr_init$12 = (s) => {
  if (!static_init_done2) {
    tr_static_init2();
    static_init_done2 = true;
  }
  s.l_desc = new TreeDesc2(s.dyn_ltree, static_l_desc2);
  s.d_desc = new TreeDesc2(s.dyn_dtree, static_d_desc2);
  s.bl_desc = new TreeDesc2(s.bl_tree, static_bl_desc2);
  s.bi_buf = 0;
  s.bi_valid = 0;
  init_block2(s);
};
var _tr_stored_block$12 = (s, buf, stored_len, last) => {
  send_bits2(s, (STORED_BLOCK2 << 1) + (last ? 1 : 0), 3);
  copy_block2(s, buf, stored_len, true);
};
var _tr_align$12 = (s) => {
  send_bits2(s, STATIC_TREES2 << 1, 3);
  send_code2(s, END_BLOCK2, static_ltree2);
  bi_flush2(s);
};
var _tr_flush_block$12 = (s, buf, stored_len, last) => {
  let opt_lenb, static_lenb;
  let max_blindex = 0;
  if (s.level > 0) {
    if (s.strm.data_type === Z_UNKNOWN$12) {
      s.strm.data_type = detect_data_type2(s);
    }
    build_tree2(s, s.l_desc);
    build_tree2(s, s.d_desc);
    max_blindex = build_bl_tree2(s);
    opt_lenb = s.opt_len + 3 + 7 >>> 3;
    static_lenb = s.static_len + 3 + 7 >>> 3;
    if (static_lenb <= opt_lenb) {
      opt_lenb = static_lenb;
    }
  } else {
    opt_lenb = static_lenb = stored_len + 5;
  }
  if (stored_len + 4 <= opt_lenb && buf !== -1) {
    _tr_stored_block$12(s, buf, stored_len, last);
  } else if (s.strategy === Z_FIXED$12 || static_lenb === opt_lenb) {
    send_bits2(s, (STATIC_TREES2 << 1) + (last ? 1 : 0), 3);
    compress_block2(s, static_ltree2, static_dtree2);
  } else {
    send_bits2(s, (DYN_TREES2 << 1) + (last ? 1 : 0), 3);
    send_all_trees2(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block2(s, s.dyn_ltree, s.dyn_dtree);
  }
  init_block2(s);
  if (last) {
    bi_windup2(s);
  }
};
var _tr_tally$12 = (s, dist, lc) => {
  s.pending_buf[s.d_buf + s.last_lit * 2] = dist >>> 8 & 255;
  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 255;
  s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
  s.last_lit++;
  if (dist === 0) {
    s.dyn_ltree[lc * 2]++;
  } else {
    s.matches++;
    dist--;
    s.dyn_ltree[(_length_code2[lc] + LITERALS$12 + 1) * 2]++;
    s.dyn_dtree[d_code2(dist) * 2]++;
  }
  return s.last_lit === s.lit_bufsize - 1;
};
var _tr_init_12 = _tr_init$12;
var _tr_stored_block_12 = _tr_stored_block$12;
var _tr_flush_block_12 = _tr_flush_block$12;
var _tr_tally_12 = _tr_tally$12;
var _tr_align_12 = _tr_align$12;
var trees2 = {
  _tr_init: _tr_init_12,
  _tr_stored_block: _tr_stored_block_12,
  _tr_flush_block: _tr_flush_block_12,
  _tr_tally: _tr_tally_12,
  _tr_align: _tr_align_12
};
var adler322 = (adler, buf, len, pos) => {
  let s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
  while (len !== 0) {
    n = len > 2e3 ? 2e3 : len;
    len -= n;
    do {
      s1 = s1 + buf[pos++] | 0;
      s2 = s2 + s1 | 0;
    } while (--n);
    s1 %= 65521;
    s2 %= 65521;
  }
  return s1 | s2 << 16 | 0;
};
var adler32_12 = adler322;
var makeTable2 = () => {
  let c, table = [];
  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    }
    table[n] = c;
  }
  return table;
};
var crcTable2 = new Uint32Array(makeTable2());
var crc322 = (crc, buf, len, pos) => {
  const t = crcTable2;
  const end = pos + len;
  crc ^= -1;
  for (let i = pos; i < end; i++) {
    crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
  }
  return crc ^ -1;
};
var crc32_12 = crc322;
var messages2 = {
  2: "need dictionary",
  1: "stream end",
  0: "",
  "-1": "file error",
  "-2": "stream error",
  "-3": "data error",
  "-4": "insufficient memory",
  "-5": "buffer error",
  "-6": "incompatible version"
};
var constants$22 = {
  Z_NO_FLUSH: 0,
  Z_PARTIAL_FLUSH: 1,
  Z_SYNC_FLUSH: 2,
  Z_FULL_FLUSH: 3,
  Z_FINISH: 4,
  Z_BLOCK: 5,
  Z_TREES: 6,
  Z_OK: 0,
  Z_STREAM_END: 1,
  Z_NEED_DICT: 2,
  Z_ERRNO: -1,
  Z_STREAM_ERROR: -2,
  Z_DATA_ERROR: -3,
  Z_MEM_ERROR: -4,
  Z_BUF_ERROR: -5,
  Z_NO_COMPRESSION: 0,
  Z_BEST_SPEED: 1,
  Z_BEST_COMPRESSION: 9,
  Z_DEFAULT_COMPRESSION: -1,
  Z_FILTERED: 1,
  Z_HUFFMAN_ONLY: 2,
  Z_RLE: 3,
  Z_FIXED: 4,
  Z_DEFAULT_STRATEGY: 0,
  Z_BINARY: 0,
  Z_TEXT: 1,
  Z_UNKNOWN: 2,
  Z_DEFLATED: 8
};
var { _tr_init: _tr_init2, _tr_stored_block: _tr_stored_block2, _tr_flush_block: _tr_flush_block2, _tr_tally: _tr_tally2, _tr_align: _tr_align2 } = trees2;
var {
  Z_NO_FLUSH: Z_NO_FLUSH$22,
  Z_PARTIAL_FLUSH: Z_PARTIAL_FLUSH2,
  Z_FULL_FLUSH: Z_FULL_FLUSH$12,
  Z_FINISH: Z_FINISH$32,
  Z_BLOCK: Z_BLOCK$12,
  Z_OK: Z_OK$32,
  Z_STREAM_END: Z_STREAM_END$32,
  Z_STREAM_ERROR: Z_STREAM_ERROR$22,
  Z_DATA_ERROR: Z_DATA_ERROR$22,
  Z_BUF_ERROR: Z_BUF_ERROR$12,
  Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$12,
  Z_FILTERED: Z_FILTERED2,
  Z_HUFFMAN_ONLY: Z_HUFFMAN_ONLY2,
  Z_RLE: Z_RLE2,
  Z_FIXED: Z_FIXED2,
  Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY$12,
  Z_UNKNOWN: Z_UNKNOWN2,
  Z_DEFLATED: Z_DEFLATED$22
} = constants$22;
var MAX_MEM_LEVEL2 = 9;
var MAX_WBITS$12 = 15;
var DEF_MEM_LEVEL2 = 8;
var LENGTH_CODES2 = 29;
var LITERALS2 = 256;
var L_CODES2 = LITERALS2 + 1 + LENGTH_CODES2;
var D_CODES2 = 30;
var BL_CODES2 = 19;
var HEAP_SIZE2 = 2 * L_CODES2 + 1;
var MAX_BITS2 = 15;
var MIN_MATCH2 = 3;
var MAX_MATCH2 = 258;
var MIN_LOOKAHEAD2 = MAX_MATCH2 + MIN_MATCH2 + 1;
var PRESET_DICT2 = 32;
var INIT_STATE2 = 42;
var EXTRA_STATE2 = 69;
var NAME_STATE2 = 73;
var COMMENT_STATE2 = 91;
var HCRC_STATE2 = 103;
var BUSY_STATE2 = 113;
var FINISH_STATE2 = 666;
var BS_NEED_MORE2 = 1;
var BS_BLOCK_DONE2 = 2;
var BS_FINISH_STARTED2 = 3;
var BS_FINISH_DONE2 = 4;
var OS_CODE2 = 3;
var err2 = (strm, errorCode) => {
  strm.msg = messages2[errorCode];
  return errorCode;
};
var rank2 = (f) => {
  return (f << 1) - (f > 4 ? 9 : 0);
};
var zero2 = (buf) => {
  let len = buf.length;
  while (--len >= 0) {
    buf[len] = 0;
  }
};
var HASH_ZLIB2 = (s, prev, data) => (prev << s.hash_shift ^ data) & s.hash_mask;
var HASH2 = HASH_ZLIB2;
var flush_pending2 = (strm) => {
  const s = strm.state;
  let len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) {
    return;
  }
  strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
  strm.next_out += len;
  s.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
};
var flush_block_only2 = (s, last) => {
  _tr_flush_block2(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending2(s.strm);
};
var put_byte2 = (s, b) => {
  s.pending_buf[s.pending++] = b;
};
var putShortMSB2 = (s, b) => {
  s.pending_buf[s.pending++] = b >>> 8 & 255;
  s.pending_buf[s.pending++] = b & 255;
};
var read_buf2 = (strm, buf, start2, size2) => {
  let len = strm.avail_in;
  if (len > size2) {
    len = size2;
  }
  if (len === 0) {
    return 0;
  }
  strm.avail_in -= len;
  buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start2);
  if (strm.state.wrap === 1) {
    strm.adler = adler32_12(strm.adler, buf, len, start2);
  } else if (strm.state.wrap === 2) {
    strm.adler = crc32_12(strm.adler, buf, len, start2);
  }
  strm.next_in += len;
  strm.total_in += len;
  return len;
};
var longest_match2 = (s, cur_match) => {
  let chain_length = s.max_chain_length;
  let scan = s.strstart;
  let match;
  let len;
  let best_len = s.prev_length;
  let nice_match = s.nice_match;
  const limit = s.strstart > s.w_size - MIN_LOOKAHEAD2 ? s.strstart - (s.w_size - MIN_LOOKAHEAD2) : 0;
  const _win = s.window;
  const wmask = s.w_mask;
  const prev = s.prev;
  const strend = s.strstart + MAX_MATCH2;
  let scan_end1 = _win[scan + best_len - 1];
  let scan_end = _win[scan + best_len];
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  if (nice_match > s.lookahead) {
    nice_match = s.lookahead;
  }
  do {
    match = cur_match;
    if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
      continue;
    }
    scan += 2;
    match++;
    do {
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
    len = MAX_MATCH2 - (strend - scan);
    scan = strend - MAX_MATCH2;
    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1 = _win[scan + best_len - 1];
      scan_end = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
};
var fill_window2 = (s) => {
  const _w_size = s.w_size;
  let p, n, m, more, str;
  do {
    more = s.window_size - s.lookahead - s.strstart;
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD2)) {
      s.window.set(s.window.subarray(_w_size, _w_size + _w_size), 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      s.block_start -= _w_size;
      n = s.hash_size;
      p = n;
      do {
        m = s.head[--p];
        s.head[p] = m >= _w_size ? m - _w_size : 0;
      } while (--n);
      n = _w_size;
      p = n;
      do {
        m = s.prev[--p];
        s.prev[p] = m >= _w_size ? m - _w_size : 0;
      } while (--n);
      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }
    n = read_buf2(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;
    if (s.lookahead + s.insert >= MIN_MATCH2) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];
      s.ins_h = HASH2(s, s.ins_h, s.window[str + 1]);
      while (s.insert) {
        s.ins_h = HASH2(s, s.ins_h, s.window[str + MIN_MATCH2 - 1]);
        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH2) {
          break;
        }
      }
    }
  } while (s.lookahead < MIN_LOOKAHEAD2 && s.strm.avail_in !== 0);
};
var deflate_stored2 = (s, flush) => {
  let max_block_size = 65535;
  if (max_block_size > s.pending_buf_size - 5) {
    max_block_size = s.pending_buf_size - 5;
  }
  for (; ; ) {
    if (s.lookahead <= 1) {
      fill_window2(s);
      if (s.lookahead === 0 && flush === Z_NO_FLUSH$22) {
        return BS_NEED_MORE2;
      }
      if (s.lookahead === 0) {
        break;
      }
    }
    s.strstart += s.lookahead;
    s.lookahead = 0;
    const max_start = s.block_start + max_block_size;
    if (s.strstart === 0 || s.strstart >= max_start) {
      s.lookahead = s.strstart - max_start;
      s.strstart = max_start;
      flush_block_only2(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE2;
      }
    }
    if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD2) {
      flush_block_only2(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE2;
      }
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$32) {
    flush_block_only2(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED2;
    }
    return BS_FINISH_DONE2;
  }
  if (s.strstart > s.block_start) {
    flush_block_only2(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE2;
    }
  }
  return BS_NEED_MORE2;
};
var deflate_fast2 = (s, flush) => {
  let hash_head;
  let bflush;
  for (; ; ) {
    if (s.lookahead < MIN_LOOKAHEAD2) {
      fill_window2(s);
      if (s.lookahead < MIN_LOOKAHEAD2 && flush === Z_NO_FLUSH$22) {
        return BS_NEED_MORE2;
      }
      if (s.lookahead === 0) {
        break;
      }
    }
    hash_head = 0;
    if (s.lookahead >= MIN_MATCH2) {
      s.ins_h = HASH2(s, s.ins_h, s.window[s.strstart + MIN_MATCH2 - 1]);
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
    }
    if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD2) {
      s.match_length = longest_match2(s, hash_head);
    }
    if (s.match_length >= MIN_MATCH2) {
      bflush = _tr_tally2(s, s.strstart - s.match_start, s.match_length - MIN_MATCH2);
      s.lookahead -= s.match_length;
      if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH2) {
        s.match_length--;
        do {
          s.strstart++;
          s.ins_h = HASH2(s, s.ins_h, s.window[s.strstart + MIN_MATCH2 - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        } while (--s.match_length !== 0);
        s.strstart++;
      } else {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        s.ins_h = HASH2(s, s.ins_h, s.window[s.strstart + 1]);
      }
    } else {
      bflush = _tr_tally2(s, 0, s.window[s.strstart]);
      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      flush_block_only2(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE2;
      }
    }
  }
  s.insert = s.strstart < MIN_MATCH2 - 1 ? s.strstart : MIN_MATCH2 - 1;
  if (flush === Z_FINISH$32) {
    flush_block_only2(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED2;
    }
    return BS_FINISH_DONE2;
  }
  if (s.last_lit) {
    flush_block_only2(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE2;
    }
  }
  return BS_BLOCK_DONE2;
};
var deflate_slow2 = (s, flush) => {
  let hash_head;
  let bflush;
  let max_insert;
  for (; ; ) {
    if (s.lookahead < MIN_LOOKAHEAD2) {
      fill_window2(s);
      if (s.lookahead < MIN_LOOKAHEAD2 && flush === Z_NO_FLUSH$22) {
        return BS_NEED_MORE2;
      }
      if (s.lookahead === 0) {
        break;
      }
    }
    hash_head = 0;
    if (s.lookahead >= MIN_MATCH2) {
      s.ins_h = HASH2(s, s.ins_h, s.window[s.strstart + MIN_MATCH2 - 1]);
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
    }
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH2 - 1;
    if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD2) {
      s.match_length = longest_match2(s, hash_head);
      if (s.match_length <= 5 && (s.strategy === Z_FILTERED2 || s.match_length === MIN_MATCH2 && s.strstart - s.match_start > 4096)) {
        s.match_length = MIN_MATCH2 - 1;
      }
    }
    if (s.prev_length >= MIN_MATCH2 && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH2;
      bflush = _tr_tally2(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH2);
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          s.ins_h = HASH2(s, s.ins_h, s.window[s.strstart + MIN_MATCH2 - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH2 - 1;
      s.strstart++;
      if (bflush) {
        flush_block_only2(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE2;
        }
      }
    } else if (s.match_available) {
      bflush = _tr_tally2(s, 0, s.window[s.strstart - 1]);
      if (bflush) {
        flush_block_only2(s, false);
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE2;
      }
    } else {
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  if (s.match_available) {
    bflush = _tr_tally2(s, 0, s.window[s.strstart - 1]);
    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH2 - 1 ? s.strstart : MIN_MATCH2 - 1;
  if (flush === Z_FINISH$32) {
    flush_block_only2(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED2;
    }
    return BS_FINISH_DONE2;
  }
  if (s.last_lit) {
    flush_block_only2(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE2;
    }
  }
  return BS_BLOCK_DONE2;
};
var deflate_rle2 = (s, flush) => {
  let bflush;
  let prev;
  let scan, strend;
  const _win = s.window;
  for (; ; ) {
    if (s.lookahead <= MAX_MATCH2) {
      fill_window2(s);
      if (s.lookahead <= MAX_MATCH2 && flush === Z_NO_FLUSH$22) {
        return BS_NEED_MORE2;
      }
      if (s.lookahead === 0) {
        break;
      }
    }
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH2 && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH2;
        do {
        } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
        s.match_length = MAX_MATCH2 - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
    }
    if (s.match_length >= MIN_MATCH2) {
      bflush = _tr_tally2(s, 1, s.match_length - MIN_MATCH2);
      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      bflush = _tr_tally2(s, 0, s.window[s.strstart]);
      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      flush_block_only2(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE2;
      }
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$32) {
    flush_block_only2(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED2;
    }
    return BS_FINISH_DONE2;
  }
  if (s.last_lit) {
    flush_block_only2(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE2;
    }
  }
  return BS_BLOCK_DONE2;
};
var deflate_huff2 = (s, flush) => {
  let bflush;
  for (; ; ) {
    if (s.lookahead === 0) {
      fill_window2(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH$22) {
          return BS_NEED_MORE2;
        }
        break;
      }
    }
    s.match_length = 0;
    bflush = _tr_tally2(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      flush_block_only2(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE2;
      }
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$32) {
    flush_block_only2(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED2;
    }
    return BS_FINISH_DONE2;
  }
  if (s.last_lit) {
    flush_block_only2(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE2;
    }
  }
  return BS_BLOCK_DONE2;
};
function Config2(good_length, max_lazy, nice_length, max_chain, func) {
  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}
var configuration_table2 = [
  new Config2(0, 0, 0, 0, deflate_stored2),
  new Config2(4, 4, 8, 4, deflate_fast2),
  new Config2(4, 5, 16, 8, deflate_fast2),
  new Config2(4, 6, 32, 32, deflate_fast2),
  new Config2(4, 4, 16, 16, deflate_slow2),
  new Config2(8, 16, 32, 32, deflate_slow2),
  new Config2(8, 16, 128, 128, deflate_slow2),
  new Config2(8, 32, 128, 256, deflate_slow2),
  new Config2(32, 128, 258, 1024, deflate_slow2),
  new Config2(32, 258, 258, 4096, deflate_slow2)
];
var lm_init2 = (s) => {
  s.window_size = 2 * s.w_size;
  zero2(s.head);
  s.max_lazy_match = configuration_table2[s.level].max_lazy;
  s.good_match = configuration_table2[s.level].good_length;
  s.nice_match = configuration_table2[s.level].nice_length;
  s.max_chain_length = configuration_table2[s.level].max_chain;
  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH2 - 1;
  s.match_available = 0;
  s.ins_h = 0;
};
function DeflateState2() {
  this.strm = null;
  this.status = 0;
  this.pending_buf = null;
  this.pending_buf_size = 0;
  this.pending_out = 0;
  this.pending = 0;
  this.wrap = 0;
  this.gzhead = null;
  this.gzindex = 0;
  this.method = Z_DEFLATED$22;
  this.last_flush = -1;
  this.w_size = 0;
  this.w_bits = 0;
  this.w_mask = 0;
  this.window = null;
  this.window_size = 0;
  this.prev = null;
  this.head = null;
  this.ins_h = 0;
  this.hash_size = 0;
  this.hash_bits = 0;
  this.hash_mask = 0;
  this.hash_shift = 0;
  this.block_start = 0;
  this.match_length = 0;
  this.prev_match = 0;
  this.match_available = 0;
  this.strstart = 0;
  this.match_start = 0;
  this.lookahead = 0;
  this.prev_length = 0;
  this.max_chain_length = 0;
  this.max_lazy_match = 0;
  this.level = 0;
  this.strategy = 0;
  this.good_match = 0;
  this.nice_match = 0;
  this.dyn_ltree = new Uint16Array(HEAP_SIZE2 * 2);
  this.dyn_dtree = new Uint16Array((2 * D_CODES2 + 1) * 2);
  this.bl_tree = new Uint16Array((2 * BL_CODES2 + 1) * 2);
  zero2(this.dyn_ltree);
  zero2(this.dyn_dtree);
  zero2(this.bl_tree);
  this.l_desc = null;
  this.d_desc = null;
  this.bl_desc = null;
  this.bl_count = new Uint16Array(MAX_BITS2 + 1);
  this.heap = new Uint16Array(2 * L_CODES2 + 1);
  zero2(this.heap);
  this.heap_len = 0;
  this.heap_max = 0;
  this.depth = new Uint16Array(2 * L_CODES2 + 1);
  zero2(this.depth);
  this.l_buf = 0;
  this.lit_bufsize = 0;
  this.last_lit = 0;
  this.d_buf = 0;
  this.opt_len = 0;
  this.static_len = 0;
  this.matches = 0;
  this.insert = 0;
  this.bi_buf = 0;
  this.bi_valid = 0;
}
var deflateResetKeep2 = (strm) => {
  if (!strm || !strm.state) {
    return err2(strm, Z_STREAM_ERROR$22);
  }
  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN2;
  const s = strm.state;
  s.pending = 0;
  s.pending_out = 0;
  if (s.wrap < 0) {
    s.wrap = -s.wrap;
  }
  s.status = s.wrap ? INIT_STATE2 : BUSY_STATE2;
  strm.adler = s.wrap === 2 ? 0 : 1;
  s.last_flush = Z_NO_FLUSH$22;
  _tr_init2(s);
  return Z_OK$32;
};
var deflateReset2 = (strm) => {
  const ret = deflateResetKeep2(strm);
  if (ret === Z_OK$32) {
    lm_init2(strm.state);
  }
  return ret;
};
var deflateSetHeader2 = (strm, head) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$22;
  }
  if (strm.state.wrap !== 2) {
    return Z_STREAM_ERROR$22;
  }
  strm.state.gzhead = head;
  return Z_OK$32;
};
var deflateInit22 = (strm, level, method2, windowBits, memLevel, strategy) => {
  if (!strm) {
    return Z_STREAM_ERROR$22;
  }
  let wrap = 1;
  if (level === Z_DEFAULT_COMPRESSION$12) {
    level = 6;
  }
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  } else if (windowBits > 15) {
    wrap = 2;
    windowBits -= 16;
  }
  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL2 || method2 !== Z_DEFLATED$22 || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED2) {
    return err2(strm, Z_STREAM_ERROR$22);
  }
  if (windowBits === 8) {
    windowBits = 9;
  }
  const s = new DeflateState2();
  strm.state = s;
  s.strm = strm;
  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;
  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH2 - 1) / MIN_MATCH2);
  s.window = new Uint8Array(s.w_size * 2);
  s.head = new Uint16Array(s.hash_size);
  s.prev = new Uint16Array(s.w_size);
  s.lit_bufsize = 1 << memLevel + 6;
  s.pending_buf_size = s.lit_bufsize * 4;
  s.pending_buf = new Uint8Array(s.pending_buf_size);
  s.d_buf = 1 * s.lit_bufsize;
  s.l_buf = (1 + 2) * s.lit_bufsize;
  s.level = level;
  s.strategy = strategy;
  s.method = method2;
  return deflateReset2(strm);
};
var deflateInit3 = (strm, level) => {
  return deflateInit22(strm, level, Z_DEFLATED$22, MAX_WBITS$12, DEF_MEM_LEVEL2, Z_DEFAULT_STRATEGY$12);
};
var deflate$22 = (strm, flush) => {
  let beg, val;
  if (!strm || !strm.state || flush > Z_BLOCK$12 || flush < 0) {
    return strm ? err2(strm, Z_STREAM_ERROR$22) : Z_STREAM_ERROR$22;
  }
  const s = strm.state;
  if (!strm.output || !strm.input && strm.avail_in !== 0 || s.status === FINISH_STATE2 && flush !== Z_FINISH$32) {
    return err2(strm, strm.avail_out === 0 ? Z_BUF_ERROR$12 : Z_STREAM_ERROR$22);
  }
  s.strm = strm;
  const old_flush = s.last_flush;
  s.last_flush = flush;
  if (s.status === INIT_STATE2) {
    if (s.wrap === 2) {
      strm.adler = 0;
      put_byte2(s, 31);
      put_byte2(s, 139);
      put_byte2(s, 8);
      if (!s.gzhead) {
        put_byte2(s, 0);
        put_byte2(s, 0);
        put_byte2(s, 0);
        put_byte2(s, 0);
        put_byte2(s, 0);
        put_byte2(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY2 || s.level < 2 ? 4 : 0);
        put_byte2(s, OS_CODE2);
        s.status = BUSY_STATE2;
      } else {
        put_byte2(s, (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16));
        put_byte2(s, s.gzhead.time & 255);
        put_byte2(s, s.gzhead.time >> 8 & 255);
        put_byte2(s, s.gzhead.time >> 16 & 255);
        put_byte2(s, s.gzhead.time >> 24 & 255);
        put_byte2(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY2 || s.level < 2 ? 4 : 0);
        put_byte2(s, s.gzhead.os & 255);
        if (s.gzhead.extra && s.gzhead.extra.length) {
          put_byte2(s, s.gzhead.extra.length & 255);
          put_byte2(s, s.gzhead.extra.length >> 8 & 255);
        }
        if (s.gzhead.hcrc) {
          strm.adler = crc32_12(strm.adler, s.pending_buf, s.pending, 0);
        }
        s.gzindex = 0;
        s.status = EXTRA_STATE2;
      }
    } else {
      let header = Z_DEFLATED$22 + (s.w_bits - 8 << 4) << 8;
      let level_flags = -1;
      if (s.strategy >= Z_HUFFMAN_ONLY2 || s.level < 2) {
        level_flags = 0;
      } else if (s.level < 6) {
        level_flags = 1;
      } else if (s.level === 6) {
        level_flags = 2;
      } else {
        level_flags = 3;
      }
      header |= level_flags << 6;
      if (s.strstart !== 0) {
        header |= PRESET_DICT2;
      }
      header += 31 - header % 31;
      s.status = BUSY_STATE2;
      putShortMSB2(s, header);
      if (s.strstart !== 0) {
        putShortMSB2(s, strm.adler >>> 16);
        putShortMSB2(s, strm.adler & 65535);
      }
      strm.adler = 1;
    }
  }
  if (s.status === EXTRA_STATE2) {
    if (s.gzhead.extra) {
      beg = s.pending;
      while (s.gzindex < (s.gzhead.extra.length & 65535)) {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_12(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending2(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            break;
          }
        }
        put_byte2(s, s.gzhead.extra[s.gzindex] & 255);
        s.gzindex++;
      }
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_12(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (s.gzindex === s.gzhead.extra.length) {
        s.gzindex = 0;
        s.status = NAME_STATE2;
      }
    } else {
      s.status = NAME_STATE2;
    }
  }
  if (s.status === NAME_STATE2) {
    if (s.gzhead.name) {
      beg = s.pending;
      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_12(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending2(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
        } else {
          val = 0;
        }
        put_byte2(s, val);
      } while (val !== 0);
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_12(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.gzindex = 0;
        s.status = COMMENT_STATE2;
      }
    } else {
      s.status = COMMENT_STATE2;
    }
  }
  if (s.status === COMMENT_STATE2) {
    if (s.gzhead.comment) {
      beg = s.pending;
      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_12(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending2(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
        } else {
          val = 0;
        }
        put_byte2(s, val);
      } while (val !== 0);
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_12(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.status = HCRC_STATE2;
      }
    } else {
      s.status = HCRC_STATE2;
    }
  }
  if (s.status === HCRC_STATE2) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending2(strm);
      }
      if (s.pending + 2 <= s.pending_buf_size) {
        put_byte2(s, strm.adler & 255);
        put_byte2(s, strm.adler >> 8 & 255);
        strm.adler = 0;
        s.status = BUSY_STATE2;
      }
    } else {
      s.status = BUSY_STATE2;
    }
  }
  if (s.pending !== 0) {
    flush_pending2(strm);
    if (strm.avail_out === 0) {
      s.last_flush = -1;
      return Z_OK$32;
    }
  } else if (strm.avail_in === 0 && rank2(flush) <= rank2(old_flush) && flush !== Z_FINISH$32) {
    return err2(strm, Z_BUF_ERROR$12);
  }
  if (s.status === FINISH_STATE2 && strm.avail_in !== 0) {
    return err2(strm, Z_BUF_ERROR$12);
  }
  if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH$22 && s.status !== FINISH_STATE2) {
    let bstate = s.strategy === Z_HUFFMAN_ONLY2 ? deflate_huff2(s, flush) : s.strategy === Z_RLE2 ? deflate_rle2(s, flush) : configuration_table2[s.level].func(s, flush);
    if (bstate === BS_FINISH_STARTED2 || bstate === BS_FINISH_DONE2) {
      s.status = FINISH_STATE2;
    }
    if (bstate === BS_NEED_MORE2 || bstate === BS_FINISH_STARTED2) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
      }
      return Z_OK$32;
    }
    if (bstate === BS_BLOCK_DONE2) {
      if (flush === Z_PARTIAL_FLUSH2) {
        _tr_align2(s);
      } else if (flush !== Z_BLOCK$12) {
        _tr_stored_block2(s, 0, 0, false);
        if (flush === Z_FULL_FLUSH$12) {
          zero2(s.head);
          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending2(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        return Z_OK$32;
      }
    }
  }
  if (flush !== Z_FINISH$32) {
    return Z_OK$32;
  }
  if (s.wrap <= 0) {
    return Z_STREAM_END$32;
  }
  if (s.wrap === 2) {
    put_byte2(s, strm.adler & 255);
    put_byte2(s, strm.adler >> 8 & 255);
    put_byte2(s, strm.adler >> 16 & 255);
    put_byte2(s, strm.adler >> 24 & 255);
    put_byte2(s, strm.total_in & 255);
    put_byte2(s, strm.total_in >> 8 & 255);
    put_byte2(s, strm.total_in >> 16 & 255);
    put_byte2(s, strm.total_in >> 24 & 255);
  } else {
    putShortMSB2(s, strm.adler >>> 16);
    putShortMSB2(s, strm.adler & 65535);
  }
  flush_pending2(strm);
  if (s.wrap > 0) {
    s.wrap = -s.wrap;
  }
  return s.pending !== 0 ? Z_OK$32 : Z_STREAM_END$32;
};
var deflateEnd2 = (strm) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$22;
  }
  const status = strm.state.status;
  if (status !== INIT_STATE2 && status !== EXTRA_STATE2 && status !== NAME_STATE2 && status !== COMMENT_STATE2 && status !== HCRC_STATE2 && status !== BUSY_STATE2 && status !== FINISH_STATE2) {
    return err2(strm, Z_STREAM_ERROR$22);
  }
  strm.state = null;
  return status === BUSY_STATE2 ? err2(strm, Z_DATA_ERROR$22) : Z_OK$32;
};
var deflateSetDictionary2 = (strm, dictionary) => {
  let dictLength = dictionary.length;
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$22;
  }
  const s = strm.state;
  const wrap = s.wrap;
  if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE2 || s.lookahead) {
    return Z_STREAM_ERROR$22;
  }
  if (wrap === 1) {
    strm.adler = adler32_12(strm.adler, dictionary, dictLength, 0);
  }
  s.wrap = 0;
  if (dictLength >= s.w_size) {
    if (wrap === 0) {
      zero2(s.head);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    let tmpDict = new Uint8Array(s.w_size);
    tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  const avail = strm.avail_in;
  const next = strm.next_in;
  const input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window2(s);
  while (s.lookahead >= MIN_MATCH2) {
    let str = s.strstart;
    let n = s.lookahead - (MIN_MATCH2 - 1);
    do {
      s.ins_h = HASH2(s, s.ins_h, s.window[str + MIN_MATCH2 - 1]);
      s.prev[str & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = str;
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH2 - 1;
    fill_window2(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH2 - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK$32;
};
var deflateInit_12 = deflateInit3;
var deflateInit2_12 = deflateInit22;
var deflateReset_12 = deflateReset2;
var deflateResetKeep_12 = deflateResetKeep2;
var deflateSetHeader_12 = deflateSetHeader2;
var deflate_2$12 = deflate$22;
var deflateEnd_12 = deflateEnd2;
var deflateSetDictionary_12 = deflateSetDictionary2;
var deflateInfo2 = "pako deflate (from Nodeca project)";
var deflate_1$22 = {
  deflateInit: deflateInit_12,
  deflateInit2: deflateInit2_12,
  deflateReset: deflateReset_12,
  deflateResetKeep: deflateResetKeep_12,
  deflateSetHeader: deflateSetHeader_12,
  deflate: deflate_2$12,
  deflateEnd: deflateEnd_12,
  deflateSetDictionary: deflateSetDictionary_12,
  deflateInfo: deflateInfo2
};
var _has2 = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
var assign2 = function(obj) {
  const sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    const source = sources.shift();
    if (!source) {
      continue;
    }
    if (typeof source !== "object") {
      throw new TypeError(source + "must be non-object");
    }
    for (const p in source) {
      if (_has2(source, p)) {
        obj[p] = source[p];
      }
    }
  }
  return obj;
};
var flattenChunks2 = (chunks) => {
  let len = 0;
  for (let i = 0, l = chunks.length; i < l; i++) {
    len += chunks[i].length;
  }
  const result = new Uint8Array(len);
  for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
    let chunk = chunks[i];
    result.set(chunk, pos);
    pos += chunk.length;
  }
  return result;
};
var common2 = {
  assign: assign2,
  flattenChunks: flattenChunks2
};
var STR_APPLY_UIA_OK2 = true;
try {
  String.fromCharCode.apply(null, new Uint8Array(1));
} catch (__) {
  STR_APPLY_UIA_OK2 = false;
}
var _utf8len2 = new Uint8Array(256);
for (let q = 0; q < 256; q++) {
  _utf8len2[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
}
_utf8len2[254] = _utf8len2[254] = 1;
var string2buf2 = (str) => {
  if (typeof TextEncoder === "function" && TextEncoder.prototype.encode) {
    return new TextEncoder().encode(str);
  }
  let buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 64512) === 56320) {
        c = 65536 + (c - 55296 << 10) + (c2 - 56320);
        m_pos++;
      }
    }
    buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
  }
  buf = new Uint8Array(buf_len);
  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 64512) === 56320) {
        c = 65536 + (c - 55296 << 10) + (c2 - 56320);
        m_pos++;
      }
    }
    if (c < 128) {
      buf[i++] = c;
    } else if (c < 2048) {
      buf[i++] = 192 | c >>> 6;
      buf[i++] = 128 | c & 63;
    } else if (c < 65536) {
      buf[i++] = 224 | c >>> 12;
      buf[i++] = 128 | c >>> 6 & 63;
      buf[i++] = 128 | c & 63;
    } else {
      buf[i++] = 240 | c >>> 18;
      buf[i++] = 128 | c >>> 12 & 63;
      buf[i++] = 128 | c >>> 6 & 63;
      buf[i++] = 128 | c & 63;
    }
  }
  return buf;
};
var buf2binstring2 = (buf, len) => {
  if (len < 65534) {
    if (buf.subarray && STR_APPLY_UIA_OK2) {
      return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
    }
  }
  let result = "";
  for (let i = 0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
};
var buf2string2 = (buf, max) => {
  const len = max || buf.length;
  if (typeof TextDecoder === "function" && TextDecoder.prototype.decode) {
    return new TextDecoder().decode(buf.subarray(0, max));
  }
  let i, out;
  const utf16buf = new Array(len * 2);
  for (out = 0, i = 0; i < len; ) {
    let c = buf[i++];
    if (c < 128) {
      utf16buf[out++] = c;
      continue;
    }
    let c_len = _utf8len2[c];
    if (c_len > 4) {
      utf16buf[out++] = 65533;
      i += c_len - 1;
      continue;
    }
    c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
    while (c_len > 1 && i < len) {
      c = c << 6 | buf[i++] & 63;
      c_len--;
    }
    if (c_len > 1) {
      utf16buf[out++] = 65533;
      continue;
    }
    if (c < 65536) {
      utf16buf[out++] = c;
    } else {
      c -= 65536;
      utf16buf[out++] = 55296 | c >> 10 & 1023;
      utf16buf[out++] = 56320 | c & 1023;
    }
  }
  return buf2binstring2(utf16buf, out);
};
var utf8border2 = (buf, max) => {
  max = max || buf.length;
  if (max > buf.length) {
    max = buf.length;
  }
  let pos = max - 1;
  while (pos >= 0 && (buf[pos] & 192) === 128) {
    pos--;
  }
  if (pos < 0) {
    return max;
  }
  if (pos === 0) {
    return max;
  }
  return pos + _utf8len2[buf[pos]] > max ? pos : max;
};
var strings2 = {
  string2buf: string2buf2,
  buf2string: buf2string2,
  utf8border: utf8border2
};
function ZStream2() {
  this.input = null;
  this.next_in = 0;
  this.avail_in = 0;
  this.total_in = 0;
  this.output = null;
  this.next_out = 0;
  this.avail_out = 0;
  this.total_out = 0;
  this.msg = "";
  this.state = null;
  this.data_type = 2;
  this.adler = 0;
}
var zstream2 = ZStream2;
var toString$12 = Object.prototype.toString;
var {
  Z_NO_FLUSH: Z_NO_FLUSH$12,
  Z_SYNC_FLUSH: Z_SYNC_FLUSH2,
  Z_FULL_FLUSH: Z_FULL_FLUSH2,
  Z_FINISH: Z_FINISH$22,
  Z_OK: Z_OK$22,
  Z_STREAM_END: Z_STREAM_END$22,
  Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION2,
  Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY2,
  Z_DEFLATED: Z_DEFLATED$12
} = constants$22;
function Deflate$12(options2) {
  this.options = common2.assign({
    level: Z_DEFAULT_COMPRESSION2,
    method: Z_DEFLATED$12,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY2
  }, options2 || {});
  let opt = this.options;
  if (opt.raw && opt.windowBits > 0) {
    opt.windowBits = -opt.windowBits;
  } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
    opt.windowBits += 16;
  }
  this.err = 0;
  this.msg = "";
  this.ended = false;
  this.chunks = [];
  this.strm = new zstream2();
  this.strm.avail_out = 0;
  let status = deflate_1$22.deflateInit2(this.strm, opt.level, opt.method, opt.windowBits, opt.memLevel, opt.strategy);
  if (status !== Z_OK$22) {
    throw new Error(messages2[status]);
  }
  if (opt.header) {
    deflate_1$22.deflateSetHeader(this.strm, opt.header);
  }
  if (opt.dictionary) {
    let dict;
    if (typeof opt.dictionary === "string") {
      dict = strings2.string2buf(opt.dictionary);
    } else if (toString$12.call(opt.dictionary) === "[object ArrayBuffer]") {
      dict = new Uint8Array(opt.dictionary);
    } else {
      dict = opt.dictionary;
    }
    status = deflate_1$22.deflateSetDictionary(this.strm, dict);
    if (status !== Z_OK$22) {
      throw new Error(messages2[status]);
    }
    this._dict_set = true;
  }
}
Deflate$12.prototype.push = function(data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  let status, _flush_mode;
  if (this.ended) {
    return false;
  }
  if (flush_mode === ~~flush_mode)
    _flush_mode = flush_mode;
  else
    _flush_mode = flush_mode === true ? Z_FINISH$22 : Z_NO_FLUSH$12;
  if (typeof data === "string") {
    strm.input = strings2.string2buf(data);
  } else if (toString$12.call(data) === "[object ArrayBuffer]") {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }
  strm.next_in = 0;
  strm.avail_in = strm.input.length;
  for (; ; ) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    if ((_flush_mode === Z_SYNC_FLUSH2 || _flush_mode === Z_FULL_FLUSH2) && strm.avail_out <= 6) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }
    status = deflate_1$22.deflate(strm, _flush_mode);
    if (status === Z_STREAM_END$22) {
      if (strm.next_out > 0) {
        this.onData(strm.output.subarray(0, strm.next_out));
      }
      status = deflate_1$22.deflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return status === Z_OK$22;
    }
    if (strm.avail_out === 0) {
      this.onData(strm.output);
      continue;
    }
    if (_flush_mode > 0 && strm.next_out > 0) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }
    if (strm.avail_in === 0)
      break;
  }
  return true;
};
Deflate$12.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};
Deflate$12.prototype.onEnd = function(status) {
  if (status === Z_OK$22) {
    this.result = common2.flattenChunks(this.chunks);
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};
function deflate$12(input, options2) {
  const deflator = new Deflate$12(options2);
  deflator.push(input, true);
  if (deflator.err) {
    throw deflator.msg || messages2[deflator.err];
  }
  return deflator.result;
}
function deflateRaw$12(input, options2) {
  options2 = options2 || {};
  options2.raw = true;
  return deflate$12(input, options2);
}
function gzip$12(input, options2) {
  options2 = options2 || {};
  options2.gzip = true;
  return deflate$12(input, options2);
}
var Deflate_1$12 = Deflate$12;
var deflate_22 = deflate$12;
var deflateRaw_1$12 = deflateRaw$12;
var gzip_1$12 = gzip$12;
var constants$12 = constants$22;
var deflate_1$12 = {
  Deflate: Deflate_1$12,
  deflate: deflate_22,
  deflateRaw: deflateRaw_1$12,
  gzip: gzip_1$12,
  constants: constants$12
};
var BAD$12 = 30;
var TYPE$12 = 12;
var inffast2 = function inflate_fast2(strm, start2) {
  let _in;
  let last;
  let _out;
  let beg;
  let end;
  let dmax;
  let wsize;
  let whave;
  let wnext;
  let s_window;
  let hold;
  let bits;
  let lcode;
  let dcode;
  let lmask;
  let dmask;
  let here;
  let op;
  let len;
  let dist;
  let from;
  let from_source;
  let input, output;
  const state2 = strm.state;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start2 - strm.avail_out);
  end = _out + (strm.avail_out - 257);
  dmax = state2.dmax;
  wsize = state2.wsize;
  whave = state2.whave;
  wnext = state2.wnext;
  s_window = state2.window;
  hold = state2.hold;
  bits = state2.bits;
  lcode = state2.lencode;
  dcode = state2.distcode;
  lmask = (1 << state2.lenbits) - 1;
  dmask = (1 << state2.distbits) - 1;
  top:
    do {
      if (bits < 15) {
        hold += input[_in++] << bits;
        bits += 8;
        hold += input[_in++] << bits;
        bits += 8;
      }
      here = lcode[hold & lmask];
      dolen:
        for (; ; ) {
          op = here >>> 24;
          hold >>>= op;
          bits -= op;
          op = here >>> 16 & 255;
          if (op === 0) {
            output[_out++] = here & 65535;
          } else if (op & 16) {
            len = here & 65535;
            op &= 15;
            if (op) {
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
              len += hold & (1 << op) - 1;
              hold >>>= op;
              bits -= op;
            }
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }
            here = dcode[hold & dmask];
            dodist:
              for (; ; ) {
                op = here >>> 24;
                hold >>>= op;
                bits -= op;
                op = here >>> 16 & 255;
                if (op & 16) {
                  dist = here & 65535;
                  op &= 15;
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                    }
                  }
                  dist += hold & (1 << op) - 1;
                  if (dist > dmax) {
                    strm.msg = "invalid distance too far back";
                    state2.mode = BAD$12;
                    break top;
                  }
                  hold >>>= op;
                  bits -= op;
                  op = _out - beg;
                  if (dist > op) {
                    op = dist - op;
                    if (op > whave) {
                      if (state2.sane) {
                        strm.msg = "invalid distance too far back";
                        state2.mode = BAD$12;
                        break top;
                      }
                    }
                    from = 0;
                    from_source = s_window;
                    if (wnext === 0) {
                      from += wsize - op;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = _out - dist;
                        from_source = output;
                      }
                    } else if (wnext < op) {
                      from += wsize + wnext - op;
                      op -= wnext;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = 0;
                        if (wnext < len) {
                          op = wnext;
                          len -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = _out - dist;
                          from_source = output;
                        }
                      }
                    } else {
                      from += wnext - op;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = _out - dist;
                        from_source = output;
                      }
                    }
                    while (len > 2) {
                      output[_out++] = from_source[from++];
                      output[_out++] = from_source[from++];
                      output[_out++] = from_source[from++];
                      len -= 3;
                    }
                    if (len) {
                      output[_out++] = from_source[from++];
                      if (len > 1) {
                        output[_out++] = from_source[from++];
                      }
                    }
                  } else {
                    from = _out - dist;
                    do {
                      output[_out++] = output[from++];
                      output[_out++] = output[from++];
                      output[_out++] = output[from++];
                      len -= 3;
                    } while (len > 2);
                    if (len) {
                      output[_out++] = output[from++];
                      if (len > 1) {
                        output[_out++] = output[from++];
                      }
                    }
                  }
                } else if ((op & 64) === 0) {
                  here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                  continue dodist;
                } else {
                  strm.msg = "invalid distance code";
                  state2.mode = BAD$12;
                  break top;
                }
                break;
              }
          } else if ((op & 64) === 0) {
            here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
            continue dolen;
          } else if (op & 32) {
            state2.mode = TYPE$12;
            break top;
          } else {
            strm.msg = "invalid literal/length code";
            state2.mode = BAD$12;
            break top;
          }
          break;
        }
    } while (_in < last && _out < end);
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
  strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
  state2.hold = hold;
  state2.bits = bits;
  return;
};
var MAXBITS2 = 15;
var ENOUGH_LENS$12 = 852;
var ENOUGH_DISTS$12 = 592;
var CODES$12 = 0;
var LENS$12 = 1;
var DISTS$12 = 2;
var lbase2 = new Uint16Array([
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  13,
  15,
  17,
  19,
  23,
  27,
  31,
  35,
  43,
  51,
  59,
  67,
  83,
  99,
  115,
  131,
  163,
  195,
  227,
  258,
  0,
  0
]);
var lext2 = new Uint8Array([
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  17,
  17,
  17,
  17,
  18,
  18,
  18,
  18,
  19,
  19,
  19,
  19,
  20,
  20,
  20,
  20,
  21,
  21,
  21,
  21,
  16,
  72,
  78
]);
var dbase2 = new Uint16Array([
  1,
  2,
  3,
  4,
  5,
  7,
  9,
  13,
  17,
  25,
  33,
  49,
  65,
  97,
  129,
  193,
  257,
  385,
  513,
  769,
  1025,
  1537,
  2049,
  3073,
  4097,
  6145,
  8193,
  12289,
  16385,
  24577,
  0,
  0
]);
var dext2 = new Uint8Array([
  16,
  16,
  16,
  16,
  17,
  17,
  18,
  18,
  19,
  19,
  20,
  20,
  21,
  21,
  22,
  22,
  23,
  23,
  24,
  24,
  25,
  25,
  26,
  26,
  27,
  27,
  28,
  28,
  29,
  29,
  64,
  64
]);
var inflate_table2 = (type72, lens, lens_index, codes, table, table_index, work, opts) => {
  const bits = opts.bits;
  let len = 0;
  let sym = 0;
  let min = 0, max = 0;
  let root = 0;
  let curr = 0;
  let drop = 0;
  let left = 0;
  let used = 0;
  let huff = 0;
  let incr;
  let fill;
  let low;
  let mask;
  let next;
  let base = null;
  let base_index = 0;
  let end;
  const count = new Uint16Array(MAXBITS2 + 1);
  const offs = new Uint16Array(MAXBITS2 + 1);
  let extra = null;
  let extra_index = 0;
  let here_bits, here_op, here_val;
  for (len = 0; len <= MAXBITS2; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }
  root = bits;
  for (max = MAXBITS2; max >= 1; max--) {
    if (count[max] !== 0) {
      break;
    }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {
    table[table_index++] = 1 << 24 | 64 << 16 | 0;
    table[table_index++] = 1 << 24 | 64 << 16 | 0;
    opts.bits = 1;
    return 0;
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) {
      break;
    }
  }
  if (root < min) {
    root = min;
  }
  left = 1;
  for (len = 1; len <= MAXBITS2; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }
  }
  if (left > 0 && (type72 === CODES$12 || max !== 1)) {
    return -1;
  }
  offs[1] = 0;
  for (len = 1; len < MAXBITS2; len++) {
    offs[len + 1] = offs[len] + count[len];
  }
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }
  if (type72 === CODES$12) {
    base = extra = work;
    end = 19;
  } else if (type72 === LENS$12) {
    base = lbase2;
    base_index -= 257;
    extra = lext2;
    extra_index -= 257;
    end = 256;
  } else {
    base = dbase2;
    extra = dext2;
    end = -1;
  }
  huff = 0;
  sym = 0;
  len = min;
  next = table_index;
  curr = root;
  drop = 0;
  low = -1;
  used = 1 << root;
  mask = used - 1;
  if (type72 === LENS$12 && used > ENOUGH_LENS$12 || type72 === DISTS$12 && used > ENOUGH_DISTS$12) {
    return 1;
  }
  for (; ; ) {
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    } else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    } else {
      here_op = 32 + 64;
      here_val = 0;
    }
    incr = 1 << len - drop;
    fill = 1 << curr;
    min = fill;
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
    } while (fill !== 0);
    incr = 1 << len - 1;
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }
    sym++;
    if (--count[len] === 0) {
      if (len === max) {
        break;
      }
      len = lens[lens_index + work[sym]];
    }
    if (len > root && (huff & mask) !== low) {
      if (drop === 0) {
        drop = root;
      }
      next += min;
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) {
          break;
        }
        curr++;
        left <<= 1;
      }
      used += 1 << curr;
      if (type72 === LENS$12 && used > ENOUGH_LENS$12 || type72 === DISTS$12 && used > ENOUGH_DISTS$12) {
        return 1;
      }
      low = huff & mask;
      table[low] = root << 24 | curr << 16 | next - table_index | 0;
    }
  }
  if (huff !== 0) {
    table[next + huff] = len - drop << 24 | 64 << 16 | 0;
  }
  opts.bits = root;
  return 0;
};
var inftrees2 = inflate_table2;
var CODES2 = 0;
var LENS2 = 1;
var DISTS2 = 2;
var {
  Z_FINISH: Z_FINISH$12,
  Z_BLOCK: Z_BLOCK2,
  Z_TREES: Z_TREES2,
  Z_OK: Z_OK$12,
  Z_STREAM_END: Z_STREAM_END$12,
  Z_NEED_DICT: Z_NEED_DICT$12,
  Z_STREAM_ERROR: Z_STREAM_ERROR$12,
  Z_DATA_ERROR: Z_DATA_ERROR$12,
  Z_MEM_ERROR: Z_MEM_ERROR$12,
  Z_BUF_ERROR: Z_BUF_ERROR2,
  Z_DEFLATED: Z_DEFLATED2
} = constants$22;
var HEAD2 = 1;
var FLAGS2 = 2;
var TIME2 = 3;
var OS2 = 4;
var EXLEN2 = 5;
var EXTRA2 = 6;
var NAME2 = 7;
var COMMENT2 = 8;
var HCRC2 = 9;
var DICTID2 = 10;
var DICT2 = 11;
var TYPE2 = 12;
var TYPEDO2 = 13;
var STORED2 = 14;
var COPY_2 = 15;
var COPY2 = 16;
var TABLE2 = 17;
var LENLENS2 = 18;
var CODELENS2 = 19;
var LEN_2 = 20;
var LEN2 = 21;
var LENEXT2 = 22;
var DIST2 = 23;
var DISTEXT2 = 24;
var MATCH2 = 25;
var LIT2 = 26;
var CHECK2 = 27;
var LENGTH2 = 28;
var DONE2 = 29;
var BAD2 = 30;
var MEM2 = 31;
var SYNC2 = 32;
var ENOUGH_LENS2 = 852;
var ENOUGH_DISTS2 = 592;
var MAX_WBITS2 = 15;
var DEF_WBITS2 = MAX_WBITS2;
var zswap322 = (q) => {
  return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
};
function InflateState2() {
  this.mode = 0;
  this.last = false;
  this.wrap = 0;
  this.havedict = false;
  this.flags = 0;
  this.dmax = 0;
  this.check = 0;
  this.total = 0;
  this.head = null;
  this.wbits = 0;
  this.wsize = 0;
  this.whave = 0;
  this.wnext = 0;
  this.window = null;
  this.hold = 0;
  this.bits = 0;
  this.length = 0;
  this.offset = 0;
  this.extra = 0;
  this.lencode = null;
  this.distcode = null;
  this.lenbits = 0;
  this.distbits = 0;
  this.ncode = 0;
  this.nlen = 0;
  this.ndist = 0;
  this.have = 0;
  this.next = null;
  this.lens = new Uint16Array(320);
  this.work = new Uint16Array(288);
  this.lendyn = null;
  this.distdyn = null;
  this.sane = 0;
  this.back = 0;
  this.was = 0;
}
var inflateResetKeep2 = (strm) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$12;
  }
  const state2 = strm.state;
  strm.total_in = strm.total_out = state2.total = 0;
  strm.msg = "";
  if (state2.wrap) {
    strm.adler = state2.wrap & 1;
  }
  state2.mode = HEAD2;
  state2.last = 0;
  state2.havedict = 0;
  state2.dmax = 32768;
  state2.head = null;
  state2.hold = 0;
  state2.bits = 0;
  state2.lencode = state2.lendyn = new Int32Array(ENOUGH_LENS2);
  state2.distcode = state2.distdyn = new Int32Array(ENOUGH_DISTS2);
  state2.sane = 1;
  state2.back = -1;
  return Z_OK$12;
};
var inflateReset3 = (strm) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$12;
  }
  const state2 = strm.state;
  state2.wsize = 0;
  state2.whave = 0;
  state2.wnext = 0;
  return inflateResetKeep2(strm);
};
var inflateReset22 = (strm, windowBits) => {
  let wrap;
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$12;
  }
  const state2 = strm.state;
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  } else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR$12;
  }
  if (state2.window !== null && state2.wbits !== windowBits) {
    state2.window = null;
  }
  state2.wrap = wrap;
  state2.wbits = windowBits;
  return inflateReset3(strm);
};
var inflateInit22 = (strm, windowBits) => {
  if (!strm) {
    return Z_STREAM_ERROR$12;
  }
  const state2 = new InflateState2();
  strm.state = state2;
  state2.window = null;
  const ret = inflateReset22(strm, windowBits);
  if (ret !== Z_OK$12) {
    strm.state = null;
  }
  return ret;
};
var inflateInit3 = (strm) => {
  return inflateInit22(strm, DEF_WBITS2);
};
var virgin2 = true;
var lenfix2;
var distfix2;
var fixedtables2 = (state2) => {
  if (virgin2) {
    lenfix2 = new Int32Array(512);
    distfix2 = new Int32Array(32);
    let sym = 0;
    while (sym < 144) {
      state2.lens[sym++] = 8;
    }
    while (sym < 256) {
      state2.lens[sym++] = 9;
    }
    while (sym < 280) {
      state2.lens[sym++] = 7;
    }
    while (sym < 288) {
      state2.lens[sym++] = 8;
    }
    inftrees2(LENS2, state2.lens, 0, 288, lenfix2, 0, state2.work, { bits: 9 });
    sym = 0;
    while (sym < 32) {
      state2.lens[sym++] = 5;
    }
    inftrees2(DISTS2, state2.lens, 0, 32, distfix2, 0, state2.work, { bits: 5 });
    virgin2 = false;
  }
  state2.lencode = lenfix2;
  state2.lenbits = 9;
  state2.distcode = distfix2;
  state2.distbits = 5;
};
var updatewindow2 = (strm, src, end, copy) => {
  let dist;
  const state2 = strm.state;
  if (state2.window === null) {
    state2.wsize = 1 << state2.wbits;
    state2.wnext = 0;
    state2.whave = 0;
    state2.window = new Uint8Array(state2.wsize);
  }
  if (copy >= state2.wsize) {
    state2.window.set(src.subarray(end - state2.wsize, end), 0);
    state2.wnext = 0;
    state2.whave = state2.wsize;
  } else {
    dist = state2.wsize - state2.wnext;
    if (dist > copy) {
      dist = copy;
    }
    state2.window.set(src.subarray(end - copy, end - copy + dist), state2.wnext);
    copy -= dist;
    if (copy) {
      state2.window.set(src.subarray(end - copy, end), 0);
      state2.wnext = copy;
      state2.whave = state2.wsize;
    } else {
      state2.wnext += dist;
      if (state2.wnext === state2.wsize) {
        state2.wnext = 0;
      }
      if (state2.whave < state2.wsize) {
        state2.whave += dist;
      }
    }
  }
  return 0;
};
var inflate$22 = (strm, flush) => {
  let state2;
  let input, output;
  let next;
  let put;
  let have, left;
  let hold;
  let bits;
  let _in, _out;
  let copy;
  let from;
  let from_source;
  let here = 0;
  let here_bits, here_op, here_val;
  let last_bits, last_op, last_val;
  let len;
  let ret;
  const hbuf = new Uint8Array(4);
  let opts;
  let n;
  const order = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) {
    return Z_STREAM_ERROR$12;
  }
  state2 = strm.state;
  if (state2.mode === TYPE2) {
    state2.mode = TYPEDO2;
  }
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state2.hold;
  bits = state2.bits;
  _in = have;
  _out = left;
  ret = Z_OK$12;
  inf_leave:
    for (; ; ) {
      switch (state2.mode) {
        case HEAD2:
          if (state2.wrap === 0) {
            state2.mode = TYPEDO2;
            break;
          }
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state2.wrap & 2 && hold === 35615) {
            state2.check = 0;
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state2.check = crc32_12(state2.check, hbuf, 2, 0);
            hold = 0;
            bits = 0;
            state2.mode = FLAGS2;
            break;
          }
          state2.flags = 0;
          if (state2.head) {
            state2.head.done = false;
          }
          if (!(state2.wrap & 1) || (((hold & 255) << 8) + (hold >> 8)) % 31) {
            strm.msg = "incorrect header check";
            state2.mode = BAD2;
            break;
          }
          if ((hold & 15) !== Z_DEFLATED2) {
            strm.msg = "unknown compression method";
            state2.mode = BAD2;
            break;
          }
          hold >>>= 4;
          bits -= 4;
          len = (hold & 15) + 8;
          if (state2.wbits === 0) {
            state2.wbits = len;
          } else if (len > state2.wbits) {
            strm.msg = "invalid window size";
            state2.mode = BAD2;
            break;
          }
          state2.dmax = 1 << state2.wbits;
          strm.adler = state2.check = 1;
          state2.mode = hold & 512 ? DICTID2 : TYPE2;
          hold = 0;
          bits = 0;
          break;
        case FLAGS2:
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state2.flags = hold;
          if ((state2.flags & 255) !== Z_DEFLATED2) {
            strm.msg = "unknown compression method";
            state2.mode = BAD2;
            break;
          }
          if (state2.flags & 57344) {
            strm.msg = "unknown header flags set";
            state2.mode = BAD2;
            break;
          }
          if (state2.head) {
            state2.head.text = hold >> 8 & 1;
          }
          if (state2.flags & 512) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state2.check = crc32_12(state2.check, hbuf, 2, 0);
          }
          hold = 0;
          bits = 0;
          state2.mode = TIME2;
        case TIME2:
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state2.head) {
            state2.head.time = hold;
          }
          if (state2.flags & 512) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            hbuf[2] = hold >>> 16 & 255;
            hbuf[3] = hold >>> 24 & 255;
            state2.check = crc32_12(state2.check, hbuf, 4, 0);
          }
          hold = 0;
          bits = 0;
          state2.mode = OS2;
        case OS2:
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state2.head) {
            state2.head.xflags = hold & 255;
            state2.head.os = hold >> 8;
          }
          if (state2.flags & 512) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state2.check = crc32_12(state2.check, hbuf, 2, 0);
          }
          hold = 0;
          bits = 0;
          state2.mode = EXLEN2;
        case EXLEN2:
          if (state2.flags & 1024) {
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state2.length = hold;
            if (state2.head) {
              state2.head.extra_len = hold;
            }
            if (state2.flags & 512) {
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              state2.check = crc32_12(state2.check, hbuf, 2, 0);
            }
            hold = 0;
            bits = 0;
          } else if (state2.head) {
            state2.head.extra = null;
          }
          state2.mode = EXTRA2;
        case EXTRA2:
          if (state2.flags & 1024) {
            copy = state2.length;
            if (copy > have) {
              copy = have;
            }
            if (copy) {
              if (state2.head) {
                len = state2.head.extra_len - state2.length;
                if (!state2.head.extra) {
                  state2.head.extra = new Uint8Array(state2.head.extra_len);
                }
                state2.head.extra.set(input.subarray(next, next + copy), len);
              }
              if (state2.flags & 512) {
                state2.check = crc32_12(state2.check, input, copy, next);
              }
              have -= copy;
              next += copy;
              state2.length -= copy;
            }
            if (state2.length) {
              break inf_leave;
            }
          }
          state2.length = 0;
          state2.mode = NAME2;
        case NAME2:
          if (state2.flags & 2048) {
            if (have === 0) {
              break inf_leave;
            }
            copy = 0;
            do {
              len = input[next + copy++];
              if (state2.head && len && state2.length < 65536) {
                state2.head.name += String.fromCharCode(len);
              }
            } while (len && copy < have);
            if (state2.flags & 512) {
              state2.check = crc32_12(state2.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            if (len) {
              break inf_leave;
            }
          } else if (state2.head) {
            state2.head.name = null;
          }
          state2.length = 0;
          state2.mode = COMMENT2;
        case COMMENT2:
          if (state2.flags & 4096) {
            if (have === 0) {
              break inf_leave;
            }
            copy = 0;
            do {
              len = input[next + copy++];
              if (state2.head && len && state2.length < 65536) {
                state2.head.comment += String.fromCharCode(len);
              }
            } while (len && copy < have);
            if (state2.flags & 512) {
              state2.check = crc32_12(state2.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            if (len) {
              break inf_leave;
            }
          } else if (state2.head) {
            state2.head.comment = null;
          }
          state2.mode = HCRC2;
        case HCRC2:
          if (state2.flags & 512) {
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (hold !== (state2.check & 65535)) {
              strm.msg = "header crc mismatch";
              state2.mode = BAD2;
              break;
            }
            hold = 0;
            bits = 0;
          }
          if (state2.head) {
            state2.head.hcrc = state2.flags >> 9 & 1;
            state2.head.done = true;
          }
          strm.adler = state2.check = 0;
          state2.mode = TYPE2;
          break;
        case DICTID2:
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          strm.adler = state2.check = zswap322(hold);
          hold = 0;
          bits = 0;
          state2.mode = DICT2;
        case DICT2:
          if (state2.havedict === 0) {
            strm.next_out = put;
            strm.avail_out = left;
            strm.next_in = next;
            strm.avail_in = have;
            state2.hold = hold;
            state2.bits = bits;
            return Z_NEED_DICT$12;
          }
          strm.adler = state2.check = 1;
          state2.mode = TYPE2;
        case TYPE2:
          if (flush === Z_BLOCK2 || flush === Z_TREES2) {
            break inf_leave;
          }
        case TYPEDO2:
          if (state2.last) {
            hold >>>= bits & 7;
            bits -= bits & 7;
            state2.mode = CHECK2;
            break;
          }
          while (bits < 3) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state2.last = hold & 1;
          hold >>>= 1;
          bits -= 1;
          switch (hold & 3) {
            case 0:
              state2.mode = STORED2;
              break;
            case 1:
              fixedtables2(state2);
              state2.mode = LEN_2;
              if (flush === Z_TREES2) {
                hold >>>= 2;
                bits -= 2;
                break inf_leave;
              }
              break;
            case 2:
              state2.mode = TABLE2;
              break;
            case 3:
              strm.msg = "invalid block type";
              state2.mode = BAD2;
          }
          hold >>>= 2;
          bits -= 2;
          break;
        case STORED2:
          hold >>>= bits & 7;
          bits -= bits & 7;
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
            strm.msg = "invalid stored block lengths";
            state2.mode = BAD2;
            break;
          }
          state2.length = hold & 65535;
          hold = 0;
          bits = 0;
          state2.mode = COPY_2;
          if (flush === Z_TREES2) {
            break inf_leave;
          }
        case COPY_2:
          state2.mode = COPY2;
        case COPY2:
          copy = state2.length;
          if (copy) {
            if (copy > have) {
              copy = have;
            }
            if (copy > left) {
              copy = left;
            }
            if (copy === 0) {
              break inf_leave;
            }
            output.set(input.subarray(next, next + copy), put);
            have -= copy;
            next += copy;
            left -= copy;
            put += copy;
            state2.length -= copy;
            break;
          }
          state2.mode = TYPE2;
          break;
        case TABLE2:
          while (bits < 14) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state2.nlen = (hold & 31) + 257;
          hold >>>= 5;
          bits -= 5;
          state2.ndist = (hold & 31) + 1;
          hold >>>= 5;
          bits -= 5;
          state2.ncode = (hold & 15) + 4;
          hold >>>= 4;
          bits -= 4;
          if (state2.nlen > 286 || state2.ndist > 30) {
            strm.msg = "too many length or distance symbols";
            state2.mode = BAD2;
            break;
          }
          state2.have = 0;
          state2.mode = LENLENS2;
        case LENLENS2:
          while (state2.have < state2.ncode) {
            while (bits < 3) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state2.lens[order[state2.have++]] = hold & 7;
            hold >>>= 3;
            bits -= 3;
          }
          while (state2.have < 19) {
            state2.lens[order[state2.have++]] = 0;
          }
          state2.lencode = state2.lendyn;
          state2.lenbits = 7;
          opts = { bits: state2.lenbits };
          ret = inftrees2(CODES2, state2.lens, 0, 19, state2.lencode, 0, state2.work, opts);
          state2.lenbits = opts.bits;
          if (ret) {
            strm.msg = "invalid code lengths set";
            state2.mode = BAD2;
            break;
          }
          state2.have = 0;
          state2.mode = CODELENS2;
        case CODELENS2:
          while (state2.have < state2.nlen + state2.ndist) {
            for (; ; ) {
              here = state2.lencode[hold & (1 << state2.lenbits) - 1];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (here_val < 16) {
              hold >>>= here_bits;
              bits -= here_bits;
              state2.lens[state2.have++] = here_val;
            } else {
              if (here_val === 16) {
                n = here_bits + 2;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                if (state2.have === 0) {
                  strm.msg = "invalid bit length repeat";
                  state2.mode = BAD2;
                  break;
                }
                len = state2.lens[state2.have - 1];
                copy = 3 + (hold & 3);
                hold >>>= 2;
                bits -= 2;
              } else if (here_val === 17) {
                n = here_bits + 3;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                len = 0;
                copy = 3 + (hold & 7);
                hold >>>= 3;
                bits -= 3;
              } else {
                n = here_bits + 7;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                len = 0;
                copy = 11 + (hold & 127);
                hold >>>= 7;
                bits -= 7;
              }
              if (state2.have + copy > state2.nlen + state2.ndist) {
                strm.msg = "invalid bit length repeat";
                state2.mode = BAD2;
                break;
              }
              while (copy--) {
                state2.lens[state2.have++] = len;
              }
            }
          }
          if (state2.mode === BAD2) {
            break;
          }
          if (state2.lens[256] === 0) {
            strm.msg = "invalid code -- missing end-of-block";
            state2.mode = BAD2;
            break;
          }
          state2.lenbits = 9;
          opts = { bits: state2.lenbits };
          ret = inftrees2(LENS2, state2.lens, 0, state2.nlen, state2.lencode, 0, state2.work, opts);
          state2.lenbits = opts.bits;
          if (ret) {
            strm.msg = "invalid literal/lengths set";
            state2.mode = BAD2;
            break;
          }
          state2.distbits = 6;
          state2.distcode = state2.distdyn;
          opts = { bits: state2.distbits };
          ret = inftrees2(DISTS2, state2.lens, state2.nlen, state2.ndist, state2.distcode, 0, state2.work, opts);
          state2.distbits = opts.bits;
          if (ret) {
            strm.msg = "invalid distances set";
            state2.mode = BAD2;
            break;
          }
          state2.mode = LEN_2;
          if (flush === Z_TREES2) {
            break inf_leave;
          }
        case LEN_2:
          state2.mode = LEN2;
        case LEN2:
          if (have >= 6 && left >= 258) {
            strm.next_out = put;
            strm.avail_out = left;
            strm.next_in = next;
            strm.avail_in = have;
            state2.hold = hold;
            state2.bits = bits;
            inffast2(strm, _out);
            put = strm.next_out;
            output = strm.output;
            left = strm.avail_out;
            next = strm.next_in;
            input = strm.input;
            have = strm.avail_in;
            hold = state2.hold;
            bits = state2.bits;
            if (state2.mode === TYPE2) {
              state2.back = -1;
            }
            break;
          }
          state2.back = 0;
          for (; ; ) {
            here = state2.lencode[hold & (1 << state2.lenbits) - 1];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 255;
            here_val = here & 65535;
            if (here_bits <= bits) {
              break;
            }
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (here_op && (here_op & 240) === 0) {
            last_bits = here_bits;
            last_op = here_op;
            last_val = here_val;
            for (; ; ) {
              here = state2.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (last_bits + here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            hold >>>= last_bits;
            bits -= last_bits;
            state2.back += last_bits;
          }
          hold >>>= here_bits;
          bits -= here_bits;
          state2.back += here_bits;
          state2.length = here_val;
          if (here_op === 0) {
            state2.mode = LIT2;
            break;
          }
          if (here_op & 32) {
            state2.back = -1;
            state2.mode = TYPE2;
            break;
          }
          if (here_op & 64) {
            strm.msg = "invalid literal/length code";
            state2.mode = BAD2;
            break;
          }
          state2.extra = here_op & 15;
          state2.mode = LENEXT2;
        case LENEXT2:
          if (state2.extra) {
            n = state2.extra;
            while (bits < n) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state2.length += hold & (1 << state2.extra) - 1;
            hold >>>= state2.extra;
            bits -= state2.extra;
            state2.back += state2.extra;
          }
          state2.was = state2.length;
          state2.mode = DIST2;
        case DIST2:
          for (; ; ) {
            here = state2.distcode[hold & (1 << state2.distbits) - 1];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 255;
            here_val = here & 65535;
            if (here_bits <= bits) {
              break;
            }
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if ((here_op & 240) === 0) {
            last_bits = here_bits;
            last_op = here_op;
            last_val = here_val;
            for (; ; ) {
              here = state2.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (last_bits + here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            hold >>>= last_bits;
            bits -= last_bits;
            state2.back += last_bits;
          }
          hold >>>= here_bits;
          bits -= here_bits;
          state2.back += here_bits;
          if (here_op & 64) {
            strm.msg = "invalid distance code";
            state2.mode = BAD2;
            break;
          }
          state2.offset = here_val;
          state2.extra = here_op & 15;
          state2.mode = DISTEXT2;
        case DISTEXT2:
          if (state2.extra) {
            n = state2.extra;
            while (bits < n) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state2.offset += hold & (1 << state2.extra) - 1;
            hold >>>= state2.extra;
            bits -= state2.extra;
            state2.back += state2.extra;
          }
          if (state2.offset > state2.dmax) {
            strm.msg = "invalid distance too far back";
            state2.mode = BAD2;
            break;
          }
          state2.mode = MATCH2;
        case MATCH2:
          if (left === 0) {
            break inf_leave;
          }
          copy = _out - left;
          if (state2.offset > copy) {
            copy = state2.offset - copy;
            if (copy > state2.whave) {
              if (state2.sane) {
                strm.msg = "invalid distance too far back";
                state2.mode = BAD2;
                break;
              }
            }
            if (copy > state2.wnext) {
              copy -= state2.wnext;
              from = state2.wsize - copy;
            } else {
              from = state2.wnext - copy;
            }
            if (copy > state2.length) {
              copy = state2.length;
            }
            from_source = state2.window;
          } else {
            from_source = output;
            from = put - state2.offset;
            copy = state2.length;
          }
          if (copy > left) {
            copy = left;
          }
          left -= copy;
          state2.length -= copy;
          do {
            output[put++] = from_source[from++];
          } while (--copy);
          if (state2.length === 0) {
            state2.mode = LEN2;
          }
          break;
        case LIT2:
          if (left === 0) {
            break inf_leave;
          }
          output[put++] = state2.length;
          left--;
          state2.mode = LEN2;
          break;
        case CHECK2:
          if (state2.wrap) {
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold |= input[next++] << bits;
              bits += 8;
            }
            _out -= left;
            strm.total_out += _out;
            state2.total += _out;
            if (_out) {
              strm.adler = state2.check = state2.flags ? crc32_12(state2.check, output, _out, put - _out) : adler32_12(state2.check, output, _out, put - _out);
            }
            _out = left;
            if ((state2.flags ? hold : zswap322(hold)) !== state2.check) {
              strm.msg = "incorrect data check";
              state2.mode = BAD2;
              break;
            }
            hold = 0;
            bits = 0;
          }
          state2.mode = LENGTH2;
        case LENGTH2:
          if (state2.wrap && state2.flags) {
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (hold !== (state2.total & 4294967295)) {
              strm.msg = "incorrect length check";
              state2.mode = BAD2;
              break;
            }
            hold = 0;
            bits = 0;
          }
          state2.mode = DONE2;
        case DONE2:
          ret = Z_STREAM_END$12;
          break inf_leave;
        case BAD2:
          ret = Z_DATA_ERROR$12;
          break inf_leave;
        case MEM2:
          return Z_MEM_ERROR$12;
        case SYNC2:
        default:
          return Z_STREAM_ERROR$12;
      }
    }
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state2.hold = hold;
  state2.bits = bits;
  if (state2.wsize || _out !== strm.avail_out && state2.mode < BAD2 && (state2.mode < CHECK2 || flush !== Z_FINISH$12)) {
    if (updatewindow2(strm, strm.output, strm.next_out, _out - strm.avail_out))
      ;
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state2.total += _out;
  if (state2.wrap && _out) {
    strm.adler = state2.check = state2.flags ? crc32_12(state2.check, output, _out, strm.next_out - _out) : adler32_12(state2.check, output, _out, strm.next_out - _out);
  }
  strm.data_type = state2.bits + (state2.last ? 64 : 0) + (state2.mode === TYPE2 ? 128 : 0) + (state2.mode === LEN_2 || state2.mode === COPY_2 ? 256 : 0);
  if ((_in === 0 && _out === 0 || flush === Z_FINISH$12) && ret === Z_OK$12) {
    ret = Z_BUF_ERROR2;
  }
  return ret;
};
var inflateEnd2 = (strm) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$12;
  }
  let state2 = strm.state;
  if (state2.window) {
    state2.window = null;
  }
  strm.state = null;
  return Z_OK$12;
};
var inflateGetHeader2 = (strm, head) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$12;
  }
  const state2 = strm.state;
  if ((state2.wrap & 2) === 0) {
    return Z_STREAM_ERROR$12;
  }
  state2.head = head;
  head.done = false;
  return Z_OK$12;
};
var inflateSetDictionary2 = (strm, dictionary) => {
  const dictLength = dictionary.length;
  let state2;
  let dictid;
  let ret;
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$12;
  }
  state2 = strm.state;
  if (state2.wrap !== 0 && state2.mode !== DICT2) {
    return Z_STREAM_ERROR$12;
  }
  if (state2.mode === DICT2) {
    dictid = 1;
    dictid = adler32_12(dictid, dictionary, dictLength, 0);
    if (dictid !== state2.check) {
      return Z_DATA_ERROR$12;
    }
  }
  ret = updatewindow2(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state2.mode = MEM2;
    return Z_MEM_ERROR$12;
  }
  state2.havedict = 1;
  return Z_OK$12;
};
var inflateReset_12 = inflateReset3;
var inflateReset2_12 = inflateReset22;
var inflateResetKeep_12 = inflateResetKeep2;
var inflateInit_12 = inflateInit3;
var inflateInit2_12 = inflateInit22;
var inflate_2$12 = inflate$22;
var inflateEnd_12 = inflateEnd2;
var inflateGetHeader_12 = inflateGetHeader2;
var inflateSetDictionary_12 = inflateSetDictionary2;
var inflateInfo2 = "pako inflate (from Nodeca project)";
var inflate_1$22 = {
  inflateReset: inflateReset_12,
  inflateReset2: inflateReset2_12,
  inflateResetKeep: inflateResetKeep_12,
  inflateInit: inflateInit_12,
  inflateInit2: inflateInit2_12,
  inflate: inflate_2$12,
  inflateEnd: inflateEnd_12,
  inflateGetHeader: inflateGetHeader_12,
  inflateSetDictionary: inflateSetDictionary_12,
  inflateInfo: inflateInfo2
};
function GZheader2() {
  this.text = 0;
  this.time = 0;
  this.xflags = 0;
  this.os = 0;
  this.extra = null;
  this.extra_len = 0;
  this.name = "";
  this.comment = "";
  this.hcrc = 0;
  this.done = false;
}
var gzheader2 = GZheader2;
var toString2 = Object.prototype.toString;
var {
  Z_NO_FLUSH: Z_NO_FLUSH2,
  Z_FINISH: Z_FINISH2,
  Z_OK: Z_OK2,
  Z_STREAM_END: Z_STREAM_END2,
  Z_NEED_DICT: Z_NEED_DICT2,
  Z_STREAM_ERROR: Z_STREAM_ERROR2,
  Z_DATA_ERROR: Z_DATA_ERROR2,
  Z_MEM_ERROR: Z_MEM_ERROR2
} = constants$22;
function Inflate$12(options2) {
  this.options = common2.assign({
    chunkSize: 1024 * 64,
    windowBits: 15,
    to: ""
  }, options2 || {});
  const opt = this.options;
  if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) {
      opt.windowBits = -15;
    }
  }
  if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options2 && options2.windowBits)) {
    opt.windowBits += 32;
  }
  if (opt.windowBits > 15 && opt.windowBits < 48) {
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }
  this.err = 0;
  this.msg = "";
  this.ended = false;
  this.chunks = [];
  this.strm = new zstream2();
  this.strm.avail_out = 0;
  let status = inflate_1$22.inflateInit2(this.strm, opt.windowBits);
  if (status !== Z_OK2) {
    throw new Error(messages2[status]);
  }
  this.header = new gzheader2();
  inflate_1$22.inflateGetHeader(this.strm, this.header);
  if (opt.dictionary) {
    if (typeof opt.dictionary === "string") {
      opt.dictionary = strings2.string2buf(opt.dictionary);
    } else if (toString2.call(opt.dictionary) === "[object ArrayBuffer]") {
      opt.dictionary = new Uint8Array(opt.dictionary);
    }
    if (opt.raw) {
      status = inflate_1$22.inflateSetDictionary(this.strm, opt.dictionary);
      if (status !== Z_OK2) {
        throw new Error(messages2[status]);
      }
    }
  }
}
Inflate$12.prototype.push = function(data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  const dictionary = this.options.dictionary;
  let status, _flush_mode, last_avail_out;
  if (this.ended)
    return false;
  if (flush_mode === ~~flush_mode)
    _flush_mode = flush_mode;
  else
    _flush_mode = flush_mode === true ? Z_FINISH2 : Z_NO_FLUSH2;
  if (toString2.call(data) === "[object ArrayBuffer]") {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }
  strm.next_in = 0;
  strm.avail_in = strm.input.length;
  for (; ; ) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    status = inflate_1$22.inflate(strm, _flush_mode);
    if (status === Z_NEED_DICT2 && dictionary) {
      status = inflate_1$22.inflateSetDictionary(strm, dictionary);
      if (status === Z_OK2) {
        status = inflate_1$22.inflate(strm, _flush_mode);
      } else if (status === Z_DATA_ERROR2) {
        status = Z_NEED_DICT2;
      }
    }
    while (strm.avail_in > 0 && status === Z_STREAM_END2 && strm.state.wrap > 0 && data[strm.next_in] !== 0) {
      inflate_1$22.inflateReset(strm);
      status = inflate_1$22.inflate(strm, _flush_mode);
    }
    switch (status) {
      case Z_STREAM_ERROR2:
      case Z_DATA_ERROR2:
      case Z_NEED_DICT2:
      case Z_MEM_ERROR2:
        this.onEnd(status);
        this.ended = true;
        return false;
    }
    last_avail_out = strm.avail_out;
    if (strm.next_out) {
      if (strm.avail_out === 0 || status === Z_STREAM_END2) {
        if (this.options.to === "string") {
          let next_out_utf8 = strings2.utf8border(strm.output, strm.next_out);
          let tail = strm.next_out - next_out_utf8;
          let utf8str = strings2.buf2string(strm.output, next_out_utf8);
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail)
            strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);
          this.onData(utf8str);
        } else {
          this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
        }
      }
    }
    if (status === Z_OK2 && last_avail_out === 0)
      continue;
    if (status === Z_STREAM_END2) {
      status = inflate_1$22.inflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return true;
    }
    if (strm.avail_in === 0)
      break;
  }
  return true;
};
Inflate$12.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};
Inflate$12.prototype.onEnd = function(status) {
  if (status === Z_OK2) {
    if (this.options.to === "string") {
      this.result = this.chunks.join("");
    } else {
      this.result = common2.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};
function inflate$12(input, options2) {
  const inflator = new Inflate$12(options2);
  inflator.push(input);
  if (inflator.err)
    throw inflator.msg || messages2[inflator.err];
  return inflator.result;
}
function inflateRaw$12(input, options2) {
  options2 = options2 || {};
  options2.raw = true;
  return inflate$12(input, options2);
}
var Inflate_1$12 = Inflate$12;
var inflate_22 = inflate$12;
var inflateRaw_1$12 = inflateRaw$12;
var ungzip$12 = inflate$12;
var constants2 = constants$22;
var inflate_1$12 = {
  Inflate: Inflate_1$12,
  inflate: inflate_22,
  inflateRaw: inflateRaw_1$12,
  ungzip: ungzip$12,
  constants: constants2
};
var { Deflate: Deflate2, deflate: deflate2, deflateRaw: deflateRaw2, gzip: gzip2 } = deflate_1$12;
var { Inflate: Inflate2, inflate: inflate2, inflateRaw: inflateRaw2, ungzip: ungzip2 } = inflate_1$12;
var Deflate_12 = Deflate2;
var deflate_12 = deflate2;
var deflateRaw_12 = deflateRaw2;
var gzip_12 = gzip2;
var Inflate_12 = Inflate2;
var inflate_12 = inflate2;
var inflateRaw_12 = inflateRaw2;
var ungzip_12 = ungzip2;
var constants_12 = constants$22;
var pako2 = {
  Deflate: Deflate_12,
  deflate: deflate_12,
  deflateRaw: deflateRaw_12,
  gzip: gzip_12,
  Inflate: Inflate_12,
  inflate: inflate_12,
  inflateRaw: inflateRaw_12,
  ungzip: ungzip_12,
  constants: constants_12
};
var decode8 = (o) => {
  return new Promise((resolve3, reject) => {
    try {
      o.buffer = pako2.inflate(o.buffer).buffer;
      resolve3(o);
    } catch (e) {
      console.error(e);
      return reject(false);
    }
  });
};
var encode9 = (o) => pako2.deflate(o);
var type7 = "application/x-gzip";
var suffixes7 = "gz";
var text_exports2 = {};
__export4(text_exports2, {
  decode: () => decode22,
  encode: () => encode22,
  suffixes: () => suffixes22,
  type: () => type22
});
var type22 = "text/plain";
var suffixes22 = "txt";
var encode22 = (o) => new TextEncoder().encode(o ? o.toString() : "");
var decode22 = (o) => new TextDecoder().decode(o.buffer);
var decode32 = async (o, type72, name22, config2, defaultCodec = text_exports2, codecs) => {
  const { mimeType, zipped: zipped22 } = get5(type72, name22, codecs);
  if (zipped22)
    o = await decode8(o);
  if (mimeType && (mimeType.includes("image/") || mimeType.includes("video/")))
    return o.dataurl;
  const codec = codecs ? codecs.get(mimeType) : null;
  if (codec && codec.decode instanceof Function)
    return codec.decode(o, config2);
  else {
    console.warn(`No decoder for ${mimeType}. Defaulting to ${defaultCodec.type}...`);
    return defaultCodec.decode(o, config2);
  }
};
var decode_default2 = decode32;
var encode32 = (o) => {
  var byteString = atob(o.split(",")[1]);
  const ab = new ArrayBuffer(byteString.length);
  var iab = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    iab[i] = byteString.charCodeAt(i);
  }
  return iab;
};
var encode42 = async (o, type72, name22, config2, defaultCodec = text_exports2, codecs) => {
  let buffer = new ArrayBuffer(0);
  const { mimeType, zipped: zipped22 } = get5(type72, name22, codecs);
  if (mimeType && (mimeType.includes("image/") || mimeType.includes("video/")))
    return encode32(o);
  const codec = codecs ? codecs.get(mimeType) : null;
  if (codec && codec.encode instanceof Function)
    buffer = codec.encode(o, config2);
  else {
    console.warn(`No encoder for ${mimeType}. Defaulting to ${defaultCodec.type}...`);
    buffer = defaultCodec.encode(o, config2);
  }
  if (zipped22)
    buffer = await encode9(buffer);
  return buffer;
};
var encode_default2 = encode42;
var transferEach2 = async (f, system) => {
  const path = f.path;
  if (!f.storage.buffer)
    f.storage = await f.getFileData();
  const blob = new Blob([f.storage.buffer]);
  blob.name = f.name;
  await system.open(path, true);
  await f.sync();
};
var transfer2 = async (previousSystem, targetSystem, transferList) => {
  if (!transferList)
    transferList = Array.from(previousSystem.files.list.values());
  const notTransferred = transferList.filter((f) => f.method != "transferred");
  if (notTransferred.length > 0) {
    if (!targetSystem) {
      const SystemConstructor = previousSystem.constructor;
      targetSystem = new SystemConstructor(void 0, {
        native: previousSystem.native,
        debug: previousSystem.debug,
        ignore: previousSystem.ignore,
        writable: true,
        progress: previousSystem.progress,
        codecs: previousSystem.codecs
      });
      await targetSystem.init();
    }
    console.warn(`Starting transfer of ${notTransferred.length} files from ${previousSystem.name} to ${targetSystem.name}`, transferList);
    const tic = performance.now();
    await Promise.all(notTransferred.map(async (f) => transferEach2(f, targetSystem)));
    const toc = performance.now();
    console.warn(`Time to transfer files to ${targetSystem.name}: ${toc - tic}ms`);
    targetSystem.writable = false;
    await previousSystem.apply(targetSystem);
    await Promise.all(notTransferred.map(async (f) => f.save(true)));
  }
};
var transfer_default2 = transfer2;
function isClass2(obj = {}) {
  const isCtorClass = obj.constructor && obj.constructor.toString().substring(0, 5) === "class";
  if (obj.prototype === void 0) {
    return isCtorClass;
  }
  const isPrototypeCtorClass = obj.prototype.constructor && obj.prototype.constructor.toString && obj.prototype.constructor.toString().substring(0, 5) === "class";
  return isCtorClass || isPrototypeCtorClass;
}
var get23 = (path, rel = "") => {
  if (rel[rel.length - 1] === "/")
    rel = rel.slice(0, -1);
  let dirTokens = rel.split("/");
  if (dirTokens.length === 1 && dirTokens[0] === "")
    dirTokens = [];
  const potentialFile = dirTokens.pop();
  if (potentialFile) {
    const splitPath = potentialFile.split(".");
    if (splitPath.length == 1 || splitPath.length > 1 && splitPath.includes(""))
      dirTokens.push(potentialFile);
  }
  const pathTokens = path.split("/").filter((str) => !!str);
  const extensionTokens = pathTokens.filter((str) => {
    if (str === "..") {
      if (dirTokens.length == 0)
        console.error("Derived path is going out of the valid filesystem!");
      dirTokens.pop();
      return false;
    } else if (str === ".")
      return false;
    else
      return true;
  });
  const newPath = [...dirTokens, ...extensionTokens].join("/");
  return newPath;
};
var networkErrorMessages2 = ["Failed to fetch", "NetworkError when attempting to fetch resource.", "Network request failed"];
var isNetworkErrorMessage2 = (msg) => networkErrorMessages2.includes(msg);
var isNetworkError2 = (error) => error.name === "TypeError" && isNetworkErrorMessage2(error.message);
var getURL3 = (path) => {
  let url;
  try {
    url = new URL(path).href;
  } catch {
    url = get23(path, globalThis.location.href);
  }
  return url;
};
var handleFetch3 = async (path, options2 = {}, progressCallback) => {
  if (!options2.mode)
    options2.mode = "cors";
  const url = getURL3(path);
  const response = await fetchRemote3(url, options2, progressCallback);
  if (!response)
    throw new Error("No response received.");
  const type72 = response.type.split(";")[0];
  return {
    url,
    type: type72,
    buffer: response.buffer
  };
};
var fetchRemote3 = async (url, options2 = {}, progressCallback) => {
  options2.timeout = 3e3;
  const response = await fetchWithTimeout2(url, options2);
  return new Promise(async (resolve3) => {
    if (response) {
      const type72 = response.headers.get("Content-Type");
      if (globalThis.FREERANGE_NODE) {
        const buffer = await response.arrayBuffer();
        resolve3({ buffer, type: type72 });
      } else {
        const reader = response.body.getReader();
        const bytes = parseInt(response.headers.get("Content-Length"), 10);
        let bytesReceived = 0;
        let buffer = [];
        const processBuffer = async ({ done, value }) => {
          if (done) {
            const config2 = {};
            if (typeof type72 === "string")
              config2.type = type72;
            const blob = new Blob(buffer, config2);
            const ab = await blob.arrayBuffer();
            resolve3({ buffer: new Uint8Array(ab), type: type72 });
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
      console.warn("Response not received!", options2.headers);
      resolve3(void 0);
    }
  });
};
async function fetchWithTimeout2(resource, options2 = {}) {
  const { timeout = 8e3 } = options2;
  const controller = new AbortController();
  const id = setTimeout(() => {
    console.warn(`Request to ${resource} took longer than ${(timeout / 1e3).toFixed(2)}s`);
    controller.abort();
    throw new Error(`Request timeout`);
  }, timeout);
  const response = await globalThis.fetch(resource, {
    ...options2,
    signal: controller.signal
  }).catch((e) => {
    clearTimeout(id);
    const networkError = isNetworkError2(e);
    if (networkError) {
      throw new Error("No internet.");
    } else
      throw e;
  });
  clearTimeout(id);
  if (!response.ok) {
    if (response.status === 404)
      throw new Error(`Resource not found.`);
    else
      throw response;
  }
  return response;
}
var iterAsync2 = async (iterable, asyncCallback) => {
  const promises = [];
  let i = 0;
  for await (const entry of iterable) {
    promises.push(asyncCallback(entry, i));
    i++;
  }
  const arr = await Promise.all(promises);
  return arr;
};
var iterate_default2 = iterAsync2;
var useRawArrayBuffer2 = ["nii", "nwb"];
var RangeFile2 = class {
  constructor(file, options2) {
    this.rangeConfig = null;
    this.rangeSupported = false;
    this.createFile = async (buffer, oldFile = this.file, create3 = false) => {
      let newFile = new Blob([buffer], oldFile);
      newFile.lastModified = oldFile.lastModified;
      newFile.name = oldFile.name;
      newFile.webkitRelativePath = oldFile.webkitRelativePath || get23(this.path || this.name, this.system.root);
      if (create3 && !this.fileSystemHandle) {
        console.warn(`Native file handle for ${this.path} does not exist. Choosing a filesystem to mount...`);
        await transfer_default2(this.system);
        return;
      }
      return newFile;
    };
    this.loadFileInfo = (file2 = this.file) => {
      if (file2) {
        this.name = file2.name;
        this.type = file2.type;
        const { mimeType, zipped: zipped22, suffix: suffix22 } = get5(file2.type, file2.name, this.system.codecs);
        this.mimeType = mimeType;
        this.zipped = zipped22;
        this.suffix = suffix22;
      } else
        console.warn("Valid file object not provided...");
    };
    this.init = async (file2 = this.file) => {
      if (!file2 && this.fileSystemHandle) {
        file2 = await this.fileSystemHandle.getFile();
        this.loadFileInfo(file2);
      }
      const loader = this.system.codecs.get(this.mimeType);
      const rangeConfig = loader?.config;
      if (rangeConfig)
        this.rangeConfig = rangeConfig;
      else {
        if (!loader)
          console.warn(`Cannot find a configuration file for ${this.path}. Please provide the correct codec.`);
      }
      this.rangeSupported = !!this.rangeConfig;
      let converted = false;
      if (this.method != "remote") {
        this.storage = await this.getFileData(file2).catch(this.onError);
        if (!converted) {
          if (this.storage?.buffer)
            this.file = await this.createFile(this.storage.buffer);
          else if (this.debug)
            console.warn(`No buffer created for ${this.path}...`);
        }
      }
      await this.setupByteGetters();
    };
    this.setOriginal = async (reference = "body") => {
      if (this.rangeSupported) {
        this[`#original${reference}`] = null;
        if (this.debug)
          console.warn("Will not stringify bodies that support range requests.");
      } else if (isClass2(this[`#${reference}`])) {
        this[`#original${reference}`] = null;
        if (this.debug)
          console.warn("Will not deep clone file bodies that are class instances");
      } else {
        try {
          const tic = performance.now();
          const value = await this[`#${reference}`];
          if (typeof this[`#${reference}`] === "object")
            this[`#original${reference}`] = JSON.parse(JSON.stringify(value));
          else
            this[`#original${reference}`] = value;
          const toc = performance.now();
          if (this.debug)
            console.warn(`Time to Deep Clone (${this.path}): ${toc - tic}ms`);
        } catch (e) {
          this[`#original${reference}`] = null;
          if (this.debug)
            console.warn("Could not deep clone", e);
        }
      }
    };
    this.get = async (ref2 = "body", codec) => {
      try {
        if (!this[`#${ref2}`]) {
          const ticDecode = performance.now();
          const storageExists = this.storage.buffer;
          if (!storageExists && !this.rangeSupported)
            this.storage = await this.getFileData();
          this[`#${ref2}`] = codec ? await codec.decode(this.storage, this.config) : await this.system.codecs.decode(this.storage, this.mimeType, this.file.name, this.config).catch(this.onError);
          const tocDecode = performance.now();
          if (this.debug)
            console.warn(`Time to Decode (${this.path}): ${tocDecode - ticDecode}ms`);
        }
        if (this[`#original${ref2}`] === void 0)
          await this.setOriginal(ref2);
        return this[`#${ref2}`];
      } catch (e) {
        const msg = `Decoder failed for ${this.path} - ${this.mimeType || "No file type recognized"}`;
        if (this.debug)
          console.warn(msg, e);
        return {};
      }
    };
    this.set = (val, ref2 = "body") => this[`#${ref2}`] = val;
    this.reencode = async (ref2 = "body", codec) => {
      try {
        const value = await this[`${ref2}`];
        const modifiedString = JSON.stringify(value);
        const ogString = JSON.stringify(this[`#original${ref2}`]);
        const different = modifiedString !== ogString;
        if (different) {
          if (this.debug)
            console.warn(`Synching file contents with buffer (${this.path})`, different ? `${ogString} > ${modifiedString}` : modifiedString);
          const toEncode = value ?? "";
          try {
            const ticEncode = performance.now();
            const buffer = codec ? await codec.encode(toEncode, this.config) : await this.system.codecs.encode(toEncode, this.mimeType, this.file.name, this.config);
            const tocEncode = performance.now();
            if (this.debug)
              console.warn(`Time to Encode (${this.path}): ${tocEncode - ticEncode}ms`);
            return buffer;
          } catch (e) {
            console.error("Could not encode as a buffer", toEncode, this.mimeType, this.zipped, codec);
            this.onError(e);
          }
        }
      } catch (e) {
        console.warn(e, this[`#${ref2}`], this[`#original${ref2}`]);
      }
    };
    this.sync = async (force = !(this.file instanceof Blob), create3 = void 0) => {
      if (this.rangeSupported) {
        if (this.debug)
          console.warn(`Write access is disabled for RangeFile with range-gettable properties (${this.path})`);
        return true;
      } else {
        const bodyEncoded = await this.reencode();
        const textEncoded = await this.reencode("text", text_exports2);
        const toSave = bodyEncoded ?? textEncoded;
        if (force || toSave) {
          if (toSave)
            this.storage.buffer = toSave;
          const newFile = await this.createFile(this.storage.buffer, this.file, create3);
          if (newFile)
            this.file = newFile;
          else {
            if (this.debug)
              console.warn(`New file not created for ${this.path}`);
            return;
          }
          if (toSave) {
            if (textEncoded)
              this["#body"] = null;
            if (bodyEncoded)
              this["#text"] = null;
          } else {
            await this.setOriginal();
            await this.setOriginal("text");
          }
          return this.file;
        } else
          return true;
      }
    };
    this.save = async (force = !!this.remote) => {
      const file2 = await this.sync(force, true);
      if (file2 instanceof Blob) {
        const writable = await this.fileSystemHandle.createWritable();
        const stream = file2.stream();
        const tic = performance.now();
        await stream.pipeTo(writable);
        const toc = performance.now();
        if (this.debug)
          console.warn(`Time to stream into file (${this.path}): ${toc - tic}ms`);
      }
      const dependents = this.system.dependents[this.path];
      if (dependents)
        await iterate_default2(dependents.values(), async (f) => f["#body"] = null);
    };
    this.onError = (e) => {
      console.error(e);
    };
    this.getFromBytes = async (key, property = this.rangeConfig.properties[key], parent, i) => {
      if (property) {
        let start2 = await this.getProperty(property.start, parent, i);
        const length = await this.getProperty(property.length, parent, i);
        let bytes = new ArrayBuffer(0);
        if (this.method === "remote") {
          bytes = await this.getRemote({ start: start2, length });
        } else {
          let tempBytes = [];
          if (!Array.isArray(start2))
            start2 = [start2];
          start2.forEach((i2) => tempBytes.push(this.storage.buffer.slice(i2, i2 + length)));
          const totalLen = tempBytes.reduce((a, b) => a + b.length, 0);
          const tic2 = performance.now();
          let offset = 0;
          let uBytes = new Uint8Array(totalLen);
          tempBytes.forEach((arr) => {
            uBytes.set(arr, offset);
            offset += arr.length;
          });
          bytes = uBytes;
          const toc2 = performance.now();
          if (this.debug && start2.length > 1)
            console.warn(`Time to merge arrays (${this.path}): ${toc2 - tic2}ms`);
        }
        const tic = performance.now();
        let output = property.ignoreGlobalPostprocess ? bytes : this.rangeConfig.preprocess(bytes);
        if (property.postprocess instanceof Function)
          output = await property.postprocess(output, this["#body"], i);
        const toc = performance.now();
        if (this.debug)
          console.warn(`Time to postprocess bytes (${this.path}, ${key}, ${start2}-${start2 + length}): ${toc - tic}ms`);
        return output;
      } else {
        if (this.debug)
          console.warn(`No getter for ${key}`);
      }
    };
    this.getProperty = async (property, parent, i = void 0) => {
      if (property instanceof Function) {
        try {
          return property(this["#body"], parent, i).catch((e) => console.error(e));
        } catch {
          return property(this["#body"], parent, i);
        }
      } else
        return property;
    };
    this.defineProperty = async (key, property, parent, i = void 0) => {
      if ("start" in property && property.length) {
        Object.defineProperties(parent, {
          [key]: {
            enumerable: true,
            get: () => {
              if (!parent[`#${key}`])
                parent[`#${key}`] = this.getFromBytes(key, property, parent, i);
              return parent[`#${key}`];
            }
          },
          [`#${key}`]: {
            writable: true,
            enumerable: false
          }
        });
      } else if (property.n && property.properties) {
        this["#body"][key] = [];
        const n = await this.getProperty(property.n, property);
        for (let i2 = 0; i2 < n; i2++) {
          const value = {};
          Object.defineProperty(value, "n", { get: () => n });
          for (let prop in property.properties) {
            await this.defineProperty(prop, property.properties[prop], value, i2);
          }
          this["#body"][key].push(value);
        }
      }
    };
    this.setupByteGetters = async () => {
      if (!("body" in this)) {
        Object.defineProperties(this, {
          ["body"]: {
            enumerable: true,
            get: async () => this.get(),
            set: (val) => this.set(val)
          },
          [`#body`]: {
            writable: true,
            enumerable: false
          }
        });
      }
      if (!("text" in this)) {
        Object.defineProperties(this, {
          ["text"]: {
            enumerable: true,
            get: async () => this.get("text", text_exports2),
            set: (val) => this.set(val, "text")
          },
          [`#text`]: {
            writable: true,
            enumerable: false
          }
        });
      }
      this["#body"] = "";
      this["#text"] = "";
      if (this.rangeSupported) {
        this[`#body`] = {};
        for (let key in this.rangeConfig.properties)
          await this.defineProperty(key, this.rangeConfig.properties[key], this["#body"]);
        if (this.rangeConfig.metadata instanceof Function)
          await this.rangeConfig.metadata(this["#body"], this.rangeConfig);
      }
    };
    this.apply = async (newFile, applyData = true) => {
      if (!this.fileSystemHandle) {
        this.fileSystemHandle = newFile.fileSystemHandle;
        this.method = "transferred";
      }
      if (applyData)
        await this.init(newFile.file);
      this["#body"] = null;
      this["#text"] = null;
    };
    this.getRemote = async (property = {}) => {
      let { start: start2, length } = property;
      const options3 = Object.assign({}, this.remoteOptions);
      if (!Array.isArray(start2))
        start2 = [start2];
      if (start2.length < 1)
        return new Uint8Array();
      else {
        const isDefined = start2[0] != void 0;
        if (isDefined) {
          let Range = `bytes=${start2.map((val) => `${length ? `${val}-${val + length - 1}` : val}`).join(", ")}`;
          const maxHeaderLength = 15e3;
          if (Range.length > maxHeaderLength) {
            const splitRange = Range.slice(0, maxHeaderLength).split(", ");
            console.warn(`Only sending ${splitRange.length - 1} from ${start2.length} range requests to remain under the --max-http-header-size=${1600} limit`);
            Range = splitRange.slice(0, splitRange.length - 1).join(", ");
          }
          options3.headers = Object.assign({ Range }, options3.headers);
        }
        const o = await fetchRemote3(get23(this.remote.path, this.remote.origin), options3);
        return o.buffer;
      }
    };
    this.getFileData = (file2 = this.file) => {
      return new Promise(async (resolve3, reject) => {
        if (this.method === "remote") {
          const buffer = await this.getRemote();
          this.file = file2 = await this.createFile(buffer);
          resolve3({ file: file2, buffer });
        } else {
          this.file = file2;
          let method2 = "buffer";
          if (file2.type && (file2.type.includes("image/") || file2.type.includes("video/")))
            method2 = "dataurl";
          if (globalThis.FREERANGE_NODE) {
            const methods = {
              "dataurl": "dataURL",
              "buffer": "arrayBuffer"
            };
            const data = await file2[methods[method2]]();
            resolve3({ file: file2, [method2]: this.handleData(data) });
          } else {
            const methods = {
              "dataurl": "readAsDataURL",
              "buffer": "readAsArrayBuffer"
            };
            const reader = new FileReader();
            reader.onloadend = (e) => {
              if (e.target.readyState == FileReader.DONE) {
                if (!e.target.result)
                  return reject(`No result returned using the ${method2} method on ${this.file.name}`);
                let data = e.target.result;
                resolve3({ file: file2, [method2]: this.handleData(data) });
              } else if (e.target.readyState == FileReader.EMPTY) {
                if (this.debug)
                  console.warn(`${this.file.name} is empty`);
                resolve3({ file: file2, [method2]: new Uint8Array() });
              }
            };
            reader[methods[method2]](file2);
          }
        }
      });
    };
    this.handleData = (data) => {
      if ((data["byteLength"] ?? data["length"]) === 0) {
        if (this.debug)
          console.warn(`${this.file.name} appears to be empty`);
        return new Uint8Array();
      } else if (data instanceof ArrayBuffer && !useRawArrayBuffer2.includes(this.suffix))
        return new Uint8Array(data);
      else
        return data;
    };
    if (file.constructor.name === "FileSystemFileHandle")
      this.fileSystemHandle = file;
    else
      this.file = file;
    this.config = options2;
    this.debug = options2.debug;
    this.system = options2.system;
    this.path = options2.path;
    this.method = file.origin != void 0 && file.path != void 0 ? "remote" : "native";
    if (this.method === "remote") {
      this.remote = file;
      const split = file.path.split("/");
      file.name = split[split.length - 1];
      this.remoteOptions = file.options;
      this.type = null;
    }
    if (this.file)
      this.loadFileInfo(this.file);
    this.storage = {};
    this.rangeSupported = false;
    this[`#originalbody`] = void 0;
    this[`#originaltext`] = void 0;
  }
};
var codecs_exports2 = {};
__export4(codecs_exports2, {
  csv: () => csv_exports2,
  gzip: () => gzip_exports2,
  js: () => js_exports2,
  json: () => json_exports2,
  text: () => text_exports2,
  tsv: () => tsv_exports2
});
var json_exports2 = {};
__export4(json_exports2, {
  decode: () => decode42,
  encode: () => encode52,
  suffixes: () => suffixes32,
  type: () => type32
});
var type32 = "application/json";
var suffixes32 = "json";
var encode52 = (o) => encode22(JSON.stringify(o));
var decode42 = (o) => {
  const textContent = !o.text ? decode22(o) : o.text;
  return JSON.parse(textContent || `{}`);
};
var tsv_exports2 = {};
__export4(tsv_exports2, {
  decode: () => decode62,
  encode: () => encode72,
  suffixes: () => suffixes52,
  type: () => type52
});
var csv_exports2 = {};
__export4(csv_exports2, {
  decode: () => decode52,
  encode: () => encode62,
  suffixes: () => suffixes42,
  type: () => type42
});
var stripBOM2 = (str) => str.replace(/^\uFEFF/, "");
var normalizeEOL2 = (str) => str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
var isContentfulRow2 = (row) => row && !/^\s*$/.test(row);
var addBOM2 = (str) => `\uFEFF${str}`;
var suffixes42 = "csv";
var type42 = "text/csv";
var encode62 = (arr, separator) => {
  const rows = arr.length ? [Object.keys(arr[0]), ...arr.map((o) => Object.values(o))] : [];
  let content = rows.map((row) => row.join(separator)).join("\n");
  content = addBOM2(content);
  return new TextEncoder().encode(content);
};
var decode52 = (o, separator = ",") => {
  if (!o.text)
    o.text = new TextDecoder().decode(o.buffer);
  let contents = o.text;
  const collection = [];
  contents = stripBOM2(contents);
  const rows = normalizeEOL2(contents).split("\n").filter(isContentfulRow2).map((str) => str.split(separator));
  const headers = rows.length ? rows.splice(0, 1)[0] : [];
  rows.forEach((arr, i) => {
    let strObject = `{`;
    strObject += arr.map((val, j) => {
      try {
        const parsed = JSON.parse(val);
        return `"${headers[j]}":${parsed}`;
      } catch {
        return `"${headers[j]}":"${val}"`;
      }
    }).join(",");
    strObject += "}";
    collection.push(strObject);
  });
  return collection.map((v) => JSON.parse(v));
};
var type52 = "text/tab-separated-values";
var suffixes52 = "tsv";
var encode72 = (arr) => encode62(arr, "	");
var decode62 = (arr) => decode52(arr, "	");
var js_exports2 = {};
__export4(js_exports2, {
  decode: () => decode72,
  encode: () => encode82,
  suffixes: () => suffixes62,
  type: () => type62
});
var objToString = (obj) => {
  let ret = "{";
  for (let k in obj) {
    let v = obj[k];
    if (typeof v === "function") {
      v = v.toString();
    } else if (v instanceof Array) {
      v = JSON.stringify(v);
    } else if (typeof v === "object" && !!v) {
      v = objToString(v);
    } else if (typeof v === "string") {
      v = `"${v}"`;
    } else {
      v = `${v}`;
    }
    ret += `
  "${k}": ${v},`;
  }
  ret += "\n}";
  return ret;
};
var re3 = /import([ \n\t]*(?:\* (?:as .*))?(?:[^ \n\t\{\}]+[ \n\t]*,?)?(?:[ \n\t]*\{(?:[ \n\t]*[^ \n\t"'\{\}]+[ \n\t]*,?)+\})?[ \n\t]*)from[ \n\t]*(['"])([^'"\n]+)(?:['"])([ \n\t]*assert[ \n\t]*{type:[ \n\t]*(['"])([^'"\n]+)(?:['"])})?/g;
var esmImport = async (text) => {
  const moduleDataURI4 = "data:text/javascript;base64," + btoa(text);
  let imported = await import(moduleDataURI4);
  if (imported.default && Object.keys(imported).length === 1)
    imported = imported.default;
  return imported;
};
var safeESMImport = async (text, config2 = {}, onBlob) => {
  try {
    return await esmImport(text);
  } catch (e) {
    console.warn(`${config2.path} contains ES6 imports. Manually importing these modules...`);
    const base = get23("", config2.path);
    const needsRoot = config2.system.root && !config2.system.native;
    let childBase = needsRoot ? get23(base, config2.system.root) : base;
    const importInfo = {};
    let m;
    do {
      m = re3.exec(text);
      if (m == null)
        m = re3.exec(text);
      if (m) {
        text = text.replace(m[0], ``);
        const variables = m[1].trim().split(",");
        importInfo[m[3]] = variables;
      }
    } while (m);
    for (let path in importInfo) {
      let correctPath = get23(path, childBase);
      const variables = importInfo[path];
      let existingFile = config2.system.files.list.get(get23(correctPath));
      if (!existingFile?.file) {
        const info = await handleFetch3(correctPath);
        let blob = new Blob([info.buffer], { type: info.type });
        existingFile = await config2.system.load(blob, correctPath);
      }
      config2.system.trackDependency(correctPath, config2.path);
      let imported = await existingFile.body;
      if (variables.length > 1) {
        variables.forEach((str) => {
          text = `const ${str} = ${objToString(imported[str])}
${text}`;
        });
      } else {
        text = `const ${variables[0]} = ${objToString(imported)}
${text}`;
      }
    }
    const tryImport = await esmImport(text);
    return tryImport;
  }
};
var import_default = safeESMImport;
var type62 = "application/javascript";
var suffixes62 = "js";
var encode82 = () => void 0;
var decode72 = async (o, config2) => {
  const textContent = !o.text ? await decode22(o) : o.text;
  const imported = await import_default(textContent, config2);
  if (imported)
    return imported;
  else
    return textContent;
};
var Codecs2 = class {
  constructor(codecsInput) {
    this.suffixToType = {};
    this.collection = /* @__PURE__ */ new Map();
    this.add = (codec) => {
      this.collection.set(codec.type, codec);
      let suffixes72 = codec.suffixes ? codec.suffixes : codec.type.split("-").splice(-1)[0];
      if (!Array.isArray(suffixes72))
        suffixes72 = [suffixes72];
      suffixes72.forEach((suffix22) => this.suffixToType[suffix22] = codec.type);
    };
    this.get = (mimeType) => this.collection.get(mimeType);
    this.getType = (suffix22) => {
      let k = Object.keys(this.suffixToType).find((k2) => suffix22.slice(-k2.length) === k2);
      return this.suffixToType[k];
    };
    this.decode = (o, type72, name22, config2) => decode_default2(o, type72, name22, config2, void 0, this);
    this.encode = (o, type72, name22, config2) => encode_default2(o, type72, name22, config2, void 0, this);
    this.hasDependencies = (file) => {
      return file.mimeType === "application/javascript";
    };
    if (!Array.isArray(codecsInput))
      codecsInput = [codecsInput];
    codecsInput.forEach((codecs) => {
      if (codecs instanceof Codecs2)
        codecs.collection.forEach(this.add);
      else
        for (let key in codecs)
          this.add(codecs[key]);
    });
  }
};
var deepClone2 = (o = {}) => {
  return JSON.parse(JSON.stringify(o));
};
var clone_default2 = deepClone2;
var open2 = async (path, config2) => {
  config2 = Object.assign({}, config2);
  const useNative = !!config2.system?.native;
  let file = config2.system.files.list.get(path);
  if (file)
    return file;
  else {
    if (useNative && config2.system.openNative instanceof Function)
      file = await config2.system.openNative(path, config2);
    else
      file = await config2.system.openRemote(path, config2);
    if (file)
      return file;
  }
};
var open_default4 = open2;
var createFile3 = (file = {}, path, system) => {
  return Object.assign(file, {
    origin: system.root,
    path,
    options: {
      mode: "cors"
    }
  });
};
var load2 = async (file, config2) => {
  let { path, system, codecs, debug } = config2;
  if (!path)
    path = file.webkitRelativePath ?? file.relativePath ?? file.path ?? "";
  config2.path = path;
  let fileConfig = config2;
  if (!(file instanceof RangeFile2)) {
    if (system.native) {
      if (file.constructor.name !== "FileSystemFileHandle") {
        const openInfo = await open_default4(path, {
          path,
          system,
          create: config2.create,
          codecs,
          debug
        });
        if (openInfo && openInfo.constructor.name === "FileSystemDirectoryHandle") {
          file = openInfo;
        }
      }
    } else {
      if (fileConfig.system.root) {
        const directoryPath = new URL(fileConfig.system.root).pathname.split("/");
        const url = new URL(fileConfig.path);
        path = file.path = fileConfig.path = url.pathname.split("/").filter((str, i) => directoryPath?.[i] != str).join("/");
      } else
        path = file.path = fileConfig.path;
    }
    file = new RangeFile2(file, fileConfig);
    await file.init();
  }
  system.add(file);
  return file;
};
var createFile22 = (file = {}, path, system) => {
  if (system.native)
    return file;
  else
    return createFile3(file, path, system);
};
var saveEach2 = async (rangeFile, config2, counter, length) => {
  await rangeFile.save(config2.force);
  counter = counter + 1;
  if (config2.progressCallback instanceof Function)
    config2.progressCallback(config2.name, counter / length, length);
};
var save2 = (name22, files, force, progressCallback) => {
  let length = files;
  return new Promise(async (resolve3, reject) => {
    let i = 0;
    const firstFile = files.shift();
    await saveEach2(firstFile, { progressCallback, name: name22, force }, i, length);
    await iterate_default2(files, (f) => saveEach2(f, { progressCallback, name: name22, force }, i, length));
    resolve3();
  });
};
var save_default2 = save2;
var openRemote2 = async (path, config2) => {
  let {
    system
  } = config2;
  return await handleFetch3(path).then(async (info) => {
    const splitURL = info.url.split("/");
    const fileName = splitURL.pop();
    let blob = new Blob([info.buffer], { type: info.type });
    blob.name = fileName;
    const file = createFile3(blob, info.url, system);
    const rangeFile = await system.load(file, info.url);
    return rangeFile;
  });
};
var open_default22 = openRemote2;
var mountRemote2 = async (url, config2) => {
  let filePath;
  await handleFetch3(url, void 0, config2.progress).then(async (response) => {
    if (response.type === "application/json") {
      config2.system.name = config2.system.root = filePath = response.url;
      const datasets = JSON.parse(new TextDecoder().decode(response.buffer));
      let files = [];
      const drill = (o) => {
        for (let key in o) {
          const target = o[key];
          if (typeof target === "string") {
            const path = `${response.url}/${target}`;
            const file = createFile3(void 0, path, config2.system);
            files.push({ file, path });
          } else
            drill(target);
        }
      };
      drill(datasets);
      let filesIterable = files.entries();
      await iterate_default2(filesIterable, async ([i, { file, path }]) => await config2.system.load(file, path));
    } else
      throw "Endpoint is not a freerange filesystem!";
  }).catch((e) => {
    throw "Unable to connect to freerange filesystem!";
  });
  return filePath;
};
var mount_default3 = mountRemote2;
var isURL2 = (path) => {
  try {
    const url = new URL(path);
    return true;
  } catch {
    return false;
  }
};
var System2 = class {
  constructor(name22, systemInfo = {}) {
    this.dependencies = {};
    this.dependents = {};
    this.changelog = [];
    this.files = {};
    this.ignore = [];
    this.groups = {};
    this.groupConditions = /* @__PURE__ */ new Set();
    this.init = async () => {
      let mountConfig = {
        system: this,
        progress: this.progress
      };
      if (this.isNative(this.name)) {
        const native = await this.mountNative(this.name, mountConfig);
        if (!native)
          console.error("Unable to mount native filesystem!");
        else {
          if (this.oninit instanceof Function)
            this.oninit(native);
        }
      } else {
        const path = this.name;
        const isURL22 = isURL2(path);
        const fileName = name3(path);
        const suffix22 = suffix3(path);
        if (isURL22) {
          if (fileName && suffix22) {
            const path2 = this.name;
            this.root = directory2(path2);
            const file = await this.open(fileName);
            await file.body;
          } else {
            await this.mountRemote(this.name, mountConfig).catch((e) => console.warn("System initialization failed.", e));
          }
        } else if (this.name)
          this.root = "";
        if (this.oninit instanceof Function)
          this.oninit(this.name);
      }
    };
    this.addGroup = (name23, initial, condition) => {
      this.files[name23] = initial;
      this.groups[name23] = this.cloneGroup({ initial, condition });
      this.groupConditions.add(condition);
    };
    this.cloneGroup = (o) => {
      let newO = { condition: o.condition };
      if (o.initial instanceof Map)
        newO.initial = new Map(o.initial);
      else
        newO.initial = clone_default2(o.initial);
      return newO;
    };
    this.subsystem = async (path) => {
      const split = path.split("/");
      const name23 = split[split.length - 1];
      const subDir = split.shift();
      path = split.join("/");
      let target = this.files.system[subDir];
      split.forEach((str) => target = target[str]);
      const systemConstructor = this.constructor;
      const system = new systemConstructor(name23, {
        native: this.native,
        debug: this.debug,
        ignore: this.ignore,
        writable: this.writable,
        progress: this.progress,
        codecs: this.codecs
      });
      await system.init();
      let drill = async (target2, base) => {
        for (let key in target2) {
          const newBase = get23(key, base);
          const file = target2[key];
          if (file instanceof RangeFile2)
            await system.load(file, get23(key, base));
          else
            await drill(file, newBase);
        }
      };
      await drill(target, path);
      return system;
    };
    this.reset = () => {
      this.changelog = [];
      this.files = this.createFileSystemInfo();
    };
    this.createFileSystemInfo = () => {
      const files = {};
      for (let name23 in this.groups) {
        let group = this.groups[name23];
        const groupInfo = this.cloneGroup(group);
        files[name23] = groupInfo.initial;
      }
      return files;
    };
    this.checkToLoad = (path) => {
      const split = path.split("/");
      const fileName = split.pop();
      const toLoad = this.ignore.reduce((a, b) => {
        if (fileName === b)
          return a * 0;
        else if (path.includes(`${b}/`))
          return a * 0;
        else
          return a * 1;
      }, 1);
      return toLoad;
    };
    this.load = async (file, path, dependent) => {
      const existingFile = this.files.list.get(path);
      if (existingFile)
        return existingFile;
      else {
        if (!file.name)
          file.name = name3(path);
        if (!this.native)
          file = createFile3(file, path, this);
        const toLoad = this.checkToLoad(file.path ?? path);
        if (toLoad) {
          const rangeFile = await load2(file, {
            path,
            system: this,
            debug: this.debug,
            codecs: this.codecs,
            create: this.writable
          });
          if (dependent) {
            if (!this.dependencies[dependent])
              this.dependencies[dependent] = /* @__PURE__ */ new Map();
            this.dependencies[dependent].set(rangeFile.path, rangeFile);
            if (!this.dependents[rangeFile.path])
              this.dependents[rangeFile.path] = /* @__PURE__ */ new Map();
            const file2 = this.files.list.get(dependent);
            this.dependents[rangeFile.path].set(file2.path, file2);
          }
          return rangeFile;
        } else
          console.warn(`Ignoring ${file.name}`);
      }
    };
    this.trackDependency = (path, dependent) => {
      const rangeFile = this.files.list.get(path);
      if (!this.dependencies[dependent])
        this.dependencies[dependent] = /* @__PURE__ */ new Map();
      this.dependencies[dependent].set(path, rangeFile);
      if (!this.dependents[path])
        this.dependents[path] = /* @__PURE__ */ new Map();
      const file = this.files.list.get(dependent);
      this.dependents[path].set(file.path, file);
    };
    this.add = (file) => {
      if (!this.files.list.has(file.path)) {
        this.groupConditions.forEach((func) => func(file, file.path, this.files));
      } else
        console.warn(`${file.path} already exists in the ${this.name} system!`);
    };
    this.isNative = () => false;
    this.openRemote = open_default22;
    this.mountRemote = mount_default3;
    this.open = async (path, create3) => {
      if (!this.native)
        path = get23(path, this.root);
      const rangeFile = await open_default4(path, {
        path,
        debug: this.debug,
        system: this,
        create: create3 ?? this.writable,
        codecs: this.codecs
      });
      return rangeFile;
    };
    this.save = async (force, progress = this.progress) => await save_default2(this.name, Array.from(this.files.list.values()), force, progress);
    this.sync = async () => await iterate_default2(this.files.list.values(), async (entry) => await entry.sync());
    this.transfer = async (target) => await transfer_default2(this, target);
    this.apply = async (system) => {
      this.name = system.name;
      if (system.native)
        this.native = system.native;
      if (system.debug)
        this.debug = system.debug;
      if (system.ignore)
        this.ignore = system.ignore ?? [];
      if (system.writable)
        this.writable = system.writable;
      if (system.progress)
        this.progress = system.progress;
      if (system.codecs instanceof Codecs2)
        this.codecs = system.codecs;
      else
        this.codecs = new Codecs2([codecs_exports2, system.codecs]);
      const files = system.files?.list;
      if (files) {
        await iterate_default2(Array.from(files.values()), async (newFile) => {
          console.log("NewFile", newFile);
          const path = newFile.path;
          let f = this.files.list.get(newFile.path);
          if (!f)
            await this.load(newFile, path);
          else
            await f.apply(newFile, false);
        });
      }
      this.root = system.root;
    };
    const info = Object.assign({}, systemInfo);
    this.apply(Object.assign(info, { name: name22 }));
    this.addGroup("system", {}, (file, path, files) => {
      let target = files.system;
      let split = path.split("/");
      split = split.slice(0, split.length - 1);
      if (path)
        split.forEach((k, i) => {
          if (!target[k])
            target[k] = {};
          target = target[k];
        });
      target[file.name] = file;
    });
    this.addGroup("types", {}, (file, _, files) => {
      const suffix22 = file.suffix ?? file.name;
      if (suffix22) {
        if (!files.types[suffix22])
          files.types[suffix22] = [];
        files.types[suffix22].push(file);
      }
    });
    this.addGroup("n", 0, (_, __, files) => files.n++);
    this.addGroup("list", /* @__PURE__ */ new Map(), (file, _, files) => files.list.set(file.path, file));
  }
};
var openNative2 = async (path, config2) => {
  let nativeHandle = config2.system.native;
  let fileSystem = config2.system?.files?.["system"];
  let { system, create: create3 } = config2;
  let pathTokens = path.split("/");
  let fileName = config2.type === "directory" ? null : pathTokens.pop();
  pathTokens = pathTokens.filter((f) => !!f);
  if (pathTokens.length > 0) {
    for (const token of pathTokens) {
      const handle = await nativeHandle.getDirectoryHandle(token, { create: create3 }).catch((e) => {
        if (create3)
          console.warn(`${token} is an invalid file system handle`, e);
        else
          console.warn(`Directory ${token} does not already exist.`);
      });
      if (handle) {
        nativeHandle = handle;
        if (!fileSystem[token])
          fileSystem[token] = {};
        if (!(fileSystem[token] instanceof RangeFile2))
          fileSystem = fileSystem[token];
      }
    }
  }
  if (fileName) {
    let existingFile = fileSystem[fileName];
    if (!(existingFile instanceof RangeFile2)) {
      const fileHandle = await nativeHandle.getFileHandle(fileName, { create: create3 }).catch((e) => {
        if (config2.create)
          console.warn(`Could not create ${fileName}. There may be a directory of the same name...`, e);
        else
          console.warn(`No file found at ${path}.`);
      });
      if (!fileHandle)
        return;
      const file = createFile22(fileHandle, path, system);
      existingFile = await system.load(file, path);
    }
    return existingFile;
  } else
    return nativeHandle;
};
var open_default32 = openNative2;
var verifyPermission2 = async (fileHandle, withWrite = false) => {
  const opts = {};
  if (withWrite)
    opts.mode = "readwrite";
  const state2 = await fileHandle.queryPermission(opts);
  if (await state2 === "granted")
    return true;
  const requestState = await fileHandle.requestPermission(opts);
  if (requestState === "granted")
    return true;
  return false;
};
var verify_default2 = verifyPermission2;
var onhandle2 = async (handle, base = "", system, progressCallback = void 0) => {
  await verify_default2(handle, true);
  if (handle.name != system.name)
    base = base ? get23(handle.name, base) : handle.name;
  const files = [];
  if (handle.kind === "file") {
    if (progressCallback instanceof Function)
      files.push({ handle, base });
    else
      await system.load(handle, base);
  } else if (handle.kind === "directory") {
    const arr = await iterate_default2(handle.values(), (entry) => {
      return onhandle2(entry, base, system, progressCallback);
    });
    files.push(...arr.flat());
  }
  if (!base) {
    let count = 0;
    await iterate_default2(files, async (o) => {
      await system.load(o.handle, o.base);
      count++;
      progressCallback(system.name, count / files.length, files.length);
    });
  }
  return files;
};
var mountNative2 = async (handle, config2) => {
  if (!handle)
    handle = await window.showDirectoryPicker();
  if (config2?.system) {
    config2.system.name = config2.system.root = handle.name;
    config2.system.native = handle;
  }
  await onhandle2(handle, null, config2?.system, config2?.progress);
  return handle;
};
var mount_default22 = mountNative2;
function idbReady() {
  var isSafari = !navigator.userAgentData && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent);
  if (!isSafari || !indexedDB.databases)
    return Promise.resolve();
  var intervalId;
  return new Promise(function(resolve3) {
    var tryIdb = function() {
      return indexedDB.databases().finally(resolve3);
    };
    intervalId = setInterval(tryIdb, 100);
    tryIdb();
  }).finally(function() {
    return clearInterval(intervalId);
  });
}
var dist_default = idbReady;
function promisifyRequest2(request) {
  return new Promise((resolve3, reject) => {
    request.oncomplete = request.onsuccess = () => resolve3(request.result);
    request.onabort = request.onerror = () => reject(request.error);
  });
}
function createStore2(dbName, storeName) {
  const dbp = dist_default().then(() => {
    const request = indexedDB.open(dbName);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    return promisifyRequest2(request);
  });
  return (txMode, callback) => dbp.then((db) => callback(db.transaction(storeName, txMode).objectStore(storeName)));
}
var defaultGetStoreFunc2;
function defaultGetStore2() {
  if (!defaultGetStoreFunc2) {
    defaultGetStoreFunc2 = createStore2("keyval-store", "keyval");
  }
  return defaultGetStoreFunc2;
}
function get33(key, customStore = defaultGetStore2()) {
  return customStore("readonly", (store) => promisifyRequest2(store.get(key)));
}
function set2(key, value, customStore = defaultGetStore2()) {
  return customStore("readwrite", (store) => {
    store.put(value, key);
    return promisifyRequest2(store.transaction);
  });
}
var cacheName2 = `freerange-history`;
var maxHistory2 = 10;
var setCache2 = async (info) => {
  let history = await get33(cacheName2);
  if (!history)
    history = [info];
  else if (!history.includes(info)) {
    history.push(info);
    if (history.length > maxHistory2)
      history.shift();
  }
  console.log(cacheName2, history);
  set2(cacheName2, history);
};
var LocalSystem2 = class extends System2 {
  constructor(name22, info) {
    super(name22, info);
    this.isNative = (info2) => !info2 || info2 instanceof FileSystemDirectoryHandle;
    this.openNative = open_default32;
    this.mountNative = mount_default22;
    this.oninit = setCache2;
  }
};

// src/core/src/Plugins.ts
var _plugins2;
var Plugins = class {
  constructor(source = "https://raw.githubusercontent.com/brainsatplay/plugins/index.js") {
    this.readyState = false;
    __privateAdd(this, _plugins2, void 0);
    this.checkedPackageLocations = {};
    this.list = /* @__PURE__ */ new Set();
    this.regexp = new RegExp(`(.+).wasl`, "g");
    this.init = async () => {
      if (!this.filesystem) {
        this.filesystem = new LocalSystem2("plugins", {
          ignore: ["DS_Store"]
        });
        await this.filesystem.init();
        const file = await this.filesystem.open(this.source);
        const plugins = await file.body;
        for (let key in plugins) {
          this.list.add(key);
          const path = plugins[key];
          __privateGet(this, _plugins2)[key] = { path };
        }
      } else {
        this.filesystem.files.list.forEach((f) => this.set(f));
      }
      this.filesystem.addGroup("plugins", void 0, (f) => this.set(f));
      this.readyState = true;
    };
    this.set = async (f) => {
      this.list.add(f.path);
      __privateGet(this, _plugins2)[f.path] = {
        path: f.path,
        module: f
      };
      const body = await this.module(f.path);
      const isModule = (void 0)(body);
      if (isModule)
        this.metadata(f.path);
    };
    this.getFile = async (url) => {
      return await this.filesystem.open(url);
    };
    this.package = async (name4) => {
      if (__privateGet(this, _plugins2)[name4]) {
        let path = this.getPath(name4);
        const splitPath = path.split("/").slice(0, -1);
        let packageFile;
        do {
          try {
            path = splitPath.length ? `${splitPath.join("/")}/package.json` : "package.json";
            if (this.checkedPackageLocations[path] !== false) {
              this.checkedPackageLocations[path] = false;
              packageFile = __privateGet(this, _plugins2)[name4].package ?? await this.getFile(path);
              this.checkedPackageLocations[path] = true;
            }
          } catch (e) {
          }
          if (splitPath.length === 0)
            break;
          splitPath.pop();
        } while (!packageFile);
        if (packageFile) {
          __privateGet(this, _plugins2)[name4].package = packageFile;
          return await __privateGet(this, _plugins2)[name4].package.body;
        } else
          return {};
      } else {
        console.warn(`No package for ${name4}.`);
        return {};
      }
    };
    this.get = async (name4, type8 = "module") => {
      if (type8 === "module")
        return await this.module(name4);
      else if (type8 === "module")
        return await this.package(name4);
      else {
        let path = this.getPath(name4);
        if (__privateGet(this, _plugins2)[name4] && !isWASL(path) && path.slice(-12) !== "package.json") {
          let path2 = this.getPath(name4);
          const thisPath = this.path(path2);
          if (!path2.includes(thisPath))
            path2 = thisPath;
          const file = __privateGet(this, _plugins2)[name4][type8] ?? await this.getFile(path2);
          if (file) {
            __privateGet(this, _plugins2)[name4][type8] = file;
            const imported = await file.body;
            if (type8 === "plugins") {
              const pkg = await this.package(name4);
              const imports = {};
              for (name4 in imported) {
                const path3 = imported[name4];
                const file2 = await this.getFile(join(getBase(pkg.main), path3));
                imports[name4] = await file2.body;
              }
              return imports;
            }
            return imported;
          } else
            return {};
        } else {
          console.warn(`No ${type8} for ${name4}.`);
          return {};
        }
      }
    };
    this.metadata = async (name4) => await this.get(name4, "metadata");
    this.graph = async (name4) => await this.get(name4, "graph");
    this.getPath = (name4) => {
      const base = __privateGet(this, _plugins2)[name4]?.module?.path ?? __privateGet(this, _plugins2)[name4]?.path ?? name4;
      return base.split("/").filter((v) => v != "").join("/");
    };
    this.path = (path) => {
      if (this.regexp.test(path))
        return path;
      else {
        const splitPath = path.split("/");
        const fullFileName = splitPath.pop();
        if (fullFileName) {
          const filePrefix = fullFileName.split(".").at(-2);
          return `${splitPath.join("/")}/${filePrefix}.wasl`;
        } else {
          console.warn("Something went wrong...");
          return path;
        }
      }
    };
    this.module = async (name4) => {
      let path = this.getPath(name4);
      let isMetadata2 = false;
      const match = path.match(this.regexp)?.[0];
      if (match) {
        name4 = name4.replace(match, `${match.split("/").at(-1).split(".")[0]}.js`);
        isMetadata2 = true;
      }
      if (__privateGet(this, _plugins2)[name4]) {
        const path2 = this.getPath(name4);
        const pluginModule = __privateGet(this, _plugins2)[name4].module ?? await this.getFile(path2);
        if (pluginModule) {
          __privateGet(this, _plugins2)[name4].module = pluginModule;
          if (isMetadata2)
            return await this.metadata(name4);
          else
            return await __privateGet(this, _plugins2)[name4].module.body;
        } else
          return {};
      } else {
        console.error(`Module for ${name4} not found.`);
        return {};
      }
    };
    if (typeof source === "string")
      this.source = source;
    else {
      this.source = source.name;
      this.filesystem = source;
    }
    __privateSet(this, _plugins2, {});
    console.log("plugins", __privateGet(this, _plugins2));
  }
};
_plugins2 = new WeakMap();

// ../phaser/index.wasl.json
var index_wasl_default = {
  graph: {
    nodes: {
      phaser: {
        src: "src/index.wasl.json",
        plugins: {
          game: {
            preload: {
              setBaseURL: "https://raw.githubusercontent.com/garrettmflynn/phaser/main/assets",
              tilemapTiledJSON: [
                ["map", "map.json"]
              ],
              spritesheet: [
                ["tiles", "tiles.png", { frameWidth: 70, frameHeight: 70 }]
              ],
              image: [
                ["coin", "coinGold.png"]
              ],
              atlas: [
                ["player", "player.png", "player.json"]
              ]
            },
            config: {
              physics: {
                default: "arcade",
                arcade: {
                  gravity: {
                    y: 500
                  }
                }
              },
              scene: {
                key: "main",
                create: {
                  src: "scripts/create.js"
                }
              }
            },
            graph: {
              nodes: {
                cursors: {
                  src: "src/plugins/cursors/index.js"
                },
                player: {
                  src: "src/plugins/player/index.js",
                  position: {
                    x: 200,
                    y: 200
                  },
                  size: {
                    offset: {
                      height: -8
                    }
                  },
                  bounce: 0.2,
                  collideWorldBounds: false,
                  create: {
                    src: "scripts/player/create/main.js"
                  },
                  update: {
                    src: "scripts/player/update.js"
                  }
                },
                companion: {
                  src: "src/plugins/player/index.js",
                  position: {
                    x: 100,
                    y: 200
                  },
                  size: {
                    offset: {
                      height: -8
                    }
                  },
                  bounce: 0.2,
                  collideWorldBounds: false,
                  create: {
                    src: "scripts/player/create/companion.js"
                  },
                  update: {
                    src: "scripts/player/update.js"
                  }
                }
              }
            }
          }
        }
      }
    },
    edges: {}
  }
};

// ../phaser/src/index.wasl.json
var index_wasl_default2 = {
  graph: {
    nodes: {
      game: {
        src: "plugins/game/index.js"
      }
    },
    edges: {}
  }
};

// ../phaser/package.json
var package_default = {
  name: "myphaserapp",
  type: "module"
};

// ../phaser/src/package.json
var package_default2 = {
  name: "phaser",
  type: "module"
};

// ../phaser/src/plugins/game/index.js
var game_exports = {};
__export(game_exports, {
  config: () => config,
  default: () => game_default,
  game: () => game,
  oncreate: () => oncreate,
  ondelete: () => ondelete,
  preload: () => preload
});

// ../phaser/src/plugins/game/config/merge.js
var merge2 = (base, newObj) => {
  const copy = Object.assign({}, base);
  if (newObj) {
    const copyKeys = Object.keys(copy);
    const newKeys = Object.keys(newObj);
    copyKeys.forEach((k) => {
      if (typeof newObj[k] === "object")
        merge2(base[k], newObj[k]);
      else if (newObj[k])
        base[k] = newObj[k];
    });
    newKeys.forEach((k) => copy[k] = newObj[k]);
  }
  return copy;
};
var merge_default = merge2;

// ../phaser/src/plugins/game/config/phaser.config.js
var defaultConfig = (Phaser) => {
  function preload2() {
    this.load.setBaseURL("http://labs.phaser.io");
    this.load.image("sky", "assets/skies/space3.png");
    this.load.image("logo", "assets/sprites/phaser3-logo.png");
    this.load.image("red", "assets/particles/red.png");
  }
  function create3() {
    this.add.image(400, 300, "sky");
    var particles = this.add.particles("red");
    var emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: "ADD"
    });
    var logo = this.physics.add.image(400, 100, "logo");
    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);
    emitter.startFollow(logo);
  }
  const config2 = {
    type: Phaser.AUTO,
    width: "100",
    height: "100",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 200 },
        debug: false
      }
    },
    scene: {
      preload: preload2,
      create: create3
    }
  };
  return config2;
};
var phaser_config_default = defaultConfig;

// ../phaser/src/plugins/game/index.js
var script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser-arcade-physics.min.js";
document.head.appendChild(script);
var nodes = {};
var onResolve = null;
if (!("Phaser" in window)) {
  script.onload = function() {
    if (onResolve instanceof Function)
      onResolve(window.Phaser);
    for (let tag in nodes)
      nodes[tag].run();
  };
}
var call = (func, ctx, ...args) => {
  if (typeof func === "function")
    func.call(ctx, args);
};
var preload = [];
var config = phaser_config_default;
var game;
function oncreate() {
  if (window.Phaser)
    this.run();
  else
    nodes[this.tag] = this;
}
function ondelete() {
  if (this.game)
    this.game.destroy(true, false);
}
async function game_default() {
  const instance = this;
  const Phaser = window.Phaser ?? await new Promise((resolve3) => onResolve = resolve3);
  let cfg = typeof this.config === "function" ? this.config(window.Phaser) : this.config;
  let defaultCfg = typeof config === "function" ? config(window.Phaser) : config;
  let mergedConfig = merge_default(defaultCfg, cfg);
  mergedConfig.parent = instance.parent?.parentNode;
  return new Promise((resolve3) => {
    const originalUpdate = mergedConfig.scene.update;
    const originalCreate = mergedConfig.scene.create;
    const originalPreload = mergedConfig.scene.preload;
    mergedConfig.scene.preload = function() {
      for (let fName in instance.preload) {
        const o = instance.preload[fName];
        if (typeof o === "object")
          for (let key in o)
            this.load[fName](...Object.values(o[key]));
        else
          this.load[fName](o);
      }
      call(originalPreload, this);
    };
    mergedConfig.scene.create = function() {
      call(originalCreate, this);
      this.context = this;
      instance.nodes.forEach((n) => {
        if (typeof n.ongame === "function")
          n.ongame(this.context);
      });
      resolve3(this.context);
    };
    mergedConfig.scene.update = function() {
      call(originalUpdate, this);
      instance.nodes.forEach((n) => {
        if (typeof n.update === "function")
          n.update(this, Object.fromEntries(instance.nodes));
      });
    };
    this.game = new Phaser.Game(mergedConfig);
  });
}

// ../phaser/src/plugins/cursors/index.js
var cursors_exports = {};
__export(cursors_exports, {
  default: () => cursors_default,
  ongame: () => ongame
});
function ongame(context) {
  this.ref = context.input.keyboard.createCursorKeys();
}
function cursors_default() {
  return this.ref;
}

// ../phaser/src/plugins/player/index.js
var player_exports = {};
__export(player_exports, {
  bounce: () => bounce,
  collideWorldBounds: () => collideWorldBounds,
  create: () => create,
  default: () => player_default,
  jump: () => jump,
  jumpRefractoryPeriod: () => jumpRefractoryPeriod,
  jumped: () => jumped,
  move: () => move,
  ongame: () => ongame2,
  position: () => position,
  ref: () => ref,
  size: () => size,
  update: () => update
});
var bounce = 0;
var collideWorldBounds;
var size = {};
var position = {};
var jumpRefractoryPeriod = 1500;
var create;
var update;
var ref;
var jumped = false;
function jump(height) {
  if (height && this.jumped === false) {
    this.jumped = true;
    this.ref.body.setVelocityY(-500 * height);
    setTimeout(() => this.jumped = false, this.jumpRefractoryPeriod);
  }
}
function move(x = 0) {
  this.ref.body.setVelocityX(x);
}
function ongame2(game2) {
  if (game2) {
    this.ref = game2.physics.add.sprite(this.position.x, this.position.y, "player");
    this.ref.setBounce(this.bounce);
    this.ref.setCollideWorldBounds(this.collideWorldBounds);
    this.ref.body.setSize((this.size.width ?? this.ref.width) + this.size.offset.width, (this.size.height ?? this.ref.height) + this.size.offset.height);
    if (typeof this.create === "function")
      this.create.call(game2, this.ref);
  }
}
function player_default() {
  return this.ref;
}

// ../phaser/scripts/create.js
var create_exports = {};
__export(create_exports, {
  default: () => create_default
});
var score = 0;
function create2() {
  const map = this.make.tilemap({ key: "map" });
  const groundTiles = map.addTilesetImage("tiles");
  const groundLayer = map.createLayer("World", groundTiles, 0, 0);
  groundLayer.setCollisionByExclusion([-1]);
  const coinTiles = map.addTilesetImage("coin");
  const coinLayer = map.createLayer("Coins", coinTiles, 0, 0);
  this.physics.world.bounds.width = groundLayer.width;
  this.physics.world.bounds.height = groundLayer.height;
  coinLayer.setTileIndexCallback(17, (sprite, tile) => {
    removeTile(coinLayer, tile);
    score = incrementScore(score, text);
  }, this);
  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  this.cameras.main.setBackgroundColor("#ccccff");
  const text = this.add.text(20, 570, "0", {
    fontSize: "20px",
    fill: "#ffffff"
  });
  text.setScrollFactor(0);
}
function incrementScore(score2, text) {
  score2++;
  if (text)
    text.setText(score2);
  return score2;
}
function removeTile(layer, tile) {
  layer.removeTileAt(tile.x, tile.y);
  return false;
}
var create_default = create2;

// ../phaser/scripts/player/create/main.js
var main_exports = {};
__export(main_exports, {
  default: () => main_default,
  main: () => main
});

// ../phaser/scripts/player/create/base.js
var getLayer = (name4, context) => {
  return context.children.list.find((o) => o.type === "TilemapLayer" && o.layer.name === name4);
};
function createPlayer(player) {
  const groundLayer = getLayer("World", this);
  this.physics.add.collider(groundLayer, player);
  const coinLayer = getLayer("Coins", this);
  this.physics.add.overlap(player, coinLayer);
}
var base_default = createPlayer;

// ../phaser/scripts/player/create/main.js
function main() {
  this.anims.create({
    key: "walk",
    frames: this.anims.generateFrameNames("player", {
      prefix: "p1_walk",
      start: 1,
      end: 11,
      zeroPad: 2
    }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: "idle",
    frames: [{ key: "player", frame: "p1_stand" }],
    frameRate: 10
  });
}
function createMain(player) {
  base_default.call(this, player);
  main.call(this, player);
  this.cameras.main.startFollow(player);
}
var main_default = createMain;

// ../phaser/scripts/player/create/companion.js
var companion_exports = {};
__export(companion_exports, {
  default: () => companion_default
});
function createCompanion(player) {
  base_default.call(this, player);
  main.call(this, player);
  player.setDisplaySize(4 * player.width / 6, 4 * player.height / 6);
}
var companion_default = createCompanion;

// ../phaser/scripts/player/update.js
var update_exports = {};
__export(update_exports, {
  default: () => update2
});
function update2(context, peers) {
  if (this.ref.x >= 2060 || this.ref.x <= 0)
    this.ref.x = 0.5;
  if (peers.cursors.ref.up.isDown) {
    this.jump(true);
  }
  if (peers.cursors.ref.left.isDown) {
    this.move(-200);
    this.ref.flipX = true;
  } else if (peers.cursors.ref.right.isDown) {
    this.move(200);
    this.ref.flipX = false;
  } else {
    this.move(0);
    this.ref.anims.play("idle", true);
  }
  if (this.ref.body.velocity.x === 0)
    this.ref.anims.play("walk", false);
  else
    this.ref.anims.play("walk", true);
}

// examples/core/demos/phaser.ts
var options = {
  relativeTo: import.meta.url,
  filesystem: {
    "package.json": package_default,
    "src/package.json": package_default2,
    "src/index.wasl.json": index_wasl_default2,
    "src/plugins/game/index.js": game_exports,
    "src/plugins/player/index.js": player_exports,
    "src/plugins/cursors/index.js": cursors_exports,
    "scripts/create.js": create_exports,
    "src/scripts/player/create/main.js": main_exports,
    "src/scripts/player/create/companion.js": companion_exports,
    "src/scripts/player/update.js": update_exports
  }
};

// examples/core/index.ts
var method = "remote";
var edit = true;
var optionsToPass = options;
var infoToPass;
var app;
if (method === "remote") {
  infoToPass = "https://raw.githubusercontent.com/brainsatplay/wasl/main/tests/0/0.0/0.0.0/external/index.wasl.json";
} else
  infoToPass = index_wasl_default;
optionsToPass.parentNode = document.getElementById("app");
optionsToPass.edit = edit;
var createApp = async (infoToPass2) => {
  app = new App(infoToPass2, optionsToPass);
};
var start = document.getElementById("start");
var save3 = document.getElementById("save");
var load3 = document.getElementById("load");
var correction = () => {
};
if (start) {
  createApp(infoToPass);
  start.addEventListener("click", async () => {
    await app.start(void 0, optionsToPass).then((wasl) => {
      if (wasl) {
        console.log("App", app);
        console.log("Errors", wasl.errors);
        console.log("Warnings", wasl.warnings);
      }
    }).catch((e) => console.error("Invalid App", e));
    correction();
    correction = () => {
    };
  });
}
if (load3) {
  load3.addEventListener("click", () => {
    createApp();
    correction = () => createApp(infoToPass);
    if (start)
      start.click();
  });
}
if (save3) {
  save3.addEventListener("click", () => {
    app.save().catch((e) => console.error("Save Error", e));
  });
}
/*! pako 2.0.4 https://github.com/nodeca/pako @license (MIT AND Zlib) */
