<p align="center"><img src="https://uploads-ssl.webflow.com/62434be6096bbb00e80dbf0d/62434be6096bbb34250dbf16_logo.png" width="270px"></p>

# BlockRabies-DTPS

[![License](https://img.shields.io/badge/License-LGPL%203.0%20only-blue.svg)](https://opensource.org/licenses/LGPL-3.0)
[![Discord](https://img.shields.io/badge/Telegram-dHealthCommunity-informational?style=flat&color=blue&label=Discord&logo=discord&logoColor=white)][discord]
[![Telegram](https://img.shields.io/badge/Telegram-dHealthCommunity-informational?style=flat&logo=telegram)][telegram]

- [Introduction](#introduction)
- [Overview](#overview)
- [API Specification](#api-specification)
- [Deployment](#deployment)
- [Functions found here](#functions-found-here)
- [Install Notes](#install-notes)
- [License](#license)

## Introduction

`BRApp` is the `BlockRabies` application used for managing event data around the movement of Rabies vaccines from the manufacturer all the way to the patient. The core objective of `BlockRabies` is to write this data to the blockchain in order to enable incorruptible audits of the entire supply chain.

At present, the `BlockRabies` application is written in `PHP` and installed directly on the servers at the various clinics and supply chain facilities. On the other hand, the `dHealth` blockchain libraries (the `“dHealth SDK”`) are implemented using `TypeScript` and run using `node.js`. Thus, any transaction that is generated by the `BRApp` must use the `TypeScript` libraries in order to generate digital signatures for the blockchain transactions.

This document describes a proxy server, written in `node.js`, that enables the `PHP` `BRApp` instance to send data to the blockchain. This is a temporary solution until the `PHP` app can be upgraded to interface directly with locally installed dhealth client libraries written in `node.js`.

## Overview

![alt text](./docs/BlockRabies%20Blockchain%20Transaction%20Proxy%20Service.png)

1. The `BlockRabies` app is configured to set labels for each role for which it needs to submit transactions. Example: `“Bouake Clinic”` or `“Abidjan Pharmacy”`.

2. The `dHealth Transaction Proxy Server (DTPS)` is configured with:
the allow-list of IP addresses from which requests should be accepted.
a map of each `BlockRabies` label and its corresponding `dHealth` wallet keys.

3. During operation, the `BlockRabies` app sends an API request to the `DTPS`, specifying the source and destination labels and the data to be announced. The data should be plain text and limited to **1000 characters**.

4. The `DTPS` creates a transaction using the private key and public key corresponding to the specified source and destination labels, and including the specified data as the transaction payload.

5. The success code from the transaction request is returned to the caller as the result of the API call.

## API specification

There will be a single HTTPS API endpoint named `/announce`.

Each request will include an authorization code.

The post data will be a JSON format plain text, with two fields:
- `sender`: this uniquely identifies the entity on whose behalf the announcement will be made.
- `data`: this is an application-specific json formatted string that will be included in the blockchain transaction. It is NOT interpreted by the `DTPS`, but instead directly attached to the transaction.

The HTTPS result code will indicate the success or failure of the blockchain transaction creation operation.

### Example:

```
POST https://dtps.dhealth.cloud/announce
```

```
post-data:
{
  “sender”: “ML-bouake-clinic”,
  “data”: {
    “event”: “RECEIVED”,
    “entity”: “mali-supplier1”,
    “serial_numbers”: “abc123,def456,geh789,ijk012”
  }
}
```

```
result: http response code corresponding to transaction creation status.
```

## Deployment

Ideally, the `DTPS` should be hosted on a cloud service to avoid service interruptions. Given its stateless nature, it can most easily be implemented as a [firebase cloud function](https://firebase.google.com/docs/functions) (equivalent to an AWS lambda function), that is able to communicate with any one of several available blockchain nodes.


## Functions found here

Following functions are defined and exported with this library:

| Class | Description |
| --- | --- |
| [`dtps`](./functions/src/index.ts) | This function acts as the dHealth Transaction Proxy Service, which allow BlockRabies clients to send transactions to the `dHealth` blockchain network with given data. |

## Install Notes

## Development

Serving the cloud functions locally works by executing the following command from the *root directory of the project*:

```bash
npm run serve
```

This will serve the cloud functions locally with `http://localhost:5001` and the hosting service locally at [`http://localhost:5000`](http://localhost:5000).

## Deployment

Cloud functions can be deployed to Firebase using the following command:

```bash
npm run deploy
```


## License

Copyright 2022-present [dHealth Network][parent-url], All rights reserved.

Licensed under the [LGPL v3.0](LICENSE)

[parent-url]: https://dhealth.com
[discord]: https://discord.gg/P57WHbmZjk
[telegram]: https://t.me/dHealthCommunity