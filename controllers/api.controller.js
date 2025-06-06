const { fetchEndpoints } = require("../models/api.model");

const getApi = (request, response) => {
  fetchEndpoints().then((endpoints) => {
    response.status(200).send({ endpoints });
  });
};

module.exports = { getApi };
