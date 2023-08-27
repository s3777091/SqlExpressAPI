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
        },
        deliveryTo: {
            type: DataTypes.STRING(1024),
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'on-going',
            indexes: [{
                fields: ['status_cart_idx']
            }]
        },
    }, {
        timestamps: false, // Disable automatic timestamps
    });
};