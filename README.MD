# Memcached adapter
This is a Memcached adapter for Node.js Bot Platform.

```js
import memcachedAdapterFactory from 'nbp-adapter-memcached';
const memcachedAdapter = memcachedAdapterFactory({
    address: 'localhost',
    port: '11211',
    platform: 'your-platform-name'
});
```

Then you can pass `entryId` (can be you FB Page ID) and `senderId` (user ID) and recieve memcached instance:

```js
const memcached = memcachedAdapter({
    entryId: 'fb-page-id',
    senderId: 'user-id'
});

memcached.get('key').then(value => {});
// or
const value = yield memcached.get('key');
```

Here are basic available methods:

* `get(KEY)` – get KEY value;
* `del(KEY)` – remove KEY value;
* `set(KEY, VALUE, [LIFETIME])` – set VALUE to the key KEY with LIFETIME in _ms_, by default LIFETIME is 2 hours;
* `getMulti([ KEY1, KEY2, KEY3 ])` – get an object with shape: { KEY1: VALUE1, KEY2: VALUE2, KEY3: VALUE3 }.

Please, look at [usage example](https://github.com/evilai/nodejs-bot-platform/blob/master/src/bot/skills/clusters/minor/greetings/increase-greet-count.js).