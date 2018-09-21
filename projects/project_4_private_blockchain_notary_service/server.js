const express = require('express')
const path = require('path')
const SHA256 = require('crypto-js/sha256')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const bitcoin = require('bitcoinjs-lib')
const bitcoinMessage = require('bitcoinjs-message')
const { Block } = require('./block')
const { Blockchain } = require('./simpleChain')
const { getSlicedTo500BytesHexStr } = require('./utils')
const { getLevelDBData, addLevelDBData } = require('./levelSandbox')

// if node env is not production then load private env vars
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load({ path: path.resolve(process.cwd(), '.env') });
}

const app = express()
const starRegistry = {}
const port = process.env.PORT
const blockchain = new Blockchain()
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

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.post('/requestValidation', (req, res) => {
    const { address } = req.body

    if (address === '') return res.send(`Address is not valid!`)

    const timestamp = new Date().getTime()
    const message = `${address}:${timestamp}:starRegistry`
    const validationWindow = 300
    const json = {
        address,
        message,
        validationWindow,
        requestTimeStamp: timestamp
    }

    if (starRegistry.hasOwnProperty(address)) {
        return res.json({ error: 'Already made a request for validation with same address!' })
    }

    starRegistry[address] = { message, timestamp, validationWindow, isVerified: false }
    res.json(json)

    const interval = setInterval(() => {
        starRegistry[address] && starRegistry[address].validationWindow--
        // check if starRegistry has star registeration request or not
        // if there is a registeration request
        // then check whether the validationWindow is timed out or not
        if (!starRegistry.hasOwnProperty(address) || starRegistry[address].validationWindow <= 0) {
            delete starRegistry[address]
            clearInterval(interval)
        }
    }, 1000)
})

app.post('/message-signature/validate', (req, res) => {
    const { address, signature } = req.body
    if (starRegistry.hasOwnProperty(address) && (starRegistry[address].validationWindow > 0)) {
        const { message, timestamp, validationWindow } = starRegistry[address]
        let isValid;
        let verificationError = `couldn't recover public key from signature`
        try {
            isValid = bitcoinMessage.verify(message, address, signature)
        } catch (err) {
            console.error(
                `\naddress<${address}>, message<${message}>, signature<${signature}> - ${err}\n`
            )
            isValid = false
            verificationError = err
        }

        if (isValid === true) {
            const json = {
                registerStar: true,
                status: {
                    address,
                    message,
                    validationWindow,
                    requestTimeStamp: timestamp,
                    messageSignature: 'valid'
                }
            }
            // set address registeration validity to true
            starRegistry[address].isValid = true
            res.json(json)
        } else {
            res.json({ error: verificationError.toString() })
        }
    } else {
        res.json({ error: `Star registeration request timed out!` })
    }
})

app.post('/block', (req, res) => {
    const errorLogs = []
    const { address, star } = req.body

    const addressNotInRegistry = !starRegistry.hasOwnProperty(address)

    if (addressNotInRegistry || !starRegistry[address].isValid) {
        return res.json({ error: 'Address not valid. Make another star registeration request!' })
    }

    let {
        ra = '',
        dec = '',
        story = '',
        mag = '',
        constellation = ''
    } = star || {}

    // remove empty properties of star
    Object.keys(star).forEach(key => {
        star[key] = star[key].trim()
        if (star[key] === '') {
            delete star[key]
        }
    })

    // strings can be just spaces
    if (!dec || !story || !ra) {
        errorsLog.push('Insufficient star data!')
    }

    if (errorLogs.length > 0) {
        return res.json({ errors: errorLogs })
    }

    const starHash = SHA256(JSON.stringify({ ra, dec })).toString()

    addStarToregisteredStarsList(starHash)
        .then(() => {
            // slice story to 500 bytes and convert into hex format
            story = getSlicedTo500BytesHexStr(story)

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

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(port, () => console.log(`App listening on port ${port}!`))
