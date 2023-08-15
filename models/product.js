module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define("product", {
        prname: {
            type: Sequelize.STRING(1024)
        },
        prId: {
            type: Sequelize.STRING
        },
        prLink: {
            type: Sequelize.STRING(1024)
        },
        image: {
            type: Sequelize.STRING(1024)
        },
        cost: {
            type: Sequelize.DOUBLE
        },
        discount: {
            type: Sequelize.DOUBLE
        },
        rate: {
            type: Sequelize.DOUBLE
        }
    });

    return Product;
};
