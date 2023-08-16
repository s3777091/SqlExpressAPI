const {DataTypes} = require("sequelize");
module.exports = (sequelize) => {
    const User = sequelize.define("users", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        avatar: {
            type: DataTypes.STRING,
            defaultValue: 'https://i.pinimg.com/originals/61/54/76/61547625e01d8daf941aae3ffb37f653.png'
        },
        location: {
            type: DataTypes.STRING(1024),
            defaultValue: '123 Stuff'
        },
        amount: {
            type: DataTypes.DOUBLE,
            defaultValue: 0.0
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

    });

    return User;
};