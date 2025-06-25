const db = require("../db/connection");

const fetchArticles = () => {
  return db
    .query(
      `
    SELECT 
      articles.article_id,
      articles.author,
      articles.title,
      articles.topic,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
      COUNT(comments.comment_id)::INT AS comment_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC;
  `
    )
    .then(({ rows }) => {
      return rows;
    });
};

const fetchArticleById = (article_id) => {
  const queryStr = `
    SELECT 
      articles.article_id,
      articles.author,
      articles.title,
      articles.topic,
      articles.body,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
      COUNT(comments.comment_id)::INT AS comment_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;
  `;
  return db.query(queryStr, [article_id]).then(({ rows }) => {
    return rows[0];
  });
};

const updateArticleVotes = (article_id, inc_votes) => {
  const queryStr = `
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;
  `;
  return db.query(queryStr, [inc_votes, article_id]).then(({ rows }) => {
    if (!rows.length) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return rows[0];
  });
};

module.exports = {
  fetchArticles,
  fetchArticleById,
  updateArticleVotes,
};
