import { Injectable, Logger } from '@nestjs/common';
import { Carteira } from '@prisma/client';
import { OracleDbService } from '../oracle-db.service';
import { OracleQueryBuilder as OQB } from '../helpers/oracle-query-builder';
import { DbService } from '../db.service';

@Injectable()
export class CarteiraService {
  private readonly logger = new Logger(CarteiraService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly oracleDB: OracleDbService,
  ) {}

  async findAll(): Promise<Carteira[]> {
    return await this.dbService.carteira.findMany();
  }

  async findAllFutura(): Promise<Carteira[]> {
    const query = new OQB('TIPCOB T')
      .select(['T.CODI_TCO', 'T.DESC_TCO'])
      .orderBy('T.DESC_TCO', 'ASC');
    const sql = query.build();
    const results: Carteira[] = [];
    const result = await this.oracleDB.query(sql, []);

    if (result && result.rows.length > 0) {
      result.rows.forEach((r: any) => {
        results.push({
          id: r[0],
          descricao: r[1],
        });
      });
    }

    return results;
  }
}
