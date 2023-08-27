const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("users", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            indexes: [{
                fields: ['user_name_idx']
            }]
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        avatar: {
            type: DataTypes.STRING,
            defaultValue: 'https://i.pinimg.com/originals/61/54/76/61547625e01d8daf941aae3ffb37f653.png'
        },
        location: {
            type: DataTypes.STRING(1024),
        },
        amount: {
            type: DataTypes.DOUBLE,
            defaultValue: 0.0
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,
    });
};