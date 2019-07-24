WebdriverIO CrossBrowserTesting Service
==========

> A WebdriverIO service that manages local tunnel and job metadata for CrossBrowserTesting users.

## Installation

Simply run:

```bash
npm install --save-dev wdio-crossbrowsertesting-service
```

## Configuration



```js
// wdio.conf.js
export.config = {
  // ...
  services: ['crossbrowsertesting'],
  user: process.env.YOUR_USERNAME,
  key: process.env.YOUR_ACCESS_KEY,
  cbtTunnel: true,
  // ...
};
```

## Options

### user
Your CBT username.

Type: `String`

### key
Your CBT authkey.

Type: `String`

### cbtTunnel
If true secure CBT local connection is started.

Type: `Boolean`<br>
Default: `false`


For more information on WebdriverIO see the [homepage](http://webdriver.io).