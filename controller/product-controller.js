
const db = require("../models");

const { extractSpid } = require('../config/tool');
const Pduct = db.product;

const Category = db.category;


require("dotenv").config();

exports.createProduct = async (req, res) => {
    try {
        const idCode = req.body.code;
        const page = req.body.page;

        const category = await Category.findOne({
            where: {
                code: idCode,
            },
        });

        if (!category) {
            return res.status(404).send({ message: "Category not found." });
        }

        const response = await fetch(
            `${process.env.TIKI_SLUG}?limit=40&aggregations=2&version=home-persionalized&trackity_id=${process.env.TOKEN}&category=${category.code}&page=${page}&urlKey=${category.slug}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
                },
            }
        );

        const data = await response.json();
        const list = data.data;

        const addedProducts = await Promise.all(list.map(async (ne) => {
            const [existingProduct, created] = await Pduct.findOrCreate({
                where: {
                    prname: ne.name,
                    cost: ne.price,
                    categoryId: category.id
                },
                defaults: {
                    prId: ne.id,
                    prLink: ne.url_path,
                    image: ne.thumbnail_url,
                    rate: ne.rating_average,
                    discount: ne.discount,
                    categoryId: category.id
                }
            });

            return {
                name: ne.name,
                added: created
            };
        }));

        const addedProductsCount = addedProducts.filter(result => result.added).length;

        return res.status(200).send(
            addedProductsCount > 0
                ? `Added ${addedProductsCount} new products to category ${category.name}`
                : `No new products added to category ${category.name}`
        );
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


exports.viewProduct = async (req, res) => {
    try {
        const productCode = req.query.prId;
        const product = await Pduct.findOne({
            where: {
                prId: productCode,
            },
        });

        const spidValue = extractSpid(product.prLink);

        const response = await fetch(
            `${process.env.TIKI_DETAIL}/${product.prId}?platform=web&spid=${spidValue}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
                },
            }
        );

        const data = await response.json();
        const productInfo = {
            name: data.name,
            image: data.thumbnail_url,
            listImage: data.images,
            price: data.price,
            specifications: data.specifications,
            warranty_info: data.warranty_info,
            options: data.configurable_options,
            description: data.description,
            short_description: data.short_description,
        };

        return res.status(200).send(productInfo);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
