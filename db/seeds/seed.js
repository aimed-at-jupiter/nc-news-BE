const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate, lookupObj } = require("./utils");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    .query(`DROP TABLE IF EXISTS comments`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS articles`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS topics`);
    })
    .then(() => {
      return db.query(
        `CREATE TABLE topics(slug VARCHAR(50) PRIMARY KEY NOT NULL,
         description VARCHAR(255) NOT NULL,
         img_url VARCHAR(1000))`
      );
    })
    .then(() => {
      return db.query(
        `CREATE TABLE users(username VARCHAR(30) PRIMARY KEY NOT NULL, 
         name VARCHAR(50) NOT NULL,
         avatar_url VARCHAR(1000))`
      );
    })
    .then(() => {
      return db.query(
        `CREATE TABLE articles(article_id SERIAL PRIMARY KEY, 
         title VARCHAR(150) NOT NULL, 
         topic VARCHAR(50) REFERENCES topics(slug) ON DELETE RESTRICT ,
         author VARCHAR(30) NULL REFERENCES users(username) ON DELETE SET NULL,
         body TEXT,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         votes INT DEFAULT 0,
         article_img_url VARCHAR(1000))`
      );
    })
    .then(() => {
      return db.query(`CREATE TABLE comments(comment_id SERIAL PRIMARY KEY,
        article_id INT REFERENCES articles(article_id) ON DELETE CASCADE,
        body TEXT,
        votes INT DEFAULT 0,
        author VARCHAR(30) NULL REFERENCES users(username) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    })
    .then(() => {
      const formattedTopicValues = topicData.map(
        ({ slug, description, img_url }) => {
          return [slug, description, img_url];
        }
      );
      const topicSqlString = format(
        `INSERT INTO topics (slug, description, img_url) VALUES %L RETURNING *`,
        formattedTopicValues
      );
      return db.query(topicSqlString);
    })
    .then(() => {
      const formattedUserValues = userData.map(
        ({ username, name, avatar_url }) => {
          return [username, name, avatar_url];
        }
      );
      const userSqlString = format(
        `INSERT INTO users (username, name, avatar_url) VALUES %L RETURNING *`,
        formattedUserValues
      );
      return db.query(userSqlString);
    })
    .then(() => {
      const articleDataUpdatedDates = articleData.map((article) => {
        return convertTimestampToDate(article);
      });
      const formattedArticleValues = articleDataUpdatedDates.map(
        ({
          title,
          topic,
          author,
          body,
          created_at,
          votes,
          article_img_url,
        }) => {
          return [
            title,
            topic,
            author,
            body,
            created_at,
            votes,
            article_img_url,
          ];
        }
      );
      const articleSqlString = format(
        `INSERT INTO articles (title,
            topic,
            author,
            body,
            created_at,
            votes,
            article_img_url) VALUES %L RETURNING *`,
        formattedArticleValues
      );
      return db.query(articleSqlString);
    })
    .then(({ rows }) => {
      const articleLookupObj = lookupObj(rows, "title", "article_id");

      const formattedCommentData = commentData.map((comment) => {
        const updatedComment = convertTimestampToDate(comment);
        return [
          articleLookupObj[comment.article_title],
          updatedComment.body,
          updatedComment.votes,
          updatedComment.author,
          updatedComment.created_at,
        ];
      });
      const commentSqlString = format(
        `INSERT INTO comments (article_id, body, votes, author, created_at) VALUES %L RETURNING *`,
        formattedCommentData
      );

      return db.query(commentSqlString);
    });
};

module.exports = seed;
