const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyDax2a-BS_uld_McpnSs-iWgtg_PgkVHi8'
});
const express = require('express')
const elasticsearch = require('elasticsearch');
const mysql = require('mysql');
const app = express()
const port = 4433
const indexName = 'a11e693f-d6d2-11e8-b283-382c4ab4a532_discoveryindexkind'
const connection = mysql.createConnection({
    host: 'u28rhuskh0x5paau.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'hf8t3p2wowg351hr',
    password: 's4fp8u046l30aloj',
    database: 'rsxx9m87051sudx7'
});

const configuration = { countries: 'USA'};
connection.query('INSERT INTO configurations SET ?', configuration, (err, res) => {
    if(err) throw err;

    console.log('Last insert ID:', res.insertId);
});

googleMapsClient.reverseGeocode({
    latlng : {lat:"40.714224", lng:"-73.961452"}
}, function(err, response) {
    if (!err) {
        console.log(response.json.results);
    }
});

const client = new elasticsearch.Client({
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
    const hits = resp.hits.hits;
    let response = "";
    for (let i = 0; i < hits.length ; i++) {
        response = response.concat("Type of event " + i + " is: " + hits[i]._source.Type + "\n")
    }
    app.get('/', (req, res) => res.send(response))

    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}, function (err) {
    console.trace(err.message);
});



module.exports = app;