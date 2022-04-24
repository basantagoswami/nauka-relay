# Nauka

Nauka is an attempt at creating a social network using the [nostr](https://github.com/fiatjaf/nostr) protocol. For now it is just a **nostr relay** that runs on nodejs, but is going to be a client, relay monorepo in the future.


## Installation

### You'll need:

- NodeJs    (v16.14.2)
- PostgreSQL (14.2)

Running it with olders versions of node (and npm) and postgres might cause some issues.

### Install the dependencies
```bash
$ npm install
```

## .env

Create an .env file in the root of this project directory and include the postgres connection params. Examples:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=username
DB_PASSWORD=password
DB_NAME=nauka
```
## Setup db

```
npx typeorm migration:run
```

## Running the app

```bash
# development
$ npm run start

# dev with watch mode
$ npm run start:dev

# debug
$ npm run start:debug

# production mode
$ npm run start:prod
```

## License

Nauka is MIT licensed.
