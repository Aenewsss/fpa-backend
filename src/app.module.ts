import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tags/tags.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // torna disponível em toda a aplicação
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoryModule,
    TagModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
