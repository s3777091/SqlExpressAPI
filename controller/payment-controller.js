const db = require("../models");
const jwt = require("jsonwebtoken");
const config = require("../config/auth-config");

//Start database model
const User = db.user;
const Product = db.product;
const Cart = db.cart;
const Quality = db.quality;
const discount = db.discount;

function calculateTotalBill(qualities) {
    return qualities.reduce((totalBill, quality) => {
        return totalBill + quality.product_cost * quality.quality;
    }, 0);
}

exports.addCart = async (req, res) => {
    const productId = req.body.idProduct; // Product ID
    const quality = req.body.quality;

    try {
        const decoded = jwt.verify(req.session.token, config.secret);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).send({
                message: "Need Login to add Cart!", // Login Require
            });
        }

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).send({ message: "Something went wrong with the product. Please try again." });
        }

        const [cart, created] = await Cart.findOrCreate({
            where: {
                user_id: user.id,
                status: 'on-going',
            }
        });

        const existingQuality = await Quality.findOne({
            where: {
                productID: productId,
                cartId: cart.id,
            }
        });

        const transaction = await db.sequelize.transaction(); // Start a transaction

        try {
            if (existingQuality) {
                existingQuality.quality = existingQuality.quality + quality;
                await existingQuality.save({ transaction });
            } else {
                await Quality.bulkCreate(
                    [{
                        productID: product.id,
                        product_name: product.prname,
                        product_image: product.image,
                        product_cost: product.cost,
                        quality: quality,
                        cartId: cart.id,
                    }],
                    { transaction }
                );

                await cart.addProducts(product, { transaction });
            }

            await transaction.commit(); // Commit the transaction
            return res.status(200).send({
                message: "Products added to cart successfully.",
                cart: cart,
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

exports.OnPayment = async (req, res) => {
    const transaction = await db.sequelize.transaction(); // Start a transaction
    try {
        const locationChange = req.body.location;
        const ActiveCoupon = req.body.code;

        const decoded = jwt.verify(req.session.token, config.secret);
        const user = await User.findByPk(decoded.id, { transaction });

        if (!user) {
            await transaction.rollback(); // Rollback the transaction
            return res.status(401).send({
                message: "Need Login to perform this action.",
            });
        }

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

        // Update the cart status and deliveryTo
        cart.status = "success";
        cart.deliveryTo = user.location || locationChange;
        await cart.save({ transaction });

        const qualities = await Quality.findAll({
            where: {
                cartId: cart.id,
                status: 'on-going',
            },
            transaction,
        });

        let totalBill = calculateTotalBill(qualities);

        let discountValue = 0;
        if (ActiveCoupon) {
            // Apply discount if available
            const activeDiscount = await discount.findOne({
                where: {
                    userId: user.id,
                    code: ActiveCoupon,
                    isActive: true,
                },
                transaction,
            });

            if (activeDiscount) {
                discountValue = activeDiscount.value;
                activeDiscount.isActive = false;
                await activeDiscount.save({ transaction });
            } else {
                await transaction.rollback(); // Rollback the transaction
                return res.status(400).send({
                    message: "Wrong with code apply",
                });
            }
        }

        totalBill *= (1 - discountValue); // Apply the discount

        if (user.amount < totalBill) {
            await transaction.rollback(); // Rollback the transaction
            return res.status(400).send({
                message: "Insufficient funds for payment.",
            });
        }

        user.amount -= totalBill;
        await user.save({ transaction });

        // Update quality statuses in bulk
        await Quality.update(
            { status: 'success' },
            { where: { cartId: cart.id }, transaction }
        );

        await transaction.commit(); // Commit the transaction

        return res.status(200).send({
            message: "Cart status changed to transfer successfully.",
            payment: "Success payment product",
        });
    } catch (error) {
        await transaction.rollback(); // Rollback the transaction on error
        return res.status(500).send({ message: error.message });
    }
};