const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("product", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        prName: {
            type: DataTypes.STRING(1024),
            indexes: [{
                fields: ['product_name_idx']
            }]
        },
        prId: {
            type: DataTypes.STRING,
        },
        space: {
            type: DataTypes.DOUBLE(10, 4),
        },
        amount: {
            type: DataTypes.INTEGER
        },
        brand: {
            type: DataTypes.STRING,
            defaultValue: 'Samsung',
        },
        prLink: {
            type: DataTypes.STRING(1024)
        },
        image: {
            type: DataTypes.STRING(1024)
        },
        cost: {
            type: DataTypes.DOUBLE,
            indexes: [{
                fields: ['cost_idx']
            }]

        }
    }, {
        timestamps: false,
    });
};
