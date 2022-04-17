/*! For license information please see datastreams.js.LICENSE.txt */
!(function(t, e) {
  'object' == typeof exports && 'object' == typeof module
    ? (module.exports = e())
    : 'function' == typeof define && define.amd
    ? define([], e)
    : 'object' == typeof exports
    ? (exports.datastreams = e())
    : (t.datastreams = e());
})(self, function() {
  return (() => {
    'use strict';
    var __webpack_modules__ = {
        4139: (t, e, n) => {
          Object.defineProperty(e, '__esModule', { value: !0 });
          var r = n(1717);
          function i(t) {
            for (var e = [], n = 0; n < t.length; n++) n % 3 == 0 ? e.push((t[n] << 4) | (t[n + 1] >> 4)) : (e.push(((15 & t[n]) << 8) | t[n + 1]), n++);
            return e;
          }
          function o(t, e) {
            function n(n) {
              return { x: e * t.getInt16(n), y: e * t.getInt16(n + 2), z: e * t.getInt16(n + 4) };
            }
            return { sequenceId: t.getUint16(0), samples: [n(2), n(8), n(14)] };
          }
          (e.parseControl = function(t) {
            return t.pipe(
              r.concatMap(function(t) {
                return t.split('');
              }),
              r.scan(function(t, e) {
                return t.indexOf('}') >= 0 ? e : t + e;
              }, ''),
              r.filter(function(t) {
                return t.indexOf('}') >= 0;
              }),
              r.map(function(t) {
                return JSON.parse(t);
              })
            );
          }),
            (e.decodeUnsigned12BitData = i),
            (e.decodeEEGSamples = function(t) {
              return i(t).map(function(t) {
                return 0.48828125 * (t - 2048);
              });
            }),
            (e.parseTelemetry = function(t) {
              return { sequenceId: t.getUint16(0), batteryLevel: t.getUint16(2) / 512, fuelGaugeVoltage: 2.2 * t.getUint16(4), temperature: t.getUint16(8) };
            }),
            (e.parseAccelerometer = function(t) {
              return o(t, 610352e-10);
            }),
            (e.parseGyroscope = function(t) {
              return o(t, 0.0074768);
            });
        },
        7338: function(t, e, n) {
          var r =
              (this && this.__awaiter) ||
              function(t, e, n, r) {
                return new (n || (n = Promise))(function(i, o) {
                  function s(t) {
                    try {
                      u(r.next(t));
                    } catch (t) {
                      o(t);
                    }
                  }
                  function c(t) {
                    try {
                      u(r.throw(t));
                    } catch (t) {
                      o(t);
                    }
                  }
                  function u(t) {
                    t.done
                      ? i(t.value)
                      : new n(function(e) {
                          e(t.value);
                        }).then(s, c);
                  }
                  u((r = r.apply(t, e || [])).next());
                });
              },
            i =
              (this && this.__generator) ||
              function(t, e) {
                var n,
                  r,
                  i,
                  o,
                  s = {
                    label: 0,
                    sent: function() {
                      if (1 & i[0]) throw i[1];
                      return i[1];
                    },
                    trys: [],
                    ops: [],
                  };
                return (
                  (o = { next: c(0), throw: c(1), return: c(2) }),
                  'function' == typeof Symbol &&
                    (o[Symbol.iterator] = function() {
                      return this;
                    }),
                  o
                );
                function c(o) {
                  return function(c) {
                    return (function(o) {
                      if (n) throw new TypeError('Generator is already executing.');
                      for (; s; )
                        try {
                          if (((n = 1), r && (i = 2 & o[0] ? r.return : o[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done)) return i;
                          switch (((r = 0), i && (o = [2 & o[0], i.value]), o[0])) {
                            case 0:
                            case 1:
                              i = o;
                              break;
                            case 4:
                              return s.label++, { value: o[1], done: !1 };
                            case 5:
                              s.label++, (r = o[1]), (o = [0]);
                              continue;
                            case 7:
                              (o = s.ops.pop()), s.trys.pop();
                              continue;
                            default:
                              if (!((i = (i = s.trys).length > 0 && i[i.length - 1]) || (6 !== o[0] && 2 !== o[0]))) {
                                s = 0;
                                continue;
                              }
                              if (3 === o[0] && (!i || (o[1] > i[0] && o[1] < i[3]))) {
                                s.label = o[1];
                                break;
                              }
                              if (6 === o[0] && s.label < i[1]) {
                                (s.label = i[1]), (i = o);
                                break;
                              }
                              if (i && s.label < i[2]) {
                                (s.label = i[2]), s.ops.push(o);
                                break;
                              }
                              i[2] && s.ops.pop(), s.trys.pop();
                              continue;
                          }
                          o = e.call(t, s);
                        } catch (t) {
                          (o = [6, t]), (r = 0);
                        } finally {
                          n = i = 0;
                        }
                      if (5 & o[0]) throw o[1];
                      return { value: o[0] ? o[1] : void 0, done: !0 };
                    })([o, c]);
                  };
                }
              };
          Object.defineProperty(e, '__esModule', { value: !0 });
          var o = n(4143),
            s = n(1717);
          (e.decodeResponse = function(t) {
            return new TextDecoder().decode(t.subarray(1, 1 + t[0]));
          }),
            (e.encodeCommand = function(t) {
              var e = new TextEncoder().encode('X' + t + '\n');
              return (e[0] = e.length - 1), e;
            }),
            (e.observableCharacteristic = function(t) {
              return r(this, void 0, void 0, function() {
                var e;
                return i(this, function(n) {
                  switch (n.label) {
                    case 0:
                      return [4, t.startNotifications()];
                    case 1:
                      return (
                        n.sent(),
                        (e = o.fromEvent(t.service.device, 'gattserverdisconnected')),
                        [
                          2,
                          o.fromEvent(t, 'characteristicvaluechanged').pipe(
                            s.takeUntil(e),
                            s.map(function(t) {
                              return t.target.value;
                            })
                          ),
                        ]
                      );
                  }
                });
              });
            });
        },
        1335: (t, e, n) => {
          Object.defineProperty(e, '__esModule', { value: !0 });
          var r = n(4143),
            i = n(1717),
            o = n(2306);
          e.zipSamples = function(t) {
            var e = [],
              n = null;
            return t.pipe(
              i.mergeMap(function(t) {
                if (t.timestamp !== n && ((n = t.timestamp), e.length)) {
                  var i = r.from([e.slice()]);
                  return e.splice(0, e.length, t), i;
                }
                return e.push(t), r.from([]);
              }),
              i.concat(r.from([e])),
              i.mergeMap(function(t) {
                var e = t[0].samples.map(function(e, n) {
                  for (var r = [NaN, NaN, NaN, NaN, NaN], i = 0, s = t; i < s.length; i++) {
                    var c = s[i];
                    r[c.electrode] = c.samples[n];
                  }
                  return { data: r, index: t[0].index, timestamp: t[0].timestamp + (1e3 * n) / o.EEG_FREQUENCY };
                });
                return r.from(e);
              })
            );
          };
        },
        2306: function(t, e, n) {
          var r =
              (this && this.__awaiter) ||
              function(t, e, n, r) {
                return new (n || (n = Promise))(function(i, o) {
                  function s(t) {
                    try {
                      u(r.next(t));
                    } catch (t) {
                      o(t);
                    }
                  }
                  function c(t) {
                    try {
                      u(r.throw(t));
                    } catch (t) {
                      o(t);
                    }
                  }
                  function u(t) {
                    t.done
                      ? i(t.value)
                      : new n(function(e) {
                          e(t.value);
                        }).then(s, c);
                  }
                  u((r = r.apply(t, e || [])).next());
                });
              },
            i =
              (this && this.__generator) ||
              function(t, e) {
                var n,
                  r,
                  i,
                  o,
                  s = {
                    label: 0,
                    sent: function() {
                      if (1 & i[0]) throw i[1];
                      return i[1];
                    },
                    trys: [],
                    ops: [],
                  };
                return (
                  (o = { next: c(0), throw: c(1), return: c(2) }),
                  'function' == typeof Symbol &&
                    (o[Symbol.iterator] = function() {
                      return this;
                    }),
                  o
                );
                function c(o) {
                  return function(c) {
                    return (function(o) {
                      if (n) throw new TypeError('Generator is already executing.');
                      for (; s; )
                        try {
                          if (((n = 1), r && (i = 2 & o[0] ? r.return : o[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done)) return i;
                          switch (((r = 0), i && (o = [2 & o[0], i.value]), o[0])) {
                            case 0:
                            case 1:
                              i = o;
                              break;
                            case 4:
                              return s.label++, { value: o[1], done: !1 };
                            case 5:
                              s.label++, (r = o[1]), (o = [0]);
                              continue;
                            case 7:
                              (o = s.ops.pop()), s.trys.pop();
                              continue;
                            default:
                              if (!((i = (i = s.trys).length > 0 && i[i.length - 1]) || (6 !== o[0] && 2 !== o[0]))) {
                                s = 0;
                                continue;
                              }
                              if (3 === o[0] && (!i || (o[1] > i[0] && o[1] < i[3]))) {
                                s.label = o[1];
                                break;
                              }
                              if (6 === o[0] && s.label < i[1]) {
                                (s.label = i[1]), (i = o);
                                break;
                              }
                              if (i && s.label < i[2]) {
                                (s.label = i[2]), s.ops.push(o);
                                break;
                              }
                              i[2] && s.ops.pop(), s.trys.pop();
                              continue;
                          }
                          o = e.call(t, s);
                        } catch (t) {
                          (o = [6, t]), (r = 0);
                        } finally {
                          n = i = 0;
                        }
                      if (5 & o[0]) throw o[1];
                      return { value: o[0] ? o[1] : void 0, done: !0 };
                    })([o, c]);
                  };
                }
              };
          Object.defineProperty(e, '__esModule', { value: !0 });
          var o = n(4143),
            s = n(1717),
            c = n(4139),
            u = n(7338),
            a = n(1335);
          (e.zipSamples = a.zipSamples), (e.MUSE_SERVICE = 65165);
          var h = [
            '273e0003-4c4d-454d-96be-f03bac821358',
            '273e0004-4c4d-454d-96be-f03bac821358',
            '273e0005-4c4d-454d-96be-f03bac821358',
            '273e0006-4c4d-454d-96be-f03bac821358',
            '273e0007-4c4d-454d-96be-f03bac821358',
          ];
          (e.EEG_FREQUENCY = 256), (e.channelNames = ['TP9', 'AF7', 'AF8', 'TP10', 'AUX']);
          var l = (function() {
            function t() {
              (this.enableAux = !1),
                (this.deviceName = ''),
                (this.connectionStatus = new o.BehaviorSubject(!1)),
                (this.gatt = null),
                (this.lastIndex = null),
                (this.lastTimestamp = null);
            }
            return (
              (t.prototype.connect = function(t) {
                return r(this, void 0, void 0, function() {
                  var n,
                    r,
                    a,
                    l,
                    f,
                    d,
                    p,
                    b,
                    v,
                    y,
                    m,
                    w,
                    g,
                    _,
                    x,
                    S,
                    T = this;
                  return i(this, function(E) {
                    switch (E.label) {
                      case 0:
                        return t ? ((this.gatt = t), [3, 4]) : [3, 1];
                      case 1:
                        return [4, navigator.bluetooth.requestDevice({ filters: [{ services: [e.MUSE_SERVICE] }] })];
                      case 2:
                        return (n = E.sent()), (r = this), [4, n.gatt.connect()];
                      case 3:
                        (r.gatt = E.sent()), (E.label = 4);
                      case 4:
                        return (this.deviceName = this.gatt.device.name || null), [4, this.gatt.getPrimaryService(e.MUSE_SERVICE)];
                      case 5:
                        return (
                          (a = E.sent()),
                          o
                            .fromEvent(this.gatt.device, 'gattserverdisconnected')
                            .pipe(s.first())
                            .subscribe(function() {
                              (T.gatt = null), T.connectionStatus.next(!1);
                            }),
                          (l = this),
                          [4, a.getCharacteristic('273e0001-4c4d-454d-96be-f03bac821358')]
                        );
                      case 6:
                        return (l.controlChar = E.sent()), (f = this), [4, u.observableCharacteristic(this.controlChar)];
                      case 7:
                        return (
                          (f.rawControlData = E.sent().pipe(
                            s.map(function(t) {
                              return u.decodeResponse(new Uint8Array(t.buffer));
                            }),
                            s.share()
                          )),
                          (this.controlResponses = c.parseControl(this.rawControlData)),
                          [4, a.getCharacteristic('273e000b-4c4d-454d-96be-f03bac821358')]
                        );
                      case 8:
                        return (d = E.sent()), (p = this), [4, u.observableCharacteristic(d)];
                      case 9:
                        return (p.telemetryData = E.sent().pipe(s.map(c.parseTelemetry))), [4, a.getCharacteristic('273e0009-4c4d-454d-96be-f03bac821358')];
                      case 10:
                        return (b = E.sent()), (v = this), [4, u.observableCharacteristic(b)];
                      case 11:
                        return (v.gyroscopeData = E.sent().pipe(s.map(c.parseGyroscope))), [4, a.getCharacteristic('273e000a-4c4d-454d-96be-f03bac821358')];
                      case 12:
                        return (y = E.sent()), (m = this), [4, u.observableCharacteristic(y)];
                      case 13:
                        (m.accelerometerData = E.sent().pipe(s.map(c.parseAccelerometer))),
                          (this.eventMarkers = new o.Subject()),
                          (this.eegCharacteristics = []),
                          (w = []),
                          (g = this.enableAux ? h.length : 4),
                          (_ = function(t) {
                            var e, n, r, o;
                            return i(this, function(i) {
                              switch (i.label) {
                                case 0:
                                  return (e = h[t]), [4, a.getCharacteristic(e)];
                                case 1:
                                  return (n = i.sent()), (o = (r = w).push), [4, u.observableCharacteristic(n)];
                                case 2:
                                  return (
                                    o.apply(r, [
                                      i.sent().pipe(
                                        s.map(function(e) {
                                          var n = e.getUint16(0);
                                          return { electrode: t, index: n, samples: c.decodeEEGSamples(new Uint8Array(e.buffer).subarray(2)), timestamp: T.getTimestamp(n) };
                                        })
                                      ),
                                    ]),
                                    x.eegCharacteristics.push(n),
                                    [2]
                                  );
                              }
                            });
                          }),
                          (x = this),
                          (S = 0),
                          (E.label = 14);
                      case 14:
                        return S < g ? [5, _(S)] : [3, 17];
                      case 15:
                        E.sent(), (E.label = 16);
                      case 16:
                        return S++, [3, 14];
                      case 17:
                        return (this.eegReadings = o.merge.apply(void 0, w)), this.connectionStatus.next(!0), [2];
                    }
                  });
                });
              }),
              (t.prototype.sendCommand = function(t) {
                return r(this, void 0, void 0, function() {
                  return i(this, function(e) {
                    switch (e.label) {
                      case 0:
                        return [4, this.controlChar.writeValue(u.encodeCommand(t))];
                      case 1:
                        return e.sent(), [2];
                    }
                  });
                });
              }),
              (t.prototype.start = function() {
                return r(this, void 0, void 0, function() {
                  var t;
                  return i(this, function(e) {
                    switch (e.label) {
                      case 0:
                        return [4, this.pause()];
                      case 1:
                        return e.sent(), (t = this.enableAux ? 'p20' : 'p21'), [4, this.controlChar.writeValue(u.encodeCommand(t))];
                      case 2:
                        return e.sent(), [4, this.controlChar.writeValue(u.encodeCommand('s'))];
                      case 3:
                        return e.sent(), [4, this.resume()];
                      case 4:
                        return e.sent(), [2];
                    }
                  });
                });
              }),
              (t.prototype.pause = function() {
                return r(this, void 0, void 0, function() {
                  return i(this, function(t) {
                    switch (t.label) {
                      case 0:
                        return [4, this.sendCommand('h')];
                      case 1:
                        return t.sent(), [2];
                    }
                  });
                });
              }),
              (t.prototype.resume = function() {
                return r(this, void 0, void 0, function() {
                  return i(this, function(t) {
                    switch (t.label) {
                      case 0:
                        return [4, this.sendCommand('d')];
                      case 1:
                        return t.sent(), [2];
                    }
                  });
                });
              }),
              (t.prototype.deviceInfo = function() {
                return r(this, void 0, void 0, function() {
                  var t;
                  return i(this, function(e) {
                    switch (e.label) {
                      case 0:
                        return (
                          (t = this.controlResponses
                            .pipe(
                              s.filter(function(t) {
                                return !!t.fw;
                              }),
                              s.take(1)
                            )
                            .toPromise()),
                          [4, this.sendCommand('v1')]
                        );
                      case 1:
                        return e.sent(), [2, t];
                    }
                  });
                });
              }),
              (t.prototype.injectMarker = function(t, e) {
                return (
                  void 0 === e && (e = new Date().getTime()),
                  r(this, void 0, void 0, function() {
                    return i(this, function(n) {
                      switch (n.label) {
                        case 0:
                          return [4, this.eventMarkers.next({ value: t, timestamp: e })];
                        case 1:
                          return n.sent(), [2];
                      }
                    });
                  })
                );
              }),
              (t.prototype.disconnect = function() {
                this.gatt && ((this.lastIndex = null), (this.lastTimestamp = null), this.gatt.disconnect(), this.connectionStatus.next(!1));
              }),
              (t.prototype.getTimestamp = function(t) {
                var n = (1 / e.EEG_FREQUENCY) * 1e3 * 12;
                for (
                  (null !== this.lastIndex && null !== this.lastTimestamp) || ((this.lastIndex = t), (this.lastTimestamp = new Date().getTime() - n));
                  this.lastIndex - t > 4096;

                )
                  t += 65536;
                return t === this.lastIndex
                  ? this.lastTimestamp
                  : t > this.lastIndex
                  ? ((this.lastTimestamp += n * (t - this.lastIndex)), (this.lastIndex = t), this.lastTimestamp)
                  : this.lastTimestamp - n * (this.lastIndex - t);
              }),
              t
            );
          })();
          e.MuseClient = l;
        },
        4143: (t, e, n) => {
          n.r(e),
            n.d(e, {
              ArgumentOutOfRangeError: () => P.W,
              AsyncSubject: () => h.c,
              BehaviorSubject: () => u.X,
              ConnectableObservable: () => i.c,
              EMPTY: () => H.E,
              EmptyError: () => V.K,
              GroupedObservable: () => o.T,
              NEVER: () => ft,
              Notification: () => k.P,
              NotificationKind: () => k.W,
              ObjectUnsubscribedError: () => L.N,
              Observable: () => r.y,
              ReplaySubject: () => a.t,
              Scheduler: () => S.b,
              Subject: () => c.xQ,
              Subscriber: () => E.L,
              Subscription: () => T.w,
              TimeoutError: () => A.W,
              UnsubscriptionError: () => O.B,
              VirtualAction: () => x,
              VirtualTimeScheduler: () => _,
              animationFrame: () => g,
              animationFrameScheduler: () => w,
              asap: () => l.e,
              asapScheduler: () => l.E,
              async: () => f.P,
              asyncScheduler: () => f.z,
              bindCallback: () => z,
              bindNodeCallback: () => W,
              combineLatest: () => K.aj,
              concat: () => G.z,
              config: () => Dt.v,
              defer: () => Q.P,
              empty: () => H.c,
              forkJoin: () => X,
              from: () => $.D,
              fromEvent: () => nt,
              fromEventPattern: () => it,
              generate: () => ot,
              identity: () => I.y,
              iif: () => ct,
              interval: () => at,
              isObservable: () => D,
              merge: () => lt.T,
              never: () => dt,
              noop: () => N.Z,
              observable: () => s.L,
              of: () => pt.of,
              onErrorResumeNext: () => bt,
              pairs: () => vt,
              partition: () => _t,
              pipe: () => C.z,
              queue: () => d.c,
              queueScheduler: () => d.N,
              race: () => xt.S3,
              range: () => St,
              scheduled: () => It.x,
              throwError: () => Et._,
              timer: () => kt.H,
              using: () => Ct,
              zip: () => Nt.$R,
            });
          var r = n(2772),
            i = n(3140),
            o = n(1120),
            s = n(5050),
            c = n(211),
            u = n(9233),
            a = n(2630),
            h = n(364),
            l = n(6650),
            f = n(964),
            d = n(2546),
            p = n(5987),
            b = n(6114),
            v = (function(t) {
              function e(e, n) {
                var r = t.call(this, e, n) || this;
                return (r.scheduler = e), (r.work = n), r;
              }
              return (
                p.ZT(e, t),
                (e.prototype.requestAsyncId = function(e, n, r) {
                  return (
                    void 0 === r && (r = 0),
                    null !== r && r > 0
                      ? t.prototype.requestAsyncId.call(this, e, n, r)
                      : (e.actions.push(this),
                        e.scheduled ||
                          (e.scheduled = requestAnimationFrame(function() {
                            return e.flush(null);
                          })))
                  );
                }),
                (e.prototype.recycleAsyncId = function(e, n, r) {
                  if ((void 0 === r && (r = 0), (null !== r && r > 0) || (null === r && this.delay > 0))) return t.prototype.recycleAsyncId.call(this, e, n, r);
                  0 === e.actions.length && (cancelAnimationFrame(n), (e.scheduled = void 0));
                }),
                e
              );
            })(b.o),
            y = n(8399),
            m = (function(t) {
              function e() {
                return (null !== t && t.apply(this, arguments)) || this;
              }
              return (
                p.ZT(e, t),
                (e.prototype.flush = function(t) {
                  (this.active = !0), (this.scheduled = void 0);
                  var e,
                    n = this.actions,
                    r = -1,
                    i = n.length;
                  t = t || n.shift();
                  do {
                    if ((e = t.execute(t.state, t.delay))) break;
                  } while (++r < i && (t = n.shift()));
                  if (((this.active = !1), e)) {
                    for (; ++r < i && (t = n.shift()); ) t.unsubscribe();
                    throw e;
                  }
                }),
                e
              );
            })(y.v),
            w = new m(v),
            g = w,
            _ = (function(t) {
              function e(e, n) {
                void 0 === e && (e = x), void 0 === n && (n = Number.POSITIVE_INFINITY);
                var r =
                  t.call(this, e, function() {
                    return r.frame;
                  }) || this;
                return (r.maxFrames = n), (r.frame = 0), (r.index = -1), r;
              }
              return (
                p.ZT(e, t),
                (e.prototype.flush = function() {
                  for (var t, e, n = this.actions, r = this.maxFrames; (e = n[0]) && e.delay <= r && (n.shift(), (this.frame = e.delay), !(t = e.execute(e.state, e.delay))); );
                  if (t) {
                    for (; (e = n.shift()); ) e.unsubscribe();
                    throw t;
                  }
                }),
                (e.frameTimeFactor = 10),
                e
              );
            })(y.v),
            x = (function(t) {
              function e(e, n, r) {
                void 0 === r && (r = e.index += 1);
                var i = t.call(this, e, n) || this;
                return (i.scheduler = e), (i.work = n), (i.index = r), (i.active = !0), (i.index = e.index = r), i;
              }
              return (
                p.ZT(e, t),
                (e.prototype.schedule = function(n, r) {
                  if ((void 0 === r && (r = 0), !this.id)) return t.prototype.schedule.call(this, n, r);
                  this.active = !1;
                  var i = new e(this.scheduler, this.work);
                  return this.add(i), i.schedule(n, r);
                }),
                (e.prototype.requestAsyncId = function(t, n, r) {
                  void 0 === r && (r = 0), (this.delay = t.frame + r);
                  var i = t.actions;
                  return i.push(this), i.sort(e.sortActions), !0;
                }),
                (e.prototype.recycleAsyncId = function(t, e, n) {
                  void 0 === n && (n = 0);
                }),
                (e.prototype._execute = function(e, n) {
                  if (!0 === this.active) return t.prototype._execute.call(this, e, n);
                }),
                (e.sortActions = function(t, e) {
                  return t.delay === e.delay ? (t.index === e.index ? 0 : t.index > e.index ? 1 : -1) : t.delay > e.delay ? 1 : -1;
                }),
                e
              );
            })(b.o),
            S = n(8725),
            T = n(8760),
            E = n(979),
            k = n(2632),
            C = n(2561),
            N = n(3306),
            I = n(3608);
          function D(t) {
            return !!t && (t instanceof r.y || ('function' == typeof t.lift && 'function' == typeof t.subscribe));
          }
          var P = n(6565),
            V = n(6929),
            L = n(1016),
            O = n(8782),
            A = n(1462),
            j = n(5709),
            Z = n(3642),
            R = n(9026),
            M = n(7507);
          function z(t, e, n) {
            if (e) {
              if (!(0, M.K)(e))
                return function() {
                  for (var r = [], i = 0; i < arguments.length; i++) r[i] = arguments[i];
                  return z(t, n)
                    .apply(void 0, r)
                    .pipe(
                      (0, j.U)(function(t) {
                        return (0, R.k)(t) ? e.apply(void 0, t) : e(t);
                      })
                    );
                };
              n = e;
            }
            return function() {
              for (var e = [], i = 0; i < arguments.length; i++) e[i] = arguments[i];
              var o,
                s = this,
                c = { context: s, subject: o, callbackFunc: t, scheduler: n };
              return new r.y(function(r) {
                if (n) {
                  var i = { args: e, subscriber: r, params: c };
                  return n.schedule(U, 0, i);
                }
                if (!o) {
                  o = new h.c();
                  try {
                    t.apply(
                      s,
                      e.concat([
                        function() {
                          for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                          o.next(t.length <= 1 ? t[0] : t), o.complete();
                        },
                      ])
                    );
                  } catch (t) {
                    (0, Z._)(o) ? o.error(t) : console.warn(t);
                  }
                }
                return o.subscribe(r);
              });
            };
          }
          function U(t) {
            var e = this,
              n = t.args,
              r = t.subscriber,
              i = t.params,
              o = i.callbackFunc,
              s = i.context,
              c = i.scheduler,
              u = i.subject;
            if (!u) {
              u = i.subject = new h.c();
              try {
                o.apply(
                  s,
                  n.concat([
                    function() {
                      for (var t = [], n = 0; n < arguments.length; n++) t[n] = arguments[n];
                      var r = t.length <= 1 ? t[0] : t;
                      e.add(c.schedule(F, 0, { value: r, subject: u }));
                    },
                  ])
                );
              } catch (t) {
                u.error(t);
              }
            }
            this.add(u.subscribe(r));
          }
          function F(t) {
            var e = t.value,
              n = t.subject;
            n.next(e), n.complete();
          }
          function W(t, e, n) {
            if (e) {
              if (!(0, M.K)(e))
                return function() {
                  for (var r = [], i = 0; i < arguments.length; i++) r[i] = arguments[i];
                  return W(t, n)
                    .apply(void 0, r)
                    .pipe(
                      (0, j.U)(function(t) {
                        return (0, R.k)(t) ? e.apply(void 0, t) : e(t);
                      })
                    );
                };
              n = e;
            }
            return function() {
              for (var e = [], i = 0; i < arguments.length; i++) e[i] = arguments[i];
              var o = { subject: void 0, args: e, callbackFunc: t, scheduler: n, context: this };
              return new r.y(function(r) {
                var i = o.context,
                  s = o.subject;
                if (n) return n.schedule(B, 0, { params: o, subscriber: r, context: i });
                if (!s) {
                  s = o.subject = new h.c();
                  try {
                    t.apply(
                      i,
                      e.concat([
                        function() {
                          for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                          var n = t.shift();
                          n ? s.error(n) : (s.next(t.length <= 1 ? t[0] : t), s.complete());
                        },
                      ])
                    );
                  } catch (t) {
                    (0, Z._)(s) ? s.error(t) : console.warn(t);
                  }
                }
                return s.subscribe(r);
              });
            };
          }
          function B(t) {
            var e = this,
              n = t.params,
              r = t.subscriber,
              i = t.context,
              o = n.callbackFunc,
              s = n.args,
              c = n.scheduler,
              u = n.subject;
            if (!u) {
              u = n.subject = new h.c();
              try {
                o.apply(
                  i,
                  s.concat([
                    function() {
                      for (var t = [], n = 0; n < arguments.length; n++) t[n] = arguments[n];
                      var r = t.shift();
                      if (r) e.add(c.schedule(q, 0, { err: r, subject: u }));
                      else {
                        var i = t.length <= 1 ? t[0] : t;
                        e.add(c.schedule(Y, 0, { value: i, subject: u }));
                      }
                    },
                  ])
                );
              } catch (t) {
                this.add(c.schedule(q, 0, { err: t, subject: u }));
              }
            }
            this.add(u.subscribe(r));
          }
          function Y(t) {
            var e = t.value,
              n = t.subject;
            n.next(e), n.complete();
          }
          function q(t) {
            var e = t.err;
            t.subject.error(e);
          }
          var K = n(5142),
            G = n(9795),
            Q = n(1410),
            H = n(5631),
            J = n(2009),
            $ = n(5760);
          function X() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            if (1 === t.length) {
              var n = t[0];
              if ((0, R.k)(n)) return tt(n, null);
              if ((0, J.K)(n) && Object.getPrototypeOf(n) === Object.prototype) {
                var r = Object.keys(n);
                return tt(
                  r.map(function(t) {
                    return n[t];
                  }),
                  r
                );
              }
            }
            if ('function' == typeof t[t.length - 1]) {
              var i = t.pop();
              return tt((t = 1 === t.length && (0, R.k)(t[0]) ? t[0] : t), null).pipe(
                (0, j.U)(function(t) {
                  return i.apply(void 0, t);
                })
              );
            }
            return tt(t, null);
          }
          function tt(t, e) {
            return new r.y(function(n) {
              var r = t.length;
              if (0 !== r)
                for (
                  var i = new Array(r),
                    o = 0,
                    s = 0,
                    c = function(c) {
                      var u = (0, $.D)(t[c]),
                        a = !1;
                      n.add(
                        u.subscribe({
                          next: function(t) {
                            a || ((a = !0), s++), (i[c] = t);
                          },
                          error: function(t) {
                            return n.error(t);
                          },
                          complete: function() {
                            (++o !== r && a) ||
                              (s === r &&
                                n.next(
                                  e
                                    ? e.reduce(function(t, e, n) {
                                        return (t[e] = i[n]), t;
                                      }, {})
                                    : i
                                ),
                              n.complete());
                          },
                        })
                      );
                    },
                    u = 0;
                  u < r;
                  u++
                )
                  c(u);
              else n.complete();
            });
          }
          var et = n(4156);
          function nt(t, e, n, i) {
            return (
              (0, et.m)(n) && ((i = n), (n = void 0)),
              i
                ? nt(t, e, n).pipe(
                    (0, j.U)(function(t) {
                      return (0, R.k)(t) ? i.apply(void 0, t) : i(t);
                    })
                  )
                : new r.y(function(r) {
                    rt(
                      t,
                      e,
                      function(t) {
                        arguments.length > 1 ? r.next(Array.prototype.slice.call(arguments)) : r.next(t);
                      },
                      r,
                      n
                    );
                  })
            );
          }
          function rt(t, e, n, r, i) {
            var o;
            if (
              (function(t) {
                return t && 'function' == typeof t.addEventListener && 'function' == typeof t.removeEventListener;
              })(t)
            ) {
              var s = t;
              t.addEventListener(e, n, i),
                (o = function() {
                  return s.removeEventListener(e, n, i);
                });
            } else if (
              (function(t) {
                return t && 'function' == typeof t.on && 'function' == typeof t.off;
              })(t)
            ) {
              var c = t;
              t.on(e, n),
                (o = function() {
                  return c.off(e, n);
                });
            } else if (
              (function(t) {
                return t && 'function' == typeof t.addListener && 'function' == typeof t.removeListener;
              })(t)
            ) {
              var u = t;
              t.addListener(e, n),
                (o = function() {
                  return u.removeListener(e, n);
                });
            } else {
              if (!t || !t.length) throw new TypeError('Invalid event target');
              for (var a = 0, h = t.length; a < h; a++) rt(t[a], e, n, r, i);
            }
            r.add(o);
          }
          function it(t, e, n) {
            return n
              ? it(t, e).pipe(
                  (0, j.U)(function(t) {
                    return (0, R.k)(t) ? n.apply(void 0, t) : n(t);
                  })
                )
              : new r.y(function(n) {
                  var r,
                    i = function() {
                      for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                      return n.next(1 === t.length ? t[0] : t);
                    };
                  try {
                    r = t(i);
                  } catch (t) {
                    return void n.error(t);
                  }
                  if ((0, et.m)(e))
                    return function() {
                      return e(i, r);
                    };
                });
          }
          function ot(t, e, n, i, o) {
            var s, c;
            if (1 == arguments.length) {
              var u = t;
              (c = u.initialState), (e = u.condition), (n = u.iterate), (s = u.resultSelector || I.y), (o = u.scheduler);
            } else void 0 === i || (0, M.K)(i) ? ((c = t), (s = I.y), (o = i)) : ((c = t), (s = i));
            return new r.y(function(t) {
              var r = c;
              if (o) return o.schedule(st, 0, { subscriber: t, iterate: n, condition: e, resultSelector: s, state: r });
              for (;;) {
                if (e) {
                  var i = void 0;
                  try {
                    i = e(r);
                  } catch (e) {
                    return void t.error(e);
                  }
                  if (!i) {
                    t.complete();
                    break;
                  }
                }
                var u = void 0;
                try {
                  u = s(r);
                } catch (e) {
                  return void t.error(e);
                }
                if ((t.next(u), t.closed)) break;
                try {
                  r = n(r);
                } catch (e) {
                  return void t.error(e);
                }
              }
            });
          }
          function st(t) {
            var e = t.subscriber,
              n = t.condition;
            if (!e.closed) {
              if (t.needIterate)
                try {
                  t.state = t.iterate(t.state);
                } catch (t) {
                  return void e.error(t);
                }
              else t.needIterate = !0;
              if (n) {
                var r = void 0;
                try {
                  r = n(t.state);
                } catch (t) {
                  return void e.error(t);
                }
                if (!r) return void e.complete();
                if (e.closed) return;
              }
              var i;
              try {
                i = t.resultSelector(t.state);
              } catch (t) {
                return void e.error(t);
              }
              if (!e.closed && (e.next(i), !e.closed)) return this.schedule(t);
            }
          }
          function ct(t, e, n) {
            return (
              void 0 === e && (e = H.E),
              void 0 === n && (n = H.E),
              (0, Q.P)(function() {
                return t() ? e : n;
              })
            );
          }
          var ut = n(5812);
          function at(t, e) {
            return (
              void 0 === t && (t = 0),
              void 0 === e && (e = f.P),
              (!(0, ut.k)(t) || t < 0) && (t = 0),
              (e && 'function' == typeof e.schedule) || (e = f.P),
              new r.y(function(n) {
                return n.add(e.schedule(ht, t, { subscriber: n, counter: 0, period: t })), n;
              })
            );
          }
          function ht(t) {
            var e = t.subscriber,
              n = t.counter,
              r = t.period;
            e.next(n), this.schedule({ subscriber: e, counter: n + 1, period: r }, r);
          }
          var lt = n(4370),
            ft = new r.y(N.Z);
          function dt() {
            return ft;
          }
          var pt = n(8170);
          function bt() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            if (0 === t.length) return H.E;
            var n = t[0],
              i = t.slice(1);
            return 1 === t.length && (0, R.k)(n)
              ? bt.apply(void 0, n)
              : new r.y(function(t) {
                  var e = function() {
                    return t.add(bt.apply(void 0, i).subscribe(t));
                  };
                  return (0, $.D)(n).subscribe({
                    next: function(e) {
                      t.next(e);
                    },
                    error: e,
                    complete: e,
                  });
                });
          }
          function vt(t, e) {
            return e
              ? new r.y(function(n) {
                  var r = Object.keys(t),
                    i = new T.w();
                  return i.add(e.schedule(yt, 0, { keys: r, index: 0, subscriber: n, subscription: i, obj: t })), i;
                })
              : new r.y(function(e) {
                  for (var n = Object.keys(t), r = 0; r < n.length && !e.closed; r++) {
                    var i = n[r];
                    t.hasOwnProperty(i) && e.next([i, t[i]]);
                  }
                  e.complete();
                });
          }
          function yt(t) {
            var e = t.keys,
              n = t.index,
              r = t.subscriber,
              i = t.subscription,
              o = t.obj;
            if (!r.closed)
              if (n < e.length) {
                var s = e[n];
                r.next([s, o[s]]), i.add(this.schedule({ keys: e, index: n + 1, subscriber: r, subscription: i, obj: o }));
              } else r.complete();
          }
          var mt = n(8463),
            wt = n(7843),
            gt = n(6008);
          function _t(t, e, n) {
            return [(0, gt.h)(e, n)(new r.y((0, wt.s)(t))), (0, gt.h)((0, mt.f)(e, n))(new r.y((0, wt.s)(t)))];
          }
          var xt = n(8821);
          function St(t, e, n) {
            return (
              void 0 === t && (t = 0),
              new r.y(function(r) {
                void 0 === e && ((e = t), (t = 0));
                var i = 0,
                  o = t;
                if (n) return n.schedule(Tt, 0, { index: i, count: e, start: t, subscriber: r });
                for (;;) {
                  if (i++ >= e) {
                    r.complete();
                    break;
                  }
                  if ((r.next(o++), r.closed)) break;
                }
              })
            );
          }
          function Tt(t) {
            var e = t.start,
              n = t.index,
              r = t.count,
              i = t.subscriber;
            n >= r ? i.complete() : (i.next(e), i.closed || ((t.index = n + 1), (t.start = e + 1), this.schedule(t)));
          }
          var Et = n(4944),
            kt = n(9604);
          function Ct(t, e) {
            return new r.y(function(n) {
              var r, i;
              try {
                r = t();
              } catch (t) {
                return void n.error(t);
              }
              try {
                i = e(r);
              } catch (t) {
                return void n.error(t);
              }
              var o = (i ? (0, $.D)(i) : H.E).subscribe(n);
              return function() {
                o.unsubscribe(), r && r.unsubscribe();
              };
            });
          }
          var Nt = n(5080),
            It = n(8107),
            Dt = n(150);
        },
        364: (t, e, n) => {
          n.d(e, { c: () => s });
          var r = n(5987),
            i = n(211),
            o = n(8760),
            s = (function(t) {
              function e() {
                var e = (null !== t && t.apply(this, arguments)) || this;
                return (e.value = null), (e.hasNext = !1), (e.hasCompleted = !1), e;
              }
              return (
                r.ZT(e, t),
                (e.prototype._subscribe = function(e) {
                  return this.hasError
                    ? (e.error(this.thrownError), o.w.EMPTY)
                    : this.hasCompleted && this.hasNext
                    ? (e.next(this.value), e.complete(), o.w.EMPTY)
                    : t.prototype._subscribe.call(this, e);
                }),
                (e.prototype.next = function(t) {
                  this.hasCompleted || ((this.value = t), (this.hasNext = !0));
                }),
                (e.prototype.error = function(e) {
                  this.hasCompleted || t.prototype.error.call(this, e);
                }),
                (e.prototype.complete = function() {
                  (this.hasCompleted = !0), this.hasNext && t.prototype.next.call(this, this.value), t.prototype.complete.call(this);
                }),
                e
              );
            })(i.xQ);
        },
        9233: (t, e, n) => {
          n.d(e, { X: () => s });
          var r = n(5987),
            i = n(211),
            o = n(1016),
            s = (function(t) {
              function e(e) {
                var n = t.call(this) || this;
                return (n._value = e), n;
              }
              return (
                r.ZT(e, t),
                Object.defineProperty(e.prototype, 'value', {
                  get: function() {
                    return this.getValue();
                  },
                  enumerable: !0,
                  configurable: !0,
                }),
                (e.prototype._subscribe = function(e) {
                  var n = t.prototype._subscribe.call(this, e);
                  return n && !n.closed && e.next(this._value), n;
                }),
                (e.prototype.getValue = function() {
                  if (this.hasError) throw this.thrownError;
                  if (this.closed) throw new o.N();
                  return this._value;
                }),
                (e.prototype.next = function(e) {
                  t.prototype.next.call(this, (this._value = e));
                }),
                e
              );
            })(i.xQ);
        },
        2632: (t, e, n) => {
          n.d(e, { W: () => r, P: () => c });
          var r,
            i = n(5631),
            o = n(8170),
            s = n(4944);
          r || (r = {});
          var c = (function() {
            function t(t, e, n) {
              (this.kind = t), (this.value = e), (this.error = n), (this.hasValue = 'N' === t);
            }
            return (
              (t.prototype.observe = function(t) {
                switch (this.kind) {
                  case 'N':
                    return t.next && t.next(this.value);
                  case 'E':
                    return t.error && t.error(this.error);
                  case 'C':
                    return t.complete && t.complete();
                }
              }),
              (t.prototype.do = function(t, e, n) {
                switch (this.kind) {
                  case 'N':
                    return t && t(this.value);
                  case 'E':
                    return e && e(this.error);
                  case 'C':
                    return n && n();
                }
              }),
              (t.prototype.accept = function(t, e, n) {
                return t && 'function' == typeof t.next ? this.observe(t) : this.do(t, e, n);
              }),
              (t.prototype.toObservable = function() {
                switch (this.kind) {
                  case 'N':
                    return (0, o.of)(this.value);
                  case 'E':
                    return (0, s._)(this.error);
                  case 'C':
                    return (0, i.c)();
                }
                throw new Error('unexpected notification kind value');
              }),
              (t.createNext = function(e) {
                return void 0 !== e ? new t('N', e) : t.undefinedValueNotification;
              }),
              (t.createError = function(e) {
                return new t('E', void 0, e);
              }),
              (t.createComplete = function() {
                return t.completeNotification;
              }),
              (t.completeNotification = new t('C')),
              (t.undefinedValueNotification = new t('N', void 0)),
              t
            );
          })();
        },
        2772: (t, e, n) => {
          n.d(e, { y: () => h });
          var r = n(3642),
            i = n(979),
            o = n(3142),
            s = n(2174),
            c = n(5050),
            u = n(2561),
            a = n(150),
            h = (function() {
              function t(t) {
                (this._isScalar = !1), t && (this._subscribe = t);
              }
              return (
                (t.prototype.lift = function(e) {
                  var n = new t();
                  return (n.source = this), (n.operator = e), n;
                }),
                (t.prototype.subscribe = function(t, e, n) {
                  var r = this.operator,
                    c = (function(t, e, n) {
                      if (t) {
                        if (t instanceof i.L) return t;
                        if (t[o.b]) return t[o.b]();
                      }
                      return t || e || n ? new i.L(t, e, n) : new i.L(s.c);
                    })(t, e, n);
                  if (
                    (r
                      ? c.add(r.call(c, this.source))
                      : c.add(this.source || (a.v.useDeprecatedSynchronousErrorHandling && !c.syncErrorThrowable) ? this._subscribe(c) : this._trySubscribe(c)),
                    a.v.useDeprecatedSynchronousErrorHandling && c.syncErrorThrowable && ((c.syncErrorThrowable = !1), c.syncErrorThrown))
                  )
                    throw c.syncErrorValue;
                  return c;
                }),
                (t.prototype._trySubscribe = function(t) {
                  try {
                    return this._subscribe(t);
                  } catch (e) {
                    a.v.useDeprecatedSynchronousErrorHandling && ((t.syncErrorThrown = !0), (t.syncErrorValue = e)), (0, r._)(t) ? t.error(e) : console.warn(e);
                  }
                }),
                (t.prototype.forEach = function(t, e) {
                  var n = this;
                  return new (e = l(e))(function(e, r) {
                    var i;
                    i = n.subscribe(
                      function(e) {
                        try {
                          t(e);
                        } catch (t) {
                          r(t), i && i.unsubscribe();
                        }
                      },
                      r,
                      e
                    );
                  });
                }),
                (t.prototype._subscribe = function(t) {
                  var e = this.source;
                  return e && e.subscribe(t);
                }),
                (t.prototype[c.L] = function() {
                  return this;
                }),
                (t.prototype.pipe = function() {
                  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                  return 0 === t.length ? this : (0, u.U)(t)(this);
                }),
                (t.prototype.toPromise = function(t) {
                  var e = this;
                  return new (t = l(t))(function(t, n) {
                    var r;
                    e.subscribe(
                      function(t) {
                        return (r = t);
                      },
                      function(t) {
                        return n(t);
                      },
                      function() {
                        return t(r);
                      }
                    );
                  });
                }),
                (t.create = function(e) {
                  return new t(e);
                }),
                t
              );
            })();
          function l(t) {
            if ((t || (t = a.v.Promise || Promise), !t)) throw new Error('no Promise impl found');
            return t;
          }
        },
        2174: (t, e, n) => {
          n.d(e, { c: () => o });
          var r = n(150),
            i = n(1644),
            o = {
              closed: !0,
              next: function(t) {},
              error: function(t) {
                if (r.v.useDeprecatedSynchronousErrorHandling) throw t;
                (0, i.z)(t);
              },
              complete: function() {},
            };
        },
        2039: (t, e, n) => {
          n.d(e, { L: () => i });
          var r = n(5987),
            i = (function(t) {
              function e() {
                return (null !== t && t.apply(this, arguments)) || this;
              }
              return (
                r.ZT(e, t),
                (e.prototype.notifyNext = function(t, e, n, r, i) {
                  this.destination.next(e);
                }),
                (e.prototype.notifyError = function(t, e) {
                  this.destination.error(t);
                }),
                (e.prototype.notifyComplete = function(t) {
                  this.destination.complete();
                }),
                e
              );
            })(n(979).L);
        },
        2630: (t, e, n) => {
          n.d(e, { t: () => h });
          var r = n(5987),
            i = n(211),
            o = n(2546),
            s = n(8760),
            c = n(9276),
            u = n(1016),
            a = n(8253),
            h = (function(t) {
              function e(e, n, r) {
                void 0 === e && (e = Number.POSITIVE_INFINITY), void 0 === n && (n = Number.POSITIVE_INFINITY);
                var i = t.call(this) || this;
                return (
                  (i.scheduler = r),
                  (i._events = []),
                  (i._infiniteTimeWindow = !1),
                  (i._bufferSize = e < 1 ? 1 : e),
                  (i._windowTime = n < 1 ? 1 : n),
                  n === Number.POSITIVE_INFINITY ? ((i._infiniteTimeWindow = !0), (i.next = i.nextInfiniteTimeWindow)) : (i.next = i.nextTimeWindow),
                  i
                );
              }
              return (
                r.ZT(e, t),
                (e.prototype.nextInfiniteTimeWindow = function(e) {
                  if (!this.isStopped) {
                    var n = this._events;
                    n.push(e), n.length > this._bufferSize && n.shift();
                  }
                  t.prototype.next.call(this, e);
                }),
                (e.prototype.nextTimeWindow = function(e) {
                  this.isStopped || (this._events.push(new l(this._getNow(), e)), this._trimBufferThenGetEvents()), t.prototype.next.call(this, e);
                }),
                (e.prototype._subscribe = function(t) {
                  var e,
                    n = this._infiniteTimeWindow,
                    r = n ? this._events : this._trimBufferThenGetEvents(),
                    i = this.scheduler,
                    o = r.length;
                  if (this.closed) throw new u.N();
                  if ((this.isStopped || this.hasError ? (e = s.w.EMPTY) : (this.observers.push(t), (e = new a.W(this, t))), i && t.add((t = new c.ht(t, i))), n))
                    for (var h = 0; h < o && !t.closed; h++) t.next(r[h]);
                  else for (h = 0; h < o && !t.closed; h++) t.next(r[h].value);
                  return this.hasError ? t.error(this.thrownError) : this.isStopped && t.complete(), e;
                }),
                (e.prototype._getNow = function() {
                  return (this.scheduler || o.c).now();
                }),
                (e.prototype._trimBufferThenGetEvents = function() {
                  for (var t = this._getNow(), e = this._bufferSize, n = this._windowTime, r = this._events, i = r.length, o = 0; o < i && !(t - r[o].time < n); ) o++;
                  return i > e && (o = Math.max(o, i - e)), o > 0 && r.splice(0, o), r;
                }),
                e
              );
            })(i.xQ),
            l = (function() {
              return function(t, e) {
                (this.time = t), (this.value = e);
              };
            })();
        },
        8725: (t, e, n) => {
          n.d(e, { b: () => r });
          var r = (function() {
            function t(e, n) {
              void 0 === n && (n = t.now), (this.SchedulerAction = e), (this.now = n);
            }
            return (
              (t.prototype.schedule = function(t, e, n) {
                return void 0 === e && (e = 0), new this.SchedulerAction(this, t).schedule(n, e);
              }),
              (t.now = function() {
                return Date.now();
              }),
              t
            );
          })();
        },
        211: (t, e, n) => {
          n.d(e, { Yc: () => h, xQ: () => l });
          var r = n(5987),
            i = n(2772),
            o = n(979),
            s = n(8760),
            c = n(1016),
            u = n(8253),
            a = n(3142),
            h = (function(t) {
              function e(e) {
                var n = t.call(this, e) || this;
                return (n.destination = e), n;
              }
              return r.ZT(e, t), e;
            })(o.L),
            l = (function(t) {
              function e() {
                var e = t.call(this) || this;
                return (e.observers = []), (e.closed = !1), (e.isStopped = !1), (e.hasError = !1), (e.thrownError = null), e;
              }
              return (
                r.ZT(e, t),
                (e.prototype[a.b] = function() {
                  return new h(this);
                }),
                (e.prototype.lift = function(t) {
                  var e = new f(this, this);
                  return (e.operator = t), e;
                }),
                (e.prototype.next = function(t) {
                  if (this.closed) throw new c.N();
                  if (!this.isStopped) for (var e = this.observers, n = e.length, r = e.slice(), i = 0; i < n; i++) r[i].next(t);
                }),
                (e.prototype.error = function(t) {
                  if (this.closed) throw new c.N();
                  (this.hasError = !0), (this.thrownError = t), (this.isStopped = !0);
                  for (var e = this.observers, n = e.length, r = e.slice(), i = 0; i < n; i++) r[i].error(t);
                  this.observers.length = 0;
                }),
                (e.prototype.complete = function() {
                  if (this.closed) throw new c.N();
                  this.isStopped = !0;
                  for (var t = this.observers, e = t.length, n = t.slice(), r = 0; r < e; r++) n[r].complete();
                  this.observers.length = 0;
                }),
                (e.prototype.unsubscribe = function() {
                  (this.isStopped = !0), (this.closed = !0), (this.observers = null);
                }),
                (e.prototype._trySubscribe = function(e) {
                  if (this.closed) throw new c.N();
                  return t.prototype._trySubscribe.call(this, e);
                }),
                (e.prototype._subscribe = function(t) {
                  if (this.closed) throw new c.N();
                  return this.hasError ? (t.error(this.thrownError), s.w.EMPTY) : this.isStopped ? (t.complete(), s.w.EMPTY) : (this.observers.push(t), new u.W(this, t));
                }),
                (e.prototype.asObservable = function() {
                  var t = new i.y();
                  return (t.source = this), t;
                }),
                (e.create = function(t, e) {
                  return new f(t, e);
                }),
                e
              );
            })(i.y),
            f = (function(t) {
              function e(e, n) {
                var r = t.call(this) || this;
                return (r.destination = e), (r.source = n), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype.next = function(t) {
                  var e = this.destination;
                  e && e.next && e.next(t);
                }),
                (e.prototype.error = function(t) {
                  var e = this.destination;
                  e && e.error && this.destination.error(t);
                }),
                (e.prototype.complete = function() {
                  var t = this.destination;
                  t && t.complete && this.destination.complete();
                }),
                (e.prototype._subscribe = function(t) {
                  return this.source ? this.source.subscribe(t) : s.w.EMPTY;
                }),
                e
              );
            })(l);
        },
        8253: (t, e, n) => {
          n.d(e, { W: () => i });
          var r = n(5987),
            i = (function(t) {
              function e(e, n) {
                var r = t.call(this) || this;
                return (r.subject = e), (r.subscriber = n), (r.closed = !1), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype.unsubscribe = function() {
                  if (!this.closed) {
                    this.closed = !0;
                    var t = this.subject,
                      e = t.observers;
                    if (((this.subject = null), e && 0 !== e.length && !t.isStopped && !t.closed)) {
                      var n = e.indexOf(this.subscriber);
                      -1 !== n && e.splice(n, 1);
                    }
                  }
                }),
                e
              );
            })(n(8760).w);
        },
        979: (t, e, n) => {
          n.d(e, { L: () => h });
          var r = n(5987),
            i = n(4156),
            o = n(2174),
            s = n(8760),
            c = n(3142),
            u = n(150),
            a = n(1644),
            h = (function(t) {
              function e(n, r, i) {
                var s = t.call(this) || this;
                switch (((s.syncErrorValue = null), (s.syncErrorThrown = !1), (s.syncErrorThrowable = !1), (s.isStopped = !1), arguments.length)) {
                  case 0:
                    s.destination = o.c;
                    break;
                  case 1:
                    if (!n) {
                      s.destination = o.c;
                      break;
                    }
                    if ('object' == typeof n) {
                      n instanceof e
                        ? ((s.syncErrorThrowable = n.syncErrorThrowable), (s.destination = n), n.add(s))
                        : ((s.syncErrorThrowable = !0), (s.destination = new l(s, n)));
                      break;
                    }
                  default:
                    (s.syncErrorThrowable = !0), (s.destination = new l(s, n, r, i));
                }
                return s;
              }
              return (
                r.ZT(e, t),
                (e.prototype[c.b] = function() {
                  return this;
                }),
                (e.create = function(t, n, r) {
                  var i = new e(t, n, r);
                  return (i.syncErrorThrowable = !1), i;
                }),
                (e.prototype.next = function(t) {
                  this.isStopped || this._next(t);
                }),
                (e.prototype.error = function(t) {
                  this.isStopped || ((this.isStopped = !0), this._error(t));
                }),
                (e.prototype.complete = function() {
                  this.isStopped || ((this.isStopped = !0), this._complete());
                }),
                (e.prototype.unsubscribe = function() {
                  this.closed || ((this.isStopped = !0), t.prototype.unsubscribe.call(this));
                }),
                (e.prototype._next = function(t) {
                  this.destination.next(t);
                }),
                (e.prototype._error = function(t) {
                  this.destination.error(t), this.unsubscribe();
                }),
                (e.prototype._complete = function() {
                  this.destination.complete(), this.unsubscribe();
                }),
                (e.prototype._unsubscribeAndRecycle = function() {
                  var t = this._parentOrParents;
                  return (this._parentOrParents = null), this.unsubscribe(), (this.closed = !1), (this.isStopped = !1), (this._parentOrParents = t), this;
                }),
                e
              );
            })(s.w),
            l = (function(t) {
              function e(e, n, r, s) {
                var c,
                  u = t.call(this) || this;
                u._parentSubscriber = e;
                var a = u;
                return (
                  (0, i.m)(n)
                    ? (c = n)
                    : n &&
                      ((c = n.next),
                      (r = n.error),
                      (s = n.complete),
                      n !== o.c && ((a = Object.create(n)), (0, i.m)(a.unsubscribe) && u.add(a.unsubscribe.bind(a)), (a.unsubscribe = u.unsubscribe.bind(u)))),
                  (u._context = a),
                  (u._next = c),
                  (u._error = r),
                  (u._complete = s),
                  u
                );
              }
              return (
                r.ZT(e, t),
                (e.prototype.next = function(t) {
                  if (!this.isStopped && this._next) {
                    var e = this._parentSubscriber;
                    u.v.useDeprecatedSynchronousErrorHandling && e.syncErrorThrowable
                      ? this.__tryOrSetError(e, this._next, t) && this.unsubscribe()
                      : this.__tryOrUnsub(this._next, t);
                  }
                }),
                (e.prototype.error = function(t) {
                  if (!this.isStopped) {
                    var e = this._parentSubscriber,
                      n = u.v.useDeprecatedSynchronousErrorHandling;
                    if (this._error)
                      n && e.syncErrorThrowable ? (this.__tryOrSetError(e, this._error, t), this.unsubscribe()) : (this.__tryOrUnsub(this._error, t), this.unsubscribe());
                    else if (e.syncErrorThrowable) n ? ((e.syncErrorValue = t), (e.syncErrorThrown = !0)) : (0, a.z)(t), this.unsubscribe();
                    else {
                      if ((this.unsubscribe(), n)) throw t;
                      (0, a.z)(t);
                    }
                  }
                }),
                (e.prototype.complete = function() {
                  var t = this;
                  if (!this.isStopped) {
                    var e = this._parentSubscriber;
                    if (this._complete) {
                      var n = function() {
                        return t._complete.call(t._context);
                      };
                      u.v.useDeprecatedSynchronousErrorHandling && e.syncErrorThrowable
                        ? (this.__tryOrSetError(e, n), this.unsubscribe())
                        : (this.__tryOrUnsub(n), this.unsubscribe());
                    } else this.unsubscribe();
                  }
                }),
                (e.prototype.__tryOrUnsub = function(t, e) {
                  try {
                    t.call(this._context, e);
                  } catch (t) {
                    if ((this.unsubscribe(), u.v.useDeprecatedSynchronousErrorHandling)) throw t;
                    (0, a.z)(t);
                  }
                }),
                (e.prototype.__tryOrSetError = function(t, e, n) {
                  if (!u.v.useDeprecatedSynchronousErrorHandling) throw new Error('bad call');
                  try {
                    e.call(this._context, n);
                  } catch (e) {
                    return u.v.useDeprecatedSynchronousErrorHandling ? ((t.syncErrorValue = e), (t.syncErrorThrown = !0), !0) : ((0, a.z)(e), !0);
                  }
                  return !1;
                }),
                (e.prototype._unsubscribe = function() {
                  var t = this._parentSubscriber;
                  (this._context = null), (this._parentSubscriber = null), t.unsubscribe();
                }),
                e
              );
            })(h);
        },
        8760: (t, e, n) => {
          n.d(e, { w: () => c });
          var r = n(9026),
            i = n(2009),
            o = n(4156),
            s = n(8782),
            c = (function() {
              function t(t) {
                (this.closed = !1), (this._parentOrParents = null), (this._subscriptions = null), t && ((this._ctorUnsubscribe = !0), (this._unsubscribe = t));
              }
              var e;
              return (
                (t.prototype.unsubscribe = function() {
                  var e;
                  if (!this.closed) {
                    var n = this,
                      c = n._parentOrParents,
                      a = n._ctorUnsubscribe,
                      h = n._unsubscribe,
                      l = n._subscriptions;
                    if (((this.closed = !0), (this._parentOrParents = null), (this._subscriptions = null), c instanceof t)) c.remove(this);
                    else if (null !== c) for (var f = 0; f < c.length; ++f) c[f].remove(this);
                    if ((0, o.m)(h)) {
                      a && (this._unsubscribe = void 0);
                      try {
                        h.call(this);
                      } catch (t) {
                        e = t instanceof s.B ? u(t.errors) : [t];
                      }
                    }
                    if ((0, r.k)(l)) {
                      f = -1;
                      for (var d = l.length; ++f < d; ) {
                        var p = l[f];
                        if ((0, i.K)(p))
                          try {
                            p.unsubscribe();
                          } catch (t) {
                            (e = e || []), t instanceof s.B ? (e = e.concat(u(t.errors))) : e.push(t);
                          }
                      }
                    }
                    if (e) throw new s.B(e);
                  }
                }),
                (t.prototype.add = function(e) {
                  var n = e;
                  if (!e) return t.EMPTY;
                  switch (typeof e) {
                    case 'function':
                      n = new t(e);
                    case 'object':
                      if (n === this || n.closed || 'function' != typeof n.unsubscribe) return n;
                      if (this.closed) return n.unsubscribe(), n;
                      if (!(n instanceof t)) {
                        var r = n;
                        (n = new t())._subscriptions = [r];
                      }
                      break;
                    default:
                      throw new Error('unrecognized teardown ' + e + ' added to Subscription.');
                  }
                  var i = n._parentOrParents;
                  if (null === i) n._parentOrParents = this;
                  else if (i instanceof t) {
                    if (i === this) return n;
                    n._parentOrParents = [i, this];
                  } else {
                    if (-1 !== i.indexOf(this)) return n;
                    i.push(this);
                  }
                  var o = this._subscriptions;
                  return null === o ? (this._subscriptions = [n]) : o.push(n), n;
                }),
                (t.prototype.remove = function(t) {
                  var e = this._subscriptions;
                  if (e) {
                    var n = e.indexOf(t);
                    -1 !== n && e.splice(n, 1);
                  }
                }),
                (t.EMPTY = (((e = new t()).closed = !0), e)),
                t
              );
            })();
          function u(t) {
            return t.reduce(function(t, e) {
              return t.concat(e instanceof s.B ? e.errors : e);
            }, []);
          }
        },
        150: (t, e, n) => {
          n.d(e, { v: () => i });
          var r = !1,
            i = {
              Promise: void 0,
              set useDeprecatedSynchronousErrorHandling(t) {
                t && new Error().stack, (r = t);
              },
              get useDeprecatedSynchronousErrorHandling() {
                return r;
              },
            };
        },
        7604: (t, e, n) => {
          n.d(e, { IY: () => c, Ds: () => u, ft: () => a });
          var r = n(5987),
            i = n(979),
            o = n(2772),
            s = n(7843),
            c = (function(t) {
              function e(e) {
                var n = t.call(this) || this;
                return (n.parent = e), n;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.parent.notifyNext(t);
                }),
                (e.prototype._error = function(t) {
                  this.parent.notifyError(t), this.unsubscribe();
                }),
                (e.prototype._complete = function() {
                  this.parent.notifyComplete(), this.unsubscribe();
                }),
                e
              );
            })(i.L),
            u =
              (i.L,
              (function(t) {
                function e() {
                  return (null !== t && t.apply(this, arguments)) || this;
                }
                return (
                  r.ZT(e, t),
                  (e.prototype.notifyNext = function(t) {
                    this.destination.next(t);
                  }),
                  (e.prototype.notifyError = function(t) {
                    this.destination.error(t);
                  }),
                  (e.prototype.notifyComplete = function() {
                    this.destination.complete();
                  }),
                  e
                );
              })(i.L));
          function a(t, e) {
            if (!e.closed) {
              if (t instanceof o.y) return t.subscribe(e);
              var n;
              try {
                n = (0, s.s)(t)(e);
              } catch (t) {
                e.error(t);
              }
              return n;
            }
          }
          i.L;
        },
        3140: (t, e, n) => {
          n.d(e, { c: () => a, N: () => h });
          var r = n(5987),
            i = n(211),
            o = n(2772),
            s = n(979),
            c = n(8760),
            u = n(3018),
            a = (function(t) {
              function e(e, n) {
                var r = t.call(this) || this;
                return (r.source = e), (r.subjectFactory = n), (r._refCount = 0), (r._isComplete = !1), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._subscribe = function(t) {
                  return this.getSubject().subscribe(t);
                }),
                (e.prototype.getSubject = function() {
                  var t = this._subject;
                  return (t && !t.isStopped) || (this._subject = this.subjectFactory()), this._subject;
                }),
                (e.prototype.connect = function() {
                  var t = this._connection;
                  return (
                    t ||
                      ((this._isComplete = !1),
                      (t = this._connection = new c.w()).add(this.source.subscribe(new l(this.getSubject(), this))),
                      t.closed && ((this._connection = null), (t = c.w.EMPTY))),
                    t
                  );
                }),
                (e.prototype.refCount = function() {
                  return (0, u.x)()(this);
                }),
                e
              );
            })(o.y),
            h = (function() {
              var t = a.prototype;
              return {
                operator: { value: null },
                _refCount: { value: 0, writable: !0 },
                _subject: { value: null, writable: !0 },
                _connection: { value: null, writable: !0 },
                _subscribe: { value: t._subscribe },
                _isComplete: { value: t._isComplete, writable: !0 },
                getSubject: { value: t.getSubject },
                connect: { value: t.connect },
                refCount: { value: t.refCount },
              };
            })(),
            l = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.connectable = n), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._error = function(e) {
                  this._unsubscribe(), t.prototype._error.call(this, e);
                }),
                (e.prototype._complete = function() {
                  (this.connectable._isComplete = !0), this._unsubscribe(), t.prototype._complete.call(this);
                }),
                (e.prototype._unsubscribe = function() {
                  var t = this.connectable;
                  if (t) {
                    this.connectable = null;
                    var e = t._connection;
                    (t._refCount = 0), (t._subject = null), (t._connection = null), e && e.unsubscribe();
                  }
                }),
                e
              );
            })(i.Yc);
          s.L;
        },
        5142: (t, e, n) => {
          n.d(e, { aj: () => h, Ms: () => l });
          var r = n(5987),
            i = n(7507),
            o = n(9026),
            s = n(2039),
            c = n(2080),
            u = n(3375),
            a = {};
          function h() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            var n = void 0,
              r = void 0;
            return (
              (0, i.K)(t[t.length - 1]) && (r = t.pop()),
              'function' == typeof t[t.length - 1] && (n = t.pop()),
              1 === t.length && (0, o.k)(t[0]) && (t = t[0]),
              (0, u.n)(t, r).lift(new l(n))
            );
          }
          var l = (function() {
              function t(t) {
                this.resultSelector = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new f(t, this.resultSelector));
                }),
                t
              );
            })(),
            f = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.resultSelector = n), (r.active = 0), (r.values = []), (r.observables = []), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.values.push(a), this.observables.push(t);
                }),
                (e.prototype._complete = function() {
                  var t = this.observables,
                    e = t.length;
                  if (0 === e) this.destination.complete();
                  else {
                    (this.active = e), (this.toRespond = e);
                    for (var n = 0; n < e; n++) {
                      var r = t[n];
                      this.add((0, c.D)(this, r, void 0, n));
                    }
                  }
                }),
                (e.prototype.notifyComplete = function(t) {
                  0 == (this.active -= 1) && this.destination.complete();
                }),
                (e.prototype.notifyNext = function(t, e, n) {
                  var r = this.values,
                    i = r[n],
                    o = this.toRespond ? (i === a ? --this.toRespond : this.toRespond) : 0;
                  (r[n] = e), 0 === o && (this.resultSelector ? this._tryResultSelector(r) : this.destination.next(r.slice()));
                }),
                (e.prototype._tryResultSelector = function(t) {
                  var e;
                  try {
                    e = this.resultSelector.apply(this, t);
                  } catch (t) {
                    return void this.destination.error(t);
                  }
                  this.destination.next(e);
                }),
                e
              );
            })(s.L);
        },
        9795: (t, e, n) => {
          n.d(e, { z: () => o });
          var r = n(8170),
            i = n(2257);
          function o() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            return (0, i.u)()(r.of.apply(void 0, t));
          }
        },
        1410: (t, e, n) => {
          n.d(e, { P: () => s });
          var r = n(2772),
            i = n(5760),
            o = n(5631);
          function s(t) {
            return new r.y(function(e) {
              var n;
              try {
                n = t();
              } catch (t) {
                return void e.error(t);
              }
              return (n ? (0, i.D)(n) : (0, o.c)()).subscribe(e);
            });
          }
        },
        5631: (t, e, n) => {
          n.d(e, { E: () => i, c: () => o });
          var r = n(2772),
            i = new r.y(function(t) {
              return t.complete();
            });
          function o(t) {
            return t
              ? (function(t) {
                  return new r.y(function(e) {
                    return t.schedule(function() {
                      return e.complete();
                    });
                  });
                })(t)
              : i;
          }
        },
        5760: (t, e, n) => {
          n.d(e, { D: () => s });
          var r = n(2772),
            i = n(7843),
            o = n(8107);
          function s(t, e) {
            return e ? (0, o.x)(t, e) : t instanceof r.y ? t : new r.y((0, i.s)(t));
          }
        },
        3375: (t, e, n) => {
          n.d(e, { n: () => s });
          var r = n(2772),
            i = n(6900),
            o = n(3109);
          function s(t, e) {
            return e ? (0, o.r)(t, e) : new r.y((0, i.V)(t));
          }
        },
        4370: (t, e, n) => {
          n.d(e, { T: () => c });
          var r = n(2772),
            i = n(7507),
            o = n(2556),
            s = n(3375);
          function c() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            var n = Number.POSITIVE_INFINITY,
              c = null,
              u = t[t.length - 1];
            return (
              (0, i.K)(u) ? ((c = t.pop()), t.length > 1 && 'number' == typeof t[t.length - 1] && (n = t.pop())) : 'number' == typeof u && (n = t.pop()),
              null === c && 1 === t.length && t[0] instanceof r.y ? t[0] : (0, o.J)(n)((0, s.n)(t, c))
            );
          }
        },
        8170: (t, e, n) => {
          n.d(e, { of: () => s });
          var r = n(7507),
            i = n(3375),
            o = n(3109);
          function s() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            var n = t[t.length - 1];
            return (0, r.K)(n) ? (t.pop(), (0, o.r)(t, n)) : (0, i.n)(t);
          }
        },
        8821: (t, e, n) => {
          n.d(e, { S3: () => u });
          var r = n(5987),
            i = n(9026),
            o = n(3375),
            s = n(2039),
            c = n(2080);
          function u() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            if (1 === t.length) {
              if (!(0, i.k)(t[0])) return t[0];
              t = t[0];
            }
            return (0, o.n)(t, void 0).lift(new a());
          }
          var a = (function() {
              function t() {}
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new h(t));
                }),
                t
              );
            })(),
            h = (function(t) {
              function e(e) {
                var n = t.call(this, e) || this;
                return (n.hasFirst = !1), (n.observables = []), (n.subscriptions = []), n;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.observables.push(t);
                }),
                (e.prototype._complete = function() {
                  var t = this.observables,
                    e = t.length;
                  if (0 === e) this.destination.complete();
                  else {
                    for (var n = 0; n < e && !this.hasFirst; n++) {
                      var r = t[n],
                        i = (0, c.D)(this, r, void 0, n);
                      this.subscriptions && this.subscriptions.push(i), this.add(i);
                    }
                    this.observables = null;
                  }
                }),
                (e.prototype.notifyNext = function(t, e, n) {
                  if (!this.hasFirst) {
                    this.hasFirst = !0;
                    for (var r = 0; r < this.subscriptions.length; r++)
                      if (r !== n) {
                        var i = this.subscriptions[r];
                        i.unsubscribe(), this.remove(i);
                      }
                    this.subscriptions = null;
                  }
                  this.destination.next(e);
                }),
                e
              );
            })(s.L);
        },
        4944: (t, e, n) => {
          n.d(e, { _: () => i });
          var r = n(2772);
          function i(t, e) {
            return e
              ? new r.y(function(n) {
                  return e.schedule(o, 0, { error: t, subscriber: n });
                })
              : new r.y(function(e) {
                  return e.error(t);
                });
          }
          function o(t) {
            var e = t.error;
            t.subscriber.error(e);
          }
        },
        9604: (t, e, n) => {
          n.d(e, { H: () => c });
          var r = n(2772),
            i = n(964),
            o = n(5812),
            s = n(7507);
          function c(t, e, n) {
            void 0 === t && (t = 0);
            var c = -1;
            return (
              (0, o.k)(e) ? (c = Number(e) < 1 ? 1 : Number(e)) : (0, s.K)(e) && (n = e),
              (0, s.K)(n) || (n = i.P),
              new r.y(function(e) {
                var r = (0, o.k)(t) ? t : +t - n.now();
                return n.schedule(u, r, { index: 0, period: c, subscriber: e });
              })
            );
          }
          function u(t) {
            var e = t.index,
              n = t.period,
              r = t.subscriber;
            if ((r.next(e), !r.closed)) {
              if (-1 === n) return r.complete();
              (t.index = e + 1), this.schedule(t, n);
            }
          }
        },
        5080: (t, e, n) => {
          n.d(e, { $R: () => a, mx: () => h });
          var r = n(5987),
            i = n(3375),
            o = n(9026),
            s = n(979),
            c = n(999),
            u = n(7604);
          function a() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            var n = t[t.length - 1];
            return 'function' == typeof n && t.pop(), (0, i.n)(t, void 0).lift(new h(n));
          }
          var h = (function() {
              function t(t) {
                this.resultSelector = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new l(t, this.resultSelector));
                }),
                t
              );
            })(),
            l = (function(t) {
              function e(e, n, r) {
                void 0 === r && (r = Object.create(null));
                var i = t.call(this, e) || this;
                return (i.resultSelector = n), (i.iterators = []), (i.active = 0), (i.resultSelector = 'function' == typeof n ? n : void 0), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  var e = this.iterators;
                  (0, o.k)(t) ? e.push(new d(t)) : 'function' == typeof t[c.hZ] ? e.push(new f(t[c.hZ]())) : e.push(new p(this.destination, this, t));
                }),
                (e.prototype._complete = function() {
                  var t = this.iterators,
                    e = t.length;
                  if ((this.unsubscribe(), 0 !== e)) {
                    this.active = e;
                    for (var n = 0; n < e; n++) {
                      var r = t[n];
                      r.stillUnsubscribed ? this.destination.add(r.subscribe()) : this.active--;
                    }
                  } else this.destination.complete();
                }),
                (e.prototype.notifyInactive = function() {
                  this.active--, 0 === this.active && this.destination.complete();
                }),
                (e.prototype.checkIterators = function() {
                  for (var t = this.iterators, e = t.length, n = this.destination, r = 0; r < e; r++) if ('function' == typeof (s = t[r]).hasValue && !s.hasValue()) return;
                  var i = !1,
                    o = [];
                  for (r = 0; r < e; r++) {
                    var s,
                      c = (s = t[r]).next();
                    if ((s.hasCompleted() && (i = !0), c.done)) return void n.complete();
                    o.push(c.value);
                  }
                  this.resultSelector ? this._tryresultSelector(o) : n.next(o), i && n.complete();
                }),
                (e.prototype._tryresultSelector = function(t) {
                  var e;
                  try {
                    e = this.resultSelector.apply(this, t);
                  } catch (t) {
                    return void this.destination.error(t);
                  }
                  this.destination.next(e);
                }),
                e
              );
            })(s.L),
            f = (function() {
              function t(t) {
                (this.iterator = t), (this.nextResult = t.next());
              }
              return (
                (t.prototype.hasValue = function() {
                  return !0;
                }),
                (t.prototype.next = function() {
                  var t = this.nextResult;
                  return (this.nextResult = this.iterator.next()), t;
                }),
                (t.prototype.hasCompleted = function() {
                  var t = this.nextResult;
                  return Boolean(t && t.done);
                }),
                t
              );
            })(),
            d = (function() {
              function t(t) {
                (this.array = t), (this.index = 0), (this.length = 0), (this.length = t.length);
              }
              return (
                (t.prototype[c.hZ] = function() {
                  return this;
                }),
                (t.prototype.next = function(t) {
                  var e = this.index++,
                    n = this.array;
                  return e < this.length ? { value: n[e], done: !1 } : { value: null, done: !0 };
                }),
                (t.prototype.hasValue = function() {
                  return this.array.length > this.index;
                }),
                (t.prototype.hasCompleted = function() {
                  return this.array.length === this.index;
                }),
                t
              );
            })(),
            p = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.parent = n), (i.observable = r), (i.stillUnsubscribed = !0), (i.buffer = []), (i.isComplete = !1), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype[c.hZ] = function() {
                  return this;
                }),
                (e.prototype.next = function() {
                  var t = this.buffer;
                  return 0 === t.length && this.isComplete ? { value: null, done: !0 } : { value: t.shift(), done: !1 };
                }),
                (e.prototype.hasValue = function() {
                  return this.buffer.length > 0;
                }),
                (e.prototype.hasCompleted = function() {
                  return 0 === this.buffer.length && this.isComplete;
                }),
                (e.prototype.notifyComplete = function() {
                  this.buffer.length > 0 ? ((this.isComplete = !0), this.parent.notifyInactive()) : this.destination.complete();
                }),
                (e.prototype.notifyNext = function(t) {
                  this.buffer.push(t), this.parent.checkIterators();
                }),
                (e.prototype.subscribe = function() {
                  return (0, u.ft)(this.observable, new u.IY(this));
                }),
                e
              );
            })(u.Ds);
        },
        2257: (t, e, n) => {
          n.d(e, { u: () => i });
          var r = n(2556);
          function i() {
            return (0, r.J)(1);
          }
        },
        6008: (t, e, n) => {
          n.d(e, { h: () => o });
          var r = n(5987),
            i = n(979);
          function o(t, e) {
            return function(n) {
              return n.lift(new s(t, e));
            };
          }
          var s = (function() {
              function t(t, e) {
                (this.predicate = t), (this.thisArg = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new c(t, this.predicate, this.thisArg));
                }),
                t
              );
            })(),
            c = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.predicate = n), (i.thisArg = r), (i.count = 0), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  var e;
                  try {
                    e = this.predicate.call(this.thisArg, t, this.count++);
                  } catch (t) {
                    return void this.destination.error(t);
                  }
                  e && this.destination.next(t);
                }),
                e
              );
            })(i.L);
        },
        1120: (t, e, n) => {
          n.d(e, { v: () => u, T: () => f });
          var r = n(5987),
            i = n(979),
            o = n(8760),
            s = n(2772),
            c = n(211);
          function u(t, e, n, r) {
            return function(i) {
              return i.lift(new a(t, e, n, r));
            };
          }
          var a = (function() {
              function t(t, e, n, r) {
                (this.keySelector = t), (this.elementSelector = e), (this.durationSelector = n), (this.subjectSelector = r);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new h(t, this.keySelector, this.elementSelector, this.durationSelector, this.subjectSelector));
                }),
                t
              );
            })(),
            h = (function(t) {
              function e(e, n, r, i, o) {
                var s = t.call(this, e) || this;
                return (
                  (s.keySelector = n),
                  (s.elementSelector = r),
                  (s.durationSelector = i),
                  (s.subjectSelector = o),
                  (s.groups = null),
                  (s.attemptedToUnsubscribe = !1),
                  (s.count = 0),
                  s
                );
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  var e;
                  try {
                    e = this.keySelector(t);
                  } catch (t) {
                    return void this.error(t);
                  }
                  this._group(t, e);
                }),
                (e.prototype._group = function(t, e) {
                  var n = this.groups;
                  n || (n = this.groups = new Map());
                  var r,
                    i = n.get(e);
                  if (this.elementSelector)
                    try {
                      r = this.elementSelector(t);
                    } catch (t) {
                      this.error(t);
                    }
                  else r = t;
                  if (!i) {
                    (i = this.subjectSelector ? this.subjectSelector() : new c.xQ()), n.set(e, i);
                    var o = new f(e, i, this);
                    if ((this.destination.next(o), this.durationSelector)) {
                      var s = void 0;
                      try {
                        s = this.durationSelector(new f(e, i));
                      } catch (t) {
                        return void this.error(t);
                      }
                      this.add(s.subscribe(new l(e, i, this)));
                    }
                  }
                  i.closed || i.next(r);
                }),
                (e.prototype._error = function(t) {
                  var e = this.groups;
                  e &&
                    (e.forEach(function(e, n) {
                      e.error(t);
                    }),
                    e.clear()),
                    this.destination.error(t);
                }),
                (e.prototype._complete = function() {
                  var t = this.groups;
                  t &&
                    (t.forEach(function(t, e) {
                      t.complete();
                    }),
                    t.clear()),
                    this.destination.complete();
                }),
                (e.prototype.removeGroup = function(t) {
                  this.groups.delete(t);
                }),
                (e.prototype.unsubscribe = function() {
                  this.closed || ((this.attemptedToUnsubscribe = !0), 0 === this.count && t.prototype.unsubscribe.call(this));
                }),
                e
              );
            })(i.L),
            l = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, n) || this;
                return (i.key = e), (i.group = n), (i.parent = r), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.complete();
                }),
                (e.prototype._unsubscribe = function() {
                  var t = this.parent,
                    e = this.key;
                  (this.key = this.parent = null), t && t.removeGroup(e);
                }),
                e
              );
            })(i.L),
            f = (function(t) {
              function e(e, n, r) {
                var i = t.call(this) || this;
                return (i.key = e), (i.groupSubject = n), (i.refCountSubscription = r), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._subscribe = function(t) {
                  var e = new o.w(),
                    n = this.refCountSubscription,
                    r = this.groupSubject;
                  return n && !n.closed && e.add(new d(n)), e.add(r.subscribe(t)), e;
                }),
                e
              );
            })(s.y),
            d = (function(t) {
              function e(e) {
                var n = t.call(this) || this;
                return (n.parent = e), e.count++, n;
              }
              return (
                r.ZT(e, t),
                (e.prototype.unsubscribe = function() {
                  var e = this.parent;
                  e.closed || this.closed || (t.prototype.unsubscribe.call(this), (e.count -= 1), 0 === e.count && e.attemptedToUnsubscribe && e.unsubscribe());
                }),
                e
              );
            })(o.w);
        },
        5709: (t, e, n) => {
          n.d(e, { U: () => o });
          var r = n(5987),
            i = n(979);
          function o(t, e) {
            return function(n) {
              if ('function' != typeof t) throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
              return n.lift(new s(t, e));
            };
          }
          var s = (function() {
              function t(t, e) {
                (this.project = t), (this.thisArg = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new c(t, this.project, this.thisArg));
                }),
                t
              );
            })(),
            c = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.project = n), (i.count = 0), (i.thisArg = r || i), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  var e;
                  try {
                    e = this.project.call(this.thisArg, t, this.count++);
                  } catch (t) {
                    return void this.destination.error(t);
                  }
                  this.destination.next(e);
                }),
                e
              );
            })(i.L);
        },
        2556: (t, e, n) => {
          n.d(e, { J: () => o });
          var r = n(7746),
            i = n(3608);
          function o(t) {
            return void 0 === t && (t = Number.POSITIVE_INFINITY), (0, r.zg)(i.y, t);
          }
        },
        7746: (t, e, n) => {
          n.d(e, { zg: () => c, VS: () => h });
          var r = n(5987),
            i = n(5709),
            o = n(5760),
            s = n(7604);
          function c(t, e, n) {
            return (
              void 0 === n && (n = Number.POSITIVE_INFINITY),
              'function' == typeof e
                ? function(r) {
                    return r.pipe(
                      c(function(n, r) {
                        return (0, o.D)(t(n, r)).pipe(
                          (0, i.U)(function(t, i) {
                            return e(n, t, r, i);
                          })
                        );
                      }, n)
                    );
                  }
                : ('number' == typeof e && (n = e),
                  function(e) {
                    return e.lift(new u(t, n));
                  })
            );
          }
          var u = (function() {
              function t(t, e) {
                void 0 === e && (e = Number.POSITIVE_INFINITY), (this.project = t), (this.concurrent = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new a(t, this.project, this.concurrent));
                }),
                t
              );
            })(),
            a = (function(t) {
              function e(e, n, r) {
                void 0 === r && (r = Number.POSITIVE_INFINITY);
                var i = t.call(this, e) || this;
                return (i.project = n), (i.concurrent = r), (i.hasCompleted = !1), (i.buffer = []), (i.active = 0), (i.index = 0), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.active < this.concurrent ? this._tryNext(t) : this.buffer.push(t);
                }),
                (e.prototype._tryNext = function(t) {
                  var e,
                    n = this.index++;
                  try {
                    e = this.project(t, n);
                  } catch (t) {
                    return void this.destination.error(t);
                  }
                  this.active++, this._innerSub(e);
                }),
                (e.prototype._innerSub = function(t) {
                  var e = new s.IY(this),
                    n = this.destination;
                  n.add(e);
                  var r = (0, s.ft)(t, e);
                  r !== e && n.add(r);
                }),
                (e.prototype._complete = function() {
                  (this.hasCompleted = !0), 0 === this.active && 0 === this.buffer.length && this.destination.complete(), this.unsubscribe();
                }),
                (e.prototype.notifyNext = function(t) {
                  this.destination.next(t);
                }),
                (e.prototype.notifyComplete = function() {
                  var t = this.buffer;
                  this.active--, t.length > 0 ? this._next(t.shift()) : 0 === this.active && this.hasCompleted && this.destination.complete();
                }),
                e
              );
            })(s.Ds),
            h = c;
        },
        9276: (t, e, n) => {
          n.d(e, { QV: () => s, ht: () => u });
          var r = n(5987),
            i = n(979),
            o = n(2632);
          function s(t, e) {
            return (
              void 0 === e && (e = 0),
              function(n) {
                return n.lift(new c(t, e));
              }
            );
          }
          var c = (function() {
              function t(t, e) {
                void 0 === e && (e = 0), (this.scheduler = t), (this.delay = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new u(t, this.scheduler, this.delay));
                }),
                t
              );
            })(),
            u = (function(t) {
              function e(e, n, r) {
                void 0 === r && (r = 0);
                var i = t.call(this, e) || this;
                return (i.scheduler = n), (i.delay = r), i;
              }
              return (
                r.ZT(e, t),
                (e.dispatch = function(t) {
                  var e = t.notification,
                    n = t.destination;
                  e.observe(n), this.unsubscribe();
                }),
                (e.prototype.scheduleMessage = function(t) {
                  this.destination.add(this.scheduler.schedule(e.dispatch, this.delay, new a(t, this.destination)));
                }),
                (e.prototype._next = function(t) {
                  this.scheduleMessage(o.P.createNext(t));
                }),
                (e.prototype._error = function(t) {
                  this.scheduleMessage(o.P.createError(t)), this.unsubscribe();
                }),
                (e.prototype._complete = function() {
                  this.scheduleMessage(o.P.createComplete()), this.unsubscribe();
                }),
                e
              );
            })(i.L),
            a = (function() {
              return function(t, e) {
                (this.notification = t), (this.destination = e);
              };
            })();
        },
        3018: (t, e, n) => {
          n.d(e, { x: () => o });
          var r = n(5987),
            i = n(979);
          function o() {
            return function(t) {
              return t.lift(new s(t));
            };
          }
          var s = (function() {
              function t(t) {
                this.connectable = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  var n = this.connectable;
                  n._refCount++;
                  var r = new c(t, n),
                    i = e.subscribe(r);
                  return r.closed || (r.connection = n.connect()), i;
                }),
                t
              );
            })(),
            c = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.connectable = n), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._unsubscribe = function() {
                  var t = this.connectable;
                  if (t) {
                    this.connectable = null;
                    var e = t._refCount;
                    if (e <= 0) this.connection = null;
                    else if (((t._refCount = e - 1), e > 1)) this.connection = null;
                    else {
                      var n = this.connection,
                        r = t._connection;
                      (this.connection = null), !r || (n && r !== n) || r.unsubscribe();
                    }
                  } else this.connection = null;
                }),
                e
              );
            })(i.L);
        },
        3109: (t, e, n) => {
          n.d(e, { r: () => o });
          var r = n(2772),
            i = n(8760);
          function o(t, e) {
            return new r.y(function(n) {
              var r = new i.w(),
                o = 0;
              return (
                r.add(
                  e.schedule(function() {
                    o !== t.length ? (n.next(t[o++]), n.closed || r.add(this.schedule())) : n.complete();
                  })
                ),
                r
              );
            });
          }
        },
        8107: (t, e, n) => {
          n.d(e, { x: () => h });
          var r = n(2772),
            i = n(8760),
            o = n(5050),
            s = n(3109),
            c = n(999),
            u = n(336),
            a = n(9217);
          function h(t, e) {
            if (null != t) {
              if (
                (function(t) {
                  return t && 'function' == typeof t[o.L];
                })(t)
              )
                return (function(t, e) {
                  return new r.y(function(n) {
                    var r = new i.w();
                    return (
                      r.add(
                        e.schedule(function() {
                          var i = t[o.L]();
                          r.add(
                            i.subscribe({
                              next: function(t) {
                                r.add(
                                  e.schedule(function() {
                                    return n.next(t);
                                  })
                                );
                              },
                              error: function(t) {
                                r.add(
                                  e.schedule(function() {
                                    return n.error(t);
                                  })
                                );
                              },
                              complete: function() {
                                r.add(
                                  e.schedule(function() {
                                    return n.complete();
                                  })
                                );
                              },
                            })
                          );
                        })
                      ),
                      r
                    );
                  });
                })(t, e);
              if ((0, u.t)(t))
                return (function(t, e) {
                  return new r.y(function(n) {
                    var r = new i.w();
                    return (
                      r.add(
                        e.schedule(function() {
                          return t.then(
                            function(t) {
                              r.add(
                                e.schedule(function() {
                                  n.next(t),
                                    r.add(
                                      e.schedule(function() {
                                        return n.complete();
                                      })
                                    );
                                })
                              );
                            },
                            function(t) {
                              r.add(
                                e.schedule(function() {
                                  return n.error(t);
                                })
                              );
                            }
                          );
                        })
                      ),
                      r
                    );
                  });
                })(t, e);
              if ((0, a.z)(t)) return (0, s.r)(t, e);
              if (
                (function(t) {
                  return t && 'function' == typeof t[c.hZ];
                })(t) ||
                'string' == typeof t
              )
                return (function(t, e) {
                  if (!t) throw new Error('Iterable cannot be null');
                  return new r.y(function(n) {
                    var r,
                      o = new i.w();
                    return (
                      o.add(function() {
                        r && 'function' == typeof r.return && r.return();
                      }),
                      o.add(
                        e.schedule(function() {
                          (r = t[c.hZ]()),
                            o.add(
                              e.schedule(function() {
                                if (!n.closed) {
                                  var t, e;
                                  try {
                                    var i = r.next();
                                    (t = i.value), (e = i.done);
                                  } catch (t) {
                                    return void n.error(t);
                                  }
                                  e ? n.complete() : (n.next(t), this.schedule());
                                }
                              })
                            );
                        })
                      ),
                      o
                    );
                  });
                })(t, e);
            }
            throw new TypeError(((null !== t && typeof t) || t) + ' is not observable');
          }
        },
        6114: (t, e, n) => {
          n.d(e, { o: () => i });
          var r = n(5987),
            i = (function(t) {
              function e(e, n) {
                var r = t.call(this, e, n) || this;
                return (r.scheduler = e), (r.work = n), (r.pending = !1), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype.schedule = function(t, e) {
                  if ((void 0 === e && (e = 0), this.closed)) return this;
                  this.state = t;
                  var n = this.id,
                    r = this.scheduler;
                  return (
                    null != n && (this.id = this.recycleAsyncId(r, n, e)), (this.pending = !0), (this.delay = e), (this.id = this.id || this.requestAsyncId(r, this.id, e)), this
                  );
                }),
                (e.prototype.requestAsyncId = function(t, e, n) {
                  return void 0 === n && (n = 0), setInterval(t.flush.bind(t, this), n);
                }),
                (e.prototype.recycleAsyncId = function(t, e, n) {
                  if ((void 0 === n && (n = 0), null !== n && this.delay === n && !1 === this.pending)) return e;
                  clearInterval(e);
                }),
                (e.prototype.execute = function(t, e) {
                  if (this.closed) return new Error('executing a cancelled action');
                  this.pending = !1;
                  var n = this._execute(t, e);
                  if (n) return n;
                  !1 === this.pending && null != this.id && (this.id = this.recycleAsyncId(this.scheduler, this.id, null));
                }),
                (e.prototype._execute = function(t, e) {
                  var n = !1,
                    r = void 0;
                  try {
                    this.work(t);
                  } catch (t) {
                    (n = !0), (r = (!!t && t) || new Error(t));
                  }
                  if (n) return this.unsubscribe(), r;
                }),
                (e.prototype._unsubscribe = function() {
                  var t = this.id,
                    e = this.scheduler,
                    n = e.actions,
                    r = n.indexOf(this);
                  (this.work = null),
                    (this.state = null),
                    (this.pending = !1),
                    (this.scheduler = null),
                    -1 !== r && n.splice(r, 1),
                    null != t && (this.id = this.recycleAsyncId(e, t, null)),
                    (this.delay = null);
                }),
                e
              );
            })(
              (function(t) {
                function e(e, n) {
                  return t.call(this) || this;
                }
                return (
                  r.ZT(e, t),
                  (e.prototype.schedule = function(t, e) {
                    return void 0 === e && (e = 0), this;
                  }),
                  e
                );
              })(n(8760).w)
            );
        },
        8399: (t, e, n) => {
          n.d(e, { v: () => o });
          var r = n(5987),
            i = n(8725),
            o = (function(t) {
              function e(n, r) {
                void 0 === r && (r = i.b.now);
                var o =
                  t.call(this, n, function() {
                    return e.delegate && e.delegate !== o ? e.delegate.now() : r();
                  }) || this;
                return (o.actions = []), (o.active = !1), (o.scheduled = void 0), o;
              }
              return (
                r.ZT(e, t),
                (e.prototype.schedule = function(n, r, i) {
                  return void 0 === r && (r = 0), e.delegate && e.delegate !== this ? e.delegate.schedule(n, r, i) : t.prototype.schedule.call(this, n, r, i);
                }),
                (e.prototype.flush = function(t) {
                  var e = this.actions;
                  if (this.active) e.push(t);
                  else {
                    var n;
                    this.active = !0;
                    do {
                      if ((n = t.execute(t.state, t.delay))) break;
                    } while ((t = e.shift()));
                    if (((this.active = !1), n)) {
                      for (; (t = e.shift()); ) t.unsubscribe();
                      throw n;
                    }
                  }
                }),
                e
              );
            })(i.b);
        },
        6650: (t, e, n) => {
          n.d(e, { e: () => l, E: () => h });
          var r = n(5987),
            i = 1,
            o = (function() {
              return Promise.resolve();
            })(),
            s = {};
          function c(t) {
            return t in s && (delete s[t], !0);
          }
          var u = (function(t) {
              function e(e, n) {
                var r = t.call(this, e, n) || this;
                return (r.scheduler = e), (r.work = n), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype.requestAsyncId = function(e, n, r) {
                  return (
                    void 0 === r && (r = 0),
                    null !== r && r > 0
                      ? t.prototype.requestAsyncId.call(this, e, n, r)
                      : (e.actions.push(this),
                        e.scheduled ||
                          (e.scheduled =
                            ((u = e.flush.bind(e, null)),
                            (a = i++),
                            (s[a] = !0),
                            o.then(function() {
                              return c(a) && u();
                            }),
                            a)))
                  );
                  var u, a;
                }),
                (e.prototype.recycleAsyncId = function(e, n, r) {
                  if ((void 0 === r && (r = 0), (null !== r && r > 0) || (null === r && this.delay > 0))) return t.prototype.recycleAsyncId.call(this, e, n, r);
                  0 === e.actions.length && (c(n), (e.scheduled = void 0));
                }),
                e
              );
            })(n(6114).o),
            a = (function(t) {
              function e() {
                return (null !== t && t.apply(this, arguments)) || this;
              }
              return (
                r.ZT(e, t),
                (e.prototype.flush = function(t) {
                  (this.active = !0), (this.scheduled = void 0);
                  var e,
                    n = this.actions,
                    r = -1,
                    i = n.length;
                  t = t || n.shift();
                  do {
                    if ((e = t.execute(t.state, t.delay))) break;
                  } while (++r < i && (t = n.shift()));
                  if (((this.active = !1), e)) {
                    for (; ++r < i && (t = n.shift()); ) t.unsubscribe();
                    throw e;
                  }
                }),
                e
              );
            })(n(8399).v),
            h = new a(u),
            l = h;
        },
        964: (t, e, n) => {
          n.d(e, { z: () => i, P: () => o });
          var r = n(6114),
            i = new (n(8399).v)(r.o),
            o = i;
        },
        2546: (t, e, n) => {
          n.d(e, { c: () => c, N: () => s });
          var r = n(5987),
            i = (function(t) {
              function e(e, n) {
                var r = t.call(this, e, n) || this;
                return (r.scheduler = e), (r.work = n), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype.schedule = function(e, n) {
                  return void 0 === n && (n = 0), n > 0 ? t.prototype.schedule.call(this, e, n) : ((this.delay = n), (this.state = e), this.scheduler.flush(this), this);
                }),
                (e.prototype.execute = function(e, n) {
                  return n > 0 || this.closed ? t.prototype.execute.call(this, e, n) : this._execute(e, n);
                }),
                (e.prototype.requestAsyncId = function(e, n, r) {
                  return void 0 === r && (r = 0), (null !== r && r > 0) || (null === r && this.delay > 0) ? t.prototype.requestAsyncId.call(this, e, n, r) : e.flush(this);
                }),
                e
              );
            })(n(6114).o),
            o = (function(t) {
              function e() {
                return (null !== t && t.apply(this, arguments)) || this;
              }
              return r.ZT(e, t), e;
            })(n(8399).v),
            s = new o(i),
            c = s;
        },
        999: (t, e, n) => {
          function r() {
            return 'function' == typeof Symbol && Symbol.iterator ? Symbol.iterator : '@@iterator';
          }
          n.d(e, { hZ: () => i });
          var i = r();
        },
        5050: (t, e, n) => {
          n.d(e, { L: () => r });
          var r = (function() {
            return ('function' == typeof Symbol && Symbol.observable) || '@@observable';
          })();
        },
        3142: (t, e, n) => {
          n.d(e, { b: () => r });
          var r = (function() {
            return 'function' == typeof Symbol ? Symbol('rxSubscriber') : '@@rxSubscriber_' + Math.random();
          })();
        },
        6565: (t, e, n) => {
          n.d(e, { W: () => r });
          var r = (function() {
            function t() {
              return Error.call(this), (this.message = 'argument out of range'), (this.name = 'ArgumentOutOfRangeError'), this;
            }
            return (t.prototype = Object.create(Error.prototype)), t;
          })();
        },
        6929: (t, e, n) => {
          n.d(e, { K: () => r });
          var r = (function() {
            function t() {
              return Error.call(this), (this.message = 'no elements in sequence'), (this.name = 'EmptyError'), this;
            }
            return (t.prototype = Object.create(Error.prototype)), t;
          })();
        },
        1016: (t, e, n) => {
          n.d(e, { N: () => r });
          var r = (function() {
            function t() {
              return Error.call(this), (this.message = 'object unsubscribed'), (this.name = 'ObjectUnsubscribedError'), this;
            }
            return (t.prototype = Object.create(Error.prototype)), t;
          })();
        },
        1462: (t, e, n) => {
          n.d(e, { W: () => r });
          var r = (function() {
            function t() {
              return Error.call(this), (this.message = 'Timeout has occurred'), (this.name = 'TimeoutError'), this;
            }
            return (t.prototype = Object.create(Error.prototype)), t;
          })();
        },
        8782: (t, e, n) => {
          n.d(e, { B: () => r });
          var r = (function() {
            function t(t) {
              return (
                Error.call(this),
                (this.message = t
                  ? t.length +
                    ' errors occurred during unsubscription:\n' +
                    t
                      .map(function(t, e) {
                        return e + 1 + ') ' + t.toString();
                      })
                      .join('\n  ')
                  : ''),
                (this.name = 'UnsubscriptionError'),
                (this.errors = t),
                this
              );
            }
            return (t.prototype = Object.create(Error.prototype)), t;
          })();
        },
        3642: (t, e, n) => {
          n.d(e, { _: () => i });
          var r = n(979);
          function i(t) {
            for (; t; ) {
              var e = t,
                n = e.closed,
                i = e.destination,
                o = e.isStopped;
              if (n || o) return !1;
              t = i && i instanceof r.L ? i : null;
            }
            return !0;
          }
        },
        1644: (t, e, n) => {
          function r(t) {
            setTimeout(function() {
              throw t;
            }, 0);
          }
          n.d(e, { z: () => r });
        },
        3608: (t, e, n) => {
          function r(t) {
            return t;
          }
          n.d(e, { y: () => r });
        },
        9026: (t, e, n) => {
          n.d(e, { k: () => r });
          var r = (function() {
            return (
              Array.isArray ||
              function(t) {
                return t && 'number' == typeof t.length;
              }
            );
          })();
        },
        9217: (t, e, n) => {
          n.d(e, { z: () => r });
          var r = function(t) {
            return t && 'number' == typeof t.length && 'function' != typeof t;
          };
        },
        4156: (t, e, n) => {
          function r(t) {
            return 'function' == typeof t;
          }
          n.d(e, { m: () => r });
        },
        5812: (t, e, n) => {
          n.d(e, { k: () => i });
          var r = n(9026);
          function i(t) {
            return !(0, r.k)(t) && t - parseFloat(t) + 1 >= 0;
          }
        },
        2009: (t, e, n) => {
          function r(t) {
            return null !== t && 'object' == typeof t;
          }
          n.d(e, { K: () => r });
        },
        336: (t, e, n) => {
          function r(t) {
            return !!t && 'function' != typeof t.subscribe && 'function' == typeof t.then;
          }
          n.d(e, { t: () => r });
        },
        7507: (t, e, n) => {
          function r(t) {
            return t && 'function' == typeof t.schedule;
          }
          n.d(e, { K: () => r });
        },
        3306: (t, e, n) => {
          function r() {}
          n.d(e, { Z: () => r });
        },
        8463: (t, e, n) => {
          function r(t, e) {
            function n() {
              return !n.pred.apply(n.thisArg, arguments);
            }
            return (n.pred = t), (n.thisArg = e), n;
          }
          n.d(e, { f: () => r });
        },
        2561: (t, e, n) => {
          n.d(e, { z: () => i, U: () => o });
          var r = n(3608);
          function i() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            return o(t);
          }
          function o(t) {
            return 0 === t.length
              ? r.y
              : 1 === t.length
              ? t[0]
              : function(e) {
                  return t.reduce(function(t, e) {
                    return e(t);
                  }, e);
                };
          }
        },
        7843: (t, e, n) => {
          n.d(e, { s: () => h });
          var r = n(6900),
            i = n(1644),
            o = n(999),
            s = n(5050),
            c = n(9217),
            u = n(336),
            a = n(2009),
            h = function(t) {
              if (t && 'function' == typeof t[s.L])
                return (
                  (h = t),
                  function(t) {
                    var e = h[s.L]();
                    if ('function' != typeof e.subscribe) throw new TypeError('Provided object does not correctly implement Symbol.observable');
                    return e.subscribe(t);
                  }
                );
              if ((0, c.z)(t)) return (0, r.V)(t);
              if ((0, u.t)(t))
                return (
                  (n = t),
                  function(t) {
                    return (
                      n
                        .then(
                          function(e) {
                            t.closed || (t.next(e), t.complete());
                          },
                          function(e) {
                            return t.error(e);
                          }
                        )
                        .then(null, i.z),
                      t
                    );
                  }
                );
              if (t && 'function' == typeof t[o.hZ])
                return (
                  (e = t),
                  function(t) {
                    for (var n = e[o.hZ](); ; ) {
                      var r = void 0;
                      try {
                        r = n.next();
                      } catch (e) {
                        return t.error(e), t;
                      }
                      if (r.done) {
                        t.complete();
                        break;
                      }
                      if ((t.next(r.value), t.closed)) break;
                    }
                    return (
                      'function' == typeof n.return &&
                        t.add(function() {
                          n.return && n.return();
                        }),
                      t
                    );
                  }
                );
              var e,
                n,
                h,
                l = (0, a.K)(t) ? 'an invalid object' : "'" + t + "'";
              throw new TypeError('You provided ' + l + ' where a stream was expected. You can provide an Observable, Promise, Array, or Iterable.');
            };
        },
        6900: (t, e, n) => {
          n.d(e, { V: () => r });
          var r = function(t) {
            return function(e) {
              for (var n = 0, r = t.length; n < r && !e.closed; n++) e.next(t[n]);
              e.complete();
            };
          };
        },
        2080: (t, e, n) => {
          n.d(e, { D: () => c });
          var r = n(5987),
            i = (function(t) {
              function e(e, n, r) {
                var i = t.call(this) || this;
                return (i.parent = e), (i.outerValue = n), (i.outerIndex = r), (i.index = 0), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.parent.notifyNext(this.outerValue, t, this.outerIndex, this.index++, this);
                }),
                (e.prototype._error = function(t) {
                  this.parent.notifyError(t, this), this.unsubscribe();
                }),
                (e.prototype._complete = function() {
                  this.parent.notifyComplete(this), this.unsubscribe();
                }),
                e
              );
            })(n(979).L),
            o = n(7843),
            s = n(2772);
          function c(t, e, n, r, c) {
            if ((void 0 === c && (c = new i(t, n, r)), !c.closed)) return e instanceof s.y ? e.subscribe(c) : (0, o.s)(e)(c);
          }
        },
        1717: (t, e, n) => {
          n.r(e),
            n.d(e, {
              audit: () => o,
              auditTime: () => h,
              buffer: () => l,
              bufferCount: () => b,
              bufferTime: () => g,
              bufferToggle: () => D,
              bufferWhen: () => L,
              catchError: () => j,
              combineAll: () => z,
              combineLatest: () => W,
              concat: () => Y,
              concatAll: () => q.u,
              concatMap: () => G,
              concatMapTo: () => Q,
              count: () => H,
              debounce: () => X,
              debounceTime: () => nt,
              defaultIfEmpty: () => st,
              delay: () => lt,
              delayWhen: () => vt,
              dematerialize: () => _t,
              distinct: () => Tt,
              distinctUntilChanged: () => Ct,
              distinctUntilKeyChanged: () => Dt,
              elementAt: () => Ft,
              endWith: () => Bt,
              every: () => Yt,
              exhaust: () => Gt,
              exhaustMap: () => $t,
              expand: () => ee,
              filter: () => Vt.h,
              finalize: () => ie,
              find: () => ce,
              findIndex: () => he,
              first: () => fe,
              flatMap: () => K.VS,
              groupBy: () => de.v,
              ignoreElements: () => pe,
              isEmpty: () => ye,
              last: () => Se,
              map: () => Jt.U,
              mapTo: () => Te,
              materialize: () => Ce,
              max: () => Ae,
              merge: () => Ze,
              mergeAll: () => Re.J,
              mergeMap: () => K.zg,
              mergeMapTo: () => Me,
              mergeScan: () => ze,
              min: () => We,
              multicast: () => Ye,
              observeOn: () => Ke.QV,
              onErrorResumeNext: () => Ge,
              pairwise: () => Je,
              partition: () => en,
              pluck: () => nn,
              publish: () => sn,
              publishBehavior: () => un,
              publishLast: () => hn,
              publishReplay: () => fn,
              race: () => pn,
              reduce: () => Oe,
              refCount: () => Cn.x,
              repeat: () => bn,
              repeatWhen: () => mn,
              retry: () => _n,
              retryWhen: () => Tn,
              sample: () => Nn,
              sampleTime: () => Pn,
              scan: () => De,
              sequenceEqual: () => An,
              share: () => zn,
              shareReplay: () => Un,
              single: () => Fn,
              skip: () => Yn,
              skipLast: () => Gn,
              skipUntil: () => Jn,
              skipWhile: () => tr,
              startWith: () => rr,
              subscribeOn: () => cr,
              switchAll: () => fr,
              switchMap: () => ar,
              switchMapTo: () => dr,
              take: () => Mt,
              takeLast: () => ge,
              takeUntil: () => pr,
              takeWhile: () => yr,
              tap: () => xr,
              throttle: () => kr,
              throttleTime: () => Ir,
              throwIfEmpty: () => Ot,
              timeInterval: () => Or,
              timeout: () => Ur,
              timeoutWith: () => Zr,
              timestamp: () => Fr,
              toArray: () => Yr,
              window: () => qr,
              windowCount: () => Qr,
              windowTime: () => $r,
              windowToggle: () => oi,
              windowWhen: () => ui,
              withLatestFrom: () => li,
              zip: () => bi,
              zipAll: () => vi,
            });
          var r = n(5987),
            i = n(7604);
          function o(t) {
            return function(e) {
              return e.lift(new s(t));
            };
          }
          var s = (function() {
              function t(t) {
                this.durationSelector = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new c(t, this.durationSelector));
                }),
                t
              );
            })(),
            c = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.durationSelector = n), (r.hasValue = !1), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  if (((this.value = t), (this.hasValue = !0), !this.throttled)) {
                    var e = void 0;
                    try {
                      e = (0, this.durationSelector)(t);
                    } catch (t) {
                      return this.destination.error(t);
                    }
                    var n = (0, i.ft)(e, new i.IY(this));
                    !n || n.closed ? this.clearThrottle() : this.add((this.throttled = n));
                  }
                }),
                (e.prototype.clearThrottle = function() {
                  var t = this,
                    e = t.value,
                    n = t.hasValue,
                    r = t.throttled;
                  r && (this.remove(r), (this.throttled = void 0), r.unsubscribe()), n && ((this.value = void 0), (this.hasValue = !1), this.destination.next(e));
                }),
                (e.prototype.notifyNext = function() {
                  this.clearThrottle();
                }),
                (e.prototype.notifyComplete = function() {
                  this.clearThrottle();
                }),
                e
              );
            })(i.Ds),
            u = n(964),
            a = n(9604);
          function h(t, e) {
            return (
              void 0 === e && (e = u.P),
              o(function() {
                return (0, a.H)(t, e);
              })
            );
          }
          function l(t) {
            return function(e) {
              return e.lift(new f(t));
            };
          }
          var f = (function() {
              function t(t) {
                this.closingNotifier = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new d(t, this.closingNotifier));
                }),
                t
              );
            })(),
            d = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.buffer = []), r.add((0, i.ft)(n, new i.IY(r))), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.buffer.push(t);
                }),
                (e.prototype.notifyNext = function() {
                  var t = this.buffer;
                  (this.buffer = []), this.destination.next(t);
                }),
                e
              );
            })(i.Ds),
            p = n(979);
          function b(t, e) {
            return (
              void 0 === e && (e = null),
              function(n) {
                return n.lift(new v(t, e));
              }
            );
          }
          var v = (function() {
              function t(t, e) {
                (this.bufferSize = t), (this.startBufferEvery = e), (this.subscriberClass = e && t !== e ? m : y);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new this.subscriberClass(t, this.bufferSize, this.startBufferEvery));
                }),
                t
              );
            })(),
            y = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.bufferSize = n), (r.buffer = []), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  var e = this.buffer;
                  e.push(t), e.length == this.bufferSize && (this.destination.next(e), (this.buffer = []));
                }),
                (e.prototype._complete = function() {
                  var e = this.buffer;
                  e.length > 0 && this.destination.next(e), t.prototype._complete.call(this);
                }),
                e
              );
            })(p.L),
            m = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.bufferSize = n), (i.startBufferEvery = r), (i.buffers = []), (i.count = 0), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  var e = this,
                    n = e.bufferSize,
                    r = e.startBufferEvery,
                    i = e.buffers,
                    o = e.count;
                  this.count++, o % r == 0 && i.push([]);
                  for (var s = i.length; s--; ) {
                    var c = i[s];
                    c.push(t), c.length === n && (i.splice(s, 1), this.destination.next(c));
                  }
                }),
                (e.prototype._complete = function() {
                  for (var e = this.buffers, n = this.destination; e.length > 0; ) {
                    var r = e.shift();
                    r.length > 0 && n.next(r);
                  }
                  t.prototype._complete.call(this);
                }),
                e
              );
            })(p.L),
            w = n(7507);
          function g(t) {
            var e = arguments.length,
              n = u.P;
            (0, w.K)(arguments[arguments.length - 1]) && ((n = arguments[arguments.length - 1]), e--);
            var r = null;
            e >= 2 && (r = arguments[1]);
            var i = Number.POSITIVE_INFINITY;
            return (
              e >= 3 && (i = arguments[2]),
              function(e) {
                return e.lift(new _(t, r, i, n));
              }
            );
          }
          var _ = (function() {
              function t(t, e, n, r) {
                (this.bufferTimeSpan = t), (this.bufferCreationInterval = e), (this.maxBufferSize = n), (this.scheduler = r);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new S(t, this.bufferTimeSpan, this.bufferCreationInterval, this.maxBufferSize, this.scheduler));
                }),
                t
              );
            })(),
            x = (function() {
              return function() {
                this.buffer = [];
              };
            })(),
            S = (function(t) {
              function e(e, n, r, i, o) {
                var s = t.call(this, e) || this;
                (s.bufferTimeSpan = n), (s.bufferCreationInterval = r), (s.maxBufferSize = i), (s.scheduler = o), (s.contexts = []);
                var c = s.openContext();
                if (((s.timespanOnly = null == r || r < 0), s.timespanOnly)) {
                  var u = { subscriber: s, context: c, bufferTimeSpan: n };
                  s.add((c.closeAction = o.schedule(T, n, u)));
                } else {
                  var a = { subscriber: s, context: c },
                    h = { bufferTimeSpan: n, bufferCreationInterval: r, subscriber: s, scheduler: o };
                  s.add((c.closeAction = o.schedule(k, n, a))), s.add(o.schedule(E, r, h));
                }
                return s;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  for (var e, n = this.contexts, r = n.length, i = 0; i < r; i++) {
                    var o = n[i],
                      s = o.buffer;
                    s.push(t), s.length == this.maxBufferSize && (e = o);
                  }
                  e && this.onBufferFull(e);
                }),
                (e.prototype._error = function(e) {
                  (this.contexts.length = 0), t.prototype._error.call(this, e);
                }),
                (e.prototype._complete = function() {
                  for (var e = this.contexts, n = this.destination; e.length > 0; ) {
                    var r = e.shift();
                    n.next(r.buffer);
                  }
                  t.prototype._complete.call(this);
                }),
                (e.prototype._unsubscribe = function() {
                  this.contexts = null;
                }),
                (e.prototype.onBufferFull = function(t) {
                  this.closeContext(t);
                  var e = t.closeAction;
                  if ((e.unsubscribe(), this.remove(e), !this.closed && this.timespanOnly)) {
                    t = this.openContext();
                    var n = this.bufferTimeSpan,
                      r = { subscriber: this, context: t, bufferTimeSpan: n };
                    this.add((t.closeAction = this.scheduler.schedule(T, n, r)));
                  }
                }),
                (e.prototype.openContext = function() {
                  var t = new x();
                  return this.contexts.push(t), t;
                }),
                (e.prototype.closeContext = function(t) {
                  this.destination.next(t.buffer);
                  var e = this.contexts;
                  (e ? e.indexOf(t) : -1) >= 0 && e.splice(e.indexOf(t), 1);
                }),
                e
              );
            })(p.L);
          function T(t) {
            var e = t.subscriber,
              n = t.context;
            n && e.closeContext(n), e.closed || ((t.context = e.openContext()), (t.context.closeAction = this.schedule(t, t.bufferTimeSpan)));
          }
          function E(t) {
            var e = t.bufferCreationInterval,
              n = t.bufferTimeSpan,
              r = t.subscriber,
              i = t.scheduler,
              o = r.openContext();
            r.closed || (r.add((o.closeAction = i.schedule(k, n, { subscriber: r, context: o }))), this.schedule(t, e));
          }
          function k(t) {
            var e = t.subscriber,
              n = t.context;
            e.closeContext(n);
          }
          var C = n(8760),
            N = n(2080),
            I = n(2039);
          function D(t, e) {
            return function(n) {
              return n.lift(new P(t, e));
            };
          }
          var P = (function() {
              function t(t, e) {
                (this.openings = t), (this.closingSelector = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new V(t, this.openings, this.closingSelector));
                }),
                t
              );
            })(),
            V = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.closingSelector = r), (i.contexts = []), i.add((0, N.D)(i, n)), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  for (var e = this.contexts, n = e.length, r = 0; r < n; r++) e[r].buffer.push(t);
                }),
                (e.prototype._error = function(e) {
                  for (var n = this.contexts; n.length > 0; ) {
                    var r = n.shift();
                    r.subscription.unsubscribe(), (r.buffer = null), (r.subscription = null);
                  }
                  (this.contexts = null), t.prototype._error.call(this, e);
                }),
                (e.prototype._complete = function() {
                  for (var e = this.contexts; e.length > 0; ) {
                    var n = e.shift();
                    this.destination.next(n.buffer), n.subscription.unsubscribe(), (n.buffer = null), (n.subscription = null);
                  }
                  (this.contexts = null), t.prototype._complete.call(this);
                }),
                (e.prototype.notifyNext = function(t, e) {
                  t ? this.closeBuffer(t) : this.openBuffer(e);
                }),
                (e.prototype.notifyComplete = function(t) {
                  this.closeBuffer(t.context);
                }),
                (e.prototype.openBuffer = function(t) {
                  try {
                    var e = this.closingSelector.call(this, t);
                    e && this.trySubscribe(e);
                  } catch (t) {
                    this._error(t);
                  }
                }),
                (e.prototype.closeBuffer = function(t) {
                  var e = this.contexts;
                  if (e && t) {
                    var n = t.buffer,
                      r = t.subscription;
                    this.destination.next(n), e.splice(e.indexOf(t), 1), this.remove(r), r.unsubscribe();
                  }
                }),
                (e.prototype.trySubscribe = function(t) {
                  var e = this.contexts,
                    n = new C.w(),
                    r = { buffer: [], subscription: n };
                  e.push(r);
                  var i = (0, N.D)(this, t, r);
                  !i || i.closed ? this.closeBuffer(r) : ((i.context = r), this.add(i), n.add(i));
                }),
                e
              );
            })(I.L);
          function L(t) {
            return function(e) {
              return e.lift(new O(t));
            };
          }
          var O = (function() {
              function t(t) {
                this.closingSelector = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new A(t, this.closingSelector));
                }),
                t
              );
            })(),
            A = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.closingSelector = n), (r.subscribing = !1), r.openBuffer(), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.buffer.push(t);
                }),
                (e.prototype._complete = function() {
                  var e = this.buffer;
                  e && this.destination.next(e), t.prototype._complete.call(this);
                }),
                (e.prototype._unsubscribe = function() {
                  (this.buffer = void 0), (this.subscribing = !1);
                }),
                (e.prototype.notifyNext = function() {
                  this.openBuffer();
                }),
                (e.prototype.notifyComplete = function() {
                  this.subscribing ? this.complete() : this.openBuffer();
                }),
                (e.prototype.openBuffer = function() {
                  var t = this.closingSubscription;
                  t && (this.remove(t), t.unsubscribe());
                  var e,
                    n = this.buffer;
                  this.buffer && this.destination.next(n), (this.buffer = []);
                  try {
                    e = (0, this.closingSelector)();
                  } catch (t) {
                    return this.error(t);
                  }
                  (t = new C.w()), (this.closingSubscription = t), this.add(t), (this.subscribing = !0), t.add((0, i.ft)(e, new i.IY(this))), (this.subscribing = !1);
                }),
                e
              );
            })(i.Ds);
          function j(t) {
            return function(e) {
              var n = new Z(t),
                r = e.lift(n);
              return (n.caught = r);
            };
          }
          var Z = (function() {
              function t(t) {
                this.selector = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new R(t, this.selector, this.caught));
                }),
                t
              );
            })(),
            R = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.selector = n), (i.caught = r), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype.error = function(e) {
                  if (!this.isStopped) {
                    var n = void 0;
                    try {
                      n = this.selector(e, this.caught);
                    } catch (e) {
                      return void t.prototype.error.call(this, e);
                    }
                    this._unsubscribeAndRecycle();
                    var r = new i.IY(this);
                    this.add(r);
                    var o = (0, i.ft)(n, r);
                    o !== r && this.add(o);
                  }
                }),
                e
              );
            })(i.Ds),
            M = n(5142);
          function z(t) {
            return function(e) {
              return e.lift(new M.Ms(t));
            };
          }
          var U = n(9026),
            F = n(5760);
          function W() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            var n = null;
            return (
              'function' == typeof t[t.length - 1] && (n = t.pop()),
              1 === t.length && (0, U.k)(t[0]) && (t = t[0].slice()),
              function(e) {
                return e.lift.call((0, F.D)([e].concat(t)), new M.Ms(n));
              }
            );
          }
          var B = n(9795);
          function Y() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            return function(e) {
              return e.lift.call(B.z.apply(void 0, [e].concat(t)));
            };
          }
          var q = n(2257),
            K = n(7746);
          function G(t, e) {
            return (0, K.zg)(t, e, 1);
          }
          function Q(t, e) {
            return G(function() {
              return t;
            }, e);
          }
          function H(t) {
            return function(e) {
              return e.lift(new J(t, e));
            };
          }
          var J = (function() {
              function t(t, e) {
                (this.predicate = t), (this.source = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new $(t, this.predicate, this.source));
                }),
                t
              );
            })(),
            $ = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.predicate = n), (i.source = r), (i.count = 0), (i.index = 0), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.predicate ? this._tryPredicate(t) : this.count++;
                }),
                (e.prototype._tryPredicate = function(t) {
                  var e;
                  try {
                    e = this.predicate(t, this.index++, this.source);
                  } catch (t) {
                    return void this.destination.error(t);
                  }
                  e && this.count++;
                }),
                (e.prototype._complete = function() {
                  this.destination.next(this.count), this.destination.complete();
                }),
                e
              );
            })(p.L);
          function X(t) {
            return function(e) {
              return e.lift(new tt(t));
            };
          }
          var tt = (function() {
              function t(t) {
                this.durationSelector = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new et(t, this.durationSelector));
                }),
                t
              );
            })(),
            et = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.durationSelector = n), (r.hasValue = !1), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  try {
                    var e = this.durationSelector.call(this, t);
                    e && this._tryNext(t, e);
                  } catch (t) {
                    this.destination.error(t);
                  }
                }),
                (e.prototype._complete = function() {
                  this.emitValue(), this.destination.complete();
                }),
                (e.prototype._tryNext = function(t, e) {
                  var n = this.durationSubscription;
                  (this.value = t),
                    (this.hasValue = !0),
                    n && (n.unsubscribe(), this.remove(n)),
                    (n = (0, i.ft)(e, new i.IY(this))) && !n.closed && this.add((this.durationSubscription = n));
                }),
                (e.prototype.notifyNext = function() {
                  this.emitValue();
                }),
                (e.prototype.notifyComplete = function() {
                  this.emitValue();
                }),
                (e.prototype.emitValue = function() {
                  if (this.hasValue) {
                    var e = this.value,
                      n = this.durationSubscription;
                    n && ((this.durationSubscription = void 0), n.unsubscribe(), this.remove(n)), (this.value = void 0), (this.hasValue = !1), t.prototype._next.call(this, e);
                  }
                }),
                e
              );
            })(i.Ds);
          function nt(t, e) {
            return (
              void 0 === e && (e = u.P),
              function(n) {
                return n.lift(new rt(t, e));
              }
            );
          }
          var rt = (function() {
              function t(t, e) {
                (this.dueTime = t), (this.scheduler = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new it(t, this.dueTime, this.scheduler));
                }),
                t
              );
            })(),
            it = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.dueTime = n), (i.scheduler = r), (i.debouncedSubscription = null), (i.lastValue = null), (i.hasValue = !1), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.clearDebounce(), (this.lastValue = t), (this.hasValue = !0), this.add((this.debouncedSubscription = this.scheduler.schedule(ot, this.dueTime, this)));
                }),
                (e.prototype._complete = function() {
                  this.debouncedNext(), this.destination.complete();
                }),
                (e.prototype.debouncedNext = function() {
                  if ((this.clearDebounce(), this.hasValue)) {
                    var t = this.lastValue;
                    (this.lastValue = null), (this.hasValue = !1), this.destination.next(t);
                  }
                }),
                (e.prototype.clearDebounce = function() {
                  var t = this.debouncedSubscription;
                  null !== t && (this.remove(t), t.unsubscribe(), (this.debouncedSubscription = null));
                }),
                e
              );
            })(p.L);
          function ot(t) {
            t.debouncedNext();
          }
          function st(t) {
            return (
              void 0 === t && (t = null),
              function(e) {
                return e.lift(new ct(t));
              }
            );
          }
          var ct = (function() {
              function t(t) {
                this.defaultValue = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new ut(t, this.defaultValue));
                }),
                t
              );
            })(),
            ut = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.defaultValue = n), (r.isEmpty = !0), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  (this.isEmpty = !1), this.destination.next(t);
                }),
                (e.prototype._complete = function() {
                  this.isEmpty && this.destination.next(this.defaultValue), this.destination.complete();
                }),
                e
              );
            })(p.L);
          function at(t) {
            return t instanceof Date && !isNaN(+t);
          }
          var ht = n(2632);
          function lt(t, e) {
            void 0 === e && (e = u.P);
            var n = at(t) ? +t - e.now() : Math.abs(t);
            return function(t) {
              return t.lift(new ft(n, e));
            };
          }
          var ft = (function() {
              function t(t, e) {
                (this.delay = t), (this.scheduler = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new dt(t, this.delay, this.scheduler));
                }),
                t
              );
            })(),
            dt = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.delay = n), (i.scheduler = r), (i.queue = []), (i.active = !1), (i.errored = !1), i;
              }
              return (
                r.ZT(e, t),
                (e.dispatch = function(t) {
                  for (var e = t.source, n = e.queue, r = t.scheduler, i = t.destination; n.length > 0 && n[0].time - r.now() <= 0; ) n.shift().notification.observe(i);
                  if (n.length > 0) {
                    var o = Math.max(0, n[0].time - r.now());
                    this.schedule(t, o);
                  } else this.unsubscribe(), (e.active = !1);
                }),
                (e.prototype._schedule = function(t) {
                  (this.active = !0), this.destination.add(t.schedule(e.dispatch, this.delay, { source: this, destination: this.destination, scheduler: t }));
                }),
                (e.prototype.scheduleNotification = function(t) {
                  if (!0 !== this.errored) {
                    var e = this.scheduler,
                      n = new pt(e.now() + this.delay, t);
                    this.queue.push(n), !1 === this.active && this._schedule(e);
                  }
                }),
                (e.prototype._next = function(t) {
                  this.scheduleNotification(ht.P.createNext(t));
                }),
                (e.prototype._error = function(t) {
                  (this.errored = !0), (this.queue = []), this.destination.error(t), this.unsubscribe();
                }),
                (e.prototype._complete = function() {
                  this.scheduleNotification(ht.P.createComplete()), this.unsubscribe();
                }),
                e
              );
            })(p.L),
            pt = (function() {
              return function(t, e) {
                (this.time = t), (this.notification = e);
              };
            })(),
            bt = n(2772);
          function vt(t, e) {
            return e
              ? function(n) {
                  return new wt(n, e).lift(new yt(t));
                }
              : function(e) {
                  return e.lift(new yt(t));
                };
          }
          var yt = (function() {
              function t(t) {
                this.delayDurationSelector = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new mt(t, this.delayDurationSelector));
                }),
                t
              );
            })(),
            mt = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.delayDurationSelector = n), (r.completed = !1), (r.delayNotifierSubscriptions = []), (r.index = 0), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype.notifyNext = function(t, e, n, r, i) {
                  this.destination.next(t), this.removeSubscription(i), this.tryComplete();
                }),
                (e.prototype.notifyError = function(t, e) {
                  this._error(t);
                }),
                (e.prototype.notifyComplete = function(t) {
                  var e = this.removeSubscription(t);
                  e && this.destination.next(e), this.tryComplete();
                }),
                (e.prototype._next = function(t) {
                  var e = this.index++;
                  try {
                    var n = this.delayDurationSelector(t, e);
                    n && this.tryDelay(n, t);
                  } catch (t) {
                    this.destination.error(t);
                  }
                }),
                (e.prototype._complete = function() {
                  (this.completed = !0), this.tryComplete(), this.unsubscribe();
                }),
                (e.prototype.removeSubscription = function(t) {
                  t.unsubscribe();
                  var e = this.delayNotifierSubscriptions.indexOf(t);
                  return -1 !== e && this.delayNotifierSubscriptions.splice(e, 1), t.outerValue;
                }),
                (e.prototype.tryDelay = function(t, e) {
                  var n = (0, N.D)(this, t, e);
                  n && !n.closed && (this.destination.add(n), this.delayNotifierSubscriptions.push(n));
                }),
                (e.prototype.tryComplete = function() {
                  this.completed && 0 === this.delayNotifierSubscriptions.length && this.destination.complete();
                }),
                e
              );
            })(I.L),
            wt = (function(t) {
              function e(e, n) {
                var r = t.call(this) || this;
                return (r.source = e), (r.subscriptionDelay = n), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._subscribe = function(t) {
                  this.subscriptionDelay.subscribe(new gt(t, this.source));
                }),
                e
              );
            })(bt.y),
            gt = (function(t) {
              function e(e, n) {
                var r = t.call(this) || this;
                return (r.parent = e), (r.source = n), (r.sourceSubscribed = !1), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.subscribeToSource();
                }),
                (e.prototype._error = function(t) {
                  this.unsubscribe(), this.parent.error(t);
                }),
                (e.prototype._complete = function() {
                  this.unsubscribe(), this.subscribeToSource();
                }),
                (e.prototype.subscribeToSource = function() {
                  this.sourceSubscribed || ((this.sourceSubscribed = !0), this.unsubscribe(), this.source.subscribe(this.parent));
                }),
                e
              );
            })(p.L);
          function _t() {
            return function(t) {
              return t.lift(new xt());
            };
          }
          var xt = (function() {
              function t() {}
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new St(t));
                }),
                t
              );
            })(),
            St = (function(t) {
              function e(e) {
                return t.call(this, e) || this;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  t.observe(this.destination);
                }),
                e
              );
            })(p.L);
          function Tt(t, e) {
            return function(n) {
              return n.lift(new Et(t, e));
            };
          }
          var Et = (function() {
              function t(t, e) {
                (this.keySelector = t), (this.flushes = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new kt(t, this.keySelector, this.flushes));
                }),
                t
              );
            })(),
            kt = (function(t) {
              function e(e, n, r) {
                var o = t.call(this, e) || this;
                return (o.keySelector = n), (o.values = new Set()), r && o.add((0, i.ft)(r, new i.IY(o))), o;
              }
              return (
                r.ZT(e, t),
                (e.prototype.notifyNext = function() {
                  this.values.clear();
                }),
                (e.prototype.notifyError = function(t) {
                  this._error(t);
                }),
                (e.prototype._next = function(t) {
                  this.keySelector ? this._useKeySelector(t) : this._finalizeNext(t, t);
                }),
                (e.prototype._useKeySelector = function(t) {
                  var e,
                    n = this.destination;
                  try {
                    e = this.keySelector(t);
                  } catch (t) {
                    return void n.error(t);
                  }
                  this._finalizeNext(e, t);
                }),
                (e.prototype._finalizeNext = function(t, e) {
                  var n = this.values;
                  n.has(t) || (n.add(t), this.destination.next(e));
                }),
                e
              );
            })(i.Ds);
          function Ct(t, e) {
            return function(n) {
              return n.lift(new Nt(t, e));
            };
          }
          var Nt = (function() {
              function t(t, e) {
                (this.compare = t), (this.keySelector = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new It(t, this.compare, this.keySelector));
                }),
                t
              );
            })(),
            It = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.keySelector = r), (i.hasKey = !1), 'function' == typeof n && (i.compare = n), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype.compare = function(t, e) {
                  return t === e;
                }),
                (e.prototype._next = function(t) {
                  var e;
                  try {
                    var n = this.keySelector;
                    e = n ? n(t) : t;
                  } catch (t) {
                    return this.destination.error(t);
                  }
                  var r = !1;
                  if (this.hasKey)
                    try {
                      r = (0, this.compare)(this.key, e);
                    } catch (t) {
                      return this.destination.error(t);
                    }
                  else this.hasKey = !0;
                  r || ((this.key = e), this.destination.next(t));
                }),
                e
              );
            })(p.L);
          function Dt(t, e) {
            return Ct(function(n, r) {
              return e ? e(n[t], r[t]) : n[t] === r[t];
            });
          }
          var Pt = n(6565),
            Vt = n(6008),
            Lt = n(6929);
          function Ot(t) {
            return (
              void 0 === t && (t = Zt),
              function(e) {
                return e.lift(new At(t));
              }
            );
          }
          var At = (function() {
              function t(t) {
                this.errorFactory = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new jt(t, this.errorFactory));
                }),
                t
              );
            })(),
            jt = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.errorFactory = n), (r.hasValue = !1), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  (this.hasValue = !0), this.destination.next(t);
                }),
                (e.prototype._complete = function() {
                  if (this.hasValue) return this.destination.complete();
                  var t = void 0;
                  try {
                    t = this.errorFactory();
                  } catch (e) {
                    t = e;
                  }
                  this.destination.error(t);
                }),
                e
              );
            })(p.L);
          function Zt() {
            return new Lt.K();
          }
          var Rt = n(5631);
          function Mt(t) {
            return function(e) {
              return 0 === t ? (0, Rt.c)() : e.lift(new zt(t));
            };
          }
          var zt = (function() {
              function t(t) {
                if (((this.total = t), this.total < 0)) throw new Pt.W();
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Ut(t, this.total));
                }),
                t
              );
            })(),
            Ut = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.total = n), (r.count = 0), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  var e = this.total,
                    n = ++this.count;
                  n <= e && (this.destination.next(t), n === e && (this.destination.complete(), this.unsubscribe()));
                }),
                e
              );
            })(p.L);
          function Ft(t, e) {
            if (t < 0) throw new Pt.W();
            var n = arguments.length >= 2;
            return function(r) {
              return r.pipe(
                (0, Vt.h)(function(e, n) {
                  return n === t;
                }),
                Mt(1),
                n
                  ? st(e)
                  : Ot(function() {
                      return new Pt.W();
                    })
              );
            };
          }
          var Wt = n(8170);
          function Bt() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            return function(e) {
              return (0, B.z)(e, Wt.of.apply(void 0, t));
            };
          }
          function Yt(t, e) {
            return function(n) {
              return n.lift(new qt(t, e, n));
            };
          }
          var qt = (function() {
              function t(t, e, n) {
                (this.predicate = t), (this.thisArg = e), (this.source = n);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Kt(t, this.predicate, this.thisArg, this.source));
                }),
                t
              );
            })(),
            Kt = (function(t) {
              function e(e, n, r, i) {
                var o = t.call(this, e) || this;
                return (o.predicate = n), (o.thisArg = r), (o.source = i), (o.index = 0), (o.thisArg = r || o), o;
              }
              return (
                r.ZT(e, t),
                (e.prototype.notifyComplete = function(t) {
                  this.destination.next(t), this.destination.complete();
                }),
                (e.prototype._next = function(t) {
                  var e = !1;
                  try {
                    e = this.predicate.call(this.thisArg, t, this.index++, this.source);
                  } catch (t) {
                    return void this.destination.error(t);
                  }
                  e || this.notifyComplete(!1);
                }),
                (e.prototype._complete = function() {
                  this.notifyComplete(!0);
                }),
                e
              );
            })(p.L);
          function Gt() {
            return function(t) {
              return t.lift(new Qt());
            };
          }
          var Qt = (function() {
              function t() {}
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Ht(t));
                }),
                t
              );
            })(),
            Ht = (function(t) {
              function e(e) {
                var n = t.call(this, e) || this;
                return (n.hasCompleted = !1), (n.hasSubscription = !1), n;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.hasSubscription || ((this.hasSubscription = !0), this.add((0, i.ft)(t, new i.IY(this))));
                }),
                (e.prototype._complete = function() {
                  (this.hasCompleted = !0), this.hasSubscription || this.destination.complete();
                }),
                (e.prototype.notifyComplete = function() {
                  (this.hasSubscription = !1), this.hasCompleted && this.destination.complete();
                }),
                e
              );
            })(i.Ds),
            Jt = n(5709);
          function $t(t, e) {
            return e
              ? function(n) {
                  return n.pipe(
                    $t(function(n, r) {
                      return (0, F.D)(t(n, r)).pipe(
                        (0, Jt.U)(function(t, i) {
                          return e(n, t, r, i);
                        })
                      );
                    })
                  );
                }
              : function(e) {
                  return e.lift(new Xt(t));
                };
          }
          var Xt = (function() {
              function t(t) {
                this.project = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new te(t, this.project));
                }),
                t
              );
            })(),
            te = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.project = n), (r.hasSubscription = !1), (r.hasCompleted = !1), (r.index = 0), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.hasSubscription || this.tryNext(t);
                }),
                (e.prototype.tryNext = function(t) {
                  var e,
                    n = this.index++;
                  try {
                    e = this.project(t, n);
                  } catch (t) {
                    return void this.destination.error(t);
                  }
                  (this.hasSubscription = !0), this._innerSub(e);
                }),
                (e.prototype._innerSub = function(t) {
                  var e = new i.IY(this),
                    n = this.destination;
                  n.add(e);
                  var r = (0, i.ft)(t, e);
                  r !== e && n.add(r);
                }),
                (e.prototype._complete = function() {
                  (this.hasCompleted = !0), this.hasSubscription || this.destination.complete(), this.unsubscribe();
                }),
                (e.prototype.notifyNext = function(t) {
                  this.destination.next(t);
                }),
                (e.prototype.notifyError = function(t) {
                  this.destination.error(t);
                }),
                (e.prototype.notifyComplete = function() {
                  (this.hasSubscription = !1), this.hasCompleted && this.destination.complete();
                }),
                e
              );
            })(i.Ds);
          function ee(t, e, n) {
            return (
              void 0 === e && (e = Number.POSITIVE_INFINITY),
              (e = (e || 0) < 1 ? Number.POSITIVE_INFINITY : e),
              function(r) {
                return r.lift(new ne(t, e, n));
              }
            );
          }
          var ne = (function() {
              function t(t, e, n) {
                (this.project = t), (this.concurrent = e), (this.scheduler = n);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new re(t, this.project, this.concurrent, this.scheduler));
                }),
                t
              );
            })(),
            re = (function(t) {
              function e(e, n, r, i) {
                var o = t.call(this, e) || this;
                return (
                  (o.project = n), (o.concurrent = r), (o.scheduler = i), (o.index = 0), (o.active = 0), (o.hasCompleted = !1), r < Number.POSITIVE_INFINITY && (o.buffer = []), o
                );
              }
              return (
                r.ZT(e, t),
                (e.dispatch = function(t) {
                  var e = t.subscriber,
                    n = t.result,
                    r = t.value,
                    i = t.index;
                  e.subscribeToProjection(n, r, i);
                }),
                (e.prototype._next = function(t) {
                  var n = this.destination;
                  if (n.closed) this._complete();
                  else {
                    var r = this.index++;
                    if (this.active < this.concurrent) {
                      n.next(t);
                      try {
                        var i = (0, this.project)(t, r);
                        if (this.scheduler) {
                          var o = { subscriber: this, result: i, value: t, index: r };
                          this.destination.add(this.scheduler.schedule(e.dispatch, 0, o));
                        } else this.subscribeToProjection(i, t, r);
                      } catch (t) {
                        n.error(t);
                      }
                    } else this.buffer.push(t);
                  }
                }),
                (e.prototype.subscribeToProjection = function(t, e, n) {
                  this.active++, this.destination.add((0, i.ft)(t, new i.IY(this)));
                }),
                (e.prototype._complete = function() {
                  (this.hasCompleted = !0), this.hasCompleted && 0 === this.active && this.destination.complete(), this.unsubscribe();
                }),
                (e.prototype.notifyNext = function(t) {
                  this._next(t);
                }),
                (e.prototype.notifyComplete = function() {
                  var t = this.buffer;
                  this.active--, t && t.length > 0 && this._next(t.shift()), this.hasCompleted && 0 === this.active && this.destination.complete();
                }),
                e
              );
            })(i.Ds);
          function ie(t) {
            return function(e) {
              return e.lift(new oe(t));
            };
          }
          var oe = (function() {
              function t(t) {
                this.callback = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new se(t, this.callback));
                }),
                t
              );
            })(),
            se = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return r.add(new C.w(n)), r;
              }
              return r.ZT(e, t), e;
            })(p.L);
          function ce(t, e) {
            if ('function' != typeof t) throw new TypeError('predicate is not a function');
            return function(n) {
              return n.lift(new ue(t, n, !1, e));
            };
          }
          var ue = (function() {
              function t(t, e, n, r) {
                (this.predicate = t), (this.source = e), (this.yieldIndex = n), (this.thisArg = r);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new ae(t, this.predicate, this.source, this.yieldIndex, this.thisArg));
                }),
                t
              );
            })(),
            ae = (function(t) {
              function e(e, n, r, i, o) {
                var s = t.call(this, e) || this;
                return (s.predicate = n), (s.source = r), (s.yieldIndex = i), (s.thisArg = o), (s.index = 0), s;
              }
              return (
                r.ZT(e, t),
                (e.prototype.notifyComplete = function(t) {
                  var e = this.destination;
                  e.next(t), e.complete(), this.unsubscribe();
                }),
                (e.prototype._next = function(t) {
                  var e = this.predicate,
                    n = this.thisArg,
                    r = this.index++;
                  try {
                    e.call(n || this, t, r, this.source) && this.notifyComplete(this.yieldIndex ? r : t);
                  } catch (t) {
                    this.destination.error(t);
                  }
                }),
                (e.prototype._complete = function() {
                  this.notifyComplete(this.yieldIndex ? -1 : void 0);
                }),
                e
              );
            })(p.L);
          function he(t, e) {
            return function(n) {
              return n.lift(new ue(t, n, !0, e));
            };
          }
          var le = n(3608);
          function fe(t, e) {
            var n = arguments.length >= 2;
            return function(r) {
              return r.pipe(
                t
                  ? (0, Vt.h)(function(e, n) {
                      return t(e, n, r);
                    })
                  : le.y,
                Mt(1),
                n
                  ? st(e)
                  : Ot(function() {
                      return new Lt.K();
                    })
              );
            };
          }
          var de = n(1120);
          function pe() {
            return function(t) {
              return t.lift(new be());
            };
          }
          var be = (function() {
              function t() {}
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new ve(t));
                }),
                t
              );
            })(),
            ve = (function(t) {
              function e() {
                return (null !== t && t.apply(this, arguments)) || this;
              }
              return r.ZT(e, t), (e.prototype._next = function(t) {}), e;
            })(p.L);
          function ye() {
            return function(t) {
              return t.lift(new me());
            };
          }
          var me = (function() {
              function t() {}
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new we(t));
                }),
                t
              );
            })(),
            we = (function(t) {
              function e(e) {
                return t.call(this, e) || this;
              }
              return (
                r.ZT(e, t),
                (e.prototype.notifyComplete = function(t) {
                  var e = this.destination;
                  e.next(t), e.complete();
                }),
                (e.prototype._next = function(t) {
                  this.notifyComplete(!1);
                }),
                (e.prototype._complete = function() {
                  this.notifyComplete(!0);
                }),
                e
              );
            })(p.L);
          function ge(t) {
            return function(e) {
              return 0 === t ? (0, Rt.c)() : e.lift(new _e(t));
            };
          }
          var _e = (function() {
              function t(t) {
                if (((this.total = t), this.total < 0)) throw new Pt.W();
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new xe(t, this.total));
                }),
                t
              );
            })(),
            xe = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.total = n), (r.ring = new Array()), (r.count = 0), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  var e = this.ring,
                    n = this.total,
                    r = this.count++;
                  e.length < n ? e.push(t) : (e[r % n] = t);
                }),
                (e.prototype._complete = function() {
                  var t = this.destination,
                    e = this.count;
                  if (e > 0)
                    for (var n = this.count >= this.total ? this.total : this.count, r = this.ring, i = 0; i < n; i++) {
                      var o = e++ % n;
                      t.next(r[o]);
                    }
                  t.complete();
                }),
                e
              );
            })(p.L);
          function Se(t, e) {
            var n = arguments.length >= 2;
            return function(r) {
              return r.pipe(
                t
                  ? (0, Vt.h)(function(e, n) {
                      return t(e, n, r);
                    })
                  : le.y,
                ge(1),
                n
                  ? st(e)
                  : Ot(function() {
                      return new Lt.K();
                    })
              );
            };
          }
          function Te(t) {
            return function(e) {
              return e.lift(new Ee(t));
            };
          }
          var Ee = (function() {
              function t(t) {
                this.value = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new ke(t, this.value));
                }),
                t
              );
            })(),
            ke = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.value = n), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.destination.next(this.value);
                }),
                e
              );
            })(p.L);
          function Ce() {
            return function(t) {
              return t.lift(new Ne());
            };
          }
          var Ne = (function() {
              function t() {}
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Ie(t));
                }),
                t
              );
            })(),
            Ie = (function(t) {
              function e(e) {
                return t.call(this, e) || this;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.destination.next(ht.P.createNext(t));
                }),
                (e.prototype._error = function(t) {
                  var e = this.destination;
                  e.next(ht.P.createError(t)), e.complete();
                }),
                (e.prototype._complete = function() {
                  var t = this.destination;
                  t.next(ht.P.createComplete()), t.complete();
                }),
                e
              );
            })(p.L);
          function De(t, e) {
            var n = !1;
            return (
              arguments.length >= 2 && (n = !0),
              function(r) {
                return r.lift(new Pe(t, e, n));
              }
            );
          }
          var Pe = (function() {
              function t(t, e, n) {
                void 0 === n && (n = !1), (this.accumulator = t), (this.seed = e), (this.hasSeed = n);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Ve(t, this.accumulator, this.seed, this.hasSeed));
                }),
                t
              );
            })(),
            Ve = (function(t) {
              function e(e, n, r, i) {
                var o = t.call(this, e) || this;
                return (o.accumulator = n), (o._seed = r), (o.hasSeed = i), (o.index = 0), o;
              }
              return (
                r.ZT(e, t),
                Object.defineProperty(e.prototype, 'seed', {
                  get: function() {
                    return this._seed;
                  },
                  set: function(t) {
                    (this.hasSeed = !0), (this._seed = t);
                  },
                  enumerable: !0,
                  configurable: !0,
                }),
                (e.prototype._next = function(t) {
                  if (this.hasSeed) return this._tryNext(t);
                  (this.seed = t), this.destination.next(t);
                }),
                (e.prototype._tryNext = function(t) {
                  var e,
                    n = this.index++;
                  try {
                    e = this.accumulator(this.seed, t, n);
                  } catch (t) {
                    this.destination.error(t);
                  }
                  (this.seed = e), this.destination.next(e);
                }),
                e
              );
            })(p.L),
            Le = n(2561);
          function Oe(t, e) {
            return arguments.length >= 2
              ? function(n) {
                  return (0, Le.z)(De(t, e), ge(1), st(e))(n);
                }
              : function(e) {
                  return (0, Le.z)(
                    De(function(e, n, r) {
                      return t(e, n, r + 1);
                    }),
                    ge(1)
                  )(e);
                };
          }
          function Ae(t) {
            return Oe(
              'function' == typeof t
                ? function(e, n) {
                    return t(e, n) > 0 ? e : n;
                  }
                : function(t, e) {
                    return t > e ? t : e;
                  }
            );
          }
          var je = n(4370);
          function Ze() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            return function(e) {
              return e.lift.call(je.T.apply(void 0, [e].concat(t)));
            };
          }
          var Re = n(2556);
          function Me(t, e, n) {
            return (
              void 0 === n && (n = Number.POSITIVE_INFINITY),
              'function' == typeof e
                ? (0, K.zg)(
                    function() {
                      return t;
                    },
                    e,
                    n
                  )
                : ('number' == typeof e && (n = e),
                  (0, K.zg)(function() {
                    return t;
                  }, n))
            );
          }
          function ze(t, e, n) {
            return (
              void 0 === n && (n = Number.POSITIVE_INFINITY),
              function(r) {
                return r.lift(new Ue(t, e, n));
              }
            );
          }
          var Ue = (function() {
              function t(t, e, n) {
                (this.accumulator = t), (this.seed = e), (this.concurrent = n);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Fe(t, this.accumulator, this.seed, this.concurrent));
                }),
                t
              );
            })(),
            Fe = (function(t) {
              function e(e, n, r, i) {
                var o = t.call(this, e) || this;
                return (o.accumulator = n), (o.acc = r), (o.concurrent = i), (o.hasValue = !1), (o.hasCompleted = !1), (o.buffer = []), (o.active = 0), (o.index = 0), o;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  if (this.active < this.concurrent) {
                    var e = this.index++,
                      n = this.destination,
                      r = void 0;
                    try {
                      r = (0, this.accumulator)(this.acc, t, e);
                    } catch (t) {
                      return n.error(t);
                    }
                    this.active++, this._innerSub(r);
                  } else this.buffer.push(t);
                }),
                (e.prototype._innerSub = function(t) {
                  var e = new i.IY(this),
                    n = this.destination;
                  n.add(e);
                  var r = (0, i.ft)(t, e);
                  r !== e && n.add(r);
                }),
                (e.prototype._complete = function() {
                  (this.hasCompleted = !0),
                    0 === this.active && 0 === this.buffer.length && (!1 === this.hasValue && this.destination.next(this.acc), this.destination.complete()),
                    this.unsubscribe();
                }),
                (e.prototype.notifyNext = function(t) {
                  var e = this.destination;
                  (this.acc = t), (this.hasValue = !0), e.next(t);
                }),
                (e.prototype.notifyComplete = function() {
                  var t = this.buffer;
                  this.active--,
                    t.length > 0
                      ? this._next(t.shift())
                      : 0 === this.active && this.hasCompleted && (!1 === this.hasValue && this.destination.next(this.acc), this.destination.complete());
                }),
                e
              );
            })(i.Ds);
          function We(t) {
            return Oe(
              'function' == typeof t
                ? function(e, n) {
                    return t(e, n) < 0 ? e : n;
                  }
                : function(t, e) {
                    return t < e ? t : e;
                  }
            );
          }
          var Be = n(3140);
          function Ye(t, e) {
            return function(n) {
              var r;
              if (
                ((r =
                  'function' == typeof t
                    ? t
                    : function() {
                        return t;
                      }),
                'function' == typeof e)
              )
                return n.lift(new qe(r, e));
              var i = Object.create(n, Be.N);
              return (i.source = n), (i.subjectFactory = r), i;
            };
          }
          var qe = (function() {
              function t(t, e) {
                (this.subjectFactory = t), (this.selector = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  var n = this.selector,
                    r = this.subjectFactory(),
                    i = n(r).subscribe(t);
                  return i.add(e.subscribe(r)), i;
                }),
                t
              );
            })(),
            Ke = n(9276);
          function Ge() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            return (
              1 === t.length && (0, U.k)(t[0]) && (t = t[0]),
              function(e) {
                return e.lift(new Qe(t));
              }
            );
          }
          var Qe = (function() {
              function t(t) {
                this.nextSources = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new He(t, this.nextSources));
                }),
                t
              );
            })(),
            He = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.destination = e), (r.nextSources = n), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype.notifyError = function() {
                  this.subscribeToNextSource();
                }),
                (e.prototype.notifyComplete = function() {
                  this.subscribeToNextSource();
                }),
                (e.prototype._error = function(t) {
                  this.subscribeToNextSource(), this.unsubscribe();
                }),
                (e.prototype._complete = function() {
                  this.subscribeToNextSource(), this.unsubscribe();
                }),
                (e.prototype.subscribeToNextSource = function() {
                  var t = this.nextSources.shift();
                  if (t) {
                    var e = new i.IY(this),
                      n = this.destination;
                    n.add(e);
                    var r = (0, i.ft)(t, e);
                    r !== e && n.add(r);
                  } else this.destination.complete();
                }),
                e
              );
            })(i.Ds);
          function Je() {
            return function(t) {
              return t.lift(new $e());
            };
          }
          var $e = (function() {
              function t() {}
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Xe(t));
                }),
                t
              );
            })(),
            Xe = (function(t) {
              function e(e) {
                var n = t.call(this, e) || this;
                return (n.hasPrev = !1), n;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  var e;
                  this.hasPrev ? (e = [this.prev, t]) : (this.hasPrev = !0), (this.prev = t), e && this.destination.next(e);
                }),
                e
              );
            })(p.L),
            tn = n(8463);
          function en(t, e) {
            return function(n) {
              return [(0, Vt.h)(t, e)(n), (0, Vt.h)((0, tn.f)(t, e))(n)];
            };
          }
          function nn() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            var n = t.length;
            if (0 === n) throw new Error('list of properties cannot be empty.');
            return function(e) {
              return (0, Jt.U)(rn(t, n))(e);
            };
          }
          function rn(t, e) {
            return function(n) {
              for (var r = n, i = 0; i < e; i++) {
                var o = null != r ? r[t[i]] : void 0;
                if (void 0 === o) return;
                r = o;
              }
              return r;
            };
          }
          var on = n(211);
          function sn(t) {
            return t
              ? Ye(function() {
                  return new on.xQ();
                }, t)
              : Ye(new on.xQ());
          }
          var cn = n(9233);
          function un(t) {
            return function(e) {
              return Ye(new cn.X(t))(e);
            };
          }
          var an = n(364);
          function hn() {
            return function(t) {
              return Ye(new an.c())(t);
            };
          }
          var ln = n(2630);
          function fn(t, e, n, r) {
            n && 'function' != typeof n && (r = n);
            var i = 'function' == typeof n ? n : void 0,
              o = new ln.t(t, e, r);
            return function(t) {
              return Ye(function() {
                return o;
              }, i)(t);
            };
          }
          var dn = n(8821);
          function pn() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            return function(e) {
              return 1 === t.length && (0, U.k)(t[0]) && (t = t[0]), e.lift.call(dn.S3.apply(void 0, [e].concat(t)));
            };
          }
          function bn(t) {
            return (
              void 0 === t && (t = -1),
              function(e) {
                return 0 === t ? (0, Rt.c)() : t < 0 ? e.lift(new vn(-1, e)) : e.lift(new vn(t - 1, e));
              }
            );
          }
          var vn = (function() {
              function t(t, e) {
                (this.count = t), (this.source = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new yn(t, this.count, this.source));
                }),
                t
              );
            })(),
            yn = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.count = n), (i.source = r), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype.complete = function() {
                  if (!this.isStopped) {
                    var e = this.source,
                      n = this.count;
                    if (0 === n) return t.prototype.complete.call(this);
                    n > -1 && (this.count = n - 1), e.subscribe(this._unsubscribeAndRecycle());
                  }
                }),
                e
              );
            })(p.L);
          function mn(t) {
            return function(e) {
              return e.lift(new wn(t));
            };
          }
          var wn = (function() {
              function t(t) {
                this.notifier = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new gn(t, this.notifier, e));
                }),
                t
              );
            })(),
            gn = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.notifier = n), (i.source = r), (i.sourceIsBeingSubscribedTo = !0), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype.notifyNext = function() {
                  (this.sourceIsBeingSubscribedTo = !0), this.source.subscribe(this);
                }),
                (e.prototype.notifyComplete = function() {
                  if (!1 === this.sourceIsBeingSubscribedTo) return t.prototype.complete.call(this);
                }),
                (e.prototype.complete = function() {
                  if (((this.sourceIsBeingSubscribedTo = !1), !this.isStopped)) {
                    if ((this.retries || this.subscribeToRetries(), !this.retriesSubscription || this.retriesSubscription.closed)) return t.prototype.complete.call(this);
                    this._unsubscribeAndRecycle(), this.notifications.next(void 0);
                  }
                }),
                (e.prototype._unsubscribe = function() {
                  var t = this.notifications,
                    e = this.retriesSubscription;
                  t && (t.unsubscribe(), (this.notifications = void 0)), e && (e.unsubscribe(), (this.retriesSubscription = void 0)), (this.retries = void 0);
                }),
                (e.prototype._unsubscribeAndRecycle = function() {
                  var e = this._unsubscribe;
                  return (this._unsubscribe = null), t.prototype._unsubscribeAndRecycle.call(this), (this._unsubscribe = e), this;
                }),
                (e.prototype.subscribeToRetries = function() {
                  var e;
                  this.notifications = new on.xQ();
                  try {
                    e = (0, this.notifier)(this.notifications);
                  } catch (e) {
                    return t.prototype.complete.call(this);
                  }
                  (this.retries = e), (this.retriesSubscription = (0, i.ft)(e, new i.IY(this)));
                }),
                e
              );
            })(i.Ds);
          function _n(t) {
            return (
              void 0 === t && (t = -1),
              function(e) {
                return e.lift(new xn(t, e));
              }
            );
          }
          var xn = (function() {
              function t(t, e) {
                (this.count = t), (this.source = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Sn(t, this.count, this.source));
                }),
                t
              );
            })(),
            Sn = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.count = n), (i.source = r), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype.error = function(e) {
                  if (!this.isStopped) {
                    var n = this.source,
                      r = this.count;
                    if (0 === r) return t.prototype.error.call(this, e);
                    r > -1 && (this.count = r - 1), n.subscribe(this._unsubscribeAndRecycle());
                  }
                }),
                e
              );
            })(p.L);
          function Tn(t) {
            return function(e) {
              return e.lift(new En(t, e));
            };
          }
          var En = (function() {
              function t(t, e) {
                (this.notifier = t), (this.source = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new kn(t, this.notifier, this.source));
                }),
                t
              );
            })(),
            kn = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.notifier = n), (i.source = r), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype.error = function(e) {
                  if (!this.isStopped) {
                    var n = this.errors,
                      r = this.retries,
                      o = this.retriesSubscription;
                    if (r) (this.errors = void 0), (this.retriesSubscription = void 0);
                    else {
                      n = new on.xQ();
                      try {
                        r = (0, this.notifier)(n);
                      } catch (e) {
                        return t.prototype.error.call(this, e);
                      }
                      o = (0, i.ft)(r, new i.IY(this));
                    }
                    this._unsubscribeAndRecycle(), (this.errors = n), (this.retries = r), (this.retriesSubscription = o), n.next(e);
                  }
                }),
                (e.prototype._unsubscribe = function() {
                  var t = this.errors,
                    e = this.retriesSubscription;
                  t && (t.unsubscribe(), (this.errors = void 0)), e && (e.unsubscribe(), (this.retriesSubscription = void 0)), (this.retries = void 0);
                }),
                (e.prototype.notifyNext = function() {
                  var t = this._unsubscribe;
                  (this._unsubscribe = null), this._unsubscribeAndRecycle(), (this._unsubscribe = t), this.source.subscribe(this);
                }),
                e
              );
            })(i.Ds),
            Cn = n(3018);
          function Nn(t) {
            return function(e) {
              return e.lift(new In(t));
            };
          }
          var In = (function() {
              function t(t) {
                this.notifier = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  var n = new Dn(t),
                    r = e.subscribe(n);
                  return r.add((0, i.ft)(this.notifier, new i.IY(n))), r;
                }),
                t
              );
            })(),
            Dn = (function(t) {
              function e() {
                var e = (null !== t && t.apply(this, arguments)) || this;
                return (e.hasValue = !1), e;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  (this.value = t), (this.hasValue = !0);
                }),
                (e.prototype.notifyNext = function() {
                  this.emitValue();
                }),
                (e.prototype.notifyComplete = function() {
                  this.emitValue();
                }),
                (e.prototype.emitValue = function() {
                  this.hasValue && ((this.hasValue = !1), this.destination.next(this.value));
                }),
                e
              );
            })(i.Ds);
          function Pn(t, e) {
            return (
              void 0 === e && (e = u.P),
              function(n) {
                return n.lift(new Vn(t, e));
              }
            );
          }
          var Vn = (function() {
              function t(t, e) {
                (this.period = t), (this.scheduler = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Ln(t, this.period, this.scheduler));
                }),
                t
              );
            })(),
            Ln = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.period = n), (i.scheduler = r), (i.hasValue = !1), i.add(r.schedule(On, n, { subscriber: i, period: n })), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  (this.lastValue = t), (this.hasValue = !0);
                }),
                (e.prototype.notifyNext = function() {
                  this.hasValue && ((this.hasValue = !1), this.destination.next(this.lastValue));
                }),
                e
              );
            })(p.L);
          function On(t) {
            var e = t.subscriber,
              n = t.period;
            e.notifyNext(), this.schedule(t, n);
          }
          function An(t, e) {
            return function(n) {
              return n.lift(new jn(t, e));
            };
          }
          var jn = (function() {
              function t(t, e) {
                (this.compareTo = t), (this.comparator = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Zn(t, this.compareTo, this.comparator));
                }),
                t
              );
            })(),
            Zn = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.compareTo = n), (i.comparator = r), (i._a = []), (i._b = []), (i._oneComplete = !1), i.destination.add(n.subscribe(new Rn(e, i))), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this._oneComplete && 0 === this._b.length ? this.emit(!1) : (this._a.push(t), this.checkValues());
                }),
                (e.prototype._complete = function() {
                  this._oneComplete ? this.emit(0 === this._a.length && 0 === this._b.length) : (this._oneComplete = !0), this.unsubscribe();
                }),
                (e.prototype.checkValues = function() {
                  for (var t = this, e = t._a, n = t._b, r = t.comparator; e.length > 0 && n.length > 0; ) {
                    var i = e.shift(),
                      o = n.shift(),
                      s = !1;
                    try {
                      s = r ? r(i, o) : i === o;
                    } catch (t) {
                      this.destination.error(t);
                    }
                    s || this.emit(!1);
                  }
                }),
                (e.prototype.emit = function(t) {
                  var e = this.destination;
                  e.next(t), e.complete();
                }),
                (e.prototype.nextB = function(t) {
                  this._oneComplete && 0 === this._a.length ? this.emit(!1) : (this._b.push(t), this.checkValues());
                }),
                (e.prototype.completeB = function() {
                  this._oneComplete ? this.emit(0 === this._a.length && 0 === this._b.length) : (this._oneComplete = !0);
                }),
                e
              );
            })(p.L),
            Rn = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.parent = n), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.parent.nextB(t);
                }),
                (e.prototype._error = function(t) {
                  this.parent.error(t), this.unsubscribe();
                }),
                (e.prototype._complete = function() {
                  this.parent.completeB(), this.unsubscribe();
                }),
                e
              );
            })(p.L);
          function Mn() {
            return new on.xQ();
          }
          function zn() {
            return function(t) {
              return (0, Cn.x)()(Ye(Mn)(t));
            };
          }
          function Un(t, e, n) {
            var r;
            return (
              (r = t && 'object' == typeof t ? t : { bufferSize: t, windowTime: e, refCount: !1, scheduler: n }),
              function(t) {
                return t.lift(
                  (function(t) {
                    var e,
                      n,
                      r = t.bufferSize,
                      i = void 0 === r ? Number.POSITIVE_INFINITY : r,
                      o = t.windowTime,
                      s = void 0 === o ? Number.POSITIVE_INFINITY : o,
                      c = t.refCount,
                      u = t.scheduler,
                      a = 0,
                      h = !1,
                      l = !1;
                    return function(t) {
                      var r;
                      a++,
                        !e || h
                          ? ((h = !1),
                            (e = new ln.t(i, s, u)),
                            (r = e.subscribe(this)),
                            (n = t.subscribe({
                              next: function(t) {
                                e.next(t);
                              },
                              error: function(t) {
                                (h = !0), e.error(t);
                              },
                              complete: function() {
                                (l = !0), (n = void 0), e.complete();
                              },
                            })),
                            l && (n = void 0))
                          : (r = e.subscribe(this)),
                        this.add(function() {
                          a--, r.unsubscribe(), (r = void 0), n && !l && c && 0 === a && (n.unsubscribe(), (n = void 0), (e = void 0));
                        });
                    };
                  })(r)
                );
              }
            );
          }
          function Fn(t) {
            return function(e) {
              return e.lift(new Wn(t, e));
            };
          }
          var Wn = (function() {
              function t(t, e) {
                (this.predicate = t), (this.source = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Bn(t, this.predicate, this.source));
                }),
                t
              );
            })(),
            Bn = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.predicate = n), (i.source = r), (i.seenValue = !1), (i.index = 0), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype.applySingleValue = function(t) {
                  this.seenValue ? this.destination.error('Sequence contains more than one element') : ((this.seenValue = !0), (this.singleValue = t));
                }),
                (e.prototype._next = function(t) {
                  var e = this.index++;
                  this.predicate ? this.tryNext(t, e) : this.applySingleValue(t);
                }),
                (e.prototype.tryNext = function(t, e) {
                  try {
                    this.predicate(t, e, this.source) && this.applySingleValue(t);
                  } catch (t) {
                    this.destination.error(t);
                  }
                }),
                (e.prototype._complete = function() {
                  var t = this.destination;
                  this.index > 0 ? (t.next(this.seenValue ? this.singleValue : void 0), t.complete()) : t.error(new Lt.K());
                }),
                e
              );
            })(p.L);
          function Yn(t) {
            return function(e) {
              return e.lift(new qn(t));
            };
          }
          var qn = (function() {
              function t(t) {
                this.total = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Kn(t, this.total));
                }),
                t
              );
            })(),
            Kn = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.total = n), (r.count = 0), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  ++this.count > this.total && this.destination.next(t);
                }),
                e
              );
            })(p.L);
          function Gn(t) {
            return function(e) {
              return e.lift(new Qn(t));
            };
          }
          var Qn = (function() {
              function t(t) {
                if (((this._skipCount = t), this._skipCount < 0)) throw new Pt.W();
              }
              return (
                (t.prototype.call = function(t, e) {
                  return 0 === this._skipCount ? e.subscribe(new p.L(t)) : e.subscribe(new Hn(t, this._skipCount));
                }),
                t
              );
            })(),
            Hn = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r._skipCount = n), (r._count = 0), (r._ring = new Array(n)), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  var e = this._skipCount,
                    n = this._count++;
                  if (n < e) this._ring[n] = t;
                  else {
                    var r = n % e,
                      i = this._ring,
                      o = i[r];
                    (i[r] = t), this.destination.next(o);
                  }
                }),
                e
              );
            })(p.L);
          function Jn(t) {
            return function(e) {
              return e.lift(new $n(t));
            };
          }
          var $n = (function() {
              function t(t) {
                this.notifier = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Xn(t, this.notifier));
                }),
                t
              );
            })(),
            Xn = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                r.hasValue = !1;
                var o = new i.IY(r);
                r.add(o), (r.innerSubscription = o);
                var s = (0, i.ft)(n, o);
                return s !== o && (r.add(s), (r.innerSubscription = s)), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(e) {
                  this.hasValue && t.prototype._next.call(this, e);
                }),
                (e.prototype.notifyNext = function() {
                  (this.hasValue = !0), this.innerSubscription && this.innerSubscription.unsubscribe();
                }),
                (e.prototype.notifyComplete = function() {}),
                e
              );
            })(i.Ds);
          function tr(t) {
            return function(e) {
              return e.lift(new er(t));
            };
          }
          var er = (function() {
              function t(t) {
                this.predicate = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new nr(t, this.predicate));
                }),
                t
              );
            })(),
            nr = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.predicate = n), (r.skipping = !0), (r.index = 0), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  var e = this.destination;
                  this.skipping && this.tryCallPredicate(t), this.skipping || e.next(t);
                }),
                (e.prototype.tryCallPredicate = function(t) {
                  try {
                    var e = this.predicate(t, this.index++);
                    this.skipping = Boolean(e);
                  } catch (t) {
                    this.destination.error(t);
                  }
                }),
                e
              );
            })(p.L);
          function rr() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            var n = t[t.length - 1];
            return (0, w.K)(n)
              ? (t.pop(),
                function(e) {
                  return (0, B.z)(t, e, n);
                })
              : function(e) {
                  return (0, B.z)(t, e);
                };
          }
          var ir = n(6650),
            or = n(5812),
            sr = (function(t) {
              function e(e, n, r) {
                void 0 === n && (n = 0), void 0 === r && (r = ir.e);
                var i = t.call(this) || this;
                return (
                  (i.source = e),
                  (i.delayTime = n),
                  (i.scheduler = r),
                  (!(0, or.k)(n) || n < 0) && (i.delayTime = 0),
                  (r && 'function' == typeof r.schedule) || (i.scheduler = ir.e),
                  i
                );
              }
              return (
                r.ZT(e, t),
                (e.create = function(t, n, r) {
                  return void 0 === n && (n = 0), void 0 === r && (r = ir.e), new e(t, n, r);
                }),
                (e.dispatch = function(t) {
                  var e = t.source,
                    n = t.subscriber;
                  return this.add(e.subscribe(n));
                }),
                (e.prototype._subscribe = function(t) {
                  var n = this.delayTime,
                    r = this.source;
                  return this.scheduler.schedule(e.dispatch, n, { source: r, subscriber: t });
                }),
                e
              );
            })(bt.y);
          function cr(t, e) {
            return (
              void 0 === e && (e = 0),
              function(n) {
                return n.lift(new ur(t, e));
              }
            );
          }
          var ur = (function() {
            function t(t, e) {
              (this.scheduler = t), (this.delay = e);
            }
            return (
              (t.prototype.call = function(t, e) {
                return new sr(e, this.delay, this.scheduler).subscribe(t);
              }),
              t
            );
          })();
          function ar(t, e) {
            return 'function' == typeof e
              ? function(n) {
                  return n.pipe(
                    ar(function(n, r) {
                      return (0, F.D)(t(n, r)).pipe(
                        (0, Jt.U)(function(t, i) {
                          return e(n, t, r, i);
                        })
                      );
                    })
                  );
                }
              : function(e) {
                  return e.lift(new hr(t));
                };
          }
          var hr = (function() {
              function t(t) {
                this.project = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new lr(t, this.project));
                }),
                t
              );
            })(),
            lr = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.project = n), (r.index = 0), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  var e,
                    n = this.index++;
                  try {
                    e = this.project(t, n);
                  } catch (t) {
                    return void this.destination.error(t);
                  }
                  this._innerSub(e);
                }),
                (e.prototype._innerSub = function(t) {
                  var e = this.innerSubscription;
                  e && e.unsubscribe();
                  var n = new i.IY(this),
                    r = this.destination;
                  r.add(n), (this.innerSubscription = (0, i.ft)(t, n)), this.innerSubscription !== n && r.add(this.innerSubscription);
                }),
                (e.prototype._complete = function() {
                  var e = this.innerSubscription;
                  (e && !e.closed) || t.prototype._complete.call(this), this.unsubscribe();
                }),
                (e.prototype._unsubscribe = function() {
                  this.innerSubscription = void 0;
                }),
                (e.prototype.notifyComplete = function() {
                  (this.innerSubscription = void 0), this.isStopped && t.prototype._complete.call(this);
                }),
                (e.prototype.notifyNext = function(t) {
                  this.destination.next(t);
                }),
                e
              );
            })(i.Ds);
          function fr() {
            return ar(le.y);
          }
          function dr(t, e) {
            return e
              ? ar(function() {
                  return t;
                }, e)
              : ar(function() {
                  return t;
                });
          }
          function pr(t) {
            return function(e) {
              return e.lift(new br(t));
            };
          }
          var br = (function() {
              function t(t) {
                this.notifier = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  var n = new vr(t),
                    r = (0, i.ft)(this.notifier, new i.IY(n));
                  return r && !n.seenValue ? (n.add(r), e.subscribe(n)) : n;
                }),
                t
              );
            })(),
            vr = (function(t) {
              function e(e) {
                var n = t.call(this, e) || this;
                return (n.seenValue = !1), n;
              }
              return (
                r.ZT(e, t),
                (e.prototype.notifyNext = function() {
                  (this.seenValue = !0), this.complete();
                }),
                (e.prototype.notifyComplete = function() {}),
                e
              );
            })(i.Ds);
          function yr(t, e) {
            return (
              void 0 === e && (e = !1),
              function(n) {
                return n.lift(new mr(t, e));
              }
            );
          }
          var mr = (function() {
              function t(t, e) {
                (this.predicate = t), (this.inclusive = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new wr(t, this.predicate, this.inclusive));
                }),
                t
              );
            })(),
            wr = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.predicate = n), (i.inclusive = r), (i.index = 0), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  var e,
                    n = this.destination;
                  try {
                    e = this.predicate(t, this.index++);
                  } catch (t) {
                    return void n.error(t);
                  }
                  this.nextOrComplete(t, e);
                }),
                (e.prototype.nextOrComplete = function(t, e) {
                  var n = this.destination;
                  Boolean(e) ? n.next(t) : (this.inclusive && n.next(t), n.complete());
                }),
                e
              );
            })(p.L),
            gr = n(3306),
            _r = n(4156);
          function xr(t, e, n) {
            return function(r) {
              return r.lift(new Sr(t, e, n));
            };
          }
          var Sr = (function() {
              function t(t, e, n) {
                (this.nextOrObserver = t), (this.error = e), (this.complete = n);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Tr(t, this.nextOrObserver, this.error, this.complete));
                }),
                t
              );
            })(),
            Tr = (function(t) {
              function e(e, n, r, i) {
                var o = t.call(this, e) || this;
                return (
                  (o._tapNext = gr.Z),
                  (o._tapError = gr.Z),
                  (o._tapComplete = gr.Z),
                  (o._tapError = r || gr.Z),
                  (o._tapComplete = i || gr.Z),
                  (0, _r.m)(n)
                    ? ((o._context = o), (o._tapNext = n))
                    : n && ((o._context = n), (o._tapNext = n.next || gr.Z), (o._tapError = n.error || gr.Z), (o._tapComplete = n.complete || gr.Z)),
                  o
                );
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  try {
                    this._tapNext.call(this._context, t);
                  } catch (t) {
                    return void this.destination.error(t);
                  }
                  this.destination.next(t);
                }),
                (e.prototype._error = function(t) {
                  try {
                    this._tapError.call(this._context, t);
                  } catch (t) {
                    return void this.destination.error(t);
                  }
                  this.destination.error(t);
                }),
                (e.prototype._complete = function() {
                  try {
                    this._tapComplete.call(this._context);
                  } catch (t) {
                    return void this.destination.error(t);
                  }
                  return this.destination.complete();
                }),
                e
              );
            })(p.L),
            Er = { leading: !0, trailing: !1 };
          function kr(t, e) {
            return (
              void 0 === e && (e = Er),
              function(n) {
                return n.lift(new Cr(t, !!e.leading, !!e.trailing));
              }
            );
          }
          var Cr = (function() {
              function t(t, e, n) {
                (this.durationSelector = t), (this.leading = e), (this.trailing = n);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Nr(t, this.durationSelector, this.leading, this.trailing));
                }),
                t
              );
            })(),
            Nr = (function(t) {
              function e(e, n, r, i) {
                var o = t.call(this, e) || this;
                return (o.destination = e), (o.durationSelector = n), (o._leading = r), (o._trailing = i), (o._hasValue = !1), o;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  (this._hasValue = !0), (this._sendValue = t), this._throttled || (this._leading ? this.send() : this.throttle(t));
                }),
                (e.prototype.send = function() {
                  var t = this._hasValue,
                    e = this._sendValue;
                  t && (this.destination.next(e), this.throttle(e)), (this._hasValue = !1), (this._sendValue = void 0);
                }),
                (e.prototype.throttle = function(t) {
                  var e = this.tryDurationSelector(t);
                  e && this.add((this._throttled = (0, i.ft)(e, new i.IY(this))));
                }),
                (e.prototype.tryDurationSelector = function(t) {
                  try {
                    return this.durationSelector(t);
                  } catch (t) {
                    return this.destination.error(t), null;
                  }
                }),
                (e.prototype.throttlingDone = function() {
                  var t = this._throttled,
                    e = this._trailing;
                  t && t.unsubscribe(), (this._throttled = void 0), e && this.send();
                }),
                (e.prototype.notifyNext = function() {
                  this.throttlingDone();
                }),
                (e.prototype.notifyComplete = function() {
                  this.throttlingDone();
                }),
                e
              );
            })(i.Ds);
          function Ir(t, e, n) {
            return (
              void 0 === e && (e = u.P),
              void 0 === n && (n = Er),
              function(r) {
                return r.lift(new Dr(t, e, n.leading, n.trailing));
              }
            );
          }
          var Dr = (function() {
              function t(t, e, n, r) {
                (this.duration = t), (this.scheduler = e), (this.leading = n), (this.trailing = r);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Pr(t, this.duration, this.scheduler, this.leading, this.trailing));
                }),
                t
              );
            })(),
            Pr = (function(t) {
              function e(e, n, r, i, o) {
                var s = t.call(this, e) || this;
                return (s.duration = n), (s.scheduler = r), (s.leading = i), (s.trailing = o), (s._hasTrailingValue = !1), (s._trailingValue = null), s;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  this.throttled
                    ? this.trailing && ((this._trailingValue = t), (this._hasTrailingValue = !0))
                    : (this.add((this.throttled = this.scheduler.schedule(Vr, this.duration, { subscriber: this }))),
                      this.leading ? this.destination.next(t) : this.trailing && ((this._trailingValue = t), (this._hasTrailingValue = !0)));
                }),
                (e.prototype._complete = function() {
                  this._hasTrailingValue ? (this.destination.next(this._trailingValue), this.destination.complete()) : this.destination.complete();
                }),
                (e.prototype.clearThrottle = function() {
                  var t = this.throttled;
                  t &&
                    (this.trailing && this._hasTrailingValue && (this.destination.next(this._trailingValue), (this._trailingValue = null), (this._hasTrailingValue = !1)),
                    t.unsubscribe(),
                    this.remove(t),
                    (this.throttled = null));
                }),
                e
              );
            })(p.L);
          function Vr(t) {
            t.subscriber.clearThrottle();
          }
          var Lr = n(1410);
          function Or(t) {
            return (
              void 0 === t && (t = u.P),
              function(e) {
                return (0, Lr.P)(function() {
                  return e.pipe(
                    De(
                      function(e, n) {
                        var r = e.current;
                        return { value: n, current: t.now(), last: r };
                      },
                      { current: t.now(), value: void 0, last: void 0 }
                    ),
                    (0, Jt.U)(function(t) {
                      var e = t.current,
                        n = t.last,
                        r = t.value;
                      return new Ar(r, e - n);
                    })
                  );
                });
              }
            );
          }
          var Ar = (function() {
              return function(t, e) {
                (this.value = t), (this.interval = e);
              };
            })(),
            jr = n(1462);
          function Zr(t, e, n) {
            return (
              void 0 === n && (n = u.P),
              function(r) {
                var i = at(t),
                  o = i ? +t - n.now() : Math.abs(t);
                return r.lift(new Rr(o, i, e, n));
              }
            );
          }
          var Rr = (function() {
              function t(t, e, n, r) {
                (this.waitFor = t), (this.absoluteTimeout = e), (this.withObservable = n), (this.scheduler = r);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Mr(t, this.absoluteTimeout, this.waitFor, this.withObservable, this.scheduler));
                }),
                t
              );
            })(),
            Mr = (function(t) {
              function e(e, n, r, i, o) {
                var s = t.call(this, e) || this;
                return (s.absoluteTimeout = n), (s.waitFor = r), (s.withObservable = i), (s.scheduler = o), s.scheduleTimeout(), s;
              }
              return (
                r.ZT(e, t),
                (e.dispatchTimeout = function(t) {
                  var e = t.withObservable;
                  t._unsubscribeAndRecycle(), t.add((0, i.ft)(e, new i.IY(t)));
                }),
                (e.prototype.scheduleTimeout = function() {
                  var t = this.action;
                  t ? (this.action = t.schedule(this, this.waitFor)) : this.add((this.action = this.scheduler.schedule(e.dispatchTimeout, this.waitFor, this)));
                }),
                (e.prototype._next = function(e) {
                  this.absoluteTimeout || this.scheduleTimeout(), t.prototype._next.call(this, e);
                }),
                (e.prototype._unsubscribe = function() {
                  (this.action = void 0), (this.scheduler = null), (this.withObservable = null);
                }),
                e
              );
            })(i.Ds),
            zr = n(4944);
          function Ur(t, e) {
            return void 0 === e && (e = u.P), Zr(t, (0, zr._)(new jr.W()), e);
          }
          function Fr(t) {
            return (
              void 0 === t && (t = u.P),
              (0, Jt.U)(function(e) {
                return new Wr(e, t.now());
              })
            );
          }
          var Wr = (function() {
            return function(t, e) {
              (this.value = t), (this.timestamp = e);
            };
          })();
          function Br(t, e, n) {
            return 0 === n ? [e] : (t.push(e), t);
          }
          function Yr() {
            return Oe(Br, []);
          }
          function qr(t) {
            return function(e) {
              return e.lift(new Kr(t));
            };
          }
          var Kr = (function() {
              function t(t) {
                this.windowBoundaries = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  var n = new Gr(t),
                    r = e.subscribe(n);
                  return r.closed || n.add((0, i.ft)(this.windowBoundaries, new i.IY(n))), r;
                }),
                t
              );
            })(),
            Gr = (function(t) {
              function e(e) {
                var n = t.call(this, e) || this;
                return (n.window = new on.xQ()), e.next(n.window), n;
              }
              return (
                r.ZT(e, t),
                (e.prototype.notifyNext = function() {
                  this.openWindow();
                }),
                (e.prototype.notifyError = function(t) {
                  this._error(t);
                }),
                (e.prototype.notifyComplete = function() {
                  this._complete();
                }),
                (e.prototype._next = function(t) {
                  this.window.next(t);
                }),
                (e.prototype._error = function(t) {
                  this.window.error(t), this.destination.error(t);
                }),
                (e.prototype._complete = function() {
                  this.window.complete(), this.destination.complete();
                }),
                (e.prototype._unsubscribe = function() {
                  this.window = null;
                }),
                (e.prototype.openWindow = function() {
                  var t = this.window;
                  t && t.complete();
                  var e = this.destination,
                    n = (this.window = new on.xQ());
                  e.next(n);
                }),
                e
              );
            })(i.Ds);
          function Qr(t, e) {
            return (
              void 0 === e && (e = 0),
              function(n) {
                return n.lift(new Hr(t, e));
              }
            );
          }
          var Hr = (function() {
              function t(t, e) {
                (this.windowSize = t), (this.startWindowEvery = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new Jr(t, this.windowSize, this.startWindowEvery));
                }),
                t
              );
            })(),
            Jr = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.destination = e), (i.windowSize = n), (i.startWindowEvery = r), (i.windows = [new on.xQ()]), (i.count = 0), e.next(i.windows[0]), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  for (
                    var e = this.startWindowEvery > 0 ? this.startWindowEvery : this.windowSize, n = this.destination, r = this.windowSize, i = this.windows, o = i.length, s = 0;
                    s < o && !this.closed;
                    s++
                  )
                    i[s].next(t);
                  var c = this.count - r + 1;
                  if ((c >= 0 && c % e == 0 && !this.closed && i.shift().complete(), ++this.count % e == 0 && !this.closed)) {
                    var u = new on.xQ();
                    i.push(u), n.next(u);
                  }
                }),
                (e.prototype._error = function(t) {
                  var e = this.windows;
                  if (e) for (; e.length > 0 && !this.closed; ) e.shift().error(t);
                  this.destination.error(t);
                }),
                (e.prototype._complete = function() {
                  var t = this.windows;
                  if (t) for (; t.length > 0 && !this.closed; ) t.shift().complete();
                  this.destination.complete();
                }),
                (e.prototype._unsubscribe = function() {
                  (this.count = 0), (this.windows = null);
                }),
                e
              );
            })(p.L);
          function $r(t) {
            var e = u.P,
              n = null,
              r = Number.POSITIVE_INFINITY;
            return (
              (0, w.K)(arguments[3]) && (e = arguments[3]),
              (0, w.K)(arguments[2]) ? (e = arguments[2]) : (0, or.k)(arguments[2]) && (r = Number(arguments[2])),
              (0, w.K)(arguments[1]) ? (e = arguments[1]) : (0, or.k)(arguments[1]) && (n = Number(arguments[1])),
              function(i) {
                return i.lift(new Xr(t, n, r, e));
              }
            );
          }
          var Xr = (function() {
              function t(t, e, n, r) {
                (this.windowTimeSpan = t), (this.windowCreationInterval = e), (this.maxWindowSize = n), (this.scheduler = r);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new ei(t, this.windowTimeSpan, this.windowCreationInterval, this.maxWindowSize, this.scheduler));
                }),
                t
              );
            })(),
            ti = (function(t) {
              function e() {
                var e = (null !== t && t.apply(this, arguments)) || this;
                return (e._numberOfNextedValues = 0), e;
              }
              return (
                r.ZT(e, t),
                (e.prototype.next = function(e) {
                  this._numberOfNextedValues++, t.prototype.next.call(this, e);
                }),
                Object.defineProperty(e.prototype, 'numberOfNextedValues', {
                  get: function() {
                    return this._numberOfNextedValues;
                  },
                  enumerable: !0,
                  configurable: !0,
                }),
                e
              );
            })(on.xQ),
            ei = (function(t) {
              function e(e, n, r, i, o) {
                var s = t.call(this, e) || this;
                (s.destination = e), (s.windowTimeSpan = n), (s.windowCreationInterval = r), (s.maxWindowSize = i), (s.scheduler = o), (s.windows = []);
                var c = s.openWindow();
                if (null !== r && r >= 0) {
                  var u = { subscriber: s, window: c, context: null },
                    a = { windowTimeSpan: n, windowCreationInterval: r, subscriber: s, scheduler: o };
                  s.add(o.schedule(ii, n, u)), s.add(o.schedule(ri, r, a));
                } else {
                  var h = { subscriber: s, window: c, windowTimeSpan: n };
                  s.add(o.schedule(ni, n, h));
                }
                return s;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  for (var e = this.windows, n = e.length, r = 0; r < n; r++) {
                    var i = e[r];
                    i.closed || (i.next(t), i.numberOfNextedValues >= this.maxWindowSize && this.closeWindow(i));
                  }
                }),
                (e.prototype._error = function(t) {
                  for (var e = this.windows; e.length > 0; ) e.shift().error(t);
                  this.destination.error(t);
                }),
                (e.prototype._complete = function() {
                  for (var t = this.windows; t.length > 0; ) {
                    var e = t.shift();
                    e.closed || e.complete();
                  }
                  this.destination.complete();
                }),
                (e.prototype.openWindow = function() {
                  var t = new ti();
                  return this.windows.push(t), this.destination.next(t), t;
                }),
                (e.prototype.closeWindow = function(t) {
                  t.complete();
                  var e = this.windows;
                  e.splice(e.indexOf(t), 1);
                }),
                e
              );
            })(p.L);
          function ni(t) {
            var e = t.subscriber,
              n = t.windowTimeSpan,
              r = t.window;
            r && e.closeWindow(r), (t.window = e.openWindow()), this.schedule(t, n);
          }
          function ri(t) {
            var e = t.windowTimeSpan,
              n = t.subscriber,
              r = t.scheduler,
              i = t.windowCreationInterval,
              o = n.openWindow(),
              s = this,
              c = { action: s, subscription: null },
              u = { subscriber: n, window: o, context: c };
            (c.subscription = r.schedule(ii, e, u)), s.add(c.subscription), s.schedule(t, i);
          }
          function ii(t) {
            var e = t.subscriber,
              n = t.window,
              r = t.context;
            r && r.action && r.subscription && r.action.remove(r.subscription), e.closeWindow(n);
          }
          function oi(t, e) {
            return function(n) {
              return n.lift(new si(t, e));
            };
          }
          var si = (function() {
              function t(t, e) {
                (this.openings = t), (this.closingSelector = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new ci(t, this.openings, this.closingSelector));
                }),
                t
              );
            })(),
            ci = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                return (i.openings = n), (i.closingSelector = r), (i.contexts = []), i.add((i.openSubscription = (0, N.D)(i, n, n))), i;
              }
              return (
                r.ZT(e, t),
                (e.prototype._next = function(t) {
                  var e = this.contexts;
                  if (e) for (var n = e.length, r = 0; r < n; r++) e[r].window.next(t);
                }),
                (e.prototype._error = function(e) {
                  var n = this.contexts;
                  if (((this.contexts = null), n))
                    for (var r = n.length, i = -1; ++i < r; ) {
                      var o = n[i];
                      o.window.error(e), o.subscription.unsubscribe();
                    }
                  t.prototype._error.call(this, e);
                }),
                (e.prototype._complete = function() {
                  var e = this.contexts;
                  if (((this.contexts = null), e))
                    for (var n = e.length, r = -1; ++r < n; ) {
                      var i = e[r];
                      i.window.complete(), i.subscription.unsubscribe();
                    }
                  t.prototype._complete.call(this);
                }),
                (e.prototype._unsubscribe = function() {
                  var t = this.contexts;
                  if (((this.contexts = null), t))
                    for (var e = t.length, n = -1; ++n < e; ) {
                      var r = t[n];
                      r.window.unsubscribe(), r.subscription.unsubscribe();
                    }
                }),
                (e.prototype.notifyNext = function(t, e, n, r, i) {
                  if (t === this.openings) {
                    var o = void 0;
                    try {
                      o = (0, this.closingSelector)(e);
                    } catch (t) {
                      return this.error(t);
                    }
                    var s = new on.xQ(),
                      c = new C.w(),
                      u = { window: s, subscription: c };
                    this.contexts.push(u);
                    var a = (0, N.D)(this, o, u);
                    a.closed ? this.closeWindow(this.contexts.length - 1) : ((a.context = u), c.add(a)), this.destination.next(s);
                  } else this.closeWindow(this.contexts.indexOf(t));
                }),
                (e.prototype.notifyError = function(t) {
                  this.error(t);
                }),
                (e.prototype.notifyComplete = function(t) {
                  t !== this.openSubscription && this.closeWindow(this.contexts.indexOf(t.context));
                }),
                (e.prototype.closeWindow = function(t) {
                  if (-1 !== t) {
                    var e = this.contexts,
                      n = e[t],
                      r = n.window,
                      i = n.subscription;
                    e.splice(t, 1), r.complete(), i.unsubscribe();
                  }
                }),
                e
              );
            })(I.L);
          function ui(t) {
            return function(e) {
              return e.lift(new ai(t));
            };
          }
          var ai = (function() {
              function t(t) {
                this.closingSelector = t;
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new hi(t, this.closingSelector));
                }),
                t
              );
            })(),
            hi = (function(t) {
              function e(e, n) {
                var r = t.call(this, e) || this;
                return (r.destination = e), (r.closingSelector = n), r.openWindow(), r;
              }
              return (
                r.ZT(e, t),
                (e.prototype.notifyNext = function(t, e, n, r, i) {
                  this.openWindow(i);
                }),
                (e.prototype.notifyError = function(t) {
                  this._error(t);
                }),
                (e.prototype.notifyComplete = function(t) {
                  this.openWindow(t);
                }),
                (e.prototype._next = function(t) {
                  this.window.next(t);
                }),
                (e.prototype._error = function(t) {
                  this.window.error(t), this.destination.error(t), this.unsubscribeClosingNotification();
                }),
                (e.prototype._complete = function() {
                  this.window.complete(), this.destination.complete(), this.unsubscribeClosingNotification();
                }),
                (e.prototype.unsubscribeClosingNotification = function() {
                  this.closingNotification && this.closingNotification.unsubscribe();
                }),
                (e.prototype.openWindow = function(t) {
                  void 0 === t && (t = null), t && (this.remove(t), t.unsubscribe());
                  var e = this.window;
                  e && e.complete();
                  var n,
                    r = (this.window = new on.xQ());
                  this.destination.next(r);
                  try {
                    n = (0, this.closingSelector)();
                  } catch (t) {
                    return this.destination.error(t), void this.window.error(t);
                  }
                  this.add((this.closingNotification = (0, N.D)(this, n)));
                }),
                e
              );
            })(I.L);
          function li() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            return function(e) {
              var n;
              'function' == typeof t[t.length - 1] && (n = t.pop());
              var r = t;
              return e.lift(new fi(r, n));
            };
          }
          var fi = (function() {
              function t(t, e) {
                (this.observables = t), (this.project = e);
              }
              return (
                (t.prototype.call = function(t, e) {
                  return e.subscribe(new di(t, this.observables, this.project));
                }),
                t
              );
            })(),
            di = (function(t) {
              function e(e, n, r) {
                var i = t.call(this, e) || this;
                (i.observables = n), (i.project = r), (i.toRespond = []);
                var o = n.length;
                i.values = new Array(o);
                for (var s = 0; s < o; s++) i.toRespond.push(s);
                for (s = 0; s < o; s++) {
                  var c = n[s];
                  i.add((0, N.D)(i, c, void 0, s));
                }
                return i;
              }
              return (
                r.ZT(e, t),
                (e.prototype.notifyNext = function(t, e, n) {
                  this.values[n] = e;
                  var r = this.toRespond;
                  if (r.length > 0) {
                    var i = r.indexOf(n);
                    -1 !== i && r.splice(i, 1);
                  }
                }),
                (e.prototype.notifyComplete = function() {}),
                (e.prototype._next = function(t) {
                  if (0 === this.toRespond.length) {
                    var e = [t].concat(this.values);
                    this.project ? this._tryProject(e) : this.destination.next(e);
                  }
                }),
                (e.prototype._tryProject = function(t) {
                  var e;
                  try {
                    e = this.project.apply(this, t);
                  } catch (t) {
                    return void this.destination.error(t);
                  }
                  this.destination.next(e);
                }),
                e
              );
            })(I.L),
            pi = n(5080);
          function bi() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            return function(e) {
              return e.lift.call(pi.$R.apply(void 0, [e].concat(t)));
            };
          }
          function vi(t) {
            return function(e) {
              return e.lift(new pi.mx(t));
            };
          }
        },
        5987: (t, e, n) => {
          n.d(e, { ZT: () => i });
          var r = function(t, e) {
            return (
              (r =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function(t, e) {
                    t.__proto__ = e;
                  }) ||
                function(t, e) {
                  for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
                }),
              r(t, e)
            );
          };
          function i(t, e) {
            function n() {
              this.constructor = t;
            }
            r(t, e), (t.prototype = null === e ? Object.create(e) : ((n.prototype = e.prototype), new n()));
          }
        },
        8017: (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
          __webpack_require__.d(__webpack_exports__, { A: () => safeParse, o: () => safeStringify });
          const safeParse = (input, first = !0) => {
              first && (input = JSON.parse(input));
              for (let key in input) {
                let value = input[key],
                  regex = new RegExp('(|[a-zA-Z]w*|([a-zA-Z]w*(,s*[a-zA-Z]w*)*))s*=>'),
                  func = 'string' == typeof value && 'function' == value.substring(0, 8),
                  arrow = 'string' == typeof value && regex.test(value);
                try {
                  input[key] = func || arrow ? eval('(' + value + ')') : value;
                } catch (t) {
                  console.error(t, value), (input[key] = value);
                }
                input[key] instanceof Object && safeParse(input[key], !1);
              }
              return input;
            },
            safeStringify = t => {
              for (let e in t) t[e] instanceof Function && (t[e] = t[e].toString()), t[e] instanceof Object && safeStringify(t[e]);
              return JSON.stringify(t);
            };
        },
      },
      __webpack_module_cache__ = {};
    function __webpack_require__(t) {
      var e = __webpack_module_cache__[t];
      if (void 0 !== e) return e.exports;
      var n = (__webpack_module_cache__[t] = { exports: {} });
      return __webpack_modules__[t].call(n.exports, n, n.exports, __webpack_require__), n.exports;
    }
    (__webpack_require__.d = (t, e) => {
      for (var n in e) __webpack_require__.o(e, n) && !__webpack_require__.o(t, n) && Object.defineProperty(t, n, { enumerable: !0, get: e[n] });
    }),
      (__webpack_require__.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e)),
      (__webpack_require__.r = t => {
        'undefined' != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
          Object.defineProperty(t, '__esModule', { value: !0 });
      });
    var __webpack_exports__ = {};
    return (
      (() => {
        __webpack_require__.r(__webpack_exports__),
          __webpack_require__.d(__webpack_exports__, {
            DataDevices: () => y,
            DataPipeline: () => E,
            DataStream: () => l,
            DataStreamTrack: () => o,
            DataStreamTrackGenerator: () => f,
            DataStreamTrackProcessor: () => m,
            StreamContext: () => u,
            Streamer: () => c,
          });
        var t = __webpack_require__(8017);
        const e = () => (window.crypto ? window.crypto.randomUUID() : Math.floor(Math.random() + Math.random() * Math.random() * 1e16));
        class n {
          constructor(t = 'http://localhost', e) {
            if ('http:' === (t = new URL(t)).protocol) this.ws = new WebSocket('ws://' + t.host, [e]);
            else {
              if ('https:' !== t.protocol) return void console.log('invalid protocol');
              this.ws = new WebSocket('wss://' + t.host, [e]);
            }
            (this.sendBuffer = []),
              (this.callbacks = new Map()),
              (this.ready = !1),
              (this.ws.onopen = this._onopen),
              (this.ws.onerror = this._onerror),
              (this.ws.onmessage = this._onmessage),
              (this.ws.onclose = this._onclose),
              (window.onunload = window.onbeforeunload = () => {
                (this.ws.onclose = () => {}), this.ws.close();
              });
          }
          _onopen = t => {
            (this.ready = !0), this.sendBuffer.forEach(t => this.ws.send(t)), this.onopen();
          };
          _onclose = () => {
            (this.ready = !1), this.onclose();
          };
          _onerror = t => {
            console.error(t), this.onerror(t);
          };
          _onmessage = e => {
            try {
              let n = t.A(e.data);
              if (n.error) console.error(n.error);
              else {
                let t = n.callbackId,
                  e = n;
                if (t) {
                  e = e.data;
                  let n = this.callbacks.get(t);
                  n && n(e);
                }
                e && this.onmessage(e);
              }
            } catch (t) {
              console.error('Error parsing WebSocket message from server: ', e.data, t);
            }
          };
          onopen = () => {};
          onclose = () => {};
          onerror = () => {};
          onmessage = () => {};
          addEventListener = (t, e) => {
            'message' === t
              ? this.ws.addEventListener(t, t => {
                  e(JSON.parse(t.data));
                })
              : this.ws.addEventListener(t, e);
          };
          send = (n, r) =>
            new Promise(i => {
              let o = e();
              this.callbacks.set(o, t => {
                i(t), this.callbacks.delete(o);
              });
              let s = { data: n, callbackId: o, service: r },
                c = 'offload' === r ? t.o(s) : JSON.stringify(s);
              this.ready ? this.ws.send(c) : this.sendBuffer.push(c);
            });
        }
        class r extends EventTarget {
          get [Symbol.toStringTag]() {
            return 'Router';
          }
          constructor(t, r) {
            super(),
              (this.id = e()),
              (this.type = t),
              (this.settings = r),
              ['server', 'stream'].includes(t) && ((this.socket = r.socket ?? new n(r.server, r.auth)), 'stream' === t && this.socket.addEventListener('message', this.ondata)),
              (this.callback = r.callback instanceof Function ? r.callback : () => {});
          }
          process = async t => t;
          subscribe = t => {
            this.callback = t;
          };
          unsubscribe = () => {
            this.callback = null;
          };
          ondata = t => {
            'service' in t || this.callback(t);
          };
        }
        class i {
          constructor(t) {
            (this.deviceId = t.deviceId),
              (this.groupId = t.groupId),
              (this.autoGainControl = t.autoGainControl),
              (this.channelCount = t.channelCount),
              (this.echoCancellation = t.echoCancellation),
              (this.latency = t.latency),
              (this.noiseSuppression = t.noiseSuppression),
              (this.sampleRate = t.sampleRate),
              (this.sampleSize = t.sampleSize),
              (this.volume = t.volume),
              (this.aspectRatio = t.aspectRatio),
              (this.facingMode = t.facingMode),
              (this.frameRate = t.frameRate),
              (this.height = t.height),
              (this.width = t.width),
              (this.resizeMode = t.resizeMode),
              (this.cursor = t.cursor),
              (this.displaySurface = t.displaySurface),
              (this.logicalSurface = t.logicalSurface);
          }
        }
        class o extends EventTarget {
          get [Symbol.toStringTag]() {
            return 'DataStreamTrack';
          }
          constructor(t = {}) {
            super(),
              (this.contentHint = ''),
              (this.enabled = ''),
              (this.id = t.id ?? e()),
              (this.kind = t.constraints?.kind),
              this.kind && (this.kind = this.kind.replace('input', '').replace('output', '')),
              (this.label = t.constraints?.label),
              (this.muted = ''),
              (this.readyState = ''),
              (this.remote = ''),
              (this.callbacks = new Map()),
              (this.data = []),
              (this.pipeline = []);
          }
          deinit = () => {
            this.dispatchEvent(new Event('ended'));
          };
          applyConstraints = t => {};
          clone = () => {};
          getCapabilities = () => {};
          getConstraints = () => {};
          getSettings = () => new i(this);
          stop = () => {};
          addData = t => {
            Array.isArray(t) ? this.data.push(...t) : this.data.push(t), this.ondata(t);
          };
          ondata = t => {
            this.callbacks.forEach(e => {
              e(t);
            });
          };
          subscribe = t => {
            let n = e();
            return this.callbacks.set(n, t), n;
          };
        }
        class s extends o {
          constructor(t) {
            super(), (this.id = t.id), (this.label = t.label), (this.parent = t), (this.sendMessage = () => {});
          }
          send = t => this.parent.send(t);
        }
        class c extends r {
          get [Symbol.toStringTag]() {
            return 'Streamer';
          }
          constructor(t = {}) {
            super('stream', t),
              this.add(t.source),
              (this.config = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] }),
              (this.channels = null),
              (this.peers = new Map()),
              (this.dataChannelQueueLength = 0),
              (this.dataChannels = new Map()),
              (this.rooms = new Map()),
              (this.sources = new Map()),
              (this.toResolve = {}),
              (this.hasResolved = {}),
              (this.onpeerdisconnect = () => {}),
              this.addEventListener('peerdisconnect', t => {
                this.peers.delete(t.detail.id);
              }),
              this.addEventListener('peerdisconnect', t => {
                this.onpeerdisconnect(t);
              }),
              (this.onpeerconnect = () => {}),
              this.addEventListener('peerconnect', t => {
                this.peers.set(t.detail.id, t.detail.peer);
              }),
              this.addEventListener('peerconnect', t => {
                this.onpeerconnect(t);
              }),
              (this.ondatachannel = t => {}),
              this.addEventListener('datachannel', t => {
                this.ondatachannel(t);
              }),
              (this.onroom = t => {}),
              this.addEventListener('room', t => {
                this.onroom(t);
              }),
              (this.ontrack = t => {}),
              this.addEventListener('track', t => {
                this.ontrack(t);
              }),
              (this.ontrackremoved = t => {}),
              this.addEventListener('trackremoved', t => {
                this.ontrackremoved(t);
              }),
              (this.onroomclosed = t => {}),
              this.addEventListener('roomclosed', t => {
                this.onroomclosed(t);
              });
            let e = this.socket.onmessage;
            this.socket.onmessage = async t => {
              if ((e(t), 'rooms' === t.cmd))
                t.data.forEach(t => {
                  this.rooms.set(t.uuid, t);
                }),
                  this.dispatchEvent(new CustomEvent('room', { detail: { rooms: t.data } }));
              else if ('roomadded' === t.cmd)
                this.rooms.set(t.data.uuid, t.data), this.dispatchEvent(new CustomEvent('room', { detail: { room: t.data, rooms: Array.from(this.rooms, ([t, e]) => e) } }));
              else if ('roomclosed' === t.cmd) this.dispatchEvent(new CustomEvent('roomclosed'));
              else if ('connect' === t.cmd) {
                this.createPeerConnection(t.data);
                for (let e of this.sources) {
                  let n = e[1].getDataTracks();
                  await this.addDataTracks(t.data, n);
                }
              } else if ('answer' === t.cmd) this.peers.get(t.data.id).setRemoteDescription(t.data.msg);
              else if ('candidate' === t.cmd) {
                let e = this.peers.get(t.data.id),
                  n = new RTCIceCandidate(t.data.msg);
                e.addIceCandidate(n).catch(t => console.error(t));
              } else 'disconnectPeer' === t.cmd ? this.closeConnection(t.data, this.peers.get(t.data)) : 'offer' === t.cmd && this.onoffer(t.data.id, t.data.msg, t.id);
            };
          }
          addDataTracks = async (t, e) => {
            for (let n of e) await this.openDataChannel({ name: `DataStreamTrack${this.dataChannelQueueLength}`, peer: t, reciprocated: !1 }).then(t => n.subscribe(t.sendMessage));
          };
          onoffer = async (t, e, n) => {
            let r = await this.createPeerConnection(t, n);
            const i = new RTCSessionDescription(e);
            r.setRemoteDescription(i)
              .then(() => r.createAnswer())
              .then(t => r.setLocalDescription(t))
              .then(() => {
                this.send({ cmd: 'answer', data: { id: t, msg: r.localDescription } });
              });
          };
          handleNegotiationNeededEvent = (t, e) => {
            t.createOffer()
              .then(e => t.setLocalDescription(e))
              .then(() => {
                this.send({ cmd: 'offer', data: { id: e, msg: t.localDescription } });
              });
          };
          handleICECandidateEvent = (t, e) => {
            t.candidate && this.send({ cmd: 'candidate', data: { id: e, msg: t.candidate } });
          };
          handleTrackEvent = (t, e) => {
            if (t.track) {
              let n = t.track;
              return this.dispatchEvent(new CustomEvent('track', { detail: { track: n, id: e } })), !0;
            }
          };
          handleDataChannelEvent = async t => {
            if ((console.log('NEW DATA CHANNEL TO HANDLE'), !this.channels || this.channels.includes(t.channel.label))) {
              let e = await this.openDataChannel({ channel: t.channel, callback: (t, e) => e.addData(t) });
              const n = this.toResolve[e.label];
              n && (delete this.toResolve[e.label], n(e)), (this.hasResolved[e.label] = e), this.dispatchEvent(new CustomEvent('datachannel', { detail: e }));
            }
          };
          handleRemoveTrackEvent = (t, e) => {
            if (t.track) {
              let n = t.track;
              return this.dispatchEvent(new CustomEvent('trackremoved', { detail: { track: n, id: e } })), !0;
            }
          };
          handleICEConnectionStateChangeEvent = (t, e) => {
            const n = this.peers.get(e);
            switch (n?.iceConnectionState) {
              case 'closed':
              case 'failed':
                this.closeConnection(e, n);
            }
          };
          handleICEGatheringStateChangeEvent = t => {};
          handleSignalingStateChangeEvent = (t, e) => {
            const n = this.peers.get(e);
            'closed' === n?.signalingState && this.closeConnection(e, n);
          };
          closeConnection = (t, e) => {
            this.dispatchEvent(new CustomEvent('peerdisconnect', { detail: { id: t, peer: e } }));
          };
          createPeerConnection = async (t, e) => {
            const n = new RTCPeerConnection(this.config);
            return (
              (n.onicecandidate = e => this.handleICECandidateEvent(e, t)),
              (n.onnegotiationneeded = e => this.handleNegotiationNeededEvent(n, t)),
              (n.ondatachannel = e => this.handleDataChannelEvent(e, t)),
              e
                ? ((n.ontrack = t => this.handleTrackEvent(t, e)),
                  (n.onremovetrack = t => this.handleRemoveTrackEvent(t, e)),
                  (n.oniceconnectionstatechange = e => this.handleICEConnectionStateChangeEvent(e, t)),
                  (n.onicegatheringstatechange = e => this.handleICEGatheringStateChangeEvent(e, t)),
                  (n.onsignalingstatechange = e => this.handleSignalingStateChangeEvent(e, t)))
                : this.dispatchEvent(new CustomEvent('peerconnect', { detail: { id: t, peer: n } })),
              this.sources.forEach(t => {
                t.getTracks().forEach(async e => {
                  e instanceof MediaStreamTrack && n.addTrack(e, t);
                });
              }),
              n
            );
          };
          add = async t => {
            t &&
              (this.sources.set(t.id, t),
              t.addEventListener('track', t => {
                let e = t.detail.kind;
                if (!e || ('video' !== e && 'audio' !== e)) for (let e of this.peers) this.addDataTracks(e[0], [t.detail]);
              }));
          };
          remove = t => {
            let e = this.sources.get(t);
            this.sources.delete(t), e.removeEventListener('track', e);
          };
          getRooms = async t => (await this.send({ cmd: 'rooms', data: t })).data;
          joinRoom = async (t, e) => this.send({ cmd: 'connect', data: Object.assign(t, { authorization: e }) });
          createRoom = async t => this.send({ cmd: 'createroom', data: t });
          leaveRoom = async t => (this.peers.forEach((t, e) => this.peers.delete(e)), this.send({ cmd: 'disconnect', data: t }));
          send = async t => await this.socket.send(t, 'webrtc');
          openDataChannel = async ({ peer: t, channel: e, name: n, callback: r, reciprocated: i } = { callback: () => {} }) => {
            let o = !1;
            return this.dataChannelQueueLength++, e instanceof RTCDataChannel || ((o = !0), (e = this.peers.get(t).createDataChannel(n))), await this.useDataChannel(e, r, o, i);
          };
          closeDataChannel = async t => {
            let e = this.dataChannels.get(t);
            e && e.close(), this.dataChannels.delete(t);
          };
          useDataChannel = (t, e, n, r = !0) =>
            new Promise(i => {
              t.addEventListener('open', () => {
                const o = new s(t);
                n && this.dataChannels.set(o.id, o);
                let c = t => {
                  t.parent.addEventListener('message', n => {
                    e && e(JSON.parse(n.data), t);
                  }),
                    (t.sendMessage = e => {
                      this.sendMessage(e, t.id, r);
                    }),
                    i(t);
                };
                if (n && r) {
                  let t = this.hasResolved[o.label];
                  t ? (c(t), delete this.hasResolved[o.label]) : (this.toResolve[o.label] = c);
                } else c(o);
              }),
                t.addEventListener('close', () => {
                  console.error('Data channel closed', t);
                });
            });
          sendMessage = (t, e, n) => {
            let r = JSON.stringify(t),
              i = () => {
                let t = this.dataChannels.get(e);
                t
                  ? 'open' === t.parent.readyState
                    ? t.send(r)
                    : t.parent.addEventListener('open', () => {
                        t.send(r);
                      })
                  : n && setTimeout(i, 500);
              };
            i();
          };
        }
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        class u {
          constructor({ server: t, auth: e, onmessage: r } = {}) {
            r || (r = () => {}),
              t || (t = 'http://localhost'),
              (this.dataDevices = navigator.dataDevices),
              (this.streams = new Map()),
              (this.baseStream = new l()),
              (this.audioContext = null),
              (this.socket = null),
              t && (this.socket = new n(t, e)),
              (this.active = !1),
              (this.socket.onmessage = r),
              (this.constraints = { server: t, socket: this.socket }),
              (this.onvideo = () => {}),
              (this.onreconnect = () => {}),
              (this.onstreamremoved = () => {}),
              (this.streamer = new c({ socket: this.socket })),
              (this.streamer.onroomclosed = () => {
                (this.active = !1),
                  this.streams.forEach((t, e) => {
                    this.onstreamremoved(e), this.removeStream(e);
                  });
              }),
              (this.streamer.ontrack = t => {
                const e = new MediaStream();
                e.addTrack(t.detail.track),
                  'video' === t.detail.track.kind ? this.addStream(e, t.detail.id, 'video') : 'audio' === t.detail.track.kind && this.addStream(e, t.detail.id, 'audio');
              }),
              (this.streamer.onpeerdisconnect = t => {
                this.onstreamremoved(t.detail.id), this.removeStream(t.detail.id);
              }),
              (this.streams = new Map());
          }
          connect = async () => {
            let t = await navigator.dataDevices.getUserStream(this.constraints);
            return await this.handleConnect(t);
          };
          setConstraint = (t, e) => {
            (this.constraints[t] = e), this.onconstraintchanged();
          };
          onconstraintchanged = async () => {
            if (this.active) {
              let t = await navigator.dataDevices.getUserStream(this.constraints),
                e = [],
                n = this.streams.get('me');
              n.audio && e.push(n.audio.stream.getAudioTracks()[0]),
                n.video && e.push(n.video.stream.getVideoTracks()[0]),
                e.forEach(e => {
                  this.streamer.peers.forEach(t => {
                    t.getSenders()
                      .find(function(t) {
                        return t.track?.kind == e.kind;
                      })
                      .replaceTrack(e);
                  }),
                    'video' === e.kind ? this.onvideo(t, 'me', this) : 'audio' === e.kind && (this.removeStream('me', 'audio'), this.addStream(t, 'me', 'audio'));
                });
            }
          };
          handleConnect = async t =>
            new Promise((e, n) => {
              t.getAudioTracks().length > 0 && this.addStream(t, 'me', 'audio');
              let r = t.getVideoTracks()[0];
              this.active ? (this.onreconnect(t), n('already connected')) : ((this.active = !0), r && t && this.addStream(t, 'me', 'video', r), e(t));
            });
          removeStream = (t, e) => {
            let n = this.streams.get(t);
            for (let t in n) {
              const r = !e || e === t;
              'video' === t && r ? delete n.video : ('audio' === t || r) && (n.audio.onended(), delete n.audio);
            }
            e || this.streams.delete(t);
          };
          addStream = (t, e, n) => {
            this.constraints[n] = t;
            let r = this.streams.get(e);
            if ((r || ((r = {}), this.streams.set(e, r)), 'audio' === n)) {
              this.audioContext || this.initAudio();
              var i = this.audioContext.createBiquadFilter();
              (i.type = 'highpass'), (i.frequency.value = 1e4);
              var o = this.audioContext.createGain();
              let e = this.audioContext.createMediaStreamSource(t);
              e.connect(i), i.connect(o);
              let s = () => {
                e.disconnect(), o.disconnect(), i.disconnect();
              };
              (e.onended = s), o.connect(this.gainNode), (r[n] = { stream: t, source: e, onended: s });
            } else 'video' === n ? (this.onvideo(t, e, this), (r[n] = { stream: t })) : (r[n] = { stream: t });
          };
          initAudio = () => {
            this.audioContext ||
              ('function' == typeof AudioContext ? (this.audioContext = new AudioContext()) : ((this.audioContext = !1), alert('Sorry! Web Audio not supported.')),
              (this.gainNode = this.audioContext.createGain()),
              (this.analyserNode = this.audioContext.createAnalyser()),
              (this.analyserNode.fftSize = 2048),
              this.gainNode.connect(this.analyserNode),
              (this.outputNode = this.audioContext.destination),
              this.analyserNode.connect(this.outputNode));
          };
        }
        let a = { count: 0, times: [], red: [], ir: [], ratio: [], ambient: [], temp: [], refuS: null };
        const h = [
          {
            label: 'Sine',
            ondata: t => t.split(',').map(t => Number.parseFloat(t)),
            onconnect: t => {
              let e = [1, 5, 10],
                n = () => {
                  let r = [];
                  e.forEach(t => {
                    r.push(Math.sin((2 * t * Math.PI * Date.now()) / 1e3));
                  });
                  let i = r.join(',');
                  t.ondata(i), setTimeout(n, 1e3 / 60);
                };
              n();
            },
            kind: 'dummyinput',
          },
          {
            label: 'HEGduino',
            ondata: (t, e) => {
              let n = [];
              if (t.indexOf('|') > -1) {
                let e = t.split('|');
                if (e.length > 3) {
                  if ((a.count++, 1 === a.count && (a.startTime = Date.now()), 0 === a.times.length)) a.times.push(Date.now()), (a.refuS = parseFloat(e[0]));
                  else {
                    let t = parseFloat(e[0]);
                    a.times.push(Math.floor(a.times[a.times.length - 1] + 0.001 * (t - a.refuS))), (a.refuS = t);
                  }
                  a.red.push(parseFloat(e[1])), a.ir.push(parseFloat(e[2])), a.ratio.push(parseFloat(e[3])), a.ambient.push(parseFloat(e[4])), a.temp.push(parseFloat(e[5]));
                }
                n.push(parseFloat(e[3]));
              } else console.log('HEGDUINO: ', t);
              return n;
            },
            kind: 'fnirsinput',
            namePrefix: 'HEG',
            serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
            characteristics: { transmit: '6e400003-b5a3-f393-e0a9-e50e24dcca9e', receive: '6e400002-b5a3-f393-e0a9-e50e24dcca9e' },
            fileCharacteristicUuid: '6E400006-B5A3-F393-E0A9-E50E24DCCA9E',
            usbVendorId: 4292,
            usbProductId: 6e4,
          },
          {
            label: 'Muse',
            kind: 'eeginput',
            device: __webpack_require__(2306).MuseClient,
            onconnect: async t => {
              console.log(t);
              let e = t.device;
              await e.start(),
                e.eegReadings.subscribe(e => {
                  let n = [, , ,];
                  (n[e.electrode] = e.samples), t.ondata(n);
                }),
                e.gatt.device.addEventListener('gattserverdisconnected', () => {
                  console.log('device disconnected');
                });
            },
            ondata: t => t,
          },
        ];
        class l extends MediaStream {
          get [Symbol.toStringTag]() {
            return 'DataStream';
          }
          constructor(t = []) {
            super(t),
              (this.tracks = this.getTracks()),
              (this._addTrack = this.addTrack),
              (this._getTracks = this.getTracks),
              (this.addTrack = t => {
                if (!this.tracks.includes(t)) {
                  try {
                    this._addTrack(t);
                  } catch {}
                  this.tracks.push(t), this.dispatchEvent(new CustomEvent('track', { detail: t }));
                }
                return t;
              }),
              (this.getTracks = () => {
                const t = this._getTracks(),
                  e = this.getDataTracks();
                return (this.tracks = [...t, ...e]);
              });
          }
          getDataTracks = () => this.tracks.filter(t => !t.kind || (!t.kind.includes('video') && !t.kind.includes('audio')));
        }
        class f extends o {
          constructor() {
            super(), (this.writable = new WritableStream({ start: this.start, write: this.write, close: this.close, abort: this.abort }));
          }
          start = t => {};
          write = (t, e) => {
            this.addData(t);
          };
          close = t => {
            console.log('All data successfully read!');
          };
          abort = t => {
            console.error('Something went wrong!', t);
          };
        }
        class d {
          set ondata(t) {
            this.datacallbacks.push(t);
          }
          constructor(t) {
            (this.datacallbacks = []),
              (this.constraints = t),
              (this.device = t.device ? new t.device(t) : this),
              (this.dataStream = t.dataStream),
              (this.onconnect = t.onconnect ?? this.onconnect),
              (this.ondisconnect = t.ondisconnect ?? this.ondisconnect);
            let e = t.ondata ?? this.ondata;
            this.datacallbacks.push(e),
              (this.onerror = t.onerror ?? this.onerror),
              t.encode ? (this.encode = t.encode) : (this.encoder = new TextEncoder('utf-8')),
              t.decode ? (this.decode = t.decode) : (this.decoder = new TextDecoder('utf-8'));
          }
          connect = async () => {
            this.device !== this && (await this.device.connect()), this.onconnect(this);
          };
          disconnect = async () => {
            this.device !== this && (await this.device.disconnect()), this.ondisconnect(this);
          };
          send = async () => {
            this.onsend();
          };
          encode = (t, e) => this.encoder.encode(t);
          decode = (t, e) => this.decoder.decode(t);
          onconnect = async () => console.log(`${this.constructor.name} connected!`);
          ondisconnect = async () => console.log(`${this.constructor.name} disconnected!`);
          onsend = async () => {};
          onerror = async t => console.log(`${this.constructor.name} Error: ${t}`);
          ondata = t => {
            this._ondata(t);
          };
          _ondata(t) {
            this.datacallbacks.forEach(e => {
              let n = e(t),
                r = this.dataStream.getDataTracks();
              n.forEach((t, e) => {
                let n = r[e];
                n || (n = this.dataStream.addTrack(new o(this.device))), n.addData(t);
              });
            });
          }
        }
        class p extends d {
          constructor(t) {
            super(t),
              (this.namePrefix = t.namePrefix),
              (this.serviceUUID = t.serviceUUID),
              (this.characteristics = {}),
              (this.device = null),
              (this.server = null),
              (this.service = null),
              (this.transmitCharacteristic = null);
            let e = t.otaServiceUuid,
              n = t.fileCharacteristicUuid;
            (this.otaServiceUuid = 'string' == typeof e ? e.toLowerCase() : e),
              (this.fileCharacteristicUuid = 'string' == typeof n ? n.toLowerCase() : n),
              (this.otaService = null),
              (this.readyFlagCharacteristic = null),
              (this.dataToSend = null),
              (this.updateData = null),
              this.totalSize,
              this.remaining,
              this.amountToWrite,
              this.currentPosition,
              (this.currentHardwareVersion = 'N/A'),
              (this.softwareVersion = 'N/A'),
              (this.latestCompatibleSoftware = 'N/A'),
              (this.characteristicSize = 512);
          }
          connect = async () => {
            let t = 'string' == typeof this.serviceUUID ? this.serviceUUID.toLowerCase() : this.serviceUUID;
            console.log(t);
            let e = [];
            t && e.push({ services: [t] }),
              this.namePrefix && e.push({ namePrefix: this.namePrefix }),
              await navigator.bluetooth
                .requestDevice({ filters: e })
                .then(t => ((this.device = t), t.gatt.connect()))
                .then(e => ((this.server = e), e.getPrimaryService(t)))
                .then(async t => {
                  (this.service = t), (this.otaService = t), this.device.addEventListener('gattserverdisconnected', this.ondisconnect);
                  for (let t in this.constraints.characteristics) await this.connectCharacteristic(t, this.constraints.characteristics[t]);
                  this.onconnect(this);
                })
                .catch(t => {
                  console.error(t), this.onerror(t), (t = !0);
                });
          };
          disconnect = () => {
            this.server?.disconnect(), this.ondisconnect(this);
          };
          send = (t, e) => {
            if (this.transmitCharacteristic) return this.transmitCharacteristic.writeValue(this.encode(t, e));
          };
          onnotification = (t, e) => this.ondata(this.decode(t.target.value, e), e);
          connectCharacteristic = async (t, e) => {
            if ((console.log(t, e), Array.isArray(e))) await Promise.all(e.map((e, n) => this.connectCharacteristic(`${t}${n}`, e)));
            else {
              e = 'string' == typeof e ? e.toLowerCase() : e;
              const n = await this.service.getCharacteristic(e);
              this.characteristics[t] = n;
              let r = n.properties;
              if (((r.write || r.writeWithoutResponse) && (this.transmitCharacteristic = n), r.notify))
                return (
                  n.addEventListener('characteristicvaluechanged', e => {
                    this.onnotification(e, t);
                  }),
                  n.startNotifications()
                );
            }
          };
          getFile() {
            var t = document.createElement('input');
            (t.accept = '.bin'),
              (t.type = 'file'),
              (t.onchange = e => {
                var n = e.target.files[0],
                  r = new FileReader();
                (r.onload = e => {
                  (this.updateData = e.target.result), this.SendFileOverBluetooth(), (t.value = '');
                }),
                  r.readAsArrayBuffer(n);
              }),
              t.click();
          }
          SendFileOverBluetooth() {
            this.otaService
              ? ((this.totalSize = this.updateData.byteLength),
                (this.remaining = this.totalSize),
                (this.amountToWrite = 0),
                (this.currentPosition = 0),
                this.otaService
                  .getCharacteristic(this.fileCharacteristicUuid)
                  .then(
                    t => (
                      (this.readyFlagCharacteristic = t),
                      t.startNotifications().then(t => {
                        this.readyFlagCharacteristic.addEventListener('characteristicvaluechanged', this.SendBufferedData);
                      })
                    )
                  )
                  .catch(t => {
                    console.log(t);
                  }),
                this.SendBufferedData())
              : console.log('No ota Service');
          }
          SendBufferedData() {
            this.remaining > 0 &&
              (this.remaining >= this.characteristicSize ? (this.amountToWrite = this.characteristicSize) : (this.amountToWrite = this.remaining),
              (this.dataToSend = this.updateData.slice(this.currentPosition, this.currentPosition + this.amountToWrite)),
              (this.currentPosition += this.amountToWrite),
              (this.remaining -= this.amountToWrite),
              console.log('remaining: ' + this.remaining),
              this.otaService
                .getCharacteristic(this.fileCharacteristicUuid)
                .then(t => this.RecursiveSend(t, this.dataToSend))
                .then(t => {
                  let e = ((this.currentPosition / this.totalSize) * 100).toPrecision(3) + '%';
                  this.onProgress(e);
                })
                .catch(t => {
                  console.log(t);
                }));
          }
          RecursiveSend(t, e) {
            return t.writeValue(e).catch(n => this.RecursiveSend(t, e));
          }
        }
        class b extends d {
          constructor(t) {
            super(t),
              (this.displayPorts = []),
              (this.encodedBuffer = ''),
              (this.recordData = !1),
              (this.recorded = []),
              (this.port = null),
              (this.decoder = null),
              (this.subscribed = !1),
              (this.readable = null),
              (this.writer = null),
              (this.monitoring = !1),
              (this.newSamples = 0),
              (this.monitorSamples = 1e4),
              (this.monitorData = []),
              (this.monitorIdx = 0),
              navigator.serial
                ? (this.decoder = new TextDecoder())
                : (console.log('ERROR: Cannot locate navigator.serial. Enable #experimental-web-platform-features in chrome://flags'),
                  alert('Serial support not found. Enable #experimental-web-platform-features in chrome://flags or use a chrome extension'));
          }
          connect = async () => {
            let { usbVendorId: t, usbProductId: e } = this.constraints;
            var n = /[0-9A-Fa-f]{6}/g;
            'string' != typeof t && (n.test(t) || (t = `0x${t.toString(16)}`)), 'string' != typeof t && (n.test(e) || (e = `0x${e.toString(16)}`));
            const r = [{ usbVendorId: t, usbProductId: e }];
            this.port = await navigator.serial.requestPort({ filters: r }).then(this.onPortSelected);
          };
          send = async t => {
            for (var e = unescape(encodeURIComponent((t += '\n'))), n = new Uint8Array(e.length), r = 0; r < e.length; ++r) n[r] = e.charCodeAt(r);
            if (navigator.serial && this.port.writable) {
              const t = this.port.writable.getWriter();
              await t.write(n.buffer), t.releaseLock();
            }
          };
          subscribe = async t => {
            if (this.port.readable && !0 === this.subscribed) {
              (this.readable = t.readable), console.error('Managing the readable stream internally');
              const e = new TransformStream({ transform: async (t, e) => (this.onReceive(t), t) });
              return (
                this.readable
                  .pipeThrough(e)
                  .pipeTo(new WritableStream({}))
                  .then(() => console.log('All data successfully written!'))
                  .catch(t => this.handleError),
                !0
              );
            }
            return !1;
          };
          handleError = async t => {
            console.log(t),
              t.message.includes('framing') || t.message.includes('overflow') || t.message.includes('overrun') || t.message.includes('Overflow') || t.message.includes('break')
                ? ((this.subscribed = !1),
                  setTimeout(async () => {
                    this.readable && (await this.readable.close(), (this.readable = null)), (this.subscribed = !0), this.subscribe(port);
                  }, 30))
                : t.message.includes('parity') || t.message.includes('Parity')
                ? this.port &&
                  ((this.subscribed = !1),
                  setTimeout(async () => {
                    this.readable && (await this.readable.close(), (this.readable = null)),
                      await port.close(),
                      (this.connected = !1),
                      setTimeout(() => {
                        this.onPortSelected(this.port);
                      }, 100);
                  }, 50))
                : await this.closePort();
          };
          onPortSelected = async t => {
            (this.port = t), navigator.serial.addEventListener('disconnect', this.closePort);
            try {
              await t.open({ baudRate: 115200, bufferSize: 1e3 });
            } catch (e) {
              await t.open({ baudRate: 115200, bufferSize: 1e3 });
            }
            this.onconnect(this), (this.connected = !0), (this.subscribed = !0), await this.subscribe(t);
          };
          onReceive = t => {
            var e;
            for (this.encodedBuffer += this.decoder.decode(t); (e = this.encodedBuffer.indexOf('\n')) >= 0; ) {
              var n = this.encodedBuffer.substr(0, e + 1);
              1 == this.recordData && this.recorded.push(n),
                (this.monitoring = !0) && (this.newSamples++, this.monitorData.push(n)),
                this.ondata(n),
                (this.encodedBuffer = this.encodedBuffer.substr(e + 1));
            }
          };
          closePort = async (t = this.port) => {
            this.port &&
              ((this.subscribed = !1),
              setTimeout(async () => {
                try {
                  this.readable && (await this.readable.close(), (this.readable = null)), await t.close(), (this.connected = !1), this.ondisconnect(this);
                } catch (t) {
                  console.error(t);
                }
              }, 50));
          };
        }
        class v extends d {
          constructor(t) {
            super(t), (this.url = t.url), (this.source = null), (this.customCallbacks = customCallbacks);
          }
          newPostCommand(t = 'post', e = this.url, n, r, i) {
            const o = () => {
              var t = new XMLHttpRequest();
              t.open('POST', e, !0, r, i),
                t.send(n),
                (t.onerror = function() {
                  t.abort();
                });
            };
            return (this[t] = o), o;
          }
          send = async (t, e = this.url) => await fetch(e, { method: 'POST', body: t });
          connect = () => this.createEventListeners();
          disconnect = () => this.removeEventListeners();
          onconnect = t => console.log('Event source connected!', t.data);
          onerror = t => {
            console.log('Error:', t.data), t.target.readyState !== EventSource.OPEN && console.log('Event source disconnected!');
          };
          ondata = t => console.log('event source:', t.data);
          createEventListeners = () => {
            null !== this.source && this.removeEventListeners(this.customCallbacks, this.source),
              window.EventSource &&
                ((this.source = new EventSource(this.url)),
                this.source.addEventListener('open', this.onconnect, !1),
                this.source.addEventListener('error', this.onerror, !1),
                this.source.addEventListener('message', this.ondata, !1),
                this.customCallbacks.length > 0 &&
                  this.customCallbacks.forEach((t, e) => {
                    this.source.addEventListener(t.tag, t.callback, !1);
                  })),
              this.onconnect(this);
          };
          removeEventListeners = () => {
            window.EventSource &&
              (source.close(),
              source.removeEventListener('open', this.openEvent, !1),
              source.removeEventListener('error', this.errorEvent, !1),
              source.removeEventListener('message', this.messageEvent, !1),
              customCallbacks.length > 0 &&
                customCallbacks.forEach((t, e) => {
                  source.removeEventListener(t.tag, t.callback, !1);
                }),
              (source = null)),
              this.ondisconnect(this);
          };
        }
        class y extends EventTarget {
          get [Symbol.toStringTag]() {
            return 'DataDevices';
          }
          constructor() {
            super(), (this.devices = h);
          }
          _devicechanged = () => {
            this.dispatchEvent(new Event('devicechange'));
          };
          enumerateDevices = async () => {
            let t = await navigator.usb.getDevices(),
              e = await navigator.serial.getPorts(),
              n = await navigator.bluetooth.getDevices();
            return [...(await navigator.mediaDevices.enumerateDevices()), ...e, ...t, ...n];
          };
          getSupportedDevices = async () => [...(await navigator.mediaDevices.enumerateDevices()), ...h];
          getSupportedConstraints = async () => new DataTrackSupportedConstraints();
          startDataStream = async (t = {}, e = new l()) => {
            let n;
            return (
              (t.dataStream = e),
              (n = t.device
                ? new d(t)
                : t.ble
                ? new p(t)
                : t.serial
                ? new b(t)
                : t.wifi
                ? new v(t)
                : t.serviceUUID
                ? new p(t)
                : t.usbVendorId
                ? new b(t)
                : t.url
                ? new v(t)
                : new d(t)),
              await n.connect(),
              e
            );
          };
          getUserStream = async t => {
            let e;
            delete t.audio, (t.video || t.audio) && (e = await navigator.mediaDevices.getUserMedia(t));
            let n = new l(e);
            t.screen && (await navigator.mediaDevices.getDisplayMedia({ video: !0 })).getTracks().forEach(n.addTrack);
            let r = [t.dummy, t.eeg, t.fnirs, t.emg];
            if (((r = r.filter(t => t instanceof l)), 0 === r.length)) {
              let e = {};
              t.eeg && (e.eeginput = !0), t.fnirs && (e.fnirsinput = !0), t.emg && (e.emginput = !0), t.dummy && (e.dummyinput = !0);
              let i = Object.keys(e);
              const o = h.filter(t => i.includes(t.kind))[0],
                s = await this.startDataStream(o, n);
              o && r.push(s);
            }
            return (
              r.forEach(t => t.getTracks().forEach(n.addTrack)),
              n.getTracks().forEach((e, n) => {
                e.applyConstraints(t), e.getSettings();
              }),
              n
            );
          };
        }
        class m {
          constructor({ track: t }) {
            (this.track = t), (this.subid = null), (this.readable = new ReadableStream({ start: this.start, pull: this.pull, cancel: this.cancel }, {}));
          }
          start = t => {
            this.track &&
              (this.track.data.forEach(e => {
                t.enqueue(e);
              }),
              (this.subid = this.track.subscribe(e => {
                t.enqueue(e);
              })));
          };
          pull = t => {};
          cancel = () => {
            this.track && this.track.unsubscribe(this.subid);
          };
        }
        Symbol.toStringTag, Symbol.toStringTag;
        let w = [],
          g = [],
          _ = (t, e) => e.push(t),
          x = (t, e) => {
            e.push(e[e.length - 1].pipeTo(t));
          },
          S = (t, e, n) => {
            e.push(t), n.push(n[n.length - 1].pipeThrough(t));
          };
        self.onmessage = async t => {
          'init' === t.data.cmd && t.data.data.source.pipeThrough(transformer).pipeTo(t.data.data.sink),
            'add' === t.data.cmd && S(t.data.data, w, g),
            'source' === t.data.cmd && _(t.data.data, g),
            'sink' === t.data.cmd && x(t.data.data, g);
        };
        const T = self;
        class E {
          constructor({ thread: t } = {}) {
            if (
              ((this.id = e()),
              (this.pipeline = []),
              (this.bound = []),
              (this.source = null),
              (this.sink = null),
              (this.output = null),
              (this.kind = null),
              (this.thread = null == t || t),
              (this.worker = null),
              this.thread)
            ) {
              try {
                this.worker = new Worker('./src/pipeline.worker.js', { name: 'pipelineworker', type: 'module' });
              } catch {
                try {
                  this.worker = T;
                } catch (t) {
                  console.log('Error creating worker. ERROR:', t);
                }
              }
              this.worker.postMessage({ cmd: 'test' });
            }
          }
          setSource = t => {
            let e;
            'video' === t.kind || 'audio ' === t.kind
              ? 'MediaStreamTrackProcessor' in window
                ? (e = new MediaStreamTrackProcessor({ track: t }))
                : alert('Your browser does not support the experimental MediaStreamTrack API for Insertable Streams of Media')
              : (e = new DataStreamTrackProcessor({ track: t })),
              (this.kind = t.kind),
              (this.source = e.readable),
              this.thread ? this.worker.postMessage({ cmd: 'source', data: this.source }, [this.source]) : _(this.source, this.bound);
          };
          setSink = (t = this.kind) => {
            'video' === t || 'audio ' === t
              ? 'MediaStreamTrackGenerator' in window
                ? (this.output = new MediaStreamTrackGenerator({ kind: t }))
                : alert('Your browser does not support the experimental MediaStreamTrack API for Insertable Streams of Media')
              : (this.output = new DataStreamTrackGenerator({ kind: t })),
              (this.sink = this.output.writable),
              this.thread ? this.worker.postMessage({ cmd: 'sink', data: this.sink }, [this.sink]) : x(this.sink, this.bound);
          };
          add = t => {
            let e;
            if (t instanceof TransformStream) e = t;
            else {
              let n;
              (n = t instanceof Function ? { transform: async (e, n) => n.enqueue(t(e)) } : { transform: async (e, n) => n.enqueue(t.function(e)) }), (e = new TransformStream(n));
            }
            this.pipeline.push(e), this.thread ? (this.pipeline.push(e), this.worker.postMessage({ cmd: 'add', data: e }, [e])) : S(e, this.pipeline, this.bound);
          };
          subscribe = (t, e = [], n = !1) => {
            let r = this.pipeline.length,
              i = this.getTracks();
            0 === r || n
              ? i.forEach(n => {
                  if ('video' === n.kind || 'audio' === n.kind) {
                    console.warn('very loose implementation of audio / video streams');
                    let n = () => {
                      t(e), setTimeout(n, 1e3 / 60);
                    };
                    n();
                  } else n.subscribe(t);
                })
              : this.pipeline[r - 1].subscribe(t);
          };
        }
        (window.DataStreamTrackGenerator = f), (window.DataStreamTrackProcessor = m), (navigator.dataDevices = new y());
      })(),
      __webpack_exports__
    );
  })();
});
