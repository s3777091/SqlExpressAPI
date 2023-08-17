const db = require("../models");
const config = require("../config/auth-config");
const User = db.user;
const Role = db.role;

const Coupon = db.discount;

const Op = db.Sequelize.Op;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


exports.sign_up = async (req, res) => {
    const transaction = await db.sequelize.transaction(); // Start a transaction
    try {
        const user = await db.user.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
        }, { transaction });

        const couponCodes = ['Welcome', 'Vip777', 'Vip999'];
        const discountValue = 0.2; // 20% discount

        // Create the user's discounts
        const discountPromises = couponCodes.map(code => {
            return Coupon.create({
                code: code,
                userId: user.id,
                value: discountValue,
            }, { transaction });
        });

        await Promise.all(discountPromises);

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
            await transaction.commit(); // Commit the transaction
            res.send({ message: "User registered successfully!" });
        }
    } catch (error) {
        await transaction.rollback(); // Rollback the transaction on error
        res.status(500).send({ message: error.message });
    }
};




exports.sign_in = async (req, res) => {
    const transaction = await db.sequelize.transaction(); // Start a transaction
    try {
        const user = await User.findOne({
            where: {
                username: req.body.username,
            },
            transaction,
        });

        if (!user) {
            await transaction.rollback(); // Rollback the transaction
            return res.status(404).send({ message: "User Not found." });
        }

        const passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            await transaction.rollback(); // Rollback the transaction
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

        await transaction.commit(); // Commit the transaction

        return res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            roles: authorities,
        });
    } catch (error) {
        await transaction.rollback(); // Rollback the transaction on error
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