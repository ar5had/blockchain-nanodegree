const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const session = require('express-session')
const bodyParser = require('body-parser')
const { Block, Blockchain } = require('./simpleChain')

// if node env is not production then load private env vars
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load({ path: path.resolve(process.cwd(), ".env") });
}

const app = express()
const port = process.env.PORT
const blockchain = new Blockchain()

app.use(express.static(path.join(__dirname, "public")))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/requestValidation', (req, res) => {
    const { address } = req.body
    if (address === '') return res.send(`Address is not valid!`)
    const timestamp = new Date().getTime()

})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(port, () => console.log(`App listening on port ${port}!`))
