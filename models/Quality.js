const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("quality", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        productID: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'on-going',
            indexes: [{
                fields: ['status_quality_idx']
            }]
        },
        product_image: {
            type: DataTypes.STRING(1024)
        },
        product_name: {
            type: DataTypes.STRING
        },
        product_cost: {
            type: DataTypes.DOUBLE,
            defaultValue: 0.0
        },
        quality: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        timestamps: false, // Disable automatic timestamps
    });
};