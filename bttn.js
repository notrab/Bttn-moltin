/* eslint linebreak-style: ['error', 'windows'] */

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const moltin = require('@moltin/sdk');

// Variables
const config = {
  port: 3000,
  product: 'c393b314-32d8-405e-97e4-6e791d75a042',
  publicId: 'NN8Q3BO0Ojt32fjUT2zhlGzzaAYigaBiov1KZkS3yL',
  secretKey: '',
  bttnKey: '201410AK582235c87fD8wGNyLYa319zzhjbGX7I3dONmHjs1-lk602BSoEfXi7GB',
  callback: undefined,
  customer: {
    "name": "Billy",
    "email": "billy@billy.com"
  },
  address: {
      "first_name": "Jack",
      "last_name": "Macdowall",
      "company_name": "Macdowalls",
      "line_1": "1225 Invention Avenue",
      "line_2": "Birmingham",
      "postcode": "B21 9AF",
      "county": "West Midlands",
      "country": "UK"
  }
};

// Moltin handler
function purchase() {
  // Get a moltin instance
  const Moltin = moltin.gateway({
    client_id: config.publicId,
    client_secret: config.secretKey,
  });

  // Add the item to a cart
  return Moltin.Cart.AddProduct(config.product)
    .then((cart) => {
      console.log(cart, 'added product to cart');

      return Moltin.Cart.Checkout({
        customer: config.customer,
        shipping_address: config.address,
        billing_address: config.address,
      }).then((order) => {
        console.log(order, 'checked out');

        return Moltin.Orders.Payment({
          gateway: 'stripe',
          method: 'purchase',
          first_name: 'John',
          last_name: 'Doe',
          number: '4242424242424242',
          month: '08',
          year: '2020',
          verification_value: '123',
        }).then((payment) => {
          console.log(payment, 'paid for the order');
        }).catch((error) => {
          console.log(error)})
      }).catch((error) => {
        console.log(error)})
    }).catch((error) => {
      console.log(error)});
};

// Start Express
const bttn = express();

// Configure JSON and Form handlers
bttn.use(bodyParser.json());
bttn.use(bodyParser.urlencoded({ extended: true }));

// Start the server
bttn.listen(config.port, () => {
  console.log(`App listening on port: ${config.port}`);
});

// Listen for a post request
bttn.post('/', (req, res) => {
  // Debug
  console.log('Request Received');

  // No callback provided
  if (req.body.callback === undefined) {
    console.log('Error: No callback URL provided.');
  };

  // Add the callback to config
  config.callback = req.body.callback;

  // Run the purchase function
  return purchase(function() {
    // Debug
    console.log('Purchase Success');

    // Setup the response to bt.tn
    const options = {
      url: config.callback,
      method: 'POST',
      json: true,
      headers: {
        'X-Api-Key': config.bttnKey,
      },
      body: {
        result: 'success',
      },
    };

    // Make the callback request
    request(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        console.log('Callback Success');
      }
    });

    // Close this request
    res.setHeader('Connection', 'close');
    res.end();

  // Error handler
  }).catch((status, err) => {
    console.log(err);
  });
});
