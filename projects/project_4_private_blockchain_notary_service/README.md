# Private Notary Service

A Star Registry service that allows users to claim ownership of their favorite star in the night sky.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project
- Clone/Download the project and cd into it

- Install all dependencies via npm.
```
npm install
```

## Running project
- Create `.env` file in root of the project which will have our custom node env vars
```
# Sample .env file
PORT = 8000
NODE_ENV = development
```

- Run command
```
npm start
```
and now open `localhost:<PORT>` in your browser window.

## How it works
