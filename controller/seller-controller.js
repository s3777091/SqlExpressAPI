const db = require("../models");

const {Transaction} = require('sequelize');
const jwt = require("jsonwebtoken");
const config = require("../config/auth-config");


const User = db.user;
const Cart = db.cart;
const Quality = db.quality;

exports.viewCartByStatusAndName = async (req, res) => {
    const transaction = await db.sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED
    }); // Start a parent transaction
    try {
        const filter = req.query.filter;
        const user_name = req.query.name;

        let detail;

        let user = null;
        let carts = [];

        if (user_name) {
            user = await User.findOne({
                where: {
                    username: user_name,
                },
                attributes: ['id', 'avatar', 'username', 'email'],
                transaction,
            });

            if (!user) {
                await transaction.rollback();
                return res.status(404).send({
                    message: "No user found with the specified input.",
                });
            }

            if (filter) {
                carts = await Cart.findAll({
                    where: {
                        userId: user.id,
                        status: filter,
                    },
                    transaction,
                });
            } else {
                carts = await Cart.findAll({
                    where: {
                        userId: user.id,
                    },
                    transaction,
                });
            }
            const cartProcessingPromises = carts.map(async cart => {
                const qualities = await Quality.findAll({
                    where: {
                        cartId: cart.id,
                    },
                    transaction,
                });

                const cartDetail = {
                    product_detail: qualities.map(quality => ({
                        status: quality.status,
                        product_image: quality.product_image,
                        product_name: quality.product_name,
                        product_cost: quality.product_cost,
                        quality: quality.quality,
                    })),
                };

                if (user_name) {
                    cartDetail.user_detail = user;
                }

                return cartDetail;
            });

            detail = await Promise.all(cartProcessingPromises);

        } else if (filter) {

            carts = await Cart.findAll({
                where: {
                    status: filter,
                },
                transaction,
            });

            const cartProcessingPromises = carts.map(async cart => {
                const qualities = await Quality.findAll({
                    where: {
                        cartId: cart.id,
                        status: filter
                    },
                    transaction,
                });

                const cartDetail = {
                    product_detail: qualities.map(quality => ({
                        status: quality.status,
                        product_image: quality.product_image,
                        product_name: quality.product_name,
                        product_cost: quality.product_cost,
                        quality: quality.quality
                    })),
                };

                cartDetail.user_detail = await User.findByPk(cart.userId, {
                    attributes: ['avatar', 'username', 'email'],
                    transaction,
                });

                return cartDetail;
            });
            detail = await Promise.all(cartProcessingPromises);
        } else {
            await transaction.rollback();
            return res.status(400).send({
                message: "Please provide valid parameters.",
            });
        }

        if (carts.length === 0) {
            await transaction.rollback();
            return res.status(404).send({
                message: user ? "No carts found with the specified input." : "No carts found with the specified status.",
            });
        }

        await transaction.commit();

        return res.status(200).send({
            detail: detail,
        });

    } catch (error) {
        await transaction.rollback();
        return res.status(500).send({message: error.message});
    }
};


exports.viewHistoryCart = async (req, res) => {
    const transaction = await db.sequelize.transaction(); // Start a transaction
    let detail;
    try {
        const filter = req.query.filter;

        const decoded = jwt.verify(req.session.token, config.secret);
        const user = await User.findByPk(decoded.id, {transaction});

        if (!user) {
            await transaction.rollback(); // Rollback the transaction
            return res.status(401).send({
                message: "Need Login to perform this action.",
            });
        }

        const carts = await Cart.findAll({
            where: {
                userId: user.id,
                status: filter,
            },
            transaction,
        });

        if (!carts) {
            await transaction.rollback(); // Rollback the transaction
            return res.status(404).send({
                message: "Carts is empty.",
            });
        }

        const cartProcessingPromises = carts.map(async cart => {
            const qualities = await Quality.findAll({
                where: {
                    cartId: cart.id,
                    status: filter
                },
                transaction,
            });

            const cartDetail = {
                product_detail: qualities.map(quality => ({
                    status: quality.status,
                    product_image: quality.product_image,
                    product_name: quality.product_name,
                    product_cost: quality.product_cost,
                    quality: quality.quality,
                }))
            };

            cartDetail.user_detail = await User.findByPk(cart.userId, {
                attributes: ['avatar', 'username', 'email'],
                transaction,
            });

            return cartDetail;
        });
        detail = await Promise.all(cartProcessingPromises);

        if (carts.length === 0) {
            await transaction.rollback();
            return res.status(404).send({
                message: user ? "No carts found with the specified input." : "No carts found with the specified status.",
            });
        }

        await transaction.commit();
        return res.status(200).send({
            detail: detail,
        });

    } catch (error) {
        await transaction.rollback();
        return res.status(500).send({message: error.message});
    }
}