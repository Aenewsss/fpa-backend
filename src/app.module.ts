import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tags/tags.module';
import { PostsModule } from './posts/posts.module';
import { BannersModule } from './banners/banners.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // torna disponível em toda a aplicação
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoryModule,
    TagModule,
    PostsModule,
    BannersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
