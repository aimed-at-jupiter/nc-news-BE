const {
  fetchArticles,
  fetchArticleById,
} = require("../models/articles.models");

const getArticles = (request, response) => {
  fetchArticles().then((articles) => {
    response.status(200).send({ articles });
  });
};

const getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  if (isNaN(article_id)) {
    return next({ status: 400, msg: "Invalid article ID" });
  }
  fetchArticleById(article_id)
    .then((article) => {
      if (!article) {
        return next({ status: 404, msg: "Article not found" });
      }

      response.status(200).send({ article });
    })
    .catch(next);
};

module.exports = { getArticles, getArticleById };
