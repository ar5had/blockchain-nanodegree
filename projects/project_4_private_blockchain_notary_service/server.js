const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const bitcoin = require('bitcoinjs-lib')
const bitcoinMessage = require('bitcoinjs-message')
const { Block, Blockchain } = require('./simpleChain')

// if node env is not production then load private env vars
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load({ path: path.resolve(process.cwd(), '.env') });
}

const app = express()
const port = process.env.PORT
const blockchain = new Blockchain()

const starRegistry = {}
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

    starRegistry[address] = { message, timestamp, validationWindow }
    res.json(json)

    const interval = setInterval(() => {
        // check if starRegistry has star registeration request or not
        // if there is a registeration request
        // then check whether the validationWindow is timed out or not
        if (!starRegistry.hasOwnProperty(address) || starRegistry[address].validationWindow <= 0) {
            delete starRegistry[address]
            clearInterval(interval)
        }
        starRegistry[address].validationWindow--
    }, 1000)
})

app.post('/message-signature/validate', (req, res) => {
    const { address, signature } = req.body
    if (starRegistry.hasOwnProperty(address) && (starRegistry[address].validationWindow > 0)) {
        const { message, timestamp, validationWindow } = starRegistry[address]
        const isValid = bitcoinMessage.verify(message, address, signature)
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
        res.json(json)
    } else {
        res.json({ error: `Star registeration request timed out!` })
    }
})

app.post('/block', (req, res) => {
    const {address, star} = req.body

})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(port, () => console.log(`App listening on port ${port}!`))
