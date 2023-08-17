const {authJwt} = require("../Middleware");

const sales = require("../controller/sales-controller");
module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });


    app.post("/api/view/cart", [authJwt.verifyToken, authJwt.isSales], sales.viewCartByStatusAndName);

    app.get("/api/view/history", [authJwt.verifyToken], sales.viewHistoryCart);
};