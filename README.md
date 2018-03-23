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

## requestOptions

| Option                 | Default                   | Description
|--------                |---------                  |---------
| `timeout`              | `3000`                    | request timeout