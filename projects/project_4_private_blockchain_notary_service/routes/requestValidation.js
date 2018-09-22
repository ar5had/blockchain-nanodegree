const express = require('express')
const router = express.Router()

const requestValidationRoutes = (app, starRegistry) => {
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
            return res.json(
                Object.assign(
                    {},
                    json,
                    { validationWindow: starRegistry[address].validationWindow }
                )
            )
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
}
module.exports = requestValidationRoutes
