const endpointsJson = require("../endpoints.json");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const request = require("supertest");
const app = require("../app");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});
describe("GET /api/topics", () => {
  test("200: Reponds with an object with the key of topics and the value of an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(Array.isArray(topics)).toBe(true);
        expect(topics.length).toBeGreaterThan(0);
        topics.forEach((topic) => {
          expect(Object.keys(topic)).toEqual(["slug", "description"]);
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});
describe("GET /api/articles", () => {
  test("200: Responds with an object with the key of articles and the value of an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeGreaterThan(0);
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              author: expect.any(String),
              title: expect.any(String),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
          expect(article).not.toHaveProperty("body");
        });
        for (let i = 0; i < articles.length - 1; i++) {
          const currentDate = new Date(articles[i].created_at);
          const nextDate = new Date(articles[i + 1].created_at);
          expect(currentDate >= nextDate).toBe(true);
        }
      });
  });
});
describe("GET /api/users", () => {
  test(" 200: Responds with an object with the key of users and the value of an array of objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
        users.forEach((user) => {
          expect(Object.keys(user)).toEqual(["username", "name", "avatar_url"]);
          expect(typeof user.username).toBe("string");
          expect(typeof user.name).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });
});
describe("GET /api/articles/:article_id", () => {
  test("200: Responds with an individual article object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article.article_id).toBe(1);
        expect(typeof article.title).toBe("string");
        expect(typeof article.author).toBe("string");
        expect(typeof article.topic).toBe("string");
        expect(typeof article.body).toBe("string");
        expect(typeof article.created_at).toBe("string");
        expect(typeof article.votes).toBe("number");
        expect(typeof article.article_img_url).toBe("string");
        expect(typeof article.comment_count).toBe("number");
      });
  });
  test("400: Responds with 'Invalid article ID' when passed a non-numeric ID", () => {
    return request(app)
      .get("/api/articles/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid article ID");
      });
  });

  test("404: Responds with 'Article not found' when passed a valid but non-existent ID", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
});
describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with an object with the key of comments and the value of an array of comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBeGreaterThan(0);

        comments.forEach((comment) => {
          expect(Object.keys(comment)).toEqual([
            "comment_id",
            "body",
            "article_id",
            "author",
            "votes",
            "created_at",
          ]);

          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.body).toBe("string");
          expect(typeof comment.article_id).toBe("number");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
        });
      });
  });
});
test("200: Responds with { comments: [] } when the article has no comments", () => {
  return request(app)
    .get("/api/articles/2/comments")
    .expect(200)
    .then(({ body }) => {
      expect(body).toEqual({ comments: [] });
    });
});
test("404: Responds with 'Article not found' for valid but non-existent ID", () => {
  return request(app)
    .get("/api/articles/9999/comments")
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe("Article not found");
    });
});
test("400: Responds with 'Invalid article ID' when passed a non-numeric ID", () => {
  return request(app)
    .get("/api/articles/banana/comments")
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe("Invalid article ID");
    });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Successfully creates a comment for a valid article_id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This article is amazing!",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toHaveProperty("comment_id");
        expect(body.comment.body).toBe(newComment.body);
        expect(body.comment.author).toBe(newComment.username);
        expect(body.comment.article_id).toBe(1);
        expect(typeof body.comment.created_at).toBe("string");
      });
  });

  test("400: Responds with 'Missing required fields: username and body' when missing required fields", () => {
    const incompleteComment = {
      username: "butter_bridge",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(incompleteComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing required fields: username and body");
      });
  });

  test("404: Responds with 'Article not found' for valid but non-existent article_id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This article is amazing!",
    };

    return request(app)
      .post("/api/articles/9999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });

  test("400: Responds with 'Invalid article ID' for non-numeric article_id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This article is amazing!",
    };

    return request(app)
      .post("/api/articles/banana/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid article ID");
      });
  });
});
describe("PATCH /api/articles/:article_id", () => {
  test("200: Increments votes by given positive number and responds with updated article object", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toHaveProperty("votes", 101);
      });
  });
  test("200: Increments votes by given negative number and responds with updated article object", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -1 })
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toHaveProperty("votes", 99);
      });
  });
  test("400: Responds with 'Invalid article ID' for non-numeric article_id", () => {
    return request(app)
      .patch("/api/articles/banana")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid article ID");
      });
  });
  test("400: Responds with 'Invalid vote increment' for non-numeric inc_vote", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "banana" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid vote increment");
      });
  });
  test("404: Responds with 'Article not found' when article doesn't exist", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
});
describe("DELETE /api/comments/:comment_id", () => {
  test("204: Deletes the given comment and responds with no content", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(() => {
        return db.query(`SELECT * FROM comments WHERE comment_id = 1;`);
      })
      .then((result) => {
        expect(result.rows.length).toBe(0);
      });
  });
  test("404: Responds with 'Comment not found' when comment_id does not exist", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment not found");
      });
  });
  test("400: Responds with 'Invalid comment ID' for non-numeric comment_id", () => {
    return request(app)
      .delete("/api/comments/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid comment ID");
      });
  });
});
