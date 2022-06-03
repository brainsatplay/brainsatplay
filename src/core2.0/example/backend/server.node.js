var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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

// ../../node_modules/better-sse/build/index.js
var require_build = __commonJS({
  "../../node_modules/better-sse/build/index.js"(exports, module2) {
    !function(e, t) {
      if (typeof exports == "object" && typeof module2 == "object")
        module2.exports = t();
      else if (typeof define == "function" && define.amd)
        define([], t);
      else {
        var s = t();
        for (var i in s)
          (typeof exports == "object" ? exports : e)[i] = s[i];
      }
    }(global, function() {
      return (() => {
        "use strict";
        var e = { n: (t2) => {
          var s2 = t2 && t2.__esModule ? () => t2.default : () => t2;
          return e.d(s2, { a: s2 }), s2;
        }, d: (t2, s2) => {
          for (var i2 in s2)
            e.o(s2, i2) && !e.o(t2, i2) && Object.defineProperty(t2, i2, { enumerable: true, get: s2[i2] });
        }, o: (e2, t2) => Object.prototype.hasOwnProperty.call(e2, t2), r: (e2) => {
          typeof Symbol != "undefined" && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e2, "__esModule", { value: true });
        } }, t = {};
        e.r(t), e.d(t, { Channel: () => d, Session: () => a, createChannel: () => c, createSession: () => l });
        const s = require("crypto"), i = require("events");
        var n = e.n(i);
        class r extends n() {
          addListener(e2, t2) {
            return super.addListener(e2, t2);
          }
          prependListener(e2, t2) {
            return super.prependListener(e2, t2);
          }
          prependOnceListener(e2, t2) {
            return super.prependOnceListener(e2, t2);
          }
          on(e2, t2) {
            return super.on(e2, t2);
          }
          once(e2, t2) {
            return super.once(e2, t2);
          }
          emit(e2, ...t2) {
            return super.emit(e2, ...t2);
          }
          off(e2, t2) {
            return super.off(e2, t2);
          }
          removeListener(e2, t2) {
            return super.removeListener(e2, t2);
          }
        }
        const o = (e2) => JSON.stringify(e2), h = (e2) => {
          let t2 = e2;
          return t2 = t2.replace(/(\r\n|\r|\n)/g, "\n"), t2 = t2.replace(/\n+$/g, ""), t2;
        };
        class a extends r {
          constructor(e2, t2, i2 = {}) {
            var n2, r2, a2, l2, d2, c2, u;
            super(), this.lastId = "", this.isConnected = false, this.state = {}, this.onConnected = () => {
              var e3, t3, s2;
              const i3 = `http://${this.req.headers.host}${this.req.url}`, n3 = new URL(i3).searchParams;
              if (this.trustClientEventId) {
                const i4 = (s2 = (t3 = (e3 = this.req.headers["last-event-id"]) !== null && e3 !== void 0 ? e3 : n3.get("lastEventId")) !== null && t3 !== void 0 ? t3 : n3.get("evs_last_event_id")) !== null && s2 !== void 0 ? s2 : "";
                this.lastId = i4;
              }
              Object.entries(this.headers).forEach(([e4, t4]) => {
                this.res.setHeader(e4, t4 != null ? t4 : "");
              }), this.res.statusCode = this.statusCode, this.res.setHeader("Content-Type", "text/event-stream"), this.res.setHeader("Cache-Control", "no-cache, no-transform"), this.res.setHeader("Connection", "keep-alive"), this.res.flushHeaders(), n3.has("padding") && this.comment(" ".repeat(2049)).dispatch(), n3.has("evs_preamble") && this.comment(" ".repeat(2056)).dispatch(), this.initialRetry !== null && this.retry(this.initialRetry).dispatch(), this.keepAliveInterval !== null && (this.keepAliveTimer = setInterval(this.keepAlive, this.keepAliveInterval)), this.isConnected = true, this.emit("connected");
            }, this.onDisconnected = () => {
              this.keepAliveTimer && clearInterval(this.keepAliveTimer), this.isConnected = false, this.emit("disconnected");
            }, this.writeField = (e3, t3) => {
              const s2 = `${e3}:${this.sanitize(t3)}
`;
              return this.res.write(s2), this;
            }, this.keepAlive = () => {
              this.comment().dispatch();
            }, this.dispatch = () => (this.res.write("\n"), this), this.data = (e3) => {
              const t3 = this.serialize(e3);
              return this.writeField("data", t3), this;
            }, this.id = (e3) => {
              const t3 = e3 || "";
              return this.writeField("id", t3), this.lastId = t3, this;
            }, this.retry = (e3) => {
              const t3 = e3.toString();
              return this.writeField("retry", t3), this;
            }, this.comment = (e3) => (this.writeField("", e3 != null ? e3 : ""), this), this.push = (e3, t3, i3) => (t3 || (t3 = "message"), i3 || (i3 = (0, s.randomBytes)(4).toString("hex")), this.event(t3).id(i3).data(e3).dispatch(), this.emit("push", e3, t3, i3), this), this.stream = async (e3, t3 = {}) => {
              const { eventName: s2 = "stream" } = t3;
              return new Promise((t4, i3) => {
                e3.on("data", (e4) => {
                  let t5;
                  t5 = Buffer.isBuffer(e4) ? e4.toString() : e4, this.push(t5, s2);
                }), e3.once("end", () => t4(true)), e3.once("close", () => t4(true)), e3.once("error", (e4) => i3(e4));
              });
            }, this.iterate = async (e3, t3 = {}) => {
              const { eventName: s2 = "iteration" } = t3;
              for await (const t4 of e3)
                this.push(t4, s2);
            }, this.req = e2, this.res = t2, this.serialize = (n2 = i2.serializer) !== null && n2 !== void 0 ? n2 : o, this.sanitize = (r2 = i2.sanitizer) !== null && r2 !== void 0 ? r2 : h, this.trustClientEventId = (a2 = i2.trustClientEventId) === null || a2 === void 0 || a2, this.initialRetry = i2.retry === null ? null : (l2 = i2.retry) !== null && l2 !== void 0 ? l2 : 2e3, this.keepAliveInterval = i2.keepAlive === null ? null : (d2 = i2.keepAlive) !== null && d2 !== void 0 ? d2 : 1e4, this.statusCode = (c2 = i2.statusCode) !== null && c2 !== void 0 ? c2 : 200, this.headers = (u = i2.headers) !== null && u !== void 0 ? u : {}, this.req.on("close", this.onDisconnected), setImmediate(this.onConnected);
          }
          event(e2) {
            return this.writeField("event", e2), this;
          }
        }
        const l = (...e2) => new Promise((t2) => {
          const s2 = new a(...e2);
          s2.once("connected", () => {
            t2(s2);
          });
        });
        class d extends r {
          constructor() {
            super(), this.state = {}, this.sessions = [], this.broadcast = (e2, t2, s2 = {}) => {
              t2 || (t2 = "message");
              const i2 = s2.filter ? this.sessions.filter(s2.filter) : this.sessions;
              for (const s3 of i2)
                s3.push(e2, t2);
              return this.emit("broadcast", e2, t2), this;
            };
          }
          get activeSessions() {
            return this.sessions;
          }
          get sessionCount() {
            return this.sessions.length;
          }
          register(e2) {
            if (!e2.isConnected)
              throw new Error("Cannot register a non-active session.");
            return e2.once("disconnected", () => {
              this.deregister(e2), this.emit("session-disconnected", e2);
            }), this.sessions.push(e2), this.emit("session-registered", e2), this;
          }
          deregister(e2) {
            return this.sessions = this.sessions.filter((t2) => t2 !== e2), this.emit("session-deregistered", e2), this;
          }
        }
        const c = (...e2) => new d(...e2);
        return t;
      })();
    });
  }
});

// ../../node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "../../node_modules/ws/lib/stream.js"(exports, module2) {
    "use strict";
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data))
          ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed)
          return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed)
          return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called)
            callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy)
          ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null)
          return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted)
            duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused)
          ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream2;
  }
});

// ../../node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "../../node_modules/ws/lib/constants.js"(exports, module2) {
    "use strict";
    module2.exports = {
      BINARY_TYPES: ["nodebuffer", "arraybuffer", "fragments"],
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// ../../node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "../../node_modules/ws/lib/buffer-util.js"(exports, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    function concat(list, totalLength) {
      if (list.length === 0)
        return EMPTY_BUFFER;
      if (list.length === 1)
        return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength)
        return target.slice(0, offset);
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.byteLength === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data))
        return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = Buffer.from(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    try {
      const bufferUtil = require("bufferutil");
      module2.exports = {
        concat,
        mask(source, mask, output, offset, length) {
          if (length < 48)
            _mask(source, mask, output, offset, length);
          else
            bufferUtil.mask(source, mask, output, offset, length);
        },
        toArrayBuffer,
        toBuffer,
        unmask(buffer, mask) {
          if (buffer.length < 32)
            _unmask(buffer, mask);
          else
            bufferUtil.unmask(buffer, mask);
        }
      };
    } catch (e) {
      module2.exports = {
        concat,
        mask: _mask,
        toArrayBuffer,
        toBuffer,
        unmask: _unmask
      };
    }
  }
});

// ../../node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "../../node_modules/ws/lib/limiter.js"(exports, module2) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      [kRun]() {
        if (this.pending === this.concurrency)
          return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// ../../node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "../../node_modules/ws/lib/permessage-deflate.js"(exports, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate = class {
      constructor(options, isServer, maxPayload) {
        this._maxPayload = maxPayload | 0;
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._isServer = !!isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      static get extensionName() {
        return "permessage-deflate";
      }
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(new Error("The deflate stream was closed while data was being processed"));
          }
        }
      }
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
        }
        return params;
      }
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin)
          this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
          if (fin)
            data2 = data2.slice(0, data2.length - 4);
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// ../../node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "../../node_modules/ws/lib/validation.js"(exports, module2) {
    "use strict";
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    try {
      const isValidUTF8 = require("utf-8-validate");
      module2.exports = {
        isValidStatusCode,
        isValidUTF8(buf) {
          return buf.length < 150 ? _isValidUTF8(buf) : isValidUTF8(buf);
        },
        tokenChars
      };
    } catch (e) {
      module2.exports = {
        isValidStatusCode,
        isValidUTF8: _isValidUTF8,
        tokenChars
      };
    }
  }
});

// ../../node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "../../node_modules/ws/lib/receiver.js"(exports, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var Receiver2 = class extends Writable {
      constructor(options = {}) {
        super();
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._state = GET_INFO;
        this._loop = false;
      }
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO)
          return cb();
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length)
          return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = buf.slice(n);
          return buf.slice(0, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = buf.slice(n);
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      startLoop(cb) {
        let err;
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              err = this.getInfo();
              break;
            case GET_PAYLOAD_LENGTH_16:
              err = this.getPayloadLength16();
              break;
            case GET_PAYLOAD_LENGTH_64:
              err = this.getPayloadLength64();
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              err = this.getData(cb);
              break;
            default:
              this._loop = false;
              return;
          }
        } while (this._loop);
        cb(err);
      }
      getInfo() {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          this._loop = false;
          return error(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3");
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
          this._loop = false;
          return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            this._loop = false;
            return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
          }
          if (!this._fragmented) {
            this._loop = false;
            return error(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE");
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            this._loop = false;
            return error(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            this._loop = false;
            return error(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN");
          }
          if (compressed) {
            this._loop = false;
            return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
          }
          if (this._payloadLength > 125) {
            this._loop = false;
            return error(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
          }
        } else {
          this._loop = false;
          return error(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
        }
        if (!this._fin && !this._fragmented)
          this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            this._loop = false;
            return error(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK");
          }
        } else if (this._masked) {
          this._loop = false;
          return error(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK");
        }
        if (this._payloadLength === 126)
          this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127)
          this._state = GET_PAYLOAD_LENGTH_64;
        else
          return this.haveLength();
      }
      getPayloadLength16() {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        return this.haveLength();
      }
      getPayloadLength64() {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          this._loop = false;
          return error(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH");
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        return this.haveLength();
      }
      haveLength() {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            this._loop = false;
            return error(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
          }
        }
        if (this._masked)
          this._state = GET_MASK;
        else
          this._state = GET_DATA;
      }
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7)
          return this.controlMessage(data);
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        return this.dataMessage();
      }
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err)
            return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              return cb(error(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"));
            }
            this._fragments.push(buf);
          }
          const er = this.dataMessage();
          if (er)
            return cb(er);
          this.startLoop(cb);
        });
      }
      dataMessage() {
        if (this._fin) {
          const messageLength = this._messageLength;
          const fragments = this._fragments;
          this._totalPayloadLength = 0;
          this._messageLength = 0;
          this._fragmented = 0;
          this._fragments = [];
          if (this._opcode === 2) {
            let data;
            if (this._binaryType === "nodebuffer") {
              data = concat(fragments, messageLength);
            } else if (this._binaryType === "arraybuffer") {
              data = toArrayBuffer(concat(fragments, messageLength));
            } else {
              data = fragments;
            }
            this.emit("message", data, true);
          } else {
            const buf = concat(fragments, messageLength);
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              this._loop = false;
              return error(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
            }
            this.emit("message", buf, false);
          }
        }
        this._state = GET_INFO;
      }
      controlMessage(data) {
        if (this._opcode === 8) {
          this._loop = false;
          if (data.length === 0) {
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else if (data.length === 1) {
            return error(RangeError, "invalid payload length 1", true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              return error(RangeError, `invalid status code ${code}`, true, 1002, "WS_ERR_INVALID_CLOSE_CODE");
            }
            const buf = data.slice(2);
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              return error(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
            }
            this.emit("conclude", code, buf);
            this.end();
          }
        } else if (this._opcode === 9) {
          this.emit("ping", data);
        } else {
          this.emit("pong", data);
        }
        this._state = GET_INFO;
      }
    };
    module2.exports = Receiver2;
    function error(ErrorCtor, message, prefix, statusCode, errorCode) {
      const err = new ErrorCtor(prefix ? `Invalid WebSocket frame: ${message}` : message);
      Error.captureStackTrace(err, error);
      err.code = errorCode;
      err[kStatusCode] = statusCode;
      return err;
    }
  }
});

// ../../node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "../../node_modules/ws/lib/sender.js"(exports, module2) {
    "use strict";
    var net = require("net");
    var tls = require("tls");
    var { randomFillSync } = require("crypto");
    var PerMessageDeflate = require_permessage_deflate();
    var { EMPTY_BUFFER } = require_constants();
    var { isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var Sender2 = class {
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._deflating = false;
        this._queue = [];
      }
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            randomFillSync(mask, 0, 4);
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1)
          target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask)
          return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking)
          return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else {
            buf.set(data, 2);
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._deflating) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(Sender2.frame(buf, options), cb);
        }
      }
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (this._deflating) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(Sender2.frame(data, options), cb);
        }
      }
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (this._deflating) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(Sender2.frame(data, options), cb);
        }
      }
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin)
          this._firstFragment = true;
        if (perMessageDeflate) {
          const opts = {
            [kByteLength]: byteLength,
            fin: options.fin,
            generateMask: this._generateMask,
            mask: options.mask,
            maskBuffer: this._maskBuffer,
            opcode,
            readOnly,
            rsv1
          };
          if (this._deflating) {
            this.enqueue([this.dispatch, data, this._compress, opts, cb]);
          } else {
            this.dispatch(data, this._compress, opts, cb);
          }
        } else {
          this.sendFrame(Sender2.frame(data, {
            [kByteLength]: byteLength,
            fin: options.fin,
            generateMask: this._generateMask,
            mask: options.mask,
            maskBuffer: this._maskBuffer,
            opcode,
            readOnly,
            rsv1: false
          }), cb);
        }
      }
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(Sender2.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._deflating = true;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error("The socket was closed while data was being compressed");
            if (typeof cb === "function")
              cb(err);
            for (let i = 0; i < this._queue.length; i++) {
              const params = this._queue[i];
              const callback = params[params.length - 1];
              if (typeof callback === "function")
                callback(err);
            }
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._deflating = false;
          options.readOnly = false;
          this.sendFrame(Sender2.frame(buf, options), cb);
          this.dequeue();
        });
      }
      dequeue() {
        while (!this._deflating && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender2;
  }
});

// ../../node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "../../node_modules/ws/lib/event-target.js"(exports, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = Symbol("kCode");
    var kData = Symbol("kData");
    var kError = Symbol("kError");
    var kMessage = Symbol("kMessage");
    var kReason = Symbol("kReason");
    var kTarget = Symbol("kTarget");
    var kType = Symbol("kType");
    var kWasClean = Symbol("kWasClean");
    var Event = class {
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      get target() {
        return this[kTarget];
      }
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      get code() {
        return this[kCode];
      }
      get reason() {
        return this[kReason];
      }
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      get error() {
        return this[kError];
      }
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      addEventListener(type, listener, options = {}) {
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            listener.call(this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            listener.call(this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            listener.call(this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            listener.call(this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = listener;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
  }
});

// ../../node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "../../node_modules/ws/lib/extension.js"(exports, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0)
        dest[name] = [elem];
      else
        dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1)
              start = i;
            else if (!mustUnescape)
              mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1)
                start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1)
        end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension) => {
        let configurations = extensions[extension];
        if (!Array.isArray(configurations))
          configurations = [configurations];
        return configurations.map((params) => {
          return [extension].concat(Object.keys(params).map((k) => {
            let values = params[k];
            if (!Array.isArray(values))
              values = [values];
            return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
          })).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// ../../node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "../../node_modules/ws/lib/websocket.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events");
    var https2 = require("https");
    var http2 = require("http");
    var net = require("net");
    var tls = require("tls");
    var { randomBytes, createHash } = require("crypto");
    var { Readable } = require("stream");
    var { URL: URL2 } = require("url");
    var PerMessageDeflate = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var closeTimeout = 30 * 1e3;
    var kAborted = Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket3 = class extends EventEmitter {
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = WebSocket3.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._isServer = true;
        }
      }
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type))
          return;
        this._binaryType = type;
        if (this._receiver)
          this._receiver._binaryType = type;
      }
      get bufferedAmount() {
        if (!this._socket)
          return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      get isPaused() {
        return this._paused;
      }
      get onclose() {
        return null;
      }
      get onerror() {
        return null;
      }
      get onopen() {
        return null;
      }
      get onmessage() {
        return null;
      }
      get protocol() {
        return this._protocol;
      }
      get readyState() {
        return this._readyState;
      }
      get url() {
        return this._url;
      }
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        this._sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._socket = socket;
        receiver[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        socket.setTimeout(0);
        socket.setNoDelay();
        if (head.length > 0)
          socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = WebSocket3.OPEN;
        this.emit("open");
      }
      emitClose() {
        if (!this._socket) {
          this._readyState = WebSocket3.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate.extensionName]) {
          this._extensions[PerMessageDeflate.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = WebSocket3.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      close(code, data) {
        if (this.readyState === WebSocket3.CLOSED)
          return;
        if (this.readyState === WebSocket3.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          return abortHandshake(this, this._req, msg);
        }
        if (this.readyState === WebSocket3.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = WebSocket3.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err)
            return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        this._closeTimer = setTimeout(this._socket.destroy.bind(this._socket), closeTimeout);
      }
      pause() {
        if (this.readyState === WebSocket3.CONNECTING || this.readyState === WebSocket3.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      ping(data, mask, cb) {
        if (this.readyState === WebSocket3.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== WebSocket3.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      pong(data, mask, cb) {
        if (this.readyState === WebSocket3.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== WebSocket3.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      resume() {
        if (this.readyState === WebSocket3.CONNECTING || this.readyState === WebSocket3.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain)
          this._socket.resume();
      }
      send(data, options, cb) {
        if (this.readyState === WebSocket3.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== WebSocket3.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      terminate() {
        if (this.readyState === WebSocket3.CLOSED)
          return;
        if (this.readyState === WebSocket3.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          return abortHandshake(this, this._req, msg);
        }
        if (this._socket) {
          this._readyState = WebSocket3.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket3, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket3.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket3, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket3.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket3, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket3.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket3, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket3.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket3.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method2) => {
      Object.defineProperty(WebSocket3.prototype, `on${method2}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method2)) {
            if (listener[kForOnEventAttribute])
              return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method2)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method2, listener);
              break;
            }
          }
          if (typeof handler !== "function")
            return;
          this.addEventListener(method2, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket3.prototype.addEventListener = addEventListener;
    WebSocket3.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket3;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        protocolVersion: protocolVersions[1],
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        createConnection: void 0,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(`Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`);
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
        websocket._url = address.href;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch (e) {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
        websocket._url = address;
      }
      const isSecure = parsedUrl.protocol === "wss:";
      const isUnixSocket = parsedUrl.protocol === "ws+unix:";
      let invalidURLMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isUnixSocket) {
        invalidURLMessage = `The URL's protocol must be one of "ws:", "wss:", or "ws+unix:"`;
      } else if (isUnixSocket && !parsedUrl.pathname) {
        invalidURLMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidURLMessage = "The URL contains a fragment identifier";
      }
      if (invalidURLMessage) {
        const err = new SyntaxError(invalidURLMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https2.request : http2.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = isSecure ? tlsConnect : netConnect;
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket",
        ...opts.headers
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate(opts.perMessageDeflate !== true ? opts.perMessageDeflate : {}, false, opts.maxPayload);
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError("An invalid or duplicated subprotocol was specified");
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isUnixSocket) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalSecure = isSecure;
          websocket._originalHost = parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = parsedUrl.host === websocket._originalHost;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost)
              delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted])
          return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location2 = res.headers.location;
        const statusCode = res.statusCode;
        if (location2 && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location2, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location2}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(websocket, req, `Unexpected server response: ${res.statusCode}`);
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket3.CONNECTING)
          return;
        req = websocket._req = null;
        if (res.headers.upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt)
          websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          generateMask: opts.generateMask,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      req.end();
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket3.CLOSING;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket3.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = toBuffer(data).length;
        if (websocket._socket)
          websocket._sender._bufferedBytes += length;
        else
          websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(`WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`);
        cb(err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0)
        return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005)
        websocket.close();
      else
        websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused)
        websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      websocket.emit("error", err);
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      websocket.pong(data, !websocket._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket3.CLOSING;
      let chunk;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && (chunk = websocket._socket.read()) !== null) {
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket3.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket3.CLOSING;
        this.destroy();
      }
    }
  }
});

// ../../node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "../../node_modules/ws/lib/subprotocol.js"(exports, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1)
            end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module2.exports = { parse };
  }
});

// ../../node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "../../node_modules/ws/lib/websocket-server.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events");
    var http2 = require("http");
    var https2 = require("https");
    var net = require("net");
    var tls = require("tls");
    var { createHash } = require("crypto");
    var extension = require_extension();
    var PerMessageDeflate = require_permessage_deflate();
    var subprotocol = require_subprotocol();
    var WebSocket3 = require_websocket();
    var { GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      constructor(options, callback) {
        super();
        options = {
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          verifyClient: null,
          noServer: false,
          backlog: null,
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket3,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError('One and only one of the "port", "server", or "noServer" options must be specified');
        }
        if (options.port != null) {
          this._server = http2.createServer((req, res) => {
            const body = http2.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(options.port, options.host, options.backlog, callback);
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true)
          options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server)
          return null;
        return this._server.address();
      }
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb)
          this.once("close", cb);
        if (this._state === CLOSING)
          return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path)
            return false;
        }
        return true;
      }
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (req.headers.upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (!key || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 8 && version !== 13) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate(this.options.perMessageDeflate, true, this.options.maxPayload);
          try {
            const offers = extension.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
              extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
            });
            return;
          }
          if (!this.options.verifyClient(info))
            return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable)
          return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error("server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration");
        }
        if (this._state > RUNNING)
          return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate.extensionName]) {
          const params = extensions[PerMessageDeflate.extensionName].params;
          const value = extension.format({
            [PerMessageDeflate.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map))
        server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http2.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(`HTTP/1.1 ${code} ${http2.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message);
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message);
      }
    }
  }
});

// ../../Graph.ts
function getFnParamNames(fn) {
  var fstr = fn.toString();
  return fstr.match(/\(.*?\)/)[0].replace(/[()]/gi, "").replace(/\s/gi, "").split(",");
}
function parseFunctionFromText(method = "") {
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
  if (newFuncHead.includes("function ")) {
    let varName = newFuncHead.split("(")[1].split(")")[0];
    newFunc = new Function(varName, newFuncBody);
  } else {
    if (newFuncHead.substring(0, 6) === newFuncBody.substring(0, 6)) {
      let varName = newFuncHead.split("(")[1].split(")")[0];
      newFunc = new Function(varName, newFuncBody.substring(newFuncBody.indexOf("{") + 1, newFuncBody.length - 1));
    } else {
      try {
        newFunc = eval(newFuncHead + newFuncBody + "}");
      } catch {
      }
    }
  }
  return newFunc;
}
var state = {
  pushToState: {},
  data: {},
  triggers: {},
  setState(updateObj) {
    Object.assign(state.data, updateObj);
    for (const prop of Object.getOwnPropertyNames(updateObj)) {
      if (state.triggers[prop])
        state.triggers[prop].forEach((obj) => obj.onchange(state.data[prop]));
    }
    return state.data;
  },
  subscribeTrigger(key, onchange) {
    if (key) {
      if (!state.triggers[key]) {
        state.triggers[key] = [];
      }
      let l = state.triggers[key].length;
      state.triggers[key].push({ idx: l, onchange });
      return state.triggers[key].length - 1;
    } else
      return void 0;
  },
  unsubscribeTrigger(key, sub) {
    let idx = void 0;
    let triggers = state.triggers[key];
    if (triggers) {
      if (!sub)
        delete state.triggers[key];
      else {
        let obj = triggers.find((o) => {
          if (o.idx === sub) {
            return true;
          }
        });
        if (obj)
          triggers.splice(idx, 1);
        return true;
      }
    }
  },
  subscribeTriggerOnce(key = void 0, onchange) {
    let sub;
    let changed = (value) => {
      onchange(value);
      state.unsubscribeTrigger(key, sub);
    };
    sub = state.subscribeTrigger(key, changed);
  }
};
var Graph = class {
  constructor(properties = {}, parentNode, graph) {
    this.nodes = /* @__PURE__ */ new Map();
    this.attributes = /* @__PURE__ */ new Set();
    this.state = state;
    this.isLooping = false;
    this.isAnimating = false;
    this.looper = void 0;
    this.animation = void 0;
    this.forward = true;
    this.backward = false;
    this.runSync = false;
    this.firstRun = true;
    this.operator = (self = this, origin, ...args) => {
      return args;
    };
    this.runOp = (node = this, origin = this, ...args) => {
      let result = node.operator(node, origin, ...args);
      if (result instanceof Promise) {
        result.then((res) => {
          this.setState({ [node.tag]: res });
          return res;
        });
      } else {
        this.setState({ [node.tag]: result });
      }
      return result;
    };
    this.run = (...args) => {
      return this._run(this, void 0, ...args);
    };
    this._run = (node = this, origin, ...args) => {
      if (typeof node === "string") {
        let fnd;
        if (this.graph)
          fnd = this.graph.nodes.get(node);
        if (!fnd)
          fnd = this.nodes.get(node);
        node = fnd;
      }
      if (!node)
        return void 0;
      if (node.firstRun) {
        if (!(node.children && node.forward || node.parent && node.backward || node.repeat || node.delay || node.frame || node.recursive))
          node.runSync = true;
        if (node.animate && !node.isAnimating) {
          node.runAnimation(node.animation, args, node, origin);
        }
        if (node.loop && typeof node.loop === "number" && !node.isLooping) {
          node.runLoop(node.looper, args, node, origin);
        }
        node.firstRun = false;
      }
      if (node.runSync) {
        let res = node.runOp(node, origin, ...args);
        return res;
      }
      return new Promise(async (resolve) => {
        if (node) {
          let run = (node2, tick = 0, ...input) => {
            return new Promise(async (r) => {
              tick++;
              let res = await node2.runOp(node2, origin, ...input);
              if (typeof node2.repeat === "number") {
                while (tick < node2.repeat) {
                  if (node2.delay) {
                    setTimeout(async () => {
                      r(await run(node2, tick, ...input));
                    }, node2.delay);
                    break;
                  } else if (node2.frame && typeof requestAnimationFrame !== "undefined") {
                    requestAnimationFrame(async () => {
                      r(await run(node2, tick, ...input));
                    });
                    break;
                  } else
                    res = await node2.runOp(node2, origin, ...input);
                  tick++;
                }
                if (tick === node2.repeat) {
                  r(res);
                  return;
                }
              } else if (typeof node2.recursive === "number") {
                while (tick < node2.recursive) {
                  if (node2.delay) {
                    setTimeout(async () => {
                      r(await run(node2, tick, ...res));
                    }, node2.delay);
                    break;
                  } else if (node2.frame && typeof requestAnimationFrame !== "undefined") {
                    requestAnimationFrame(async () => {
                      r(await run(node2, tick, ...res));
                    });
                    break;
                  } else
                    res = await node2.runOp(node2, origin, ...res);
                  tick++;
                }
                if (tick === node2.recursive) {
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
            let res = await run(node, void 0, ...args);
            if (node.animate && !node.isAnimating) {
              node.runAnimation(node.animation, args, node, origin);
            }
            if (typeof node.loop === "number" && !node.isLooping) {
              node.runLoop(node.looper, args, node, origin);
            }
            if (node.backward && node.parent) {
              await node.parent._run(node.parent, this, res);
            }
            if (node.children && node.forward) {
              if (Array.isArray(node.children)) {
                for (let i = 0; i < node.children.length; i++) {
                  await node.children[i]._run(node.children[i], this, res);
                }
              } else
                await node.children._run(node.children, this, res);
            }
            return res;
          };
          if (node.delay) {
            setTimeout(async () => {
              resolve(await runnode());
            }, node.delay);
          } else if (node.frame && typeof requestAnimationFrame !== "undefined") {
            requestAnimationFrame(async () => {
              resolve(await runnode());
            });
          } else {
            resolve(await runnode());
          }
        } else
          resolve(void 0);
      });
    };
    this.runAnimation = (animation = this.animation, args = [], node = this, origin) => {
      this.animation = animation;
      if (!animation)
        this.animation = this.operator;
      if (node.animate && !node.isAnimating) {
        node.isAnimating = true;
        let anim = async () => {
          if (node.isAnimating) {
            let result = this.animation(node, origin, ...args);
            if (result instanceof Promise) {
              result = await result;
            }
            if (typeof result !== "undefined") {
              if (this.tag)
                this.setState({ [this.tag]: result });
              if (node.backward && node.parent) {
                await node.parent._run(node.parent, this, result);
              }
              if (node.children && node.forward) {
                if (Array.isArray(node.children)) {
                  for (let i = 0; i < node.children.length; i++) {
                    await node.children[i]._run(node.children[i], this, result);
                  }
                } else
                  await node.children._run(node.children, this, result);
              }
            }
            requestAnimationFrame(anim);
          }
        };
        requestAnimationFrame(anim);
      }
    };
    this.runLoop = (loop = this.looper, args = [], node = this, origin) => {
      this.looper = loop;
      if (!loop)
        this.looper = this.operator;
      if (typeof node.loop === "number" && !node.isLooping) {
        node.isLooping = true;
        let looping = async () => {
          if (node.looping) {
            let result = this.looper(node, origin, ...args);
            if (result instanceof Promise) {
              result = await result;
            }
            if (typeof result !== "undefined") {
              if (this.tag)
                this.setState({ [this.tag]: result });
              if (node.backward && node.parent) {
                await node.parent._run(node.parent, this, result);
              }
              if (node.children && node.forward) {
                if (Array.isArray(node.children)) {
                  for (let i = 0; i < node.children.length; i++) {
                    await node.children[i]._run(node.children[i], this, result);
                  }
                } else
                  await node.children._run(node.children, this, result);
              }
            }
            setTimeout(async () => {
              await looping();
            }, node.loop);
          }
        };
      }
    };
    this.setOperator = (operator) => {
      this.operator = operator;
    };
    this.setParent = (parent) => {
      this.parent = parent;
      if (this.backward)
        this.runSync = false;
    };
    this.setChildren = (children) => {
      this.children = children;
      if (this.forward)
        this.runSync = false;
    };
    this.add = (node = {}) => {
      if (typeof node === "function")
        node = { operator: node };
      if (!(node instanceof Graph))
        node = new Graph(node, this, this.graph);
      this.nodes.set(node.tag, node);
      if (this.graph)
        this.graph.nodes.set(node.tag, node);
      return node;
    };
    this.remove = (node) => {
      if (typeof node === "string")
        node = this.nodes.get(node);
      if (node instanceof Graph) {
        this.nodes.delete(node.tag);
        if (this.graph)
          this.graph.nodes.delete(node.tag);
        this.nodes.forEach((n) => {
          if (n.nodes.get(node.tag))
            n.nodes.delete(node.tag);
        });
      }
    };
    this.append = (node, parentNode = this) => {
      if (typeof node === "string")
        node = this.nodes.get(node);
      if (node instanceof Graph) {
        parentNode.addChildren(node);
        if (node.forward)
          node.runSync = false;
      }
    };
    this.subscribe = (callback, tag = this.tag) => {
      if (callback instanceof Graph) {
        return this.subscribeNode(callback);
      } else
        return this.state.subscribeTrigger(tag, callback);
    };
    this.unsubscribe = (sub, tag = this.tag) => {
      this.state.unsubscribeTrigger(tag, sub);
    };
    this.addChildren = (children) => {
      if (!this.children)
        this.children = [];
      if (!Array.isArray(this.children)) {
        this.children = [children];
        if (typeof children === "object" && children.tag) {
          this.nodes.set(children.tag, children);
          if (this.graph)
            this.graph.nodes.set(children.tag, children);
        }
      } else if (Array.isArray(children)) {
        this.children.push(...children);
        children.forEach((c) => {
          if (typeof c === "object" && c.tag) {
            this.nodes.set(c.tag, c);
            if (this.graph)
              this.graph.nodes.set(c.tag, c);
          }
        });
      } else {
        this.children.push(children);
        if (typeof children === "object" && children.tag) {
          this.nodes.set(children.tag, children);
          if (this.graph)
            this.graph.nodes.set(children.tag, children);
        }
      }
      if (this.forward)
        this.runSync = false;
    };
    this.callParent = (...args) => {
      const origin = this;
      if (typeof this.parent?.operator === "function")
        return this.parent.runOp(this.parent, origin, ...args);
    };
    this.callChildren = (idx, ...args) => {
      const origin = this;
      let result;
      if (Array.isArray(this.children)) {
        if (idx)
          result = this.children[idx]?.runOp(this.children[idx], origin, ...args);
        else {
          result = [];
          for (let i = 0; i < this.children.length; i++) {
            result.push(this.children[i]?.runOp(this.children[i], origin, ...args));
          }
        }
      } else if (this.children) {
        result = this.children.runOp(this.children, origin, ...args);
      }
      return result;
    };
    this.setProps = (props = {}) => {
      Object.assign(this, props);
      if (!(this.children && this.forward || this.parent && this.backward || this.repeat || this.delay || this.frame || this.recursive))
        this.runSync = true;
    };
    this.removeTree = (node) => {
      if (typeof node === "string")
        node = this.nodes.get(node);
      if (node instanceof Graph) {
        const recursivelyRemove = (node2) => {
          if (node2.children) {
            if (Array.isArray(node2.children)) {
              node2.children.forEach((c) => {
                if (c.stopNode)
                  c.stopNode();
                if (c.tag) {
                  if (this.nodes.get(c.tag))
                    this.nodes.delete(c.tag);
                }
                this.nodes.forEach((n) => {
                  if (n.nodes.get(c.tag))
                    n.nodes.delete(c.tag);
                });
                recursivelyRemove(c);
              });
            } else if (typeof node2.children === "object") {
              if (node2.stopNode)
                node2.stopNode();
              if (node2.tag) {
                if (this.nodes.get(node2.tag))
                  this.nodes.delete(node2.tag);
              }
              this.nodes.forEach((n) => {
                if (n.nodes.get(node2.tag))
                  n.nodes.delete(node2.tag);
              });
              recursivelyRemove(node2);
            }
          }
        };
        if (node.stopNode)
          node.stopNode();
        if (node.tag) {
          this.nodes.delete(node.tag);
          this.nodes.forEach((n) => {
            if (n.nodes.get(node.tag))
              n.nodes.delete(node.tag);
          });
          recursivelyRemove(node);
          if (this.graph)
            this.graph.nodes.removeTree(node);
        }
      }
    };
    this.convertChildrenToNodes = (n) => {
      if (n?.children instanceof Graph) {
        if (!this.graph?.nodes.get(n.tag))
          this.graph.nodes.set(n.tag, n);
        if (!this.nodes.get(n.tag))
          this.nodes.set(n.tag, n);
      } else if (Array.isArray(n.children)) {
        for (let i = 0; i < n.children.length; i++) {
          if (n.children[i].name === "Graph") {
            if (!this.graph?.nodes.get(n.children[i].tag))
              this.graph.nodes.set(n.children[i].tag, n.children[i]);
            if (!this.nodes.get(n.children[i].tag))
              this.nodes.set(n.children[i].tag, n.children[i]);
            continue;
          } else if (typeof n.children[i] === "object") {
            n.children[i] = new Graph(n.children[i], n, this.graph);
            this.nodes.set(n.children[i].tag, n.children[i]);
            this.convertChildrenToNodes(n.children[i]);
          } else if (typeof n.children[i] === "string") {
            if (this.graph) {
              n.children[i] = this.graph.get(n.children[i]);
              if (!this.nodes.get(n.children[i].tag))
                this.nodes.set(n.children[i].tag, n.children[i]);
            }
            if (!n.children[i])
              n.children[i] = this.nodes.get(n.children[i]);
          }
        }
      } else if (typeof n.children === "object") {
        n.children = new Graph(n.children, n, this.graph);
        this.nodes.set(n.children.tag, n.children);
        this.convertChildrenToNodes(n.children);
      } else if (typeof n.children === "string") {
        if (this.graph) {
          n.children = this.graph.get(n.children);
          if (!this.nodes.get(n.children.tag))
            this.nodes.set(n.children.tag, n.children);
        }
        if (!n.children)
          n.children = this.nodes.get(n.children);
      }
      return n.children;
    };
    this.get = (tag) => {
      return this.nodes.get(tag);
    };
    this.stopLooping = (node = this) => {
      node.isLooping = false;
    };
    this.stopAnimating = (node = this) => {
      node.isAnimating = false;
    };
    this.stopNode = (node = this) => {
      node.stopAnimating(node);
      node.stopLooping(node);
    };
    this.subscribeNode = (node) => {
      if (node.tag)
        this.nodes.set(node.tag, node);
      return this.state.subscribeTrigger(this.tag, (res) => {
        node._run(node, this, res);
      });
    };
    this.print = (node = this, printChildren = true, nodesPrinted = []) => {
      let dummyNode = new Graph();
      if (typeof node === "string")
        node = this.nodes.get(node);
      if (node instanceof Graph) {
        nodesPrinted.push(node.tag);
        let jsonToPrint = {
          tag: node.tag,
          operator: node.operator.toString()
        };
        if (node.parent)
          jsonToPrint.parent = node.parent.tag;
        if (node.children) {
          if (Array.isArray(node.children)) {
            node.children = node.children.map((c) => {
              if (typeof c === "string")
                return c;
              if (nodesPrinted.includes(c.tag))
                return c.tag;
              else if (!printChildren) {
                return c.tag;
              } else
                return c.print(c, printChildren, nodesPrinted);
            });
          } else if (typeof node.children === "object") {
            if (!printChildren) {
              jsonToPrint.children = [node.children.tag];
            }
            if (nodesPrinted.includes(node.children.tag))
              jsonToPrint.children = [node.children.tag];
            else
              jsonToPrint.children = [node.children.print(node.children, printChildren, nodesPrinted)];
          } else if (typeof node.children === "string")
            jsonToPrint.children = [node.children];
        }
        for (const prop in node) {
          if (prop === "parent" || prop === "children")
            continue;
          if (typeof dummyNode[prop] === "undefined") {
            if (typeof node[prop] === "function") {
              jsonToPrint[prop] = node[prop].toString();
            } else if (typeof node[prop] === "object") {
              jsonToPrint[prop] = JSON.stringifyWithCircularRefs(node[prop]);
            } else {
              jsonToPrint[prop] = node[prop];
            }
          }
        }
        return JSON.stringify(jsonToPrint);
      }
    };
    this.reconstruct = (json) => {
      let parsed = reconstructObject(json);
      if (parsed)
        return this.add(parsed);
    };
    this.setState = this.state.setState;
    if (typeof properties === "function") {
      properties = { operator: properties };
    }
    if (typeof properties === "object") {
      if (properties?.operator) {
        let params = getFnParamNames(properties.operator);
        if (!(params[0] == "self" || params[0] == "node" || params[1] == "origin" || params[1] == "parent" || params[1] == "graph" || params[1] == "router")) {
          let fn = properties.operator;
          properties.operator = (self, origin, ...args) => {
            return fn(...args);
          };
        }
      }
      if (!properties.tag && graph) {
        properties.tag = `node${graph.nNodes}`;
      } else if (!properties.tag) {
        properties.tag = `node${Math.floor(Math.random() * 1e10)}`;
      }
      Object.assign(this, properties);
    } else if (graph) {
      this.tag = `node${graph.nNodes}`;
    } else {
      this.tag = `node${Math.floor(Math.random() * 1e10)}`;
    }
    this.parent = parentNode;
    this.graph = graph;
    if (graph) {
      graph.nNodes++;
      graph.nodes.set(this.tag, this);
    }
    if (this.children)
      this.convertChildrenToNodes(this);
  }
};
var AcyclicGraph = class {
  constructor(tree, tag) {
    this.nNodes = 0;
    this.nodes = /* @__PURE__ */ new Map();
    this.state = state;
    this.tree = {};
    this.add = (node = {}) => {
      let props = node;
      if (!(node instanceof Graph))
        node = new Graph(props, void 0, this);
      this.tree[node.tag] = props;
      return node;
    };
    this.setTree = (tree = this.tree) => {
      if (!tree)
        return;
      for (const node in tree) {
        if (!this.nodes.get(node)) {
          if (typeof tree[node] === "function") {
            this.add({ tag: node, operator: tree[node] });
          } else if (typeof tree[node] === "object") {
            if (!tree[node].tag)
              tree[node].tag = node;
            let newNode = this.add(tree[node]);
            if (tree[node].aliases) {
              tree[node].aliases.forEach((a) => {
                this.nodes.set(a, newNode);
              });
            }
          }
        }
      }
    };
    this.get = (tag) => {
      return this.nodes.get(tag);
    };
    this.run = (node, ...args) => {
      if (typeof node === "string")
        node = this.nodes.get(node);
      if (node instanceof Graph)
        return node._run(node, this, ...args);
      else
        return void 0;
    };
    this._run = (node, origin = this, ...args) => {
      if (typeof node === "string")
        node = this.nodes.get(node);
      if (node instanceof Graph)
        return node._run(node, origin, ...args);
      else
        return void 0;
    };
    this.removeTree = (node) => {
      if (typeof node === "string")
        node = this.nodes.get(node);
      if (node instanceof Graph) {
        const recursivelyRemove = (node2) => {
          if (node2.children) {
            if (Array.isArray(node2.children)) {
              node2.children.forEach((c) => {
                if (c.stopNode)
                  c.stopNode();
                if (c.tag) {
                  if (this.nodes.get(c.tag))
                    this.nodes.delete(c.tag);
                }
                this.nodes.forEach((n) => {
                  if (n.nodes.get(c.tag))
                    n.nodes.delete(c.tag);
                });
                recursivelyRemove(c);
              });
            } else if (typeof node2.children === "object") {
              if (node2.stopNode)
                node2.stopNode();
              if (node2.tag) {
                if (this.nodes.get(node2.tag))
                  this.nodes.delete(node2.tag);
              }
              this.nodes.forEach((n) => {
                if (n.nodes.get(node2.tag))
                  n.nodes.delete(node2.tag);
              });
              recursivelyRemove(node2);
            }
          }
        };
        if (node.stopNode)
          node.stopNode();
        if (node.tag) {
          this.nodes.delete(node.tag);
          this.nodes.forEach((n) => {
            if (n.nodes.get(node.tag))
              n.nodes.delete(node.tag);
          });
          recursivelyRemove(node);
        }
      }
    };
    this.remove = (node) => {
      if (typeof node === "string")
        node = this.nodes.get(node);
      if (node?.tag) {
        node.stopNode();
        if (node?.tag)
          this.nodes.delete(node.tag);
        if (node?.tag) {
          if (this.nodes.get(node.tag)) {
            this.nodes.delete(node.tag);
            this.nodes.forEach((n) => {
              if (n.nodes.get(node.tag))
                n.nodes.delete(node.tag);
            });
          }
        }
      }
    };
    this.append = (node, parentNode) => {
      parentNode.addChildren(node);
    };
    this.callParent = async (node, origin = node, ...args) => {
      if (node?.parent) {
        return await node.callParent(node, origin, ...args);
      }
    };
    this.callChildren = async (node, idx, ...args) => {
      if (node?.children) {
        return await node.callChildren(idx, ...args);
      }
    };
    this.subscribe = (node, callback) => {
      if (!callback)
        return;
      if (typeof node !== "string")
        node = node.tag;
      if (node instanceof Graph) {
        return node.subscribe(callback);
      } else
        return this.state.subscribeTrigger(node, callback);
    };
    this.unsubscribe = (tag, sub) => {
      this.state.unsubscribeTrigger(tag, sub);
    };
    this.subscribeNode = (inputNode, outputNode) => {
      let tag;
      if (inputNode?.tag)
        tag = inputNode.tag;
      else if (typeof inputNode === "string")
        tag = inputNode;
      return this.state.subscribeTrigger(tag, (res) => {
        this.run(outputNode, inputNode, ...res);
      });
    };
    this.print = (node = void 0, printChildren = true) => {
      if (node instanceof Graph)
        return node.print(node, printChildren);
      else {
        let printed = `{`;
        this.nodes.forEach((n) => {
          printed += `
"${n.tag}:${n.print(n, printChildren)}"`;
        });
        return printed;
      }
    };
    this.reconstruct = (json) => {
      let parsed = reconstructObject(json);
      if (parsed)
        return this.add(parsed);
    };
    this.create = (operator, parentNode, props) => {
      return createNode(operator, parentNode, props, this);
    };
    this.setState = this.state.setState;
    this.tag = tag ? tag : `graph${Math.floor(Math.random() * 1e11)}`;
    if (tree || Object.keys(this.tree).length > 0)
      this.setTree(tree);
  }
};
function reconstructNode(json, parentNode, graph) {
  let reconstructed = reconstructObject(json);
  if (reconstructed)
    return new Graph(reconstructed, parentNode, graph);
  else
    return void 0;
}
function reconstructObject(json = "{}") {
  try {
    let parsed = typeof json === "string" ? JSON.parse(json) : json;
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
  const path2 = ["this"];
  function clear() {
    refs.clear();
    parents.length = 0;
    path2.length = 1;
  }
  function updateParents(key, value) {
    var idx = parents.length - 1;
    var prev = parents[idx];
    if (typeof prev === "object") {
      if (prev[key] === value || idx === 0) {
        path2.push(key);
        parents.push(value.pushed);
      } else {
        while (idx-- >= 0) {
          prev = parents[idx];
          if (typeof prev === "object") {
            if (prev[key] === value) {
              idx += 2;
              parents.length = idx;
              path2.length = idx;
              --idx;
              parents[idx] = value;
              path2[idx] = key;
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
          refs.set(value, path2.join("."));
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
function createNode(operator, parentNode, props, graph) {
  if (typeof props === "object") {
    props.operator = operator;
    return new Graph(props, parentNode, graph);
  }
  return new Graph({ operator }, parentNode, graph);
}

// ../../services/Service.ts
var Service = class extends AcyclicGraph {
  constructor(routes, name) {
    super(void 0, name);
    this.routes = {};
    this.firstLoad = true;
    this.name = `service${Math.floor(Math.random() * 1e14)}`;
    this.load = (routes) => {
      if (!routes && !this.firstLoad)
        return;
      let service;
      if (!(routes instanceof Service) && routes?.name) {
        service = new routes();
        service.load();
        routes = service.routes;
      } else if (routes instanceof Service) {
        service = routes;
        routes = routes.routes;
      }
      if (service instanceof Service) {
        routes = Object.assign({}, routes);
        for (const prop in routes) {
          let route = routes[prop];
          delete routes[prop];
          routes[service.name + "/" + prop] = route;
        }
      }
      if (this.firstLoad) {
        let rts = Object.assign({}, this.defaultRoutes);
        if (routes) {
          Object.assign(rts, this.routes);
          routes = Object.assign(rts, routes);
        } else
          routes = Object.assign(rts, this.routes);
        this.firstLoad = false;
      }
      for (const route in routes) {
        if (typeof routes[route] === "object") {
          let r = routes[route];
          for (const prop in r) {
            r[prop.toLowerCase()] = r[prop];
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
            routes[route].operator = r.post;
          } else if (!r.operator && typeof r.get == "function") {
            routes[route].operator = r.get;
          }
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
      this.setTree(this.routes);
      for (const prop in this.routes) {
        if (this.routes[prop]?.aliases) {
          let aliases = this.routes[prop].aliases;
          aliases.forEach((a) => {
            if (service)
              routes[service.name + "/" + a] = this.routes[prop];
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
      if (!(routes instanceof Service) && routes?.name === "Service") {
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
    this.handleMethod = (route, method2, args, origin) => {
      let m = method2.toLowerCase();
      if (m === "get" && typeof this.routes[route]?.get?.transform === "function") {
        if (Array.isArray(args))
          return this.routes[route].get.transform(...args);
        else
          return this.routes[route].get.transform(args);
      }
      if (this.routes[route]?.[m]) {
        if (typeof this.routes[route][m] !== "function") {
          return this.routes[route][m];
        } else
          return this.routes[route][m](args);
      } else
        return this.handleServiceMessage({ route, args, method: method2, origin });
    };
    this.transmit = (...args) => {
      if (typeof args[0] === "object") {
        if (typeof args[0]?.method === "string") {
          return this.handleMethod(args[0].route, args[0].method, args[0].args);
        } else if (typeof args[0]?.route === "string") {
          return this.handleServiceMessage(args[0]);
        } else if (typeof args[0]?.node === "string" || args[0].node instanceof Graph) {
          return this.handleGraphCall(args[0].node, args[0].args, args[0].origin);
        } else
          return args;
      } else
        return args;
    };
    this.receive = (...args) => {
      if (typeof args[0] === "string") {
        if (args[0].includes("{") || args[0].includes("[")) {
          if (args[0].includes("\\"))
            args[0] = args[0].replace(/\\/g, "");
          if (args[0][0] === '"') {
            args[0] = args[0].substring(1, args[0].length - 1);
          }
          ;
          args[0] = JSON.parse(args[0]);
        }
      }
      if (typeof args[0] === "object") {
        if (typeof args[0].method === "string") {
          return this.handleMethod(args[0].route, args[0].method, args[0].args);
        } else if (typeof args[0].route === "string") {
          return this.handleServiceMessage(args[0]);
        } else if (typeof args[0].node === "string" || args[0].node instanceof Graph) {
          return this.handleGraphCall(args[0].node, args[0].args, args[0].origin);
        } else
          return args;
      } else
        return args;
    };
    this.pipe = (source, destination, origin, method2, callback) => {
      if (source instanceof Graph) {
        if (callback)
          return source.subscribe((res) => {
            let mod = callback(res);
            if (typeof mod !== "undefined")
              this.transmit({ route: destination, args: mod, origin, method: method2 });
            else
              this.transmit({ route: destination, args: res, origin, method: method2 });
          });
        else
          return this.subscribe(source, (res) => {
            this.transmit({ route: destination, args: res, origin, method: method2 });
          });
      } else if (typeof source === "string")
        return this.subscribe(source, (res) => {
          this.transmit({ route: destination, args: res, origin, method: method2 });
        });
    };
    this.terminate = (...args) => {
      this.nodes.forEach((n) => {
        n.stopNode();
      });
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
      transmit: this.transmit,
      receive: this.receive,
      load: this.load,
      unload: this.unload,
      pipe: this.pipe,
      terminate: this.terminate,
      run: this.run,
      _run: this._run,
      subscribe: this.subscribe,
      unsubscribe: this.unsubscribe,
      get: this.get,
      add: this.add,
      remove: this.remove,
      setTree: this.setTree,
      print: this.print,
      reconstruct: this.reconstruct,
      handleMethod: this.handleMethod,
      handleServiceMessage: this.handleServiceMessage,
      handleGraphCall: this.handleGraphCall
    };
    if (name)
      this.name = name;
    if (routes)
      this.load(routes);
  }
  handleServiceMessage(message) {
    let call;
    if (message.route)
      call = message.route;
    else if (message.node)
      call = message.node;
    if (call) {
      if (message.origin) {
        if (Array.isArray(message.args))
          return this._run(call, message.origin, ...message.args);
        else
          return this._run(call, message.origin, message.args);
      } else {
        if (Array.isArray(message.args))
          return this.run(call, ...message.args);
        else
          return this.run(call, message.args);
      }
    } else
      return message;
  }
  handleGraphCall(route, args, origin) {
    if (!route)
      return args;
    if (args?.args) {
      this.handleServiceMessage(args);
    } else if (origin) {
      if (Array.isArray(args))
        return this._run(route, origin, ...args);
      else
        return this._run(route, origin, args);
    } else if (Array.isArray(args))
      return this.run(route, ...args);
    else
      return this.run(route, args);
  }
  isTypedArray(x) {
    return ArrayBuffer.isView(x) && Object.prototype.toString.call(x) !== "[object DataView]";
  }
};

// ../../routers/Router.ts
var Router = class {
  constructor(services) {
    this.id = `router${Math.floor(Math.random() * 1e15)}`;
    this.service = new Service();
    this.run = this.service.run;
    this._run = this.service._run;
    this.add = this.service.add;
    this.remove = this.service.remove;
    this.subscribe = this.service.subscribe;
    this.unsubscribe = this.service.unsubscribe;
    this.get = this.service.get;
    this.reconstruct = this.service.reconstruct;
    this.setState = this.service.setState;
    this.state = this.service.state;
    this.services = {};
    this.load = (service) => {
      if (!(service instanceof Service) && service?.name) {
        service = new service(void 0, service.name);
        service.load();
      } else if (!service)
        return;
      if (service instanceof Service) {
        this.services[service.name] = service;
      }
      this.service.load(service);
      return this.services[service.name];
    };
    this.pipe = (source, destination, transmitter, origin, method2, callback) => {
      if (!transmitter && source && destination) {
        if (callback)
          return this.subscribe(source, (res) => {
            let mod = callback(res);
            if (mod)
              res = mod;
            this.run(destination, res);
          });
        return this.subscribe(source, (res) => {
          this.run(destination, res);
        });
      }
      const radio = this.services[transmitter];
      if (radio) {
        if (callback) {
          return this.subscribe(source, (res) => {
            let mod = callback(res);
            if (mod)
              res = mod;
            radio.transmit({ route: destination, args: res, origin, method: method2 });
          });
        } else
          return this.subscribe(source, (res) => {
            radio.transmit({ route: destination, args: res, origin, method: method2 });
          });
      }
    };
    this.receive = (message, service, ...args) => {
      if (service)
        for (const key in this.services) {
          if (key === service || this.services[key].name === service) {
            return this.services[key].receive(message, ...args);
          }
        }
      return this.service.receive(message, ...args);
    };
    this.transmit = (message, service, ...args) => {
      if (service)
        for (const key in this.services) {
          if (key === service || this.services[key].name === service) {
            return this.services[key].transmit(message, ...args);
          }
        }
      return this.service.transmit(message, ...args);
    };
    if (Array.isArray(services)) {
      services.forEach((s) => this.load(s));
    } else if (typeof services === "object") {
      Object.keys(services).forEach((s) => this.load(services[s]));
    }
    if (!this.run) {
      this.run = this.service.run;
      this._run = this.service._run;
      this.add = this.service.add;
      this.remove = this.service.remove;
      this.subscribe = this.service.subscribe;
      this.unsubscribe = this.service.unsubscribe;
      this.get = this.service.get;
      this.reconstruct = this.service.reconstruct;
      this.setState = this.service.setState;
      this.state = this.service.state;
    }
  }
};

// ../../routers/users/User.router.ts
var UserRouter = class extends Router {
  constructor(services) {
    super(services);
    this.users = {};
    this.runAs = (node, userId, ...args) => {
      return this._run(node, userId, ...args);
    };
    this.pipeAs = (source, destination, transmitter, userId, method2, callback) => {
      return this.pipe(source, destination, transmitter, userId, method2, callback);
    };
    this.removeUser = (user) => {
      if (user.sockets) {
        for (const address in user.sockets) {
          if (!user.sockets[address].socket) {
            this.run("wss/terminate", address);
          }
        }
      }
      if (user.wss) {
        for (const address in user.wss) {
          if (!user.wss[address].wss) {
            this.run("wss/terminate", address);
          }
        }
      }
      if (user.eventsources) {
        for (const path2 in user.eventsources) {
          if (!user.eventsources[path2].source && !user.eventsources[path2].sessions) {
            this.run("wss/terminate", path2);
          }
        }
      }
      if (user.servers) {
        for (const address in user.servers) {
          if (!user.servers[address].server) {
            this.run("http/terminate", address);
          }
        }
      }
      delete this.users[user._id];
    };
  }
  addUser(user) {
    if (!user?._id)
      user._id = `user${Math.floor(Math.random() * 1e15)}`;
    if (user.sockets) {
      for (const address in user.sockets) {
        if (!user.sockets[address].socket) {
          user.sockets[address] = this.run("wss/openWS", user.sockets[address]);
        }
      }
    }
    if (user.wss) {
      for (const address in user.wss) {
        if (!user.wss[address].wss) {
          user.wss[address] = this.run("wss/openWSS", user.wss[address]);
        }
      }
    }
    if (user.eventsources) {
      for (const path2 in user.eventsources) {
        if (!user.eventsources[path2].source && !user.eventsources[path2].sessions) {
          user.eventsources[path2] = this.run("wss/openSSE", user.eventsources[path2]);
        }
      }
    }
    if (user.servers) {
      for (const address in user.servers) {
        if (!user.servers[address].server) {
          user.servers[address] = this.run("http/setupServer", user.servers[address]);
        }
      }
    }
    if (!(user instanceof Graph))
      this.users[user._id] = new Graph(user, void 0, this.service);
    return this.users[user._id];
  }
};

// ../../services/http/HTTP.node.ts
var http = __toESM(require("http"), 1);
var https = __toESM(require("https"), 1);
var fs = __toESM(require("fs"), 1);
var path = __toESM(require("path"), 1);
var HTTPbackend = class extends Service {
  constructor(routes, name, settings) {
    super(routes, name);
    this.name = "http";
    this.debug = false;
    this.servers = {};
    this.mimeTypes = {
      ".html": "text/html",
      ".htm": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".txt": "text/plain",
      ".png": "image/png",
      ".jpg": "image/jpg",
      ".jpeg": "image/jpg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".xhtml": "application/xhtml+xml",
      ".bmp": "image/bmp",
      ".wav": "audio/wav",
      ".mp3": "audio/mpeg",
      ".mp4": "video/mp4",
      ".xml": "application/xml",
      ".webm": "video/webm",
      ".webp": "image/webp",
      ".weba": "audio/webm",
      ".woff": "font/woff",
      "woff2": "font/woff2",
      ".ttf": "application/font-ttf",
      ".eot": "application/vnd.ms-fontobject",
      ".otf": "application/font-otf",
      ".wasm": "application/wasm",
      ".zip": "application/zip",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".tif": "image/tiff",
      ".sh": "application/x-sh",
      ".csh": "application/x-csh",
      ".rar": "application/vnd.rar",
      ".ppt": "application/vnd.ms-powerpoint",
      ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ".odt": "application/vnd.oasis.opendocument.text",
      ".ods": "application/vnd.oasis.opendocument.spreadsheet",
      ".odp": "application/vnd.oasis.opendocument.presentation",
      ".mpeg": "video/mpeg",
      ".mjs": "text/javascript",
      ".cjs": "text/javascript",
      ".jsonld": "application/ld+json",
      ".jar": "application/java-archive",
      ".ico": "image/vnd.microsoft.icon",
      ".gz": "application/gzip",
      "epub": "application/epub+zip",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".csv": "text/csv",
      ".avi": "video/x-msvideo",
      ".aac": "audio/aac",
      ".mpkg": "application/vnd.apple.installer+xml",
      ".oga": "audio/ogg",
      ".ogv": "video/ogg",
      "ogx": "application/ogg",
      ".php": "application/x-httpd-php",
      ".rtf": "application/rtf",
      ".swf": "application/x-shockwave-flash",
      ".7z": "application/x-7z-compressed",
      ".3gp": "video/3gpp"
    };
    this.onStarted = (protocol, host, port) => {
      console.log(`\u{1F431} Node server running at 
            ${protocol}://${host}:${port}/`);
    };
    this.setupServer = (options = {
      protocol: "http",
      host: "localhost",
      port: 8080,
      startpage: "index.html"
    }, requestListener, onStarted) => {
      if (options.protocol === "https") {
        return this.setupHTTPSserver(options, requestListener, onStarted);
      } else
        return this.setupHTTPserver(options, requestListener, onStarted);
    };
    this.setupHTTPserver = (options = {
      host: "localhost",
      port: 8080,
      startpage: "index.html",
      errpage: void 0
    }, requestListener, onStarted = () => {
      this.onStarted("http", options.host, options.port);
    }) => {
      const host = options.host;
      const port = options.port;
      options.protocol = "http";
      if (!host || !port)
        return;
      const address = `${host}:${port}`;
      if (this.servers[address])
        this.terminate(this.servers[address]);
      if (!("keepState" in options))
        options.keepState = true;
      const served = {
        server: void 0,
        address,
        ...options
      };
      if (!requestListener)
        requestListener = (request, response) => {
          this.receive({ route: request.url.slice(1), args: { request, response }, method: request.method, served });
        };
      const server = http.createServer(requestListener);
      served.server = server;
      this.servers[address] = served;
      return new Promise((resolve, reject) => {
        server.on("error", (err) => {
          console.error("Server error:", err.toString());
          reject(err);
        });
        server.listen(port, host, () => {
          onStarted();
          resolve(served);
        });
      });
    };
    this.setupHTTPSserver = (options = {
      host: "localhost",
      port: 8080,
      startpage: "index.html",
      certpath: "cert.pem",
      keypath: "key.pem",
      passphrase: "encryption",
      errpage: void 0
    }, requestListener, onStarted = () => {
      this.onStarted("https", options.host, options.port);
    }) => {
      const host = options.host;
      const port = options.port;
      options.protocol = "https";
      if (!host || !port || !options.certpath || !options.keypath)
        return;
      if (this.servers[`${host}:${port}`])
        this.terminate(this.servers[`${host}:${port}`]);
      var opts = {
        key: fs.readFileSync(options.keypath),
        cert: fs.readFileSync(options.certpath),
        passphrase: options.passphrase
      };
      if (!("keepState" in options))
        options.keepState = true;
      const served = {
        server: void 0,
        address: `${host}:${port}`,
        ...options
      };
      if (!requestListener)
        requestListener = (request, response) => {
          this.receive({
            route: request.url.slice(1),
            args: { request, response },
            method: request.method,
            served
          });
        };
      const server = https.createServer(opts, requestListener);
      served.server = server;
      this.servers[`${host}:${port}`] = served;
      return new Promise((resolve, reject) => {
        server.on("error", (err) => {
          console.error("Server error:", err.toString());
          reject(err);
        });
        server.listen(port, host, () => {
          onStarted();
          resolve(served);
        });
      });
    };
    this.transmit = (message, options, ondata, onend) => {
      let input = message;
      if (typeof input === "object")
        input = JSON.stringify(input);
      if (!options) {
        let server = this.servers[Object.keys(this.servers)[0]];
        options = {
          protocol: server.protocol,
          host: server.host,
          port: server.port,
          method: "POST",
          path: message.route,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": input.length
          }
        };
      } else if (!options.headers) {
        options.headers = {
          "Content-Type": "application/json",
          "Content-Length": input.length
        };
      }
      return this.request(options, input, ondata, onend);
    };
    this.withResult = (response, result, message) => {
      if (result && !response.writableEnded && !response.destroyed) {
        if (typeof result === "string") {
          if (result.includes("<") && result.includes(">") && result.indexOf("<") < result.indexOf(">")) {
            if (message?.served?.pageOptions?.all || message?.served?.pageOptions[message.route]) {
              result = this.injectPageCode(result, message.route, message.served);
            }
            response.writeHead(200, { "Content-Type": "text/html" });
            response.end(result, "utf-8");
            return;
          }
        }
        let mimeType = "text/plain";
        if (typeof result === "object") {
          result = JSON.stringify(result);
          mimeType = "application/json";
        }
        response.writeHead(200, { "Content-Type": mimeType });
        response.end(result, "utf-8");
      }
    };
    this.injectPageCode = (templateString, url, served) => {
      if (served?.pageOptions[url]?.inject) {
        if (typeof served.pageOptions[url].inject === "object")
          templateString = this.buildPage(served.pageOptions[url].inject, templateString);
        else if (typeof served.pageOptions[url].inject === "function")
          templateString += served.pageOptions[url].inject();
        else if (typeof served.pageOptions[url].inject === "string" || typeof served.pageOptions[url].inject === "number")
          templateString += served.pageOptions[url].inject;
      }
      if (served?.pageOptions.all?.inject) {
        if (typeof served.pageOptions.all.inject === "object")
          templateString = this.buildPage(served.pageOptions.all.inject, templateString);
        else if (typeof served.pageOptions.all.inject === "function")
          templateString += served.pageOptions.all.inject();
        else if (typeof served.pageOptions.all.inject === "string" || typeof served.pageOptions.all.inject === "number")
          templateString += served.pageOptions.all.inject;
      }
      return templateString;
    };
    this.receive = (message) => {
      const request = message.args.request;
      const response = message.args.response;
      const method2 = message.method;
      const served = message.served;
      if (this.debug)
        console.log(request.method, request.url);
      let result = new Promise((resolve, reject) => {
        response.on("error", (err) => {
          if (!response.writableEnded || !response.destroyed) {
            response.statusCode = 400;
            response.end(void 0, void 0, () => {
              reject(err);
            });
          }
        });
        let getFailed = () => {
          if (response.writableEnded || response.destroyed)
            reject(requestURL);
          if (requestURL == "./" || requestURL == served?.startpage) {
            let template = `<!DOCTYPE html><html><head></head><body style='background-color:#101010 color:white;'><h1>Brains@Play Server</h1></body></html>`;
            if (served.pageOptions?.all || served.pageOptions?.error) {
              template = this.injectPageCode(template, message.route, served);
            }
            response.writeHead(200, { "Content-Type": "text/html" });
            response.end(template, "utf-8", () => {
              resolve(template);
            });
            if (served.keepState)
              this.setState({ [served.address]: template });
          } else if (this.debug)
            console.log(`File ${requestURL} does not exist on path!`);
          response.writeHead(500);
          response.end(void 0, void 0, () => {
            reject(requestURL);
          });
        };
        if (method2 === "GET" || method2 === "get") {
          var requestURL = "." + request.url;
          if (requestURL == "./" && served?.startpage) {
            requestURL = served.startpage;
          }
          if (fs.existsSync(path.join(process.cwd(), requestURL))) {
            if (response.writableEnded || response.destroyed)
              reject(requestURL);
            fs.readFile(path.join(process.cwd(), requestURL), (error, content) => {
              if (error) {
                if (error.code == "ENOENT") {
                  if (served?.errpage) {
                    fs.readFile(served.errpage, (er, content2) => {
                      response.writeHead(404, { "Content-Type": "text/html" });
                      if (served.pageOptions?.all || served.pageOptions?.error) {
                        content2 = this.injectPageCode(content2.toString(), message.route, served);
                      }
                      response.end(content2, "utf-8");
                      reject(content2);
                    });
                  } else {
                    response.writeHead(404, { "Content-Type": "text/html" });
                    let content2 = `<!DOCTYPE html><html><head></head><body style='background-color:#101010 color:white;'><h1>Error: ${error.code}</h1></body></html>`;
                    if (served.pageOptions?.all || served.pageOptions[message.route]) {
                      content2 = this.injectPageCode(content2.toString(), message.route, served);
                    }
                    response.end(content2, "utf-8", () => {
                      reject(error.code);
                    });
                  }
                } else {
                  response.writeHead(500);
                  response.end("Something went wrong: " + error.code + " ..\n", "utf-8", () => {
                    reject(error.code);
                  });
                }
              } else {
                var extname2 = String(path.extname(requestURL)).toLowerCase();
                var contentType = this.mimeTypes[extname2] || "application/octet-stream";
                if (contentType === "text/html" && (served.pageOptions?.all || served.pageOptions[message.route])) {
                  content = this.injectPageCode(content.toString(), message.route, served);
                }
                response.writeHead(200, { "Content-Type": contentType });
                response.end(content, "utf-8", () => {
                  resolve(content);
                });
              }
            });
          } else if (message.route) {
            let route = this.routes[message.route];
            if (!route) {
              route = this.routes[request.url];
            }
            if (route) {
              let res;
              if (message.method) {
                res = this.handleMethod(message.route, message.method, message.args, message.origin);
              } else
                res = this.handleServiceMessage(message);
              if (res instanceof Promise)
                res.then((r) => {
                  if (served.keepState)
                    this.setState({ [served.address]: res });
                  this.withResult(response, r, message);
                  resolve(res);
                });
              else if (res) {
                if (served.keepState)
                  this.setState({ [served.address]: res });
                this.withResult(response, res, message);
                resolve(res);
              }
            } else
              getFailed();
          } else
            getFailed();
        } else {
          let body = [];
          request.on("data", (chunk) => {
            body.push(chunk);
          }).on("end", () => {
            body = Buffer.concat(body).toString();
            if (typeof body === "string") {
              if (body.includes("{") || body.includes("["))
                body = JSON.parse(body);
            }
            let route, method3, args, origin;
            if (body?.route) {
              route = this.routes[body.route];
              method3 = body.method;
              args = body.args;
              origin = body.origin;
              if (!route) {
                if (typeof body.route === "string") {
                  if (body.route.includes("/") && body.route.length > 1)
                    body.route = body.route.split("/").pop();
                }
                route = this.routes[body.route];
              }
            }
            if (!route) {
              if (message?.route) {
                let route2 = this.routes[message.route];
                method3 = message.method;
                args = message.args;
                origin = message.origin;
                if (!route2) {
                  if (typeof message.route === "string") {
                    if (message.route.includes("/") && message.route.length > 1)
                      message.route = message.route.split("/").pop();
                  }
                  route2 = this.routes[message.route];
                }
              }
            }
            let res = body;
            if (route) {
              if (body.method) {
                res = this.handleMethod(route, method3, args, origin);
              } else
                res = this.handleServiceMessage({ route, args, method: method3, origin });
              if (res instanceof Promise)
                res.then((r) => {
                  this.withResult(response, r, message);
                  if (served.keepState)
                    this.setState({ [served.address]: res });
                  resolve(res);
                });
              else {
                this.withResult(response, res, message);
                if (served.keepState)
                  this.setState({ [served.address]: res });
                resolve(res);
              }
            } else if (!response.writableEnded || !response.destroyed) {
              response.statusCode = 200;
              response.end(void 0, void 0, () => {
                resolve(res);
              });
            } else
              resolve(res);
          });
        }
      }).catch((er) => {
        console.error("Request Error:", er);
      });
      return result;
    };
    this.request = (options, send, ondata, onend) => {
      let client = http;
      if (options.protocol?.includes("https")) {
        client = https;
      }
      delete options.protocol;
      const req = client.request(options, (res) => {
        if (ondata)
          res.on("data", ondata);
        if (onend)
          res.on("end", onend);
      });
      if (options.headers) {
        for (const head in options.headers) {
          req.setHeader(head, options.headers[head]);
        }
      }
      if (send)
        req.write(send);
      req.end();
      return req;
    };
    this.post = (url, data, headers) => {
      let urlstring = url;
      if (urlstring instanceof URL)
        urlstring = url.toString();
      let protocol = urlstring.startsWith("https") ? "https" : "http";
      let host, port, path2;
      let split = urlstring.split("/");
      split.forEach((s) => {
        if (s.includes(":")) {
          let ss = s.split(":");
          host = ss[0];
          port = ss[1];
        }
      });
      if (split.length > 3) {
        path2 = split.slice(3).join("/");
      }
      let req = this.request({
        protocol,
        host,
        port,
        path: path2,
        method: "POST",
        headers
      }, data);
      return req;
    };
    this.get = (url) => {
      return new Promise((resolve, reject) => {
        let client = http;
        let urlstring = url;
        if (url instanceof URL)
          urlstring = url.toString();
        if (urlstring.includes("https")) {
          client = https;
        }
        client.get(url, (resp) => {
          let chunks = [];
          resp.on("data", (chunk) => {
            chunks.push(chunk);
          });
          resp.on("end", () => {
            resolve(Buffer.concat(chunks));
          });
        }).on("error", (err) => {
          reject(err);
        });
      });
    };
    this.terminate = (served) => {
      if (typeof served === "string")
        served = this.servers[served];
      if (typeof served === "object") {
        served.server.close();
      }
    };
    this.addPage = (path2, template) => {
      if (typeof template === "string") {
        if (!template.includes("<html"))
          template = "<!DOCTYPE html><html>" + template + "</html>";
      }
      if (typeof this.routes[path2] === "object")
        this.routes[path2].get = template;
      else
        this.load({
          [path2]: {
            get: template
          }
        });
    };
    this.addHTML = (path2, template) => {
      if (typeof template === "string") {
        if (!template.includes("<") || !template.includes(">"))
          template = "<div>" + template + "</div>";
      }
      if (typeof this.routes[path2] === "object")
        this.routes[path2].get = template;
      else
        this.load({
          [path2]: {
            get: template
          }
        });
    };
    this.buildPage = (pageStructure, baseTemplate) => {
      let result = ``;
      if (baseTemplate)
        result += baseTemplate;
      let appendTemplate = (obj, r, res) => {
        if (typeof obj[r] === "object") {
          for (const key in obj) {
            appendTemplate(obj, key, res);
          }
        } else if (this.routes[r]?.get) {
          let toAdd = this.routes[r].get;
          if (typeof toAdd === "function")
            toAdd = toAdd(obj[r]);
          if (typeof toAdd === "string") {
            let lastDiv = res.lastIndexOf("<");
            if (lastDiv > 0) {
              let end = res.substring(lastDiv);
              res = res.substring(0, lastDiv) + toAdd + end;
            }
            res += toAdd;
          }
        } else if (typeof this.routes[r] === "function") {
          let routeresult = this.routes[r](obj[r]);
          if (typeof routeresult === "string") {
            let lastDiv = res.lastIndexOf("<");
            if (lastDiv > 0) {
              let end = res.substring(lastDiv);
              res = res.substring(0, lastDiv) + routeresult + end;
            } else
              res += routeresult;
          }
        } else if (typeof this.routes[r] === "string")
          res += this.routes[r];
        return res;
      };
      if (Array.isArray(pageStructure)) {
        pageStructure.forEach((r) => {
          result = appendTemplate(pageStructure, r, result);
        });
      } else if (typeof pageStructure === "object") {
        for (const r in pageStructure) {
          result = appendTemplate(pageStructure, r, result);
        }
      } else if (typeof pageStructure === "string")
        result += pageStructure;
      else if (typeof pageStructure === "function")
        result += pageStructure();
      return result;
    };
    this.routes = {
      setupServer: this.setupServer,
      terminate: (path2) => {
        for (const address in this.servers) {
          if (address.includes(`${path2}`)) {
            this.terminate(this.servers[address]);
            delete this.servers[address];
          }
        }
      },
      GET: this.get,
      POST: this.post,
      addPage: this.addPage,
      addHTML: this.addHTML,
      buildPage: this.buildPage,
      getRequestBody: this.getRequestBody,
      hotreload: (socketURL = `http://localhost:8080/wss`) => {
        if (socketURL instanceof URL)
          socketURL = socketURL.toString();
        const HotReloadClient = (url = `http://localhost:8080/wss`) => {
          let socket = new WebSocket(url);
          socket.addEventListener("close", () => {
            const interAttemptTimeoutMilliseconds = 100;
            const maxDisconnectedTimeMilliseconds = 3e3;
            const maxAttempts = Math.round(maxDisconnectedTimeMilliseconds / interAttemptTimeoutMilliseconds);
            let attempts = 0;
            const reloadIfCanConnect = () => {
              attempts++;
              if (attempts > maxAttempts) {
                console.error("Could not reconnect to dev server.");
                return;
              }
              socket = new WebSocket(url);
              socket.onerror = (er) => {
                console.error(`Hot reload port disconnected, will reload on reconnected. Attempt ${attempts} of ${maxAttempts}`);
              };
              socket.addEventListener("error", () => {
                setTimeout(reloadIfCanConnect, interAttemptTimeoutMilliseconds);
              });
              socket.addEventListener("open", () => {
                location.reload();
              });
            };
            reloadIfCanConnect();
          });
        };
        return `
                <script>
                    console.log('Hot Reload port available at ${socketURL}');  
                    (` + HotReloadClient.toString() + `)('${socketURL}') 
                <\/script>
            `;
      },
      pwa: (serviceWorkerPath, manifestPath) => {
      }
    };
    if (settings) {
      if (settings.protocol === "https") {
        this.setupHTTPSserver(settings);
      } else
        this.setupHTTPserver(settings);
    }
  }
  getRequestBody(req) {
    let chunks = [];
    return new Promise((resolve, reject) => {
      req.on("data", (chunk) => {
        chunks.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(chunks));
      }).on("error", (er) => {
        reject(er);
      });
    });
  }
};

// ../../services/sse/SSE.node.ts
var import_better_sse = __toESM(require_build(), 1);
var SSEbackend = class extends Service {
  constructor(routes, name) {
    super(routes, name);
    this.name = "sse";
    this.eventsources = {};
    this.setupSSE = (options) => {
      const server = options.server;
      let path2 = options.path;
      if (this.eventsources[path2]) {
        return false;
      }
      const channel = (0, import_better_sse.createChannel)();
      let sse = {
        channel,
        sessions: {},
        ...options
      };
      this.eventsources[path2] = sse;
      let onRequest = (req, res) => {
        if (req.method === "GET" && req.url.includes(path2)) {
          console.log("SSE Request", path2);
          (0, import_better_sse.createSession)(req, res).then((session) => {
            channel.register(session);
            sse.sessions[`sse${Math.floor(Math.random() * 1e15)}`] = session;
            if (sse.onconnection) {
              sse.onconnection(session, sse, req, res);
            }
          });
        }
      };
      let requestListeners = server.listeners("request");
      server.removeAllListeners("request");
      const otherListeners = (req, res) => {
        requestListeners.forEach((l) => {
          l(req, res);
        });
      };
      const sseListener = (req, res) => {
        if (req.url.indexOf(path2) > -1) {
          if (!this.eventsources[path2]) {
            server.removeListener("request", sseListener);
            server.addListener("request", otherListeners);
          }
          onRequest(req, res);
        } else
          otherListeners(req, res);
      };
      server.addListener("request", sseListener);
      server.addListener("close", () => {
        if (sse.onclose)
          sse.onclose(sse);
      });
      return sse;
    };
    this.transmit = (data, path2, channel) => {
      if (typeof data === "object") {
        if (data.route) {
          if (!path2) {
            let keys = Object.keys(this.eventsources);
            if (keys.length > 0) {
              let evs = this.eventsources[keys[0]];
              if (evs.channels.includes(data.route)) {
                path2 = evs.path;
                channel = data.route;
              } else if (evs.channels.includes(data.origin)) {
                path2 = evs.path;
                channel = data.origin;
              }
            }
            if (!path2 && data.route) {
              if (this.eventsources[data.route])
                path2 = data.route;
            }
            if (!path2 && typeof data.origin === "string") {
              if (this.eventsources[data.origin])
                path2 = data.origin;
            }
          }
        }
        data = JSON.stringify(data);
      }
      if (!path2)
        path2 = Object.keys(this.eventsources)[0];
      if (path2 && channel) {
        this.eventsources[path2].channel.broadcast(data, channel);
      } else if (path2) {
        let sessions = this.eventsources[path2].sessions;
        for (const s in sessions) {
          if (sessions[s].isConnected)
            sessions[s].push(data);
          else {
            if (this.eventsources[path2].onsessionclose)
              this.eventsources[path2].onsessionclose(sessions[s], this.eventsources[path2]);
            delete sessions[s];
          }
        }
      }
    };
    this.terminate = (path2) => {
      if (typeof path2 === "object")
        delete this.eventsources[path2.path];
      else if (typeof path2 === "string")
        delete this.eventsources[path2];
    };
    this.routes = {
      setupSSE: this.setupSSE,
      terminate: this.terminate
    };
  }
};

// ../../node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);
var wrapper_default = import_websocket.default;

// ../../services/wss/WSS.node.ts
var WSSbackend = class extends Service {
  constructor(routes, name) {
    super(routes, name);
    this.name = "wss";
    this.debug = false;
    this.socketservers = {};
    this.sockets = {};
    this.setupWSS = (options) => {
      const host = options.host;
      const port = options.port;
      let path2 = options.path;
      const server = options.server;
      delete options.server;
      if (!("keepState" in options))
        options.keepState = true;
      let opts = {
        host,
        port
      };
      if (typeof options.serverOptions)
        Object.assign(opts, options.serverOptions);
      const wss = new import_websocket_server.default(opts);
      let address = `${host}:${port}/`;
      if (path2) {
        if (path2.startsWith("/"))
          path2 = path2.substring(1);
        address += path2;
      }
      this.socketservers[address] = {
        wss,
        clients: {},
        address,
        ...options
      };
      wss.on("connection", (ws, request) => {
        if (this.debug)
          console.log(`New socket connection on ${address}`);
        if (options.onconnection)
          options.onconnection(ws, request, this.socketservers[address]);
        if (!options.onmessage)
          options.onmessage = (data) => {
            const result = this.receive(data, wss, this.socketservers[address]);
            if (options.keepState)
              this.setState({ [address]: result });
          };
        if (options.onmessage)
          ws.on("message", (data) => {
            options.onmessage(data, ws, this.socketservers[address]);
          });
        if (options.onconnectionclosed)
          ws.on("close", (code, reason) => {
            if (options.onconnectionclosed)
              options.onconnectionclosed(code, reason, ws, this.socketservers[address]);
          });
        let clientId = `socket${Math.floor(Math.random() * 1e12)}`;
        this.socketservers[address].clients[clientId] = ws;
      });
      wss.on("error", (err) => {
        if (this.debug)
          console.log("Socket Error:", err);
        if (options.onerror)
          options.onerror(err, wss, this.socketservers[address]);
        else
          console.error(err);
      });
      let onUpgrade = (request, socket, head) => {
        if (this.debug)
          console.log("Upgrade request at: ", request.url);
        let addr = request.headers.host.split(":")[0];
        addr += ":" + port;
        addr += request.url.split("?")[0];
        if (addr === address && this.socketservers[addr]) {
          this.socketservers[addr].wss.handleUpgrade(request, socket, head, (ws) => {
            this.socketservers[addr].wss.emit("connection", ws, request);
          });
        }
      };
      server.addListener("upgrade", onUpgrade);
      wss.on("close", () => {
        server.removeListener("upgrade", onUpgrade);
        if (options.onclose)
          options.onclose(wss, this.socketservers[address]);
        else
          console.log(`wss closed: ${address}`);
      });
      return this.socketservers[address];
    };
    this.openWS = (options) => {
      let protocol = options.protocol;
      if (!protocol)
        protocol = "wss";
      let address = `${protocol}://${options.host}`;
      if (options.port)
        address += ":" + options.port;
      if (!options.path || options.path?.startsWith("/"))
        address += "/";
      if (options.path)
        address += options.path;
      const socket = new wrapper_default(address);
      if (!("keepState" in options))
        options.keepState = true;
      if (options.onmessage)
        socket.on("message", (data) => {
          options.onmessage(data, socket, this.sockets[address]);
        });
      else
        socket.on("message", (data) => {
          const result = this.receive(data, socket, this.sockets[address]);
          if (options.keepState)
            this.setState({ [address]: result });
        });
      if (options.onopen)
        socket.on("open", () => {
          options.onopen(socket, this.sockets[address]);
        });
      if (options.onclose)
        socket.on("close", (code, reason) => {
          options.onclose(code, reason, socket, this.sockets[address]);
        });
      if (options.onerror)
        socket.on("error", (er) => {
          options.onerror(er, socket, this.sockets[address]);
        });
      this.sockets[address] = {
        socket,
        address,
        ...options
      };
      return socket;
    };
    this.transmit = (message, ws) => {
      if (typeof message === "object")
        message = JSON.stringify(message);
      if (!ws) {
        let served = this.socketservers[Object.keys(this.socketservers)[0]];
        if (served)
          ws = served.wss;
        else {
          let s = this.sockets[Object.keys(this.sockets)[0]];
          if (s)
            ws = s.socket;
        }
        ;
      }
      if (ws instanceof import_websocket_server.default) {
        ws.clients.forEach((c) => {
          c.send(message);
        });
      } else if (ws instanceof wrapper_default)
        ws.send(message);
    };
    this.closeWS = (ws) => {
      if (!ws) {
        let s = this.sockets[Object.keys(this.sockets)[0]];
        if (s)
          ws = s.socket;
      } else if (typeof ws === "string") {
        for (const k in this.sockets) {
          if (k.includes(ws)) {
            ws = this.sockets[k].socket;
            break;
          }
        }
      }
      if (ws instanceof wrapper_default) {
        if (ws.readyState === ws.OPEN)
          ws.close();
      }
    };
    this.terminate = (ws) => {
      if (!ws) {
        let served = this.socketservers[Object.keys(this.socketservers)[0]];
        if (served)
          ws = served.wss;
      } else if (typeof ws === "string") {
        for (const k in this.socketservers) {
          if (k.includes(ws)) {
            ws = this.socketservers[k].wss;
            break;
          }
        }
        if (!ws) {
          for (const k in this.sockets) {
            if (k.includes(ws)) {
              ws = this.sockets[k].socket;
              break;
            }
          }
        }
      }
      if (ws instanceof import_websocket_server.default)
        ws.close((er) => {
          if (er)
            console.error(er);
        });
      else if (ws instanceof wrapper_default) {
        if (ws.readyState === ws.OPEN)
          ws.close();
      }
    };
    this.routes = {
      setupWSS: this.setupWSS,
      openWS: this.openWS,
      closeWS: this.closeWS,
      terminate: (path2) => {
        if (path2) {
          for (const address in this.socketservers) {
            if (address.includes(path2)) {
              this.terminate(this.socketservers[address].wss);
              delete this.socketservers[address];
            }
          }
        } else {
          path2 = Object.keys(this.socketservers)[0];
          this.terminate(this.socketservers[path2].wss);
          delete this.socketservers[path2];
        }
      }
    };
  }
};

// server.ts
function exitHandler(options, exitCode) {
  if (exitCode || exitCode === 0)
    console.log("SERVER EXITED WITH CODE: ", exitCode);
  if (options.exit)
    process.exit();
}
process.on("exit", exitHandler.bind(null, { cleanup: true }));
process.on("SIGINT", exitHandler.bind(null, { exit: true }));
var router = new UserRouter([
  HTTPbackend,
  WSSbackend,
  SSEbackend
]);
router.run("http/setupServer", {
  protocol: "http",
  host: "localhost",
  port: 8080,
  startpage: "index.html",
  pageOptions: {
    all: {
      inject: {
        hotreload: "ws://localhost:8080/hotreload"
      }
    }
  }
}).then((served) => {
  const socketserver = router.run("wss/setupWSS", {
    server: served.server,
    host: served.host,
    port: 8081,
    path: "wss",
    onconnection: (ws) => {
      ws.send("Hello from WSS!");
    }
  });
  const hotreload = router.run("wss/setupWSS", {
    server: served.server,
    host: served.host,
    port: 7e3,
    path: "hotreload",
    onconnection: (ws) => {
      ws.send("Hot reload port opened!");
    }
  });
  const sseinfo = router.run("sse/setupSSE", {
    server: served.server,
    path: "sse",
    channels: ["test"],
    onconnection: (session, sseinfo2, req, res) => {
      console.log("pushing sse!");
      session.push("Hello from SSE!");
      sseinfo2.channels.forEach((c) => sseinfo2.channel.broadcast("SSE connection at " + req.headers.host + "/" + req.url, c));
    }
  });
});
console.log("main service routes", router.service.routes);
console.log("http service routes", router.services.http.routes);
var sub1 = router.pipe("ping", "log", "wss");
var sub2 = router.pipe("ping", "log", "sse");
