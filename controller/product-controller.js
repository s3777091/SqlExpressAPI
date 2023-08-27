
const db = require("../models");

const Admin = db.admin;

const { extractSpid } = require('../config/tool');
const Product = db.product;
const warehouse = db.warehouse;

const Category = db.category;



require("dotenv").config();

exports.createProduct = async (req, res) => {
    const transaction = await db.sequelize.transaction(); // Start a transaction
    try {
        const idCode = req.body.code;
        const page = req.body.page;
        const limit = req.body.limit;
        const WH = req.body.id;

        const token = await Admin.findOne({
            where: {
                link: process.env.VIDEO
            }
        });

        if (!token) {
            await transaction.rollback();
            return res.status(404).send({ message: "Code not found." });
        }

        const category = await Category.findOne({
            where: {
                code: idCode,
            },
            transaction
        });

        if (!category) {
            await transaction.rollback();
            return res.status(404).send({ message: "Category not found." });
        }

        const response = await fetch(
            `${process.env.TIKI_SLUG}?limit=${limit}&aggregations=2&version=home-persionalized&trackity_id=${token.code}&category=${category.code}&page=${page}&urlKey=${category.slug}`,
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
            const requireSpace = category.expectedSpace * category.expectedQuality * limit;
            const wareData = await warehouse.findOne({
                where: {
                    id: WH
                },transaction
            })

            if(wareData.available === 0){
                wareData.available = wareData.totalArea - requireSpace;
                await wareData.save({ transaction });
            } else {
                wareData.available -= requireSpace;
                await wareData.save({ transaction });
            }


            const [existingProduct, created] = await db.product.findOrCreate({
                where: {
                    prName: ne.name,
                    cost: ne.price,
                    categoryId: category.id
                },
                defaults: {
                    prId: ne.id,
                    prLink: ne.url_path,
                    image: ne.thumbnail_url,
                    rate: ne.rating_average,
                    brand: ne.brand_name,
                    discount: ne.discount,
                    space: category.expectedSpace,
                    amount: category.expectedQuality,
                    categoryId: category.id,
                    warehouseId: WH
                },
                transaction
            });
            return {
                name: existingProduct.prName,
                cost: existingProduct.cost,
                added: created
            };
        }));

        const addedProductsCount = addedProducts.filter(result => result.added).length;
        await transaction.commit();
        return res.status(200).send(
            addedProductsCount > 0
                ? `Added ${addedProductsCount} new products to category ${category.name}`
                : `No new products added to category ${category.name}`
        );
    } catch (error) {
        await transaction.rollback();
        res.status(500).send({ message: error.message });
    }
};

exports.viewProduct = async (req, res) => {
    try {
        const productCode = req.query.prId;
        const product = await Product.findOne({
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

//get comment of product
exports.viewComment = async (req, res) => {
    try {
        const productCode = req.query.prId;
        const limit = req.query.limit;

        const product = await Product.findOne({
            where: {
                prId: productCode,
            },
        });

        if (!product) {
            return res.status(404).send({ message: "Product not found." });
        }

        const spidValue = extractSpid(product.prLink);

        const response = await fetch(
            `${process.env.TIKI_COMMENT}?limit=${limit}&include=comments,contribute_info,attribute_vote_summary&sort=score,id,stars&page=1&spid=${spidValue}&product_id=${productCode}&seller_id=1`,
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
        const comments = data.data.map(ne => ({
            title: ne.title,
            content: ne.content,
            images: ne.images,
            rating: ne.rating,
            created_by_name: ne.created_by.name,
            created_by_image: ne.created_by.avatar_url
        }));

        const productInfo = {
            comment_detail: comments,
        };

        return res.status(200).send(productInfo);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
