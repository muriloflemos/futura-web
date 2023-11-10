import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as oracledb from 'oracledb';

process.env.ORA_SDTZ = 'UTC';

const dbConfig = {
  user: process.env.NODE_ORACLEDB_USER,
  password: process.env.NODE_ORACLEDB_PASSWORD,
  connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING,
};

@Injectable()
export class OracleDbService implements OnModuleInit {
  private readonly logger = new Logger(OracleDbService.name);

  async onModuleInit() {
    if (!(await this.checkConnection())) {
      this.initConnection();
    }
  }

  private initConnection() {
    try {
      const oracleClientPath = process.env.NODE_ORACLEDB_LIB_DIR;
      this.logger.debug(`Oracle client path: ${oracleClientPath}`);
      if (!!oracleClientPath) {
        oracledb.initOracleClient({
          libDir: oracleClientPath,
        });
      }
    } catch (err) {
      console.error('Whoops!');
      console.error(err);
      // process.exit(1);
    }
  }

  private getConnection() {
    return oracledb.getConnection(dbConfig);
  }

  async checkConnection(): Promise<boolean> {
    let connection;

    try {
      connection = await this.getConnection();
      return true;
    } catch (err) {
      return false;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async query(sqlStmt, binds: any) {
    let connection;

    try {
      connection = await this.getConnection();
      const result = await connection.execute(sqlStmt, binds);
      return result;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
}
