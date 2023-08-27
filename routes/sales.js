const {authJwt} = require("../Middleware");

const seller = require("../controller/seller-controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });


    app.post("/api/view/cart", [authJwt.verifyToken], seller.viewCartByStatusAndName);

    app.post("/api/view/history", [authJwt.verifyToken], seller.viewHistoryCart);
};