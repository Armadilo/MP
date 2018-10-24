const elasticsearch = require('elasticsearch');
const indexName = 'bf4ea23e-d770-11e8-b283-382c4ab4a532_discoveryindexkind';
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'u28rhuskh0x5paau.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'hf8t3p2wowg351hr',
    password: 's4fp8u046l30aloj',
    database: 'rsxx9m87051sudx7'
});
const client = new elasticsearch.Client({
    host: 'https://elastic:5t8e50MT30Pwbed6g5X2zVgk@474197f539d74ae980590eb60963a9f1.eu-central-1.aws.cloud.es.io:9243',
    log: 'trace'
});
var y;
function t() {
    let mediaTags = [];
    let interestingCategories;

    return new Promise((resolve, reject) => {
        connection.query("SELECT category FROM image_categories", function (err, result, fields) {
            if (err) throw err;
            interestingCategories = JSON.stringify(result);
            client.search({
                index: indexName,
                body: {
                    size: 0,
                    aggs: {
                        nest: {
                            nested: {
                                path: "mediaTags"
                            },
                            aggs: {
                                categories: {
                                    terms: {
                                        field: "mediaTags.CategoryId",
                                        size: 20
                                    }
                                }
                            }
                        }
                    }
                }
            }).then((resp) => {
                const buckets = resp.aggregations.nest.categories.buckets;
                for (let bucket of buckets) {
                    mediaTags.push(bucket.key)
                }
                ;
                y = mediaTags.filter(value => -1 !== interestingCategories.indexOf(value));
                resolve(y);
            }, (err) => {
                reject(err);
            });
        });
    })


};

module.exports = t;