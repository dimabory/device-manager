# device manager
[![Code style: airbnb](https://img.shields.io/badge/code%20style-airbnb-blue.svg?style=flat-square)](https://github.com/airbnb/javascript)

Simple Registry and API for it.

## Run locally

### Prerequisites

- nvm https://github.com/creationix/nvm#installation (install latest LTS)
- [Docker](https://www.docker.com)

### Run the application locally

Install dependencies
```
$ npm i
```

Start database
```
docker-compose up -d
```

Run development server
```
$ npm run start:dev
```

Server will run on http://localhost:3000 (swagger-ui on http://localhost:3000/docs)

### Run tests

Locally

```
$ npm test
```

with coverage

```
$ npm run test:coverage
```

