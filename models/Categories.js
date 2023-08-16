const {DataTypes} = require("sequelize");
module.exports = (sequelize) => {
    return sequelize.define("categories", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        image: {
            type: DataTypes.STRING
        },
        name: {
            type: DataTypes.STRING
        },
        slug: {
            type: DataTypes.STRING
        },
        code: {
            type: DataTypes.STRING
        },
        link: {
            type: DataTypes.STRING
        }
    });
};