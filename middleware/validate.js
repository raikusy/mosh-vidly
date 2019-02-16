module.exports = valodator => {
  return function(req, res, next) {
    const { error } = valodator(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    next();
  };
};
