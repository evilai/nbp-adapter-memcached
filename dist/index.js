'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.memcachedTunneling = undefined;

var _tunneling = require('./tunneling');

Object.defineProperty(exports, 'memcachedTunneling', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_tunneling).default;
    }
});

exports.default = function (_ref) {
    var logger = _ref.logger;
    var address = _ref.address;
    var port = _ref.port;
    var platform = _ref.platform;

    var memcached = new _memcached2.default(address + ':' + port);

    memcached.on('issue', function (details) {
        return console.error('Memcached server ' + details.server + ' went down due to: ' + details.messages.join(', '));
    });;
    memcached.on('failure', function (details) {
        return console.error('Memcached server ' + details.server + ' went down due to: ' + details.messages.join(', '));
    });;
    memcached.on('reconnecting', function (details) {
        return console.log('Total downtime caused by server ' + details.server + ': ' + details.totalDownTime + 'ms');
    });

    logger.debug('Memcached running on ' + address + ':' + port);

    return function (entryId, senderId) {
        var keyPrefix = function keyPrefix(key) {
            return platform + '.' + entryId + '.' + senderId + '.' + key;
        };

        return {
            get: function get(key) {
                return new Promise(function (resolve) {
                    return memcached.get(keyPrefix(key), function (err, data) {
                        return resolve(data);
                    });
                });
            },
            del: function del(key) {
                return new Promise(function (resolve) {
                    return memcached.del(keyPrefix(key), function (err, data) {
                        return resolve(data);
                    });
                });
            },
            set: function set(key, data, lifetime) {
                return new Promise(function (resolve) {
                    var time = (0, _isNumber2.default)(lifetime) ? lifetime : LIFETIME;
                    memcached.set(keyPrefix(key), data, time, function (err, savedData) {
                        return resolve(savedData);
                    });
                });
            },
            touch: function touch(key, data, lifetime) {
                return new Promise(function (resolve) {
                    var time = (0, _isNumber2.default)(lifetime) ? lifetime : LIFETIME;
                    memcached.touch(keyPrefix(key), data, time, function (err, savedData) {
                        return resolve(savedData);
                    });
                });
            },
            getMulti: function getMulti(keys) {
                return new Promise(function (resolve) {
                    memcached.getMulti(keys.map(function (key) {
                        return keyPrefix(key);
                    }), function (error) {
                        var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                        resolve((0, _reduce2.default)(data, function (acc, value, key) {
                            var keyParts = key.split('.');
                            acc[keyParts[keyParts.length - 1]] = value;
                            return acc;
                        }, {}));
                    });
                });
            },
            incr: function incr(key, value) {
                return new Promise(function (resolve) {
                    var increaseValue = (0, _isNumber2.default)(value) ? value : 1;
                    memcached.incr(keyPrefix(key), increaseValue, function (err, data) {
                        return resolve(data);
                    });
                });
            },
            decr: function decr(key, value) {
                return new Promise(function (resolve) {
                    var increaseValue = (0, _isNumber2.default)(value) ? value : 1;
                    memcached.decr(keyPrefix(key), increaseValue, function (err, data) {
                        return resolve(data);
                    });
                });
            },
            append: function append(key, value) {
                return new Promise(function (resolve) {
                    return memcached.append(keyPrefix(key), value, function (err, data) {
                        return resolve(data);
                    });
                });
            }
        };
    };
};

var _reduce = require('lodash/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

var _isNumber = require('lodash/isNumber');

var _isNumber2 = _interopRequireDefault(_isNumber);

var _memcached = require('memcached');

var _memcached2 = _interopRequireDefault(_memcached);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: Think about better place for the constant
var LIFETIME = 720000; // 7200 = 2h