const db = require("../models");
const jwt = require("jsonwebtoken");
const config = require("../config/auth-config");


//Start database model
const User = db.user;
const Product = db.product;
const Cart = db.cart;
const Quality = db.quality;
const discount = db.discount;

exports.viewCartByStatusAndName = async (req, res) => {
    const transaction = await db.sequelize.transaction(); // Start a transaction
    try {
        const filter = req.query.filter;
        const user_name = req.query.name;

        if(user_name){
            const user = await User.findOne({
                where: {
                    username: user_name,
                },
                attributes: ['id', 'avatar', 'username', 'email'],
                transaction,
            });

            if (!user) {
                await transaction.rollback(); // Rollback the transaction
                return res.status(404).send({
                    message: "No user found with the specified input.",
                });
            }

            const carts = await Cart.findAll({
                where: {
                    user_id: user.id
                },
                transaction,
            });

            if (carts.length === 0) {
                await transaction.rollback(); // Rollback the transaction
                return res.status(404).send({
                    message: "No carts found with the specified input.",
                });
            }

            const cartProcessingPromises = carts.map(async c => {
                const qualities = await Quality.findAll({
                    where: {
                        cartId: c.id
                    },
                    transaction,
                });

                let totalBill = 0;
                qualities.forEach(quality => {
                    totalBill += quality.product_cost * quality.quality;
                });

                const cartDetail = {
                    user_detail: user,
                    product_detail: qualities,
                    total_bill: totalBill,
                };

                if (filter === "success") {
                    const activeDiscount = await discount.findOne({
                        where: {
                            userId: user.id,
                            isActive: false,
                        },
                        transaction,
                    });
                    cartDetail.discountUsed = activeDiscount !== null;
                }

                return cartDetail;
            });

            const detail = await Promise.all(cartProcessingPromises);

            await transaction.commit(); // Commit the transaction

            // Send the constructed detail array
            return res.status(200).send({
                detail: detail,
            });

        }

        if(filter){
            const carts = await Cart.findAll({
                where: {
                    status: filter,
                },
                transaction,
            });

            if (carts.length === 0) {
                await transaction.rollback(); // Rollback the transaction
                return res.status(404).send({
                    message: "No carts found with the specified status.",
                });
            }

            let detail = [];

            for (const cart of carts) {
                const qualities = await Quality.findAll({
                    where: {
                        cartId: cart.id,
                        status: filter,
                    },
                    transaction,
                });

                // Get only required user details
                const user = await User.findByPk(cart.user_id, {
                    attributes: ['avatar', 'username', 'email'],
                    transaction,
                });

                let totalBill = 0;
                qualities.forEach(quality => {
                    totalBill += quality.product_cost * quality.quality;
                });

                const cartDetail = {
                    user_detail: user,
                    product_detail: qualities,
                    total_bill: totalBill,
                };

                if (filter === "success") {
                    const activeDiscount = await discount.findOne({
                        where: {
                            userId: cart.user_id,
                            isActive: false,
                        },
                        transaction,
                    });
                    cartDetail.discountUsed = activeDiscount !== null;
                }

                detail.push(cartDetail);
            }

            await transaction.commit(); // Commit the transaction

            // Send the constructed detail array
            return res.status(200).send({
                detail: detail,
            });
        }

        if (user_name && filter) {
            const user = await User.findOne({
                where: {
                    username: user_name,
                },
                attributes: ['id', 'avatar', 'username', 'email'],
                transaction,
            });

            if (!user) {
                await transaction.rollback(); // Rollback the transaction
                return res.status(404).send({
                    message: "No user found with the specified input.",
                });
            }

            const carts = await Cart.findAll({
                where: {
                    user_id: user.id,
                    status: filter,
                },
                transaction,
            });

            if (carts.length === 0) {
                await transaction.rollback(); // Rollback the transaction
                return res.status(404).send({
                    message: "No carts found with the specified input.",
                });
            }

            const cartProcessingPromises = carts.map(async cart => {
                const qualities = await Quality.findAll({
                    where: {
                        cartId: cart.id,
                        status: filter,
                    },
                    transaction,
                });

                let totalBill = 0;
                qualities.forEach(quality => {
                    totalBill += quality.product_cost * quality.quality;
                });

                const cartDetail = {
                    user_detail: user,
                    product_detail: qualities,
                    total_bill: totalBill,
                };

                if (filter === "success") {
                    const activeDiscount = await discount.findOne({
                        where: {
                            userId: user.id,
                            isActive: false,
                        },
                        transaction,
                    });
                    cartDetail.discountUsed = activeDiscount !== null;
                }

                return cartDetail;
            });

            const detail = await Promise.all(cartProcessingPromises);

            await transaction.commit(); // Commit the transaction

            // Send the constructed detail array
            return res.status(200).send({
                detail: detail,
            });
        }

    } catch (error) {
        await transaction.rollback(); // Rollback the transaction on error
        return res.status(500).send({ message: error.message });
    }
};

