const { json } = require('micro')
const fetch = require('node-fetch')

const { productId, customerId, address, card } = require('./mock.json')

const { BTTN_API_KEY } = process.env

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

const handleCheckout = async () => {}

module.exports = async (req, res) => {
  const { callback = undefined } = await json(req)

  if (!callback) {
    console.error('No callback URL provided.')
  }

  try {
    const cart = await Moltin.Cart.AddProduct(productId)

    const { data: { id: orderId } } = await Moltin.Cart.Checkout({
      customer: {
        id: customerId
      },
      shipping_address: address,
      billing_address: address
    })

    await Moltin.Orders.Payment(
      orderId,
      Object.assign({}, card, {
        gateway: 'stripe',
        method: 'purchase'
      })
    )

    const bttn = await handleBttn(callback)

    return {
      result: 'success'
    }
  } catch (e) {
    console.error(e.message)

    return {
      result: 'error'
    }
  }
}
