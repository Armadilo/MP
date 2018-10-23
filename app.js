const express = require('express')
var elasticsearch = require('elasticsearch');
const app = express()
const port = 4433
const indexName = '90e233e7-d69c-11e8-b283-382c4ab4a532_discoveryindexkind'
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

var client = new elasticsearch.Client({
    host: 'https://hzdaaj9c7q:ckfepucewy@fig-5830594.us-east-1.bonsaisearch.net',
    log: 'trace'
});

client.search({
    index: indexName,
    body: {
        query: {
            match_all:{}
        }
    }
}).then(function (resp) {
    var hits = resp.hits.hits;
}, function (err) {
    console.trace(err.message);
});



module.exports = app;