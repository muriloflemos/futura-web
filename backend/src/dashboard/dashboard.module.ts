import { Module } from '@nestjs/common';
import { OracleDbService } from '../oracle-db.service';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  providers: [DashboardService, OracleDbService],
  controllers: [DashboardController],
})
export class DashboardModule {}
