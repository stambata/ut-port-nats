# ut-port-nats

# configurable options




```js
{
    id: 'string',
    logLevel: 'string',
    requestOptions: 'object',
    options: 'object'
}
```

## id
The id of the port - random string

## logLevel
Loggin level = one of ['trace', 'debug', 'info', 'warn', 'error', 'fatal']

## namespace
The the port namespaces. e.g. ['service1', 'service2'] - used as a namespace for calling external services

## api
The methods which should be exposed. e.g. ['customer'] - used to expose the methods which to be callable from outside

## requestOptions

| Option                 | Default                   | Description
|--------                |---------                  |---------
| `timeout`              | `3000`                    | request timeout

## options

nats client specific options

| Option                 | Aliases                                      | Default                   | Description
|--------                |---------                                     |---------                  |------------
| `encoding`             |                                              | `"utf8"`                  | Encoding specified by the client to encode/decode data
| `json`                 |                                              | `false`                   | If true, message payloads are converted to/from JSON
| `maxPingOut`           |                                              | `2`                       | Max number of pings the client will allow unanswered before rasing a stale connection error
| `maxReconnectAttempts` |                                              | `10`                      | Sets the maximun number of reconnect attempts. The value of `-1` specifies no limit
| `name`                 | `client`                                     |                           | Optional client name
| `noRandomize`          | `dontRandomize`, `NoRandomize`               | `false`                   | If set, the order of user-specified servers is randomized.
| `pass`                 | `password`                                   |                           | Sets the password for a connection
| `pedantic`             |                                              | `false`                   | Turns on strict subject format checks
| `pingInterval`         |                                              | `120000`                  | Number of milliseconds between client-sent pings
| `preserveBuffers`      |                                              | `false`                   | If true, data for a message is returned as Buffer
| `reconnect`            |                                              | `true`                    | If false server will not attempt reconnecting
| `reconnectTimeWait`    |                                              | `2000`                    | If disconnected, the client will wait the specified number of milliseconds between reconnect attempts
| `servers`              | `urls`                                       |                           | Array of connection `url`s
| `tls`                  | `secure`                                     | `false`                   | This property can be a boolean or an Object. If true the client requires a TLS connection. If false a non-tls connection is required.  The value can also be an object specifying TLS certificate data. The properties `ca`, `key`, `cert` should contain the certificate file data. `ca` should be provided for self-signed certificates. `key` and `cert` are required for client provided certificates. `rejectUnauthorized` if `true` validates server's credentials
| `token`                |                                              |                           | Sets a authorization token for a connection
| `url`                  | `uri`                                        | `"nats://localhost:4222"` | Connection url
| `useOldRequestStyle`   |                                              | `false`                   | If set to `true` calls to `request()` and `requestOne()` will create an inbox subscription per call.
| `user`                 |                                              |                           | Sets the username for a connection
| `verbose`              |                                              | `false`                   | Turns on `+OK` protocol acknowledgements
| `waitOnFirstConnect`   |                                              | `false`                   | If `true` the server will fall back to a reconnect mode if it fails its first connection attempt.
| `yieldTime`            |                                              |                           | If set, processing will yield at least the specified number of milliseconds to IO callbacks before processing inbound messages


# Performance Tests
## Prerequesites

[Download NATS](https://nats.io/download/) and use [this](https://nats.io/documentation/server/gnatsd-cluster/) guide to start the NATS server standalone or in a cluster.

## Test execution

Use [Visual studio code](https://code.visualstudio.com/) and run the `perf` launch with `Ctrl + F5`. If you want to run some tests directly in a bash console or a command prompt check [here](./.vscode/launch.json) what environment variables need to be passed.

Currently the following environment variables are available:

| Variable               | Default                   | Description
|--------                |---------                  |---------
| `workers`              | `1`                       | how many servers to start which will join one and the same queue group
| `iterations`           | `1`                       | how many requests to be sent by the client
| `autoClose`            | `false`                   | whether all connections should be close after the tests finish


# Monitoring

The recommended monitoring tool is [natsboard](https://github.com/devfacet/natsboard)
