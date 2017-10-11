/* eslint linebreak-style: ['error', 'windows'] */

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
require('dotenv').config();

// Variables
const config = {
  port: 3000,
  product: '61abf56a-194e-4e13-a717-92d2f0c9d4df',
  publicId: 'j6hSilXRQfxKohTndUuVrErLcSJWP15P347L6Im0M4',
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
    month: '02',
    year: '2017',
    verification_value: '123',
  },
};

const MoltinGateway = require('@moltin/sdk').gateway;

// Get a moltin instance
const Moltin = MoltinGateway({
  client_id: config.publicId,
  client_secret: process.env.client_secret,
});

// Moltin handler
function purchase() {

  // Add the item to a cart
  return Moltin.Cart.AddProduct(config.product)
    .then((cart) => {
      
      Moltin.Customers.Create({
        type: 'customer',
        username: 'maximusPowerus',
        name: 'Max Power',
        email: 'max@power.com',
        password: 'fakepass',
        phone_number: '+447732429621'
      }).then((customer) => {

        return Moltin.Cart.Checkout({
        customer: {id: customer.data.id},
        shipping_address: config.address,
        billing_address: config.address
      }).then((order) => {
        console.log(order);
        const orderId = order.data.id;

        console.log("order created" + orderId)

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


      }).catch((e) => {
        console.log(e);
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
