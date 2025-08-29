const handleCustomErrors = (err, request, response, next) => {
  if (err.status && err.msg) {
    response.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

const handlePsqlErrors = (err, request, response, next) => {
  if (err.code === "22P02") {
    response.status(400).send({ msg: "Invalid input" });
  } else if (err.code === "23503") {
    response.status(404).send({ msg: "Foreign key violation" });
  } else if (err.code === "23502") {
    response.status(400).send({ msg: "Missing required field" });
  } else {
    next(err);
  }
};

const handleServerError = (err, request, response, next) => {
  console.error(err);
  response.status(500).send({ msg: "Internal Server Error!" });
};

module.exports = {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerError,
};
