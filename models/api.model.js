const fs = require("fs/promises");
const path = require("path");

exports.fetchEndpoints = () => {
  const filePath = path.join(__dirname, "../endpoints.json");

  return fs.readFile(filePath, "utf8").then((data) => JSON.parse(data));
};
