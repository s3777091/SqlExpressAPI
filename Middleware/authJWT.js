const jwt = require("jsonwebtoken");
const config = require("../config/auth-config");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
    let token = req.session.token;

    if (!token) {
        return res.status(403).send({
            message: "No token provided!",
        });
    }

    jwt.verify(token,
        config.secret,
        (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: "Unauthorized!",
                });
            }
            req.userId = decoded.id;
            next();
        });
};

isAdmin = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId);
        const roles = await user.getRoles();

        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "admin") {
                return next();
            }
        }

        return res.status(403).send({
            message: "Require Admin Role!",
        });
    } catch (error) {
        return res.status(500).send({
            message: "Unable to validate User role!",
        });
    }
};

isSales = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId);
        const roles = await user.getRoles();

        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "seller") {
                return next();
            }
        }

        return res.status(403).send({
            message: "Require seller Role!",
        });
    } catch (error) {
        return res.status(500).send({
            message: "Unable to validate seller role!",
        });
    }
};

isSalesOrAdmin = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId);
        const roles = await user.getRoles();

        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "seller") {
                return next();
            }

            if (roles[i].name === "admin") {
                return next();
            }
        }

        return res.status(403).send({
            message: "Require seller or Admin Role!",
        });
    } catch (error) {
        return res.status(500).send({
            message: "Unable to validate seller or Admin role!",
        });
    }
};

const authJwt = {
    verifyToken,
    isAdmin,
    isSales,
    isSalesOrAdmin,
};
module.exports = authJwt;