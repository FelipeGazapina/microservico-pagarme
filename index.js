const cors = require('cors');
const express = require('express');
const app = express();
require('dotenv').config();

const port = process.env.PORT | 3002;

app.use(cors());
app.use(express.json());
console.log(__dirname)
app.use(function (req, res, next) {
    if (req.headers.authorization != process.env.PASS) {
        res.status(403).send('Unauthorized');
    }

    next();
})

app.post('/create-client',async function (req, res) {
    let body = req.body;
    console.log(body);
    try {

        const options = {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(process.env.API_KEY).toString('base64'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }

        let response = await fetch('https://api.pagar.me/core/v5/customers', options);

        console.log(response)
        if (response.status != 200) {
            return res.status(response.status).send(response.statusText);
        }
        const data = await response.json();

        console.log(data);

        res.send('OK!');

    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
     }
})

app.get('/', function (req, res) {
    res.send('OK!');
})

app.listen(port, () => {
    console.log(`Listen port ${port}`)
})
