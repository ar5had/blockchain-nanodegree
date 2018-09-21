# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

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

## Testing

### `simpleChain.js`

To test code:
1: Open a command prompt or shell terminal after install node.js.
2: Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).
```
node
```
3: Copy and paste your code into your node session
4: Instantiate blockchain with blockchain variable
```
let blockchain = new Blockchain();
```
5: Generate 10 blocks using a for loop
```
for (var i = 0; i <= 10; i++) {
  blockchain.addBlock(new Block("test data "+i));
}
```
6: Validate blockchain
```
blockchain.validateChain();
```
7: Mutate block
```
let newBlock = new Block("arshad");
let blockHeight = 2;
blockchain.mutateBlock(blockHeight, newBlock);
```
8: Validate blockchain. The chain should now fail with blocks 2,4, and 7.
```
blockchain.validateChain();
```
### `index.js`

- GET req to `/block/[blockheight]` return block at that particular block height

- POST req to `/block` with `blockBody` key creates new block on blockchain with value of `blockBody`

**Open `localhost:<PORT>` to see more info about the endpoints**
