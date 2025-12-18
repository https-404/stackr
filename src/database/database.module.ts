import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const url = process.env.DATABASE_URL || '';

        if (!url) {
          throw new Error('DATABASE_URL is not defined');
        }

        const urlObj = new URL(url);

        return {
          type: 'postgres',
          host: urlObj.hostname,
          port: parseInt(urlObj.port || '5432'),
          username: decodeURIComponent(urlObj.username || ''),
          password: decodeURIComponent(urlObj.password || ''),
          database: urlObj.pathname?.substring(1) || 'postgres',
          ssl: { rejectUnauthorized: false },
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
