const endpointsJson = require("../endpoints.json");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const request = require("supertest");
const app = require("../app");
/* Set up your test imports here */

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
