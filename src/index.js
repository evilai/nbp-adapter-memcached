import reduce from 'lodash/reduce';
import isNumber from 'lodash/isNumber';
import Memcached from 'memcached';

// TODO: Think about better place for the constant
const LIFETIME = 720000; // 7200 = 2h

export default function({ logger, address, port, platform }) {
    const memcached = new Memcached(`${address}:${port}`);

    memcached.on('issue', (details) => console.error(`Memcached server ${details.server} went down due to: ${details.messages.join(', ')}`));;
    memcached.on('failure', (details) => console.error(`Memcached server ${details.server} went down due to: ${details.messages.join(', ')}`));;
    memcached.on('reconnecting', (details) => console.log(`Total downtime caused by server ${details.server}: ${details.totalDownTime}ms`));

    logger.debug(`Memcached running on ${address}:${port}`);

    return function(entryId, senderId) {
        const keyPrefix = key => `${platform}.${entryId}.${senderId}.${key}`;

        return {
            get: key => new Promise((resolve) => memcached.get(keyPrefix(key), (err, data) => resolve(data))),
            del: key => new Promise((resolve) => memcached.del(keyPrefix(key), (err, data) => resolve(data))),
            set: (key, data, lifetime) => new Promise((resolve) => {
                const time = isNumber(lifetime) ? lifetime : LIFETIME;
                memcached.set(keyPrefix(key), data, time, (err, savedData) => resolve(savedData));
            }),
            touch: (key, data, lifetime) => new Promise((resolve) => {
                const time = isNumber(lifetime) ? lifetime : LIFETIME;
                memcached.touch(keyPrefix(key), data, time, (err, savedData) => resolve(savedData));
            }),
            getMulti: keys => new Promise((resolve) => {
                memcached.getMulti(keys.map((key) => keyPrefix(key)), (error, data = {}) => {
                    resolve(reduce(data, (acc, value, key) => {
                        const keyParts = key.split('.');
                        acc[keyParts[keyParts.length - 1]] = value;
                        return acc;
                    }, {}));
                });
            }),
            incr: (key, value) => new Promise((resolve) => {
                const increaseValue = isNumber(value) ? value : 1;
                memcached.incr(keyPrefix(key), increaseValue, (err, data) => resolve(data));
            }),
            decr: (key, value) => new Promise((resolve) => {
                const increaseValue = isNumber(value) ? value : 1;
                memcached.decr(keyPrefix(key), increaseValue, (err, data) => resolve(data));
            }),
            append: (key, value) => new Promise((resolve) => memcached.append(keyPrefix(key), value, (err, data) => resolve(data)))
        };
    };
}
