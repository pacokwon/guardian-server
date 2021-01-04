# Guardian

## Getting Started

After cloning this repository, run:

```bash
npm install
```

This project contains scripts to initialize(a.k.a. populate) the MYSQL database with a handful of random data beforehand. In order to use this feature, one must register and retrieve an API key from the (Cat API)[https://docs.thecatapi.com/authentication] and use the key by creating an `.env` file at the project root(refer to `.env.example`). One also must create an `ormconfig.json` from the example configuration `ormconfig.example.json`. At least the password of the database must be filled in.

Once the above two requirements are met, one can run:

```bash
npm run populate
```

to populate the database.
