const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyDax2a-BS_uld_McpnSs-iWgtg_PgkVHi8'
});
const express = require('express');
const elasticsearch = require('elasticsearch');
const mysql = require('mysql');
const app = express();
var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
const port = 4433;
const indexName = 'bf4ea23e-d770-11e8-b283-382c4ab4a532_discoveryindexkind'

let response = "";


const connection = mysql.createConnection({
    host: 'u28rhuskh0x5paau.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'hf8t3p2wowg351hr',
    password: 's4fp8u046l30aloj',
    database: 'rsxx9m87051sudx7'
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

const configuration = {countries: 'USA'};
connection.query('INSERT INTO configurations SET ?', configuration, (err, res) => {
    if (err) throw err;

    console.log('Last insert ID:', res.insertId);
});

const client = new elasticsearch.Client({
    host: 'https://elastic:5t8e50MT30Pwbed6g5X2zVgk@474197f539d74ae980590eb60963a9f1.eu-central-1.aws.cloud.es.io:9243',
    log: 'trace'
});

client.search({
    index: indexName,
    body: {
        size: 0,
        aggs: {
            map_geohash: {
                geohash_grid: {
                    field: "Location",
                    precision: 3
                },
                aggs: {
                    geohash_centroid: {
                        geo_centroid: {
                            field: "Location"
                        }
                    }
                }
            }
        }
    }
}).then((resp) => {
    const buckets = resp.aggregations.map_geohash.buckets;
    for (let bucket of buckets) {
        let latlngs = bucket.geohash_centroid.location;
        googleMapsClient.reverseGeocode({
            latlng: {lat: latlngs.lat, lng: latlngs.lon}
        }, (err, res) => {
            if (!err) {
                response = response.concat("The location is : " + res.json.results[res.json.results.length - 1].formatted_address);
                //console.log(response.json.results);
            }
            else {
                reject('cant find');
                // console.log(err)
            }
        });
    };
},  (err) => {
    return res.send(err.message);
});

app.get('/', (req, res) => {
    res.send(response);
});

app.get('/countries/list', (req, res) => {
    console.log('dsadsadsa')
    return res.send(JSON.stringify(country_list));
});

app.get('/countries/list', (req, res) => {
    console.log('dsadsadsa')
    return res.send(JSON.stringify(country_list));
});

app.get('/image-categories/all', (req, res) => {
    console.log('dsadsadsa')
    return res.send(JSON.stringify(image_categories_list));
});



app.post('/hostile_countries/create', function(req, res) {
    let name = req.body.name;
    let percentage = req.body.percentage;

    var sql = "REPLACE INTO hostile_countries (name, percentage) VALUES ? ";
    var values = [
        [name, percentage]];

    connection.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
    });

    res.send('');
});

app.get('/hostile_countries/list', (req, res) => {
    console.log('hostile_countries')

    connection.query("SELECT name,percentage FROM hostile_countries", function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});

app.get('/watchlist/list', (req, res) => {
    console.log('watchlist')

    connection.query("SELECT value FROM watchlist", function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});

app.post('/watchlist/create', function(req, res) {
    let value = req.body.value;

    var sql = "REPLACE INTO watchlist (value) VALUES ? ";
    var values = [
        [value]];

    connection.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
    });

    res.send('');
});

app.get('/identifiers/list', (req, res) => {
    console.log('watchlist')

    connection.query("SELECT value FROM identifiers", function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});

app.post('/identifiers/create', function(req, res) {
    let value = req.body.value;

    var sql = "REPLACE INTO identifiers (value) VALUES ? ";
    var values = [
        [value]];

    connection.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
    });

    res.send('');
});


app.get('/image-categories/list', (req, res) => {
    console.log('watchlist')

    connection.query("SELECT category FROM image_categories", function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});

app.post('/image-categories/create', function(req, res) {
    let category = req.body.category;

    var sql = "REPLACE INTO image_categories (category) VALUES ? ";
    var values = [
        [category]];

    connection.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
    });

    res.send('');
});

const country_list = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua &amp; Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia &amp; Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Cape Verde", "Cayman Islands", "Chad", "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica", "Cote D Ivoire", "Croatia", "Cruise Ship", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyz Republic", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre &amp; Miquelon", "Samoa", "San Marino", "Satellite", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "St Kitts &amp; Nevis", "St Lucia", "St Vincent", "St. Lucia", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga", "Trinidad &amp; Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks &amp; Caicos", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Virgin Islands (US)", "Yemen", "Zambia", "Zimbabwe"];
const image_categories_list= ["Documents", "Money", "Weapons", "Drugs", "Nudity", "Face", "Screenshots", "SuspectedCSA", "Cars", "Handwritten", "Flags", "Maps", "Tattoos", "UnCategorized"];

app.get('/optional-countries', (req, res) => res.send(country_list))