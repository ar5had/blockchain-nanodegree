const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const bodyParser = require('body-parser');
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

app.get('/block/:blockHeight', (req, res) => {
    const { blockHeight } = req.params
    blockchain.getBlock(blockHeight)
        .then(block => res.json(block))
        .catch(err => res.json({ error: `Block #${blockHeight} can't be found on blockchain!` }))
})

app.post('/block', (req, res) => {
    const { body } = req.body
    if (body === undefined) {
        return res.json({ error: `body parameter is not defined` })
    } else if (body.trim() === '') {
        return res.json({ error: `can't create block with empty body string` })
    }
    blockchain.addBlock(new Block(body))
        .then(block => res.json(block))
        .catch(err => res.json({ error: `Error occurred while adding new block with body - ${body}` }))
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(port, () => console.log(`App listening on port ${port}!`))
