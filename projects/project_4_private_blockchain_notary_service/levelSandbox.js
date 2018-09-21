const level = require('level')
const chainDB = './chaindata'
const db = level(chainDB)

// Add data to levelDB with key/value pair
const addLevelDBData = (key, value) => {
  return (new Promise((resolve, reject) => {
    db.put(key, value, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  }))
}

// Get all the data from levelDB
const getAllLevelDBData = () => new Promise((resolve, reject) => {
  let dataArray = []
  db.createValueStream()
    .on('data', (data) => {
      dataArray.push(data)
    })
    .on('error', (err) => {
      reject(err)
    })
    .on('close', () => {
      // sorting the order of enteries by key
      resolve(dataArray.map(e => JSON.parse(e)).sort((a, b) => a.height - b.height));
    })
})

// Get data from levelDB with key
const getLevelDBData = (key) => {
  return new Promise((resolve, reject) => {
    db.get(key, (err, value) => {
      if (err) return reject(err)
      resolve(JSON.parse(value))
    })
  })
}


const addDataToLevelDB = (value) => {
  let i = 0
  db.createReadStream()
    .on('data', (data) => { i++ })
    .on('error', (err) => console.log('Unable to read data stream!', err))
    .on('close', () => {
      console.log('Block #' + i)
      addLevelDBData(i, value)
    })
}

module.exports = {
  addDataToLevelDB,
  addLevelDBData,
  getLevelDBData,
  getAllLevelDBData
}
