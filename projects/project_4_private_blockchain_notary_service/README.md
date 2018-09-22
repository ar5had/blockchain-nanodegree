# Private Notary Service

A Star Registry service that allows users to claim ownership of their favorite star in the night sky.

## Architecture
Local Server
- Node.js
- Express.js

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project
- Clone/Download the project and cd into the root folder
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

## Endpoints

### GET endpoint
**Get a registered star with a particular hash**
```
http://localhost:<PORT>/stars/hash:<hash>
```

**Get allregistered stars belonging to a particular address**
```
http://localhost:<PORT>/stars/address:<address>
```

### POST endpoint

**Create star registeration request**
```
http://localhost:<PORT>/requestValidation
```
**Params**
```
{
  "address": "1JHoNc4exPSTgwduGPAjMkPYC7egxVehs8"
}
```

**Verify identity by signing the message returned in response of star registeration request**
```
http://localhost:<PORT>/message-signature/validate
```
**Params**
```
{
  "address": "1JHoNc4exPSTgwduGPAjMkPYC7egxVehs8"
  "signature":  "H/T40wjVKxHdsgApFhBXm2kNotxY4HERYbZZvYvT9IuAU8d78pf5I6/8WWGQ2dMows6GIVKZYrfoTprRnaTMB54="
}
```

**Register Star**
```
http://localhost:<PORT>/block
```
**Params**
```
{
  "address": "1JHoNc4exPSTgwduGPAjMkPYC7egxVehs8",
  "star": {
    "dec": "-26° 29'\'' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
    "constellation": ""[Optional]
    "mag": ""[Optional]
  }
}
```
