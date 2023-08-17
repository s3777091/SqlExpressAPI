const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Discount", {
        code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        value: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    });
};