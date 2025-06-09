const {
  fetchArticles,
  fetchArticleById,
  updateArticleVotes,
} = require("../models/articles.models");
const { checkExists } = require("../db/seeds/utils");

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

const patchArticleVotesById = (request, response, next) => {
  const { article_id } = request.params;
  const { inc_votes } = request.body;

  if (isNaN(Number(article_id))) {
    return response.status(400).send({ msg: "Invalid article ID" });
  }

  if (typeof inc_votes !== "number") {
    return response.status(400).send({ msg: "Invalid vote increment" });
  }
  const id = Number(article_id);

  checkExists("articles", "article_id", id)
    .then(() => updateArticleVotes(id, inc_votes))
    .then((updatedArticle) => {
      response.status(200).send({ article: updatedArticle });
    })
    .catch(next);
};

module.exports = { getArticles, getArticleById, patchArticleVotesById };
