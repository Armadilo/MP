const express = require('express')
var elasticsearch = require('elasticsearch');
const app = express()
const port = 4433
const indexName = '16ed9140-d6c0-11e8-b283-382c4ab4a532_discoveryindexkind'
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

var client = new elasticsearch.Client({
    host: 'https://elastic:5t8e50MT30Pwbed6g5X2zVgk@474197f539d74ae980590eb60963a9f1.eu-central-1.aws.cloud.es.io:9243',
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