const express = require("express");
const Stripe = require("stripe");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const stripe = Stripe("sk_test_51OaQU6F1ibQofTuIL5M2zZMswAdmTTmQB520XFabeNaMYNN1dtl1LZfxRbZO4PNy1tpAb56eeCjZbMGTEx3b658C00zaFseWVa");

app.use(cors());
app.use(bodyParser.json());

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    console.log("ANvay vats");
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
    });
    console.log("Payment Intent:", paymentIntent);
    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).send({
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));