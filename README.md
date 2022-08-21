# Nauka Relay

## IMPORTANT:
Nauka was an attempt at creating a nostr relay-client monorepo. The code is terrible and you are better off using something like [nostr-rs-relay](https://sr.ht/~gheartsfield/nostr-rs-relay/) (written in Rust), or the [nostr-ts-relay](https://github.com/Cameri/nostr-ts-relay) (written in TypeScript). I made a bunch of wrong decisions while creating it and ended up overengineering it, so the repo has been archived.
<br>
<br>
The name nauka is being used on my [new project](https://github.com/basantagoswami/nauka), a nostr client for blogging.
<br>
<br>
If you want to try running this relay, you can go through the following instructions:
<br>
<br>

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
