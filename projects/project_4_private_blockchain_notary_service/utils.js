const getSlicedTo500BytesHexStr = str => {
    return Buffer.from(str).slice(0, 500).toString('hex')
}

module.exports = {
    getSlicedTo500BytesHexStr
}