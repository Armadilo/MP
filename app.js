const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyDax2a-BS_uld_McpnSs-iWgtg_PgkVHi8'
});
const express = require('express');
const mediatags = require('./MediaTags.js');
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
let matchingCategories;

mediatags().then((r) => {
    matchingCategories = r;
    console.log(matchingCategories);
});
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
    let response = JSON.stringify({Media: matchingCategories,
                    Countries: ["Syria", "Jorden"],
                    Contacts: {Name: "Daniel Summers", Img: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAB2AHcDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKACiuY8afEnw74AjiOtajHbTSqWjt1+aVwOpCjnHv0rz66/aQ8K+JPCOp3ehTyX13HbSSw2ciNE023hsEjgD1ry8RmWGw8nTlNc6V7dfL7+nc5Z4qhTlySmk+19fuO98XeN38P3llp9nZreX9421PNk8uNPdjg14h8QvH3xM8DeLrP8A4SDVbODw5qDkQ/2PbgmPHVSWBbOD6814Zrnx08XfGeGx0i301dMi+5BM0p8yUA8ncOvQVlfGb4o+MfAvhXSPD2q6omoamo+12dngTPARkK0p68/wgnvk18X7fFcQYueVYeUuaa05WlyrZttbW7t+Vuh83LOqVTmrJS5I2s9lfs07Nn1b4q+JWh6R8P7V77WZNPGoTJDHdX0xMh3Nwx74HU+gBrze/wDjh4Ts9Bk8OJqS3EMdxltTWN1VsHdnJxxnvX5q+Mvjtr/jrWGuW03UNWC7Y2++I1cYGUGCME44A7Zra0TxHrMtrcx69oF8kEylRNNG3lwejORgn6A/hX6jgeBsNhYwlj8Q5VOVRdmkrL8+7ehvWx+ZVo+0w2H93zV3b5PQ/S/Svjd4evLy0ubTxF5N5GfLj097vy1nXafmGDj8Gr0Pwv8AF601F457zXrXSooVYTadqm1Jnwud6uSMjJHrX5haPpep+IvDt02jJIsQm8251G3uooDIzDLDYwYNyOTgN9a9W+HesaXJrmg+GPFdnDf2UN0FtLhgZWhGz587mOVGc4AXkdwDmMw4TlhabxGV1m2teVu9/wAV9zOOjn1aM/Z4mmk311S6b6af1c+/vCvxs0fWrW2GrQy+GtQuLhoI7C+YNJ1OxyVyFDKMgnHXFehg55HIrz/QdE8L6LpL3tnazLbeT5DXE4JLqOAdx6+xHFdNoN8l9YwPZOwhjOxhICdwA7E/zr5fBY6s7QxLTb7b/kk/lb0Ps1FpWk9TbopquH6HNOr6FNNXQBRRRTAKrX19HYwmSQ49KmmmS3heWRtsaKWZj2ArzLxL4uN9uVBhW+76qK+Xz3iHA5DS5sVUUZNNpdX8jkxVZ0YXirs+Xf2rfhfqnh/XtR+J2jXF7qzbdmoQ7jK8EZ4EsY/uAYBTovUV8zaP41l0XUNK1Cz0y/1nS4ZBJNa3YeNZUJ+ePK/wnniv0us7yL+ybgSqs6zRlGjbnIPDAj0Ira0fQbZ9PSwHh63NrG+IDNEoXy8cH8c18VDM6WL5KuHpKbqK97t26pS5U3Z62fR77nwUOH4ZhWdVVHCad2rXTu/N+Wvc+C/2hvjP4Kjvvh1b/DK9tre+nuYZLrbE4TTizrlSCBnqQV9BXm9hb6r8Xvjp4k1K/wBs8E94/nXEalYzkNFlQemAqkDPevfP2jvgjbeFvF03i9PDUKwxBrgTWLKYkKghd68YyzAZNeUfBXSLrTITvQlzcuzSbjl92GBPfjNfp/CFfDUcuq4vD0HRm1Z3sndtuW1vK2i32PQrYd1syp4aok7u7VtNFZaH0no/wv8ACfh3w9Y2Fholq3lxjdN5eWZiOSTW7ZeCbCaARGzjePH3GUYrP0Ga4+xxSsHUHvjtXc6BsuZF/eKvYc/zrxcdWeIqq5+34GDw9G6ZiW/wP8NaxCJptNtldSdv7sZXIwcehOa4qP8AZX0u3uZ10wyWXnHcsJcmIvnOSPfJzj1r3KEG2mWHozNxip5pp7V0Zj9055roo4qrhEpQlKNvP8zjxVGGMUqdWMZKXdfkedfs6+KvEWoTat8PPEaRWup6SVaWPyzsKb/4fVWXBFfS6RrGoVAFAGAoHAryKGyjk+KXh/XLcFZ5oZLS5CZw4AJQt9Mt+npXryqI144HWvSq+zqVPrEFrJK/9fifJ06cqN6UtovT0/4GxWurtNN2M6MVdguUGce5q4rBhkVRvryK3DNPGWgXBLBd2Dn0qZriOBfMZ1jjHUngVyUcTGNScOZWVtOq319NH9zNWi1RRRXsmZznjK8ItYbJDhrhvnx/dB/x/lXEeKLG2ju1jtRgKo3fWtbxNqZPiCV1ORCQgB9uv65rBuLhrqZpHOWY5Nfwjx5xBDNs2xkbXcZqEX2hT5k7P+9Jts9eFGPs0mYV1HJAj4Y7SOa63VviANE8Lra2yu97b2iM2R1ygIAPrgiuc1Zo4bWR5HCIoJZj2Hc/lXxJ8Yv2sdV0/wCIV9aQwOum3GUtFufkiKABVdWH3uAK9jw8hm2JjiaeV2cmknd201bt57HyuZ4jD5ZU5m7OS6av1Pbfi5rVxex2mk217PJdeKdNn+0RRHCWMKFQpI7uzHr2xXn/AOzT4fjuNJ1fULyTeY7j7Koc8ZQYPP5DPtXKyeO/EXxY0XStUsrl9NOnXEen6lcQYEjRNjZs9i2Rj/ayele0aDFDptjpNjptn5cWGnmUrhQzsWJIHJYnPGa/q/h+nUyvIYYWtBRqdUtdVe7v56P/ACOyjg8NmFXB4zCPSUZXfV69e3kjk9U+PMfh/XLnSNX8TabpB3iKKGOxmnMeThQzAYBORxVjQfiP4x8K+LraLUp9P1rw/dTCM3qKYZrduuHjKgjivXIfCFvNatNZItuZGLyQyRoyMT1OMV5z8QfCg1Ce3sFWATSzpNLJAmH+U4GT9Mjp0rm9v9Zkqajvu3Zr1VkmrerP1Wjh6VGLbei6dfmezy+NEs401C4SUW6xs4ZRknA7Cqvg/wCLWl+PLt7JVurGZRwt5HtDfjVfxp4am1XwnpkVrJNE6RbA0PXOBya898E/DLxJ4Z1B57PxJeatbXE4M2i6lHlIoyTuEUnJ4z3PauSF6Up06872tbfX7l+ZlUp06tJVKSs9vQ+kPCduR4qt48ZEUbSfmMCvSZI/MXBPynqK4f4cwCG8u1AZzHBHGJJDlsDJIP4n9K7oKfXj0r6GjGPslFao+BxEnKrKUtyMxqI9oPygYx1qvHYr5AilXzEAwN3OfrV0KFGAMCo7h1WPBbbu4GKirRp/xJ9F/lp+CMLsSxZvJKMhTyztXJzlR0NFRWf7qTyyWPGMk5or08NLmpK/Qh7nlmp3BmvLiQ9XkZvzNUGmK8Dk+lee+Iv2h/AmjwyvL4gtZJUJzBC2+Qkdto5rxPWv2otR8YXtzZaLanSNNQ7Tcuczyj27KPpz71/B+VcDZ/n9eVVYeUIN3lOacVq/PWT8lc4c04iwOXYWeKUudRV7R1PSfjh450/ULVvB9vetHcXXy6hcQN/qYz/yzz6nv6CvmP8Aar0XQbfwn4Z09IICumybo7iJsswK4xVTxl411DQ9WSOzRPtDfOGm5LZ5ya43VoNT8VaPf6lqcUjXKvny5F/dkeor+leGeDI5DVwuLhV92m7u32pNct9PI/EVxZi8ZXeKxVJRUmkl1Ue3ze7On+APjgta3ujtaNLY3HlgrFIVYODhWPqOTX0Tq2tP4O1yw06KRpFaMgOeoRFBZj+Yr5C+HurJoF9YXTbLeP7RHFKqjBwXHNfYHlW2rfELTrm4AaJpbzTG3c7XZBIn5hG/Kv0jMlOn7T+XWy+T/U/ceB8Q8RVlGo7xhttpd6m5Y/F4ktEluVTZlXkB59/pXN+H/iPpa+MtNttV0+6j1ObLm7df9GY8/KrZ647EVxGuaDq+keLDdxa2dM0MjbNDNGrxQuCcsxYZAP1A4r2fwv4K1VYYZpdNsfEFhMU2XenyKc5GVJUkjt1B4zXl0o08FQVSHvOS77ferfI/Z8VCnVlySko217X+89c/tqK8tALWVRJAodYWI3FSOmKuaLr1vfWYuYhtcnaw9CDzXmPivVovh9prahe6XqASV0iRLdBI7FiAqgA+9aXgGO5n8SX8USuLW7aHYknUSkHd9OACfevL+s1+ZST3/NW/zOCphaUaLlbTp+p9CeDrLydPa4I+adt2faugqGztls7WKBPuxqFFSKzfxDFfYQXJFRPzepLnm5DqzdU1O10wK90WC56qM7fc1pVk6zYi7ZWMay46q38Q9K8nOamJpYOU8Ik5q1rptb9lqxRtfUxW8aWq3cI2zbXLFJFTKkYPU9qKt6b9kjJggiEBOW8sr936UV52U1sbicMqs60JNv7Kduml+Za/JdrEyTufkT8RfDKeE/i94z0qQbY7LVrqJN390Stt/AjH51a0KG1vrC5mJMbRNuUpwPxr179vrwE/hb46z6xHCVs/EVpHdqy8KZUURSL9flRj/v14pptmbTwzNIshW53/AOryNjIR0Pvmv1PGy9pQU09XY/F87pPC4DEUI6e9a/rJW/Ag8WXjR3Fpcqyzo5CqqjlfcnvXoWqyLa6TcRaPeT6tpk9rGWu7m22CNiPmVc9ge9cbZusmjxyzQ7lZcDYnINa19461L/hDYNIg2izhLbQQMnPHPrXyeKc6cVCEf1Pyr3J0/Yyjqno/O/8AV9zznw7oMviD4had4dsxJNPqN5HDCB6kjB+me/tX13r0TaSmpXUT7zbzQ3SsP+esMgD4/wB5d4/4FXP/ALE/wnh8TePD4uvYD5OgozQvg7ZLiRSgBPfapY49xXqfxU+Ht34R1G9k8p5vD2oSM8dwoJ8hm6o/pznB6EGtqn+0Uozl8/k9/wAD+iuBnKlRliNbz09eW6v6u/4GfeIt5JHcoI3S4XuMqT3BHvWx4U8P2FnMGtobrSHXOJNPl2Lz3C4Iz+FcN4fvZNPWLTr+NprdZMpIvT0/KvbNH1LT2tooojkMnHHevnK1NUZcinZdNLo/fsPjpSoJpXvvqUdP8NpZs0n2y91G4Ziyy6hctMUyMcZ4X/gIFegfC7SlXVUnC5it1Yhj3Y9/qT+grKtdOa+lis7aMl5Dg49+tep+HNDt9JX7CN29AN5A4JPQ/SuenQlUrKpJ3t8tex4eYY/926a3f5dTpvtAXgn5sU03GCO4PpVO7jSz2tuLFjjB5p1vdbm4246Yr2p1JJ8t7fifKculy/n0pCvUkZNJ5uOcYFNa4HQHmtp1aaXvMizOf1DRRdaxaPG3l/MwdV7jaT/OitTT7czalLdOGBVPLAJ469f0/Wivncv4dy+squInRs5zb/BK9ul7XKlUltc8P/be+EMnxO+EMmo6fCZdc8OOdQtgvV4cATp/3wN+OpMajvX5ka94hGjyQ25USROud+OCwr9vCMjBGRXzYv7EXw60/wAb6h4hv7OXVrW4nM1rpM2FtbbJyVwOWGScA8AYGDiv0SNRcvLPVHw+d5JLMJc9P7Vk03ZadfXofCHwz+G3jL4nSIfCemT6hlgrufkt4c9Szn5R/Ovr74Z/sSaJosMV143u0128++bG2BS2U9wTwz/oK+lbCxtNH0+Ky060t9Psohtjt7WIRog9AoAAoYbsgnNcEoQlPntqefgOEsDhGqlde0n57fd1+Zl2Gl2Oi2a6dptlBp9nbgLHb20YjRV9gBirQt4bqGS3uIklgkXa8cihlYehB61IylZFYn5eh/H/AOvT9mztWsrSjY+yhH2bVuh4r8Sfg9p3h+1l1TTbyPT7UsAba4kAVWPQIT1/3TVX4deF7rVtRWwS7sXdYxMSkiFtmcbgqnJ54/GvIfjZ8Zrrxp8RNR0X5rfTNGuTbwRn/lqQBulP1OQPYD1r0L4P6LqRaLUNGeOPUogJITIPlZQRuU+zDj8a/M8zxSoZjClKDcXJR372V9ttb7rQywnGjqY2eVUqd3F2be/9ep9NeHPC1r4fjzGPMnIw0rDn8PStxcL83Q+uKz9C1qHXLITxgxyL8ssLfejbuD/jV+TGQK+7jTUEopaHszqSm+Zu7Kd5ZyzYMcm4q2cN/KlzFDCgKlJepz/jVk9Peo2YsoBww9xmuaeDi25Q0bD2j2ZOkgmj3KQ3tVDUlWWF1VijL3XrUi26ru8s+Ux9OlTWdq7T73X5F6H+8a8vFYStiLUHHR6Nlcy6FnT7dre0RXOZCMsT60VZor6ulTjRpxpx2SsZBTJY1mjKMMg0+itRHPXlm1q+0jKno3rVXyzXUyRrKpV13KexrKutNeLLRDev93vWctNjJwMtrcPkPyPSqGoXBhsZmz+8AKj1zV+S4wdqrlvftWbrY8nTbidmy4U49qmKb0ZnK0VddD43+KXhHTtM1KC3EL3Go32pLLLJGdrrHgl+fTla9n+E8FvoHiSBYpZILaZDF5ZcmPJAwcHpyAK4i8ZNa1Ga9bDnz2QE9gMVvxzG3aNl4IA5r8QzfPl/rMqMl7lLT5q2p+bzpTo16mYQ+JSVvRbp97n0Qti9qyywN5c+fvD+L2PrW3HI00aMw2tjkDpXOeCtYGteGrK6f5pSuxz/ALQ4re84BcCv2WnJVYRnDZ6o/S6VWNenGrHaST+8lZu1IoHU01W3NjGTVuK1LDMnA9K1Sb0RsiG3hM8hbonrWgAFAA4FCqFAAGBS10xiogFFFFUAUUUUAFFFFAEFxYwXXMkYLf3hwawde8IvqWmXVvbXAR5Y2VfNHAJHqP8ACiilbqRJJp3PnK6+Fur+DvNt724s5m8wnMDuRyPdRVKOCSaURZUNgd+KKK/lniKKhxFWcesnf7j5CtTiqTVv6ue3fCXTbweG3iLxYEzMvJ4BA9q9Ah0gLjzJC3+6MUUV/ReTJPL6F/5UfQ5eksLBeRdigjhHyKB/OpKKK9w9EKKKKACiiigD/9k="},
                    suspiciousTerms: ["explosive", "ied", "holy war"]});

    console.debug(matchingCategories);
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

module.exports = app;