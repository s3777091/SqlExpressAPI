const db = require("../models");

const Product = db.product;
const Category = db.category;
const Admin = db.admin;

//View Product by category;
exports.viewProductByCategory = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const categoryId = req.query.categoryId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        if (!categoryId) {
            await transaction.rollback();
            return res.status(400).send({ message: "Please provide a valid category ID." });
        }

        const category = await Category.findOne({
            where: {
                id: categoryId,
            },
            attributes: ['id', 'name', 'image', 'slug', 'code', 'link'],
            raw: true,
            transaction
        });

        if (!category) {
            await transaction.rollback();
            return res.status(404).send({ message: "Category not found." });
        }

        const products = await Product.findAll({
            where: {
                categoryId: category.id
            },
            attributes: ['prname', 'prId', 'prLink', 'image', 'cost', 'discount', 'rate'],
            raw: true,
            offset: parseInt(offset),
            limit: limit,
            transaction
        });

        const categoryWithProducts = {
            category_info: category,
            products: products
        };

        await transaction.commit(); // Commit the transaction
        return res.status(200).send(categoryWithProducts);
    } catch (error) {
        await transaction.rollback();
        res.status(500).send({ message: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            attributes: ['id', 'name', 'image', 'slug', 'code', 'link'],
            raw: true // Fetch raw data
        });

        return res.status(200).send(categories);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

//Add Tracking_id
exports.addCode = async (req, res) => {
    try {
        const [cart, created] = await Admin.findOrCreate({
            where: {
                code: req.body.code,
            },
            defaults: {
                link: 'https://www.youtube.com/watch?v=ECxVfrwwTp0' // Specify the code you want to add
            }
        });
        if (!created) {
            return res.status(400).send({ message: "Cart code already exists." });
        }

        return res.status(200).send({ message: "code added successfully.", code:  cart.code});
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};



