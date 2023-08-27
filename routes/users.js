const { authJwt } = require("../Middleware");

const user = require("../controller/auth-controller");
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/user/information", authJwt.verifyToken, user.getUserInformation);


  app.post("/api/search", user.search);

};