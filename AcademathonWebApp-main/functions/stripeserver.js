/*
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
const stripe = Stripe("sk_test_51OaQU6F1ibQofTuIL5M2zZMswAdmTTmQB520XFabeNaMYNN1dtl1LZfxRbZO4PNy1tpAb56eeCjZbMGTEx3b658C00zaFseWVa");


const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 
app.use(express.json());



app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    console.log("Creating payment intent");
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

module.exports = app  // Note: Do not wrap with `functions.https.onRequest` here
*/