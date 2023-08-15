module.exports = (sequelize, Sequelize) => {
    const Categories = sequelize.define("categories", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        image: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        slug: {
            type: Sequelize.STRING
        },
        code: {
            type: Sequelize.STRING
        },
        link: {
            type: Sequelize.STRING
        }
    });

    return Categories;
};