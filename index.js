const { json } = require('micro');

module.exports = async (req, res) => {
  const { callback } = await json(req);

  if (!callback) {
    // Error
  }

  return {
    success: true
  };
};
