const { getAllLevelDBData } = require('../levelSandbox')

const decodeStory = str => {
    return new Buffer(str, 'hex').toString()
}

const starsRoutes = (app, blockchain) => {
    app.get('/stars/hash::hash', (req, res) => {
        const { hash } = req.params
        blockchain.getChain()
            .then(chain => {
                const result = chain.filter(block => block.hash === hash)
                if (result.length === 0) {
                    return res.json({ error: `No registered star with hash: ${hash}!` })
                }
                result[0].body.storyDecoded = decodeStory(result[0].body.story)
                res.json({ result: result[0] })
            })
            .catch(err => res.json({ error: err.toString() }))
    })

    app.get('/stars/address::address', (req, res) => {
        const { address } = req.params
        blockchain.getChain()
            .then(chain => {
                const results = chain.filter(block => {
                    if(block.height === 0) return false
                    return block.body.address === address
                })
                if (results.length === 0) {
                    return res.json({ error: `No registered star found with that address: ${address}` })
                }
                res.json({
                    results:
                        results.map(e => {
                            e.body.storyDecoded = decodeStory(e.body.story)
                            return e
                        })
                })
            })
            .catch(err => res.json({ error: err.toString() }))
    })
}

module.exports = starsRoutes
