const { json } = require('micro')
const fetch = require('node-fetch');

const { BTTN_API_KEY } = process.env;

const handleBttn = async callback => {
  const response = await fetch(callback, {
    method: 'POST',
    headers: {
      'X-Api-Key': BTTN_API_KEY
    },
    body: JSON.stringify({
      result: 'success'
    })
  })

  return await response.json()
}

module.exports = async (req, res) => {
  const { callback = undefined } = await json(req)

  if (!callback) {
    console.error('No callback URL provided.');
  }

  const bttn = await handleBttn(callback);

  return {
    result: 'success'
  }
}
