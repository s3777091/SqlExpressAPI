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

db.category.hasMany(db.product, { as: "categories" }); // One Category has many product


// db.product.belongsTo(db.category, {
//   foreignKey: "productid",
//   as: "product",
// });


//Many to Many
db.role.belongsToMany(db.user, {
    through: "user_roles"
});

db.user.belongsToMany(db.role, {
    through: "user_roles"
});

db.ROLES = ["user", "admin", "sales"];

module.exports = db;