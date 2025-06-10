const app = require("./app");

const port = 9999;
const { PORT = 9090 } = process.env;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
