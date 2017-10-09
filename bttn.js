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
    name: 'Jon Doe',
    email: 'jon.doe@gmail.com',
  },
  address: {
    first_name: 'Jon',
    last_name: 'Doe',
    line_1: '123 Sunny Street',
    line_2: 'Sunnycreek',
    city: 'Sunnyvale',
    county: 'California',
    country: 'US',
    postcode: 'CA94040',
  },
  card: {
    number: '4242424242424242',
    expiry_month: '02',
    expiry_year: '2017',
    cvv: '123',
  },
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
    .then(() => {
      return Moltin.Cart.Checkout({
        customer: config.customer,
        shipping_address: config.address,
        billing_address: config.address,
      }).then((order) => {
        const orderId = order.data.id;

        return Moltin.Orders.Payment(orderId, {
          gateway: 'stripe',
          method: 'purchase',
          first_name: 'John',
          last_name: 'Doe',
          number: '4242424242424242',
          month: '08',
          year: '2020',
          verification_value: '123',
        }).catch((err) => {
          console.log('payment failed', err);
        });
      }).catch((err) => {
        console.log('checkout failed', err);
      });
    }).catch((err) => {
      console.log('add to cart failed', err);
    });
}

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
  console.log('You pressed the button!');

  // No callback provided
  if (req.body.callback === undefined) {
    console.log('Error: No callback URL provided.');
  };

  // Add the callback to config
  config.callback = req.body.callback;

  var start = new Date();
  // Run the purchase function

  return purchase()
  .then(() => {
    var end = new Date() - start;
    console.info("Execution time: %dms", end);
    // Debug
    console.log('Your product has been ordered');

    // Setup the response to bt.tn
    const options = {
      url: config.callback,
      method: 'POST',
      json: true,
      time : true,
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
        //console.log('Callback Success. Request time in ms is: ' + response.elapsedTime);
      }
    });

    // Close this request
    res.setHeader('Connection', 'close');
    res.end();
  });
});
