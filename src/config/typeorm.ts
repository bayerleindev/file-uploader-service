import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { User } from '../users/user.repository';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

const typeormConfig = {
  type: 'postgres',
  host: `${process.env.DATABASE_HOST}`,
  port: Number(process.env.DATABASE_PORT),
  username: `${process.env.DATABASE_USERNAME}`,
  password: `${process.env.DATABASE_PASSWORD}`,
  database: `${process.env.DATABASE_NAME}`,
  entities: [User],
  migrations: ['src/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: false,
};

export default registerAs('typeorm', () => typeormConfig);
export const connectionSource = new DataSource(
  typeormConfig as DataSourceOptions,
);
// export default () => typeormConfig
