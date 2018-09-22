const bitcoinMessage = require('bitcoinjs-message')

const messageSignatureRoutes = (app, starRegistry) => {
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
}

module.exports = messageSignatureRoutes
