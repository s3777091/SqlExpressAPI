const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("admin", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        link: {
            type: DataTypes.STRING(1024),
        },
        code: {
            type: DataTypes.STRING(256),
            defaultValue: '41f68dee-066d-fc61-e857-9c55815b2075'
        }
    }, {
        timestamps: false, // Disable automatic timestamps
    });
};