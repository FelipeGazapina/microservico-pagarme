const cors = require("cors");
const express = require("express");
const app = express();
require("dotenv").config();

const port = process.env.PORT | 3002;

app.use(cors());
app.use(express.json());
console.log(__dirname);
app.use(function (req, res, next) {
  if (req.headers.authorization != process.env.PASS) {
    res.status(403).send("Unauthorized");
  }

  next();
});

app.post("/create-client", async function (req, res) {
  let body = req.body;

  try {
    const options = {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(process.env.API_KEY).toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };

    let response = await fetch(
      "https://api.pagar.me/core/v5/customers",
      options,
    );

    if (response.status != 200) {
      console.log(response);
      return res.status(response.status).send(response.statusText);
    }
    const data = await response.json();

    console.log(data);

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/create-card", async function (req, res) {
  let body = req.body;
  try {
    const options = {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(process.env.API_KEY).toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: body.number,
        holder_name: body.holder_name,
        exp_month: body.exp_month,
        exp_year: body.exp_year,
        cvv: body.cvv,
      }),
    };

    let response = await fetch(
      `https://api.pagar.me/core/v5/customers/${body.customer_id}/cards`,
      options,
    );

    if (response.status != 200) {
      console.log(response);
      return res.status(response.status).send(response.statusText);
    }
    const data = await response.json();

    console.log(data);

    returnres.send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/create-plan", async function (req, res) {
  let body = req.body;

  const options = {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(process.env.API_KEY).toString("base64"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      interval: "month",
      interval_count: 1,
      pricing_scheme: {
        scheme_type: "Unit",
        price: body.price,
        mininum_price: body.price,
      },
      items: [{ pricing_scheme: { scheme_type: "Unit", price: body.price } }],
      quantity: 1,
      name: body.name,
      description: body.description || "",
      payment_methods: ["credit_card"],
      installments: [1],
      minimum_price: body.price,
      currency: "BRL",
      billing_days: [10],
    }),
  };
  let response = await fetch("https://api.pagar.me/core/v5/plans", options);
  console.log(options);
  if (response.status != 200) {
    console.log(response);
    return res.status(response.status).send(response.statusText);
  }
  const data = await response.json();

  console.log(data);
  res.send(data);
});

app.get("/", function (req, res) {
  res.send("OK!");
});

app.listen(port, () => {
  console.log(`Listen port ${port}`);
});
