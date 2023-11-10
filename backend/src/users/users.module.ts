import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DbService } from '../db.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService, DbService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
