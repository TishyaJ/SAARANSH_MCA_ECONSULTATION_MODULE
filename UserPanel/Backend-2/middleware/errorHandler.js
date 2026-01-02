// Central error handling middleware: error ko console pe dikhake client ko response bhejta hai
module.exports = (err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};
