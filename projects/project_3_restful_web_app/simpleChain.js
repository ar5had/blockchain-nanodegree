const SHA256 = require('crypto-js/sha256')
const {
  addLevelDBData,
  getLevelDBData,
  getAllLevelDBData
} = require('./levelSandbox')
const { Block } = require('./block')

class Blockchain {
  constructor() {
    getAllLevelDBData()
      .then(data => {
        if (data.length === 0) {
          this.addBlock(new Block('Genesis Block - The very first block.'))
        }
      })
      .catch(err => console.log(`Got error while fetching whole data from levelDB - ${err}`))
  }

  //mutate block
  mutateBlock(blockHeight, block) {
    return (new Promise((resolve, reject) => {
      blockHeight = blockHeight.toString()
      addLevelDBData(blockHeight, JSON.stringify(block))
        .then(resolve)
        .catch(reject)
    }))
  }

  // prints the chain of block
  showChain() {
    getAllLevelDBData()
      .then(data => {
        console.log('*'.repeat(100))
        console.log(data)
        console.log('*'.repeat(100), '\n')
      })
      .catch(err => {
        console.log("Error occurred while calling getAllLevelDBData - showBlockChain")
      })
  }


  // Add new block
  addBlock(newBlock) {
    return new Promise((resolve, reject) => {
      getAllLevelDBData()
        .then(data => {
          // Block height
          newBlock.height = data.length
          // UTC timestamp
          newBlock.time = new Date().getTime().toString().slice(0, -3)
          // previous block hash
          if (data.length > 0) {
            newBlock.previousBlockHash = data[data.length - 1].hash
          }
          // Block hash with SHA256 using newBlock and converting to a string
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString()

          addLevelDBData(data.length, JSON.stringify(newBlock))
            .then(() => {
              resolve(newBlock);
            })
        })
        .catch(reject)
    })
  }

  // Get block height
  getBlockHeight() {
    new Promise((resolve, reject) => {
      getAllLevelDBData()
        .then(data => resolve(data.length))
        .catch(reject)
    })
  }

  // get block
  getBlock(blockHeight) {
    return (new Promise((resolve, reject) => {
      getLevelDBData(blockHeight.toString())
        .then(resolve)
        .catch(reject)
    }))
  }

  // validate block
  validateBlock(block) {
    // get block hash
    let blockHash = block.hash
    // remove block hash to test block integrity
    block.hash = ''
    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString()
    // Compare
    if (blockHash === validBlockHash) {
      return true
    } else {
      console.log(
        `Block #${block.height}\ninvalid hash: <${blockHash}>\nvalid hash: <${validBlockHash}>`
      )
      return false
    }
  }

  // Validate blockchain
  validateChain() {
    return (new Promise((resolve, reject) => {
      getAllLevelDBData()
        .then(data => {
          let errorLog = []
          for (let i = 0; i < data.length - 1; i++) {
            // current block
            const currentBlock = data[i]
            // validate block by sending a clone of the block
            if (!this.validateBlock(Object.assign({}, currentBlock))) {
              errorLog.push(i)
            }
            // compare blocks hash link
            let blockHash = currentBlock.hash
            // next block
            const nextBlock = data[i + 1]
            let previousHash = nextBlock.previousBlockHash
            if (blockHash !== previousHash) {
              errorLog.push(i)
            }
          }
          if (errorLog.length > 0) {
            console.log('Block errors = ' + errorLog.length)
            console.log('Blocks: ' + errorLog)
          } else {
            console.log('No errors detected')
          }
        })
    }))
  }

  // return the chain of blocks
  getChain() {
    return (new Promise((resolve, reject) => {
      getAllLevelDBData()
        .then(resolve)
        .catch(reject)
    }))
  }
}

module.exports = { Block, Blockchain }
