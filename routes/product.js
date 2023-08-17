const { authJwt } = require("../Middleware");
const controller = require("../controller/product-controller");
const CartController = require("../controller/payment-controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/add/product", [authJwt.verifyToken, authJwt.isAdmin], controller.createProduct);

    app.get("/api/view/product", controller.viewProduct);

    app.post("/api/add/product_to_cart", [authJwt.verifyToken], CartController.addCart);

    app.get("/api/view/cart", [authJwt.verifyToken], CartController.viewProductsInCart);

    app.post("/api/delete/product_from_cart", [authJwt.verifyToken], CartController.deleteProductFromCart);

    app.post("/api/payment", [authJwt.verifyToken], CartController.OnPayment);
};