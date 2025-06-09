const db = require("../../db/connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.lookupObj = (array, objKey, objValue) => {
  if (
    array.length === 0 ||
    typeof objKey === "undefined" ||
    typeof objValue === "undefined"
  )
    return {};
  const newPairs = array.map((object) => {
    return [object[objKey], object[objValue]];
  });

  obj = Object.fromEntries(newPairs);

  return obj;
};

const VALID_TABLES = ["articles", "users", "topics", "comments"];
const VALID_COLUMNS = {
  articles: ["article_id"],
  users: ["username"],
  comments: ["comment_id", "body", "author", "article_id"],
};

exports.checkExists = (table, column, value) => {
  if (!VALID_TABLES.includes(table)) {
    throw { status: 400, msg: "Invalid table name" };
  }

  const validColumns = VALID_COLUMNS[table];
  if (!validColumns || !validColumns.includes(column)) {
    throw {
      status: 400,
      msg: "Invalid column name",
    };
  }

  const queryStr = `SELECT * FROM ${table} WHERE ${column} = $1`;

  return db.query(queryStr, [value]).then(({ rows }) => {
    if (!rows.length) {
      const singular = table.slice(0, -1);
      const capitalized = singular.charAt(0).toUpperCase() + singular.slice(1);
      return Promise.reject({
        status: 404,
        msg: `${capitalized} not found`,
      });
    }
  });
};
