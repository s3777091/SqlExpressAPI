const { authJwt } = require("../Middleware");
const controller = require("../controller/home-controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/view/by_category", controller.viewProductByCategory);

    app.get("/api/view/category", controller.getAllCategories);

    app.post("/api/add/code", [authJwt.verifyToken, authJwt.isAdmin], controller.addCode);

};