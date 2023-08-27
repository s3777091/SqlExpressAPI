const db = require("../models");
const config = require("../config/auth-config");

const User = db.user;
const Role = db.role;
const Product = db.product;
const Op = db.Sequelize.Op;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.sign_up = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const user = await db.user.create({
            username: req.body.username,
            email: req.body.email,
            amount: '99999999999', //Test Money
            password: bcrypt.hashSync(req.body.password, 8),
        }, { transaction });

        const rolesToSet = req.body.roles ? req.body.roles : [1];
        const roles = await Role.findAll({
            where: {
                name: {
                    [Op.or]: rolesToSet,
                },
            },
            transaction,
        });

        const result = await user.setRoles(roles, { transaction });
        if (result) {
            await transaction.commit();
            res.send({ message: "User registered successfully!" });
        }
    } catch (error) {
        await transaction.rollback();
        res.status(500).send({ message: error.message });
    }
};

exports.sign_in = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const user = await User.findOne({
            where: {
                username: req.body.username,
            },
            transaction,
        });

        if (!user) {
            await transaction.rollback();
            return res.status(404).send({ message: "User Not found." });
        }

        const passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            await transaction.rollback();
            return res.status(401).send({
                message: "Invalid Password!",
            });
        }

        const token = jwt.sign({ id: user.id },
            config.secret,
            {
                algorithm: 'HS256',
                allowInsecureKeySizes: true,
                expiresIn: 86400, // 24 hours
            });

        let authorities = [];
        const roles = await user.getRoles({ transaction });

        for (let i = 0; i < roles.length; i++) {
            authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }

        req.session.token = token;

        await transaction.commit();
        return res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            roles: authorities,
        });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).send({ message: error.message });
    }
};

exports.getUserInformation = async (req, res) => {
    try {
        const decoded = jwt.verify(req.session.token, config.secret);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).send({
                message: "User not found!",
            });
        }

        const userRoles = await user.getRoles();

        return res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            roles: userRoles.map(role => role.name)
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

exports.sign_out = async (req, res) => {
    try {
        req.session = null;
        return res.status(200).send({
            message: "You've been signed out!"
        });
    } catch (err) {
        this.next(err);
    }
};

exports.search = async (req, res) => {
    try {
        const searchTerm = req.body.search;
        const page = req.query.page || 1;
        const pageSize = 10;

        const products = await Product.findAndCountAll({
            where: {
                [Op.or]: [
                    { prName: { [Op.like]: `%${searchTerm}%` } },
                ],
            },
            // Implement pagination using offset and limit
            offset: (page - 1) * pageSize,
            limit: pageSize,
            // Enable Full-Text Search
            attributes: {
                include: [
                    [db.sequelize.literal(`MATCH(prName) AGAINST('${searchTerm}' IN BOOLEAN MODE)`), "score"]
                ]
            },
            // Order by Full-Text Search score
            order: [[db.sequelize.literal("score"), "DESC"]],
        });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.filterProduct = async (req, res) => {

    try {
        const filter = req.body.filter;
        const page = req.query.page || 1;
        const pageSize = 10;


    } catch (error) {
        res.status(500).send({ message: error.message });
    }

}
