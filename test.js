

// Get a moltin instance
var moltin = require('moltin');

var Moltin = moltin.gateway({
client_id: config.publicId,
client_secret: config.secretKey,
});

// Authenticate
Moltin.Authenticate().then((response) => {
console.log('authenticated', response);
});
