import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

// Configuração única usada pela API (AppModule) e pela CLI do TypeORM (migrations).
// Os globs funcionam tanto com ts-node (src/*.ts) quanto com o build (dist/*.js).
export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_DATABASE || 'coresync',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  // Nunca use synchronize em produção: o schema é versionado pelas migrations.
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
};

export default new DataSource(dataSourceOptions);
