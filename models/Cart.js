const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("carts", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        deliveryFrom: {
            type: DataTypes.STRING(1024),
            defaultValue: 'Kho Đà Nẵng'
        },
        deliveryTo: {
            type: DataTypes.STRING(1024),
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'on-going' // You can set a default status for the cart
        },
    });
};