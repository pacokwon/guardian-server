module.exports = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: process.env.NODE_ENV === 'test' ? 'GuardianTest' : 'Guardian',
    synchronize: false,
    logging: false,
    entities: ['src/entities/*.ts']
};
