// Add requirements
var express    = require('express')
    bodyParser = require('body-parser'),
    request    = require('request');

// Variables
var config = {
  port:      3000,
  product:   'c393b314-32d8-405e-97e4-6e791d75a042',
  publicId: 'NN8Q3BO0Ojt32fjUT2zhlGzzaAYigaBiov1KZkS3yL',
  secretKey: '',
  bttnKey:   '201410AK582235c87fD8wGNyLYa319zzhjbGX7I3dONmHjs1-lk602BSoEfXi7GB',
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
var purchase = function(success, error) {

  // Get a moltin instance
  var moltin = require('moltin');
  var Moltin = moltin.gateway({
    client_id: config.publicId,
    client_secret: config.secretKey,
  });

  // Add the item to a cart
return Moltin.Cart.AddProduct(config.product)

    .then((cart) => {
        console.log("added product to cart");
        Moltin.Cart.Checkout({
          customer: config.customer,
          shipping_address: config.address,
          billing_address: config.address
        })

        .then((order) => {
          console.log("checked out");
            Moltin.Orders.Payment({
              gateway: 'stripe',
              method: "purchase",
              first_name: "John",
              last_name: "Doe",
              number: "4242424242424242",
              month: "08",
              year: "2020",
              verification_value: "123"
          })
        })

          .then((response) => {
            console.log("paid for the order")
          })

          .catch((error) => {
            console.log(error);
          })

        .catch((error) => {
          console.log(error);
        })
    })

    .catch((error) => {
      console.log(error);
    });
};
