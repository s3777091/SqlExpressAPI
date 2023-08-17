const db = require("../models");

const { Transaction } = require('sequelize');
// Start database model
const User = db.user;
const Cart = db.cart;
const Quality = db.quality;
const discount = db.discount;

function calculateTotalBill(qualities) {
    return qualities.reduce((totalBill, quality) => {
        return totalBill + quality.product_cost * quality.quality;
    }, 0);
}

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
                        user_id: user.id,
                        status: filter,
                    },
                    transaction,
                });
            } else {
                carts = await Cart.findAll({
                    where: {
                        user_id: user.id,
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
                const totalBill = calculateTotalBill(qualities);

                const cartDetail = {
                    product_detail: qualities.map(quality => ({
                        status: quality.status,
                        product_image: quality.product_image,
                        product_name: quality.product_name,
                        product_cost: quality.product_cost,
                        quality: quality.quality,
                    })),
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

                if (user) {
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

                const totalBill = calculateTotalBill(qualities);

                const cartDetail = {
                    product_detail: qualities.map(quality => ({
                        status: quality.status,
                        product_image: quality.product_image,
                        product_name: quality.product_name,
                        product_cost: quality.product_cost,
                        quality: quality.quality,
                    })),
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

                cartDetail.user_detail = await User.findByPk(cart.user_id, {
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
        return res.status(500).send({ message: error.message });
    }
};