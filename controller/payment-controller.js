const db = require("../models");
const jwt = require("jsonwebtoken");
const config = require("../config/auth-config");

//Start database model
const User = db.user;
const Cart = db.cart;
const Quality = db.quality;

const Product = db.product;

function calculateTotalBill(qualities) {
    return qualities.reduce((totalBill, quality) => {
        return totalBill + quality.product_cost * quality.quality;
    }, 0);
}

exports.addCart = async (req, res) => {
    const productId = req.body.idProduct; // Product ID
    const quality = req.body.quality;

    try {
        const transaction = await db.sequelize.transaction(); // Start a transaction

        const decoded = jwt.verify(req.session.token, config.secret);
        const user = await User.findByPk(decoded.id);

        try {
            await db.sequelize.query('CALL addProductToCart(?, ?, ?)',
                { replacements: [user.id, productId, quality] }
            );

            return res.status(200).send({
                message: 'Success add product to carts'
            });

        } catch (error) {
            await transaction.rollback(); // Rollback the transaction on error
            return res.status(500).send({ message: error.message });
        }

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

exports.viewProductsInCart = async (req, res) => {
    const transaction = await db.sequelize.transaction(); // Start a transaction

    try {
        const decoded = jwt.verify(req.session.token, config.secret);
        const user = await User.findByPk(decoded.id, { transaction });

        if (!user) {
            await transaction.rollback(); // Rollback the transaction
            return res.status(401).send({
                message: "Need Login to view cart!",
            });
        }

        const cart = await Cart.findOne({
            where: {
                userId: user.id,
                status: 'on-going',
            },
            transaction,
        });

        if (!cart) {
            await transaction.rollback(); // Rollback the transaction
            return res.status(404).send({
                message: "Cart is empty.",
            });
        }

        const qualities = await Quality.findAll({
            where: {
                cartId: cart.id,
            },
            transaction,
        });

        const totalBill = calculateTotalBill(qualities);

        await transaction.commit(); // Commit the transaction

        return res.status(200).send({
            cart: {
                id: cart.id,
                deliveryFrom: cart.deliveryFrom,
                deliveryTo: cart.deliveryTo,
                status: cart.status
            },
            products: qualities,
            totalBill: totalBill,
        });
    } catch (error) {
        await transaction.rollback(); // Rollback the transaction on error
        return res.status(500).send({ message: error.message });
    }
};


exports.OnPayment = async (req, res) => {
    try {
        const locationChange = req.body.location;
        const active = req.body.active;

        const decoded = jwt.verify(req.session.token, config.secret);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).send({
                message: "Need Login to perform this action.",
            });
        }
        await db.sequelize.query('CALL PerformPayment(?, ?, ?)',
            { replacements: [locationChange, active,user.id] }
        );

        return res.status(200).send({
            message: "Cart status changed to transfer successfully.",
            payment: "Success payment product",
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

exports.deleteProductFromCart = async (req, res) => {
    const transaction = await db.sequelize.transaction(); // Start a transaction

    try {
        const decoded = jwt.verify(req.session.token, config.secret);
        const user = await User.findByPk(decoded.id, { transaction });

        if (!user) {
            await transaction.rollback(); // Rollback the transaction
            return res.status(401).send({
                message: "Need Login to perform this action.",
            });
        }

        const productId = req.body.productId;

        const cart = await Cart.findOne({
            where: {
                user_id: user.id,
                status: 'on-going',
            },
            transaction,
        });

        if (!cart) {
            await transaction.rollback(); // Rollback the transaction
            return res.status(404).send({
                message: "Cart is empty.",
            });
        }

        const quality = await Quality.findOne({
            where: {
                cartId: cart.id,
                productID: productId,
            },
            transaction,
        });

        if (!quality) {
            await transaction.rollback(); // Rollback the transaction
            return res.status(404).send({
                message: "Product not found in the cart.",
            });
        }

        await quality.destroy({ transaction }); // Delete the quality entry

        await transaction.commit(); // Commit the transaction

        return res.status(200).send({
            message: "Product deleted from the cart successfully.",
        });
    } catch (error) {
        await transaction.rollback(); // Rollback the transaction on error
        return res.status(500).send({ message: error.message });
    }
};