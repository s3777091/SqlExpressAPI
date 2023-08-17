const { verifySignUp } = require("../Middleware");
const controller = require("../controller/auth-controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/sign_up",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.sign_up
  );

  app.post("/api/auth/sign_in", controller.sign_in);

  app.post("/api/auth/sign_out", controller.sign_out);
};