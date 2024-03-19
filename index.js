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
  console.log("request passed");
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
      return res.status(response.status).send(await response.json());
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
  const dados = {
    number: body.number,
    holder_name: body.holder_name,
    exp_month: body.exp_month,
    exp_year: body.exp_year,
    cvv: body.cvv,
    billing_address: {
      line_1: body.billing_address.line_1,
      zip_code: body.billing_address.zipcode,
      city: body.billing_address.city,
      state: body.billing_address.state,
      country: body.billing_address.country,
    },
  };
  try {
    const options = {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(process.env.API_KEY).toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    };
    console.log(options);
    let response = await fetch(
      `https://api.pagar.me/core/v5/customers/${body.customer_id}/cards`,
      options,
    );

    if (response.status != 200) {
      console.log(response);
      return res.status(response.status).send(await response.json());
    }
    const data = await response.json();

    console.log(data);

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/list-card-by-client/:customer_id", async function (req, res) {
  const { customer_id } = req.params;
  const options = {
    method: "GET",
    headers: {
      Authorization:
        "Basic " + Buffer.from(process.env.API_KEY).toString("base64"),
    },
  };

  const response = await fetch(
    `https://api.pagar.me/core/v5/customers/${customer_id}/cards`,
    options,
  );

  if (response.status != 200) {
    console.error(response);
    return res.send(response.statusText).status(response.status);
  }

  const data = await response.json();

  res.send(data);
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
  return res.send(data);
});

app.get("/list-plan", async function (req, res) {
  const options = {
    method: "GET",
    headers: {
      Authorization:
        "Basic " + Buffer.from(process.env.API_KEY).toString("base64"),
    },
  };

  const response = await fetch("https://api.pagar.me/core/v5/plans", options);

  if (response.status != 200) {
    console.error(response);
    return res.send(response.statusText).status(response.status);
  }

  const data = await response.json();

  res.send(data);
});

app.put("/edit/plan/:plan_id/:item_id", async function (req, res) {
  const body = req.body;

  const options = {
    method: "PUT",
    headers: {
      Authorization:
        "Basic " + Buffer.from(process.env.API_KEY).toString("base64"),
    },
    body: JSON.stringify(body),
  };
  let url = `https://api.pagar.me/core/v5/plans/${req.params.plan_id}/items/${req.params.item_id}`;

  await fetch(url, options)
    .then(async (response) => {
      if (response.status != 200 && response.status != 500) {
        console.error(await response.json());
        return res.send(await response.json()).status(response.status);
      }

      const data = await response.json();

      return res.send(data);
    })
    .catch((err) => {
      console.log(err);
      return res.send(err.message);
    });
});

app.put("/edit/plan/:plan_id", async function (req, res) {
  const body = req.body;

  const options = {
    method: "PUT",
    headers: {
      Authorization:
        "Basic " + Buffer.from(process.env.API_KEY).toString("base64"),
    },
    body: JSON.stringify(body),
  };

  await fetch(
    `https://api.pagar.me/core/v5/plans/${req.params.plan_id}`,
    options,
  )
    .then(async (response) => {
      if (response.status != 200 && response.status != 500) {
        console.error(await response.json());
        return res.send(response.statusText).status(response.status);
      }

      const data = await response.json();

      return res.send(data);
    })
    .catch((err) => {
      console.log(err);
      return res.send(err.message);
    });
});

// adicionando assinatura ao cliente Rafael Motta
// cartao do cliente
// plano mensal
// 14,90
app.post("/create-subscription", async function (req, res) {
  let body = req.body;

  const options = {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(process.env.API_KEY).toString("base64"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
  const response = await fetch(
    "https://api.pagar.me/core/v5/subscriptions",
    options,
  );

  if (response.status != 200) {
    console.error(response);
    return res.send(response.statusText).status(await response.json());
  }

  const data = await response.json();

  console.log(data);

  res.send(data).status(201);
});

app.get("/list/subscription/:customer_id", async function (req, res) {
  const options = {
    method: "GET",
    headers: {
      Authorization:
        "Basic " + Buffer.from(process.env.API_KEY).toString("base64"),
    },
  };

  const response = await fetch(
    `https://api.pagar.me/core/v5/subscriptions?customer_id=${req.params.customer_id}`,
    options,
  );

  if (response.status != 200) {
    console.error(response);
    return res.send(response.statusText).status(response.status);
  }

  const data = await response.json();

  res.send(data);
});

app.delete("/subscription/:subscription_id", async function (req, res) {
  const options = {
    method: "DELETE",
    headers: {
      Authorization:
        "Basic " + Buffer.from(process.env.API_KEY).toString("base64"),
    },
    body: JSON.stringify({
      cancel_pending_invoices: true,
    }),
  };

  const response = await fetch(
    `https://api.pagar.me/core/v5/subscriptions/${req.params.subscription_id}`,
    options,
  );

  if (response.status !== 200) {
    console.log(error);
    return res.send(response.statusText).status(response.status);
  }

  const data = await response.json();
  res.send(data);
});

app.get("/list-client", async function (req, res) {
  const options = {
    method: "GET",
    headers: {
      Authorization:
        "Basic " + Buffer.from(process.env.API_KEY).toString("base64"),
    },
  };

  const response = await fetch(
    "https://api.pagar.me/core/v5/customers",
    options,
  );

  if (response.status != 200) {
    console.error(response);
    return res.send(response.statusText).status(response.status);
  }

  const data = await response.json();

  res.send(data);
});

app.get("/", function (req, res) {
  res.send("OK!");
});

app.listen(port, () => {
  console.log(`Listen port ${port}`);
});
