# NC News Seeding

### Connecting to the Databases

This project uses environment variables to securely manage database configuration. To run the application locally:

1. Create two `.env` files in the root of the project:

   - `.env.development` for the development database
   - `.env.test` for the test database

2. Add the `PGDATABASE` variable to each file:

```env
.env.development
PGDATABASE=nc_news

.env.test
PGDATABASE=nc_news_test
```

`.env.*` files are git-ignored
