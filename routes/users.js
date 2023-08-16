const { authJwt } = require("../Middleware");
const controller = require("../controller/user-controller");

const user = require("../controller/auth-controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/test/all", controller.allAccess);

  app.get(
    "/api/test/user",
    [authJwt.verifyToken],
    controller.userBoard
  );

  app.get(
    "/api/test/sales",
    [authJwt.verifyToken, authJwt.isSales],
    controller.salesBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );

  app.get("/api/user/information", authJwt.verifyToken, user.getUserInformation);
};