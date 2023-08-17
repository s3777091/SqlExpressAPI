const config = require("../config/db-config");

const Sequelize = require("sequelize");

const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        dialect: config.dialect,
        pool: {
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        }
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user")(sequelize, Sequelize);
db.role = require("../models/role")(sequelize, Sequelize);
db.product = require("../models/product")(sequelize, Sequelize);
db.category = require("../models/Categories")(sequelize, Sequelize);
db.cart = require("../models/Cart")(sequelize, Sequelize);
db.quality = require("../models/Quality")(sequelize, Sequelize);
db.discount = require("../models/Discount")(sequelize, Sequelize);

//This table on have code of tracking id
db.admin = require("../models/Admin")(sequelize, Sequelize);


//One To Many
db.category.hasMany(db.product, { foreignKey: 'category_id', as: 'categoryProduct' });
db.product.belongsTo(db.category);

//Many to Many
db.role.belongsToMany(db.user, {
    through: "user_roles"
});

db.user.belongsToMany(db.role, {
    through: "user_roles"
});

// Association between User and Cart
db.user.hasMany(db.cart, {
    foreignKey: 'user_id', // Make sure this matches your database column name
    as: 'user_carts'
});
db.cart.belongsTo(db.user);

//Many To Many
db.cart.belongsToMany(db.product, {
    through: {
        model: 'carts_product',
        unique: false, // Adjust this based on your needs
        // Add any other options you need for the association
    },
    as: 'products',
    foreignKey: 'cart_id',
    otherKey: 'product_id',
});

db.product.belongsToMany(db.cart, {
    through: {
        model: 'carts_product',
        unique: false
    },
    as: 'carts',
    foreignKey: 'product_id',
    otherKey: 'cart_id',
});

// Association between User and Cart
db.cart.hasMany(db.quality, {
    foreignKey: 'cart_id', // Make sure this matches your database column name
    as: 'cart_quality'
});
db.quality.belongsTo(db.cart);

// Association between User and Cart
db.user.hasMany(db.discount, {
    foreignKey: 'discount_id', // Make sure this matches your database column name
    as: 'user_discount'
});
db.discount.belongsTo(db.user);

db.ROLES = ["user", "admin", "sales"];

module.exports = db;