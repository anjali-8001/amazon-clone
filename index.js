/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const request = require("request");
const cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51NDeftSENj42SYYTfNKMp4Z7Zvewz0ccCgDnjpeyOszhVsonIB5yVHNgGxBsRscG3P1Ug2IJArUtGKfZN8tAr4am00V0ixm8SN"
);

// -API

// -App config
const app = express();

// -Middlewares
//cors is for safety
app.use(cors({ origin: true }));
app.use(express.json());

// -Api routes
app.get("/", (request, response) => response.status(200).send("hello world"));

app.post("/payments/create", async (request, response) => {
  const total = request.query.total;

  console.log("Payment request received >>>", total);
  const customer = await stripe.customers.create({
    name: "John Doe",
    address: {
      line1: "123 Example Street",
      city: "New Delhi",
      postal_code: "110001",
      state: "Delhi",
      country: "IN",
    },
  });
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2022-11-15" }
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: "inr",
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
    description: "Purchase of items from your website",
  });

  // OK created
  response.status(201).send({
    clientSecret: paymentIntent.client_secret,
  });
});

// -listen command
exports.api = functions.https.onRequest(app);

// EXAMPLE ENDPOINT:
// http://127.0.0.1:5001/clone-4e125/us-central1/api

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
