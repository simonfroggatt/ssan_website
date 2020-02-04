/*
 * $Id: base64.js,v 2.12 2013/05/06 07:54:20 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *    http://opensource.org/licenses/mit-license
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */

(function(global) {
	'use strict';
	// existing version for noConflict()
	var _Base64 = global.Base64;
	var version = "2.1.4";
	// if node.js, we use Buffer
	var buffer;
	if (typeof module !== 'undefined' && module.exports) {
		buffer = require('buffer').Buffer;
	}
	// constants
	var b64chars
		= 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	var b64tab = function(bin) {
		var t = {};
		for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
		return t;
	}(b64chars);
	var fromCharCode = String.fromCharCode;
	// encoder stuff
	var cb_utob = function(c) {
		if (c.length < 2) {
			var cc = c.charCodeAt(0);
			return cc < 0x80 ? c
				: cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
								+ fromCharCode(0x80 | (cc & 0x3f)))
				: (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
				   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
				   + fromCharCode(0x80 | ( cc         & 0x3f)));
		} else {
			var cc = 0x10000
				+ (c.charCodeAt(0) - 0xD800) * 0x400
				+ (c.charCodeAt(1) - 0xDC00);
			return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
					+ fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
					+ fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
					+ fromCharCode(0x80 | ( cc         & 0x3f)));
		}
	};
	var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
	var utob = function(u) {
		return u.replace(re_utob, cb_utob);
	};
	var cb_encode = function(ccc) {
		var padlen = [0, 2, 1][ccc.length % 3],
		ord = ccc.charCodeAt(0) << 16
			| ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
			| ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
		chars = [
			b64chars.charAt( ord >>> 18),
			b64chars.charAt((ord >>> 12) & 63),
			padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
			padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
		];
		return chars.join('');
	};
	var btoa = global.btoa ? function(b) {
		return global.btoa(b);
	} : function(b) {
		return b.replace(/[\s\S]{1,3}/g, cb_encode);
	};
	var _encode = buffer
		? function (u) { return (new buffer(u)).toString('base64') } 
	: function (u) { return btoa(utob(u)) }
	;
	var encode = function(u, urisafe) {
		return !urisafe 
			? _encode(u)
			: _encode(u).replace(/[+\/]/g, function(m0) {
				return m0 == '+' ? '-' : '_';
			}).replace(/=/g, '');
	};
	var encodeURI = function(u) { return encode(u, true) };
	// decoder stuff
	var re_btou = new RegExp([
		'[\xC0-\xDF][\x80-\xBF]',
		'[\xE0-\xEF][\x80-\xBF]{2}',
		'[\xF0-\xF7][\x80-\xBF]{3}'
	].join('|'), 'g');
	var cb_btou = function(cccc) {
		switch(cccc.length) {
		case 4:
			var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
				|    ((0x3f & cccc.charCodeAt(1)) << 12)
				|    ((0x3f & cccc.charCodeAt(2)) <<  6)
				|     (0x3f & cccc.charCodeAt(3)),
			offset = cp - 0x10000;
			return (fromCharCode((offset  >>> 10) + 0xD800)
					+ fromCharCode((offset & 0x3FF) + 0xDC00));
		case 3:
			return fromCharCode(
				((0x0f & cccc.charCodeAt(0)) << 12)
					| ((0x3f & cccc.charCodeAt(1)) << 6)
					|  (0x3f & cccc.charCodeAt(2))
			);
		default:
			return  fromCharCode(
				((0x1f & cccc.charCodeAt(0)) << 6)
					|  (0x3f & cccc.charCodeAt(1))
			);
		}
	};
	var btou = function(b) {
		return b.replace(re_btou, cb_btou);
	};
	var cb_decode = function(cccc) {
		var len = cccc.length,
		padlen = len % 4,
		n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
			| (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
			| (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
			| (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
		chars = [
			fromCharCode( n >>> 16),
			fromCharCode((n >>>  8) & 0xff),
			fromCharCode( n         & 0xff)
		];
		chars.length -= [0, 0, 2, 1][padlen];
		return chars.join('');
	};
	var atob = global.atob ? function(a) {
		return global.atob(a);
	} : function(a){
		return a.replace(/[\s\S]{1,4}/g, cb_decode);
	};
	var _decode = buffer
		? function(a) { return (new buffer(a, 'base64')).toString() }
	: function(a) { return btou(atob(a)) };
	var decode = function(a){
		return _decode(
			a.replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
				.replace(/[^A-Za-z0-9\+\/]/g, '')
		);
	};
	var noConflict = function() {
		var Base64 = global.Base64;
		global.Base64 = _Base64;
		return Base64;
	};
	// export Base64
	global.Base64 = {
		VERSION: version,
		atob: atob,
		btoa: btoa,
		fromBase64: decode,
		toBase64: encode,
		utob: utob,
		encode: encode,
		encodeURI: encodeURI,
		btou: btou,
		decode: decode,
		noConflict: noConflict
	};
	// if ES5 is available, make Base64.extendString() available
	if (typeof Object.defineProperty === 'function') {
		var noEnum = function(v){
			return {value:v,enumerable:false,writable:true,configurable:true};
		};
		global.Base64.extendString = function () {
			Object.defineProperty(
				String.prototype, 'fromBase64', noEnum(function () {
					return decode(this)
				}));
			Object.defineProperty(
				String.prototype, 'toBase64', noEnum(function (urisafe) {
					return encode(this, urisafe)
				}));
			Object.defineProperty(
				String.prototype, 'toBase64URI', noEnum(function () {
					return encode(this, true)
				}));
		};
	}
	// that's it!
})(this);
// ----------------------------------------------------------------------------
// Buzz, a Javascript HTML5 Audio library
// Licensed under the MIT license.
// http://buzz.jaysalvat.com/
// ----------------------------------------------------------------------------
// Copyright (C) Jay Salvat
// http://jaysalvat.com/
// ----------------------------------------------------------------------------
/* jshint browser: true, node: true */
/* global define */

(function (context, factory) {
    "use strict";

    /*
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
    */
        context.buzz = factory();
    /*
    }
    */
})(this, function () {
    "use strict";

    var AudioContext = window.AudioContext || window.webkitAudioContext;

    var buzz = {
        defaults: {
            autoplay: false,
            duration: 5000,
            formats: [],
            loop: false,
            placeholder: '--',
            preload: 'metadata',
            volume: 80,
            webAudioApi: false,
            document: window.document // iframe support
        },
        types: {
            'mp3': 'audio/mpeg',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'aac': 'audio/aac',
            'm4a': 'audio/x-m4a'
        },
        sounds: [],
        el: document.createElement('audio'),

        getAudioContext: function() {
            if (this.audioCtx === undefined) {
                try {
                    this.audioCtx = AudioContext ? new AudioContext() : null;
                } catch (e) {
                    // There is a limit to how many contexts you can have, so fall back in case of errors constructing it
                    this.audioCtx = null;
                }
            }

            return this.audioCtx;
        },

        sound: function (src, options) {
            options = options || {};

            var doc = options.document || buzz.defaults.document;

            var pid = 0,
                events = [],
                eventsOnce = {},
                supported = buzz.isSupported();

            // publics
            this.load = function () {
                if (!supported) {
                    return this;
                }

                this.sound.load();

                return this;
            };

            this.play = function () {
                if (!supported) {
                    return this;
                }

                this.sound.play();

                return this;
            };

            this.togglePlay = function () {
                if (!supported) {
                    return this;
                }

                if (this.sound.paused) {
                    this.sound.play();
                } else {
                    this.sound.pause();
                }

                return this;
            };

            this.pause = function () {
                if (!supported) {
                    return this;
                }

                this.sound.pause();

                return this;
            };

            this.isPaused = function () {
                if (!supported) {
                    return null;
                }

                return this.sound.paused;
            };

            this.stop = function () {
                if (!supported ) {
                    return this;
                }

                this.setTime(0);
                this.sound.pause();

                return this;
            };

            this.isEnded = function () {
                if (!supported) {
                    return null;
                }

                return this.sound.ended;
            };

            this.loop = function () {
                if (!supported) {
                    return this;
                }

                this.sound.loop = 'loop';
                this.bind('ended.buzzloop', function () {
                    this.currentTime = 0;
                    this.play();
                });

                return this;
            };

            this.unloop = function () {
                if (!supported) {
                    return this;
                }

                this.sound.removeAttribute('loop');
                this.unbind('ended.buzzloop');

                return this;
            };

            this.mute = function () {
                if (!supported) {
                    return this;
                }

                this.sound.muted = true;

                return this;
            };

            this.unmute = function () {
                if (!supported) {
                    return this;
                }

                this.sound.muted = false;

                return this;
            };

            this.toggleMute = function () {
                if (!supported) {
                    return this;
                }

                this.sound.muted = !this.sound.muted;

                return this;
            };

            this.isMuted = function () {
                if (!supported) {
                    return null;
                }

                return this.sound.muted;
            };

            this.setVolume = function (volume) {
                if (!supported) {
                    return this;
                }

                if (volume < 0) {
                    volume = 0;
                }
                if (volume > 100) {
                    volume = 100;
                }

                this.volume = volume;
                this.sound.volume = volume / 100;

                return this;
            };

            this.getVolume = function () {
                if (!supported) {
                    return this;
                }

                return this.volume;
            };

            this.increaseVolume = function (value) {
                return this.setVolume(this.volume + (value || 1));
            };

            this.decreaseVolume = function (value) {
                return this.setVolume(this.volume - (value || 1));
            };

            this.setTime = function (time) {
                if (!supported) {
                    return this;
                }

                var set = true;
                this.whenReady(function () {
                    if (set === true) {
                        set = false;
                        this.sound.currentTime = time;
                    }
                });

                return this;
            };

            this.getTime = function () {
                if (!supported) {
                    return null;
                }

                var time = Math.round(this.sound.currentTime * 100) / 100;

                return isNaN(time) ? buzz.defaults.placeholder : time;
            };

            this.setPercent = function (percent) {
                if (!supported) {
                    return this;
                }

                return this.setTime(buzz.fromPercent(percent, this.sound.duration));
            };

            this.getPercent = function () {
                if (!supported) {
                    return null;
                }

                var percent = Math.round(buzz.toPercent(this.sound.currentTime, this.sound.duration));

                return isNaN(percent) ? buzz.defaults.placeholder : percent;
            };

            this.setSpeed = function (duration) {
                if (!supported) {
                    return this;
                }

                this.sound.playbackRate = duration;

                return this;
            };

            this.getSpeed = function () {
                if (!supported) {
                    return null;
                }

                return this.sound.playbackRate;
            };

            this.getDuration = function () {
                if (!supported) {
                    return null;
                }

                var duration = Math.round(this.sound.duration * 100) / 100;

                return isNaN(duration) ? buzz.defaults.placeholder : duration;
            };

            this.getPlayed = function () {
                if (!supported) {
                    return null;
                }

                return timerangeToArray(this.sound.played);
            };

            this.getBuffered = function () {
                if (!supported) {
                    return null;
                }

                return timerangeToArray(this.sound.buffered);
            };

            this.getSeekable = function () {
                if (!supported) {
                    return null;
                }

                return timerangeToArray(this.sound.seekable);
            };

            this.getErrorCode = function () {
                if (supported && this.sound.error) {
                    return this.sound.error.code;
                }

                return 0;
            };

            this.getErrorMessage = function () {
                if (!supported) {
                    return null;
                }

                switch(this.getErrorCode()) {
                    case 1:
                        return 'MEDIA_ERR_ABORTED';
                    case 2:
                        return 'MEDIA_ERR_NETWORK';
                    case 3:
                        return 'MEDIA_ERR_DECODE';
                    case 4:
                        return 'MEDIA_ERR_SRC_NOT_SUPPORTED';
                    default:
                        return null;
                }
            };

            this.getStateCode = function () {
                if (!supported) {
                    return null;
                }

                return this.sound.readyState;
            };

            this.getStateMessage = function () {
                if (!supported) {
                    return null;
                }

                switch(this.getStateCode()) {
                    case 0:
                        return 'HAVE_NOTHING';
                    case 1:
                        return 'HAVE_METADATA';
                    case 2:
                        return 'HAVE_CURRENT_DATA';
                    case 3:
                        return 'HAVE_FUTURE_DATA';
                    case 4:
                        return 'HAVE_ENOUGH_DATA';
                    default:
                        return null;
                }
            };

            this.getNetworkStateCode = function () {
                if (!supported) {
                    return null;
                }

                return this.sound.networkState;
            };

            this.getNetworkStateMessage = function () {
                if (!supported) {
                    return null;
                }

                switch(this.getNetworkStateCode()) {
                    case 0:
                        return 'NETWORK_EMPTY';
                    case 1:
                        return 'NETWORK_IDLE';
                    case 2:
                        return 'NETWORK_LOADING';
                    case 3:
                        return 'NETWORK_NO_SOURCE';
                    default:
                        return null;
                }
            };

            this.set = function (key, value) {
                if (!supported) {
                    return this;
                }

                this.sound[key] = value;

                return this;
            };

            this.get = function (key) {
                if (!supported) {
                  return null;
                }

                return key ? this.sound[key] : this.sound;
            };

            this.bind = function (types, func) {
                if (!supported) {
                    return this;
                }

                types = types.split(' ');

                var self = this,
                    efunc = function (e) { func.call(self, e); };

                for (var t = 0; t < types.length; t++) {
                    var type = types[t],
                        idx = type;
                        type = idx.split('.')[0];

                        events.push({ idx: idx, func: efunc });
                        this.sound.addEventListener(type, efunc, true);
                }

                return this;
            };

            this.unbind = function (types) {
                if (!supported) {
                    return this;
                }

                types = types.split(' ');

                for (var t = 0; t < types.length; t++) {
                    var idx = types[t],
                        type = idx.split('.')[0];

                    for (var i = 0; i < events.length; i++) {
                        var namespace = events[i].idx.split('.');
                        if (events[i].idx === idx || (namespace[1] && namespace[1] === idx.replace('.', ''))) {
                            this.sound.removeEventListener(type, events[i].func, true);
                            // remove event
                            events.splice(i, 1);
                        }
                    }
                }

                return this;
            };

            this.bindOnce = function (type, func) {
                if (!supported) {
                    return this;
                }

                var self = this;

                eventsOnce[pid++] = false;
                this.bind(type + '.' + pid, function () {
                   if (!eventsOnce[pid]) {
                       eventsOnce[pid] = true;
                       func.call(self);
                   }
                   self.unbind(type + '.' + pid);
                });

                return this;
            };

            this.trigger = function (types, detail) {
                if (!supported) {
                    return this;
                }

                types = types.split(' ');

                for (var t = 0; t < types.length; t++) {
                    var idx = types[t];

                    for (var i = 0; i < events.length; i++) {
                        var eventType = events[i].idx.split('.');

                        if (events[i].idx === idx || (eventType[0] && eventType[0] === idx.replace('.', ''))) {
                            var evt = doc.createEvent('HTMLEvents');

                            evt.initEvent(eventType[0], false, true);

                            evt.originalEvent = detail;

                            this.sound.dispatchEvent(evt);
                        }
                    }
                }

                return this;
            };

            this.fadeTo = function (to, duration, callback) {
                if (!supported) {
                    return this;
                }

                if (duration instanceof Function) {
                    callback = duration;
                    duration = buzz.defaults.duration;
                } else {
                    duration = duration || buzz.defaults.duration;
                }

                var from = this.volume,
                    delay = duration / Math.abs(from - to),
                    self = this;

                this.play();

                function doFade() {
                    setTimeout(function () {
                        if (from < to && self.volume < to) {
                            self.setVolume(self.volume += 1);
                            doFade();
                        } else if (from > to && self.volume > to) {
                            self.setVolume(self.volume -= 1);
                            doFade();
                        } else if (callback instanceof Function) {
                            callback.apply(self);
                        }
                    }, delay);
                }

                this.whenReady(function () {
                    doFade();
                });

                return this;
            };

            this.fadeIn = function (duration, callback) {
                if (!supported) {
                    return this;
                }

                return this.setVolume(0).fadeTo(100, duration, callback);
            };

            this.fadeOut = function (duration, callback) {
                if (!supported) {
                    return this;
                }

                return this.fadeTo(0, duration, callback);
            };

            this.fadeWith = function (sound, duration) {
                if (!supported) {
                    return this;
                }

                this.fadeOut(duration, function () {
                    this.stop();
                });

                sound.play().fadeIn(duration);

                return this;
            };

            this.whenReady = function (func) {
                if (!supported) {
                    return null;
                }

                var self = this;

                if (this.sound.readyState === 0) {
                    this.bind('canplay.buzzwhenready', function () {
                        func.call(self);
                    });
                } else {
                    func.call(self);
                }
            };

            this.addSource = function (src) {
                var self   = this,
                    source = doc.createElement('source');

                source.src = src;

                if (buzz.types[getExt(src)]) {
                    source.type = buzz.types[getExt(src)];
                }

                this.sound.appendChild(source);

                source.addEventListener('error', function (e) {
                    self.trigger('sourceerror', e);
                });

                return source;
            };

            // privates
            function timerangeToArray(timeRange) {
                var array = [],
                    length = timeRange.length - 1;

                for (var i = 0; i <= length; i++) {
                    array.push({
                        start: timeRange.start(i),
                        end: timeRange.end(i)
                    });
                }

                return array;
            }

            function getExt(filename) {
                return filename.split('.').pop();
            }

            // init
            if (supported && src) {

                for (var i in buzz.defaults) {
                    if (buzz.defaults.hasOwnProperty(i)) {
                        if (options[i] === undefined) {
                            options[i] = buzz.defaults[i];
                        }
                    }
                }

                this.sound = doc.createElement('audio');

                // Use web audio if possible to improve performance.
                if (options.webAudioApi) {
                    var audioCtx = buzz.getAudioContext();
                    if (audioCtx) {
                      this.source = audioCtx.createMediaElementSource(this.sound);
                      this.source.connect(audioCtx.destination);
                    }
                }

                if (src instanceof Array) {
                    for (var j in src) {
                        if (src.hasOwnProperty(j)) {
                            this.addSource(src[j]);
                        }
                    }
                } else if (options.formats.length) {
                    for (var k in options.formats) {
                        if (options.formats.hasOwnProperty(k)) {
                            this.addSource(src + '.' + options.formats[k]);
                        }
                    }
                } else {
                    this.addSource(src);
                }

                if (options.loop) {
                    this.loop();
                }

                if (options.autoplay) {
                    this.sound.autoplay = 'autoplay';
                }

                if (options.preload === true) {
                    this.sound.preload = 'auto';
                } else if (options.preload === false) {
                    this.sound.preload = 'none';
                } else {
                    this.sound.preload = options.preload;
                }

                this.setVolume(options.volume);

                buzz.sounds.push(this);
            }
        },

        group: function (sounds) {
            sounds = argsToArray(sounds, arguments);

            // publics
            this.getSounds = function () {
                return sounds;
            };

            this.add = function (soundArray) {
                soundArray = argsToArray(soundArray, arguments);

                for (var a = 0; a < soundArray.length; a++) {
                    sounds.push(soundArray[a]);
                }
            };

            this.remove = function (soundArray) {
                soundArray = argsToArray(soundArray, arguments);

                for (var a = 0; a < soundArray.length; a++) {
                    for (var i = 0; i < sounds.length; i++) {
                        if (sounds[i] === soundArray[a]) {
                            sounds.splice(i, 1);
                            break;
                        }
                    }
                }
            };

            this.load = function () {
                fn('load');

                return this;
            };

            this.play = function () {
                fn('play');

                return this;
            };

            this.togglePlay = function () {
                fn('togglePlay');

                return this;
            };

            this.pause = function (time) {
                fn('pause', time);

                return this;
            };

            this.stop = function () {
                fn('stop');

                return this;
            };

            this.mute = function () {
                fn('mute');

                return this;
            };

            this.unmute = function () {
                fn('unmute');

                return this;
            };

            this.toggleMute = function () {
                fn('toggleMute');

                return this;
            };

            this.setVolume = function (volume) {
                fn('setVolume', volume);

                return this;
            };

            this.increaseVolume = function (value) {
                fn('increaseVolume', value);

                return this;
            };

            this.decreaseVolume = function (value) {
                fn('decreaseVolume', value);

                return this;
            };

            this.loop = function () {
                fn('loop');

                return this;
            };

            this.unloop = function () {
                fn('unloop');

                return this;
            };

            this.setSpeed = function (speed) {
                fn('setSpeed', speed);

                return this;
            };

            this.setTime = function (time) {
                fn('setTime', time);

                return this;
            };

            this.set = function (key, value) {
                fn('set', key, value);

                return this;
            };

            this.bind = function (type, func) {
                fn('bind', type, func);

                return this;
            };

            this.unbind = function (type) {
                fn('unbind', type);

                return this;
            };

            this.bindOnce = function (type, func) {
                fn('bindOnce', type, func);

                return this;
            };

            this.trigger = function (type) {
                fn('trigger', type);

                return this;
            };

            this.fade = function (from, to, duration, callback) {
                fn('fade', from, to, duration, callback);

                return this;
            };

            this.fadeIn = function (duration, callback) {
                fn('fadeIn', duration, callback);

                return this;
            };

            this.fadeOut = function (duration, callback) {
                fn('fadeOut', duration, callback);

                return this;
            };

            // privates
            function fn() {
                var args = argsToArray(null, arguments),
                    func = args.shift();

                for (var i = 0; i < sounds.length; i++) {
                    sounds[i][func].apply(sounds[i], args);
                }
            }

            function argsToArray(array, args) {
                return (array instanceof Array) ? array : Array.prototype.slice.call(args);
            }
        },

        all: function () {
            return new buzz.group(buzz.sounds);
        },

        isSupported: function () {
            return !!buzz.el.canPlayType;
        },

        isOGGSupported: function () {
            return !!buzz.el.canPlayType && buzz.el.canPlayType('audio/ogg; codecs="vorbis"');
        },

        isWAVSupported: function () {
            return !!buzz.el.canPlayType && buzz.el.canPlayType('audio/wav; codecs="1"');
        },

        isMP3Supported: function () {
            return !!buzz.el.canPlayType && buzz.el.canPlayType('audio/mpeg;');
        },

        isAACSupported: function () {
            return !!buzz.el.canPlayType && (buzz.el.canPlayType('audio/x-m4a;') || buzz.el.canPlayType('audio/aac;'));
        },

        toTimer: function (time, withHours) {
            var h, m, s;

            h = Math.floor(time / 3600);
            h = isNaN(h) ? '--' : (h >= 10) ? h : '0' + h;
            m = withHours ? Math.floor(time / 60 % 60) : Math.floor(time / 60);
            m = isNaN(m) ? '--' : (m >= 10) ? m : '0' + m;
            s = Math.floor(time % 60);
            s = isNaN(s) ? '--' : (s >= 10) ? s : '0' + s;

            return withHours ? h + ':' + m + ':' + s : m + ':' + s;
        },

        fromTimer: function (time) {
            var splits = time.toString().split(':');

            if (splits && splits.length === 3) {
                time = (parseInt(splits[0], 10) * 3600) + (parseInt(splits[1], 10) * 60) + parseInt(splits[2], 10);
            }

            if (splits && splits.length === 2) {
                time = (parseInt(splits[0], 10) * 60) + parseInt(splits[1], 10);
            }

            return time;
        },

        toPercent: function (value, total, decimal) {
            var r = Math.pow(10, decimal || 0);

            return Math.round(((value * 100) / total) * r) / r;
        },

        fromPercent: function (percent, total, decimal) {
            var r = Math.pow(10, decimal || 0);

            return  Math.round(((total / 100) * percent) * r) / r;
        }
    };

    return buzz;
});

/*!
* Clamp.js 0.5.1
*
* Copyright 2011-2013, Joseph Schmitt http://joe.sh
* Released under the WTFPL license
* http://sam.zoy.org/wtfpl/
*/

(function(){
    /**
     * Clamps a text node.
     * @param {HTMLElement} element. Element containing the text node to clamp.
     * @param {Object} options. Options to pass to the clamper.
     */
    function clamp(element, options) {
        options = options || {};

        var self = this,
            win = window,
            opt = {
                clamp:              options.clamp || 2,
                useNativeClamp:     typeof(options.useNativeClamp) != 'undefined' ? options.useNativeClamp : true,
                splitOnChars:       options.splitOnChars || ['.', '-', '–', '—', ' '],
                animate:            options.animate || false,
                truncationChar:     options.truncationChar || '…',
                truncationHTML:     options.truncationHTML
            },

            sty = element.style,
            originalText = element.innerHTML,

            supportsNativeClamp = typeof(element.style.webkitLineClamp) != 'undefined',
            clampValue = opt.clamp,
            isCSSValue = clampValue.indexOf && (clampValue.indexOf('px') > -1 || clampValue.indexOf('em') > -1),
            truncationHTMLContainer;

        if (opt.truncationHTML) {
            truncationHTMLContainer = document.createElement('span');
            truncationHTMLContainer.innerHTML = opt.truncationHTML;
        }

        /**
         * Return the current style for an element.
         * @param {HTMLElement} elem The element to compute.
         * @param {string} prop The style property.
         * @returns {number}
         */
        function computeStyle(elem, prop) {
            if (!win.getComputedStyle) {
                win.getComputedStyle = function(el, pseudo) {
                    this.el = el;
                    this.getPropertyValue = function(prop) {
                        var re = /(\-([a-z]){1})/g;
                        if (prop == 'float') prop = 'styleFloat';
                        if (re.test(prop)) {
                            prop = prop.replace(re, function () {
                                return arguments[2].toUpperCase();
                            });
                        }
                        return el.currentStyle && el.currentStyle[prop] ? el.currentStyle[prop] : null;
                    }
                    return this;
                }
            }

            return win.getComputedStyle(elem, null).getPropertyValue(prop);
        }

        /**
         * Returns the maximum number of lines of text that should be rendered based
         * on the current height of the element and the line-height of the text.
         */
        function getMaxLines(height) {
            var availHeight = height || element.clientHeight,
                lineHeight = getLineHeight(element);

            return Math.max(Math.floor(availHeight/lineHeight), 0);
        }

        /**
         * Returns the maximum height a given element should have based on the line-
         * height of the text and the given clamp value.
         */
        function getMaxHeight(clmp) {
            var lineHeight = getLineHeight(element);
            return lineHeight * clmp;
        }

        /**
         * Returns the line-height of an element as an integer.
         */
        function getLineHeight(elem) {
            var lh = computeStyle(elem, 'line-height');
            if (lh == 'normal') {
                lh = parseInt(computeStyle(elem, 'font-size')) * 1.2;
            }
            return parseInt(lh);
        }

        var splitOnChars = opt.splitOnChars.slice(0),
            splitChar = splitOnChars[0],
            chunks,
            lastChunk;

        /**
         * Gets an element's last child. That may be another node or a node's contents.
         */
        function getLastChild(elem) {
            if (elem.lastChild.children && elem.lastChild.children.length > 0) {
                return getLastChild(Array.prototype.slice.call(elem.children).pop());
            }
            else if (!elem.lastChild || !elem.lastChild.nodeValue || elem.lastChild.nodeValue == '' || elem.lastChild.nodeValue == opt.truncationChar) {
                elem.lastChild.parentNode.removeChild(elem.lastChild);
                return getLastChild(element);
            }
            else {
                return elem.lastChild;
            }
        }

        /**
         * Removes one character at a time from the text until its width or
         * height is beneath the passed-in max param.
         */
        function truncate(target, maxHeight) {
            if (!maxHeight) {return;}

            /**
             * Resets global variables.
             */
            function reset() {
                splitOnChars = opt.splitOnChars.slice(0);
                splitChar = splitOnChars[0];
                chunks = null;
                lastChunk = null;
            }

            var nodeValue = target.nodeValue.replace(opt.truncationChar, '');

            if (!chunks) {
                if (splitOnChars.length > 0) {
                    splitChar = splitOnChars.shift();
                }
                else {
                    splitChar = '';
                }

                chunks = nodeValue.split(splitChar);
            }

            if (chunks.length > 1) {
                lastChunk = chunks.pop();
                applyEllipsis(target, chunks.join(splitChar));
            }
            else {
                chunks = null;
            }

            if (truncationHTMLContainer) {
                target.nodeValue = target.nodeValue.replace(opt.truncationChar, '');
                element.innerHTML = target.nodeValue + ' ' + truncationHTMLContainer.innerHTML + opt.truncationChar;
            }

            if (chunks) {
                if (element.clientHeight <= maxHeight) {
                    if (splitOnChars.length >= 0 && splitChar != '') {
                        applyEllipsis(target, chunks.join(splitChar) + splitChar + lastChunk);
                        chunks = null;
                    }
                    else {
                        return element.innerHTML;
                    }
                }
            }

            else {
                if (splitChar == '') {
                    applyEllipsis(target, '');
                    target = getLastChild(element);

                    reset();
                }
            }

            if (opt.animate) {
                setTimeout(function() {
                    truncate(target, maxHeight);
                }, opt.animate === true ? 10 : opt.animate);
            }
            else {
                return truncate(target, maxHeight);
            }
        }

        function applyEllipsis(elem, str) {
            elem.nodeValue = str + opt.truncationChar;
        }

        if (clampValue == 'auto') {
            clampValue = getMaxLines();
        }
        else if (isCSSValue) {
            clampValue = getMaxLines(parseInt(clampValue));
        }

        var clampedText;
        if (supportsNativeClamp && opt.useNativeClamp) {
            sty.overflow = 'hidden';
            sty.textOverflow = 'ellipsis';
            sty.webkitBoxOrient = 'vertical';
            sty.display = '-webkit-box';
            sty.webkitLineClamp = clampValue;

            if (isCSSValue) {
                sty.height = opt.clamp + 'px';
            }
        }
        else {
            var height = getMaxHeight(clampValue);
            if (height <= element.clientHeight) {
                clampedText = truncate(getLastChild(element), height);
            }
        }

        return {
            'original': originalText,
            'clamped': clampedText
        }
    }

    window.$clamp = clamp;
})();

/*
 * bubbletip
 *
 *	Copyright (c) 2009-2010, UhLeeKa.
 *	Version: 1.0.6
 *	Licensed under the GNU Lesser General Public License:
 *		http://www.gnu.org/licenses/lgpl-3.0.html
 *	Author Website: 
 *		http://www.uhleeka.com
 *	Project Hosting on Google Code: 
 *		http://code.google.com/p/bubbletip/
 */

(function ($) {
	var bindIndex = 0;
	$.fn.extend({
		open: function () {
			$(this).trigger('open.bubbletip');
		},
		close: function () {
			$(this).trigger('close.bubbletip');
		},
		bubbletip: function (tip, options) {
			$(this).data('tip', $(tip).get(0).id);
			
			// check to see if the tip is a descendant of 
			// a table.bubbletip element and therefore
			// has already been instantiated as a bubbletip
			if ($('table.bubbletip #' + $(tip).get(0).id).length > 0) {
				return this;
			}
			var _this, _tip, _options, _calc, _timeoutAnimate, _timeoutRefresh, _isActive, _isHiding, _wrapper, _bindIndex;
			// hack for IE6,IE7
			var _windowWidth, _windowHeight;

			_this = $(this);
			_tip = $(tip);
			_bindIndex = bindIndex++;  // for window.resize namespace binding
			_options = {
				id: '',
				position: 'absolute', // absolute | fixed
				fixedHorizontal: 'right', // left | right
				fixedVertical: 'bottom', // top | bottom
				positionAt: 'element', // element | body | mouse
				positionAtElement: _this,
				offsetTop: 0,
				offsetLeft: 0,
				deltaPosition: 30,
				deltaDirection: 'up', // direction: up | down | left | right
				animationDuration: 250,
				animationEasing: 'swing', // linear | swing
				delayShow: 0,
				delayHide: 500,
				calculateOnShow: false
			};
			if (options) {
				_options = $.extend(_options, options);
			}
			// calculated values
			_calc = {
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				delta: 0,
				mouseTop: 0,
				mouseLeft: 0,
				tipHeight: 0
			};
			_timeoutAnimate = null;
			_timeoutRefresh = null;
			_isActive = false;
			_isHiding = false;

			// store the tip id for removeBubbletip
			if (!_this.data('bubbletip_tips')) {
				_this.data('bubbletip_tips', [[_tip.get(0).id, _bindIndex]]);
			} else {
				_this.data('bubbletip_tips', $.merge(_this.data('bubbletip_tips'), [[_tip.get(0).id, _bindIndex]]));
			}


			// validate _options
			if (!_options.fixedVertical.match(/^top|bottom$/i)) {
				_options.positionAt = 'top';
			}
			if (!_options.fixedHorizontal.match(/^left|right$/i)) {
				_options.positionAt = 'left';
			}
			if (!_options.positionAt.match(/^element|body|mouse$/i)) {
				_options.positionAt = 'element';
			}
			if (!_options.deltaDirection.match(/^up|down|left|right$/i)) {
				_options.deltaDirection = 'up';
			}
			if (_options.id.length > 0) {
				_options.id = ' id="' + _options.id + '"';
			}

			// create the wrapper table element
			if (_options.deltaDirection.match(/^up$/i)) {
				_wrapper = $('<table' + _options.id + ' class="bubbletip" cellspacing="0" cellpadding="0"><tbody><tr><td class="bt-topleft"></td><td class="bt-top"></td><td class="bt-topright"></td></tr><tr><td class="bt-left"></td><td class="bt-content"></td><td class="bt-right"></td></tr><tr><td class="bt-bottomleft"></td><td><table class="bt-bottom" cellspacing="0" cellpadding="0"><tr><th></th><td><div></div></td><th></th></tr></table></td><td class="bt-bottomright"></td></tr></tbody></table>');
			} else if (_options.deltaDirection.match(/^down$/i)) {
				_wrapper = $('<table' + _options.id + ' class="bubbletip" cellspacing="0" cellpadding="0"><tbody><tr><td class="bt-topleft"></td><td><table class="bt-top" cellspacing="0" cellpadding="0"><tr><th></th><td><div></div></td><th></th></tr></table></td><td class="bt-topright"></td></tr><tr><td class="bt-left"></td><td class="bt-content"></td><td class="bt-right"></td></tr><tr><td class="bt-bottomleft"></td><td class="bt-bottom"></td><td class="bt-bottomright"></td></tr></tbody></table>');
			} else if (_options.deltaDirection.match(/^left$/i)) {
				_wrapper = $('<table' + _options.id + ' class="bubbletip" cellspacing="0" cellpadding="0"><tbody><tr><td class="bt-topleft"></td><td class="bt-top"></td><td class="bt-topright"></td></tr><tr><td class="bt-left"></td><td class="bt-content"></td><td class="bt-right-tail"><div class="bt-right"></div><div class="bt-right-tail"></div><div class="bt-right"></div></td></tr><tr><td class="bt-bottomleft"></td><td class="bt-bottom"></td><td class="bt-bottomright"></td></tr></tbody></table>');
			} else if (_options.deltaDirection.match(/^right$/i)) {
				_wrapper = $('<table' + _options.id + ' class="bubbletip" cellspacing="0" cellpadding="0"><tbody><tr><td class="bt-topleft"></td><td class="bt-top"></td><td class="bt-topright"></td></tr><tr><td class="bt-left-tail"><div class="bt-left"></div><div class="bt-left-tail"></div><div class="bt-left"></div></td><td class="bt-content"></td><td class="bt-right"></td></tr><tr><td class="bt-bottomleft"></td><td class="bt-bottom"></td><td class="bt-bottomright"></td></tr></tbody></table>');
			}

			// append the wrapper to the document body
			_wrapper.appendTo('body');

			// apply IE filters to _wrapper elements
			if ((/msie/.test(navigator.userAgent.toLowerCase())) && (!/opera/.test(navigator.userAgent.toLowerCase()))) {
				$('*', _wrapper).each(function () {
					var image = $(this).css('background-image');
					if (image.match(/^url\(["']?(.*\.png)["']?\)$/i)) {
						image = RegExp.$1;
						$(this).css({
							'backgroundImage': 'none',
							'filter': 'progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=' + ($(this).css('backgroundRepeat') == 'no-repeat' ? 'crop' : 'scale') + ', src=\'' + image + '\')'
						}).each(function () {
							var position = $(this).css('position');
							if (position != 'absolute' && position != 'relative')
								$(this).css('position', 'relative');
						});
					}
				});
			}
			// move the tip element into the content section of the wrapper
			$('.bt-content', _wrapper).append(_tip);
			// show the tip (in case it is hidden) so that we can calculate its dimensions
			_tip.show();
			// handle left|right delta
			if (_options.deltaDirection.match(/^left|right$/i)) {
				// tail is 40px, so divide height by two and subtract 20px;
				_calc.tipHeight = parseInt(_tip.height() / 2, 10);
				// handle odd integer height
				if ((_tip.height() % 2) == 1) {
					_calc.tipHeight++;
				}
				_calc.tipHeight = (_calc.tipHeight < 20) ? 1 : _calc.tipHeight - 20;
				if (_options.deltaDirection.match(/^left$/i)) {
					$('div.bt-right', _wrapper).css('height', _calc.tipHeight + 'px');
				} else {
					$('div.bt-left', _wrapper).css('height', _calc.tipHeight + 'px');
				}
			}
			// set the opacity of the wrapper to 0
			_wrapper.css('opacity', 0);
			// hack for FF 3.6
			_wrapper.css({ 'width': _wrapper.width(), 'height': _wrapper.height() });
			// execute initial calculations
			_Calculate();
			_wrapper.hide();

			// handle window.resize
			$(window).bind('resize.bubbletip' + _bindIndex, function () {
				var w = $(window).width();
				var h = $(window).height();

				if (_options.position.match(/^fixed$/i) || ((w === _windowWidth) && (h === _windowHeight))) {
					return;
				}
				_windowWidth = w;
				_windowHeight = h;

				if (_timeoutRefresh) {
					clearTimeout(_timeoutRefresh);
				}
				_timeoutRefresh = setTimeout(function () {
					_Calculate();
				}, 250);
			});
			$([_wrapper.get(0), this.get(0)]).bind('open.bubbletip', function () {
				_isActive = false;
				if (_timeoutAnimate) {
					clearTimeout(_timeoutAnimate);
				}
				if (_options.delayShow === 0) {
					_Show();
				} else {
					_timeoutAnimate = setTimeout(function () {
						_Show();
					}, _options.delayShow);
				}
				return false;
			});
			
			$([_wrapper.get(0), this.get(0)]).bind('close.bubbletip', function () {
				if (_timeoutAnimate) {
					clearTimeout(_timeoutAnimate);
				}
				if (_options.delayHide === 0) {
					_Hide();
				} else {
					_timeoutAnimate = setTimeout(function () {
						_Hide();
					}, _options.delayHide);
				}
				return false;
			});
			
			
			function _Show() {
				var animation;

				if (_isActive) { // the tip is currently showing; do nothing
					return;
				}
				_isActive = true;
				if (_isHiding) { // the tip is currently hiding; interrupt and start showing again
					_wrapper.stop(true, false);
				}

				if (_options.calculateOnShow) {
					_Calculate();
				}
				if (_options.position.match(/^fixed$/i)) {
					animation = {};
					if (_options.deltaDirection.match(/^up|down$/i)) {
						if (_options.fixedVertical.match(/^top$/i)) {
							if (!_isHiding) {
								_wrapper.css('top', parseInt(_calc.top - _calc.delta, 10) + 'px');
							}
							animation.top = parseInt(_calc.top, 10) + 'px';
						} else {
							if (!_isHiding) {
								_wrapper.css('bottom', parseInt(_calc.bottom + _calc.delta, 10) + 'px');
							}
							animation.bottom = parseInt(_calc.bottom, 10) + 'px';
						}
					} else {
						if (_options.fixedHorizontal.match(/^right$/i)) {
							if (!_isHiding) {
								if (_options.fixedVertical.match(/^top$/i)) {
									_wrapper.css({ 'top': parseInt(_calc.top, 10) + 'px', 'right': parseInt(_calc.right - _calc.delta, 10) + 'px' });
								} else {
									_wrapper.css({ 'bottom': parseInt(_calc.bottom, 10) + 'px', 'right': parseInt(_calc.right - _calc.delta, 10) + 'px' });
								}
							}
							animation.right = parseInt(_calc.right, 10) + 'px';
						} else {
							if (!_isHiding) {
								if (_options.fixedVertical.match(/^top$/i)) {
									_wrapper.css({ 'top': parseInt(_calc.top, 10) + 'px', 'left': parseInt(_calc.left + _calc.delta, 10) + 'px' });
								} else {
									_wrapper.css({ 'bottom': parseInt(_calc.bottom, 10) + 'px', 'left': parseInt(_calc.left + _calc.delta, 10) + 'px' });
								}
							}
							animation.left = parseInt(_calc.left, 10) + 'px';
						}
					}
				} else {
					if (_options.positionAt.match(/^element|body$/i)) {
						if (_options.deltaDirection.match(/^up|down$/i)) {
							if (!_isHiding) {
								_wrapper.css('top', parseInt(_calc.top - _calc.delta, 10) + 'px');
							}
							animation = { 'top': _calc.top + 'px' };
						} else {
							if (!_isHiding) {
								_wrapper.css('left', parseInt(_calc.left - _calc.delta, 10) + 'px');
							}
							animation = { 'left': _calc.left + 'px' };
						}
					} else {
						if (_options.deltaDirection.match(/^up|down$/i)) {
							if (!_isHiding) {
								_calc.mouseTop = e.pageY + _calc.top;
								_wrapper.css({ 'top': parseInt(_calc.mouseTop + _calc.delta, 10) + 'px', 'left': parseInt(e.pageX - (_wrapper.width() / 2), 10) + 'px' });
							}
							animation = { 'top': _calc.mouseTop + 'px' };
						} else {
							if (!_isHiding) {
								_calc.mouseLeft = e.pageX + _calc.left;
								_wrapper.css({ 'left': parseInt(_calc.mouseLeft + _calc.delta, 10) + 'px', 'top': parseInt(e.pageY - (_wrapper.height() / 2), 10) + 'px' });
							}
							animation = { 'left': _calc.left + 'px' };
						}
					}
				}
				_isHiding = false;
				_wrapper.show();
				animation = $.extend(animation, { 'opacity': 1 });
				_wrapper.animate(animation, _options.animationDuration, _options.animationEasing, function () {
					if (_options.position.match(/^fixed$/i)) {
						_wrapper.css({
							'opacity': '',
							'position': 'fixed',
							'top': _calc.top,
							'left': _calc.left
						});
					} else {
						_wrapper.css('opacity', '');
					}
					_isActive = true;
				});
			}
			function _Hide() {
				var animation;

				_isActive = false;
				_isHiding = true;
				if (_options.position.match(/^fixed$/i)) {
					animation = {};
					if (_options.deltaDirection.match(/^up|down$/i))  {
						if (_calc.bottom !== '') { animation.bottom = parseInt(_calc.bottom + _calc.delta, 10) + 'px'; }
						if (_calc.top !== '') { animation.top = parseInt(_calc.top - _calc.delta, 10) + 'px'; }
					} else {
						if (_options.fixedHorizontal.match(/^left$/i)) {
							if (_calc.right !== '') { animation.right = parseInt(_calc.right + _calc.delta, 10) + 'px'; }
							if (_calc.left !== '') { animation.left = parseInt(_calc.left + _calc.delta, 10) + 'px'; }
						} else {
							if (_calc.right !== '') { animation.right = parseInt(_calc.right - _calc.delta, 10) + 'px'; }
							if (_calc.left !== '') { animation.left = parseInt(_calc.left - _calc.delta, 10) + 'px'; }
						}
					}
				} else {
					if (_options.positionAt.match(/^element|body$/i)) {
						if (_options.deltaDirection.match(/^up|down$/i)) {
							animation = { 'top': parseInt(_calc.top - _calc.delta, 10) + 'px' };
						} else {
							animation = { 'left': parseInt(_calc.left - _calc.delta, 10) + 'px' };
						}
					} else {
						if (_options.deltaDirection.match(/^up|down$/i)) {
							animation = { 'top': parseInt(_calc.mouseTop - _calc.delta, 10) + 'px' };
						} else {
							animation = { 'left': parseInt(_calc.mouseLeft - _calc.delta, 10) + 'px' };
						}
					}
				}
				animation = $.extend(animation, {
					'opacity': 0
				});
				_wrapper.animate(animation, _options.animationDuration, _options.animationEasing, function () {
					_wrapper.hide();
					_isHiding = false;
				});
			}
			function _Calculate() {
				var offset;
				// calculate values
				if (_options.position.match(/^fixed$/i)) {
					offset = _options.positionAtElement.offset();
					if (_options.fixedHorizontal.match(/^left$/i)) {
						_calc.left = offset.left + (_options.positionAtElement.outerWidth() / 2);
					} else {
						_calc.left = '';
					}
					if (_options.fixedHorizontal.match(/^right$/i)) {
						_calc.right = ($(window).width() - offset.left) - ((_options.positionAtElement.outerWidth() + _wrapper.outerWidth()) / 2);
					} else {
						_calc.right = '';
					}
					if (_options.fixedVertical.match(/^top$/i)) {
						_calc.top = offset.top - $(window).scrollTop() - _wrapper.outerHeight();
					} else {
						_calc.top = '';
					}
					if (_options.fixedVertical.match(/^bottom$/i)) {
						_calc.bottom = $(window).scrollTop() + $(window).height() - offset.top + _options.offsetTop;
					} else {
						_calc.bottom = '';
					}
					if (_options.deltaDirection.match(/^left|right$/i)) {
						if (_options.fixedVertical.match(/^top$/i)) {
							_calc.top = _calc.top + (_wrapper.outerHeight() / 2) + (_options.positionAtElement.outerHeight() / 2);
						} else {
							_calc.bottom = _calc.bottom - (_wrapper.outerHeight() / 2) - (_options.positionAtElement.outerHeight() / 2);
						}
					}
					if (_options.deltaDirection.match(/^left$/i)) {
						if (_options.fixedHorizontal.match(/^left$/i)) {
							_calc.left = _calc.left - _wrapper.outerWidth();
						} else {
							_calc.right = _calc.right + (_wrapper.outerWidth() / 2);
						}
					} else if (_options.deltaDirection.match(/^right$/i)) {
						if (_options.fixedHorizontal.match(/^left$/i)) {
							_calc.left = _calc.left;
						} else {
							_calc.right = _calc.right - (_wrapper.outerWidth() / 2);
						}
					} else if (_options.deltaDirection.match(/^down$/i)) {
						if (_options.fixedVertical.match(/^top$/i)) {
							_calc.top = _calc.top + _wrapper.outerHeight() + _options.positionAtElement.outerHeight();
						} else {
							_calc.bottom = _calc.bottom - _wrapper.outerHeight() - _options.positionAtElement.outerHeight();
						}
						if (_options.fixedHorizontal.match(/^left$/i)) {
							_calc.left = _calc.left - (_wrapper.outerWidth() / 2);
						}
					} else {
						if (_options.fixedHorizontal.match(/^left$/i)) {
							_calc.left = _calc.left - (_wrapper.outerWidth() / 2);
						}
					}
					if (_options.deltaDirection.match(/^up|right$/i) && _options.fixedHorizontal.match(/^left|right$/i)) {
						_calc.delta = _options.deltaPosition;
					} else {
						_calc.delta = -_options.deltaPosition;
					}
				} else if (_options.positionAt.match(/^element$/i)) {
					offset = _options.positionAtElement.offset();
					if (_options.deltaDirection.match(/^up$/i)) {
						_calc.top = offset.top + _options.offsetTop - _wrapper.outerHeight();
						_calc.left = offset.left + _options.offsetLeft + ((_options.positionAtElement.outerWidth() - _wrapper.outerWidth()) / 2);
						_calc.delta = _options.deltaPosition;
					} else if (_options.deltaDirection.match(/^down$/i)) {
						_calc.top = offset.top + _options.positionAtElement.outerHeight() + _options.offsetTop;
						_calc.left = offset.left + _options.offsetLeft + ((_options.positionAtElement.outerWidth() - _wrapper.outerWidth()) / 2);
						_calc.delta = -_options.deltaPosition;
					} else if (_options.deltaDirection.match(/^left$/i)) {
						_calc.top = offset.top + _options.offsetTop + ((_options.positionAtElement.outerHeight() - _wrapper.outerHeight()) / 2);
						_calc.left = offset.left + _options.offsetLeft - _wrapper.outerWidth();
						_calc.delta = _options.deltaPosition;
					} else if (_options.deltaDirection.match(/^right$/i)) {
						_calc.top = offset.top + _options.offsetTop + ((_options.positionAtElement.outerHeight() - _wrapper.outerHeight()) / 2);
						_calc.left = offset.left + _options.positionAtElement.outerWidth() + _options.offsetLeft;
						_calc.delta = -_options.deltaPosition;
					}
				} else if (_options.positionAt.match(/^body$/i)) {
					if (_options.deltaDirection.match(/^up|left$/i)) {
						_calc.top = _options.offsetTop;
						_calc.left = _options.offsetLeft;
						// up or left
						_calc.delta = _options.deltaPosition;
					} else {
						if (_options.deltaDirection.match(/^down$/i)) {
							_calc.top = parseInt(_options.offsetTop + _wrapper.outerHeight(), 10);
							_calc.left = _options.offsetLeft;
						} else {
							_calc.top = _options.offsetTop;
							_calc.left = parseInt(_options.offsetLeft + _wrapper.outerWidth(), 10);
						}
						// down or right
						_calc.delta = -_options.deltaPosition;
					}
				} else if (_options.positionAt.match(/^mouse$/i)) {
					if (_options.deltaDirection.match(/^up|left$/i)) {
						if (_options.deltaDirection.match(/^up$/i)) {
							_calc.top = -(_options.offsetTop + _wrapper.outerHeight());
							_calc.left = _options.offsetLeft;
						} else if (_options.deltaDirection.match(/^left$/i)) {
							_calc.top = _options.offsetTop;
							_calc.left = -(_options.offsetLeft + _wrapper.outerWidth());
						}
						// up or left
						_calc.delta = _options.deltaPosition;
					} else {
						_calc.top = _options.offsetTop;
						_calc.left = _options.offsetLeft;
						// down or right
						_calc.delta = -_options.deltaPosition;
					}
				}

				// handle the wrapper (element|body) positioning
				if (_options.position.match(/^fixed$/i)) {
					if (_options.positionAt.match(/^element|body$/i)) {
						_wrapper.css({
							'position': 'fixed',
							'left': _calc.left,
							'top': _calc.top,
							'right': _calc.right + 'px',
							'bottom': _calc.bottom + 'px'
						});
					}
				} else {
					if (_options.positionAt.match(/^element|body$/i)) {
						_wrapper.css({
							'position': 'absolute',
							'top': _calc.top + 'px',
							'left': _calc.left + 'px'
						});
					}
				}
			}
			return this;
		},
		removeBubbletip: function (tips) {
			var tipsActive;
			var tipsToRemove = [];
			var tipsActiveAdjusted = [];
			var arr, i, ix;
			var elem;

			tipsActive = $.makeArray($(this).data('bubbletip_tips'));

			// convert the parameter array of tip id's or elements to id's
			arr = $.makeArray(tips);
			for (i = 0; i < arr.length; i++) {
				tipsToRemove.push($(arr[i]).get(0).id);
			}

			for (i = 0; i < tipsActive.length; i++) {
				ix = null;
				if ((tipsToRemove.length === 0) || ((ix = $.inArray(tipsActive[i][0], tipsToRemove)) >= 0)) {
					// remove all tips if there are none specified
					// otherwise, remove only specified tips

					// find the surrounding table.bubbletip
					elem = $('#' + tipsActive[i][0]).get(0).parentNode;
					while (elem.tagName.toLowerCase() != 'table') {
						elem = elem.parentNode;
					}
					// attach the tip element to body and hide
					$('#' + tipsActive[i][0]).appendTo('body').hide();
					// remove the surrounding table.bubbletip
					$(elem).remove();

					// unbind show/hide events
					$(this).unbind('.bubbletip' + tipsActive[i][1]);

					// unbind window.resize event
					$(window).unbind('.bubbletip' + tipsActive[i][1]);
				} else {
					// tip is not being removed, so add it to the adjusted array
					tipsActiveAdjusted.push(tipsActive[i]);
				}
			}
			$(this).data('bubbletip_tips', tipsActiveAdjusted);

			return this;
		}
	});
})(jQuery);
/*!
 * JavaScript Cookie v2.1.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
(function (factory) {
	// Fix: Disable require.js
	var define = undefined;

	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		var _OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = _OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires && '; expires=' + attributes.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
					attributes.path    && '; path=' + attributes.path,
					attributes.domain  && '; domain=' + attributes.domain,
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var name = parts[0].replace(rdecode, decodeURIComponent);
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.get = api.set = api;
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));

/*!
 * fancyBox - jQuery Plugin
 * version: 2.1.5 (Fri, 14 Jun 2013)
 * @requires jQuery v1.6 or later
 *
 * Examples at http://fancyapps.com/fancybox/
 * License: www.fancyapps.com/fancybox/#license
 *
 * Copyright 2012 Janis Skarnelis - janis@fancyapps.com
 *
 */

(function (window, document, $, undefined) {
	"use strict";

	var H = $("html"),
		W = $(window),
		D = $(document),
		F = $.fancybox = function () {
			F.open.apply( this, arguments );
		},
		IE =  navigator.userAgent.match(/msie/i),
		didUpdate	= null,
		isTouch		= document.createTouch !== undefined,

		isQuery	= function(obj) {
			return obj && obj.hasOwnProperty && obj instanceof $;
		},
		isString = function(str) {
			return str && $.type(str) === "string";
		},
		isPercentage = function(str) {
			return isString(str) && str.indexOf('%') > 0;
		},
		isScrollable = function(el) {
			return (el && !(el.style.overflow && el.style.overflow === 'hidden') && ((el.clientWidth && el.scrollWidth > el.clientWidth) || (el.clientHeight && el.scrollHeight > el.clientHeight)));
		},
		getScalar = function(orig, dim) {
			var value = parseInt(orig, 10) || 0;

			if (dim && isPercentage(orig)) {
				value = F.getViewport()[ dim ] / 100 * value;
			}

			return Math.ceil(value);
		},
		getValue = function(value, dim) {
			return getScalar(value, dim) + 'px';
		};

	$.extend(F, {
		// The current version of fancyBox
		version: '2.1.5',

		defaults: {
			padding : 15,
			margin  : 20,

			width     : 800,
			height    : 600,
			minWidth  : 100,
			minHeight : 100,
			maxWidth  : 9999,
			maxHeight : 9999,
			pixelRatio: 1, // Set to 2 for retina display support

			autoSize   : true,
			autoHeight : false,
			autoWidth  : false,

			autoResize  : true,
			autoCenter  : !isTouch,
			fitToView   : true,
			aspectRatio : false,
			topRatio    : 0.5,
			leftRatio   : 0.5,

			scrolling : 'auto', // 'auto', 'yes' or 'no'
			wrapCSS   : '',

			arrows     : true,
			closeBtn   : true,
			closeClick : false,
			nextClick  : false,
			mouseWheel : true,
			autoPlay   : false,
			playSpeed  : 3000,
			preload    : 3,
			modal      : false,
			loop       : true,

			ajax  : {
				dataType : 'html',
				headers  : { 'X-fancyBox': true }
			},
			iframe : {
				scrolling : 'auto',
				preload   : true
			},
			swf : {
				wmode: 'transparent',
				allowfullscreen   : 'true',
				allowscriptaccess : 'always'
			},

			keys  : {
				next : {
					13 : 'left', // enter
					34 : 'up',   // page down
					39 : 'left', // right arrow
					40 : 'up'    // down arrow
				},
				prev : {
					8  : 'right',  // backspace
					33 : 'down',   // page up
					37 : 'right',  // left arrow
					38 : 'down'    // up arrow
				},
				close  : [27], // escape key
				play   : [32], // space - start/stop slideshow
				toggle : [70]  // letter "f" - toggle fullscreen
			},

			direction : {
				next : 'left',
				prev : 'right'
			},

			scrollOutside  : true,

			// Override some properties
			index   : 0,
			type    : null,
			href    : null,
			content : null,
			title   : null,

			// HTML templates
			tpl: {
				wrap     : '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
				image    : '<img class="fancybox-image" src="{href}" alt="" />',
				iframe   : '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (IE ? ' allowtransparency="true"' : '') + '></iframe>',
				error    : '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
				closeBtn : '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
				next     : '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
				prev     : '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
			},

			// Properties for each animation type
			// Opening fancyBox
			openEffect  : 'fade', // 'elastic', 'fade' or 'none'
			openSpeed   : 250,
			openEasing  : 'swing',
			openOpacity : true,
			openMethod  : 'zoomIn',

			// Closing fancyBox
			closeEffect  : 'fade', // 'elastic', 'fade' or 'none'
			closeSpeed   : 250,
			closeEasing  : 'swing',
			closeOpacity : true,
			closeMethod  : 'zoomOut',

			// Changing next gallery item
			nextEffect : 'elastic', // 'elastic', 'fade' or 'none'
			nextSpeed  : 250,
			nextEasing : 'swing',
			nextMethod : 'changeIn',

			// Changing previous gallery item
			prevEffect : 'elastic', // 'elastic', 'fade' or 'none'
			prevSpeed  : 250,
			prevEasing : 'swing',
			prevMethod : 'changeOut',

			// Enable default helpers
			helpers : {
				overlay : true,
				title   : true
			},

			// Callbacks
			onCancel     : $.noop, // If canceling
			beforeLoad   : $.noop, // Before loading
			afterLoad    : $.noop, // After loading
			beforeShow   : $.noop, // Before changing in current item
			afterShow    : $.noop, // After opening
			beforeChange : $.noop, // Before changing gallery item
			beforeClose  : $.noop, // Before closing
			afterClose   : $.noop  // After closing
		},

		//Current state
		group    : {}, // Selected group
		opts     : {}, // Group options
		previous : null,  // Previous element
		coming   : null,  // Element being loaded
		current  : null,  // Currently loaded element
		isActive : false, // Is activated
		isOpen   : false, // Is currently open
		isOpened : false, // Have been fully opened at least once

		wrap  : null,
		skin  : null,
		outer : null,
		inner : null,

		player : {
			timer    : null,
			isActive : false
		},

		// Loaders
		ajaxLoad   : null,
		imgPreload : null,

		// Some collections
		transitions : {},
		helpers     : {},

		/*
		 *	Static methods
		 */

		open: function (group, opts) {
			if (!group) {
				return;
			}

			if (!$.isPlainObject(opts)) {
				opts = {};
			}

			// Close if already active
			if (false === F.close(true)) {
				return;
			}

			// Normalize group
			if (!$.isArray(group)) {
				group = isQuery(group) ? $(group).get() : [group];
			}

			// Recheck if the type of each element is `object` and set content type (image, ajax, etc)
			$.each(group, function(i, element) {
				var obj = {},
					href,
					title,
					content,
					type,
					rez,
					hrefParts,
					selector;

				if ($.type(element) === "object") {
					// Check if is DOM element
					if (element.nodeType) {
						element = $(element);
					}

					if (isQuery(element)) {
						obj = {
							href    : element.data('fancybox-href') || element.attr('href'),
							title   : element.data('fancybox-title') || element.attr('title'),
							isDom   : true,
							element : element
						};

						if ($.metadata) {
							$.extend(true, obj, element.metadata());
						}

					} else {
						obj = element;
					}
				}

				href  = opts.href  || obj.href || (isString(element) ? element : null);
				title = opts.title !== undefined ? opts.title : obj.title || '';

				content = opts.content || obj.content;
				type    = content ? 'html' : (opts.type  || obj.type);

				if (!type && obj.isDom) {
					type = element.data('fancybox-type');

					if (!type) {
						rez  = element.prop('class').match(/fancybox\.(\w+)/);
						type = rez ? rez[1] : null;
					}
				}

				if (isString(href)) {
					// Try to guess the content type
					if (!type) {
						if (F.isImage(href)) {
							type = 'image';

						} else if (F.isSWF(href)) {
							type = 'swf';

						} else if (href.charAt(0) === '#') {
							type = 'inline';

						} else if (isString(element)) {
							type    = 'html';
							content = element;
						}
					}

					// Split url into two pieces with source url and content selector, e.g,
					// "/mypage.html #my_id" will load "/mypage.html" and display element having id "my_id"
					if (type === 'ajax') {
						hrefParts = href.split(/\s+/, 2);
						href      = hrefParts.shift();
						selector  = hrefParts.shift();
					}
				}

				if (!content) {
					if (type === 'inline') {
						if (href) {
							content = $( isString(href) ? href.replace(/.*(?=#[^\s]+$)/, '') : href ); //strip for ie7

						} else if (obj.isDom) {
							content = element;
						}

					} else if (type === 'html') {
						content = href;

					} else if (!type && !href && obj.isDom) {
						type    = 'inline';
						content = element;
					}
				}

				$.extend(obj, {
					href     : href,
					type     : type,
					content  : content,
					title    : title,
					selector : selector
				});

				group[ i ] = obj;
			});

			// Extend the defaults
			F.opts = $.extend(true, {}, F.defaults, opts);

			// All options are merged recursive except keys
			if (opts.keys !== undefined) {
				F.opts.keys = opts.keys ? $.extend({}, F.defaults.keys, opts.keys) : false;
			}

			F.group = group;

			return F._start(F.opts.index);
		},

		// Cancel image loading or abort ajax request
		cancel: function () {
			var coming = F.coming;

			if (!coming || false === F.trigger('onCancel')) {
				return;
			}

			F.hideLoading();

			if (F.ajaxLoad) {
				F.ajaxLoad.abort();
			}

			F.ajaxLoad = null;

			if (F.imgPreload) {
				F.imgPreload.onload = F.imgPreload.onerror = null;
			}

			if (coming.wrap) {
				coming.wrap.stop(true, true).trigger('onReset').remove();
			}

			F.coming = null;

			// If the first item has been canceled, then clear everything
			if (!F.current) {
				F._afterZoomOut( coming );
			}
		},

		// Start closing animation if is open; remove immediately if opening/closing
		close: function (event) {
			F.cancel();

			if (false === F.trigger('beforeClose')) {
				return;
			}

			F.unbindEvents();

			if (!F.isActive) {
				return;
			}

			if (!F.isOpen || event === true) {
				$('.fancybox-wrap').stop(true).trigger('onReset').remove();

				F._afterZoomOut();

			} else {
				F.isOpen = F.isOpened = false;
				F.isClosing = true;

				$('.fancybox-item, .fancybox-nav').remove();

				F.wrap.stop(true, true).removeClass('fancybox-opened');

				F.transitions[ F.current.closeMethod ]();
			}
		},

		// Manage slideshow:
		//   $.fancybox.play(); - toggle slideshow
		//   $.fancybox.play( true ); - start
		//   $.fancybox.play( false ); - stop
		play: function ( action ) {
			var clear = function () {
					clearTimeout(F.player.timer);
				},
				set = function () {
					clear();

					if (F.current && F.player.isActive) {
						F.player.timer = setTimeout(F.next, F.current.playSpeed);
					}
				},
				stop = function () {
					clear();

					D.unbind('.player');

					F.player.isActive = false;

					F.trigger('onPlayEnd');
				},
				start = function () {
					if (F.current && (F.current.loop || F.current.index < F.group.length - 1)) {
						F.player.isActive = true;

						D.bind({
							'onCancel.player beforeClose.player' : stop,
							'onUpdate.player'   : set,
							'beforeLoad.player' : clear
						});

						set();

						F.trigger('onPlayStart');
					}
				};

			if (action === true || (!F.player.isActive && action !== false)) {
				start();
			} else {
				stop();
			}
		},

		// Navigate to next gallery item
		next: function ( direction ) {
			var current = F.current;

			if (current) {
				if (!isString(direction)) {
					direction = current.direction.next;
				}

				F.jumpto(current.index + 1, direction, 'next');
			}
		},

		// Navigate to previous gallery item
		prev: function ( direction ) {
			var current = F.current;

			if (current) {
				if (!isString(direction)) {
					direction = current.direction.prev;
				}

				F.jumpto(current.index - 1, direction, 'prev');
			}
		},

		// Navigate to gallery item by index
		jumpto: function ( index, direction, router ) {
			var current = F.current;

			if (!current) {
				return;
			}

			index = getScalar(index);

			F.direction = direction || current.direction[ (index >= current.index ? 'next' : 'prev') ];
			F.router    = router || 'jumpto';

			if (current.loop) {
				if (index < 0) {
					index = current.group.length + (index % current.group.length);
				}

				index = index % current.group.length;
			}

			if (current.group[ index ] !== undefined) {
				F.cancel();

				F._start(index);
			}
		},

		// Center inside viewport and toggle position type to fixed or absolute if needed
		reposition: function (e, onlyAbsolute) {
			var current = F.current,
				wrap    = current ? current.wrap : null,
				pos;

			if (wrap) {
				pos = F._getPosition(onlyAbsolute);

				if (e && e.type === 'scroll') {
					delete pos.position;

					wrap.stop(true, true).animate(pos, 200);

				} else {
					wrap.css(pos);

					current.pos = $.extend({}, current.dim, pos);
				}
			}
		},

		update: function (e) {
			var type = (e && e.type),
				anyway = !type || type === 'orientationchange';

			if (anyway) {
				clearTimeout(didUpdate);

				didUpdate = null;
			}

			if (!F.isOpen || didUpdate) {
				return;
			}

			didUpdate = setTimeout(function() {
				var current = F.current;

				if (!current || F.isClosing) {
					return;
				}

				F.wrap.removeClass('fancybox-tmp');

				if (anyway || type === 'load' || (type === 'resize' && current.autoResize)) {
					F._setDimension();
				}

				if (!(type === 'scroll' && current.canShrink)) {
					F.reposition(e);
				}

				F.trigger('onUpdate');

				didUpdate = null;

			}, (anyway && !isTouch ? 0 : 300));
		},

		// Shrink content to fit inside viewport or restore if resized
		toggle: function ( action ) {
			if (F.isOpen) {
				F.current.fitToView = $.type(action) === "boolean" ? action : !F.current.fitToView;

				// Help browser to restore document dimensions
				if (isTouch) {
					F.wrap.removeAttr('style').addClass('fancybox-tmp');

					F.trigger('onUpdate');
				}

				F.update();
			}
		},

		hideLoading: function () {
			D.unbind('.loading');

			$('#fancybox-loading').remove();
		},

		showLoading: function () {
			var el, viewport;

			F.hideLoading();

			el = $('<div id="fancybox-loading"><div></div></div>').click(F.cancel).appendTo('body');

			// If user will press the escape-button, the request will be canceled
			D.bind('keydown.loading', function(e) {
				if ((e.which || e.keyCode) === 27) {
					e.preventDefault();

					F.cancel();
				}
			});

			if (!F.defaults.fixed) {
				viewport = F.getViewport();

				el.css({
					position : 'absolute',
					top  : (viewport.h * 0.5) + viewport.y,
					left : (viewport.w * 0.5) + viewport.x
				});
			}
		},

		getViewport: function () {
			var locked = (F.current && F.current.locked) || false,
				rez    = {
					x: W.scrollLeft(),
					y: W.scrollTop()
				};

			if (locked) {
				rez.w = locked[0].clientWidth;
				rez.h = locked[0].clientHeight;

			} else {
				// See http://bugs.jquery.com/ticket/6724
				rez.w = isTouch && window.innerWidth  ? window.innerWidth  : W.width();
				rez.h = isTouch && window.innerHeight ? window.innerHeight : W.height();
			}

			return rez;
		},

		// Unbind the keyboard / clicking actions
		unbindEvents: function () {
			if (F.wrap && isQuery(F.wrap)) {
				F.wrap.unbind('.fb');
			}

			D.unbind('.fb');
			W.unbind('.fb');
		},

		bindEvents: function () {
			var current = F.current,
				keys;

			if (!current) {
				return;
			}

			// Changing document height on iOS devices triggers a 'resize' event,
			// that can change document height... repeating infinitely
			W.bind('orientationchange.fb' + (isTouch ? '' : ' resize.fb') + (current.autoCenter && !current.locked ? ' scroll.fb' : ''), F.update);

			keys = current.keys;

			if (keys) {
				D.bind('keydown.fb', function (e) {
					var code   = e.which || e.keyCode,
						target = e.target || e.srcElement;

					// Skip esc key if loading, because showLoading will cancel preloading
					if (code === 27 && F.coming) {
						return false;
					}

					// Ignore key combinations and key events within form elements
					if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && !(target && (target.type || $(target).is('[contenteditable]')))) {
						$.each(keys, function(i, val) {
							if (current.group.length > 1 && val[ code ] !== undefined) {
								F[ i ]( val[ code ] );

								e.preventDefault();
								return false;
							}

							if ($.inArray(code, val) > -1) {
								F[ i ] ();

								e.preventDefault();
								return false;
							}
						});
					}
				});
			}

			if ($.fn.mousewheel && current.mouseWheel) {
				F.wrap.bind('mousewheel.fb', function (e, delta, deltaX, deltaY) {
					var target = e.target || null,
						parent = $(target),
						canScroll = false;

					while (parent.length) {
						if (canScroll || parent.is('.fancybox-skin') || parent.is('.fancybox-wrap')) {
							break;
						}

						canScroll = isScrollable( parent[0] );
						parent    = $(parent).parent();
					}

					if (delta !== 0 && !canScroll) {
						if (F.group.length > 1 && !current.canShrink) {
							if (deltaY > 0 || deltaX > 0) {
								F.prev( deltaY > 0 ? 'down' : 'left' );

							} else if (deltaY < 0 || deltaX < 0) {
								F.next( deltaY < 0 ? 'up' : 'right' );
							}

							e.preventDefault();
						}
					}
				});
			}
		},

		trigger: function (event, o) {
			var ret, obj = o || F.coming || F.current;

			if (!obj) {
				return;
			}

			if ($.isFunction( obj[event] )) {
				ret = obj[event].apply(obj, Array.prototype.slice.call(arguments, 1));
			}

			if (ret === false) {
				return false;
			}

			if (obj.helpers) {
				$.each(obj.helpers, function (helper, opts) {
					if (opts && F.helpers[helper] && $.isFunction(F.helpers[helper][event])) {
						F.helpers[helper][event]($.extend(true, {}, F.helpers[helper].defaults, opts), obj);
					}
				});
			}

			D.trigger(event);
		},

		isImage: function (str) {
			return isString(str) && str.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i);
		},

		isSWF: function (str) {
			return isString(str) && str.match(/\.(swf)((\?|#).*)?$/i);
		},

		_start: function (index) {
			var coming = {},
				obj,
				href,
				type,
				margin,
				padding;

			index = getScalar( index );
			obj   = F.group[ index ] || null;

			if (!obj) {
				return false;
			}

			coming = $.extend(true, {}, F.opts, obj);

			// Convert margin and padding properties to array - top, right, bottom, left
			margin  = coming.margin;
			padding = coming.padding;

			if ($.type(margin) === 'number') {
				coming.margin = [margin, margin, margin, margin];
			}

			if ($.type(padding) === 'number') {
				coming.padding = [padding, padding, padding, padding];
			}

			// 'modal' propery is just a shortcut
			if (coming.modal) {
				$.extend(true, coming, {
					closeBtn   : false,
					closeClick : false,
					nextClick  : false,
					arrows     : false,
					mouseWheel : false,
					keys       : null,
					helpers: {
						overlay : {
							closeClick : false
						}
					}
				});
			}

			// 'autoSize' property is a shortcut, too
			if (coming.autoSize) {
				coming.autoWidth = coming.autoHeight = true;
			}

			if (coming.width === 'auto') {
				coming.autoWidth = true;
			}

			if (coming.height === 'auto') {
				coming.autoHeight = true;
			}

			/*
			 * Add reference to the group, so it`s possible to access from callbacks, example:
			 * afterLoad : function() {
			 *     this.title = 'Image ' + (this.index + 1) + ' of ' + this.group.length + (this.title ? ' - ' + this.title : '');
			 * }
			 */

			coming.group  = F.group;
			coming.index  = index;

			// Give a chance for callback or helpers to update coming item (type, title, etc)
			F.coming = coming;

			if (false === F.trigger('beforeLoad')) {
				F.coming = null;

				return;
			}

			type = coming.type;
			href = coming.href;

			if (!type) {
				F.coming = null;

				//If we can not determine content type then drop silently or display next/prev item if looping through gallery
				if (F.current && F.router && F.router !== 'jumpto') {
					F.current.index = index;

					return F[ F.router ]( F.direction );
				}

				return false;
			}

			F.isActive = true;

			if (type === 'image' || type === 'swf') {
				coming.autoHeight = coming.autoWidth = false;
				coming.scrolling  = 'visible';
			}

			if (type === 'image') {
				coming.aspectRatio = true;
			}

			if (type === 'iframe' && isTouch) {
				coming.scrolling = 'scroll';
			}

			// Build the neccessary markup
			coming.wrap = $(coming.tpl.wrap).addClass('fancybox-' + (isTouch ? 'mobile' : 'desktop') + ' fancybox-type-' + type + ' fancybox-tmp ' + coming.wrapCSS).appendTo( coming.parent || 'body' );

			$.extend(coming, {
				skin  : $('.fancybox-skin',  coming.wrap),
				outer : $('.fancybox-outer', coming.wrap),
				inner : $('.fancybox-inner', coming.wrap)
			});

			$.each(["Top", "Right", "Bottom", "Left"], function(i, v) {
				coming.skin.css('padding' + v, getValue(coming.padding[ i ]));
			});

			F.trigger('onReady');

			// Check before try to load; 'inline' and 'html' types need content, others - href
			if (type === 'inline' || type === 'html') {
				if (!coming.content || !coming.content.length) {
					return F._error( 'content' );
				}

			} else if (!href) {
				return F._error( 'href' );
			}

			if (type === 'image') {
				F._loadImage();

			} else if (type === 'ajax') {
				F._loadAjax();

			} else if (type === 'iframe') {
				F._loadIframe();

			} else {
				F._afterLoad();
			}
		},

		_error: function ( type ) {
			$.extend(F.coming, {
				type       : 'html',
				autoWidth  : true,
				autoHeight : true,
				minWidth   : 0,
				minHeight  : 0,
				scrolling  : 'no',
				hasError   : type,
				content    : F.coming.tpl.error
			});

			F._afterLoad();
		},

		_loadImage: function () {
			// Reset preload image so it is later possible to check "complete" property
			var img = F.imgPreload = new Image();

			img.onload = function () {
				this.onload = this.onerror = null;

				F.coming.width  = this.width / F.opts.pixelRatio;
				F.coming.height = this.height / F.opts.pixelRatio;

				F._afterLoad();
			};

			img.onerror = function () {
				this.onload = this.onerror = null;

				F._error( 'image' );
			};

			img.src = F.coming.href;

			if (img.complete !== true) {
				F.showLoading();
			}
		},

		_loadAjax: function () {
			var coming = F.coming;

			F.showLoading();

			F.ajaxLoad = $.ajax($.extend({}, coming.ajax, {
				url: coming.href,
				error: function (jqXHR, textStatus) {
					if (F.coming && textStatus !== 'abort') {
						F._error( 'ajax', jqXHR );

					} else {
						F.hideLoading();
					}
				},
				success: function (data, textStatus) {
					if (textStatus === 'success') {
						coming.content = data;

						F._afterLoad();
					}
				}
			}));
		},

		_loadIframe: function() {
			var coming = F.coming,
				iframe = $(coming.tpl.iframe.replace(/\{rnd\}/g, new Date().getTime()))
					.attr('scrolling', isTouch ? 'auto' : coming.iframe.scrolling)
					.attr('src', coming.href);

			// This helps IE
			$(coming.wrap).bind('onReset', function () {
				try {
					$(this).find('iframe').hide().attr('src', '//about:blank').end().empty();
				} catch (e) {}
			});

			if (coming.iframe.preload) {
				F.showLoading();

				iframe.one('load', function() {
					$(this).data('ready', 1);

					// iOS will lose scrolling if we resize
					if (!isTouch) {
						$(this).bind('load.fb', F.update);
					}

					// Without this trick:
					//   - iframe won't scroll on iOS devices
					//   - IE7 sometimes displays empty iframe
					$(this).parents('.fancybox-wrap').width('100%').removeClass('fancybox-tmp').show();

					F._afterLoad();
				});
			}

			coming.content = iframe.appendTo( coming.inner );

			if (!coming.iframe.preload) {
				F._afterLoad();
			}
		},

		_preloadImages: function() {
			var group   = F.group,
				current = F.current,
				len     = group.length,
				cnt     = current.preload ? Math.min(current.preload, len - 1) : 0,
				item,
				i;

			for (i = 1; i <= cnt; i += 1) {
				item = group[ (current.index + i ) % len ];

				if (item.type === 'image' && item.href) {
					new Image().src = item.href;
				}
			}
		},

		_afterLoad: function () {
			var coming   = F.coming,
				previous = F.current,
				placeholder = 'fancybox-placeholder',
				current,
				content,
				type,
				scrolling,
				href,
				embed;

			F.hideLoading();

			if (!coming || F.isActive === false) {
				return;
			}

			if (false === F.trigger('afterLoad', coming, previous)) {
				coming.wrap.stop(true).trigger('onReset').remove();

				F.coming = null;

				return;
			}

			if (previous) {
				F.trigger('beforeChange', previous);

				previous.wrap.stop(true).removeClass('fancybox-opened')
					.find('.fancybox-item, .fancybox-nav')
					.remove();
			}

			F.unbindEvents();

			current   = coming;
			content   = coming.content;
			type      = coming.type;
			scrolling = coming.scrolling;

			$.extend(F, {
				wrap  : current.wrap,
				skin  : current.skin,
				outer : current.outer,
				inner : current.inner,
				current  : current,
				previous : previous
			});

			href = current.href;

			switch (type) {
				case 'inline':
				case 'ajax':
				case 'html':
					if (current.selector) {
						content = $('<div>').html(content).find(current.selector);

					} else if (isQuery(content)) {
						if (!content.data(placeholder)) {
							content.data(placeholder, $('<div class="' + placeholder + '"></div>').insertAfter( content ).hide() );
						}

						content = content.show().detach();

						current.wrap.bind('onReset', function () {
							if ($(this).find(content).length) {
								content.hide().replaceAll( content.data(placeholder) ).data(placeholder, false);
							}
						});
					}
				break;

				case 'image':
					content = current.tpl.image.replace('{href}', href);
				break;

				case 'swf':
					content = '<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + href + '"></param>';
					embed   = '';

					$.each(current.swf, function(name, val) {
						content += '<param name="' + name + '" value="' + val + '"></param>';
						embed   += ' ' + name + '="' + val + '"';
					});

					content += '<embed src="' + href + '" type="application/x-shockwave-flash" width="100%" height="100%"' + embed + '></embed></object>';
				break;
			}

			if (!(isQuery(content) && content.parent().is(current.inner))) {
				current.inner.append( content );
			}

			// Give a chance for helpers or callbacks to update elements
			F.trigger('beforeShow');

			// Set scrolling before calculating dimensions
			current.inner.css('overflow', scrolling === 'yes' ? 'scroll' : (scrolling === 'no' ? 'hidden' : scrolling));

			// Set initial dimensions and start position
			F._setDimension();

			F.reposition();

			F.isOpen = false;
			F.coming = null;

			F.bindEvents();

			if (!F.isOpened) {
				$('.fancybox-wrap').not( current.wrap ).stop(true).trigger('onReset').remove();

			} else if (previous.prevMethod) {
				F.transitions[ previous.prevMethod ]();
			}

			F.transitions[ F.isOpened ? current.nextMethod : current.openMethod ]();

			F._preloadImages();
		},

		_setDimension: function () {
			var viewport   = F.getViewport(),
				steps      = 0,
				canShrink  = false,
				canExpand  = false,
				wrap       = F.wrap,
				skin       = F.skin,
				inner      = F.inner,
				current    = F.current,
				width      = current.width,
				height     = current.height,
				minWidth   = current.minWidth,
				minHeight  = current.minHeight,
				maxWidth   = current.maxWidth,
				maxHeight  = current.maxHeight,
				scrolling  = current.scrolling,
				scrollOut  = current.scrollOutside ? current.scrollbarWidth : 0,
				margin     = current.margin,
				wMargin    = getScalar(margin[1] + margin[3]),
				hMargin    = getScalar(margin[0] + margin[2]),
				wPadding,
				hPadding,
				wSpace,
				hSpace,
				origWidth,
				origHeight,
				origMaxWidth,
				origMaxHeight,
				ratio,
				width_,
				height_,
				maxWidth_,
				maxHeight_,
				iframe,
				body;

			// Reset dimensions so we could re-check actual size
			wrap.add(skin).add(inner).width('auto').height('auto').removeClass('fancybox-tmp');

			wPadding = getScalar(skin.outerWidth(true)  - skin.width());
			hPadding = getScalar(skin.outerHeight(true) - skin.height());

			// Any space between content and viewport (margin, padding, border, title)
			wSpace = wMargin + wPadding;
			hSpace = hMargin + hPadding;

			origWidth  = isPercentage(width)  ? (viewport.w - wSpace) * getScalar(width)  / 100 : width;
			origHeight = isPercentage(height) ? (viewport.h - hSpace) * getScalar(height) / 100 : height;

			if (current.type === 'iframe') {
				iframe = current.content;

				if (current.autoHeight && iframe.data('ready') === 1) {
					try {
						if (iframe[0].contentWindow.document.location) {
							inner.width( origWidth ).height(9999);

							body = iframe.contents().find('body');

							if (scrollOut) {
								body.css('overflow-x', 'hidden');
							}

							origHeight = body.outerHeight(true);
						}

					} catch (e) {}
				}

			} else if (current.autoWidth || current.autoHeight) {
				inner.addClass( 'fancybox-tmp' );

				// Set width or height in case we need to calculate only one dimension
				if (!current.autoWidth) {
					inner.width( origWidth );
				}

				if (!current.autoHeight) {
					inner.height( origHeight );
				}

				if (current.autoWidth) {
					origWidth = inner.width();
				}

				if (current.autoHeight) {
					origHeight = inner.height();
				}

				inner.removeClass( 'fancybox-tmp' );
			}

			width  = getScalar( origWidth );
			height = getScalar( origHeight );

			ratio  = origWidth / origHeight;

			// Calculations for the content
			minWidth  = getScalar(isPercentage(minWidth) ? getScalar(minWidth, 'w') - wSpace : minWidth);
			maxWidth  = getScalar(isPercentage(maxWidth) ? getScalar(maxWidth, 'w') - wSpace : maxWidth);

			minHeight = getScalar(isPercentage(minHeight) ? getScalar(minHeight, 'h') - hSpace : minHeight);
			maxHeight = getScalar(isPercentage(maxHeight) ? getScalar(maxHeight, 'h') - hSpace : maxHeight);

			// These will be used to determine if wrap can fit in the viewport
			origMaxWidth  = maxWidth;
			origMaxHeight = maxHeight;

			if (current.fitToView) {
				maxWidth  = Math.min(viewport.w - wSpace, maxWidth);
				maxHeight = Math.min(viewport.h - hSpace, maxHeight);
			}

			maxWidth_  = viewport.w - wMargin;
			maxHeight_ = viewport.h - hMargin;

			if (current.aspectRatio) {
				if (width > maxWidth) {
					width  = maxWidth;
					height = getScalar(width / ratio);
				}

				if (height > maxHeight) {
					height = maxHeight;
					width  = getScalar(height * ratio);
				}

				if (width < minWidth) {
					width  = minWidth;
					height = getScalar(width / ratio);
				}

				if (height < minHeight) {
					height = minHeight;
					width  = getScalar(height * ratio);
				}

			} else {
				width = Math.max(minWidth, Math.min(width, maxWidth));

				if (current.autoHeight && current.type !== 'iframe') {
					inner.width( width );

					height = inner.height();
				}

				height = Math.max(minHeight, Math.min(height, maxHeight));
			}

			// Try to fit inside viewport (including the title)
			if (current.fitToView) {
				inner.width( width ).height( height );

				wrap.width( width + wPadding );

				// Real wrap dimensions
				width_  = wrap.width();
				height_ = wrap.height();

				if (current.aspectRatio) {
					while ((width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight) {
						if (steps++ > 19) {
							break;
						}

						height = Math.max(minHeight, Math.min(maxHeight, height - 10));
						width  = getScalar(height * ratio);

						if (width < minWidth) {
							width  = minWidth;
							height = getScalar(width / ratio);
						}


						if (width > maxWidth) {
							width  = maxWidth;
							height = getScalar(width / ratio);
						}

						inner.width( width ).height( height );

						wrap.width( width + wPadding );

						width_  = wrap.width();
						height_ = wrap.height();
					}

				} else {
					width  = Math.max(minWidth,  Math.min(width,  width  - (width_  - maxWidth_)));
					height = Math.max(minHeight, Math.min(height, height - (height_ - maxHeight_)));
				}
			}

			if (scrollOut && scrolling === 'auto' && height < origHeight && (width + wPadding + scrollOut) < maxWidth_) {
				width += scrollOut;
			}

			inner.width( width ).height( height );

			wrap.width( width + wPadding );

			width_  = wrap.width();
			height_ = wrap.height();

			canShrink = (width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight;
			canExpand = current.aspectRatio ? (width < origMaxWidth && height < origMaxHeight && width < origWidth && height < origHeight) : ((width < origMaxWidth || height < origMaxHeight) && (width < origWidth || height < origHeight));

			$.extend(current, {
				dim : {
					width	: getValue( width_ ),
					height	: getValue( height_ )
				},
				origWidth  : origWidth,
				origHeight : origHeight,
				canShrink  : canShrink,
				canExpand  : canExpand,
				wPadding   : wPadding,
				hPadding   : hPadding,
				wrapSpace  : height_ - skin.outerHeight(true),
				skinSpace  : skin.height() - height
			});

			if (!iframe && current.autoHeight && height > minHeight && height < maxHeight && !canExpand) {
				inner.height('auto');
			}
		},

		_getPosition: function (onlyAbsolute) {
			var current  = F.current,
				viewport = F.getViewport(),
				margin   = current.margin,
				width    = F.wrap.width()  + margin[1] + margin[3],
				height   = F.wrap.height() + margin[0] + margin[2],
				rez      = {
					position: 'absolute',
					top  : margin[0],
					left : margin[3]
				};

			if (current.autoCenter && current.fixed && !onlyAbsolute && height <= viewport.h && width <= viewport.w) {
				rez.position = 'fixed';

			} else if (!current.locked) {
				rez.top  += viewport.y;
				rez.left += viewport.x;
			}

			rez.top  = getValue(Math.max(rez.top,  rez.top  + ((viewport.h - height) * current.topRatio)));
			rez.left = getValue(Math.max(rez.left, rez.left + ((viewport.w - width)  * current.leftRatio)));

			return rez;
		},

		_afterZoomIn: function () {
			var current = F.current;

			if (!current) {
				return;
			}

			F.isOpen = F.isOpened = true;

			F.wrap.css('overflow', 'visible').addClass('fancybox-opened');

			F.update();

			// Assign a click event
			if ( current.closeClick || (current.nextClick && F.group.length > 1) ) {
				F.inner.css('cursor', 'pointer').bind('click.fb', function(e) {
					if (!$(e.target).is('a') && !$(e.target).parent().is('a')) {
						e.preventDefault();

						F[ current.closeClick ? 'close' : 'next' ]();
					}
				});
			}

			// Create a close button
			if (current.closeBtn) {
				$(current.tpl.closeBtn).appendTo(F.skin).bind('click.fb', function(e) {
					e.preventDefault();

					F.close();
				});
			}

			// Create navigation arrows
			if (current.arrows && F.group.length > 1) {
				if (current.loop || current.index > 0) {
					$(current.tpl.prev).appendTo(F.outer).bind('click.fb', F.prev);
				}

				if (current.loop || current.index < F.group.length - 1) {
					$(current.tpl.next).appendTo(F.outer).bind('click.fb', F.next);
				}
			}

			F.trigger('afterShow');

			// Stop the slideshow if this is the last item
			if (!current.loop && current.index === current.group.length - 1) {
				F.play( false );

			} else if (F.opts.autoPlay && !F.player.isActive) {
				F.opts.autoPlay = false;

				F.play();
			}
		},

		_afterZoomOut: function ( obj ) {
			obj = obj || F.current;

			$('.fancybox-wrap').trigger('onReset').remove();

			$.extend(F, {
				group  : {},
				opts   : {},
				router : false,
				current   : null,
				isActive  : false,
				isOpened  : false,
				isOpen    : false,
				isClosing : false,
				wrap   : null,
				skin   : null,
				outer  : null,
				inner  : null
			});

			F.trigger('afterClose', obj);
		}
	});

	/*
	 *	Default transitions
	 */

	F.transitions = {
		getOrigPosition: function () {
			var current  = F.current,
				element  = current.element,
				orig     = current.orig,
				pos      = {},
				width    = 50,
				height   = 50,
				hPadding = current.hPadding,
				wPadding = current.wPadding,
				viewport = F.getViewport();

			if (!orig && current.isDom && element.is(':visible')) {
				orig = element.find('img:first');

				if (!orig.length) {
					orig = element;
				}
			}

			if (isQuery(orig)) {
				pos = orig.offset();

				if (orig.is('img')) {
					width  = orig.outerWidth();
					height = orig.outerHeight();
				}

			} else {
				pos.top  = viewport.y + (viewport.h - height) * current.topRatio;
				pos.left = viewport.x + (viewport.w - width)  * current.leftRatio;
			}

			if (F.wrap.css('position') === 'fixed' || current.locked) {
				pos.top  -= viewport.y;
				pos.left -= viewport.x;
			}

			pos = {
				top     : getValue(pos.top  - hPadding * current.topRatio),
				left    : getValue(pos.left - wPadding * current.leftRatio),
				width   : getValue(width  + wPadding),
				height  : getValue(height + hPadding)
			};

			return pos;
		},

		step: function (now, fx) {
			var ratio,
				padding,
				value,
				prop       = fx.prop,
				current    = F.current,
				wrapSpace  = current.wrapSpace,
				skinSpace  = current.skinSpace;

			if (prop === 'width' || prop === 'height') {
				ratio = fx.end === fx.start ? 1 : (now - fx.start) / (fx.end - fx.start);

				if (F.isClosing) {
					ratio = 1 - ratio;
				}

				padding = prop === 'width' ? current.wPadding : current.hPadding;
				value   = now - padding;

				F.skin[ prop ](  getScalar( prop === 'width' ?  value : value - (wrapSpace * ratio) ) );
				F.inner[ prop ]( getScalar( prop === 'width' ?  value : value - (wrapSpace * ratio) - (skinSpace * ratio) ) );
			}
		},

		zoomIn: function () {
			var current  = F.current,
				startPos = current.pos,
				effect   = current.openEffect,
				elastic  = effect === 'elastic',
				endPos   = $.extend({opacity : 1}, startPos);

			// Remove "position" property that breaks older IE
			delete endPos.position;

			if (elastic) {
				startPos = this.getOrigPosition();

				if (current.openOpacity) {
					startPos.opacity = 0.1;
				}

			} else if (effect === 'fade') {
				startPos.opacity = 0.1;
			}

			F.wrap.css(startPos).animate(endPos, {
				duration : effect === 'none' ? 0 : current.openSpeed,
				easing   : current.openEasing,
				step     : elastic ? this.step : null,
				complete : F._afterZoomIn
			});
		},

		zoomOut: function () {
			var current  = F.current,
				effect   = current.closeEffect,
				elastic  = effect === 'elastic',
				endPos   = {opacity : 0.1};

			if (elastic) {
				endPos = this.getOrigPosition();

				if (current.closeOpacity) {
					endPos.opacity = 0.1;
				}
			}

			F.wrap.animate(endPos, {
				duration : effect === 'none' ? 0 : current.closeSpeed,
				easing   : current.closeEasing,
				step     : elastic ? this.step : null,
				complete : F._afterZoomOut
			});
		},

		changeIn: function () {
			var current   = F.current,
				effect    = current.nextEffect,
				startPos  = current.pos,
				endPos    = { opacity : 1 },
				direction = F.direction,
				distance  = 200,
				field;

			startPos.opacity = 0.1;

			if (effect === 'elastic') {
				field = direction === 'down' || direction === 'up' ? 'top' : 'left';

				if (direction === 'down' || direction === 'right') {
					startPos[ field ] = getValue(getScalar(startPos[ field ]) - distance);
					endPos[ field ]   = '+=' + distance + 'px';

				} else {
					startPos[ field ] = getValue(getScalar(startPos[ field ]) + distance);
					endPos[ field ]   = '-=' + distance + 'px';
				}
			}

			// Workaround for http://bugs.jquery.com/ticket/12273
			if (effect === 'none') {
				F._afterZoomIn();

			} else {
				F.wrap.css(startPos).animate(endPos, {
					duration : current.nextSpeed,
					easing   : current.nextEasing,
					complete : F._afterZoomIn
				});
			}
		},

		changeOut: function () {
			var previous  = F.previous,
				effect    = previous.prevEffect,
				endPos    = { opacity : 0.1 },
				direction = F.direction,
				distance  = 200;

			if (effect === 'elastic') {
				endPos[ direction === 'down' || direction === 'up' ? 'top' : 'left' ] = ( direction === 'up' || direction === 'left' ? '-' : '+' ) + '=' + distance + 'px';
			}

			previous.wrap.animate(endPos, {
				duration : effect === 'none' ? 0 : previous.prevSpeed,
				easing   : previous.prevEasing,
				complete : function () {
					$(this).trigger('onReset').remove();
				}
			});
		}
	};

	/*
	 *	Overlay helper
	 */

	F.helpers.overlay = {
		defaults : {
			closeClick : true,      // if true, fancyBox will be closed when user clicks on the overlay
			speedOut   : 200,       // duration of fadeOut animation
			showEarly  : true,      // indicates if should be opened immediately or wait until the content is ready
			css        : {},        // custom CSS properties
			locked     : !isTouch,  // if true, the content will be locked into overlay
			fixed      : true       // if false, the overlay CSS position property will not be set to "fixed"
		},

		overlay : null,      // current handle
		fixed   : false,     // indicates if the overlay has position "fixed"
		el      : $('html'), // element that contains "the lock"

		// Public methods
		create : function(opts) {
			opts = $.extend({}, this.defaults, opts);

			if (this.overlay) {
				this.close();
			}

			this.overlay = $('<div class="fancybox-overlay"></div>').appendTo( F.coming ? F.coming.parent : opts.parent );
			this.fixed   = false;

			if (opts.fixed && F.defaults.fixed) {
				this.overlay.addClass('fancybox-overlay-fixed');

				this.fixed = true;
			}
		},

		open : function(opts) {
			var that = this;

			opts = $.extend({}, this.defaults, opts);

			if (this.overlay) {
				this.overlay.unbind('.overlay').width('auto').height('auto');

			} else {
				this.create(opts);
			}

			if (!this.fixed) {
				W.bind('resize.overlay', $.proxy( this.update, this) );

				this.update();
			}

			if (opts.closeClick) {
				this.overlay.bind('click.overlay', function(e) {
					if ($(e.target).hasClass('fancybox-overlay')) {
						if (F.isActive) {
							F.close();
						} else {
							that.close();
						}

						return false;
					}
				});
			}

			this.overlay.css( opts.css ).show();
		},

		close : function() {
			var scrollV, scrollH;

			W.unbind('resize.overlay');

			if (this.el.hasClass('fancybox-lock')) {
				$('.fancybox-margin').removeClass('fancybox-margin');

				scrollV = W.scrollTop();
				scrollH = W.scrollLeft();

				this.el.removeClass('fancybox-lock');

				W.scrollTop( scrollV ).scrollLeft( scrollH );
			}

			$('.fancybox-overlay').remove().hide();

			$.extend(this, {
				overlay : null,
				fixed   : false
			});
		},

		// Private, callbacks

		update : function () {
			var width = '100%', offsetWidth;

			// Reset width/height so it will not mess
			this.overlay.width(width).height('100%');

			// jQuery does not return reliable result for IE
			if (IE) {
				offsetWidth = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);

				if (D.width() > offsetWidth) {
					width = D.width();
				}

			} else if (D.width() > W.width()) {
				width = D.width();
			}

			this.overlay.width(width).height(D.height());
		},

		// This is where we can manipulate DOM, because later it would cause iframes to reload
		onReady : function (opts, obj) {
			var overlay = this.overlay;

			$('.fancybox-overlay').stop(true, true);

			if (!overlay) {
				this.create(opts);
			}

			if (opts.locked && this.fixed && obj.fixed) {
				if (!overlay) {
					this.margin = D.height() > W.height() ? $('html').css('margin-right').replace("px", "") : false;
				}

				obj.locked = this.overlay.append( obj.wrap );
				obj.fixed  = false;
			}

			if (opts.showEarly === true) {
				this.beforeShow.apply(this, arguments);
			}
		},

		beforeShow : function(opts, obj) {
			var scrollV, scrollH;

			if (obj.locked) {
				if (this.margin !== false) {
					$('*').filter(function(){
						return ($(this).css('position') === 'fixed' && !$(this).hasClass("fancybox-overlay") && !$(this).hasClass("fancybox-wrap") );
					}).addClass('fancybox-margin');

					this.el.addClass('fancybox-margin');
				}

				scrollV = W.scrollTop();
				scrollH = W.scrollLeft();

				this.el.addClass('fancybox-lock');

				W.scrollTop( scrollV ).scrollLeft( scrollH );
			}

			this.open(opts);
		},

		onUpdate : function() {
			if (!this.fixed) {
				this.update();
			}
		},

		afterClose: function (opts) {
			// Remove overlay if exists and fancyBox is not opening
			// (e.g., it is not being open using afterClose callback)
			//if (this.overlay && !F.isActive) {
			if (this.overlay && !F.coming) {
				this.overlay.fadeOut(opts.speedOut, $.proxy( this.close, this ));
			}
		}
	};

	/*
	 *	Title helper
	 */

	F.helpers.title = {
		defaults : {
			type     : 'float', // 'float', 'inside', 'outside' or 'over',
			position : 'bottom' // 'top' or 'bottom'
		},

		beforeShow: function (opts) {
			var current = F.current,
				text    = current.title,
				type    = opts.type,
				title,
				target;

			if ($.isFunction(text)) {
				text = text.call(current.element, current);
			}

			if (!isString(text) || $.trim(text) === '') {
				return;
			}

			title = $('<div class="fancybox-title fancybox-title-' + type + '-wrap">' + text + '</div>');

			switch (type) {
				case 'inside':
					target = F.skin;
				break;

				case 'outside':
					target = F.wrap;
				break;

				case 'over':
					target = F.inner;
				break;

				default: // 'float'
					target = F.skin;

					title.appendTo('body');

					if (IE) {
						title.width( title.width() );
					}

					title.wrapInner('<span class="child"></span>');

					//Increase bottom margin so this title will also fit into viewport
					F.current.margin[2] += Math.abs( getScalar(title.css('margin-bottom')) );
				break;
			}

			title[ (opts.position === 'top' ? 'prependTo'  : 'appendTo') ](target);
		}
	};

	// jQuery plugin initialization
	$.fn.fancybox = function (options) {
		var index,
			that     = $(this),
			selector = this.selector || '',
			run      = function(e) {
				var what = $(this).blur(), idx = index, relType, relVal;

				if (!(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) && !what.is('.fancybox-wrap')) {
					relType = options.groupAttr || 'data-fancybox-group';
					relVal  = what.attr(relType);

					if (!relVal) {
						relType = 'rel';
						relVal  = what.get(0)[ relType ];
					}

					if (relVal && relVal !== '' && relVal !== 'nofollow') {
						what = selector.length ? $(selector) : that;
						what = what.filter('[' + relType + '="' + relVal + '"]');
						idx  = what.index(this);
					}

					options.index = idx;

					// Stop an event from bubbling if everything is fine
					if (F.open(what, options) !== false) {
						e.preventDefault();
					}
				}
			};

		options = options || {};
		index   = options.index || 0;

		if (!selector || options.live === false) {
			that.unbind('click.fb-start').bind('click.fb-start', run);

		} else {
			D.undelegate(selector, 'click.fb-start').delegate(selector + ":not('.fancybox-item, .fancybox-nav')", 'click.fb-start', run);
		}

		this.filter('[data-fancybox-start=1]').trigger('click');

		return this;
	};

	// Tests that need a body at doc ready
	D.ready(function() {
		var w1, w2;

		if ( $.scrollbarWidth === undefined ) {
			// http://benalman.com/projects/jquery-misc-plugins/#scrollbarwidth
			$.scrollbarWidth = function() {
				var parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body'),
					child  = parent.children(),
					width  = child.innerWidth() - child.height( 99 ).innerWidth();

				parent.remove();

				return width;
			};
		}

		if ( $.support.fixedPosition === undefined ) {
			$.support.fixedPosition = (function() {
				var elem  = $('<div style="position:fixed;top:20px;"></div>').appendTo('body'),
					fixed = ( elem[0].offsetTop === 20 || elem[0].offsetTop === 15 );

				elem.remove();

				return fixed;
			}());
		}

		$.extend(F.defaults, {
			scrollbarWidth : $.scrollbarWidth(),
			fixed  : $.support.fixedPosition,
			parent : $('body')
		});

		//Get real width of page scroll-bar
		w1 = $(window).width();

		H.addClass('fancybox-lock-test');

		w2 = $(window).width();

		H.removeClass('fancybox-lock-test');

		$("<style type='text/css'>.fancybox-margin{margin-right:" + (w2 - w1) + "px;}</style>").appendTo("head");
	});

}(window, document, jQuery));
/**
 * jQuery JSON plugin v2.5.1
 * https://github.com/Krinkle/jquery-json
 *
 * @author Brantley Harris, 2009-2011
 * @author Timo Tijhof, 2011-2014
 * @source This plugin is heavily influenced by MochiKit's serializeJSON, which is
 *         copyrighted 2005 by Bob Ippolito.
 * @source Brantley Harris wrote this plugin. It is based somewhat on the JSON.org
 *         website's http://www.json.org/json2.js, which proclaims:
 *         "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 *         I uphold.
 * @license MIT License <http://opensource.org/licenses/MIT>
 */
(function ($) {
	'use strict';

	var escape = /["\\\x00-\x1f\x7f-\x9f]/g,
		meta = {
			'\b': '\\b',
			'\t': '\\t',
			'\n': '\\n',
			'\f': '\\f',
			'\r': '\\r',
			'"': '\\"',
			'\\': '\\\\'
		},
		hasOwn = Object.prototype.hasOwnProperty;

	/**
	 * jQuery.toJSON
	 * Converts the given argument into a JSON representation.
	 *
	 * @param o {Mixed} The json-serializable *thing* to be converted
	 *
	 * If an object has a toJSON prototype, that will be used to get the representation.
	 * Non-integer/string keys are skipped in the object, as are keys that point to a
	 * function.
	 *
	 */
	$.toJSON = typeof JSON === 'object' && JSON.stringify ? JSON.stringify : function (o) {
		if (o === null) {
			return 'null';
		}

		var pairs, k, name, val,
			type = $.type(o);

		if (type === 'undefined') {
			return undefined;
		}

		// Also covers instantiated Number and Boolean objects,
		// which are typeof 'object' but thanks to $.type, we
		// catch them here. I don't know whether it is right
		// or wrong that instantiated primitives are not
		// exported to JSON as an {"object":..}.
		// We choose this path because that's what the browsers did.
		if (type === 'number' || type === 'boolean') {
			return String(o);
		}
		if (type === 'string') {
			return $.quoteString(o);
		}
		if (typeof o.toJSON === 'function') {
			return $.toJSON(o.toJSON());
		}
		if (type === 'date') {
			var month = o.getUTCMonth() + 1,
				day = o.getUTCDate(),
				year = o.getUTCFullYear(),
				hours = o.getUTCHours(),
				minutes = o.getUTCMinutes(),
				seconds = o.getUTCSeconds(),
				milli = o.getUTCMilliseconds();

			if (month < 10) {
				month = '0' + month;
			}
			if (day < 10) {
				day = '0' + day;
			}
			if (hours < 10) {
				hours = '0' + hours;
			}
			if (minutes < 10) {
				minutes = '0' + minutes;
			}
			if (seconds < 10) {
				seconds = '0' + seconds;
			}
			if (milli < 100) {
				milli = '0' + milli;
			}
			if (milli < 10) {
				milli = '0' + milli;
			}
			return '"' + year + '-' + month + '-' + day + 'T' +
				hours + ':' + minutes + ':' + seconds +
				'.' + milli + 'Z"';
		}

		pairs = [];

		if ($.isArray(o)) {
			for (k = 0; k < o.length; k++) {
				pairs.push($.toJSON(o[k]) || 'null');
			}
			return '[' + pairs.join(',') + ']';
		}

		// Any other object (plain object, RegExp, ..)
		// Need to do typeof instead of $.type, because we also
		// want to catch non-plain objects.
		if (typeof o === 'object') {
			for (k in o) {
				// Only include own properties,
				// Filter out inherited prototypes
				if (hasOwn.call(o, k)) {
					// Keys must be numerical or string. Skip others
					type = typeof k;
					if (type === 'number') {
						name = '"' + k + '"';
					} else if (type === 'string') {
						name = $.quoteString(k);
					} else {
						continue;
					}
					type = typeof o[k];

					// Invalid values like these return undefined
					// from toJSON, however those object members
					// shouldn't be included in the JSON string at all.
					if (type !== 'function' && type !== 'undefined') {
						val = $.toJSON(o[k]);
						pairs.push(name + ':' + val);
					}
				}
			}
			return '{' + pairs.join(',') + '}';
		}
	};

	/**
	 * jQuery.evalJSON
	 * Evaluates a given json string.
	 *
	 * @param str {String}
	 */
	$.evalJSON = typeof JSON === 'object' && JSON.parse ? JSON.parse : function (str) {
		/*jshint evil: true */
		return eval('(' + str + ')');
	};

	/**
	 * jQuery.secureEvalJSON
	 * Evals JSON in a way that is *more* secure.
	 *
	 * @param str {String}
	 */
	$.secureEvalJSON = typeof JSON === 'object' && JSON.parse ? JSON.parse : function (str) {
		var filtered =
			str
			.replace(/\\["\\\/bfnrtu]/g, '@')
			.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
			.replace(/(?:^|:|,)(?:\s*\[)+/g, '');

		if (/^[\],:{}\s]*$/.test(filtered)) {
			/*jshint evil: true */
			return eval('(' + str + ')');
		}
		throw new SyntaxError('Error parsing JSON, source is not valid.');
	};

	/**
	 * jQuery.quoteString
	 * Returns a string-repr of a string, escaping quotes intelligently.
	 * Mostly a support function for toJSON.
	 * Examples:
	 * >>> jQuery.quoteString('apple')
	 * "apple"
	 *
	 * >>> jQuery.quoteString('"Where are we going?", she asked.')
	 * "\"Where are we going?\", she asked."
	 */
	$.quoteString = function (str) {
		if (str.match(escape)) {
			return '"' + str.replace(escape, function (a) {
				var c = meta[a];
				if (typeof c === 'string') {
					return c;
				}
				c = a.charCodeAt();
				return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
			}) + '"';
		}
		return '"' + str + '"';
	};

}(jQuery));
/*
 * jQuery JSONP Core Plugin 2.4.0 (2012-08-21)
 *
 * https://github.com/jaubourg/jquery-jsonp
 *
 * Copyright (c) 2012 Julian Aubourg
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 */
( function( $ ) {

	// ###################### UTILITIES ##

	// Noop
	function noop() {
	}

	// Generic callback
	function genericCallback( data ) {
		lastValue = [ data ];
	}

	// Call if defined
	function callIfDefined( method , object , parameters ) {
		return method && method.apply( object.context || object , parameters );
	}

	// Give joining character given url
	function qMarkOrAmp( url ) {
		return /\?/ .test( url ) ? "&" : "?";
	}

	var // String constants (for better minification)
		STR_ASYNC = "async",
		STR_CHARSET = "charset",
		STR_EMPTY = "",
		STR_ERROR = "error",
		STR_INSERT_BEFORE = "insertBefore",
		STR_JQUERY_JSONP = "_jqjsp",
		STR_ON = "on",
		STR_ON_CLICK = STR_ON + "click",
		STR_ON_ERROR = STR_ON + STR_ERROR,
		STR_ON_LOAD = STR_ON + "load",
		STR_ON_READY_STATE_CHANGE = STR_ON + "readystatechange",
		STR_READY_STATE = "readyState",
		STR_REMOVE_CHILD = "removeChild",
		STR_SCRIPT_TAG = "<script>",
		STR_SUCCESS = "success",
		STR_TIMEOUT = "timeout",

		// Window
		win = window,
		// Deferred
		Deferred = $.Deferred,
		// Head element
		head = $( "head" )[ 0 ] || document.documentElement,
		// Page cache
		pageCache = {},
		// Counter
		count = 0,
		// Last returned value
		lastValue,

		// ###################### DEFAULT OPTIONS ##
		xOptionsDefaults = {
			//beforeSend: undefined,
			//cache: false,
			callback: STR_JQUERY_JSONP,
			//callbackParameter: undefined,
			//charset: undefined,
			//complete: undefined,
			//context: undefined,
			//data: "",
			//dataFilter: undefined,
			//error: undefined,
			//pageCache: false,
			//success: undefined,
			//timeout: 0,
			//traditional: false,
			url: location.href
		},

		// opera demands sniffing :/
		opera = win.opera,

		// IE < 10
		oldIE = !!$( "<div>" ).html( "<!--[if IE]><i><![endif]-->" ).find("i").length;

	// ###################### MAIN FUNCTION ##
	function jsonp( xOptions ) {

		// Build data with default
		xOptions = $.extend( {} , xOptionsDefaults , xOptions );

		// References to xOptions members (for better minification)
		var successCallback = xOptions.success,
			errorCallback = xOptions.error,
			completeCallback = xOptions.complete,
			dataFilter = xOptions.dataFilter,
			callbackParameter = xOptions.callbackParameter,
			successCallbackName = xOptions.callback,
			cacheFlag = xOptions.cache,
			pageCacheFlag = xOptions.pageCache,
			charset = xOptions.charset,
			url = xOptions.url,
			data = xOptions.data,
			timeout = xOptions.timeout,
			pageCached,

			// Abort/done flag
			done = 0,

			// Life-cycle functions
			cleanUp = noop,

			// Support vars
			supportOnload,
			supportOnreadystatechange,

			// Request execution vars
			firstChild,
			script,
			scriptAfter,
			timeoutTimer;

		// If we have Deferreds:
		// - substitute callbacks
		// - promote xOptions to a promise
		Deferred && Deferred(function( defer ) {
			defer.done( successCallback ).fail( errorCallback );
			successCallback = defer.resolve;
			errorCallback = defer.reject;
		}).promise( xOptions );

		// Create the abort method
		xOptions.abort = function() {
			!( done++ ) && cleanUp();
		};

		// Call beforeSend if provided (early abort if false returned)
		if ( callIfDefined( xOptions.beforeSend , xOptions , [ xOptions ] ) === !1 || done ) {
			return xOptions;
		}

		// Control entries
		url = url || STR_EMPTY;
		data = data ? ( (typeof data) == "string" ? data : $.param( data , xOptions.traditional ) ) : STR_EMPTY;

		// Build final url
		url += data ? ( qMarkOrAmp( url ) + data ) : STR_EMPTY;

		// Add callback parameter if provided as option
		callbackParameter && ( url += qMarkOrAmp( url ) + encodeURIComponent( callbackParameter ) + "=?" );

		// Add anticache parameter if needed
		!cacheFlag && !pageCacheFlag && ( url += qMarkOrAmp( url ) + "_" + ( new Date() ).getTime() + "=" );

		// Replace last ? by callback parameter
		url = url.replace( /=\?(&|$)/ , "=" + successCallbackName + "$1" );

		// Success notifier
		function notifySuccess( json ) {

			if ( !( done++ ) ) {

				cleanUp();
				// Pagecache if needed
				pageCacheFlag && ( pageCache [ url ] = { s: [ json ] } );
				// Apply the data filter if provided
				dataFilter && ( json = dataFilter.apply( xOptions , [ json ] ) );
				// Call success then complete
				callIfDefined( successCallback , xOptions , [ json , STR_SUCCESS, xOptions ] );
				callIfDefined( completeCallback , xOptions , [ xOptions , STR_SUCCESS ] );

			}
		}

		// Error notifier
		function notifyError( type ) {

			if ( !( done++ ) ) {

				// Clean up
				cleanUp();
				// If pure error (not timeout), cache if needed
				pageCacheFlag && type != STR_TIMEOUT && ( pageCache[ url ] = type );
				// Call error then complete
				callIfDefined( errorCallback , xOptions , [ xOptions , type ] );
				callIfDefined( completeCallback , xOptions , [ xOptions , type ] );

			}
		}

		// Check page cache
		if ( pageCacheFlag && ( pageCached = pageCache[ url ] ) ) {

			pageCached.s ? notifySuccess( pageCached.s[ 0 ] ) : notifyError( pageCached );

		} else {

			// Install the generic callback
			// (BEWARE: global namespace pollution ahoy)
			win[ successCallbackName ] = genericCallback;

			// Create the script tag
			script = $( STR_SCRIPT_TAG )[ 0 ];
			script.id = STR_JQUERY_JSONP + count++;

			// Set charset if provided
			if ( charset ) {
				script[ STR_CHARSET ] = charset;
			}

			opera && opera.version() < 11.60 ?
				// onerror is not supported: do not set as async and assume in-order execution.
				// Add a trailing script to emulate the event
				( ( scriptAfter = $( STR_SCRIPT_TAG )[ 0 ] ).text = "document.getElementById('" + script.id + "')." + STR_ON_ERROR + "()" )
			:
				// onerror is supported: set the script as async to avoid requests blocking each others
				( script[ STR_ASYNC ] = STR_ASYNC )

			;

			// Internet Explorer: event/htmlFor trick
			if ( oldIE ) {
				script.htmlFor = script.id;
				script.event = STR_ON_CLICK;
			}

			// Attached event handlers
			script[ STR_ON_LOAD ] = script[ STR_ON_ERROR ] = script[ STR_ON_READY_STATE_CHANGE ] = function ( result ) {

				// Test readyState if it exists
				if ( !script[ STR_READY_STATE ] || !/i/.test( script[ STR_READY_STATE ] ) ) {

					try {

						script[ STR_ON_CLICK ] && script[ STR_ON_CLICK ]();

					} catch( _ ) {}

					result = lastValue;
					lastValue = 0;
					result ? notifySuccess( result[ 0 ] ) : notifyError( STR_ERROR );

				}
			};

			// Set source
			script.src = url;

			// Re-declare cleanUp function
			cleanUp = function( i ) {
				timeoutTimer && clearTimeout( timeoutTimer );
				script[ STR_ON_READY_STATE_CHANGE ] = script[ STR_ON_LOAD ] = script[ STR_ON_ERROR ] = null;
				head[ STR_REMOVE_CHILD ]( script );
				scriptAfter && head[ STR_REMOVE_CHILD ]( scriptAfter );
			};

			// Append main script
			head[ STR_INSERT_BEFORE ]( script , ( firstChild = head.firstChild ) );

			// Append trailing script if needed
			scriptAfter && head[ STR_INSERT_BEFORE ]( scriptAfter , firstChild );

			// If a timeout is needed, install it
			timeoutTimer = timeout > 0 && setTimeout( function() {
				notifyError( STR_TIMEOUT );
			} , timeout );

		}

		return xOptions;
	}

	// ###################### SETUP FUNCTION ##
	jsonp.setup = function( xOptions ) {
		$.extend( xOptionsDefaults , xOptions );
	};

	// ###################### INSTALL in jQuery ##
	$.jsonp = jsonp;

} )( jQuery );
/*
 * jQuery Storage API Plugin
 *
 * Copyright (c) 2013 Julien Maurel
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 * https://github.com/julien-maurel/jQuery-Storage-API
 *
 * Version: 1.7.0
 *
 */
(function($){
	// Prefix to use with cookie fallback
	var cookie_local_prefix="ls_";
	var cookie_session_prefix="ss_";

	// Get items from a storage
	function _get(storage){
		var l=arguments.length,s=window[storage],a=arguments,a1=a[1],vi,ret,tmp;
		if(l<2) throw new Error('Minimum 2 arguments must be given');
		else if($.isArray(a1)){
			// If second argument is an array, return an object with value of storage for each item in this array
			ret={};
			for(var i in a1){
				vi=a1[i];
				try{
					ret[vi]=JSON.parse(s.getItem(vi));
				}catch(e){
					ret[vi]=s.getItem(vi);
				}
			}
			return ret;
		}else if(l==2){
			// If only 2 arguments, return value directly
			try{
				return JSON.parse(s.getItem(a1));
			}catch(e){
				return s.getItem(a1);
			}
		}else{
			// If more than 2 arguments, parse storage to retrieve final value to return it
			// Get first level
			try{
				ret=JSON.parse(s.getItem(a1));
			}catch(e){
				throw new ReferenceError(a1+' is not defined in this storage');
			}
			// Parse next levels
			for(var i=2;i<l-1;i++){
				ret=ret[a[i]];
				if(ret===undefined) throw new ReferenceError([].slice.call(a,1,i+1).join('.')+' is not defined in this storage');
			}
			// If last argument is an array, return an object with value for each item in this array
			// Else return value normally
			if($.isArray(a[i])){
				tmp=ret;
				ret={};
				for(var j in a[i]){
					ret[a[i][j]]=tmp[a[i][j]];
				}
				return ret;
			}else{
				return ret[a[i]];
			}
		}
	}

	// Set items of a storage
	function _set(storage){
		var l=arguments.length,s=window[storage],a=arguments,a1=a[1],a2=a[2],vi,to_store={},tmp;
		if(l<2 || !$.isPlainObject(a1) && l<3) throw new Error('Minimum 3 arguments must be given or second parameter must be an object');
		else if($.isPlainObject(a1)){
			// If first argument is an object, set values of storage for each property of this object
			for(var i in a1){
				vi=a1[i];
				if(!$.isPlainObject(vi)) s.setItem(i,vi);
				else s.setItem(i,JSON.stringify(vi));
			}
			return a1;
		}else if(l==3){
			// If only 3 arguments, set value of storage directly
			if(typeof a2==='object') s.setItem(a1,JSON.stringify(a2));
			else s.setItem(a1,a2);
			return a2;
		}else{
			// If more than 3 arguments, parse storage to retrieve final node and set value
			// Get first level
			try{
				tmp=s.getItem(a1);
				if(tmp!=null) {
					to_store=JSON.parse(tmp);
				}
			}catch(e){
			}
			tmp=to_store;
			// Parse next levels and set value
			for(var i=2;i<l-2;i++){
				vi=a[i];
				if(!tmp[vi] || !$.isPlainObject(tmp[vi])) tmp[vi]={};
				tmp=tmp[vi];
			}
			tmp[a[i]]=a[i+1];
			s.setItem(a1,JSON.stringify(to_store));
			return to_store;
		}
	}

	// Remove items from a storage
	function _remove(storage){
		var l=arguments.length,s=window[storage],a=arguments,a1=a[1],to_store,tmp;
		if(l<2) throw new Error('Minimum 2 arguments must be given');
		else if($.isArray(a1)){
			// If first argument is an array, remove values from storage for each item of this array
			for(var i in a1){
				s.removeItem(a1[i]);
			}
			return true;
		}else if(l==2){
			// If only 2 arguments, remove value from storage directly
			s.removeItem(a1);
			return true;
		}else{
			// If more than 2 arguments, parse storage to retrieve final node and remove value
			// Get first level
			try{
				to_store=tmp=JSON.parse(s.getItem(a1));
			}catch(e){
				throw new ReferenceError(a1+' is not defined in this storage');
			}
			// Parse next levels and remove value
			for(var i=2;i<l-1;i++){
				tmp=tmp[a[i]];
				if(tmp===undefined) throw new ReferenceError([].slice.call(a,1,i).join('.')+' is not defined in this storage');
			}
			// If last argument is an array,remove value for each item in this array
			// Else remove value normally
			if($.isArray(a[i])){
				for(var j in a[i]){
					delete tmp[a[i][j]];
				}
			}else{
				delete tmp[a[i]];
			}
			s.setItem(a1,JSON.stringify(to_store));
			return true;
		}
	}

	// Remove all items from a storage
	function _removeAll(storage, reinit_ns){
		var keys=_keys(storage);
		for(var i in keys){
			_remove(storage,keys[i]);
		}
		// Reinitialize all namespace storages
		if(reinit_ns){
			for(var i in $.namespaceStorages){
				_createNamespace(i);
			}
		}
	}

	// Check if items of a storage are empty
	function _isEmpty(storage){
		var l=arguments.length,a=arguments,s=window[storage],a1=a[1];
		if(l==1){
			// If only one argument, test if storage is empty
			return (_keys(storage).length==0);
		}else if($.isArray(a1)){
			// If first argument is an array, test each item of this array and return true only if all items are empty
			for(var i=0; i<a1.length;i++){
				if(!_isEmpty(storage,a1[i])) return false;
			}
			return true;
		}else{
			// If more than 1 argument, try to get value and test it
			try{
				var v=_get.apply(this, arguments);
				// Convert result to an object (if last argument is an array, _get return already an object) and test each item
				if(!$.isArray(a[l-1])) v={'totest':v};
				for(var i in v){
					if(!(
						($.isPlainObject(v[i]) && $.isEmptyObject(v[i])) ||
						($.isArray(v[i]) && !v[i].length) ||
						(!v[i])
					)) return false;
				}
				return true;
			}catch(e){
				return true;
			}
		}
	}

	// Check if items of a storage exist
	function _isSet(storage){
		var l=arguments.length,a=arguments,s=window[storage],a1=a[1];
		if(l<2) throw new Error('Minimum 2 arguments must be given');
		if($.isArray(a1)){
			// If first argument is an array, test each item of this array and return true only if all items exist
			for(var i=0; i<a1.length;i++){
				if(!_isSet(storage,a1[i])) return false;
			}
			return true;
		}else{
			// For other case, try to get value and test it
			try{
				var v=_get.apply(this, arguments);
				// Convert result to an object (if last argument is an array, _get return already an object) and test each item
				if(!$.isArray(a[l-1])) v={'totest':v};
				for(var i in v){
					if(!(v[i]!==undefined && v[i]!==null)) return false;
				}
				return true;
			}catch(e){
				return false;
			}
		}
	}

	// Get keys of a storage or of an item of the storage
	function _keys(storage){
		var l=arguments.length,s=window[storage],a=arguments,a1=a[1],keys=[],o={};
		// If more than 1 argument, get value from storage to retrieve keys
		// Else, use storage to retrieve keys
		if(l>1){
			o=_get.apply(this,a);
		}else{
			o=s;
		}
		if(o._cookie){
			// If storage is a cookie, use $.cookie to retrieve keys
			for(var key in $.cookie()){
				if(key!='') {
					keys.push(key.replace(o._prefix,''));
				}
			}
		}else{
			for(var i in o){
				keys.push(i);
			}
		}
		return keys;
	}

	// Create new namespace storage
	function _createNamespace(name){
		if(!name || typeof name!="string") throw new Error('First parameter must be a string');
		if(!window.localStorage.getItem(name)) window.localStorage.setItem(name,'{}');
		if(!window.sessionStorage.getItem(name)) window.sessionStorage.setItem(name,'{}');
		var ns={
			localStorage:$.extend({},$.localStorage,{_ns:name}),
			sessionStorage:$.extend({},$.sessionStorage,{_ns:name})
		};
		if($.cookie){
			if(!window.cookieStorage.getItem(name)) window.cookieStorage.setItem(name,'{}');
			ns.cookieStorage=$.extend({},$.cookieStorage,{_ns:name});
		}
		$.namespaceStorages[name]=ns;
		return ns;
	}

	// Namespace object
	var storage={
		_type:'',
		_ns:'',
		_callMethod:function(f,a){
			var p=[this._type],a=Array.prototype.slice.call(a),a0=a[0];
			if(this._ns) p.push(this._ns);
			if(typeof a0==='string' && a0.indexOf('.')!==-1){
				a.shift();
				[].unshift.apply(a,a0.split('.'));
			}
			[].push.apply(p,a);
			return f.apply(this,p);
		},
		// Get items. If no parameters and storage have a namespace, return all namespace
		get:function(){
			return this._callMethod(_get,arguments);
		},
		// Set items
		set:function(){
			var l=arguments.length,a=arguments,a0=a[0];
			if(l<1 || !$.isPlainObject(a0) && l<2) throw new Error('Minimum 2 arguments must be given or first parameter must be an object');
			// If first argument is an object and storage is a namespace storage, set values individually
			if($.isPlainObject(a0) && this._ns){
				for(var i in a0){
					_set(this._type,this._ns,i,a0[i]);
				}
				return a0;
			}else{
				r=this._callMethod(_set,a);
				if(this._ns) return r[a0.split('.')[0]];
				else return r;
			}
		},
		// Delete items
		remove:function(){
			if(arguments.length<1) throw new Error('Minimum 1 argument must be given');
			return this._callMethod(_remove,arguments);
		},
		// Delete all items
		removeAll:function(reinit_ns){
			if(this._ns){
				_set(this._type,this._ns,{});
				return true;
			}else{
				return _removeAll(this._type, reinit_ns);
			}
		},
		// Items empty
		isEmpty:function(){
			return this._callMethod(_isEmpty,arguments);
		},
		// Items exists
		isSet:function(){
			if(arguments.length<1) throw new Error('Minimum 1 argument must be given');
			return this._callMethod(_isSet,arguments);
		},
		// Get keys of items
		keys:function(){
			return this._callMethod(_keys,arguments);
		}
	};

	// Use jquery.cookie for compatibility with old browsers and give access to cookieStorage
	if($.cookie){
		// sessionStorage is valid for one window/tab. To simulate that with cookie, we set a name for the window and use it for the name of the cookie
		if(!window.name) window.name=Math.floor(Math.random()*100000000);
		var cookie_storage={
			_cookie:true,
			_prefix:'',
			_expires:null,
			_path:null,
			_domain:null,
			setItem:function(n,v){
				$.cookie(this._prefix+n,v,{expires:this._expires,path:this._path,domain:this._domain});
			},
			getItem:function(n){
				return $.cookie(this._prefix+n);
			},
			removeItem:function(n){
				return $.removeCookie(this._prefix+n);
			},
			clear:function(){
				for(var key in $.cookie()){
					if(key!=''){
						if(!this._prefix && key.indexOf(cookie_local_prefix)===-1 && key.indexOf(cookie_session_prefix)===-1 || this._prefix && key.indexOf(this._prefix)===0) {
							$.removeCookie(key);
						}
					}
				}
			},
			setExpires:function(e){
				this._expires=e;
				return this;
			},
			setPath:function(p){
				this._path=p;
				return this;
			},
			setDomain:function(d){
				this._domain=d;
				return this;
			},
			setConf:function(c){
				if(c.path) this._path=c.path;
				if(c.domain) this._domain=c.domain;
				if(c.expires) this._expires=c.expires;
				return this;
			},
			setDefaultConf:function(){
				this._path=this._domain=this._expires=null;
			}
		};
		if(!window.localStorage){
			window.localStorage=$.extend({},cookie_storage,{_prefix:cookie_local_prefix,_expires:365*10});
			window.sessionStorage=$.extend({},cookie_storage,{_prefix:cookie_session_prefix+window.name+'_'});
		}
		window.cookieStorage=$.extend({},cookie_storage);
		// cookieStorage API
		$.cookieStorage=$.extend({},storage,{
			_type:'cookieStorage',
			setExpires:function(e){window.cookieStorage.setExpires(e); return this;},
			setPath:function(p){window.cookieStorage.setPath(p); return this;},
			setDomain:function(d){window.cookieStorage.setDomain(d); return this;},
			setConf:function(c){window.cookieStorage.setConf(c); return this;},
			setDefaultConf:function(){window.cookieStorage.setDefaultConf(); return this;}
		});
	}

	// Get a new API on a namespace
	$.initNamespaceStorage=function(ns){ return _createNamespace(ns); };
	// localStorage API
	$.localStorage=$.extend({},storage,{_type:'localStorage'});
	// sessionStorage API
	$.sessionStorage=$.extend({},storage,{_type:'sessionStorage'});
	// List of all namespace storage
	$.namespaceStorages={};
	// Remove all items in all storages
	$.removeAllStorages=function(reinit_ns){
		$.localStorage.removeAll(reinit_ns);
		$.sessionStorage.removeAll(reinit_ns);
		if($.cookieStorage) $.cookieStorage.removeAll(reinit_ns);
		if(!reinit_ns){
			$.namespaceStorages={};
		}
	}
})(jQuery);

/*
 * jQuery.ScrollTo
 * Copyright (c) 2007-2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 9/11/2008
 *
 * @projectDescription Easy element scrolling using jQuery.
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * Tested with jQuery 1.2.6. On FF 2/3, IE 6/7, Opera 9.2/5 and Safari 3. on Windows.
 *
 * @author Ariel Flesler
 * @version 1.4
 *
 * @id jQuery.scrollTo
 * @id jQuery.fn.scrollTo
 * @param {String, Number, DOMElement, jQuery, Object} target Where to scroll the matched elements.
 *	  The different options for target are:
 *		- A number position (will be applied to all axes).
 *		- A string position ('44', '100px', '+=90', etc ) will be applied to all axes
 *		- A jQuery/DOM element ( logically, child of the element to scroll )
 *		- A string selector, that will be relative to the element to scroll ( 'li:eq(2)', etc )
 *		- A hash { top:x, left:y }, x and y can be any kind of number/string like above.
 * @param {Number} duration The OVERALL length of the animation, this argument can be the settings object instead.
 * @param {Object,Function} settings Optional set of settings or the onAfter callback.
 *	 @option {String} axis Which axis must be scrolled, use 'x', 'y', 'xy' or 'yx'.
 *	 @option {Number} duration The OVERALL length of the animation.
 *	 @option {String} easing The easing method for the animation.
 *	 @option {Boolean} margin If true, the margin of the target element will be deducted from the final position.
 *	 @option {Object, Number} offset Add/deduct from the end position. One number for both axes or { top:x, left:y }.
 *	 @option {Object, Number} over Add/deduct the height/width multiplied by 'over', can be { top:x, left:y } when using both axes.
 *	 @option {Boolean} queue If true, and both axis are given, the 2nd axis will only be animated after the first one ends.
 *	 @option {Function} onAfter Function to be called after the scrolling ends. 
 *	 @option {Function} onAfterFirst If queuing is activated, this function will be called after the first scrolling ends.
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * @desc Scroll to a fixed position
 * @example $('div').scrollTo( 340 );
 *
 * @desc Scroll relatively to the actual position
 * @example $('div').scrollTo( '+=340px', { axis:'y' } );
 *
 * @dec Scroll using a selector (relative to the scrolled element)
 * @example $('div').scrollTo( 'p.paragraph:eq(2)', 500, { easing:'swing', queue:true, axis:'xy' } );
 *
 * @ Scroll to a DOM element (same for jQuery object)
 * @example var second_child = document.getElementById('container').firstChild.nextSibling;
 *			$('#container').scrollTo( second_child, { duration:500, axis:'x', onAfter:function(){
 *				alert('scrolled!!');																   
 *			}});
 *
 * @desc Scroll on both axes, to different values
 * @example $('div').scrollTo( { top: 300, left:'+=200' }, { axis:'xy', offset:-20 } );
 */
;(function( $ ){
	
	var $scrollTo = $.scrollTo = function( target, duration, settings ){
		$(window).scrollTo( target, duration, settings );
	};

	$scrollTo.defaults = {
		axis:'y',
		duration:1
	};

	// Returns the element that needs to be animated to scroll the window.
	// Kept for backwards compatibility (specially for localScroll & serialScroll)
	$scrollTo.window = function( scope ){
		return $(window).scrollable();
	};

	// Hack, hack, hack... stay away!
	// Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
	$.fn.scrollable = function(){
		return this.map(function(){
			// Just store it, we might need it
			var win = this.parentWindow || this.defaultView,
				// If it's a document, get its iframe or the window if it's THE document
				elem = this.nodeName == '#document' ? win.frameElement || win : this,
				// Get the corresponding document
				doc = elem.contentDocument || (elem.contentWindow || elem).document,
				isWin = elem.setInterval;

			return elem.nodeName == 'IFRAME' || isWin && $.browser.safari ? doc.body
				: isWin ? doc.documentElement
				: this;
		});
	};

	$.fn.scrollTo = function( target, duration, settings ){
		if( typeof duration == 'object' ){
			settings = duration;
			duration = 0;
		}
		if( typeof settings == 'function' )
			settings = { onAfter:settings };
			
		settings = $.extend( {}, $scrollTo.defaults, settings );
		// Speed is still recognized for backwards compatibility
		duration = duration || settings.speed || settings.duration;
		// Make sure the settings are given right
		settings.queue = settings.queue && settings.axis.length > 1;
		
		if( settings.queue )
			// Let's keep the overall duration
			duration /= 2;
		settings.offset = both( settings.offset );
		settings.over = both( settings.over );

		return this.scrollable().each(function(){
			var elem = this,
				$elem = $(elem),
				targ = target, toff, attr = {},
				win = $elem.is('html,body');

			switch( typeof targ ){
				// A number will pass the regex
				case 'number':
				case 'string':
					if( /^([+-]=)?\d+(px)?$/.test(targ) ){
						targ = both( targ );
						// We are done
						break;
					}
					// Relative selector, no break!
					targ = $(targ,this);
				case 'object':
					// DOMElement / jQuery
					if( targ.is || targ.style )
						// Get the real position of the target 
						toff = (targ = $(targ)).offset();
			}
			$.each( settings.axis.split(''), function( i, axis ){
				var Pos	= axis == 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					old = elem[key],
					Dim = axis == 'x' ? 'Width' : 'Height',
					dim = Dim.toLowerCase();

				if( toff ){// jQuery / DOMElement
					attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

					// If it's a dom element, reduce the margin
					if( settings.margin ){
						attr[key] -= parseInt(targ.css('margin'+Pos)) || 0;
						attr[key] -= parseInt(targ.css('border'+Pos+'Width')) || 0;
					}
					
					attr[key] += settings.offset[pos] || 0;
					
					if( settings.over[pos] )
						// Scroll to a fraction of its width/height
						attr[key] += targ[dim]() * settings.over[pos];
				}else
					attr[key] = targ[pos];

				// Number or 'number'
				if( /^\d+$/.test(attr[key]) )
					// Check the limits
					attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max(Dim) );

				// Queueing axes
				if( !i && settings.queue ){
					// Don't waste time animating, if there's no need.
					if( old != attr[key] )
						// Intermediate animation
						animate( settings.onAfterFirst );
					// Don't animate this axis again in the next iteration.
					delete attr[key];
				}
			});			
			animate( settings.onAfter );			

			function animate( callback ){
				$elem.animate( attr, duration, settings.easing, callback && function(){
					callback.call(this, target, settings);
				});
			};
			function max( Dim ){
				var attr ='scroll'+Dim,
					doc = elem.ownerDocument;
				
				return win
						? Math.max( doc.documentElement[attr], doc.body[attr]  )
						: elem[attr];
			};
		}).end();
	};

	function both( val ){
		return typeof val == 'object' ? val : { top:val, left:val };
	};

})( jQuery );
/*! http://mths.be/placeholder v2.1.0 by @mathias */
(function($) {

	// Opera Mini v7 doesn't support placeholder although its DOM seems to indicate so
	var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]';
	var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
	var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini;
	var valHooks = $.valHooks;
	var propHooks = $.propHooks;
	var hooks;
	var placeholder;

	if (isInputSupported && isTextareaSupported) {

		placeholder = $.fn.placeholder = function() {
			return this;
		};

		placeholder.input = placeholder.textarea = true;

	} else {

		var settings = {};

		placeholder = $.fn.placeholder = function(options) {

			var defaults = {customClass: 'placeholder'};
			settings = $.extend({}, defaults, options);

			var $this = this;
			$this
				.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
				.not('.'+settings.customClass)
				.bind({
					'focus.placeholder': clearPlaceholder,
					'blur.placeholder': setPlaceholder
				})
				.data('placeholder-enabled', true)
				.trigger('blur.placeholder');
			return $this;
		};

		placeholder.input = isInputSupported;
		placeholder.textarea = isTextareaSupported;

		hooks = {
			'get': function(element) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value;
				}

				return $element.data('placeholder-enabled') && $element.hasClass(settings.customClass) ? '' : element.value;
			},
			'set': function(element, value) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value = value;
				}

				if (!$element.data('placeholder-enabled')) {
					return element.value = value;
				}
				if (value === '') {
					element.value = value;
					// Issue #56: Setting the placeholder causes problems if the element continues to have focus.
					if (element != safeActiveElement()) {
						// We can't use `triggerHandler` here because of dummy text/password inputs :(
						setPlaceholder.call(element);
					}
				} else if ($element.hasClass(settings.customClass)) {
					clearPlaceholder.call(element, true, value) || (element.value = value);
				} else {
					element.value = value;
				}
				// `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
				return $element;
			}
		};

		if (!isInputSupported) {
			valHooks.input = hooks;
			propHooks.value = hooks;
		}
		if (!isTextareaSupported) {
			valHooks.textarea = hooks;
			propHooks.value = hooks;
		}

		$(function() {
			// Look for forms
			$(document).delegate('form', 'submit.placeholder', function() {
				// Clear the placeholder values so they don't get submitted
				var $inputs = $('.'+settings.customClass, this).each(clearPlaceholder);
				setTimeout(function() {
					$inputs.each(setPlaceholder);
				}, 10);
			});
		});

		// Clear placeholder values upon page reload
		$(window).bind('beforeunload.placeholder', function() {
			$('.'+settings.customClass).each(function() {
				this.value = '';
			});
		});

	}

	function args(elem) {
		// Return an object of element attributes
		var newAttrs = {};
		var rinlinejQuery = /^jQuery\d+$/;
		$.each(elem.attributes, function(i, attr) {
			if (attr.specified && !rinlinejQuery.test(attr.name)) {
				newAttrs[attr.name] = attr.value;
			}
		});
		return newAttrs;
	}

	function clearPlaceholder(event, value) {
		var input = this;
		var $input = $(input);
		if (input.value == $input.attr('placeholder') && $input.hasClass(settings.customClass)) {
			if ($input.data('placeholder-password')) {
				$input = $input.hide().nextAll('input[type="password"]:first').show().attr('id', $input.removeAttr('id').data('placeholder-id'));
				// If `clearPlaceholder` was called from `$.valHooks.input.set`
				if (event === true) {
					return $input[0].value = value;
				}
				$input.focus();
			} else {
				input.value = '';
				$input.removeClass(settings.customClass);
				input == safeActiveElement() && input.select();
			}
		}
	}

	function setPlaceholder() {
		var $replacement;
		var input = this;
		var $input = $(input);
		var id = this.id;
		if (input.value === '') {
			if (input.type === 'password') {
				if (!$input.data('placeholder-textinput')) {
					try {
						$replacement = $input.clone().attr({ 'type': 'text' });
					} catch(e) {
						$replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
					}
					$replacement
						.removeAttr('name')
						.data({
							'placeholder-password': $input,
							'placeholder-id': id
						})
						.bind('focus.placeholder', clearPlaceholder);
					$input
						.data({
							'placeholder-textinput': $replacement,
							'placeholder-id': id
						})
						.before($replacement);
				}
				$input = $input.removeAttr('id').hide().prevAll('input[type="text"]:first').attr('id', id).show();
				// Note: `$input[0] != input` now!
			}
			$input.addClass(settings.customClass);
			$input[0].value = $input.attr('placeholder');
		} else {
			$input.removeClass(settings.customClass);
		}
	}

	function safeActiveElement() {
		// Avoid IE9 `document.activeElement` of death
		// https://github.com/mathiasbynens/jquery-placeholder/pull/99
		try {
			return document.activeElement;
		} catch (exception) {}
	}

})(jQuery);

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(e,m){var p={},j=p.lib={},l=function(){},f=j.Base={extend:function(a){l.prototype=this;var c=new l;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
n=j.WordArray=f.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=m?c:4*a.length},toString:function(a){return(a||h).stringify(this)},concat:function(a){var c=this.words,q=a.words,d=this.sigBytes;a=a.sigBytes;this.clamp();if(d%4)for(var b=0;b<a;b++)c[d+b>>>2]|=(q[b>>>2]>>>24-8*(b%4)&255)<<24-8*((d+b)%4);else if(65535<q.length)for(b=0;b<a;b+=4)c[d+b>>>2]=q[b>>>2];else c.push.apply(c,q);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=e.ceil(c/4)},clone:function(){var a=f.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],b=0;b<a;b+=4)c.push(4294967296*e.random()|0);return new n.init(c,a)}}),b=p.enc={},h=b.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],d=0;d<a;d++){var f=c[d>>>2]>>>24-8*(d%4)&255;b.push((f>>>4).toString(16));b.push((f&15).toString(16))}return b.join("")},parse:function(a){for(var c=a.length,b=[],d=0;d<c;d+=2)b[d>>>3]|=parseInt(a.substr(d,
2),16)<<24-4*(d%8);return new n.init(b,c/2)}},g=b.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],d=0;d<a;d++)b.push(String.fromCharCode(c[d>>>2]>>>24-8*(d%4)&255));return b.join("")},parse:function(a){for(var c=a.length,b=[],d=0;d<c;d++)b[d>>>2]|=(a.charCodeAt(d)&255)<<24-8*(d%4);return new n.init(b,c)}},r=b.Utf8={stringify:function(a){try{return decodeURIComponent(escape(g.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return g.parse(unescape(encodeURIComponent(a)))}},
k=j.BufferedBlockAlgorithm=f.extend({reset:function(){this._data=new n.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=r.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,b=c.words,d=c.sigBytes,f=this.blockSize,h=d/(4*f),h=a?e.ceil(h):e.max((h|0)-this._minBufferSize,0);a=h*f;d=e.min(4*a,d);if(a){for(var g=0;g<a;g+=f)this._doProcessBlock(b,g);g=b.splice(0,a);c.sigBytes-=d}return new n.init(g,d)},clone:function(){var a=f.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});j.Hasher=k.extend({cfg:f.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){k.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,b){return(new a.init(b)).finalize(c)}},_createHmacHelper:function(a){return function(b,f){return(new s.HMAC.init(a,
f)).finalize(b)}}});var s=p.algo={};return p}(Math);
(function(){var e=CryptoJS,m=e.lib,p=m.WordArray,j=m.Hasher,l=[],m=e.algo.SHA1=j.extend({_doReset:function(){this._hash=new p.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(f,n){for(var b=this._hash.words,h=b[0],g=b[1],e=b[2],k=b[3],j=b[4],a=0;80>a;a++){if(16>a)l[a]=f[n+a]|0;else{var c=l[a-3]^l[a-8]^l[a-14]^l[a-16];l[a]=c<<1|c>>>31}c=(h<<5|h>>>27)+j+l[a];c=20>a?c+((g&e|~g&k)+1518500249):40>a?c+((g^e^k)+1859775393):60>a?c+((g&e|g&k|e&k)-1894007588):c+((g^e^
k)-899497514);j=k;k=e;e=g<<30|g>>>2;g=h;h=c}b[0]=b[0]+h|0;b[1]=b[1]+g|0;b[2]=b[2]+e|0;b[3]=b[3]+k|0;b[4]=b[4]+j|0},_doFinalize:function(){var f=this._data,e=f.words,b=8*this._nDataBytes,h=8*f.sigBytes;e[h>>>5]|=128<<24-h%32;e[(h+64>>>9<<4)+14]=Math.floor(b/4294967296);e[(h+64>>>9<<4)+15]=b;f.sigBytes=4*e.length;this._process();return this._hash},clone:function(){var e=j.clone.call(this);e._hash=this._hash.clone();return e}});e.SHA1=j._createHelper(m);e.HmacSHA1=j._createHmacHelper(m)})();

/*! intercom.js | https://github.com/diy/intercom.js | Apache License (v2) */
/*! Removed Socket.io binding for intercom.js */

var Intercom = (function() {

	// --- lib/events.js ---

	var EventEmitter = function() {};

	EventEmitter.createInterface = function(space) {
		var methods = {};

		methods.on = function(name, fn) {
			if (typeof this[space] === 'undefined') {
				this[space] = {};
			}
			if (!this[space].hasOwnProperty(name)) {
				this[space][name] = [];
			}
			this[space][name].push(fn);
		};

		methods.off = function(name, fn) {
			if (typeof this[space] === 'undefined') return;
			if (this[space].hasOwnProperty(name)) {
				util.removeItem(fn, this[space][name]);
			}
		};

		methods.trigger = function(name) {
			if (typeof this[space] !== 'undefined' && this[space].hasOwnProperty(name)) {
				var args = Array.prototype.slice.call(arguments, 1);
				for (var i = 0; i < this[space][name].length; i++) {
					this[space][name][i].apply(this[space][name][i], args);
				}
			}
		};

		return methods;
	};

	var pvt = EventEmitter.createInterface('_handlers');
	EventEmitter.prototype._on = pvt.on;
	EventEmitter.prototype._off = pvt.off;
	EventEmitter.prototype._trigger = pvt.trigger;

	var pub = EventEmitter.createInterface('handlers');
	EventEmitter.prototype.on = function() {
		pub.on.apply(this, arguments);
		Array.prototype.unshift.call(arguments, 'on');
		this._trigger.apply(this, arguments);
	};
	EventEmitter.prototype.off = pub.off;
	EventEmitter.prototype.trigger = pub.trigger;

	// --- lib/localstorage.js ---

	var localStorage = window.localStorage;
	if (typeof localStorage === 'undefined') {
		localStorage = {
			getItem    : function() {},
			setItem    : function() {},
			removeItem : function() {}
		};
	}

	// --- lib/util.js ---

	var util = {};

	util.guid = (function() {
		var S4 = function() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		};
		return function() {
			return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
		};
	})();

	util.throttle = function(delay, fn) {
		var last = 0;
		return function() {
			var now = (new Date()).getTime();
			if (now - last > delay) {
				last = now;
				fn.apply(this, arguments);
			}
		};
	};

	util.extend = function(a, b) {
		if (typeof a === 'undefined' || !a) { a = {}; }
		if (typeof b === 'object') {
			for (var key in b) {
				if (b.hasOwnProperty(key)) {
					a[key] = b[key];
				}
			}
		}
		return a;
	};

	util.removeItem = function(item, array) {
		for (var i = array.length - 1; i >= 0; i--) {
			if (array[i] === item) {
				array.splice(i, 1);
			}
		}
		return array;
	};

	// --- lib/intercom.js ---

	/**
	* A cross-window broadcast service built on top
	* of the HTML5 localStorage API. The interface
	* mimic socket.io in design.
	*
	* @author Brian Reavis <brian@thirdroute.com>
	* @constructor
	*/

	var Intercom = function() {
		var self = this;
		var now = (new Date()).getTime();

		this.origin         = util.guid();
		this.lastMessage    = now;
		this.bindings       = [];
		this.receivedIDs    = {};
		this.previousValues = {};

		var storageHandler = function() { self._onStorageEvent.apply(self, arguments); };
		if (window.attachEvent) { document.attachEvent('onstorage', storageHandler); }
		else { window.addEventListener('storage', storageHandler, false); };
	};

	Intercom.prototype._transaction = function(fn) {
		var TIMEOUT   = 1000;
		var WAIT      = 20;

		var self      = this;
		var executed  = false;
		var listening = false;
		var waitTimer = null;

		var lock = function() {
			if (executed) return;

			var now = (new Date()).getTime();
			var activeLock = parseInt(localStorage.getItem(INDEX_LOCK) || 0);
			if (activeLock && now - activeLock < TIMEOUT) {
				if (!listening) {
					self._on('storage', lock);
					listening = true;
				}
				waitTimer = window.setTimeout(lock, WAIT);
				return;
			}
			executed = true;

			try {
				localStorage.setItem(INDEX_LOCK, now);
			} catch (e) {}

			fn();
			unlock();
		};

		var unlock = function() {
			if (listening) { self._off('storage', lock); }
			if (waitTimer) { window.clearTimeout(waitTimer); }
			localStorage.removeItem(INDEX_LOCK);
		};

		lock();
	};

	Intercom.prototype._cleanup_emit = util.throttle(100, function() {
		var self = this;

		this._transaction(function() {
			var now = (new Date()).getTime();
			var threshold = now - THRESHOLD_TTL_EMIT;
			var changed = 0;

			var messages = JSON.parse(localStorage.getItem(INDEX_EMIT) || '[]');
			for (var i = messages.length - 1; i >= 0; i--) {
				if (messages[i].timestamp < threshold) {
					messages.splice(i, 1);
					changed++;
				}
			}
			if (changed > 0) {
				localStorage.setItem(INDEX_EMIT, JSON.stringify(messages));
			}
		});
	});

	Intercom.prototype._cleanup_once = util.throttle(100, function() {
		var self = this;

		this._transaction(function() {
			var timestamp, ttl, key;
			var table   = JSON.parse(localStorage.getItem(INDEX_ONCE) || '{}');
			var now     = (new Date()).getTime();
			var changed = 0;

			for (key in table) {
				if (self._once_expired(key, table)) {
					delete table[key];
					changed++;
				}
			}

			if (changed > 0) {
				localStorage.setItem(INDEX_ONCE, JSON.stringify(table));
			}
		});
	});

	Intercom.prototype._once_expired = function(key, table) {
		if (!table) return true;
		if (!table.hasOwnProperty(key)) return true;
		if (typeof table[key] !== 'object') return true;
		var ttl = table[key].ttl || THRESHOLD_TTL_ONCE;
		var now = (new Date()).getTime();
		var timestamp = table[key].timestamp;
		return timestamp < now - ttl;
	};

	Intercom.prototype._localStorageChanged = function(event, field) {
		if (event && event.key) {
			return event.key === field;
		}

		var currentValue = localStorage.getItem(field);
		if (currentValue === this.previousValues[field]) {
			return false;
		}
		this.previousValues[field] = currentValue;
		return true;
	};

	Intercom.prototype._onStorageEvent = function(event) {
		event = event || window.event;
		var self = this;

		if (this._localStorageChanged(event, INDEX_EMIT)) {
			this._transaction(function() {
				var now = (new Date()).getTime();
				var data = localStorage.getItem(INDEX_EMIT);
				var messages = JSON.parse(data || '[]');
				for (var i = 0; i < messages.length; i++) {
					if (messages[i].origin === self.origin) continue;
					if (messages[i].timestamp < self.lastMessage) continue;
					if (messages[i].id) {
						if (self.receivedIDs.hasOwnProperty(messages[i].id)) continue;
						self.receivedIDs[messages[i].id] = true;
					}
					self.trigger(messages[i].name, messages[i].payload);
				}
				self.lastMessage = now;
			});
		}

		this._trigger('storage', event);
	};

	Intercom.prototype._emit = function(name, message, id) {
		id = (typeof id === 'string' || typeof id === 'number') ? String(id) : null;
		if (id && id.length) {
			if (this.receivedIDs.hasOwnProperty(id)) return;
			this.receivedIDs[id] = true;
		}

		var packet = {
			id        : id,
			name      : name,
			origin    : this.origin,
			timestamp : (new Date()).getTime(),
			payload   : message
		};

		var self = this;
		this._transaction(function() {
			var data = localStorage.getItem(INDEX_EMIT) || '[]';
			var delimiter = (data === '[]') ? '' : ',';
			data = [data.substring(0, data.length - 1), delimiter, JSON.stringify(packet), ']'].join('');
			localStorage.setItem(INDEX_EMIT, data);
			self.trigger(name, message);

			window.setTimeout(function() { self._cleanup_emit(); }, 50);
		});
	};

	Intercom.prototype.bind = function(object, options) {
		for (var i = 0; i < Intercom.bindings.length; i++) {
			var binding = Intercom.bindings[i].factory(object, options || null, this);
			if (binding) { this.bindings.push(binding); }
		}
	};

	Intercom.prototype.emit = function(name, message) {
		this._emit.apply(this, arguments);
		this._trigger('emit', name, message);
	};

	Intercom.prototype.once = function(key, fn, ttl) {
		if (!Intercom.supported) return;

		var self = this;
		this._transaction(function() {
			var data = JSON.parse(localStorage.getItem(INDEX_ONCE) || '{}');
			if (!self._once_expired(key, data)) return;

			data[key] = {};
			data[key].timestamp = (new Date()).getTime();
			if (typeof ttl === 'number') {
				data[key].ttl = ttl * 1000;
			}

			localStorage.setItem(INDEX_ONCE, JSON.stringify(data));
			fn();

			window.setTimeout(function() { self._cleanup_once(); }, 50);
		});
	};

	util.extend(Intercom.prototype, EventEmitter.prototype);

	Intercom.bindings = [];
	Intercom.supported = (typeof localStorage !== 'undefined');

	var INDEX_EMIT = 'intercom';
	var INDEX_ONCE = 'intercom_once';
	var INDEX_LOCK = 'intercom_lock';

	var THRESHOLD_TTL_EMIT = 50000;
	var THRESHOLD_TTL_ONCE = 1000 * 3600;

	Intercom.destroy = function() {
		localStorage.removeItem(INDEX_LOCK);
		localStorage.removeItem(INDEX_EMIT);
		localStorage.removeItem(INDEX_ONCE);
	};

	Intercom.getInstance = (function() {
		var intercom = null;
		return function() {
			if (!intercom) {
				intercom = new Intercom();
			}
			return intercom;
		};
	})();

	return Intercom;
})();

//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

/**
 * Featherlight - ultra slim jQuery lightbox
 * Version 1.3.4 - http://noelboss.github.io/featherlight/
 *
 * Copyright 2015, Noël Raoul Bossart (http://www.noelboss.com)
 * MIT Licensed.
**/
(function($) {
	"use strict";

	if('undefined' === typeof $) {
		if('console' in window){ window.console.info('Too much lightness, Featherlight needs jQuery.'); }
		return;
	}

	/* Featherlight is exported as $.featherlight.
	   It is a function used to open a featherlight lightbox.

	   [tech]
	   Featherlight uses prototype inheritance.
	   Each opened lightbox will have a corresponding object.
	   That object may have some attributes that override the
	   prototype's.
	   Extensions created with Featherlight.extend will have their
	   own prototype that inherits from Featherlight's prototype,
	   thus attributes can be overriden either at the object level,
	   or at the extension level.
	   To create callbacks that chain themselves instead of overriding,
	   use chainCallbacks.
	   For those familiar with CoffeeScript, this correspond to
	   Featherlight being a class and the Gallery being a class
	   extending Featherlight.
	   The chainCallbacks is used since we don't have access to
	   CoffeeScript's `super`.
	*/

	function Featherlight($content, config) {
		if(this instanceof Featherlight) {  /* called with new */
			this.id = Featherlight.id++;
			this.setup($content, config);
			this.chainCallbacks(Featherlight._callbackChain);
		} else {
			var fl = new Featherlight($content, config);
			fl.open();
			return fl;
		}
	}

	var opened = [],
		pruneOpened = function(remove) {
			opened = $.grep(opened, function(fl) {
				return fl !== remove && fl.$instance.closest('body').length > 0;
			} );
			return opened;
		};

	// structure({iframeMinHeight: 44, foo: 0}, 'iframe')
	//   #=> {min-height: 44}
	var structure = function(obj, prefix) {
		var result = {},
			regex = new RegExp('^' + prefix + '([A-Z])(.*)');
		for (var key in obj) {
			var match = key.match(regex);
			if (match) {
				var dasherized = (match[1] + match[2].replace(/([A-Z])/g, '-$1')).toLowerCase();
				result[dasherized] = obj[key];
			}
		}
		return result;
	};

	/* document wide key handler */
	var eventMap = { keyup: 'onKeyUp', resize: 'onResize' };

	var globalEventHandler = function(event) {
		$.each(Featherlight.opened().reverse(), function() {
			if (!event.isDefaultPrevented()) {
				if (false === this[eventMap[event.type]](event)) {
					event.preventDefault(); event.stopPropagation(); return false;
			  }
			}
		});
	};

	var toggleGlobalEvents = function(set) {
			if(set !== Featherlight._globalHandlerInstalled) {
				Featherlight._globalHandlerInstalled = set;
				var events = $.map(eventMap, function(_, name) { return name+'.'+Featherlight.prototype.namespace; } ).join(' ');
				$(window)[set ? 'on' : 'off'](events, globalEventHandler);
			}
		};

	Featherlight.prototype = {
		constructor: Featherlight,
		/*** defaults ***/
		/* extend featherlight with defaults and methods */
		namespace:    'chatstack-featherlight',         /* Name of the events and css class prefix */
		targetAttr:   'data-chatstack-featherlight',    /* Attribute of the triggered element that contains the selector to the lightbox content */
		variant:      null,                   /* Class that will be added to change look of the lightbox */
		resetCss:     false,                  /* Reset all css */
		background:   null,                   /* Custom DOM for the background, wrapper and the closebutton */
		openTrigger:  'click',                /* Event that triggers the lightbox */
		closeTrigger: 'click',                /* Event that triggers the closing of the lightbox */
		filter:       null,                   /* Selector to filter events. Think $(...).on('click', filter, eventHandler) */
		root:         'body',                 /* Where to append featherlights */
		openSpeed:    250,                    /* Duration of opening animation */
		closeSpeed:   250,                    /* Duration of closing animation */
		closeOnClick: 'background',           /* Close lightbox on click ('background', 'anywhere' or false) */
		closeOnEsc:   true,                   /* Close lightbox when pressing esc */
		closeIcon:    '&#10005;',             /* Close icon */
		loading:      '',                     /* Content to show while initial content is loading */
		persist:      false,									/* If set, the content persist and will be shown again when opened again. 'shared' is a special value when binding multiple elements for them to share the same content */
		otherClose:   null,                   /* Selector for alternate close buttons (e.g. "a.close") */
		beforeOpen:   $.noop,                 /* Called before open. can return false to prevent opening of lightbox. Gets event as parameter, this contains all data */
		beforeContent: $.noop,                /* Called when content is loaded. Gets event as parameter, this contains all data */
		beforeClose:  $.noop,                 /* Called before close. can return false to prevent opening of lightbox. Gets event as parameter, this contains all data */
		afterOpen:    $.noop,                 /* Called after open. Gets event as parameter, this contains all data */
		afterContent: $.noop,                 /* Called after content is ready and has been set. Gets event as parameter, this contains all data */
		afterClose:   $.noop,                 /* Called after close. Gets event as parameter, this contains all data */
		onKeyUp:      $.noop,                 /* Called on key down for the frontmost featherlight */
		onResize:     $.noop,                 /* Called after new content and when a window is resized */
		type:         null,                   /* Specify type of lightbox. If unset, it will check for the targetAttrs value. */
		contentFilters: ['jquery', 'image', 'html', 'ajax', 'iframe', 'text'], /* List of content filters to use to determine the content */

		/*** methods ***/
		/* setup iterates over a single instance of featherlight and prepares the background and binds the events */
		setup: function(target, config){
			/* all arguments are optional */
			if (typeof target === 'object' && target instanceof $ === false && !config) {
				config = target;
				target = undefined;
			}

			var self = $.extend(this, config, {target: target}),
				css = !self.resetCss ? self.namespace : self.namespace+'-reset', /* by adding -reset to the classname, we reset all the default css */
				$background = $(self.background || [
					'<div class="'+css+'-loading '+css+'">',
						'<div class="'+css+'-content">',
							'<span class="'+css+'-close-icon '+ self.namespace + '-close">',
								self.closeIcon,
							'</span>',
							'<div class="'+self.namespace+'-inner">' + self.loading + '</div>',
						'</div>',
					'</div>'].join('')),
				closeButtonSelector = '.'+self.namespace+'-close' + (self.otherClose ? ',' + self.otherClose : '');

			self.$instance = $background.clone().addClass(self.variant); /* clone DOM for the background, wrapper and the close button */

			/* close when click on background/anywhere/null or closebox */
			self.$instance.on(self.closeTrigger+'.'+self.namespace, function(event) {
				var $target = $(event.target);
				if( ('background' === self.closeOnClick  && $target.is('.'+self.namespace))
					|| 'anywhere' === self.closeOnClick
					|| $target.closest(closeButtonSelector).length ){
					event.preventDefault();
					self.close();
				}
			});

			return this;
		},

		/* this method prepares the content and converts it into a jQuery object or a promise */
		getContent: function(){
			if(this.persist !== false && this.$content) {
				return this.$content;
			}
			var self = this,
				filters = this.constructor.contentFilters,
				readTargetAttr = function(name){ return self.$currentTarget && self.$currentTarget.attr(name); },
				targetValue = readTargetAttr(self.targetAttr),
				data = self.target || targetValue || '';

			/* Find which filter applies */
			var filter = filters[self.type]; /* check explicit type like {type: 'image'} */

			/* check explicit type like data-featherlight="image" */
			if(!filter && data in filters) {
				filter = filters[data];
				data = self.target && targetValue;
			}
			data = data || readTargetAttr('href') || '';

			/* check explicity type & content like {image: 'photo.jpg'} */
			if(!filter) {
				for(var filterName in filters) {
					if(self[filterName]) {
						filter = filters[filterName];
						data = self[filterName];
					}
				}
			}

			/* otherwise it's implicit, run checks */
			if(!filter) {
				var target = data;
				data = null;
				$.each(self.contentFilters, function() {
					filter = filters[this];
					if(filter.test)  {
						data = filter.test(target);
					}
					if(!data && filter.regex && target.match && target.match(filter.regex)) {
						data = target;
					}
					return !data;
				});
				if(!data) {
					if('console' in window){ window.console.error('Featherlight: no content filter found ' + (target ? ' for "' + target + '"' : ' (no target specified)')); }
					return false;
				}
			}
			/* Process it */
			return filter.process.call(self, data);
		},

		/* sets the content of $instance to $content */
		setContent: function($content){
			var self = this;
			/* we need a special class for the iframe */
			if($content.is('iframe') || $('iframe', $content).length > 0){
				self.$instance.addClass(self.namespace+'-iframe');
			}

			self.$instance.removeClass(self.namespace+'-loading');

			/* replace content by appending to existing one before it is removed
			   this insures that featherlight-inner remain at the same relative
				 position to any other items added to featherlight-content */
			self.$instance.find('.'+self.namespace+'-inner')
				.not($content)                /* excluded new content, important if persisted */
				.slice(1).remove().end()			/* In the unexpected event where there are many inner elements, remove all but the first one */
				.replaceWith($.contains(self.$instance[0], $content[0]) ? '' : $content);

			self.$content = $content.addClass(self.namespace+'-inner');

			return self;
		},

		/* opens the lightbox. "this" contains $instance with the lightbox, and with the config.
			Returns a promise that is resolved after is successfully opened. */
		open: function(event){
			var self = this;
			self.$instance.hide().appendTo(self.root);
			if((!event || !event.isDefaultPrevented())
				&& self.beforeOpen(event) !== false) {

				if(event){
					event.preventDefault();
				}
				var $content = self.getContent();

				if($content) {
					opened.push(self);

					toggleGlobalEvents(true);

					self.$instance.fadeIn(self.openSpeed);
					self.beforeContent(event);

					/* Set content and show */
					return $.when($content)
						.always(function($content){
							self.setContent($content);
							self.afterContent(event);
						})
						.then(self.$instance.promise())
						/* Call afterOpen after fadeIn is done */
						.done(function(){ self.afterOpen(event); });
				}
			}
			self.$instance.detach();
			return $.Deferred().reject().promise();
		},

		/* closes the lightbox. "this" contains $instance with the lightbox, and with the config
			returns a promise, resolved after the lightbox is successfully closed. */
		close: function(event){
			var self = this,
				deferred = $.Deferred();

			if(self.beforeClose(event) === false) {
				deferred.reject();
			} else {

				if (0 === pruneOpened(self).length) {
					toggleGlobalEvents(false);
				}

				self.$instance.fadeOut(self.closeSpeed,function(){
					self.$instance.detach();
					self.afterClose(event);
					deferred.resolve();
				});
			}
			return deferred.promise();
		},

		/* Utility function to chain callbacks
		   [Warning: guru-level]
		   Used be extensions that want to let users specify callbacks but
		   also need themselves to use the callbacks.
		   The argument 'chain' has callback names as keys and function(super, event)
		   as values. That function is meant to call `super` at some point.
		*/
		chainCallbacks: function(chain) {
			for (var name in chain) {
				this[name] = $.proxy(chain[name], this, $.proxy(this[name], this));
			}
		}
	};

	$.extend(Featherlight, {
		id: 0,                                    /* Used to id single featherlight instances */
		autoBind:       '[data-chatstack-featherlight]',    /* Will automatically bind elements matching this selector. Clear or set before onReady */
		defaults:       Featherlight.prototype,   /* You can access and override all defaults using $.featherlight.defaults, which is just a synonym for $.featherlight.prototype */
		/* Contains the logic to determine content */
		contentFilters: {
			jquery: {
				regex: /^[#.]\w/,         /* Anything that starts with a class name or identifiers */
				test: function(elem)    { return elem instanceof $ && elem; },
				process: function(elem) { return this.persist !== false ? $(elem) : $(elem).clone(true); }
			},
			image: {
				regex: /\.(png|jpg|jpeg|gif|tiff|bmp|svg)(\?\S*)?$/i,
				process: function(url)  {
					var self = this,
						deferred = $.Deferred(),
						img = new Image(),
						$img = $('<img src="'+url+'" alt="" class="'+self.namespace+'-image" />');
					img.onload  = function() {
						/* Store naturalWidth & height for IE8 */
						$img.naturalWidth = img.width; $img.naturalHeight = img.height;
						deferred.resolve( $img );
					};
					img.onerror = function() { deferred.reject($img); };
					img.src = url;
					return deferred.promise();
				}
			},
			html: {
				regex: /^\s*<[\w!][^<]*>/, /* Anything that starts with some kind of valid tag */
				process: function(html) { return $(html); }
			},
			ajax: {
				regex: /./,            /* At this point, any content is assumed to be an URL */
				process: function(url)  {
					var self = this,
						deferred = $.Deferred();
					/* we are using load so one can specify a target with: url.html #targetelement */
					var $container = $('<div></div>').load(url, function(response, status){
						if ( status !== "error" ) {
							deferred.resolve($container.contents());
						}
						deferred.fail();
					});
					return deferred.promise();
				}
			},
			iframe: {
				process: function(url) {
					var deferred = new $.Deferred();
					var $content = $('<iframe/>')
						.hide()
						.attr('src', url)
						.css(structure(this, 'iframe'))
						.on('load', function() { deferred.resolve($content.show()); })
						// We can't move an <iframe> and avoid reloading it,
						// so let's put it in place ourselves right now:
						.appendTo(this.$instance.find('.' + this.namespace + '-content'));
					return deferred.promise();
				}
			},
			text: {
				process: function(text) { return $('<div>', {text: text}); }
			}
		},

		functionAttributes: ['beforeOpen', 'afterOpen', 'beforeContent', 'afterContent', 'beforeClose', 'afterClose'],

		/*** class methods ***/
		/* read element's attributes starting with data-featherlight- */
		readElementConfig: function(element, namespace) {
			var Klass = this,
				regexp = new RegExp('^data-' + namespace + '-(.*)'),
				config = {};
			if (element && element.attributes) {
				$.each(element.attributes, function(){
					var match = this.name.match(regexp);
					if (match) {
						var val = this.value,
							name = $.camelCase(match[1]);
						if ($.inArray(name, Klass.functionAttributes) >= 0) {  /* jshint -W054 */
							val = new Function(val);                           /* jshint +W054 */
						} else {
							try { val = $.parseJSON(val); }
							catch(e) {}
						}
						config[name] = val;
					}
				});
			}
			return config;
		},

		/* Used to create a Featherlight extension
		   [Warning: guru-level]
		   Creates the extension's prototype that in turn
		   inherits Featherlight's prototype.
		   Could be used to extend an extension too...
		   This is pretty high level wizardy, it comes pretty much straight
		   from CoffeeScript and won't teach you anything about Featherlight
		   as it's not really specific to this library.
		   My suggestion: move along and keep your sanity.
		*/
		extend: function(child, defaults) {
			/* Setup class hierarchy, adapted from CoffeeScript */
			var Ctor = function(){ this.constructor = child; };
			Ctor.prototype = this.prototype;
			child.prototype = new Ctor();
			child.__super__ = this.prototype;
			/* Copy class methods & attributes */
			$.extend(child, this, defaults);
			child.defaults = child.prototype;
			return child;
		},

		attach: function($source, $content, config) {
			var Klass = this;
			if (typeof $content === 'object' && $content instanceof $ === false && !config) {
				config = $content;
				$content = undefined;
			}
			/* make a copy */
			config = $.extend({}, config);

			/* Only for openTrigger and namespace... */
			var namespace = config.namespace || Klass.defaults.namespace,
				tempConfig = $.extend({}, Klass.defaults, Klass.readElementConfig($source[0], namespace), config),
				sharedPersist;

			$source.on(tempConfig.openTrigger+'.'+tempConfig.namespace, tempConfig.filter, function(event) {
				/* ... since we might as well compute the config on the actual target */
				var elemConfig = $.extend(
					{$source: $source, $currentTarget: $(this)},
					Klass.readElementConfig($source[0], tempConfig.namespace),
					Klass.readElementConfig(this, tempConfig.namespace),
					config);
				var fl = sharedPersist || $(this).data('featherlight-persisted') || new Klass($content, elemConfig);
				if(fl.persist === 'shared') {
					sharedPersist = fl;
				} else if(fl.persist !== false) {
					$(this).data('featherlight-persisted', fl);
				}
				elemConfig.$currentTarget.blur(); // Otherwise 'enter' key might trigger the dialog again
				fl.open(event);
			});
			return $source;
		},

		current: function() {
			var all = this.opened();
			return all[all.length - 1] || null;
		},

		opened: function() {
			var klass = this;
			pruneOpened();
			return $.grep(opened, function(fl) { return fl instanceof klass; } );
		},

		close: function() {
			var cur = this.current();
			if(cur) { return cur.close(); }
		},

		/* Does the auto binding on startup.
		   Meant only to be used by Featherlight and its extensions
		*/
		_onReady: function() {
			var Klass = this;
			if(Klass.autoBind){
				/* Bind existing elements */
				$(Klass.autoBind).each(function(){
					Klass.attach($(this));
				});
				/* If a click propagates to the document level, then we have an item that was added later on */
				$(document).on('click', Klass.autoBind, function(evt) {
					if (evt.isDefaultPrevented()) {
						return;
					}
					evt.preventDefault();
					/* Bind featherlight */
					Klass.attach($(evt.currentTarget));
					/* Click again; this time our binding will catch it */
					$(evt.target).click();
				});
			}
		},

		/* Featherlight uses the onKeyUp callback to intercept the escape key.
		   Private to Featherlight.
		*/
		_callbackChain: {
			onKeyUp: function(_super, event){
				if(27 === event.keyCode) {
					if (this.closeOnEsc) {
						this.$instance.find('.'+this.namespace+'-close:first').click();
					}
					return false;
				} else {
					return _super(event);
				}
			},

			onResize: function(_super, event){
				if (this.$content.naturalWidth) {
					var w = this.$content.naturalWidth, h = this.$content.naturalHeight;
					/* Reset apparent image size first so container grows */
					this.$content.css('width', '').css('height', '');
					/* Calculate the worst ratio so that dimensions fit */
					var ratio = Math.max(
						w  / parseInt(this.$content.parent().css('width'),10),
						h / parseInt(this.$content.parent().css('height'),10));
					/* Resize content */
					if (ratio > 1) {
						this.$content.css('width', '' + w / ratio + 'px').css('height', '' + h / ratio + 'px');
					}
				}
				return _super(event);
			},

			afterContent: function(_super, event){
				var r = _super(event);
				this.onResize(event);
				return r;
			}
		}
	});

	$.featherlight = Featherlight;

	/* bind jQuery elements to trigger featherlight */
	$.fn.featherlight = function($content, config) {
		return Featherlight.attach(this, $content, config);
	};

	/* bind featherlight on ready if config autoBind is set */
	$(document).ready(function(){ Featherlight._onReady(); });
}(jQuery));

/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
	// explicitly match decimal, hex, and named HTML entities 
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

/* jscs:disable disallowMultipleVarDecl */
if (typeof LiveHelpSettings !== 'undefined' && typeof Chatstack === 'undefined') {
  var Chatstack = LiveHelpSettings;
}
Chatstack._ = _.noConflict();
Chatstack.cookies = Cookies.noConflict();
Chatstack.iframe = function () {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};
Chatstack.events = jQuery({});

// Ready Events
if (Chatstack.e && Chatstack.e.length > 0) {
  for (var i = 0; i < Chatstack.e.length; i++) {
    Chatstack.e[i]();
  }
}

// Stardevelop Pty Ltd - Copyright 2003-2017 - chatstack.com
(function (window, document, prefix, config, _, $, undefined) {
  'use strict';
  /*global LiveHelpSettings:true, Chatstack:true, currentUser:true, buzz:true, CryptoJS:true */

  var protocol = ('https:' === document.location.protocol ? 'https://' : 'http://'), // jscs:ignore disallowYodaConditions
    directoryPath = '/livehelp/',
    apiPath = '/livehelp/',
    apiEndpoint = {
      home: 'index.php',
      settings: 'settings.php',
      visitor: 'visitor.php',
      offline: 'offline.php',
      security: 'security.php',
      image: 'image.php',
      chat: 'chat.php',
      call: 'call.php',
      signout: 'logout.php',
      messages: 'messages.php',
      send: 'send.php',
      email: 'email.php',
      rating: 'rate.php',
      feedback: 'feedback.php'
    },
    server = (typeof config !== 'undefined') ? config.server : document.location.host + document.location.pathname.substring(0, document.location.pathname.indexOf(directoryPath)),
    selector = '#' + prefix,
    language = navigator.language || navigator.userLanguage,
    opts = {
      protocol: protocol,
      server: protocol + server + directoryPath,
      domain: document.location.hostname.replace('www.', ''),
      department: '',
      template: 'default',
      sprite: true,
      locale: language.toLowerCase(),
      embedded: true,
      initiate: true,
      initiateDelay: 0,
      fonts: true,
      session: '',
      security: '',
      popup: false,
      visitorTracking: null,
      visitorRefresh: 15 * 1000,
      plugin: '',
      name: '',
      custom: '',
      email: '',
      connecting: false,
      connected: false,
      hideOffline: false,
      chatBubbles: false,
      messageBubbles: true,
      personalised: false,
      offline: false,
      accepted: false,
      promptPrechatDelay: 250,
      theme: 'green',
      feedback: false,
      feedbackDelay: -1,
      sidebar: false,
      hidden: false,
      cookie: { localStorage: false },
      disabled: false,
      operator: false
    },
    message = 0,
    messageSound,
    newMessages = 0,
    currentlyTyping = 0,
    title = '',
    titleTimer,
    operator = '',
    popup,
    popupPosition = { left: 0, top: 0 },
    size = '',
    initiateTimer,
    initiateStatus = '',
    initiateMargin = { left: 10, top: 10 },
    initiateSize = { width: 323, height: 229 },
    targetX,
    targetY,
    browserSize = { width: 0, height: 0 },
    visitorTimer,
    visitorTimeout = false,
    visitorInitialised = 0,
    loadTime = $.now(),
    pageTime,
    exists = (config.account !== undefined && config.account.length === 36),
    cookie = { name: (exists ? 'LiveHelp-' + config.account : prefix + 'Session') },
    cookies = { session: Chatstack.cookies.get(cookie.name) },
    settings = { user: 'Guest', departments: [], visitorTracking: true, locale: 'en', language: { copyright: 'Copyright &copy; ' +  new Date().getFullYear(), online: 'Online', offline: 'Offline', brb: 'Be Right Back', away: 'Away', contactus: 'Contact Us' } },
    storage = { store: false, data: { tabOpen: false, operatorDetailsOpen: false, soundEnabled: true, notificationEnabled: true, chatEnded: false, department: '', messages: 0, lastMessage: 0, feedbackOpen: true } },
    callTimer = '',
    callConnectedTimer,
    callStatus,
    plugins = {},
    websockets = false,
    tabs = [],
    master = true,
    signup = false,
    images = {},
    animationPrefix = 'chatstack-';

  function Storage() {
    this.store = $.initNamespaceStorage(prefix + 'Guest').localStorage;

    this.get = function (key) {
      return this.store.get(key);
    };
    this.set = function (key, value) {
      return this.store.set(key, value);
    };
    this.isSet = function (key) {
      return this.store.isSet(key);
    };
  }

  $.fn.extend({
    animateCss: function (animationName) {
      var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
      var deferred = $.Deferred();
      this.addClass('animated ' + animationName).one(animationEnd, function() {
        $(this).removeClass('animated ' + animationName);
        deferred.resolve();
      });
      return deferred.promise();
    }
  });

  // Initialise Storage
  storage.store = new Storage();

  if (Chatstack.cookie !== undefined && Chatstack.cookie.localStorage) {
    cookies.session = (storage.store.get(cookie.name) !== null) ? storage.store.get(cookie.name) : undefined;
  }

  // Date.now Shim
  if (!Date.now) {
    Date.now = function () { return new Date().getTime(); };
  }

  // Button Events
  $(document).on('click', '.' + prefix + 'Button', function () {
    openLiveHelp($(this), false, false, false, true);
    return false;
  });

  $(document).on('click', '.' + prefix + 'CallButton', function () {
    openLiveHelp($(this), '', apiEndpoint.call);
    return false;
  });

  $(document).on('click', '.' + prefix + 'OfflineButton', function () {
    openEmbeddedOffline();
    return false;
  });

  $.preloadImages = function () {
    for (var i = 0; i < arguments.length; i++) {
      $('<img>').attr('src', arguments[i]);
    }
  };

  // Javascript API Events
  function updateStatusMode(status) {
    var oldStatus = Chatstack.statusMode;
    Chatstack.statusMode = status;
    if (oldStatus !== status) {
      var data = { status: status };
      Chatstack.events.trigger('StatusModeChanged', data);
    }
  }

  function updateChatState(state, user) {
    var oldState = Chatstack.chatState;
    Chatstack.chatState = state;
    if (oldState !== state) {
      var data = { state: state };
      if (user) {
        data.user = user;
      }
      Chatstack.events.trigger('ChatStateChanged', data);
    }
  }

  function updateInitiateChatState(state, message, image) {
    var oldState = Chatstack.initiateChatState;
    Chatstack.initiateChatState = state;
    if (oldState !== state) {
      var data = { state: state };
      if (message) { data.message = message; }
      if (image) { data.image = image; }
      Chatstack.events.trigger('InitiateChatStateChanged', data);
    }
  }

  function overrideSettings() {
    // Update Settings
    if (typeof config !== 'undefined') {
      opts = $.extend(opts, config);
    }

    if (opts.cookie !== undefined && typeof opts.cookie.expires === 'number') {
      cookie.expires = opts.cookie.expires;
    }

    if (opts.account !== undefined && opts.account.length === 36) {
      $.each(apiEndpoint, function (key, value) {
        if (value.indexOf(opts.account) < 0) {
          if (value.indexOf('api/') > -1) {
            apiEndpoint[key] = value.replace('api/', 'api/' + opts.account + '/');
          } else {
            apiEndpoint[key] = opts.account + '/' + value;
          }
        }
      });
    }

    // Override Server
    if (opts.server.indexOf('http://') === -1 && opts.server.indexOf('https://') === -1) {
      opts.server = opts.protocol + opts.server;
    } else {
      opts.server = opts.protocol + server;
    }
  }

  // Override Settings
  overrideSettings();

  // Intercom Events
  var intercom = Intercom.getInstance(),
    unique = { origin: intercom.origin, timer: false, master: true, time: new Date().getTime() },
    index = _.sortedIndex(tabs, unique, 'time');

  function close(event) {
    intercom.emit('close', { origin: intercom.origin, master: master });
    opts.visitorTracking = false;
    return void 0;
  }

  if (typeof window !== 'undefined' && window !== null) {
    if (window.addEventListener) {
      window.addEventListener('beforeunload', close);
    } else if (window.attachEvent) {
      window.attachEvent('onbeforeunload', close);
    }
  }

  intercom.on('ready', function (data) {
    if (data.origin !== intercom.origin) {
      opts.visitorTracking = false;
      master = false;

      var tab = _.findWhere(tabs, { origin: data.origin });
      if (tab === undefined) {
        _.each(tabs, function (element, index, list) { element.master = false; });

        var element = { origin: data.origin, timer: false, master: true, time: data.time },
          index = _.sortedIndex(tabs, element, 'time');

        tabs.splice(index, 0, element);
      } else {
        if (tab.timer !== false) {
          window.clearTimeout(tab.timer);
          tab.timer = false;
        }
        tab.master = true;
      }
    }
  });

  function updateTab(data) {
    var tab = _.findWhere(tabs, { origin: data.origin });
    if (tab === undefined) {
      var element = { origin: data.origin, timer: false, master: data.master, time: data.time },
        index = _.sortedIndex(tabs, element, 'time');

      tabs.splice(index, 0, element);
    } else {
      if (tab.timer !== false) {
        window.clearTimeout(tab.timer);
        tab.timer = false;
      }
      tab.master = data.master;
      tab.time = data.time;
    }
  }

  intercom.on('ping', function (data) {
    if (data.origin !== intercom.origin) {
      updateTab(data);
      intercom.emit('pong', { origin: intercom.origin, master: master, time: unique.time });
    }
  });

  intercom.on('pong', function (data) {
    if (data.origin !== intercom.origin) {
      updateTab(data);
    }
  });

  intercom.on('master', function (data) {
    if (data.origin === intercom.origin) {
      var tab = _.findWhere(tabs, { origin: data.origin });
      if (tab !== undefined) {
        tab.master = true;
      }
      opts.visitorTracking = true;
      master = true;
    }
  });

  intercom.on('close', function (data) {
    if (data.origin !== intercom.origin) {
      tabs = _.reject(tabs, function (value) { return value.origin === data.origin; });

      if (tabs.length > 0) {
        if (data.master) {
          var available = _.where(tabs, { master: false }),
            tab = available[available.length - 1];

          if (tab !== undefined) {
            intercom.emit('master', { origin: tab.origin });
          }
        }
      }
    }
  });

  var ping = _.throttle(function () {

    // Ping
    if (master) {
      intercom.emit('ping', { origin: intercom.origin, master: master });
    }

    // Ping Timeouts
    $.each(tabs, function (key, data) {
      var tab = _.findWhere(tabs, { origin: data.origin });
      if (tab.timer === false && data.origin !== intercom.origin) {
        tab.timer = window.setTimeout(function () {
          tabs = _.reject(tabs, function (value) { return value.origin === data.origin; });
          tab.timer = false;
        }, 15000);
      }
    });

  }, 7500);

  tabs.splice(index, 0, unique);
  intercom.emit('ready', unique);

  (function send() {
    if (master) {
      ping();
    }

    var last = tabs[tabs.length - 1];
    if (unique.time < last.time && master === true) {
      opts.visitorTracking = false;
      master = false;
    }

    if (tabs.length === 1 && last.origin === unique.origin && !master) {
      opts.visitorTracking = true;
      master = true;
    }

    window.setTimeout(send, 7500);
  })();

  var updateSettingsSession = _.once(function (session) {
    cookies.session = session;
    if (opts.cookie.localStorage) {
      storage.store.set(cookie.name, session);
    } else {
      Chatstack.cookies.set(cookie.name, session, { domain: opts.domain, expires: cookie.expires });
    }
  });

  var storageEvent = _.once(function () {
    // Embedded Chat / Local Storage
    $(window).bind('storage', function (e) {
      loadStorage();
    });
  });

  // Setup Placeholder

  function updateSettings(success) {
    var data = { JSON: '' };

    // Cookies
    if (cookies.session !== undefined && cookies.session.length > 0) {
      data.SESSION = cookies.session;
    }

    // Override Language
    if (config !== undefined && config.locale !== undefined) {
      data.LANGUAGE = config.locale.toLowerCase();
    }

    // Override Template
    if (config !== undefined && config.template !== undefined) {
      data.TEMPLATE = config.template;
    }

    // Department
    if (opts.department !== undefined && opts.department.length > 0) {
      data.DEPARTMENT = opts.department;
    }

    $.ajax({
      url: opts.server + apiPath + apiEndpoint.settings,
      data: $.param(data),
      success: function (data, textStatus, jqXHR) {

        // Update Server Settings
        settings = data;

        if (!data.error && !opts.disabled) {
          // Connected
          opts.connected = settings.connected;

          // Popup
          if (opts.popup && !opts.connected && settings.status !== 'Offline' && !settings.loginDetails) {
            opts.connected = true;
          }

          // Javascript API
          if (opts.connected) {
            updateChatState('waiting');
          }
        }

        var embed = false;
        if (opts.embedded !== false) {
          if (data.html && data.html.length > 0) {
            settings.html = data.html;
            embed = $(settings.html).appendTo(document.body);
          }
          embed = $(selector + 'Embedded');

          // Storage Event
          storageEvent();
        }

        if (!data.error) {

          // Override Visitor Tracking
          opts.visitorTracking = (opts.visitorTracking != null && opts.visitorTracking === false) ? false : settings.visitor.enabled;
          opts.visitorRefresh = (settings.visitor.refresh !== undefined) ? settings.visitor.refresh * 1000 : 15 * 1000;

          // Feedback
          if (settings.status !== 'Online') {
            if (opts.feedbackDelay > 0) {
              checkFeedback();
            } else {
              var throttled = _.throttle(checkFeedback, 100);
              $(window).scroll(throttled);
            }
          }

          if (!opts.introduction) {
            opts.introduction = settings.introduction;
          }

          if (settings.initiate.delay > 0) {
            opts.initiateDelay = settings.initiate.delay * 1000;
          }

        }

        // Feedback
        if (opts.feedback && settings.status !== 'Online' && embed !== false && !storage.store.get('feedback')) {

          // Feedback UI
          embed.addClass('feedback');

          if (!opts.connected) {
            displayInitiateChat(true, true);
          }

          // Feedback Placeholder

        } // jscs:ignore disallowEmptyBlocks

        if (!data.error) {

          if (opts.embedded !== false) {

            if (data.error || (opts.feedback && data.status !== 'Online' && !storage.store.get('feedback'))) {
              setupChat();

              embed.addClass('signup-collapsed');
              if (typeof initSetup === 'function') {
                initSetup(embed, data);
              }

              if (!opts.connected) {
                setOffline('Offline');
              }

            } else {
              embed = $(selector + 'Embedded');
            }

          }

          // Status Mode Changed External Event
          if (Chatstack.statusChanged) {
            Chatstack.statusChanged(settings.status);
          }

          // Update Session
          var session = false;
          if (opts.popup && opts.session.length > 0) {
            session = opts.session;
          } else if (settings.session.length > 0) {
            session = settings.session;
          }
          updateSettingsSession(session);

          // Override Language
          if (opts.language !== undefined && !$.isEmptyObject(opts.language)) {
            settings.language = $.extend(settings.language, opts.language);
          }

          // Visitor Tracking
          if (plugins.websockets === undefined) {
            trackVisit();
          }

          // Override Sprite
          opts.sprite = (opts.template === 'default' && opts.sprite === false) ? true : opts.sprite;

          // Offline Email Redirection
          if (settings.offlineRedirect !== '') {
            if (/^(?:^[\-!#$%&'*+\\.\/0-9=?A-Z\^_`a-z{|}~]+@[\-!#$%&'*+\\\/0-9=?A-Z\^_`a-z{|}~]+\.[\-!#$%&'*+\\.\/0-9=?A-Z\^_`a-z{|}~]+$)$/i.test(settings.offlineRedirect)) {
              settings.offlineRedirect = 'mailto:' + settings.offlineRedirect;
            }
          }

          if (opts.personalised) {
            var op = settings.embeddedinitiate;
            if (op.id > 0) {
              // Operator Details
              showOperatorDetails(op.id, op.name, op.department, op.avatar);
            }
          }

          // Initiate Chat
          if (settings.initiate.enabled && !opts.connected) {
            if (opts.initiateDelay > 0) {
              displayInitiateChat(false);
            } else {
              displayInitiateChat(true);
            }
          }

          // Settings Updated
          $(document).trigger(prefix + '.SettingsUpdated', settings);

          // Smilies
          if (settings.smilies) {
            $(selector + 'SmiliesButton').show();
          } else {
            $(selector + 'SmiliesButton').hide();
          }

          // Update Window Size
          updateChatWindowSize();

          // Departments
          updateDepartments(settings.departments);

          // Callback
          if (success) {
            success();
          }

          // Login Details
          if (settings.user.length > 0) {
            $(selector + 'NameInput').val(settings.user);
          }
          if (settings.email !== false && settings.email.length > 0) {
            $(selector + 'EmailInput').val(settings.email);
          }
          if (settings.department.length > 0) {
            $(selector + 'DepartmentInput').val(settings.department);
          }
        }

      },
      error: function (xhr, ajaxOptions, thrownError) {
        if(xhr.status === 403) {
          // Session Authentication Error
          cookies.session = '';
          updateSettings();
        }
      },
      dataType: 'jsonp',
      cache: false,
      xhrFields: { withCredentials: true }
    });
  }

  function updateDepartments(departments) {
    var field = 'DepartmentInput',
      options = '',
      department = $(selector + field);

    if (departments === undefined && settings.departments !== undefined) {
      departments = settings.departments;
    }

    if (departments.length > 0) {
      // Remove Departments
      var existing = department.find('option');
      $.each(existing, function (key, value) {
        value = $(this).val();
        if (value.length > 0 && $.inArray(value, departments) < 0) {
          $(selector + field + ' option[value="' + value + '"]').remove();
        }
      });

      // Add Departments
      var total = 0,
        name = false;

      $.each(departments, function (index, value) {
        if (opts.departments === undefined || (opts.departments !== undefined && opts.departments.length > 0 && $.inArray(value, opts.departments) > -1)) {
          if (!department.find('option[value="' + value + '"]').length) {
            name = (settings.language.departments[value] !== undefined) ? settings.language.departments[value] : value;
            options += '<option value="' + value + '">' + name + '</option>';
          }
          total = total + 1;
        }
      });

      if (total > 0) {
        if (options.length > 0) {
          if (!department.find('option[value=""]').length) {
            options = '<option value=""></option>' + options;
          }
          department.append(options);
        }

        if (opts.department.length === 0) {
          $(selector + 'DepartmentLabel').show();
        }
      } else {
        $(selector + 'DepartmentLabel').hide();
      }

    } else {
      $(selector + 'DepartmentLabel').hide();
    }
  }

  /*
  function ignoreDrag(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    if (e.dataTransfer !== undefined) {
      e.dataTransfer.dropEffect = 'copy';
    }
    return false;
  }

  function acceptDrop(e) {
    ignoreDrag(e.originalEvent);
    var dt = e.originalEvent.dataTransfer,
      files = dt.files;

    if (dt.files.length > 0) {
      var file = dt.files[0];
    }
  }
  */

  // Update Window Size
  function updateChatWindowSize() {
    popupPosition.left = (window.screen.width - settings.popupSize.width) / 2;
    popupPosition.top = (window.screen.height - settings.popupSize.height) / 2;
    size = 'height=' + settings.popupSize.height + ',width=' + settings.popupSize.width + ',top=' + popupPosition.top + ',left=' + popupPosition.left + ',resizable=1,toolbar=0,menubar=0';
  }

  function showNotification() {
    if (storage.data.notificationEnabled) {
      if (newMessages > 0) {
        var text = (newMessages > 99) ? '...' : newMessages;
        $(selector + 'Notification span').text(text);
      }
      if (messageSound !== undefined && storage.data.soundEnabled && storage.data.notificationEnabled) {
        messageSound.play();
      }
    }
  }

  function updateStorage() {
    storage.store.set(prefix, storage.data);
  }

  function hideNotification() {
    if (newMessages > 0) {
      newMessages = 0;
    }
    updateStorage();
    $(selector + 'Notification').fadeOut(250);
  }

  function loadSprite() {
    $('<img />').load(function () {
      // Add CSS
      $('<link href="' + opts.server + directoryPath + 'templates/' + opts.template + '/styles/sprite.min.css" rel="stylesheet" type="text/css"/>').appendTo('head');
    }).attr('src', opts.server + directoryPath + 'images/Sprite.png');
  }

  var opening = false;

  function openTab(callback, override) {

    // Check Blocked Chat
    if (settings.blocked !== undefined && settings.blocked !== 0) {
      blockChat();
    }

    var embed = $(selector + 'Embedded');
    if ((embed.is('.closed') || embed.is('.hidden') || opts.popup) && opts.embedded === true) {

      // Load Sprites
      if (opts.sprite === true) {
        loadSprite();
      }

      // Setup Sounds
      if (messageSound === undefined) {
        messageSound = new buzz.sound(opts.server + directoryPath + 'sounds/New Message', {
          formats: ['ogg', 'mp3', 'wav'],
          volume: 100
        });
      }

      newMessages = 0;
      hideNotification();
      initDepartments();

      // Guest Details
      if (settings.loginDetails === 0 && !override) {
        if (settings.initiate.enabled && opts.connected === false) {
          initInitiateChat(true);
        } else {
          openInitiateChatTab();
          return;
        }
      } else {

        $(selector + 'InitiateChatBubble').fadeOut(150);

        var css = 'opened';
        var remove = 'closed';
        if (opts.disabled) {
          css += ' hidden';
        } else {
          embed.show();
          remove += ' hidden';
        }

        embed.removeClass(remove).addClass(css);
        resizeChatTab();

        css = 'show';
        if (opts.disabled) {
          css += ' hidden';
        }
        $('.' + prefix + 'MobileButton').removeClass('hide').addClass(css);
        $('body').addClass(prefix + 'Opened');

        storage.data.tabOpen = true;
        updateStorage();
      }

      $(selector + 'CloseButton').removeClass('expand').addClass('collapse');

      if (callback) {
        callback();
      }
    }
  }

  function closeTab(complete) {
    var embed = $(selector + 'Embedded'),
      height = embed.height() - 35;

    if (embed.is('.signup') || opts.popup) {
      return;
    }

    $(selector + 'SmiliesButton').close();
    if (embed.is('.opened')) {
      resizeChatTab();

      var style = (embed.is('.sidebar') || (!opts.popup && (opts.hidden || opts.disabled))) ? 'hidden' : 'closed';
      embed.removeClass('opened').addClass(style);
      $('body').removeClass(prefix + 'Opened');

      storage.data.tabOpen = false;
      updateStorage();
    }

    if (complete) {
      complete.call();
    }

    var show = true;
    if (embed.is('.offline') && opts.sidebar) {
      embed.addClass('hidden');

      // Embedded Offline Email
      initInitiateChat(false, settings.language.offlinemessagedescription);
    } else if (settings.status !== 'Online' && !opts.connected) {
      show = false;
    }
    if (opts.disabled || opts.hidden || embed.is('.feedback')) {
      show = false;
    }
    $('.' + prefix + 'MobileButton').removeClass((show) ? 'hidden' : 'show').addClass((show) ? 'show' : 'hidden');
    $(selector + 'CloseButton').removeClass('collapse').addClass('expand');

    // Embedded Initiate Chat
    if (embed.attr('data-opened')) {
      updateInitiateStatus('Declined');
    }
  }

  function hideOperatorDetails() {
    var body = $(selector + 'Body'),
      top = parseInt(body.css('top'), 10);

    if (top === 86) {
      body.animate({ top: 36 }, 500, 'swing', function () {
        $(selector + 'CollapseButton').removeClass('Collapse').addClass('Expand').attr('title', settings.language.expand);
      });
      $(selector + 'Embedded').addClass('no-op');
    }
    if (storage.data.operatorDetailsOpen) {
      storage.data.operatorDetailsOpen = false;
      updateStorage();
    }
  }

  var addBubbleStyles = _.once(function () {
    var bubblestyles = '';
    if (bubblestyles.length > 0) {
      var styles = '<style type="text/css">' + bubblestyles + '</style>';
      $(styles).appendTo(document.head);
    }
  });

  function operatorImage(id, name, department, avatarselector, hash, api) {
    var url = opts.server + apiPath + apiEndpoint.image,
      size = 120,
      query = { SIZE: size },
      image = url + '?' + $.param({ id: id, size: size, round: '' });

    var updateImage = function (id, name, department, image, api) {
      return function () {
        var key = CryptoJS.SHA1(id.toString()).toString();
        images[key] = image;
        $(avatarselector + ', ' + selector + 'Messages .avatar.' + key + ', ' + selector + 'InitiateChatBubble:not(.feedback) .operator.photo').css({ 'background-image': 'url("' + image + '")', 'background-repeat': 'no-repeat' });

        // Javascript API
        if (api) {
          var user = { id: id, name: name, department: department, image: image };
          updateChatState('connected', user);
        }
      };
    };

    if (hash.length > 0) {
      var gravatar = 'https://secure.gravatar.com/avatar/' + hash + '?s=' + size + '&r=g&d=404';
      $('<img />').one('error', updateImage(id, name, department, image, api)).one('load', updateImage(id, name, department, gravatar, api)).attr('src', gravatar);
    }
  }

  function showOperatorDetails(id, name, depmnt, hash, connected, api) {

    if (id !== undefined && name !== undefined && name.length > 0 && opts.connected && !$('.' + prefix + 'Operator').is(':visible')) {

      $(selector + 'Embedded').addClass('connected');
      $(selector + 'Typing span, ' + selector + 'TypingPopup span').text(name + ' ' + settings.language.istyping);

      if (!storage.data.operatorDetailsOpen) {
        storage.data.operatorDetailsOpen = true;
        updateStorage();
      }

      if (depmnt !== undefined && depmnt.length > 0) {
        var departments = depmnt.split(';');
        $.each(departments, function (key, value) {
          if ($.trim(value) === $.trim(opts.department)) {
            depmnt = $.trim(value);
            return;
          }
        });
      }

      var scroll = $(selector + 'Scroll'),
        department = (depmnt !== undefined) ? depmnt : storage.data.department;

      if (opts.chatBubbles) {

        $('.' + prefix + 'Operator').show();
        $(selector + 'StatusText').css('left', '70px');

        addBubbleStyles();

        // Operator Image
        operatorImage(id, name, depmnt, '.' + prefix + 'Operator .OperatorImage, ' + selector + 'Messages .InitiateChat .avatar', hash, true);

        $(selector + 'CollapseButton').hide();

        if (opts.colors !== undefined) {
          if (opts.chatBubbles !== false && opts.colors.image !== undefined && opts.colors.image.border !== undefined) {
            $(selector + 'Embedded').css('border', opts.colors.image.border);
          }
        }
      } else {

        if (opts.operator) {
          id = opts.operator.id;
          name = opts.operator.firstname;
          hash = opts.operator.hash;
        }

        // Operator Image
        operatorImage(id, name, depmnt, selector + 'OperatorImage, ' + selector + 'Messages .InitiateChat .avatar', hash, true);

        $(selector + 'OperatorName').text(name);
        if (connected !== undefined) {
          name = settings.language.chattingwith + ' ' + name;
        }
        $(selector + 'Messages .InitiateChat .name').text(name);
        $(selector + 'OperatorDepartment').text(department);
      }

      var top = parseInt($(selector + 'Body').css('top'), 10);
      if (top === 36) {
        $(selector + 'Body').animate({ top: 86 }, 500, 'swing', function () {
          $(selector + 'CollapseButton').removeClass('Expand').addClass('Collapse').attr('title', settings.language.collapse);
        });
      }
    }

  }

  function autoCollapseOperatorDetails() {
    var scroll = $(selector + 'Scroll'),
      body = $(selector + 'Body'),
      top = parseInt(body.css('top'), 10);

    if (top === 86) {
      if (scroll.get(0).scrollHeight > scroll.height()) {
        $(selector + 'CollapseButton').click();
      }
    }
  }

  function toggleSound() {
    var css = (storage.data.soundEnabled) ? 'SoundOn' : 'SoundOff',
      button = $(selector + 'SoundToolbarButton');

    if (button.length > 0) {
      button.removeClass('SoundOn SoundOff').addClass(css);
    }
  }

  var initialiseTab = _.once(function () {
    var embed = $(selector + 'Embedded');
    if (embed.length && (embed.is('.signup') || opts.popup) && (settings.status === 'Online' || opts.connected)) {
      openTab(false, false);
      return;
    }

    if (storage.data !== undefined && storage.data.tabOpen !== undefined && storage.data.tabOpen === true && (settings.status === 'Online' || opts.connected)) {
      openTab(false, false);
    } else {
      closeTab();
    }
  });

  function loadStorage() {
    var data = storage.store.get(prefix),
      embedded = $(selector + 'Embedded'),
      initiate = $(selector + 'InitiateChatBubble').is(':visible');

    if (data !== undefined) {
      storage.data = data;
      if (embedded.length > 0 && !initiate && opts.connected || opts.popup) {
        initialiseTab();
      }
      if (storage.data.soundEnabled !== undefined) {
        toggleSound();
      } else {
        storage.data.soundEnabled = true;
      }
      if (!opts.connected) {
        if (storage.data.operatorDetailsOpen !== undefined && storage.data.operatorDetailsOpen) {
          showOperatorDetails();
        } else {
          hideOperatorDetails();
        }
      }
    } else {
      if (embedded.length > 0) {
        initialiseTab();
      }
    }
  }

  var clickImage = function (id) {
    return function (eventObject) {
      $('.flex[data-id=' + id + '] .fancybox').click();
    };
  };

  function scrollBottom() {
    var scroll = $(selector + 'Scroll');
    if (scroll) {
      scroll.scrollTo($(selector + 'MessagesEnd'));
    }
  }

  var displayImage = function (id) {
    return function (eventObject) {
      var output = '',
        width = $(selector + 'Messages').width(),
        displayWidth = width - 50,
        margin = [25, 25, 25, 25];

      if (this.width > displayWidth) {
        var aspect = displayWidth / this.width,
          displayHeight = this.height * aspect;
        output = '<div class="' + prefix + 'Image" style="position:relative; max-width:' + this.width + 'px; max-height:' + this.height + 'px; height:' + displayHeight + 'px; min-width:' + (displayWidth + 8) + 'px; margin:5px"><div class="' + prefix + 'ImageZoom" style="position:absolute; opacity:0.5; top:0px; z-index:150; background:url(' + opts.server + directoryPath + 'images/Magnify.png) center center no-repeat; max-width:' + this.width + 'px; max-height:' + this.height + 'px; width:' + displayWidth + 'px; height:' + displayHeight + 'px"></div><div class="' + prefix + 'ImageHover" style="position:absolute; top:0px; z-index:100; background:#fff; opacity:0.25; max-width:' + this.width + 'px; max-height:' + this.height + 'px; width:' + displayWidth + 'px; height:' + displayHeight + 'px"></div><div style="position:absolute; top:0px;"><a href="' + this.src + '" class="fancybox"><img src="' + this.src + '" alt="Received Image" style="width:' + displayWidth + 'px; max-width:' + this.width + 'px; max-height:' + this.height + 'px"></a></div>';
      } else {
        output = '<img src="' + this.src + '" alt="Received Image" style="max-width:' + this.width + 'px; margin:5px">';
      }
      $('.flex[data-id=' + id + '] .message').append(output);
      output = '';
      scrollBottom();
      if (!opts.popup) {
        margin = [25, 405, 25, 25];
      }
      $('.flex[data-id=' + id + '] .fancybox').fancybox({ openEffect: 'elastic', openEasing: 'swing', closeEffect: 'elastic', closeEasing: 'swing', margin: margin });
      $('.' + prefix + 'ImageZoom').hover(function () {
        $('.' + prefix + 'ImageHover').fadeTo(250, 0);
        $(this).fadeTo(250, 1.0);
      }, function () {
        $('.' + prefix + 'ImageHover').fadeTo(250, 0.25);
        $(this).fadeTo(250, 0.75);
      });
      $('.flex[data-id=' + id + '] .' + prefix + 'ImageZoom').click(clickImage(id));
      if (messageSound !== undefined && storage.data.soundEnabled && storage.data.notificationEnabled) {
        messageSound.play();
      }
      window.focus();
    };
  };

  function htmlSmilies(message) {

    function replaceSmilie(subject, smilie) {
      if (subject.match(smilie.regex)) {
        return replaceSmilie(subject.replace(smilie.regex, ' <span title="' + smilie.css + '" class="sprite ' + smilie.css + ' Small Smilie"></span> '), smilie);
      } else {
        return subject;
      }
    }

    if (settings.smilies) {
      var smilies = [
          { regex: /^<p>:D<\/p>$|^<p>:D | :D | :D<\/p>$/g, css: 'Laugh' },
          { regex: /^<p>:\)<\/p>$|^<p>:\) | :\) | :\)<\/p>$/g, css: 'Smile' },
          { regex: /^<p>:\(<\/p>$|^<p>:\( | :\( | :\(<\/p>$/g, css: 'Sad' },
          { regex: /^<p>\$\)<\/p>$|^<p>\$\) | \$\) | \$\)<\/p>$/g, css: 'Money' },
          { regex: /^<p>&gt;:O<\/p>$|^<p>&gt;:O |^>:O | &gt;:O | >:O | &gt;:O$| >:O<\/p>$/g, css: 'Angry' },
          { regex: /^<p>:P<\/p>$|^<p>:P | :P | :P<\/p>$/g, css: 'Impish' },
          { regex: /^<p>:\\<\/p>$|^<p>:\\ | :\\ | :\\<\/p>$/g, css: 'Sweat' },
          { regex: /^<p>8\)<\/p>$|^<p>8\) | 8\) | 8\)<\/p>$/g, css: 'Cool' },
          { regex: /^<p>&gt;:L<\/p>$|^<p>&gt;:L |^>:L | &gt;:L | >:L | &gt;:L$| >:L<\/p>$/g, css: 'Frown' },
          { regex: /^<p>;\)<\/p>$|^<p>;\) | ;\) | ;\)<\/p>$/g, css: 'Wink' },
          { regex: /^<p>:O<\/p>$|^<p>:O | :O | :O<\/p>$/g, css: 'Surprise' },
          { regex: /^<p>8-\)<\/p>$|^<p>8-\) | 8-\) | 8-\)<\/p>$/g, css: 'Woo' },
          { regex: /^<p>8-O<\/p>$|^<p>8-O | 8-O | 8-O<\/p>$/g, css: 'Shock' },
          { regex: /^<p>xD<\/p>$|^<p>xD | xD | xD<\/p>$/g, css: 'Hysterical' },
          { regex: /^<p>:-\*<\/p>$|^<p>:-\* | :-\* | :-\*<\/p>$/g, css: 'Kissed' },
          { regex: /^<p>:S<\/p>$|^<p>:S | :S | :S<\/p>$/g, css: 'Dizzy' },
          { regex: /^<p>\+O\)<\/p>$|^<p>\+O\) | \+O\) | \+O\)<\/p>$/g, css: 'Celebrate' },
          { regex: /^<p>&lt;3<\/p>$|^<p><3$|^&lt;3|^<3 | &lt;3|<3 | &lt;3<\/p>$| <3$/g, css: 'Adore' },
          { regex: /^<p>zzZ<\/p>$|^<p>zzZ | zzZ | zzZ<\/p>$/g, css: 'Sleep' },
          { regex: /^<p>:X<\/p>$|^<p>:X | :X | :X<\/p>$/g, css: 'Stop' },
          { regex: /^<p>X-\(<\/p>$|^<p>X-\( | X-\( | X-\(<\/p>$/g, css: 'Tired' }
        ];

      for (var i = 0; i < smilies.length; i++) {
        var smilie = smilies[i];
        message = $.trim(message);
        message = replaceSmilie(message, smilie);
      }
    }
    return $.trim(message);
  }

  function openPUSH(message) {
    if (opts.embedded) {
      var body = $('body'),
        inner = $('.chatstack-featherlight-inner');

      if (exists.length) {
        exists.attr('src', message);
      } else {
        $.featherlight(body, {
          iframe: message,
          iframeMaxWidth: 'calc(95% - 300px)',
          iframeWidth: '100%',
          iframeHeight: '100%',
          onResize: function () {
            $('.chatstack-featherlight-inner').css('height', $('.chatstack-featherlight-content').height());
          },
          beforeOpen: function () {
            body.css('overflow', 'hidden');
          },
          beforeClose: function () {
            body.css('overflow', 'auto');
          }
        });
      }
    } else {
      var parent = window.opener;
      if (parent) {
        parent.location.href = message;
        parent.focus();
      }
    }
  }

  function replaceMessageContent(content) {

    // Email and Links
    content = content.replace(/([a-z0-9][a-z0-9_\.\-]{0,}[a-z0-9]@[a-z0-9][a-z0-9_\.\-]{0,}[a-z0-9][\.][a-z0-9]{2,4})/g, '<a href="mailto:$1" class="message-email">$1</a>');
    content = content.replace(/((?:(?:http(?:s?))|(?:ftp)):\/\/[^\s|<|>|'|\"]*)/g, '<a href="$1" target="_blank" class="message-link">$1</a>');

    // Markdown Renderer
    var renderer = new marked.Renderer();
    renderer.list = function(body, ordered) {
      return body;
    };
    renderer.listitem = function(text) {
      return text;
    };

    // Markdown
    marked.setOptions({
      renderer: renderer,
      gfm: false,
      tables: false,
      smartLists: false
    });
    content = marked(content);

    // Smilies
    if (settings.smilies) {
      content = htmlSmilies(content);
    }

    return content;
  }

  var consecutive = false;

  function display(message) {
    var output = '',
      messages = $(selector + 'Messages'),
      content = false,
      exists = false,
      datetime = message.datetime;

    var name = message.username;
    if (message.firstname !== undefined && message.firstname.length > 0) {
      name = message.firstname;
    }

    if (!isNaN(parseInt(message.id, 10)) && $('.flex[data-id=' + message.id + ']').length > 0) {
      exists = true;
    } else {
      $(document).trigger(prefix + '.message.contentRead', { message: message.id });
    }

    if (messages && message.content !== null && !storage.data.chatEnded && !exists) {
      var alignment = 'left',
        color = '#000',
        rtl = '';

      if (message.id === -1 && opts.initiate) {
        initInitiateChat(false, message.content);
        return false;
      } else if (message.id === -2) {
        $(selector + 'Waiting, ' + selector + 'Connecting').fadeOut(250);
        if (storage.data.operatorDetailsOpen !== undefined && storage.data.operatorDetailsOpen) {
          showOperatorDetails();
        }
        if (queued !== undefined && queued.length > 0 && settings.loginDetails !== 0) {
          sendMessage(queued[0]);
          queued = [];
        }
        return false;
      }

      if (message.align === 2) {
        alignment = 'center';
      } else if (message.align === 3) {
        alignment = 'right';
      }
      if (message.status === 0) {
        color = '#666';
      }
      if (!storage.data.chatEnded && !opts.chatBubbles) {
        $(selector + 'CollapseButton').fadeIn(250);
      }

      if (settings.rtl === true) {
        rtl = '; text-align: right';
      }

      if (datetime === undefined) {
        datetime = message.id;
      }

      var style = 'message',
        flex = 'flex',
        margin = 15,
        avatar = '',
        avatarstyle = '';

      if (message.id < -1) {
        flex += ' left none';
      }

      if (opts.messageBubbles && message.id >= -1) {
        style = 'message bubble ';
        margin = 0;
        color = '#000';
        if (message.status === 1 || message.status === 2 || message.status === 3 || message.status === 7 || message.status === 8) {
          style += 'left';
          flex += ' left';
        } else {
          style += 'right';
          flex += ' right';
        }

        if (message.from && !consecutive) {
          var key = CryptoJS.SHA1(message.from.toString()).toString();
          if (images[key]) {
            avatar = 'background-image: url(' + images[key] + ')';
          }
          avatarstyle = ' ' + key;
        } else {
          style += ' noarrow';
        }

      }

      var operatorname = '';
      if (message.id >= -1 && message.status > 0 && message.status !== 5) {
        if (!consecutive) {
          flex += ' grouped';
          operatorname = '<div class="name">' + name + '</div>';
        }
        consecutive = true;
      } else {
        consecutive = false;
      }

      var hash = '';
      if (message.status === 8) {
        style += ' joined';
        hash = message.hash;
      }

      output += '<div class="' + flex + '" data-id="' + message.id + '" data-datetime="' + datetime + '"><div class="avatar' + avatarstyle + '" style="' + avatar + '"></div>' + operatorname + '<div class="' + style + '" data-hash="' + hash + '" style="color:' + color + rtl + '">';
      if (message.status === 0 || message.status === 1 || message.status === 2 || message.status === 7 || message.status === 8) { // Operator, Link, Mobile Device Messages, Operator Joined

        if ($(selector + 'Messages .message.joined[data-hash="' + hash + '"]').length) {
          return '';
        }

        if (name !== undefined && typeof name === 'string' && name.length > 0) {
          if (!opts.messageBubbles) {
            output += name + ' ' + settings.language.says + ':<br/>';
          }

          if (message.status > 0) {
            operator = name;
          }
        }

        // Check RTL Language
        if (alignment === 'left' && settings.rtl === true) {
          alignment = 'right';
        }

        content = replaceMessageContent(message.content);

        var regEx = /^.*((youtu.be\/)|(v\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/i,
        match = regEx.exec(content),
        width = messages.width();
        if (match !== null && match.length > 6) {
          var videoid = match[6];
          alignment = 'left';
          if (message.status === 2) {
            var size = { width: 260, height: 195 },
            css = 'message-video fancybox.iframe',
            path = 'embed/',
            target = 'self';
            if (opts.popup) {
              size = { width: 480, height: 360 };
              css = 'message-video-popup';
              path = 'watch?v=';
              target = 'blank';
            }
            content = '<a href="http://www.youtube.com/' + path + videoid + '" target="_' + target + '" class="' + css + '"><div style="position:relative; height:' + size.height + 'px; margin:5px; color: ' + color + '"><div class="' + prefix + 'VideoZoom noresize" style="position:absolute; opacity:0.5; top:0px; z-index:150; background:url(' + opts.server + directoryPath + 'images/Play.png) center center no-repeat; max-width:' + size.width + 'px; width:' + size.width + 'px; height:' + size.height + 'px"></div><div class="' + prefix + 'VideoHover noresize" style="position:absolute; top:0px; z-index:100; background:#fff; opacity:0.25; max-width:' + size.width + 'px; width:' + size.width + 'px; height:' + size.height + 'px"></div><div style="position:absolute; top:0px;"><img src="http://img.youtube.com/vi/' + videoid + '/0.jpg" alt="YouTube Video" class="noresize" style="width:' + size.width + 'px; max-width:' + width + 'px"></div></div></a>';
          } else {
            content = content.replace(/((?:(?:http(?:s?))|(?:ftp)):\/\/[^\s|<|>|'|\"]*)/g, '<a href="$1" target="_blank" class="message-link fancybox.iframe">$1</a>');
            content = htmlSmilies(content);
            content = '<div style="text-align: ' + alignment + '; margin-left: ' + margin + 'px; color: ' + color + '">' + content + '</div>';
          }
          output += content;
        } else {
          output += '<div style="text-align: ' + alignment + '; margin-left: ' + margin + 'px; color: ' + color + '">' + content + '</div>';
        }
      } else if (message.status === 3) { // Image
        content = message.content.replace(/((?:(?:http(?:s?))):\/\/[^\s|<|>|'|\"]*)/g, '<img src="$1" alt="Received Image">');
        var result = content.match(/((?:(?:http(?:s?))):\/\/[^\s|<|>|'|"]*)/g);
        if (result !== null) {
          if (name !== '') {
            output += name + ' ' + settings.language.says + ':<br/>';
          }
          $('<img />').load(displayImage(message.id)).attr('src', result);
        } else {
          output += content;
        }
      } else if (message.status === 4) { // PUSH
        openPUSH(message.content);
        output += '<div style="margin-top:5px">' + settings.language.pushedurl + ', <a href="' + message.content + '" target="_blank" class="message">' + message.content + '</a> ' + settings.language.opennewwindow + '</div>';
      } else if (message.status === 5) { // JavaScript
        /*jshint -W054 */
        try {
          (new Function(message.content))(message);
        } catch (e) {
          console.log('JavaScript Command Error: ' + e);
          console.log(message.content);
        }
        output = '';

      } else if (message.status === 6) { // File Transfer
        output += settings.language.sentfile + ' <a href="' + message.content + '" target="' + prefix + 'FileDownload">' + settings.language.startdownloading + '</a> ' + settings.language.rightclicksave;
      }

      if (output.length) {
        output += '</div></div>';
      }

      $(selector + 'Waiting, ' + selector + 'Connecting').fadeOut(250);

      if (settings.offlineEmail && $(selector + 'Continue').length > 0) {
        $(selector + 'Continue').hide();
      }
    }
    return output;
  }

  function showTitleNotification() {
    var state = false;

    function updateTitle() {
      var newTitle = state ? title : operator + ' messaged you';
      $(document).attr('title', newTitle);
      state = !state;
    }

    if (titleTimer === null) {
      titleTimer = window.setInterval(updateTitle, 2000);
    }
  }

  function hideTitleNotification() {
    window.clearInterval(titleTimer);
    titleTimer = null;
    if (title.length > 0) {
      $(document).attr('title', title);
    }
  }

  function updateTypingStatus(data) {
    var typing = (data.typing !== undefined) ? data.typing : false,
      obj = $(selector + 'Typing, ' + selector + 'TypingPopup');
    if (typing) {
      obj.show();
    } else {
      obj.hide();
    }
  }

  var messagesInitalised = false;

  function outputMessages(messages) {

    // Output Messages
    var html = '',
      lastMessage = false,
      margin = [25, 25, 25, 25];

    $.each(messages, function (index, message) {
      var content = display(message);
      if (content) {
        html += content;
      }

      lastMessage = message;
      if (message.status > 0) {
        newMessages++;
      }
    });

    if (html.length > 0) {
      if (!storage.data.chatEnded && !opts.chatBubbles) {
        $(selector + 'CollapseButton').fadeIn(250);
      }
      $(selector + 'Messages').append(html);

      // Select Last
      var last = selector + 'Messages .flex.left.grouped';
      $(last + '.last').removeClass('last');
      $(last + ':last').addClass('last');

      // Sort Messages
      $(selector + 'Messages .flex:not(.initiate), ' + selector + 'Messages ' + selector + 'Continue').sort(function (a, b) {
        a = parseInt($(a).data('datetime'), 10);
        b = parseInt($(b).data('datetime'), 10);
        return (a < b) ? -1 : (a > b) ? 1 : 0;
      }).appendTo(selector + 'Messages');

      autoCollapseOperatorDetails();

      if (!opts.popup) {
        margin = [25, 405, 25, 25];
      }

      $('.message-link, .message-video').fancybox({ openEffect: 'elastic', openEasing: 'swing', closeEffect: 'elastic', closeEasing: 'swing', margin: margin });
      $('.' + prefix + 'VideoZoom').hover(function () {
        $('.' + prefix + 'VideoHover').fadeTo(250, 0);
        $(this).fadeTo(250, 1.0);
      }, function () {
        $('.' + prefix + 'VideoHover').fadeTo(250, 0.25);
        $(this).fadeTo(250, 0.75);
      });

      scrollBottom();

      if (!window.isActive && message > 0) {
        showTitleNotification();
      }

      if (lastMessage !== false && lastMessage.id > storage.data.lastMessage) {
        if (!storage.data.chatEnded && $(selector + 'Embedded').is('.closed')) {
          if (newMessages > 0) {
            showNotification();
          }
        } else {
          newMessages = 0;
          if (messageSound !== undefined && !storage.data.chatEnded && storage.data.soundEnabled && (opts.popup || storage.data.notificationEnabled)) {
            messageSound.play();
          }
        }
      }
    }

    if (lastMessage !== false) {
      if (lastMessage.id > 0) {
        message = lastMessage.id;
      }

      // Show Last Message Alert
      var closed = $(selector + 'Embedded.closed').length;
      if (lastMessage.status > 0 && lastMessage.status !== 4 && lastMessage.status !== 5) {
        showMessageAlert(lastMessage.content);
      }

      // Store Last Message
      if (lastMessage.id > storage.data.lastMessage) {
        storage.data.lastMessage = lastMessage.id;
        updateStorage();
      }
    }
  }

  function updateMessages() {

    if (storage.data.chatEnded) {
      window.setTimeout(updateMessages, 1500);
      return;
    }

    if (opts.connected && settings.language !== undefined) {
      var data = { TIME: $.now(), LANGUAGE: settings.locale, MESSAGE: message };

      if (currentlyTyping === 1) {
        data.TYPING = currentlyTyping;
      }

      // Cookies
      if (cookies.session !== undefined && cookies.session.length > 0) {
        data = $.extend(data, { SESSION: cookies.session });

        if (messagesInitalised === false) {
          $(document).trigger(prefix + '.UpdatingMessages', settings);
        }

      }

      $.jsonp({ url: opts.server + apiPath + apiEndpoint.messages + '?callback=?',
        data: $.param(data),
        success: function (data) {
          messagesInitalised = true;
          if (data !== null && data !== '') {
            if (data.messages !== undefined && data.messages.length > 0 && $(selector + 'Messages').length) {
              outputMessages(data.messages);
            }
            updateTypingStatus(data);
          } else {
            updateTypingStatus(false);
          }

          if (websockets === false) {
            window.setTimeout(updateMessages, 1500);
          }
        },
        error: function () {
          if (websockets === false) {
            window.setTimeout(updateMessages, 1500);
          }
        }
      });

      if (promptEmail) {
        promptEmail();
      }

    } else {
      if (messagesInitalised === false && websockets === false) {
        window.setTimeout(updateMessages, 1500);
      }
    }
  }

  // Update Messages
  updateMessages();

  function showSignedIn() {
    var embed = $(selector + 'Embedded');

    $(selector + 'SignIn').hide();
    $(selector + 'SignedIn').show();
    if (!$(selector + 'Messages .flex[data-id=-2]').length) {
      $(selector + 'Waiting').show();
    }
    $(selector + 'Body, ' + selector + 'Background').css('background-color', '#fff');
    $(selector + 'Input').animate({ bottom: 0 }, 500);

    if (embed.is(':hidden')) {
      $(selector + 'Waiting, ' + selector + 'Connecting').hide();
      embed.fadeIn(50);
      loadStorage();
    }
  }

  function showChat() {
    if (!storage.data.chatEnded) {

      // Connecting
      if (opts.connected) {
        showConnecting();
      }

      if ($(selector + 'SignIn').is(':visible')) {
        // Load Sprites
        if (opts.sprite === true) {
          $('<img />').load(function () {
            // Add CSS
            $('<link href="' + opts.server + directoryPath + 'templates/' + opts.template + '/styles/sprite.min.css" rel="stylesheet" type="text/css"/>').appendTo('head');

            // Connecting
            showSignedIn();

          }).attr('src', opts.server + directoryPath + 'images/Sprite.png');
        } else {
          showSignedIn();
        }
      } else {
        var embedded = $(selector + 'Embedded'),
          opened = storage.data.tabOpen,
          newState = (opened) ? 'opened' : 'closed',
          oldState = (opened) ? 'closed hidden' : 'opened';

        if (!opts.popup && ((opts.hidden && newState === 'closed') || opts.disabled)) {
          newState = 'hidden';
        }

        if (opts.disabled) {
          oldState = oldState.replace(' hidden', '');
        }

        if (opts.popup && (settings.status === 'Online' || opts.connected)) {
          oldState = 'closed';
          newState = 'opened';
        }

        embedded.removeClass(oldState).addClass(newState).show().attr('data-opened', ((opened) ? true : false));
        storage.data.tabOpen = ((opened) ? true : false);
        updateStorage();
      }
    }
  }

  function showRating() {
    var id = 'Rating',
      element = '#' + prefix + id,
      rating = [{ css: 'good', title: 'Good', rating: 3 }, { css: 'poor', title: 'Poor', rating: 1 }];

    if ($(element).length === 0) {

      rating.sort(function () { return (Math.round(Math.random()) - 0.5); });

      /*jshint multistr: true */
      var ratingHtml = '<div id="' + prefix + 'Feedback' + id + '">' + settings.language.rateyourexperience + ':<br/> \
    <div id="' + prefix + id + '" class="rating-container"> \
      <div class="rating ' + rating[0].css + '" title="' + rating[0].title + '" data-rating="' + rating[0].rating + '"></div> \
      <div class="rating neutral" title="Neutral" data-rating="2"></div> \
      <div class="rating ' + rating[1].css + '" title="' + rating[1].title + '" data-rating="' + rating[1].rating + '"></div> \
    </div> \
  </div>';

      $(selector + 'MessagesEnd').prepend(ratingHtml);

      // Rating Events
      rating = $(element);
      rating.find('.rating').click(function () {
        var element = $(this),
          score = $(this).attr('data-rating'),
          data = { RATING: score };

        element.parent().find('.rating[data-rating!=" + score + "]').addClass('deselected');
        element.removeClass('deselected');

        if (cookies.session !== undefined && cookies.session.length > 0) {
          data = $.extend(data, { SESSION: cookies.session });
        }
        $.ajax({ url: opts.server + apiPath + apiEndpoint.rating, data: $.param(data), dataType: 'jsonp', cache: false, xhrFields: { withCredentials: true } });
      });

      scrollBottom();
    } else {
      var ratingElem = $(selector + 'FeedbackRating');
      if (ratingElem.is(':visible')) {
        ratingElem.hide();
      } else {
        ratingElem.show();
        $(selector + 'Scroll').scrollTo(ratingElem);
      }
    }
  }

  function updateImageTitle() {
    $('.' + prefix + 'Status').each(function () {

      // Title / Alt Attributes
      var status = settings.status;
      if (status === 'BRB') {
        status = 'Be Right Back';
      }
      $(this).attr('title', 'Live Chat - ' + status).attr('alt', 'Live Chat - ' + status);
    });
  }

  function resizeChatTab() {
    // Adjust Styles
    var embed = $(selector + 'Embedded'),
      text = $(selector + 'StatusText'),
      close = $(selector + 'CloseButton'),
      tab = $(selector + 'Tab'),
      width = text.position().left + text.width() + close.width() + 30;

    if (embed.is('.closed') && text.width() > 0) {
      tab.css('width', width + 2 + 'px');
      embed.css('width', width + 'px');
    } else {
      tab.css('width', '100%');
    }
  }

  function updateStatusText(status, embed) {
    var indicator = $('.' + prefix + 'StatusIndicator');
    if (embed === undefined) {
      embed = $(selector + 'Embedded');
    }

    status = localeStatusMode(status);
    embed.find(selector + 'StatusText').text(status);
    if (embed.is('.closed') || embed.is('.hidden')) {
      resizeChatTab();
    }

    if (status === settings.language.online && opts.personalised) {
      var op = settings.embeddedinitiate;
      if (op.id > 0) {
        showOperatorDetails(op.id, op.name, op.department, op.avatar);

        //status = settings.language.chatwith + ' ' + op.name.substring(0, op.name.indexOf(' '));
        //embed.find(selector + 'StatusText').text(status);
        // Disable Status Indicator
        //indicator.show();
        return;
      }
    } else if (status === settings.language.offline || status === settings.language.contactus) {
      indicator.hide();
    }
  }

  function localeStatusMode(status) {
    switch (status) {
      case 'Offline':
        return settings.language.contactus;
      case 'Online':
        return settings.language.online;
      case 'BRB':
        return settings.language.brb;
      case 'Away':
        return settings.language.away;
    }
  }

  function setOffline(status) {
    var embed = $(selector + 'Embedded');

    updateStatusText(status, embed);
    if (settings.loginDetails !== 0) {
      embed.find('.' + prefix + 'Operator .OperatorImage').hide();
    }
    embed.find('.CloseButton').fadeOut(250);
    embed.addClass('offline');

    // Close Tab
    closeTab();
  }

  // Change Status Image
  var settingsRefreshed = false;
  function changeStatus(status, departments) {
    var embed = $(selector + 'Embedded'),
      invite = $('.' + prefix + 'Invite'),
      bubble = $(selector + 'InitiateChatBubble'),
      initiate = bubble.is(':visible');

    function updateEmbeddedStatus() {
      invite.show();
      if (opts.embedded === true && embed.length > 0) {
        updateStatusText('Online', embed);
        embed.find('.CloseButton').fadeIn(250);
        if (!initiate && (!settings.initiate.enabled || !opts.initiateDelay)) {
          var css = 'offline';
          if (!opts.disabled && !opts.hidden && !opts.popup && !embed.is('.sidebar')) {
            css = ' hidden';
          }
          embed.removeClass(css).addClass('online');
          if (opts.connected) {
            showChat();
          }
        }
      }
      if (bubble.is('.feedback.rating')) {
        bubble.hide().removeClass('feedback rating');
        embed.removeClass('feedback');
      }
    }

    // Update Departments
    updateDepartments(departments);

    if (status === 'Online' && (opts.offline || (departments !== false && opts.embedded && !$(selector + 'DepartmentInput option').length) || (departments !== false && settings.departments.length > 0 && opts.department.length > 0 && $.inArray(opts.department, settings.departments) < 0))) {
      status = 'Offline';
    }

    $('.LiveHelpTextStatus').each(function (index, value) {
      var text = localeStatusMode(status);
      $(this).text(text).attr('title', text);
    });

    $('.LiveHelpButton').each(function (index, value) {
      var text = localeStatusMode(status);
      $(this).attr('title', text);
    });

    // Javascript API
    updateStatusMode(status.toLowerCase());

    if (status === 'Online') {
      if (!settingsRefreshed && departments === undefined && settings.status !== '' && settings.status !== status) {
        updateSettings(function (data, textStatus, jqXHR) {
            updateEmbeddedStatus();
          }
        );
        settingsRefreshed = true;

        var css = 'show';
        if (opts.disabled) {
          css += ' hidden';
        }
        $('.' + prefix + 'MobileButton').removeClass('hide').addClass(css);

      } else {
        updateEmbeddedStatus();
      }
    } else {
      settingsRefreshed = false;
      if (opts.connected) {
        invite.hide();
      }

      // Initiate Bubble
      if (!embed.is('.feedback') && !bubble.is('.message') && !embed.is('.offline')) {
        bubble.css('bottom', -bubble.outerHeight()).hide();
      }

      if (embed.length > 0) {
        if (opts.connected) {
          updateEmbeddedStatus();
        } else {
          if (opts.hideOffline === true) {
            embed.addClass('hidden');
          }
        }
      }

      if (status !== 'Online' && opts.hideOffline !== true && opts.connected === false && settings.offlineEmail) {
        setOffline(status);
      }

      if (!embed.is('.connected') && opts.hideOffline === true) {
        $('.' + prefix + 'MobileButton').removeClass('show').addClass('hide');
      }

      // Initiate Chat
      if (status !== 'Online' && $(selector + 'InitiateChat').is(':visible')) {
        $(selector + 'InitiateChat').fadeOut();
      }
    }

    if (settings.status !== '' && settings.status !== status) {

      // jQuery Status Mode Trigger
      $(document).trigger(prefix + '.StatusModeChanged', [status]);

      // Status Mode Changed External Event
      if (Chatstack.statusChanged) {
        Chatstack.statusChanged(status);
      }

      // Update Status
      settings.status = status;

      $('.' + prefix + 'Status').each(function () {
        // Update Status Image
        var image = settings.images[status.toLowerCase()];
        if (image !== undefined) {
          $(this).attr('src', image);
        } else {
          $(this).attr('src', settings.images.offline);
        }

        // Title / Alt Attributes
        updateImageTitle();
      });

    }
  }

  function getTimezone() {
    var datetime = new Date();
    if (datetime) {
      return datetime.getTimezoneOffset();
    } else {
      return '';
    }
  }

  function updateInitiateStatus(status, message, image) {
    // Update Initiate Chat Status
    if (initiateStatus !== status) {
      initiateStatus = status;
      if (visitorInitialised > 0) {
        visitorTimeout = false;
        if (status === 'Accepted' || status === 'Declined') {
          $(selector + 'InitiateChat').fadeOut(250);
        }

        // Javascript API
        updateInitiateChatState(status.toLowerCase(), message, image);

        trackVisit(true);
      }
    }
  }

  function toggleInitiateInputs(hide, overrideMessage) {
    if ($(selector + 'Embedded').length) {
      $(selector + 'SignIn').hide();
      $(selector + 'SignedIn').show();
      $(selector + 'Body, ' + selector + 'Background').css('background-color', '#fff');
      $(selector + 'Input').animate({ bottom: 0 }, 500);

      // Override Content
      var content = opts.introduction;
      if (overrideMessage) {
        content = overrideMessage;
      }

      if ($(selector + 'Scroll .InitiateChat').length === 0) {

        /*jshint multistr: true */
        var html = '<div class="InitiateChat"> \
  <div class="flex initiate"> \
    <div class="name"></div> \
    <div class="avatar"></div> \
    <div class="' + ((opts.messageBubbles) ? 'message bubble left' : 'message') + '" data-id="-1"> \
      <div style="color: #000">' + content + '</div> \
    </div></div> \
  </div>';
        $(html).appendTo(selector + 'Messages');
      }

      $(selector + 'Waiting').hide();

      var op = settings.embeddedinitiate;
      if (op.id > 0 && !opts.accepted) {
        showOperatorDetails(op.id, op.name, op.department, op.avatar, !hide);
      }

    }
  }

  function openInitiateChatTab() {
    var embedded = $(selector + 'Embedded'),
      textarea = embedded.find(selector + 'MessageTextarea');

    toggleInitiateInputs();

    var css = 'closed';
    if (opts.disabled) {
      css += ' hidden';
    }
    if (!opts.popup) {
      embedded.removeClass('opened').addClass(css);
    }
    $('body').removeClass(prefix + 'Opened');

    storage.data.operatorDetailsOpen = true;
    updateStorage();

    openTab(function () {
      setTimeout(function () {
        textarea.focus();
      }, 500);
    }, true);

    updateInitiateStatus('Opened');
    embedded.attr('data-initiate', true);
    embedded.attr('data-opened', true);
  }

  function sendFeedback() {
    var initiate = $(selector + 'InitiateChatBubble'),
      email = initiate.find('input'),
      input = initiate.find('textarea'),
      text = initiate.find('.text.content'),
      question = initiate.attr('data-question'),
      score = parseInt($(selector + 'FeedbackRating .rating:not(.deselected)').attr('data-rating'), 10),
      data = {
        QUESTION: question,
        EMAIL: email.val(),
        MESSAGE: input.val(),
        SCORE: score,
        SESSION: cookies.session,
        JSON: true
      };

    $.ajax({ url: opts.server + apiPath + apiEndpoint.feedback,
      data: $.param(data),
      success: function (data) {
        // Process JSON Errors / Result
        if (data.result !== undefined && data.result === true) {
          text.text('Thanks for the feedback!');
          initiate.find('.feedback input, .feedback textarea').hide();

          var height = $(selector + 'InitiateChatBubble .bubble').outerHeight() + 25 + 'px';
          initiate.animate({ 'height': height }, 250, 'swing');

          storage.store.set('feedback', true);
        }
      },
      dataType: 'jsonp',
      cache: false,
      xhrFields: { withCredentials: true }
    });
  }

  function closeFeedback(permanent) {
    var initiate = $(selector + 'InitiateChatBubble'),
      embed = $(selector + 'Embedded'),
      button = $('.' + prefix + 'MobileButton'),
      collapsed = (initiate.attr('data-collapsed') === 'true'),
      height = initiate.css('height'),
      size = '65px',
      bubble = initiate.find('.bubble'),
      close = initiate.find('.close');

    if (!collapsed) {
      height = '-' + height;
      close.hide();
    } else {
      height = 10;
      size = initiate.find('.bubble').outerHeight() + 25 + 'px';
      close.show();
    }

    if (permanent && settings.status !== 'Online') {
      embed.removeClass('feedback').addClass('offline hidden');
      initiate.removeClass('feedback rating opened').addClass('offline').css('height', '');
      initiate.find('.message.bubble').css('bottom', '');
      button.removeClass('hide').addClass('show');
      storage.store.set('feedback', true);

      // Reset Initiate Chat
      initiate.find('.text.content').text(settings.language.offlinemessagedescription);
    } else {
      bubble.animate({ 'bottom': height }, 250, 'swing');
      initiate.attr('data-collapsed', !collapsed).animate({ 'height': size }, 250, 'swing');

      storage.data.feedbackOpen = collapsed;
    }

    updateStorage();
  }

  var closeInitiateChat = function (closing) {
    return function (e) {
      var embed = $(selector + 'Embedded');
      var initiate = $(selector + 'InitiateChatBubble');
      var offline = initiate.is('.offline');

      if (closing) {
        if (e) {
          e.stopPropagation();
        }
        if (!offline) {
          updateInitiateStatus('Declined');
        }
      }

      if (offline && closing) {
        toggleOfflineChat();
        return;
      } else if (embed.is('.feedback') || closing) {
        closeFeedback();
        return;
      }

      if (offline) {
        return;
      }

      if (opts.embedded) {
        initiate.fadeOut(150, function () {
          openInitiateChatTab();
          initiate.removeClass('opened');
        });
      } else {
        initiate.fadeOut(150);
        openLiveHelp();
        updateInitiateStatus('Opened');
      }
    };
  };

  function openInitiateChat(initiate) {

    var embed = $(selector + 'Embedded');
    if (embed.is('.opened')) {
      return;
    }

    // Initiate Chat Bubble
    initiate.find('.bubble, .feedback').on('click', function (e) {
      if (embed.is('.feedback')) {
        e.preventDefault();
        return false;
      }
    });

    initiate.find('a').on('click', function (e) {
      e.stopPropagation();
    });

    // Setup Initiate Chat and Animate
    initiate.on('click', closeInitiateChat(false));
    initiate.find('.close').on('click', closeInitiateChat(true));

    initiate.find('.feedback textarea').on('keypress', function (event) {
      if (event.which === 13) {
        sendFeedback();
        return false;
      } else {
        return true;
      }
    });

    initiate.find('.brand').on('click', function (e) {
      e.stopPropagation();
    });

    // Message Alert
    var message = initiate.is('.message');
    if (message) {
      initiate.show();
    }

    var bottom = -$(selector + 'InitiateChatBubble').outerHeight(),
      height = $(selector + 'InitiateChatBubble .bubble').outerHeight() + 25 + 'px',
      bubbleBottom = 10,
      disconnectedBottom = 0,
      collapsed = (initiate.attr('data-collapsed') === 'true');

    if (!storage.data.feedbackOpen && settings.status !== 'Online' && !message) {
      bubbleBottom = '-' + (parseInt(initiate.find('.bubble').outerHeight(), 10) + parseInt(initiate.find('.bubble').css('margin-top'), 10)) + 'px';
      height = initiate.css('height') + 'px';
      collapsed = true;

      if (!initiate.is('.offline')) {
        initiate.find('.close').hide();
      } else {
        bubbleBottom = 0;
      }
    }

    if (opts.sidebar && initiate.is('.offline')) {
      height = 'auto';
    }

    initiate.find('.bubble').animate({ 'bottom': bubbleBottom }, 250, 'swing');
    initiate.attr('data-collapsed', collapsed).animate({ 'height': height }, 250, 'swing');

    if (opts.connected && !message) {
      initiate.css('bottom', bottom);
    }

    if (!initiate.is('.offline') && (!opts.connected || message)) {
      $('.' + prefix + 'MobileButton').removeClass('show').addClass('hide');
      initiate.addClass('opened');
    }

  }

  function showMessageAlert(message) {

    if (message.length > 150) {
      message = message.substr(0, 150) + '...';
    }

    var initiate = $(selector + 'InitiateChatBubble');
    initiate.find('.message.bubble .text').text(message);
    initiate.removeClass('feedback').addClass('message');

    var embed = $(selector + 'Embedded');
    if (!embed.is('.opened')) {
      embed.removeClass('feedback').addClass('hidden');
    }

    openInitiateChat(initiate);
  }

  function updateInitiateChatImage(initiate, feedback, image) {
    // Gravatar
    $('<img />').one('error', function () {
      $(this).remove();
      initiate.find('.operator.photo').css('background-image', 'url(\'' + opts.server + apiPath + apiEndpoint.image + '?size=150&round=true\')');
      if (!feedback) {
        openInitiateChat(initiate);
      }
    }).one('load', function () {
      $(this).remove();
      initiate.find('.operator.photo').css('background-image', 'url(\'' + image + '\')');
      if (!feedback) {
        openInitiateChat(initiate);
      }
    }).attr('src', image);
  }

  function toggleOfflineSendButton(force) {
    var button = $('.' + prefix + 'MobileButton');
    var label = button.find('.label');
    if ((!$(selector + 'OfflineEmailInput').val().length && !$(selector + 'OfflineMessageInput').val().length) || force) {
      label.text('');
      label.removeClass('send');
      button.removeClass('send');
      button.find('.icon').addClass('close');
    } else {
      button.find('.icon').removeClass('close');
      button.addClass('send');
      label.text(settings.language.send);
      label.addClass('send');
    }
  }

  function initInitiateChat(hide, overrideMessage, overrideImage) {

    toggleInitiateInputs(hide, overrideMessage);

    var embed = $(selector + 'Embedded'),
      initiate = $(selector + 'InitiateChatBubble'),
      content = opts.introduction,
      image = false;

    if (initiate.length === 0) {

      var operator = settings.embeddedinitiate,
        copyright = (settings.language.copyright.length > 0) ? ' copyright' : '';

      if (operator.id > 0) {
        image = 'https://secure.gravatar.com/avatar/' + operator.avatar + '?s=150&r=g&d=404';
      }

      if (settings.images.initiatechat !== undefined && settings.images.initiatechat.length > 0) {
        image = settings.images.initiatechat;
      }

      // Override image
      if (overrideImage) {
        image = overrideImage;
      }

      // Override Content
      if (overrideMessage) {
        content = overrideMessage;
      }

      // Feedback
      if ($.isArray(opts.feedback) && opts.feedback.length > 0 && settings.status !== 'Online') {
        opts.feedback.sort(function () { return (Math.round(Math.random()) - 0.5); });
        content = opts.feedback[0];
      }

      var rating = [{ css: 'good', title: 'Good', rating: 3 }, { css: 'poor', title: 'Poor', rating: 1 }];
      rating.sort(function () { return (Math.round(Math.random()) - 0.5); });

      var offline = '';
      if (embed.is('.offline')) {
        offline = 'offline';
      }

      /*jshint multistr: true */
      var html = '<div id="' + prefix + 'InitiateChatBubble" class="' + offline + '" data-collapsed="false"> \
<div class="message bubble right' + copyright + '"> \
<div class="top border"></div> \
<div class="intro">' + settings.language.feedbackintroduction + '</div> \
<div class="text content">' + content + '</div> \
<div class="feedback"> \
  <input id="' + prefix + 'FeedbackEmailInput" type="text" tabindex="100" placeholder="' + settings.language.enteryourfeedbackemail + '"/> \
  <textarea id="' + prefix + 'FeedbackInput" type="text" tabindex="200" placeholder="' + settings.language.enteryourfeedback + '"></textarea> \
  <div class="needsupport hidden">' + settings.language.needsupport + '  <a href="#" target="_blank">' + settings.language.clickhere + '</a></div> \
  <div id="' + prefix + 'FeedbackRating" class="rating-container"> \
    <div class="rating ' + rating[0].css + '" title="' + rating[0].title + '" data-rating="' + rating[0].rating + '"></div> \
    <div class="rating neutral" title="Neutral" data-rating="2"></div> \
    <div class="rating ' + rating[1].css + '" title="' + rating[1].title + '" data-rating="' + rating[1].rating + '"></div> \
  </div> \
</div> \
<div class="offline"> \
  <form method="post" id="OfflineMessageForm"> \
    <div> \
      <input id="' + prefix + 'OfflineNameInput" type="text" name="NAME" autocomplete="name" tabindex="100" placeholder="' + settings.language.enteryourofflinename + '"/> \
      <div id="NameError" title="Name Required" class="error sprite TickSmall"></div> \
    </div> \
    <div> \
      <input id="' + prefix + 'OfflineEmailInput" type="text" name="EMAIL" autocomplete="email" tabindex="200" placeholder="' + settings.language.enteryourofflineemail + '"/> \
      <div id="EmailError" title="Email Required" class="error sprite TickSmall"></div> \
    </div> \
    <input id="' + prefix + 'OfflineWebsiteInput" type="text" name="WEBSITE" autocomplete="none" tabindex="300"/> \
    <div> \
      <textarea id="' + prefix + 'OfflineMessageInput" type="text" name="MESSAGE" tabindex="300" placeholder="' + settings.language.enteryourofflinemessage + '"></textarea> \
      <div id="MessageError" title="Message Required" class="error sprite TickSmall"></div> \
    </div> \
  </form> \
</div> \
<a href="https://www.chatstack.com" target="_blank" class="brand"><div></div></a> \
</div> \
<div class="operator photo"></div> \
<div class="operator badge">1</div> \
<div class="close" title="' + settings.language.close + '"><span class="icon">&#10005;</span><span class="text">' + settings.language.close + '</span></div> \
</div>';

      initiate = $(html).appendTo('body');

      var feedback = false;
      if (embed.is('.feedback')) {
        initiate.addClass('feedback rating');
        feedback = true;

        if (settings.images.feedback !== undefined && settings.images.feedback.length > 0) {
          image = settings.images.feedback;
        }

        var supportaddress = false;
        if (settings.supportaddress.length > 0 && (settings.supportaddress.indexOf('https://') !== -1 || settings.supportaddress.indexOf('http://') !== -1)) {
          var support = initiate.find('.needsupport');

          supportaddress = true;
          support.find('a').attr('href', settings.supportaddress);
          support.removeClass('hidden');
        }

        rating = $(selector + 'FeedbackRating');
        rating.find('.rating').click(function () {
          var element = $(this),
            type = 'neutral',
            text = 'How can we improve?',
            score = parseInt($(this).attr('data-rating'), 10);

          switch (score) {
            case 1:
              type = 'poor';
              text = 'Sorry to hear that.  Please let us know how we can improve.';
              break;
            case 3:
              type = 'good';
              text = 'That\'s great!  Please let us know if you have any feedback.';
              break;
          }

          element.parent().find('.rating[data-rating!=" + score + "]').addClass('deselected');
          element.removeClass('deselected');
          initiate.removeClass('rating').addClass(type);

          var height = '223px';
          if (supportaddress) {
            height = '241px';
          }
          initiate.css('height', height);

          element = initiate.find('.text.content');
          initiate.attr('data-question', element.text());
          initiate.find('.text.content').text(text);
        });

      } else {
        initiate.removeClass('feedback');

        // Javascript API
        if (hide) {
          updateInitiateStatus('Waiting', content, image);
        }
      }

      $(document).trigger(prefix + '.InitiateChatLoaded');

      // Initiate Chat Image
      updateInitiateChatImage(initiate, feedback, image);

      if (hide && !opts.popup) {
        embed.removeClass('opened').addClass('closed hidden');
        $('body').removeClass(prefix + 'Opened');
      }
    } else {

      // Override Content
      if (overrideMessage) {
        content = overrideMessage;
      }

      if (!initiate.is('.sent') && !initiate.is('.feedback')) {
        initiate.find('.text.content').text(content);
      }

      // Offline Widget Events
      initiate.find(selector + 'OfflineEmailInput, ' + selector + 'OfflineMessageInput').on('change keyup input', function () {
        toggleOfflineSendButton();
      });

      // Override image
      if (overrideImage) {
        image = overrideImage;
        updateInitiateChatImage(initiate, false, overrideImage);
      }

      // Javascript API
      if (hide) {
        updateInitiateStatus('Waiting', content, image);
      }

    }

  }

  var showFeedback = _.once(function () {
    var initiate = $(selector + 'InitiateChatBubble');
    openInitiateChat(initiate);
  });

  function checkFeedback() {
    var s = $(window).scrollTop(),
      d = $(document).height(),
      c = $(window).height();

    var scrollPercent = (s / (d - c)) * 100,
      initiate = $(selector + 'InitiateChatBubble');

    if (opts.feedbackDelay > 0) {
      setTimeout(showFeedback, opts.feedbackDelay * 1000);
    } else {
      if (scrollPercent > 50 && initiate.is('.feedback')) {
        showFeedback();
      }
    }

  }

  function displayInitiateChat(overrideDelay, overrideStatus, overrideMessage, overrideImage) {

    function showInitiateChat(overrideStatus) {

      if (opts.initiate && (settings.status !== undefined && settings.status === 'Online' || overrideStatus !== undefined)) {
        var initiate = false;
        if (settings.embeddedinitiate !== undefined && settings.embeddedinitiate != null) {
          // Embedded Initiate Chat
          initiate = $(selector + 'Embedded');
          if (opts.visitorTracking && !$.data(initiate, 'initiate') && initiateStatus === '') {
            initInitiateChat(true, overrideMessage, overrideImage);
          }
        }
      }
    }

    if (opts.initiateDelay > 0 && !overrideDelay) {
      setTimeout(showInitiateChat, opts.initiateDelay);
    } else {
      showInitiateChat(overrideStatus, overrideMessage, overrideImage);
    }
  }

  var updateVisitorTrackingSession = _.once(function (session) {
    cookies.session = session;
    if (opts.cookie.localStorage) {
      storage.store.set(cookie.name, session);
    } else {
      Chatstack.cookies.set(cookie.name, session, { domain: opts.domain, expires: cookie.expires });
    }
  });

  function trackVisit(override, initialise) {

    clearTimeout(visitorTimer);

    pageTime = $.now() - loadTime;
    if ((pageTime > 90 * 60 * 1000) || (visitorInitialised > 0 && override === undefined && ((websockets === false && master === false) || (plugins.websockets !== undefined && websockets === true)))) {
      visitorTimeout = true;
    } else {
      visitorTimeout = false;
    }

    if (opts.visitorTracking && !visitorTimeout) {
      var title = $(document).attr('title').substring(0, 150),
        timezone = getTimezone(),
        site = document.location.protocol + '//' + document.location.host,
        referrer,
        url = opts.server + apiPath + apiEndpoint.visitor + '?callback=?',
        data = { INITIATE: initiateStatus };

      if (document.referrer.substring(0, site.length) === site.location) {
        referrer = '';
      } else {
        referrer = document.referrer;
      }

      if (opts.department !== undefined && opts.department.length > 0) {
        data = $.extend(data, { DEPARTMENT: opts.department });
      }

      if (opts.referrer) {
        referrer = opts.referrer;
      }

      if (opts.useragent && opts.useragent.length) {
        $.extend(data, { USERAGENT: opts.useragent });
      }

      // Track Visitor
      if (visitorInitialised === 0 || initialise !== undefined) {
        var location = (opts.url !== undefined) ? opts.url : document.location.href;
        data = $.extend(data, { TITLE: title, URL: location, REFERRER: referrer, WIDTH: window.screen.width, HEIGHT: window.screen.height, TIME: $.now() });

        if (settings.visitor.server !== undefined) {
          url = settings.visitor.server + apiPath + apiEndpoint.visitor + '?callback=?';
        }

        visitorInitialised = 1;
      }

      // Plugin / Integration
      var plugin = opts.plugin;
      if (plugin.length > 0) {
        var name = opts.name,
          email = opts.email;

        if (email !== undefined && email.length > 0) {
          data = $.extend(data, { PLUGIN: plugin, CUSTOM: email });
        }
        if (name !== undefined && name.length > 0) {
          data = $.extend(data, { NAME: name });
        }
      } else if (opts.name !== undefined && opts.name.length > 0 && opts.email !== undefined && opts.email.length > 0) {
        data = $.extend(data, { PLUGIN: 'Internal', CUSTOM: opts.email, NAME: opts.name });
      }

      // Web Sockets
      if (plugins.websockets !== undefined && plugins.websockets.state !== undefined && plugins.websockets.state.length > 0) {
        data = $.extend(data, { WEBSOCKETS: plugins.websockets.state });
      }

      // Cookies
      if (cookies.session !== undefined) {
        data = $.extend(data, { SESSION: cookies.session });
      }
      data = $.toJSON(data);
      data = Base64.encode(data);

      // Visitor Tracking
      $.jsonp({
        url: url,
        data: { 'DATA': data }, //$.param(data),
        success: function (data) {
          if (data !== null && data !== '') {
            if (data.session !== undefined && data.session.length > 0) {
              // Update Session
              updateVisitorTrackingSession(data.session);

              $(document).trigger(prefix + '.VisitorLoaded', data);
            }
            if (data.status !== undefined && data.status.length > 0) {
              changeStatus(data.status, data.departments);
            }
            if (data.initiate && data.initiate.enabled && !opts.initiateDelay && !opts.connected) {
              if ((data.initiate.avatar || (data.initiate.image && data.initiate.image.length)) && data.initiate.message && data.initiate.message.length > 0) {
                var image = data.initiate.image;
                if ((image.indexOf('https://') === -1 && image.indexOf('data:image/png;base64,') === -1)) {
                  image = 'https://secure.gravatar.com/avatar/' + data.initiate.avatar + '?s=120&r=g&d=404';
                }
                displayInitiateChat(true, false, data.initiate.message, image);
              } else {
                displayInitiateChat(true);
              }
            }
            if (data.chat !== undefined && data.chat > 0) {
              $(document).trigger(prefix + '.Connecting', data).trigger(prefix + '.Connected', data);
            }
          }
          if (visitorInitialised === 0) {
            visitorInitialised = 1;
          }
          visitorTimer = window.setTimeout(trackVisit, opts.visitorRefresh);
        },
        error: function () {
          visitorTimer = window.setTimeout(trackVisit, opts.visitorRefresh);
        }
      });

    } else {
      visitorTimer = window.setTimeout(trackVisit, opts.visitorRefresh);
    }

  }

  var throttledTrackVisit = _.throttle(trackVisit, opts.visitorRefresh),
    trackVisitInitalise = _.once(trackVisit);

  // Mouse Activity
  var debouncedMouseActivity = _.debounce(function () {
    loadTime = $.now();
  }, 500);

  $(document).on('mousemove', debouncedMouseActivity);

  // Get URL Parameter
  function getParameterByName(url, name) {
    name = name.replace(/(\[|\])/g, '\\$1');
    var ex = '[\\?&]' + name + '=([^&#]*)',
      regex = new RegExp(ex),
      results = regex.exec(url);

    if (results === null) {
      return '';
    } else {
      return decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
  }

  function offlineComplete() {
    var id = 'Offline';
    $('.' + prefix + id + 'Form').hide();
    $('.' + prefix + id + 'Sent').show();
    if (opts.embedded) {
      $('.' + prefix + id + 'PoweredBy').css('right', '150px');
    }
    $(selector + id + 'Heading').html(settings.language.thankyoumessagesent).fadeIn(250);
    $(document).trigger('LiveHelp.ContactComplete');
  }

  function offlineSend(callback) {
    var id = 'Offline',
      offline = '#' + prefix + id,
      form = $('#' + id + 'MessageForm'),
      data = form.serialize();

    if (opts.security.length > 0) {
      data += '&SECURITY=' + encodeURIComponent(opts.security);
    }
    if (cookies.session !== undefined && cookies.session.length > 0) {
      data += '&SESSION=' + encodeURIComponent(cookies.session);
    }
    if (opts.template !== undefined && opts.template.length > 0) {
      data += '&TEMPLATE=' + encodeURIComponent(opts.template);
    }
    data += '&JSON';

    $.ajax({ url: opts.server + apiPath + apiEndpoint.offline,
      data: data,
      dataType: 'jsonp',
      cache: false,
      xhrFields: { withCredentials: true }
    }).done(function (data) {

      // Enable Offline Button
      var button = $(offline + 'Button');
      if (button.length) {
        button.removeAttr('disabled');
      }

      // Process JSON Errors / Result
      var success = false;
      if (data.result !== undefined && data.result === true) {
        offlineComplete();
        success = true;
      } else {
        if (data.type !== undefined) {
          if (data.type === 'EMAIL') {
            $('#EmailError').removeClass('TickSmall').addClass('CrossSmall').fadeIn(250);
          }
          if (data.type === 'CAPTCHA') {
            $('#SecurityError').removeClass('TickSmall').addClass('CrossSmall').fadeIn(250);
          }
        }
        if (data.error !== undefined && data.error.length > 0) {
          $(offline + 'Description').hide();
          $(offline + 'Error span').html('Error: ' + data.error).parent().fadeIn(250);
        } else {
          $(offline + 'Error').fadeIn(250);
          $(offline + 'Heading').text(settings.language.offlineerrortitle);
          $(offline + 'Description').hide();
        }
      }

      if (callback) {
        callback(success);
      }
    });
  }

  function validateResult(id, result) {
    if (result) {
      $(id).removeClass('CrossSmall').addClass('TickSmall').fadeIn(250);
      return true;
    } else {
      $(id).removeClass('TickSmall').addClass('CrossSmall').fadeIn(250);
      return false;
    }
  }

  function validateField(obj, id) {
    var value = (obj instanceof $) ? obj.val() : $(obj).val(),
      result = ($.trim(value) === '');

    return validateResult(id, !result);
  }

  function validateTelephone(obj, id) {
    var value = (obj instanceof $) ? obj.val() : $(obj).val(),
      result = ($.trim(value).length > 0 && /^[\d| |-|.]{3,}$/.test(value));

    return validateResult(id, result);
  }

  function validateEmail(obj, id) {
    var elem = (obj instanceof $) ? obj : $(obj),
      value = elem.val(),
      verify = elem.attr('data-verify'),
      result = (/^[\-!#$%&'*+\\.\/0-9=?A-Z\^_`a-z{|}~]+@[\-!#$%&'*+\\\/0-9=?A-Z\^_`a-z{|}~]+\.[\-!#$%&'*+\\.\/0-9=?A-Z\^_`a-z{|}~]+$/i.test(value)) && ((verify !== undefined && verify.length > 0 && verify === CryptoJS.SHA1(value).toString()) || !value.length || verify === undefined);

    return validateResult(id, result);
  }

  function validatePassword(obj, id) {
    var value = (obj instanceof $) ? obj.val() : $(obj).val(),
      result = (value.length < 8);

    return validateResult(id, !result);
  }

  function validateSecurity(obj, id, complete) {
    var field = (obj instanceof $) ? obj : $(obj),
    errorClass = 'CrossSmall',
    successClass = 'TickSmall',
    value = field.val(),
    data = { SECURITY: opts.security, CODE: value, JSON: '', EMBED: '' },
    validate = opts.security.substring(16, 56);

    function ajaxValidation() {
      $.ajax({ url: opts.server + apiPath + apiEndpoint.security,
        data: $.param(data),
        success: function (data) {
          var error = '';
          if (data.result !== undefined) {
            // Process JSON Errors / Result
            if (data.result === true) {
              $(id).removeClass(errorClass).addClass(successClass).fadeIn(250);
              if (complete) {
                complete();
              }
            } else {
              error = 'CAPTCHA';
            }

          } else {
            error = 'CAPTCHA';
          }

          // Error Handling
          if (error.length > 0) {
            $(id).removeClass(successClass).addClass(errorClass).fadeIn(250);
            if (complete) {
              var field = $('#OfflineMessageForm').find(':input[id=' + error + '], textarea[id=' + error + ']');

            }
          }
        },
        dataType: 'jsonp',
        cache: false,
        xhrFields: { withCredentials: true }
      });
    }

    if (field.length > 0) {
      if (value.length !== 5) {
        if (value.length > 5) {
          field.val(value.substring(0, 5));
        }
        $(id).removeClass(successClass).addClass(errorClass).fadeIn(250);
        return false;
      } else {

        if (validate.length === 40) {
          // Validate Security Code
          if (validate === CryptoJS.SHA1(value.toUpperCase()).toString()) {
            $(id).removeClass(errorClass).addClass(successClass).fadeIn(250);
            if (complete) {
              complete();
            }
            return true;
          } else {
            return false;
          }
        } else {
          ajaxValidation(complete);
        }
      }
    } else {
      if (complete) {
        complete();
      }
      return true;
    }
  }

  function validateForm(form, callback) {
    var name = form.find(':input[name=NAME]'),
      country = form.find('select[id=COUNTRY]'),
      telephone = form.find(':input[id=TELEPHONE]');

    if (name.length && !validateField(name, '#NameError')) {
      return;
    } else if (!validateEmail(form.find(':input[name=EMAIL]'), '#EmailError')) {
      return;
    } else if (!validateField(form.find('textarea[name=MESSAGE]'), '#MessageError')) {
      return;
    }
    if (telephone.length && !validateField(telephone, '#TelephoneError')) {
      return;
    }
    validateSecurity(form.find(':input[name=CAPTCHA]'), '#SecurityError', function () {
      callback.call();
    });
  }

  function validateOfflineForm() {
    var form = $('#OfflineMessageForm');
    validateForm(form, offlineSend);
  }

  var updateSecuritySession = _.once(function (session) {
    if (opts.cookie.localStorage) {
      storage.store.set(cookie.name, session);
    } else {
      Chatstack.cookies.set(cookie.name, session, { domain: opts.domain, expires: cookie.expires });
    }
  });

  function resetSecurityCode(selector, form) {
    if (cookies.session !== null) {
      updateSecuritySession(cookies.session);
    }
    form.find(':input[id=CAPTCHA]').val('');

    $.ajax({ url: opts.server + apiPath + apiEndpoint.security,
      data: { RESET: '', JSON: '' },
      success: function (json) {
        if (json.captcha !== undefined) {
          opts.security = json.captcha;
          var data = '';
          if (opts.security.length > 0) {
            data = '&' + $.param($.extend(data, { SECURITY: encodeURIComponent(opts.security), RESET: '', EMBED: '' }));
          }
          $(selector + 'Security').attr('src', opts.server + apiPath + apiEndpoint.security + '?' + $.now() + data);
        }
      },
      dataType: 'jsonp',
      cache: false,
      xhrFields: { withCredentials: true }
    });
    $('#SecurityError').fadeOut(250);
  }

  function initInputEvents(id, selector, form) {

    $(selector + 'Button, ' + selector + 'CloseButton').hover(function () {
      $(this).toggleClass(id + 'Button ' + id + 'ButtonHover');
    }, function () {
      $(this).toggleClass(id + 'Button ' + id + 'ButtonHover');
    });

    $(selector + 'SecurityRefresh').click(function () {
      resetSecurityCode(selector, form);
    });

    $(selector + 'Button').click(function () {
      validateOfflineForm();
      $(this).attr('disabled', 'disabled');
    });

    if (id === 'Offline') {
      $(selector + 'CloseButton').click(function () {
        $.fancybox.close();
      });
    } else {
      $(selector + 'CloseButton').click(function () {
        if (settings.status === 'Online' || opts.connected) {
          if ($(this).is('.expand')) {
            openTab(false, false);
          } else {
            closeTab();
          }
        } else {
          openLiveHelp();
        }
      });
    }


    $(selector + 'CloseBlockedButton').click(function () {
      if (opts.embedded) {
        closeTab();
      } else if (opts.popup) {
        window.close();
      }
    });

    form.find(':input[id=NAME]').bind('keydown blur', function () {
      validateField(this, '#NameError');
    });

    form.find(':input[id=EMAIL]').bind('keydown blur', function () {
      validateEmail(this, '#EmailError');
    });

    form.find('textarea[id=MESSAGE]').bind('keydown blur', function () {
      validateField(this, '#MessageError');
    });

    form.find('select[id=COUNTRY]').bind('keydown blur', function () {
      validateField(this, '#CountryError');
    });

    form.find(':input[id=TELEPHONE]').bind('keydown blur', function () {
      validateTelephone(this, '#TelephoneError');
    });

    form.find(':input[id=CAPTCHA]').bind('keydown', function () {
      if ($(this).val().length > 5) {
        $(this).val($(this).val().substring(0, 5));
      }
    }).bind('keyup', function () {
      validateSecurity(this, '#SecurityError');
    });

    var speech = form.find('#MESSAGESPEECH'),
      obj = speech[0];

    if (obj !== undefined) {
      obj.onfocus = obj.blur;
      obj.onwebkitspeechchange = function (e) {
        form.find('#MESSAGE').val(speech.val());
        speech.val('');
      };
    }
  }

  function initOfflineEvents() {
    var id = 'Offline',
      selector = '#' + prefix + id,
      form = $('#' + id + 'MessageForm');

    initInputEvents(id, selector, form);
    if (opts.sprite === true) {
      $('<link href="' + opts.server + directoryPath + 'templates/' + opts.template + '/styles/sprite.min.css" rel="stylesheet" type="text/css"/>').appendTo('head');
    }
  }

  // Callback Placeholder

  function openEmbeddedOffline(data) {

    if (cookies.session !== undefined && cookies.session.length > 0) {
      data = $.extend(data, { SESSION: cookies.session });
    } else {
      if (!signup) {
        return;
      }
    }

    // Language
    data = $.extend(data, { LANGUAGE: settings.locale });

    $.fancybox.showLoading();

    data = $.extend(data, { SERVER: opts.server + directoryPath, JSON: '', RESET: '', EMBED: '', TEMPLATE: opts.template });
    $.jsonp({ url: opts.server + apiPath + apiEndpoint.offline + '?callback=?&' + $.param(data),
      data: $.param(data),
      success: function (data) {
        if (data.captcha !== undefined) {
          opts.security = data.captcha;
        }
        if (data.html !== undefined) {
          $.fancybox.open({ content: data.html, type: 'html', fitToView: true, closeClick: false, nextClick: false, arrows: false, mouseWheel: false, keys: null, helpers: { overlay: { css: { cursor: 'auto' }, closeClick: false }, title: null }, padding: 0, minWidth: 300, width:840, height:551, beforeShow: updateSettings, afterShow: initOfflineEvents });
        }
      }
    });
  }

  // Live Help Popup Window
  function openLiveHelp(obj, department, location, data, override) {
    var embed = $(selector + 'Embedded'),
      template = '',
      callback = false,
      status = settings.status,
      feedback = embed.is('.feedback'),
      button = (obj) ? obj.is('.' + prefix + 'Button') : false;

    if (button && feedback) {
      closeFeedback(true);
    }

    if (feedback && !override) {
      if (embed.is('.closed') || embed.is('.hidden')) {
        openTab(false, false);
      } else {
        closeTab();
      }
      return;
    }

    if (cookies.session !== undefined && cookies.session.length > 0) {
      data = $.extend(data, { SESSION: cookies.session });
    } else {
      if (embed.is('.signup-collapsed')) {
        signup = true;
        data = $.extend(data, { LANGUAGE: 'en', TIME: $.now() });
        openEmbeddedOffline(data);
      }
      return;
    }

    if (obj !== undefined && settings.templates.length > 0) {
      var css = obj.attr('class');
      if (css !== undefined) {
        template = css.split(' ')[1];
        if (template === undefined || $.inArray(template, settings.templates) < 0) {
          template = '';
        }
      }

      var src = obj.children('img.' + prefix + 'Status').attr('src');
      department = getParameterByName(src, 'DEPARTMENT');
    }

    // Override Template
    if (opts.template !== undefined && opts.template.length > 0) {
      template = opts.template;
    }

    // Language
    data = $.extend(data, { LANGUAGE: settings.locale, TIME: $.now() });

    // Callback
    if (obj !== undefined && obj.attr('class') !== undefined && obj.attr('class').indexOf('LiveHelpCallButton') !== -1) {
      callback = true;
    }

    if (opts.embedded && !callback) {

      // Department
      if (opts.department.length > 0) {
        department = opts.department;
      }

      if (status === 'Online' || opts.connected) {
        embed = $(selector + 'Embedded');
        if (embed.is('.closed') || embed.is('.hidden')) {
          openTab(false, true);
        }
      } else {

        if (settings.offlineRedirect !== '') {
          document.location = settings.offlineRedirect;
        } else if (settings.offlineEmail !== 0) {
          if (opts.sidebar) {
            toggleOfflineChat();
          } else {
            openEmbeddedOffline(data);
          }
        }

      }
      return false;
    }

    // Department / Template
    if (department !== undefined && department !== '') {
      if ($.inArray(department, settings.departments) === -1) {
        status = 'Offline';
      }
      data = $.extend(data, { DEPARTMENT: department });
    }
    if (template !== undefined && template !== '') {
      data = $.extend(data, { TEMPLATE: template });
    }

    // Location
    if (!location && !opts.embedded) {
      location = apiEndpoint.home;
    }

    if (status === 'Online') {

      // Name
      if (opts.name !== '') {
        data = $.extend(data, { NAME: opts.name });
      }

      // Email
      if (opts.email !== '') {
        data = $.extend(data, { EMAIL: opts.email });
      }

      // Open Popup Window
      popup = window.open(opts.server + apiPath + location + '?' + $.param(data), prefix, size);

      if (popup) {
        try {
          popup.opener = window;
        } catch (e) {
          // console.log(e);
        }
      }

    } else {

      if (settings.offlineEmail === 0) {
        if (settings.offlineRedirect !== '') {
          document.location = settings.offlineRedirect;
        }
      } else {
        popup = window.open(opts.server + apiPath + apiEndpoint.offline + '?' + $.param(data), prefix, size);
      }
      return false;
    }

  }

  // Connecting
  function showConnecting() {
    // Hide Sign In / Input Fields
    $(selector + 'SignInDetails, ' + selector + 'Login #Inputs').hide();

    // Add and Show Connecting
    var connecting = $(selector + 'Connecting'),
      progress = connecting.find('.connecting-container'),
      messages = $(selector + 'Messages .message[data-id!=-1]').length,
      initiate = $(selector + 'Embedded').attr('data-initiate') === 'true';

    if (progress.length > 0) {
      if (progress.find('img').length === 0) {
        progress.prepend('<img src="' + opts.server + directoryPath + 'images/ProgressRing.gif" style="opacity: 0.5"/>');
      }
    }
    if (!initiate && !messages) {
      connecting.show();
    }
  }

  function startChat(validate) {
    var form = selector + 'LoginForm',
      name = $(selector + 'NameInput, ' + form + ' :input[id=NAME]'),
      department = $(selector + 'DepartmentInput, ' + form + ' select[id=DEPARTMENT], ' + form + ' input[id=DEPARTMENT]'),
      email = $(selector + 'EmailInput, ' + form + ' :input[id=EMAIL]'),
      question = $(selector + 'QuestionInput, ' + form + ' textarea[id=QUESTION]'),
      other = $(selector + 'OtherInput, ' + form + ' :input[id=OTHER]'),
      inputs = $(selector + 'Login #Inputs'),
      connecting = $(selector + 'Connecting'),
      deferred = $.Deferred();

    if ($(selector + 'Embedded.feedback').length) {
      deferred.resolve();
      return deferred.promise();
    }

    var overrideValidation = (validate !== undefined && validate === false) ? true : false;

    // Signup Placeholder

    // Connecting
    opts.connecting = true;
    if (opts.connected) {
      showConnecting();
    }

    // Department
    if (opts.department.length > 0) {
      department.val(opts.department);
    }
    if (department.length > 0 && department.val() !== null) {
      storage.data.department = department.val();
      updateStorage();
    }

    if (settings.requireGuestDetails && !overrideValidation) {
      var errors = { name: true, email: true, department: true };

      errors.name = validateField(name, selector + 'NameError');
      if (settings.loginEmail) {
        errors.email = validateEmail(email, selector + 'EmailError');
      }

      if (settings.departments.length > 0) {
        var collapsed = department.data('collapsed');

        errors.department = validateField(department, selector + 'DepartmentError');
        if (!collapsed) {
          department.data('collapsed', true);
          department.animate({ width: department.width() - 35 }, 250);
        }
      }

      if (!errors.name || !errors.email || !errors.department) {
        connecting.hide();
        inputs.show();
        deferred.resolve();
        return deferred.promise();
      }
    }

    // Input
    name = (name.length > 0) ? name.val() : '';
    department = (department.length > 0 && department.val() !== null) ? department.val() : '';
    email = (email.length > 0) ? email.val() : '';
    other = (other.length > 0) ? other.val() : '';
    question = (question.length > 0) ? question.val() : '';

    // Name
    if (name.length > 0) {
      settings.user = name;
    }

    var data = { NAME: name, EMAIL: email, DEPARTMENT: department, QUESTION: question, OTHER: other, SERVER: document.location.host, JSON: '' };
    if (cookies.session !== null) {
      data = $.extend(data, { SESSION: cookies.session });
    }

    $.ajax({ url: opts.server + apiPath + apiEndpoint.chat,
      data: $.param(data),
      success: function (data) {
        // Process JSON Errors / Chat ID
        if (data.error === undefined) {
          if (data.session !== undefined && data.session.length > 0) {

            $(document).trigger(prefix + '.Connecting', data);

            $(selector + 'MessageTextarea').removeAttr('disabled');
            storage.data.chatEnded = false;
            updateStorage();

            settings.email = data.email;

            if (settings.user.length > 0) {
              settings.user = data.user;
            }
            if (cookies.session !== null) {
              cookies.session = data.session;
              if (opts.cookie.localStorage) {
                storage.store.set(cookie.name, cookies.session);
              } else {
                Chatstack.cookies.set(cookie.name, cookies.session, { domain: opts.domain, expires: cookie.expires });
              }
            }

            if (queued.length > 0 && settings.loginDetails === 0) {
              sendMessage(queued[0], function () {
                promptPrechatEmail();
                showChat();
              });
              queued = [];
            } else {
              promptPrechatEmail();
              showChat();
            }

            deferred.resolve();

            if (opts.popup) {
              $(selector + 'Login').hide();
              $(selector + 'Chat').fadeIn(250);
              resizePopup();
            }

            if (!opts.disabled) {
              opts.connected = true;

              // Javascript API
              updateChatState('waiting');
            }
          } else {
            deferred.resolve();
          }

          if (data.status !== undefined && data.status === 'Offline') {
            closeTab();
            var embed = $(selector + 'Embedded');

            if (opts.hideOffline === true) {
              embed.fadeOut(250).css('z-index', '10000000');
            } else {
              embed.fadeIn(250).css('z-index', '5000');
              updateStatusText('Offline', embed);
            }
            embed.find('.CloseButton').fadeOut(250);
          }

          promptEmail();

        } else {
          opts.connected = false;
        }
      },
      dataType: 'jsonp',
      cache: false,
      xhrFields: { withCredentials: true }
    });

    return deferred.promise();

  }

  function disconnectChat() {
    var type = 'jsonp';
    opts.connected = false;

    // Javascript API
    updateChatState('disconnected');

    storage.data.chatEnded = true;
    storage.data.department = '';
    storage.data.lastMessage = 0;
    updateStorage();
    message = 0;

    /*
    closeTab(function () {
      hideOperatorDetails();
      if (opts.chatBubbles) {
        $('.' + prefix + 'Operator .OperatorImage').hide();
        updateStatusText(settings.status, embed);
      }
      $(selector + 'Messages').html('');
      $(selector + 'SignedIn, ' + selector + 'Toolbar, ' + selector + 'CollapseButton').hide();
      $(selector + 'Body, ' + selector + 'Background').css('background-color', '#f9f6f6');
      $(selector + 'Input').animate({ bottom: -100 }, 500);
      $(selector + 'SignIn, ' + selector + 'Waiting').show();
      $(selector + 'Login #Inputs').show();
      $(selector + 'Connecting').hide();
    });
    */

    $.ajax({ url: opts.server + apiPath + apiEndpoint.signout,
      data: { SESSION: encodeURIComponent(cookies.session) },
      cache: false,
      xhrFields: { withCredentials: true },
      success: function (data) {
        if (opts.popup) {
          window.close();
        }
        $(document).trigger(prefix + '.Disconnect');
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    });
    $.fancybox.close();
  }

  function updateTyping(status) {
    if (status === true) {
      status = 1;
    } else {
      status = 0;
    }
    if (status !== currentlyTyping) {
      currentlyTyping = status;
      $(document).trigger(prefix + '.UpdateTyping', { typing: currentlyTyping });
    }
  }

  function escapeHtml(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
  }

  function removeHTML(text) {
    text = escapeHtml(text);
    return text;
  }

  var displaySentMessage = function (msg, callback) {
    return function (data, textStatus, XMLHttpRequest) {
      if (data !== null && data !== '') {
        if (data.id !== undefined && $('.flex[data-id=' + data.id + ']').length === 0) {

          var css = 'message',
            margin = 15,
            color = '#666';

          if (opts.messageBubbles) {
            css += ' bubble right';
            margin = 0;
            color = '#000';
          }

          if (!data.datetime) {
            data.datetime = (Date.now() / 1000 | 0);
          }

          var html = '<div class="flex right" data-id="' + data.id + '" data-datetime="' + data.datetime + '"><div class="' + css + '" align="left" style="color:#666">',
            username = (settings.user.length > 0) ? settings.user : 'Guest';

          if (!opts.messageBubbles) {
            html += removeHTML(username) + ' ' + settings.language.says + ':<br/>';
          }

          var content = removeHTML(msg);
          if (content.length) {
            consecutive = false;

            content = replaceMessageContent(content);
            html += '<div style="margin: 0 0 0 ' + margin + 'px; color: ' + color + '">' + content + '</div></div></div>';
            $(selector + 'Messages').append(html);

            autoCollapseOperatorDetails();
            scrollBottom();
          }

          if (callback) {
            callback();
          }

        }
      }
    };
  };

  function sendMessage(message, callback) {
    var data = { MESSAGE: message },
      url = opts.server + apiPath + apiEndpoint.send,
      id = 'MessageTextarea',
      obj = $(selector + id);

    if (cookies.session !== undefined && cookies.session.length > 0) {
      data = $.extend(data, { SESSION: cookies.session });
      if (message === 0) {
        $.ajax({ url: url, data: $.param(data), dataType: 'jsonp', cache: false, xhrFields: { withCredentials: true } });
      } else {
        data.JSON = '';
        $.ajax({ url: url, data: $.param(data), success: displaySentMessage(message, callback), dataType: 'jsonp', cache: false, xhrFields: { withCredentials: true } });
        updateTyping(false);
      }
      obj.val('');
      storage.store.set('MessageTextarea', '');
    }
  }

  var queued = [];
  function processForm() {
    var id = 'MessageTextarea',
      obj = $(selector + id),
      message = obj.val(),
      initiate = $(selector + 'Embedded').attr('data-initiate') === 'true';

    if (!opts.connected) {
      startChat(false).done(function () {
        if (initiate && message !== '') {
          sendMessage(message);
        }
      });
      if (!initiate && message !== '') {
        queued.push(message);
        obj.val('');
        storage.store.set('MessageTextarea', '');
      }
      return false;
    }

    if (message !== '') {
      sendMessage(message);
    }
    return false;
  }

  function toggleOfflineChat(force) {
    var initiate = $(selector + 'InitiateChatBubble'),
      button = $('.' + prefix + 'MobileButton');

    if (initiate.is('.opened') || force) {
      // Close Offline Chat
      initiate.animateCss(animationPrefix + 'slideOutRight').done(function () {
        initiate.removeClass('opened sent');
        toggleOfflineSendButton(true);
      });
      button.find('.icon').animateCss(animationPrefix + 'fadeOut').done(function () {
        button.removeClass('opened');
        button.find('.icon').removeClass('close');
      });
    } else {

      // Offline Redirect
      if (settings.offlineRedirect !== '') {
        document.location = settings.offlineRedirect;
        return;
      }

      // Open Offline Chat
      initiate.addClass('opened').animateCss(animationPrefix + 'bounceInRight');
      button.removeClass('hidden').addClass('opened');
      button.find('.icon').addClass('close').animateCss(animationPrefix + 'fadeIn');

      // Adjust Send button
      toggleOfflineSendButton();
    }
  }

  // Embedded Events
  function initEmbeddedEvents() {
    var embed = $(selector + 'Embedded');
    if (embed.length > 0) {

      var offlineMessaging = (opts.sidebar && settings.status === 'Offline');
      if (offlineMessaging) {
        initOfflineEvents();
      }

      $(selector + 'Tab, ' + selector + 'StatusText, .' + prefix + 'Icon, .OperatorImage, .' + prefix + 'Operator, .' + prefix + 'MobileButton').click(function (e) {
        opts.embedded = true;
        if (settings.status === 'Online' || opts.connected) {
          if (embed.is('.closed') || embed.is('.hidden')) {
            if (!storage.data.notificationEnabled) {
              storage.data.notificationEnabled = true;
            }
            openTab(false, false);
          } else {
            closeTab();
          }
          updateStorage();
        } else if (offlineMessaging) {
          var button = $('.' + prefix + 'MobileButton');
          if (button.is('.send')) {
            // Send Offline Email
            var form = $('#OfflineMessageForm');
            validateForm(form, function () {
              offlineSend(function (success) {
                if (success) {
                  // Sent
                  var initiate = $(selector + 'InitiateChatBubble');
                  initiate.addClass('sent');
                  initiate.find('input, textarea').val('');
                  initiate.find('.text.content').text(settings.language.thankyoumessagesent);
                  initiate.find('.sprite.error').removeClass('CrossSmall TickSmall');

                  // Hiden Send Button
                  toggleOfflineSendButton(true);
                } else {
                  // Retry
                  var label = button.find('.label');
                  label.text(settings.language.retry);
                }
              });
            });
          } else {
            // Offline Chat
            toggleOfflineChat();
          }
        } else {
          openLiveHelp();
        }
        e.stopPropagation();
      });

      $(selector + 'StatusText, .' + prefix + 'StatusIndicator, .' + prefix + 'Operator, .OperatorImage, .' + prefix + 'CloseButton').hover(function () {
        $(this).parent().find(selector + 'Tab').addClass('hover');
        $('.' + prefix + 'StatusIndicator').addClass('hover');
      }, function () {
        $(this).parent().find(selector + 'Tab').removeClass('hover');
        $('.' + prefix + 'StatusIndicator').removeClass('hover');
      });

      $(selector + 'CloseButton').click(function () {
        if (settings.status === 'Online' || opts.connected) {
          if ($(this).is('.expand')) {
            openTab(false, false);
          } else {
            closeTab();
          }
        } else {
          openLiveHelp();
        }
      });

      $(selector + 'CloseBlockedButton').click(function () {
        closeTab();
      });

      $(selector + 'CollapseButton').click(function () {
        var top = parseInt($(selector + 'Body').css('top'), 10);
        if (top === 86) {
          hideOperatorDetails();
        } else {
          showOperatorDetails();
        }
      });

      // Email Prompt
      $(selector + 'ContinueEmailInput').on({
        'keypress': function (event) {
          var characterCode,
            email = $(this).val();

          if (event.which === 13) {
            var valid = validateEmail(this, selector + 'ContinueEmailError');
            if (email.length > 0 && valid) {
              var data = { SESSION: cookies.session, EMAIL: email };
              settings.email = data.email;
              $.ajax({
                url: opts.server + apiPath + apiEndpoint.email,
                data: $.param(data),
                success: function (data, textStatus, jqXHR) {
                  $(selector + 'Continue .' + prefix + 'Input, .' + prefix.toLowerCase() + '-continue-text').hide();
                  $(selector + 'Continue .status').text('Thanks!  We will contact you at ' + data.email).show();
                  scrollBottom();
                  $(document).trigger('LiveHelp.EmailComplete');
                },
                dataType: 'jsonp',
                cache: false,
                xhrFields: { withCredentials: true }
              });
            }
            return false;
          } else {
            return true;
          }
        }
      });

    }
  }

  function blockChat() {
    // Block Chat
    opts.connected = false;

    // Javascript API
    updateChatState('disconnected');

    storage.data.chatEnded = true;
    storage.data.department = '';
    storage.data.lastMessage = 0;
    updateStorage();
    message = 0;

    $(selector + 'SignedIn, ' + selector + 'Login #Inputs, ' + selector + 'CollapseButton, ' + selector + 'Toolbar, ' + selector + 'SignInDetails, ' + selector + 'Connecting').fadeOut();
    $(selector + 'SignIn, ' + selector + 'BlockedChatDetails').fadeIn();
    $(selector + 'MessageTextarea').attr('disabled', 'disabled');
    $(selector + 'ClosedChatMessage').show();

    var blocked = $(selector + 'Login #BlockedChat');
    blocked.fadeIn();
    if (blocked.find('img').length === 0) {
      blocked.prepend('<img src="' + opts.server + directoryPath + 'images/Block.png"/>');
    }
  }

  function initChatEvents() {
    var maxWidth = 800;

    // Connected / Disconnect
    $(document).bind(prefix + '.Connected', function (event, id, firstname, department, hash) {
      opts.accepted = true;
      opts.operator = { id: id, firstname: firstname, department: department, hash: hash };
      showOperatorDetails(id, firstname, department, hash, true, true);
    }).bind(prefix + '.Disconnect', function () {
      opts.connected = false;

      // Javascript API
      updateChatState('disconnected');

      storage.data.chatEnded = true;
      storage.data.department = '';
      storage.data.lastMessage = 0;
      updateStorage();
      $(selector + 'Embedded').removeClass('connected').addClass('completed');
      $(selector + 'MessageTextarea').attr('disabled', 'disabled');
      if ($(selector + 'SignedIn').is(':visible') || opts.popup) {
        showRating();
      }
      $.ajax({ url: opts.server + apiPath + apiEndpoint.signout,
        data: { SESSION: encodeURIComponent(cookies.session) },
        dataType: 'jsonp',
        cache: false,
        xhrFields: { withCredentials: true }
      });
    }).bind(prefix + '.BlockChat', function () {
      blockChat();
    });

    $(document).on('click', selector + 'ClosedChatMessage a', function () {
      var input = $(selector + 'Input');
      if (settings.loginDetails === 0) {
        $(selector + 'Body, ' + selector + 'Background').css('background-color', '#fff');
        input.find('textarea').removeAttr('disabled').show();
        input.animate({ bottom: 0, height: '100px' }, 500);
      } else {
        $(selector + 'Connecting').hide();
        $(selector + 'Body, ' + selector + 'Background').css('background-color', '#f9f6f6');
        $(selector + 'SignIn, ' + selector + 'Login #Inputs').show();
        $(selector + 'SignedIn').hide();
        input.find('textarea, ' + selector + 'SmiliesButton, ' + selector + 'Typing').show();
        input.css({ bottom: '-100px', height: '100px' });
      }

      $(selector + 'FeedbackRating, ' + selector + 'ClosedChatMessage').hide();
    });

    // Toolbar
    $(selector + 'Toolbar div').hover(function () {
      $(this).fadeTo(200, 1.0);
    }, function () {
      $(this).fadeTo(200, 0.5);
    });

    // Sound Button
    $(selector + 'SoundToolbarButton').click(function () {
      if (storage.data.soundEnabled) {
        storage.data.soundEnabled = false;
      } else {
        storage.data.soundEnabled = true;
      }
      updateStorage();
      toggleSound();
    });

    if (opts.popup) {
      maxWidth = 675;
    }

    // Disconnect Button
    $(selector + 'DisconnectToolbarButton').fancybox({ href: selector + 'Disconnect', maxWidth: maxWidth, helpers: { overlay: { css: { cursor: 'auto' } }, title: null }, openEffect: 'elastic', openEasing: 'swing', closeEffect: 'elastic', closeEasing: 'swing', beforeShow: function () {
        $(selector + 'Embedded').css('z-index', 900);
        $('.bubbletip').css('z-index', 950);
      }, afterClose: function () {
        $(selector + 'Embedded').css('z-index', 10000000);
        $('.bubbletip').css('z-index', 90000000);
      }
    });

    // Feedback Button
    $(document).on('click', selector + 'FeedbackToolbarButton', function () {
      showRating();
    });

    // Connect Button
    $(document).on('click', selector + 'ConnectButton', function () {
      if (!opts.connecting) {
        startChat().done(function () {
          opts.connecting = false;
        });
      }
    });

    // Button Hover Events
    $(selector + 'DisconnectButton, ' + selector + 'CancelButton, ' + selector + 'ConnectButton').hover(function () {
      var id = $(this).attr('id').replace(prefix, '');
      $(this).toggleClass(id + ' ' + id + 'Hover');
    }, function () {
      var id = $(this).attr('id').replace(prefix, '');
      $(this).toggleClass(id + ' ' + id + 'Hover');
    });
    $(selector + 'CancelButton').click(function () {
      $.fancybox.close();
    });
    $(selector + 'DisconnectButton').click(function () {
      disconnectChat();
    });

    $(selector + 'SmiliesButton').click(function (e) {
      $(this).bubbletip($('#SmiliesTooltip'), { calculateOnShow: true }).open();
      if (e.stopPropagation) {
        e.stopPropagation();
      }
    });

    var textarea = selector + 'MessageTextarea';
    $(textarea).keypress(function (event) {
      var characterCode;
      if ($(textarea).val() === '') {
        updateTyping(false);
      } else {
        updateTyping(true);
      }
      if (event.which === 13) {
        processForm();
        return false;
      } else {
        return true;
      }
    }).blur(function () {
      updateTyping(false);
    }).focus(function () {
      $(selector + 'SmiliesButton').close();
      hideNotification();
      hideTitleNotification();
    });

    $(selector + 'Embedded').click(function () {
      $(selector + 'SmiliesButton').close();
    });

    $(textarea).keyup(function (event) {
      var text = $(textarea).val();
      storage.store.set('MessageTextarea', text);
    });
    $(textarea).val(storage.store.get('MessageTextarea', ''));

    $('#SmiliesTooltip span').click(function () {
      var smilie = $(this).attr('class').replace('sprite ', ''),
        val = $(textarea).val(),
        text = '';

      switch (smilie) {
        case 'Laugh':
          text = ':D';
          break;
        case 'Smile':
          text = ':)';
          break;
        case 'Sad':
          text = ':(';
          break;
        case 'Money':
          text = '$)';
          break;
        case 'Impish':
          text = ':P';
          break;
        case 'Sweat':
          text = ':\\';
          break;
        case 'Cool':
          text = '8)';
          break;
        case 'Frown':
          text = '>:L';
          break;
        case 'Wink':
          text = ';)';
          break;
        case 'Surprise':
          text = ':O';
          break;
        case 'Woo':
          text = '8-)';
          break;
        case 'Tired':
          text = 'X-(';
          break;
        case 'Shock':
          text = '8-O';
          break;
        case 'Hysterical':
          text = 'xD';
          break;
        case 'Kissed':
          text = ':-*';
          break;
        case 'Dizzy':
          text = ':S';
          break;
        case 'Celebrate':
          text = '+O)';
          break;
        case 'Angry':
          text = '>:O';
          break;
        case 'Adore':
          text = '<3';
          break;
        case 'Sleep':
          text = 'zzZ';
          break;
        case 'Stop':
          text = ':X';
          break;
      }
      $(selector + 'MessageTextarea').val(val + text);
    });

    var speech = $(selector + 'MessageSpeech'),
      obj = speech[0];

    if (obj !== undefined) {
      obj.onfocus = obj.blur;
      obj.onwebkitspeechchange = function (e) {
        $(selector + 'MessageTextarea').val(speech.val());
        speech.val('');
      };
    }
  }

  function initDepartments() {
    $(selector + 'DepartmentInput, ' + selector + 'LoginForm select[id=DEPARTMENT]').each(function () {
      var attribute = 'collapsed';
      if ($(this).data(attribute) === undefined) {
        $(this).data(attribute, false);
      }
    });
  }

  function initSignInEvents() {
    var form = selector + 'LoginForm';

    // Sign In Events
    if (settings.requireGuestDetails) {

      $(selector + 'NameInput, ' + form + ' input[id=NAME]').bind('keydown blur', function () {
        validateField(this, selector + 'NameError');
      });

      if (settings.loginEmail) {
        $(selector + 'EmailInput, ' + form + ' input[id=EMAIL]').bind('keydown blur', function () {
          validateEmail(this, selector + 'EmailError');
        });
      }

      if (settings.departments.length > 0) {
        $(selector + 'DepartmentInput, ' + form + ' select[id=DEPARTMENT]').bind('keydown keyup blur change', function () {
          var obj = $(this),
            collapsed = obj.data('collapsed');

          validateField(obj, selector + 'DepartmentError');
          if (!collapsed) {
            obj.animate({ width: obj.width() - 35 }, 250);
            obj.data('collapsed', true);
          }
        });
      }
    }

    if (!settings.loginEmail) {
      $(selector + 'EmailInput, ' + form + ' input[id=EMAIL]').hide();
      $('.' + prefix + 'Login .EmailLabel').hide();
    }

    if (!settings.loginQuestion) {
      $(selector + 'QuestionInput, ' + form + ' input[id=QUESTION]').hide();
      $('.' + prefix + 'Login .QuestionLabel').hide();
    }

  }

  function resizePopup() {
    var height = $(window).height(),
      width = $(window).width(),
      campaign = ($(selector + 'Campaign').length > 0 && !$(selector + 'Campaign').is(':hidden')) ? $(selector + 'Campaign').width() : 0,
      scrollBorder = $(selector + 'ScrollBorder'),
      scroll = $(selector + 'ScrollBorder'),
      messages = $(selector + 'Messages'),
      textarea = $(selector + 'MessageTextarea');

    if (scrollBorder.length > 0 && scroll.length > 0) {
      if (scrollBorder.css('width').indexOf('%') === -1) {
        $(selector + 'Scroll, ' + selector + 'ScrollBorder').css('width', 'auto');
        scroll.css('width', width - campaign - 40 + 'px');
        messages.css('width', width - campaign - 48 + 'px');
        scrollBorder.css('width', width - campaign - 20 + 'px');
      }

      // TODO Test Resizing with WHMCS Template
      $(selector + 'Scroll, ' + selector + 'ScrollBorder').css('height', 'auto').css('height', height - 175 - 10 + 'px');
      $('.body').css({ 'width': width + 'px', 'min-width': '625px' });

      if (textarea.css('width').indexOf('%') === -1) {
        textarea.css('width', width - 165 + 'px');
      }

      width = scrollBorder.css('width');
      var displayWidth = parseInt(width, 10);
      var unitMeasurement = width.slice(-2);
      $(selector + 'Messages img, .' + prefix + 'Image, .' + prefix + 'VideoZoom, .' + prefix + 'VideoHover, .' + prefix + 'ImageZoom, .' + prefix + 'ImageHover').not('.noresize').each(function () {
        var maxWidth = parseInt($(this).css('max-width'), 10),
          maxHeight = parseInt($(this).css('max-height'), 10),
          newWidth = displayWidth - 50,
          aspect = maxHeight / maxWidth,
          newHeight = newWidth * aspect;

        if (newWidth <= maxWidth) {
          $(this).css('width', newWidth + unitMeasurement);
        }
        if (newHeight <= maxHeight || $(this).is('.' + prefix + 'Image')) {
          $(this).css('height', newHeight + unitMeasurement);
        }
      });
      scrollBottom();
    }
  }

  function initPopupEvents() {
    $(window).resize(function () {
      resizePopup();
    });

    $(document).ready(function () {
      initDepartments();
      if (opts.connected) {
        $(selector + 'Login').hide();
        $(selector + 'Chat').fadeIn(250);
        resizePopup();
        startChat();
      }
    });

    initSignInEvents();
    initOfflineEvents();

    if (typeof initCallEvents === 'function') {
      initCallEvents();
    }

    // Setup Sounds
    if (messageSound === undefined) {
      messageSound = new buzz.sound(opts.server + directoryPath + 'sounds/New Message', {
        formats: ['ogg', 'mp3', 'wav'],
        volume: 100
      });
    }

    var id = (document.location.pathname.indexOf(directoryPath + apiEndpoint.call) > -1) ? 'Call' : 'Offline',
      selector = '#' + prefix + id,
      form = $('#' + id + 'MessageForm');

    resetSecurityCode(selector, form);
  }

  // Title Notification Events
  window.isActive = true;

  $(window).focus(function () {
    this.isActive = true;
    hideTitleNotification();
  });

  $(window).blur(function () {
    this.isActive = false;
  });

  if (Chatstack.iframe()) {
    opts.disabled = true;
  }

  // Update Settings
  updateSettings();

  var setupChat = _.once(function() {

    // Image Title
    updateImageTitle();

    // Popup Events
    if (opts.popup) {
      initPopupEvents();
    }

    // jQuery Status Mode Trigger
    $(document).trigger(prefix + '.StatusModeChanged', settings.status);

    // Embedded Chat
    var embed = $(selector + 'Embedded');
    if (embed.length && opts.embedded === true) {
      var style = (settings.language.copyright.length > 0) ? 'block' : 'none',
        dir = (settings.rtl === true) ? 'dir="rtl"' : '',
        rtl = (settings.rtl === true) ? 'style="text-align:right"' : '';

      // Fonts
      if (opts.fonts && settings.fonts) {
        settings.fonts = settings.fonts.replace(/\.\.\/\.\.\/\.\.\//g, opts.server + '/livehelp/');
        var fonts = '<style type="text/css">' + settings.fonts + '</style>';
        $(fonts).appendTo(document.head);
      }

      // Styles
      var embeddedstyles = false || settings.styles;
      if (embeddedstyles.length > 0) {
        // Fix Paths
        embeddedstyles = embeddedstyles.replace(/\.\.\/\.\.\/\.\.\//g, opts.server + '/livehelp/');
        var styles = '<style type="text/css">' + embeddedstyles + '</style>';
        $(styles).appendTo(document.head);
      }

      // Sidebar
      if (embed) {
        if (settings.sidebar) {
          opts.sidebar = true;
        }
        if (opts.sidebar) {
          embed.addClass('sidebar');

          // Logo
          if (settings.images.logo && settings.images.logo.length) {
            var logo = embed.find(selector + 'Logo');
            $('<img src="' + settings.images.logo + '"/>').appendTo(logo);
            embed.addClass('logo');
          }

          // Campaign
          if (opts.popup && settings.campaign.image && settings.campaign.image.length) {
            var campaign = embed.find(selector + 'Campaign');
            $('<a href="' + settings.campaign.link + '" target="_blank"><img src="' + settings.campaign.image + '" border="0" class="LiveHelpCampaignImage"/></a>').appendTo(campaign);
            embed.find(selector + 'Scroll').addClass('campaign');
          }
        }

        if (!opts.popup && (opts.hidden || opts.disabled)) {
          embed.addClass('hidden').removeClass('closed');
        }

        if (opts.popup) {
          if (settings.status === 'Online' || opts.connected) {
            embed.addClass('opened').removeClass('closed');
          } else {
            embed.addClass('hidden');
          }
        }

        var debounceResizeHeight = -1;

        var debounceResizeScroll = _.debounce(function () {
          var height = $(selector + 'Embedded').height();
          if (debounceResizeHeight !== height) {
            debounceResizeHeight = height;
            scrollBottom();
          }
        }, 250);

        // Resizing
        $(window).on('resize', debounceResizeScroll);
      }

      // Placeholders
      $(selector + 'Embedded input, ' + selector + 'Embedded textarea').placeholder();

      var themes = {
        'default': { tab: '#dddedf', theme: 'dark' },
        'green': { tab: '#26c281', theme: 'light' },
        'turquoise': { tab: '#31cbbb', theme: 'light' },
        'blue': { tab: '#3498db', theme: 'light' },
        'purple': { tab: '#8e44ad', theme: 'light' },
        'pink': { tab: '#db0a5b', theme: 'light' },
        'orange': { tab: '#f5ab35', theme: 'light' }
      };

      if (settings.theme) {
        opts.theme = settings.theme;
      }

      // Set Theme Options
      if (opts.theme !== 'light' && opts.theme !== 'dark' && themes[opts.theme] !== undefined) {
        var themeoptions = themes[opts.theme];
        $(selector + 'Tab, .' + prefix + 'MobileButton').css('background-color', themeoptions.tab);
        opts.theme = themeoptions.theme;
      }

      // Set Light / Dark Theme
      if (opts.theme !== undefined && opts.theme === 'light') {
        $(selector + 'CloseButton, ' + selector + 'StatusText, .' + prefix + 'MobileButton').addClass('light');
      }

      // Chat Button Image
      if (settings.images.button) {
        var button = $('.' + prefix + 'MobileButton'),
          buttoncss = 'image-custom';

        if (settings.images.button.indexOf('http://') > -1 || settings.images.button.indexOf('https://') > -1) {
          button.css('background-image', 'url("' + settings.images.button + '")');
        } else {
          buttoncss = 'image-' + settings.images.button;
        }

        if (opts.sidebar) {
          buttoncss += ' sidebar';
        }
        button.addClass(buttoncss);
      }

      if (opts.colors !== undefined) {
        if (opts.colors.tab !== undefined && opts.colors.tab.normal !== undefined) {
          $(selector + 'Tab, .' + prefix + 'MobileButton').css('background-color', opts.colors.tab.normal);
          if (opts.colors.tab.hover !== undefined) {
            $(selector + 'Tab, .' + prefix + 'MobileButton').hover(function () {
              $(this).css('background-color', opts.colors.tab.hover);
            }, function () {
              $(this).css('background-color', opts.colors.tab.normal);
            });
          }
        }
      }

      // Language
      $.each(settings.language, function (key, value) {
        var element = $(selector + 'Embedded [data-lang-key="' + key + '"]');
        if (element.length > 0) {
          element.text(value);
        }
      });

      // Events
      initEmbeddedEvents();
      initSignInEvents();
      initChatEvents();

      var image = opts.server + apiPath + apiEndpoint.image + '?override=true&size=150&round=true';
      if (opts.account !== undefined) {
        image = opts.server + apiPath + apiEndpoint.image + '/round/default/150px/';
      }

      var op = settings.embeddedinitiate;
      if (op !== undefined && op.id > 0 && op.photo) {
        opts.chatBubbles = true;
      }

      if (opts.chatBubbles) {

        if (op.id > 0) {
          showOperatorDetails(op.id, op.name, op.department, op.avatar);
        }

        var operator = $(selector + 'Embedded .' + prefix + 'Operator');
        $(selector + 'StatusText').css('left', '70px');
        operator.find('.OperatorImage').show();
        operator.show();
      }

      // TODO File Transfer Button
      /*
      $(selector + 'SendFileButton').fancybox({ href: selector + 'FileTransfer', closeClick: false, nextClick: false, arrows: false, mouseWheel: false, keys: null, helpers: { overlay: { css: { cursor: 'auto' }, closeClick: false }, title: null }, openEffect: 'elastic', openEasing: 'swing', closeEffect: 'elastic', closeEasing: 'swing', margin: [25, 405, 25, 25] });

      // Hover File Transfer
      $(selector + 'FileTransfer').hover(function () {
        $('#FileTransferText').fadeIn(250);
      }, function () {
        $('#FileTransferText').fadeOut(250);
      });
      */

      // Popup Windows Button
      $(selector + 'SwitchPopupToolbarButton').click(function () {
        opts.embedded = false;
        closeTab(function () {
          storage.data.notificationEnabled = false;
          updateStorage();
        });
        openLiveHelp($(this));
      });

      // TODO HTML5 Drag Drop Events
      /*
      $('.FileTransferDropTarget').bind('dragover', function (event) {
        ignoreDrag(event);
      }).bind('dragleave', function (event) {
        var element = $(this);
        element.css('border-color', '#7c7b7b');
        element.css('background-color', '#fff');
        element.stop();
        $('#FileTransferText').fadeOut(250);
        ignoreDrag(event);
      }).bind('dragenter', function (event) {
        var element = $(this);
        element.css('border-color', '#a2d7e5');
        element.css('background-color', '#d3f3fa');
        element.pulse({backgroundColor: ['#d3f3fa', '#e9f9fc']}, 500, 5);
        $('#FileTransferText').fadeIn(250);
        ignoreDrag(event);
      }).bind('drop', acceptDrop);
      */

      // Load Storage
      loadStorage();

      // Departments
      updateDepartments(settings.departments);

      // Online
      if (cookies.session !== undefined && cookies.session.length > 0) {
        if (settings.status === 'Online') {
          if (opts.connected) {
            if (storage.data.tabOpen) {
              openTab(false, false);
            }
          } else {
            var initiate = $(selector + 'InitiateChatBubble').is(':visible');

            if (embed.is(':hidden')) {
              $(selector + 'Waiting').hide();
              if (!initiate && (!settings.initiate.enabled || !opts.initiateDelay)) {
                if (!embed.is('.sidebar')) {
                  embed.fadeIn(50);
                }

                var css = 'show';
                if (opts.disabled) {
                  css += ' hidden';
                }
                $('.' + prefix + 'MobileButton').removeClass('hide').addClass(css);
              }
              loadStorage();
            }
          }
        } else {
          if (opts.connected && storage.data.tabOpen) {
            openTab(false, false);
          }
        }
      }

      // Login Details
      var form = selector + 'LoginForm',
        name = $(selector + 'NameInput, ' + form + ' :input[id=NAME]'),
        email = $(selector + 'EmailInput, ' + form + ' :input[id=EMAIL]'),
        inputs = $(selector + 'SignIn').find('input, textarea');
      if (opts.name !== undefined && opts.name.length > 0) {
        name.val(opts.name);
        if (settings.requireGuestDetails) {
          validateField(name, selector + 'NameError');
        }
      }
      if (opts.email !== undefined && opts.email.length > 0) {
        email.val(opts.email);
        if (settings.requireGuestDetails) {
          validateEmail(email, selector + 'EmailError');
        }
      }
      if (!settings.requireGuestDetails) {
        inputs.css('width', '100%');
      }

      // Auto Load / Connected
      if (opts.connected) {
        showChat();
      }

      // Update Status
      if (settings.status !== undefined && settings.status.length > 0) {
        changeStatus(settings.status, settings.departments);
      }

      // Update Settings
      overrideSettings();

    }
  });

  $(document).bind(prefix + '.SettingsUpdated', function () {
    setupChat();
  });

  $(document).bind(prefix + '.StatusModeUpdated', function (event, data) {
    var message = data.data;
    settings.departments = message.departments;
    changeStatus(message.status, settings.departments);
  });

  $(document).bind(prefix + '.WebSocketStateChanged', function (event, data) {
    websockets = data.connected;
    if (plugins.websockets !== undefined && plugins.websockets.enabled === true) {
      if ((plugins.websockets.state !== 'established' && data.state === 'established') || (plugins.websockets.state !== 'error' && data.state === 'error')) {
        plugins.websockets.state = data.state;
        trackVisitInitalise();
      }
    } else {
      throttledTrackVisit();
    }
  });

  $(document).bind(prefix + '.UpdateMessages', function (event, data) {
    if (data !== undefined) {
      if (data.status === undefined) {
        data.status = 0;
      } else if (data.status > 0) {
        promptEmail();
      }
    }
    opts.accepted = true;
    updateMessages();
  });

  function showEmailPrompt(text) {
    var elem = $(selector + 'Continue'),
      messages = $(selector + 'Messages');

    if (settings.email === false) {
      if (text !== false) {
        elem.find('.' + prefix.toLowerCase() + '-continue-text').text(text);
      }
    } else {
      elem.find('.' + prefix.toLowerCase() + '-continue-text').text('Hmm looks like there was no response.  We will reply via email shortly.');
      elem.find('.' + prefix + 'Input').hide();
      if (settings.email !== undefined) {
        elem.find('.status').text('We will contact you at ' + settings.email).show();
      }
    }

    if (!messages.find(selector + 'Continue').length) {
      $(elem).appendTo(messages).show().attr('data-datetime', (Date.now() / 1000 | 0));
      scrollBottom();
    }
  }

  var promptEmail = _.debounce(function () {
    showEmailPrompt(false);
  }, 90000);

  var promptPrechatEmail = _.debounce(function () {
    if (!opts.accepted) {
      showEmailPrompt(false);
    }
  }, opts.promptPrechatDelay);

  $(document).bind(prefix + '.MessageReceived', function (event, data) {
    // Default Alignment and Status
    if (data.align === undefined) {
      data.align = 1;
    }
    if (data.status === undefined) {
      data.status = 0;
    }

    if (data.status > 0) {
      promptEmail();
    }
    outputMessages([data]);
  });

  // Document Ready
  $(document).ready(function () {

    // Document Ready Placeholder

    // Title
    title = $(document).attr('title');

    // Javascript API
    updateChatState('idle');
    updateInitiateChatState('idle');

    // Insert Web Fonts
    if (opts.fonts) {
      var css = '<link href="' + opts.protocol + 'fonts.googleapis.com/css?family=Lato" rel="stylesheet" type="text/css"/>';
      $(css).appendTo('head');
    }

    // Title Notification Event
    $(this).click(function () {
      hideTitleNotification();
    });

    if (settings !== undefined && settings.status !== undefined) {
      setupChat();
    }

    // Override Settings
    overrideSettings();

    // Resize Popup
    if (opts.popup) {
      resizePopup();
    }

    // Setup Initiate Chat / Animation
    if (typeof resetPosition !== 'undefined') {
      $(window).bind('resize', resetPosition);
    }

    // Open Live Help Event
    $(document).on('LiveHelp.OpenLiveHelp', function () {
      openLiveHelp();
    });

    // Open Initiate Chat Tab
    $(document).on('LiveHelp.OpenInitiateChatTab', function () {
      openInitiateChatTab();
    });

    // External Message API
    $(document).on('LiveHelp.SendMessage', function (e, message) {
      console.log('LiveHelp.SendMessage Trigger');
      //sendMessage(message, false, update, operatoronly);
    });

    $(document).on('LiveHelp.DisplayMessage', function (e, message) {
      console.log('LiveHelp.DisplayMessage Trigger');
      console.log(message);
      //outputMessages([message]);
    });

    // Hash Change Event
    if ('onhashchange' in window) {
      $(window).on('hashchange', function () {
        trackVisit(true, true);
      });
    }

    // Javascript API
    Chatstack.openChat = function () {
      openLiveHelp();
    };

    Chatstack.closeChat = function () {
      closeTab();
    };

    Chatstack.disconnectChat = function () {
      if (Chatstack.chatState === 'connected') {
        disconnectChat();
      }
    };

    Chatstack.openInitiateChat = function () {
      displayInitiateChat(true, true);
    };

    Chatstack.closeInitiateChat = function () {
      closeInitiateChat(true)();
    };

  });

})(this, document, 'LiveHelp', Chatstack, Chatstack._, jQuery);
