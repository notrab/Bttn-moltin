// Add requirements
var express    = require('express')
    bodyParser = require('body-parser'),
    request    = require('request');

// Variables
var config = {
  port:      3000,
  product:   'XXXX',
  publicId: 'XXXX',
  secretKey: 'XXXX',
  bttnKey:   'XXXX',
  callback:  undefined,
  customer: {
    first_name: 'Jon',
    last_name:  'Doe',
    email:      'jon.doe@gmail.com'
  },
  address: {
    first_name: 'Jon',
    last_name:  'Doe',
    address_1:  '123 Sunny Street',
    address_2:  'Sunnycreek',
    city:       'Sunnyvale',
    county:     'California',
    country:    'US',
    postcode:   'CA94040',
    phone:      '6507123124'
  },
  card: {
    number:       '4242424242424242',
    expiry_month: '02',
    expiry_year:  '2017',
    cvv:          '123'
  }
};

// Start Express
var bttn = express();

// Configure JSON and Form handlers
bttn.use(bodyParser.json());
bttn.use(bodyParser.urlencoded({extended: true}));

// Start the server
bttn.listen(config.port, function () {
  console.log('app listening on port ' + config.port);
})

// Listen for a post request
bttn.post('/', function (req, res) {

  // Debug
  console.log('Request Received');

  // No callback provided
  if ( req.body.callback === undefined ) {
    return console.log('Error: No callback URL provided.');
  }

  // Add the callback to config
  config.callback = req.body.callback;

  // Run the purchase operation
  return purchase('test', function(data) {

    // Debug
    console.log('Purchase Success');

    // Setup the response to bt.tn
    var options = {
      url: config.callback,
      method: 'POST',
      json: true,
      headers: {'X-Api-Key': config.bttnKey},
      body: {result: 'success'}
    };

    // Make the callback request
    request(options, function(error, response, body) {
      if ( ! error && response.statusCode == 200 ) {
        console.log('Callback Success');
      }
    });

    // Close this request
    res.setHeader("Connection", "close");
    res.end();

  // Error handler
  }, function(status, err) {
    return console.log(err);
  });

});

// Moltin handler
var purchase = function(slug, success, error) {

  // Get a moltin instance
  var moltin = require('moltin')({publicId: config.publicId, secretKey: config.secretKey});

  // Authenticate
  moltin.Authenticate(function() {

    // Add the item to a cart
    moltin.Cart.Insert(config.product, 1, null, function(item) {

      // Create the checkout
      moltin.Cart.Complete({
        gateway: 'dummy',
        customer: config.customer,
        bill_to: config.address,
        ship_to: 'bill_to',
        shipping: 'XXXX'
      }, function(order) {

        // Run the purchase
        moltin.Checkout.Payment('purchase', order.id, {data: config.card}, success, error);

      }, error);
    }, error);
  }, error);

};
