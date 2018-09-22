const SHA256 = require('crypto-js/sha256')
const { Block } = require('../block')
const { getSlicedTo500BytesHexStr } = require('../utils')
const { getLevelDBData, addLevelDBData } = require('../levelSandbox')

const addStarToregisteredStarsList = starHash => new Promise((resolve, reject) => {
    getLevelDBData('registeredStars')
        .then(data => {
            const isStarAlreadyRegistered = data.stars.reduce((t, e) => t || (e === starHash), false)
            if (isStarAlreadyRegistered) {
                return reject('Star already registered!')
            } else {
                addLevelDBData('registeredStars', JSON.stringify({ stars: [starHash, ...data.stars] }))
                    .then(star => {
                        console.log(`Registered a new star - ${star}`)
                        resolve()
                    })
                    .catch(err => {
                        console.log(`Error occurred while adding a star to registered stars array - ${err}`)
                        reject(err)
                    })
            }

        })
        .catch(err => {
            // if key is not found
            addLevelDBData('registeredStars', JSON.stringify({ stars: [starHash] }))
                .then(star => {
                    console.log(`Registered a new star - ${star}`)
                    resolve()
                })
                .catch(err => {
                    console.log(`Error occurred while adding a star to registered stars array - ${err}`)
                    reject(err)
                })
        })
})

const blockRoutes = (app, starRegistry, blockchain) => {
    app.post('/block', (req, res) => {
        const { address, star } = req.body

        const addressNotInRegistry = !starRegistry.hasOwnProperty(address)

        if (addressNotInRegistry || !starRegistry[address].isValid) {
            return res.json({ error: 'Address not valid. Make another star registeration request!' })
        }

        // remove empty properties of star
        Object.keys(star).forEach(key => {
            star[key] = star[key].trim()
            if (star[key] === '') {
                delete star[key]
            }
        })

        // strings can be just spaces
        if (!star.dec || !star.story || !star.ra) {
            return res.json({ error: 'Insufficient star data!' })
        }

        const starHash = SHA256(JSON.stringify({ ra: star.ra, dec: star.dec })).toString()

        addStarToregisteredStarsList(starHash)
            .then(() => {
                // slice story to 500 bytes and convert into hex format
                star.story = getSlicedTo500BytesHexStr(star.story)
                // add address to the star body
                star.address = address

                // delete star regesteration request
                delete starRegistry[address]

                return blockchain.addBlock(new Block(star))
                    .then(newBlock => res.json(newBlock))
                    .catch(err => res.json({ error: `Error occurred while adding new block - ${err}` }))
            })
            .catch(err => {
                const errorString = `Cant add star to registered stars list - ${err}`
                console.log(errorString)
                res.json({ error: errorString })
            })
    })

    app.get('/block/:blockHeight', (req, res) => {
        const { blockHeight } = req.params
        blockchain.getBlock(blockHeight)
            .then(data => res.json(data))
            .catch(err => res.json({error: err.toString()}))
    })
}

module.exports = blockRoutes
