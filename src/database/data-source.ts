import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../iam/entities/user.entity';
import { UserProfile } from '../iam/entities/user-profile.entity';
import { AuthAccount } from '../iam/entities/auth-account.entity';
import { RefreshToken } from '../iam/entities/refresh-token.entity';
import { Game } from '../games/entities/game.entity';
import { UserGame } from '../games/entities/user-game.entity';

config();

const url = process.env.DATABASE_URL || '';

if (!url) {
  throw new Error('DATABASE_URL is not defined');
}

const urlObj = new URL(url);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: urlObj.hostname,
  port: parseInt(urlObj.port || '5432'),
  username: decodeURIComponent(urlObj.username || ''),
  password: decodeURIComponent(urlObj.password || ''),
  database: urlObj.pathname?.substring(1) || 'postgres',
  ssl: { rejectUnauthorized: false },
  entities: [User, UserProfile, AuthAccount, RefreshToken, Game, UserGame],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;

