const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("product", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        prname: {
            type: DataTypes.STRING(1024)
        },
        prId: {
            type: DataTypes.STRING
        },
        prLink: {
            type: DataTypes.STRING(1024)
        },
        image: {
            type: DataTypes.STRING(1024)
        },
        cost: {
            type: DataTypes.DOUBLE
        },
        discount: {
            type: DataTypes.DOUBLE
        },
        rate: {
            type: DataTypes.DOUBLE
        }
    });
};
