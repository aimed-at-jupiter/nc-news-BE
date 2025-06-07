const {
  fetchArticles,
  fetchArticleById,
} = require("../models/articles.models");

const getArticles = (request, response) => {
  fetchArticles().then((articles) => {
    response.status(200).send({ articles });
  });
};

const getArticleById = (request, response) => {
  const { article_id } = request.params;
  fetchArticleById(article_id).then((article) => {
    response.status(200).send({ article });
  });
};

module.exports = { getArticles, getArticleById };
