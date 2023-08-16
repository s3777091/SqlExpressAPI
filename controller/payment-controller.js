const db = require("../models");
const jwt = require("jsonwebtoken");
const config = require("../config/auth-config");

const Sequelize = require('sequelize');
const {DataTypes} = require("sequelize");


//Start database model
const User = db.user;
const Product = db.product;
const Cart = db.cart;
const Quality = db.quality;

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
    try {
        const decoded = jwt.verify(req.session.token, config.secret);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).send({
                message: "Need Login to view Cart!",
            });
        }

        const cart = await Cart.findOne({
            where: {
                user_id: user.id,
                status: 'on-going',
            },
            include: Product, // Include the Product model to fetch associated products
        });

        if (!cart) {
            return res.status(404).send({
                message: "Cart not found.",
            });
        }

        const productsInCart = await cart.getProducts(); // Access the associated products

        return res.status(200).send({
            message: "Products in the cart.",
            products: productsInCart,
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};


