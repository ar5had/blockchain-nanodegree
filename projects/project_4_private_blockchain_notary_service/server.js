const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const { Blockchain } = require('./simpleChain')
const blockRoutes = require('./routes/block')
const requestValidationRoutes = require('./routes/requestValidation')
const messageSignatureRoutes = require('./routes/message-signature')
const starsRoutes = require('./routes/starsRoutes')

// if node env is not production then load private env vars
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load({ path: path.resolve(process.cwd(), '.env') });
}

const app = express()
const starRegistry = {}
const port = process.env.PORT
const blockchain = new Blockchain()

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

requestValidationRoutes(app, starRegistry)
messageSignatureRoutes(app, starRegistry)
blockRoutes(app, starRegistry, blockchain)
starsRoutes(app, blockchain)

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})
app.listen(port, () => console.log(`App listening on port ${port}!`))
