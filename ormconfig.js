const dbConfig = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/entities/*.entity.js'],
  synchronize: false,
  migrations: ['dist/db/*.js'],
  cli: {
    migrationsDir: 'src/db',
  },
};

module.exports = dbConfig;
