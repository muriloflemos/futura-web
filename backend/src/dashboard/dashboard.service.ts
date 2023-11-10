import { Injectable, Logger } from '@nestjs/common';
import { format, startOfDay } from 'date-fns';

import { OracleDbService } from '../oracle-db.service';
import { OracleQueryBuilder as OQB } from '../helpers/oracle-query-builder';
import { TotalizadorDTO } from './dto/totalizador.dto';
import { FindTotaisDTO } from './dto/find-totais.dto';

const getQueryReceber = () => {
  return new OQB('RECEBER R')
    .select([
      'CB.CODI_EMP',
      'CE.IDEN_EMP',
      `SUM(((SELECT * FROM TABLE(VALOR_ABERTO_RECEBER(R.CTRL_REC))) * CASE WHEN T.TIPO_TDO = 'D' THEN 1 ELSE -1 END))`,
    ])
    .join('CABREC CB', '(CB.CTRL_CBR = R.CTRL_CBR)')
    .join('TIPDOC T', '(T.CODI_TDO = CB.CODI_TDO)')
    .join('CADEMP CE', '(CB.CODI_EMP = CE.CODI_EMP)')
    .join('TRANSAC TR', '(CB.CODI_TRA = TR.CODI_TRA)')
    .join('PESSOAL V', '(R.COD1_PES = V.CODI_PES)')
    .join('TIPCOB TC', '(R.CODI_TCO = TC.CODI_TCO)')
    .where(`R.SITU_REC <> 'C'`)
    .where(`CB.SITU_CBR <> 'C'`)
    .groupBy('CB.CODI_EMP, CE.IDEN_EMP');
};

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly oracleDB: OracleDbService) {}

  async findTotaisVencer(params: FindTotaisDTO): Promise<TotalizadorDTO[]> {
    const dateFormat = 'yyyy-MM-dd HH:mm:ss';
    const queryReceber = getQueryReceber();
    const sqlParams = [];
    const today = format(startOfDay(new Date()), dateFormat);

    queryReceber.where(
      `R.VENC_REC >= TO_DATE(:data_inicio,'YYYY-MM-DD HH24:MI:SS')`,
    );
    sqlParams.push(today);
    queryReceber.where(
      '(SELECT * FROM TABLE(VALOR_ABERTO_RECEBER(R.CTRL_REC))) > 0.5',
    );

    if (params.id_empresa) {
      if (Array.isArray(params.id_empresa)) {
        queryReceber.where(`CB.CODI_EMP IN (${params.id_empresa.join(', ')})`);
      } else {
        queryReceber.where(`CB.CODI_EMP = :id_empresa`);
        sqlParams.push(params.id_empresa);
      }
    }

    if (params.data_inicio && params.data_fim) {
      const data_inicio = format(new Date(params.data_inicio), dateFormat);
      const data_fim = format(new Date(params.data_fim), dateFormat);
      queryReceber.where(
        `R.DINSERT BETWEEN TO_DATE(:data_inicio,'YYYY-MM-DD HH24:MI:SS') AND TO_DATE(:data_fim,'YYYY-MM-DD HH24:MI:SS')`,
      );
      sqlParams.push(data_inicio);
      sqlParams.push(data_fim);
    }

    if (params.parceiro) {
      queryReceber.where('TR.RAZA_TRA LIKE :parceiro');
      sqlParams.push(`%${params.parceiro.toUpperCase()}%`);
    }

    if (params.vendedor) {
      queryReceber.where('V.NOME_PES LIKE :vendedor');
      sqlParams.push(`%${params.vendedor.toUpperCase()}%`);
    }

    if (params.modalidade) {
      let modalidades = Array.isArray(params.modalidade)
        ? params.modalidade
        : [params.modalidade];
      modalidades = modalidades.map((value) => +value);
      queryReceber.where(`T.CODI_TDO IN (${modalidades.join(', ')})`);
    }

    if (params.carteira) {
      let carteiras = Array.isArray(params.carteira)
        ? params.carteira
        : [params.carteira];
      carteiras = carteiras.map((value) => +value);
      queryReceber.where(`TC.CODI_TCO IN (${carteiras.join(', ')})`);
    }

    const sql = queryReceber.build();

    this.logger.debug(`SQL Query: \n ${sql}`);
    this.logger.debug(`Params: ${JSON.stringify(sqlParams)}`);

    const oracleResults = await this.oracleDB.query(sql, sqlParams);
    const results: TotalizadorDTO[] = [];

    if (oracleResults && oracleResults.rows.length > 0) {
      oracleResults.rows.forEach((r: any) => {
        const dto: TotalizadorDTO = {
          id: r[0],
          label: r[1],
          valor: r[2],
        };
        results.push(dto);
      });
    }

    return results;
  }

  async findTotaisVencidos(params: FindTotaisDTO): Promise<TotalizadorDTO[]> {
    const dateFormat = 'yyyy-MM-dd HH:mm:ss';
    const queryReceber = getQueryReceber();
    const sqlParams = [];
    const today = format(startOfDay(new Date()), dateFormat);

    queryReceber.where(
      `R.VENC_REC < TO_DATE(:data_inicio,'YYYY-MM-DD HH24:MI:SS')`,
    );
    sqlParams.push(today);
    queryReceber.where(
      '(SELECT * FROM TABLE(VALOR_ABERTO_RECEBER(R.CTRL_REC))) > 0.5',
    );

    if (params.id_empresa) {
      if (Array.isArray(params.id_empresa)) {
        queryReceber.where(`CB.CODI_EMP IN (${params.id_empresa.join(', ')})`);
      } else {
        queryReceber.where(`CB.CODI_EMP = :id_empresa`);
        sqlParams.push(params.id_empresa);
      }
    }

    if (params.data_inicio && params.data_fim) {
      const data_inicio = format(new Date(params.data_inicio), dateFormat);
      const data_fim = format(new Date(params.data_fim), dateFormat);
      queryReceber.where(
        `R.DINSERT BETWEEN TO_DATE(:data_inicio,'YYYY-MM-DD HH24:MI:SS') AND TO_DATE(:data_fim,'YYYY-MM-DD HH24:MI:SS')`,
      );
      sqlParams.push(data_inicio);
      sqlParams.push(data_fim);
    }

    if (params.parceiro) {
      queryReceber.where('TR.RAZA_TRA LIKE :parceiro');
      sqlParams.push(`%${params.parceiro.toUpperCase()}%`);
    }

    if (params.vendedor) {
      queryReceber.where('V.NOME_PES LIKE :vendedor');
      sqlParams.push(`%${params.vendedor.toUpperCase()}%`);
    }

    if (params.modalidade) {
      let modalidades = Array.isArray(params.modalidade)
        ? params.modalidade
        : [params.modalidade];
      modalidades = modalidades.map((value) => +value);
      queryReceber.where(`T.CODI_TDO IN (${modalidades.join(', ')})`);
    }

    if (params.carteira) {
      let carteiras = Array.isArray(params.carteira)
        ? params.carteira
        : [params.carteira];
      carteiras = carteiras.map((value) => +value);
      queryReceber.where(`TC.CODI_TCO IN (${carteiras.join(', ')})`);
    }

    const sql = queryReceber.build();

    this.logger.debug(`SQL Query: \n ${sql}`);
    this.logger.debug(`Params: ${JSON.stringify(sqlParams)}`);

    const oracleResults = await this.oracleDB.query(sql, sqlParams);
    const results: TotalizadorDTO[] = [];

    if (oracleResults && oracleResults.rows.length > 0) {
      oracleResults.rows.forEach((r: any) => {
        const dto: TotalizadorDTO = {
          id: r[0],
          label: r[1],
          valor: r[2],
        };
        results.push(dto);
      });
    }

    return results;
  }
}
