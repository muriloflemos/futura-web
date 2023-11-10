import { Injectable, Logger } from '@nestjs/common';
import { Modalidade } from '@prisma/client';
import { OracleDbService } from '../oracle-db.service';
import { OracleQueryBuilder as OQB } from '../helpers/oracle-query-builder';
import { DbService } from '../db.service';

@Injectable()
export class ModalidadeService {
  private readonly logger = new Logger(ModalidadeService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly oracleDB: OracleDbService,
  ) {}

  async findAll(): Promise<Modalidade[]> {
    return await this.dbService.modalidade.findMany();
  }

  async findAllFutura(): Promise<Modalidade[]> {
    const query = new OQB('TIPDOC T')
      .select(['T.CODI_TDO', 'T.DESC_TDO'])
      .orderBy('T.DESC_TDO', 'ASC');
    const sql = query.build();
    const results: Modalidade[] = [];
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
