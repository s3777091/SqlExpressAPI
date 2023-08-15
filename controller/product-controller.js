
const db = require("../models");

const { extractSpid } = require('../config/tool');
const Pduct = db.product;

const Category = db.category;


require("dotenv").config();

exports.createProduct = async (req, res) => {
    try {
        const idCode = req.body.code; //code
        const page = req.body.page;

        const category = await Category.findOne({
            where: {
                code: idCode,
            },
        });

        if (!category) {
            return res.status(404).send({ message: "category Not found." });
        }

        let $ = await fetch(
            `${process.env.TIKI_SLUG}?limit=40&aggregations=2&version=home-persionalized&trackity_id=${process.env.TOKEN}&category=${category.code}&page=${page}&urlKey=${category.slug}`,
            {
                method: "GET",
                contentType: "application/json",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
                },
            }
        );

        const data = await $.json();
        const list = data.data;

        const promises = list.map(async (ne) => {
            const existingProduct = await Pduct.findOne({
                where: {
                    prname: ne.name,
                    cost: ne.price,
                    categoryId: category.id
                }
            });

            if (!existingProduct) {
                await Pduct.create({
                    prname: ne.name,
                    prId: ne.id,
                    prLink: ne.url_path,
                    cost: ne.price,
                    image: ne.thumbnail_url,
                    rate: ne.rating_average,
                    discount: ne.discount,
                    categoryId: category.id
                });
                return {
                    name: ne.name,
                    added: true
                };
            } else {
                return {
                    name: ne.name,
                    added: false
                };
            }
        });

        const results = await Promise.all(promises);

        // Count how many products were added
        const addedProductsCount = results.filter(result => result.added).length;

        if (addedProductsCount > 0) {
            return res.status(200).send(`Added ${addedProductsCount} new products to category ${category.name}`);
        } else {
            return res.status(200).send(`No new products added to category ${category.name}`);
        }


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
    
        let $ = await fetch(
            `${process.env.TIKI_DETAIL}/${product.prId}?platform=web&spid=${spidValue}`,{
                method: "GET",
                contentType: "application/json",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
                },
            }
        );
        const data = await $.json();
        return res.status(200).send({
            name: data.name,
            image: data.thumbnail_url,
            listImage: data.images,
            price: data.price,
            specifications: data.specifications,
            warranty_info: data.warranty_info,
            options: data.configurable_options,
            description: data.description,
            short_description: data.short_description,
        });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};