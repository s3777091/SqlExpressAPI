const {DataTypes} = require("sequelize");
module.exports = (sequelize) => {
    return sequelize.define("roles", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: false, // Disable automatic timestamps
    });
};