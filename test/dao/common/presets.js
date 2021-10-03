const { sequelize } = require('../../../models');

if (process.env.NODE_ENV != 'test') {
    throw new Error('Only allow TEST ENV');
}

module.exports = async (context) => {
    context.timeout(100000);
    if (process.env.NODE_ENV != 'test') {
        throw new Error('Only allow TEST ENV');
    }
    await Promise.all([
        sequelize
            .query('SET FOREIGN_KEY_CHECKS = 0')
            .then(function () {
                return sequelize.sync();
            })
            .then(function () {
                return sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
            }),
        require('../../../utils/db/mongoose.js'),
    ]);
    await require('./seeds.js')();
    context.timeout();
};
