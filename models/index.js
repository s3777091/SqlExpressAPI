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
db.warehouse = require("../models/WareHouse")(sequelize, Sequelize);

//This table on have code of tracking id
db.admin = require("../models/Admin")(sequelize, Sequelize);

//One To Many
db.category.hasMany(db.product, { foreignKey: 'categoryId', as: 'categoryProduct' });
db.product.belongsTo(db.category);

//Many to Many
db.role.belongsToMany(db.user, {
    through: "user_roles"
});

db.user.belongsToMany(db.role, {
    through: "user_roles"
});

db.warehouse.hasMany(db.product, {
    foreignKey: 'warehouseId',
})
db.product.belongsTo(db.warehouse);


db.user.hasMany(db.cart, {
    foreignKey: 'userId',
    as: 'user_carts'
});
db.cart.belongsTo(db.user);

db.cart.hasMany(db.quality, {
    foreignKey: 'cartId',
    as: 'cart_quality'
});
db.quality.belongsTo(db.cart);

db.ROLES = ["user", "admin", "seller"];

module.exports = db;