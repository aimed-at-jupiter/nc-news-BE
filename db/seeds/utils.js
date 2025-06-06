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
