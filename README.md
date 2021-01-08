# Guardian

Guardian is an API server for a toy project, where users can register themselves as guardians (for a temporary period of time) to pets that are registered in the service.

This project uses:

- [Typescript](https://github.com/microsoft/TypeScript) as the main language
- [Express](https://github.com/expressjs/express) as server framework
- [MySQL](https://www.mysql.com/) as database
- [tsoa](https://github.com/lukeautry/tsoa) for automated routes & swagger specification generation
- [Jest](https://jestjs.io/) as testing framework

## Getting Started

After cloning this repository, run:

`npm install`

To run the development server, run:

`npm run dev`

To run testing, run:

`npm test`

To generate swagger documentation only (to `docs/swagger.json`), run:

`npm run tsoa`
