const articles = require("../db/data/test-data/articles");
const { fetchArticles } = require("../models/articles.model");

const getArticles = (request, response) => {
  fetchArticles().then((articles) => {
    console.log("controller response >>", { articles });
    response.status(200).send({ articles });
  });
};

module.exports = { getArticles };
