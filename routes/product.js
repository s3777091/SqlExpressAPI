const { authJwt } = require("../Middleware");
const controller = require("../controller/product-controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/add/product",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.createProduct
    );

    app.get(
        "/api/view/product",
        controller.viewProduct
    );

};