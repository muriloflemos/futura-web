import { Injectable, Logger } from '@nestjs/common';

import { OracleDbService } from '../oracle-db.service';
import { OracleQueryBuilder } from '../helpers/oracle-query-builder';
import { Empresa } from './empresa';

@Injectable()
export class EmpresaService {
  private readonly logger = new Logger(EmpresaService.name);

  constructor(private readonly oracleDB: OracleDbService) {}

  async findAll(empresas?: number[]): Promise<Empresa[]> {
    const query = new OracleQueryBuilder('CADEMP')
      .select(['CODI_EMP', 'IDEN_EMP'])
      .orderBy('IDEN_EMP', 'asc');

    if (empresas && empresas.length > 0) {
      query.where(`CODI_EMP IN (${empresas.join(',')})`);
    }

    const sql = query.build();

    this.logger.debug(sql);
    const result = await this.oracleDB.query(sql, []);
    const results: Empresa[] = [];

    if (result && result.rows.length > 0) {
      result.rows.forEach((r: any) => {
        results.push({
          id: r[0],
          nome: r[1],
        });
      });
    }

    return results;
  }
}
