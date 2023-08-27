const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("warehouse", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        province: {
            type: DataTypes.STRING,
            allowNull: false
        },
        district: {
            type: DataTypes.STRING,
            allowNull: false
        },
        street: {
            type: DataTypes.STRING,
            allowNull: false
        },
        available: {
            type: DataTypes.DOUBLE(10, 4),
            defaultValue: 0.0
        },
        totalArea:{
            type: DataTypes.DOUBLE,
            defaultValue: 2000
        }
    }, {
        timestamps: false,
    });
};
