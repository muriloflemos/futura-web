import { Injectable, Logger } from '@nestjs/common';
import {
  format,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  addMonths,
} from 'date-fns';
import { Cobranca, Usuario } from '@prisma/client';

import { DbService } from '../db.service';
import { OracleDbService } from '../oracle-db.service';
import { OracleQueryBuilder as OQB } from '../helpers/oracle-query-builder';
import { CobrancaDTO } from './dto/cobranca.dto';
import { FindCobrancaDTO } from './dto/find-cobranca.dto';
import {
  SaveCobrancaDTO,
  saveCobrancaDtoToData,
} from './dto/save-cobranca.dto';
import { TotalizadorDTO } from './dto/totalizador.dto';
import { StatusVencimento } from './enums/status-vencimento';
import { TipoCobranca } from './enums/tipo-cobranca';

export enum StatusVencimentoEnum {
  VENCER = 1,
  VENCIDOS = 2,
}

export enum TipoCobrancaEnum {
  DEBITO = 1,
  CREDITO = 2,
}

const getQueryReceber = () => {
  return new OQB('RECEBER R')
    .select([
      `'R' || R.CTRL_REC id`,
      'CB.CODI_EMP id_unidade',
      'CE.IDEN_EMP unidade',
      'CB.CODI_TRA id_parceiro',
      'TR.RAZA_TRA parceiro',
      'R.COD1_PES id_vendedor',
      'V.NOME_PES vendedor',
      'R.VENC_REC vencimento',
      `((SELECT * FROM TABLE(VALOR_ABERTO_RECEBER(R.CTRL_REC))) * CASE WHEN T.TIPO_TDO = 'D' THEN 1 ELSE -1 END) valor`,
      'CB.NUME_CBR numero',
      'T.DESC_TDO modalidade',
      `TC.DESC_TCO carteira`,
    ])
    .join('CABREC CB', '(CB.CTRL_CBR = R.CTRL_CBR)')
    .join('TIPDOC T', '(T.CODI_TDO = CB.CODI_TDO)')
    .join('CADEMP CE', '(CB.CODI_EMP = CE.CODI_EMP)')
    .join('TRANSAC TR', '(CB.CODI_TRA = TR.CODI_TRA)')
    .join('PESSOAL V', '(R.COD1_PES = V.CODI_PES)', 'LEFT')
    .join('TIPCOB TC', '(R.CODI_TCO = TC.CODI_TCO)')
    .where(`R.SITU_REC <> 'C'`)
    .where(`CB.SITU_CBR <> 'C'`);
};

const getQueryPedidos = () => {
  return new OQB('PEDIDO P')
    .select([
      `('P' || P.CODI_EMP || '-' || P.PEDI_PED || '-' || P.SERI_PED) id`,
      'P.CODI_EMP id_unidade',
      'CE.IDEN_EMP unidade',
      'P.CODI_TRA id_parceiro',
      'TR.RAZA_TRA parceiro',
      'P.COD1_PES id_vendedor',
      'V.NOME_PES vendedor',
      'P.VCTO_PED vencimento',
      `
        COALESCE((
          SELECT
            SUM((
              IPD.QTDE_IPE - (
                (
                  (
                    CASE 
                    WHEN (P.CCFO_CFO LIKE '5922%' OR P.CCFO_CFO LIKE '6922%') 
                    THEN COALESCE(
                      (
                        SELECT SUM(QENT_INO) + SUM(QDEV_INO) 
                        FROM INOTA INO 
                        INNER JOIN NOTA NT ON NT.NPRE_NOT = INO.NPRE_NOT 
                        WHERE NT.SITU_NOT = '5' 
                        AND INO.EMPR_PED  = P.CODI_EMP 
                        AND INO.PEDI_PED  = P.PEDI_PED 
                        AND INO.SERI_PED  = P.SERI_PED 
                        AND INO.CODI_PSV  = IPD.CODI_PSV
                      ), IPD.QTDE_IPE
                    ) 
                    ELSE (SELECT QENT FROM TABLE(QTDE_ENTR_PED_VEN(IPD.CODI_EMP, IPD.PEDI_PED, IPD.SERI_PED, IPD.CODI_PSV)))  
                    END
                  )
                )  
                + IPD.QPER_IPE
              )
            ) * IPD.VLOR_IPE)
          FROM IPEDIDO IPD
          WHERE IPD.PEDI_PED = P.PEDI_PED 
          AND IPD.SERI_PED = P.SERI_PED 
          AND IPD.CODI_EMP = P.CODI_EMP 
        ), 0) valor
      `,
      'P.PEDI_PED numero',
      `'PEDIDO' modalidade`,
      `'--' carteira`,
    ])
    .join('CADEMP CE', '(CE.CODI_EMP = P.CODI_EMP)')
    .join('PESSOAL V', '(P.COD1_PES = V.CODI_PES)')
    .join('TRANSAC TR', '(P.CODI_TRA = TR.CODI_TRA)')
    .where(`P.SITU_PED NOT IN ('9')`);
};

const getQueryCheques = () => {
  return new OQB('CHEQUEREC C')
    .select([
      `('C' || C.CODI_EMP || '-' || C.CODI_AGE || '-' || C.CONT_CHR || '-' || C.NUME_CHR || '-' || C.SERI_CHR) id`,
      'C.CODI_EMP id_unidade',
      'CE.IDEN_EMP unidade',
      'C.CODI_TRA id_parceiro',
      'TR.RAZA_TRA parceiro',
      '0 id_vendedor',
      `'--' vendedor`,
      'C.VENC_CHR vencimento',
      'C.VLOR_CHR valor',
      'C.NUME_CHR numero',
      `'CHEQUE' modalidade`,
      `'--' carteira`,
    ])
    .join('CADEMP CE', '(CE.CODI_EMP = C.CODI_EMP)')
    .join('TRANSAC TR', '(TR.CODI_TRA = C.CODI_TRA)');
  // .where(`C.SITU_CHR <> 'B'`);
};

@Injectable()
export class CobrancaService {
  private readonly logger = new Logger(CobrancaService.name);

  constructor(
    private readonly oracleDB: OracleDbService,
    private readonly db: DbService,
  ) {}

  private findAllQuery(params: FindCobrancaDTO): {
    sql: string;
    sqlParams: any[];
  } {
    const sqlParamsReceber = [];
    const sqlParamsPedidos = [];
    const sqlParamsCheques = [];

    const queryReceber = getQueryReceber();
    const queryPedidos = getQueryPedidos();
    const queryCheques = getQueryCheques();

    const dateFormat = 'yyyy-MM-dd HH:mm:ss';
    const today = format(startOfDay(new Date()), dateFormat);

    if (params.id_empresa) {
      if (Array.isArray(params.id_empresa)) {
        queryReceber.where(`CB.CODI_EMP IN (${params.id_empresa.join(', ')})`);
        queryPedidos.where(`P.CODI_EMP IN (${params.id_empresa.join(', ')})`);
        queryCheques.where(`C.CODI_EMP IN (${params.id_empresa.join(', ')})`);
      } else {
        // RECEBER
        queryReceber.where(`CB.CODI_EMP = :id_empresa`);
        sqlParamsReceber.push(params.id_empresa);
        // PEDIDOS
        queryPedidos.where(`P.CODI_EMP = :id_empresa`);
        sqlParamsPedidos.push(params.id_empresa);
        // CHEQUES
        queryCheques.where(`C.CODI_EMP = :id_empresa`);
        sqlParamsCheques.push(params.id_empresa);
      }
    }

    if (params.data_inicio && params.data_fim) {
      const data_inicio = format(new Date(params.data_inicio), dateFormat);
      const data_fim = format(new Date(params.data_fim), dateFormat);
      // RECEBER
      queryReceber.where(
        `R.VENC_REC BETWEEN TO_DATE(:data_inicio,'YYYY-MM-DD HH24:MI:SS') AND TO_DATE(:data_fim,'YYYY-MM-DD HH24:MI:SS')`,
      );
      sqlParamsReceber.push(data_inicio);
      sqlParamsReceber.push(data_fim);
      // PEDIDOS
      queryPedidos.where(
        `P.VCTO_PED BETWEEN TO_DATE(:data_inicio,'YYYY-MM-DD HH24:MI:SS') AND TO_DATE(:data_fim,'YYYY-MM-DD HH24:MI:SS')`,
      );
      sqlParamsPedidos.push(data_inicio);
      sqlParamsPedidos.push(data_fim);
      // CHEQUES
      queryCheques.where(
        `C.VENC_CHR BETWEEN TO_DATE(:data_inicio,'YYYY-MM-DD HH24:MI:SS') AND TO_DATE(:data_fim,'YYYY-MM-DD HH24:MI:SS')`,
      );
      sqlParamsCheques.push(data_inicio);
      sqlParamsCheques.push(data_fim);
    }

    if (params?.tipo_cobranca == TipoCobrancaEnum.CREDITO) {
      this.logger.debug('TIPO COBRANCA: CREDITO');
      queryReceber.where(`T.TIPO_TDO = 'C'`);
      queryPedidos.where(`1 = 0`);
      queryCheques.where(`1 = 0`);
    } else if (params?.tipo_cobranca == TipoCobrancaEnum.DEBITO) {
      this.logger.debug('TIPO COBRANCA: DEBITO');
      queryReceber.where(`T.TIPO_TDO = 'D'`);
    }

    if (params.data_emissao_inicio && params.data_emissao_fim) {
      const data_emissao_inicio = format(
        new Date(params.data_emissao_inicio),
        dateFormat,
      );
      const data_emissao_fim = format(
        new Date(params.data_emissao_fim),
        dateFormat,
      );
      // RECEBER
      queryReceber.where(
        `R.DINSERT BETWEEN TO_DATE(:data_emissao_inicio,'YYYY-MM-DD HH24:MI:SS') AND TO_DATE(:data_emissao_fim,'YYYY-MM-DD HH24:MI:SS')`,
      );
      sqlParamsReceber.push(data_emissao_inicio);
      sqlParamsReceber.push(data_emissao_fim);
      // PEDIDOS
      queryPedidos.where(
        `P.DEMI_PED BETWEEN TO_DATE(:data_emissao_inicio,'YYYY-MM-DD HH24:MI:SS') AND TO_DATE(:data_emissao_fim,'YYYY-MM-DD HH24:MI:SS')`,
      );
      sqlParamsPedidos.push(data_emissao_inicio);
      sqlParamsPedidos.push(data_emissao_fim);
      // CHEQUES
      queryCheques.where(
        `C.DINSERT BETWEEN TO_DATE(:data_emissao_inicio,'YYYY-MM-DD HH24:MI:SS') AND TO_DATE(:data_emissao_fim,'YYYY-MM-DD HH24:MI:SS')`,
      );
      sqlParamsCheques.push(data_emissao_inicio);
      sqlParamsCheques.push(data_emissao_fim);
    }

    if (params.modalidade) {
      let modalidades = Array.isArray(params.modalidade)
        ? params.modalidade
        : [params.modalidade];
      modalidades = modalidades.map((value) => +value);
      this.logger.debug('MODALIDADE');
      this.logger.debug(modalidades);
      // RECEBER
      queryReceber.where(`T.CODI_TDO IN (${modalidades.join(', ')})`);
      // PEDIDOS
      if (modalidades.includes(-1)) {
        queryPedidos.where('1 = 1');
      } else {
        queryPedidos.where('1 = 0');
      }
      // CHEQUES
      // TO DO: VERIFICAR SE EXISTE MODALIDADE NOS CHEQUES
      if (modalidades.includes(-2)) {
        queryCheques.where('1 = 1');
      } else {
        queryCheques.where('1 = 0');
      }
    }

    if (params.parceiro) {
      // RECEBER
      queryReceber.where('TR.RAZA_TRA LIKE :parceiro');
      sqlParamsReceber.push(`%${params.parceiro.toUpperCase()}%`);
      // PEDIDOS
      queryPedidos.where('TR.RAZA_TRA LIKE :parceiro');
      sqlParamsPedidos.push(`%${params.parceiro.toUpperCase()}%`);
      // CHEQUES
      queryCheques.where('TR.RAZA_TRA LIKE :parceiro');
      sqlParamsCheques.push(`%${params.parceiro.toUpperCase()}%`);
    }

    if (params.vendedor) {
      // RECEBER
      queryReceber.where('V.NOME_PES LIKE :vendedor');
      sqlParamsReceber.push(`%${params.vendedor.toUpperCase()}%`);
      // PEDIDOS
      queryPedidos.where('V.NOME_PES LIKE :vendedor');
      sqlParamsPedidos.push(`%${params.vendedor.toUpperCase()}%`);
      // CHEQUES
      queryCheques.where('1 = 0');
    }

    if (params.numero && params.numero > 0) {
      // RECEBER
      queryReceber.where('CB.NUME_CBR = :numero');
      sqlParamsReceber.push(+params.numero);
      // PEDIDOS
      queryPedidos.where('P.PEDI_PED = :numero');
      sqlParamsPedidos.push(+params.numero);
      // CHEQUES
      queryCheques.where('C.NUME_CHR = :numero');
      sqlParamsCheques.push(+params.numero);
    }

    if (params.carteira) {
      let carteiras = Array.isArray(params.carteira)
        ? params.carteira
        : [params.carteira];
      carteiras = carteiras.map((value) => +value);
      this.logger.debug('CARTEIRAS');
      this.logger.debug(carteiras);
      queryReceber.where(`TC.CODI_TCO IN (${carteiras.join(', ')})`);
      queryPedidos.where('1 = 0');
      queryCheques.where('1 = 0');
    }

    let sqlPedidos;

    if (params.situacao && [1, 2].includes(+params.situacao)) {
      sqlPedidos = queryPedidos.build();

      if (+params.situacao == 1) {
        queryReceber.where(
          '(SELECT * FROM TABLE(VALOR_ABERTO_RECEBER(R.CTRL_REC))) > 0.5',
        );
        queryCheques.where(`C.SITU_CHR = 'A'`);
        sqlPedidos = `SELECT * FROM (${sqlPedidos}) WHERE valor > 0`;
      }

      if (+params.situacao == 2) {
        queryReceber.where(
          '(SELECT * FROM TABLE(VALOR_ABERTO_RECEBER(R.CTRL_REC))) = 0',
        );
        queryCheques.where(`C.SITU_CHR <> 'A'`);
        sqlPedidos = `SELECT * FROM (${sqlPedidos}) WHERE valor = 0`;
      }
    }

    if (
      params.status_vencimento &&
      [1, 2].includes(+params.status_vencimento)
    ) {
      if (+params.status_vencimento == StatusVencimentoEnum.VENCER) {
        // RECEBER
        queryReceber.where(
          `R.VENC_REC >= TO_DATE(:vencimento,'YYYY-MM-DD HH24:MI:SS')`,
        );
        sqlParamsReceber.push(today);
        queryReceber.where(
          '(SELECT * FROM TABLE(VALOR_ABERTO_RECEBER(R.CTRL_REC))) > 0.5',
        );
        // PEDIDOS
        queryPedidos.where(
          `P.VCTO_PED >= TO_DATE(:vencimento,'YYYY-MM-DD HH24:MI:SS')`,
        );
        sqlParamsPedidos.push(today);
        sqlPedidos = queryPedidos.build();
        sqlPedidos = `SELECT * FROM (${sqlPedidos}) WHERE valor > 0`;
        // CHEQUES
        queryCheques.where(
          `C.VENC_CHR >= TO_DATE(:vencimento,'YYYY-MM-DD HH24:MI:SS')`,
        );
        sqlParamsCheques.push(today);
      } else if (+params.status_vencimento == StatusVencimentoEnum.VENCIDOS) {
        // RECEBER
        queryReceber.where(
          `R.VENC_REC < TO_DATE(:vencimento,'YYYY-MM-DD HH24:MI:SS')`,
        );
        sqlParamsReceber.push(today);
        queryReceber.where(
          '(SELECT * FROM TABLE(VALOR_ABERTO_RECEBER(R.CTRL_REC))) > 0.5',
        );
        // PEDIDOS
        queryPedidos.where(
          `P.VCTO_PED < TO_DATE(:vencimento,'YYYY-MM-DD HH24:MI:SS')`,
        );
        sqlParamsPedidos.push(today);
        sqlPedidos = queryPedidos.build();
        sqlPedidos = `SELECT * FROM (${sqlPedidos}) WHERE valor > 0`;
        // // CHEQUES
        queryCheques.where(
          `C.VENC_CHR < TO_DATE(:vencimento,'YYYY-MM-DD HH24:MI:SS')`,
        );
        sqlParamsCheques.push(today);
      }
    } else {
      sqlPedidos = queryPedidos.build();
    }

    const sqlReceber = queryReceber.build();
    const sqlCheques = queryCheques.build();
    let sql = `${sqlReceber} UNION ALL ${sqlCheques} UNION ALL ${sqlPedidos}`;

    if (params.sort && params.sortDirection) {
      sql = `${sql} ORDER BY ${params.sort} ${params.sortDirection}`;
    } else {
      sql = `${sql} ORDER BY unidade asc`;
    }

    const sqlParams = [
      ...sqlParamsReceber,
      ...sqlParamsCheques,
      ...sqlParamsPedidos,
    ];

    return { sql, sqlParams };
  }

  async findAll(params: FindCobrancaDTO): Promise<CobrancaDTO[]> {
    const { sql, sqlParams } = this.findAllQuery(params);
    // this.logger.debug(`SQL Query: \n ${sql}`);
    // this.logger.debug(`Params: ${JSON.stringify(sqlParams)}`);

    const result = await this.oracleDB.query(sql, sqlParams);

    let results: CobrancaDTO[] = [];
    const hasCustomFilter =
      (params.programacao_fim && params.programacao_inicio) ||
      params.pontualidade ||
      params.forma ||
      params.cobranca ||
      params.status_cobranca;

    if (result && result.rows.length > 0) {
      this.logger.debug(`Total results: ${results.length}`);
      const ids = result.rows.map((r: any) => r[0]);
      const cobrancas = await this.findCobrancas(ids, params);
      result.rows.forEach((r: any) => {
        const cobranca = cobrancas.find((value) => value.controle == r[0]);
        const dto: CobrancaDTO = {
          id: r[0],
          id_unidade: r[1],
          unidade: r[2],
          id_parceiro: r[3],
          parceiro: r[4],
          id_vendedor: r[5],
          vendedor: r[6],
          vencimento: r[7],
          valor: r[8],
          numero: r[9],
          modalidade: r[10],
          carteira: r[11],
          programacao: cobranca?.programacao || null,
          forma: cobranca?.id_forma_pagamento || null,
          pontualidade: cobranca?.pontualidade || null,
          cobranca: cobranca?.cobranca_preventiva || null,
          status_cobranca: cobranca?.status_cobranca || null,
          observacao: cobranca?.observacao || null,
          observacao2: cobranca?.observacao2 || null,
        };

        if (hasCustomFilter) {
          if (cobranca) results.push(dto);
        } else {
          results.push(dto);
        }
      });

      if (params.status_programacao) {
        if (params.status_programacao == 1) {
          results = results.filter((result) => result.programacao != null);
        } else if (params.status_programacao == 2) {
          results = results.filter((result) => result.programacao == null);
        }
      }

      if (params.status_observacao) {
        if (params.status_observacao == 1) {
          results = results.filter((result) => result.observacao != null);
        } else if (params.status_observacao == 2) {
          results = results.filter((result) => result.observacao == null);
        }
      }

      if (params.status_observacao2) {
        if (params.status_observacao2 == 1) {
          results = results.filter((result) => result.observacao2 != null);
        } else if (params.status_observacao2 == 2) {
          results = results.filter((result) => result.observacao2 == null);
        }
      }
    } else {
      this.logger.debug(`No results`);
    }

    return results;
  }

  async findCobrancas(
    ids: string[],
    params?: FindCobrancaDTO,
  ): Promise<Cobranca[]> {
    const where: any = {
      controle: { in: ids },
    };

    if (params.programacao_inicio && params.programacao_fim) {
      where.programacao = {
        gte: params.programacao_inicio,
        lte: params.programacao_fim,
      };
    }

    if (params.forma) {
      if (Array.isArray(params.forma)) {
        where.id_forma_pagamento = { in: params.forma.map((v) => +v) };
      } else {
        where.id_forma_pagamento = +params.forma;
      }
    }

    if (params.pontualidade) {
      if (Array.isArray(params.pontualidade)) {
        where.pontualidade = { in: params.pontualidade };
      } else {
        where.pontualidade = params.pontualidade;
      }
    }

    if (params.cobranca) {
      if (Array.isArray(params.cobranca)) {
        where.cobranca_preventiva = { in: params.cobranca.map((v) => +v) };
      } else {
        where.cobranca_preventiva = +params.cobranca;
      }
    }

    if (params.status_cobranca) {
      if (Array.isArray(params.status_cobranca)) {
        where.status_cobranca = { in: params.status_cobranca.map((v) => +v) };
      } else {
        where.status_cobranca = +params.status_cobranca;
      }
    }

    // this.logger.debug('COBRANCA FILTER');
    // this.logger.debug(where);

    return await this.db.cobranca.findMany({ where });
  }

  async save(
    cobranca: SaveCobrancaDTO,
    usuario: Usuario,
  ): Promise<CobrancaDTO[]> {
    const upserts = [];
    for (const controle of cobranca.controle) {
      const data = saveCobrancaDtoToData(cobranca);
      upserts.push(
        this.db.cobranca.upsert({
          where: {
            controle: controle,
          },
          update: {
            ...data,
            id_usuario: usuario.id,
          },
          create: {
            controle: controle,
            ...data,
            id_usuario: usuario.id,
          },
        }),
      );
    }
    const cobrancas = await this.db.$transaction(upserts);
    if (!cobrancas) return [];

    // RECEBER
    const idsReceber = cobranca.controle
      .filter((v) => v[0] == 'R')
      .map((v) => v.replace('R', ''));
    const queryReceber = getQueryReceber();
    if (idsReceber.length > 0) {
      queryReceber.where(`R.CTRL_REC IN (${idsReceber.join(', ')})`);
    } else {
      queryReceber.where('1 = 0');
    }

    // PEDIDOS
    const idsPedido = cobranca.controle
      .filter((v) => v[0] == 'P')
      .map((v) => `'${v}'`);
    const queryPedidos = getQueryPedidos();
    if (idsPedido.length > 0) {
      const fields = ['P.CODI_EMP', 'P.PEDI_PED', 'P.SERI_PED'];
      const key = fields.join(` || '-' || `);
      queryPedidos.where(`('P' || ${key}) IN (${idsPedido.join(', ')})`);
    } else {
      queryPedidos.where('1 = 0');
    }

    // CHEQUES
    const idsCheque = cobranca.controle
      .filter((v) => v[0] == 'C')
      .map((v) => `'${v}'`);
    const queryCheques = getQueryCheques();
    if (idsCheque.length > 0) {
      const fields = [
        'C.CODI_EMP',
        'C.CODI_AGE',
        'C.CONT_CHR',
        'C.NUME_CHR',
        'C.SERI_CHR',
      ];
      const key = fields.join(` || '-' || `);
      queryCheques.where(`('C' || ${key}) IN (${idsCheque.join(', ')})`);
    } else {
      queryCheques.where('1 = 0');
    }

    const sqlReceber = queryReceber.build();
    const sqlPedido = queryPedidos.build();
    const sqlCheque = queryCheques.build();
    const sql = `${sqlReceber} UNION ALL ${sqlPedido} UNION ALL ${sqlCheque}`;
    this.logger.debug(`Running query: \n ${sql}`);
    const result = await this.oracleDB.query(sql, []);
    const results: CobrancaDTO[] = [];

    if (result && result.rows.length > 0) {
      result.rows.forEach((r: any) => {
        const cobranca = cobrancas.find((value) => value.controle == r[0]);
        results.push({
          id: r[0],
          id_unidade: r[1],
          unidade: r[2],
          id_parceiro: r[3],
          parceiro: r[4],
          id_vendedor: r[5],
          vendedor: r[6],
          vencimento: r[7],
          valor: r[8],
          numero: r[9],
          modalidade: r[10],
          carteira: r[11],
          programacao: cobranca?.programacao || null,
          forma: cobranca?.id_forma_pagamento || null,
          pontualidade: cobranca?.pontualidade || null,
          cobranca: cobranca?.cobranca_preventiva || null,
          status_cobranca: cobranca?.status_cobranca || null,
          observacao: cobranca?.observacao || null,
          observacao2: cobranca?.observacao2 || null,
        });
      });
    }

    return results;
  }

  async findTotais(params: FindCobrancaDTO): Promise<TotalizadorDTO[]> {
    const cobrancas = await this.findAll(params);
    const results: TotalizadorDTO[] = [];

    cobrancas.forEach((cobranca: CobrancaDTO) => {
      const index = results.findIndex(
        (value: TotalizadorDTO) => value.id == cobranca.id_unidade,
      );

      if (index >= 0) {
        results[index].valor += cobranca.valor;
      } else {
        results.push({
          id: cobranca.id_unidade,
          label: cobranca.unidade,
          valor: cobranca.valor,
        });
      }
    });

    return results;
  }

  async findDevedores(params: FindCobrancaDTO): Promise<TotalizadorDTO[]> {
    params.sort = 'id_parceiro';
    const cobrancas = await this.findAll(params);
    const results: TotalizadorDTO[] = [];

    cobrancas.forEach((cobranca: CobrancaDTO) => {
      const index = results.findIndex(
        (value: TotalizadorDTO) => value.id == cobranca.id_parceiro,
      );

      if (index >= 0) {
        results[index].valor += cobranca.valor;
      } else {
        results.push({
          id: cobranca.id_parceiro,
          label: cobranca.parceiro,
          valor: cobranca.valor,
        });
      }
    });

    results.sort((a, b) => (a.valor > b.valor ? -1 : 1));
    return results;
  }

  private sumValoresCobranca(data: CobrancaDTO[]): number {
    let sum = 0;
    data.forEach((value) => (sum += value.valor));
    return sum;
  }

  async getResumoVencimentos(
    params: FindCobrancaDTO,
  ): Promise<TotalizadorDTO[]> {
    const results: TotalizadorDTO[] = [];
    const querys = [];
    const dateFormat = 'yyyy-MM-dd HH:mm:ss';
    const today = startOfDay(new Date());

    // A vencer 0 a 30 dias
    params.data_inicio = format(today, dateFormat);
    params.data_fim = format(endOfDay(addDays(today, 30)), dateFormat);
    params.status_vencimento = StatusVencimento.VENCER;
    params.tipo_cobranca = TipoCobranca.DEBITO;
    querys.push(this.findAll(params));

    // A vencer 31 a 60 dias
    params.data_inicio = format(startOfDay(addDays(today, 31)), dateFormat);
    params.data_fim = format(endOfDay(addDays(today, 60)), dateFormat);
    params.status_vencimento = StatusVencimento.VENCER;
    params.tipo_cobranca = TipoCobranca.DEBITO;
    querys.push(this.findAll(params));

    // A vencer 61 a 90 dias
    params.data_inicio = format(startOfDay(addDays(today, 61)), dateFormat);
    params.data_fim = format(endOfDay(addDays(today, 90)), dateFormat);
    params.status_vencimento = StatusVencimento.VENCER;
    params.tipo_cobranca = TipoCobranca.DEBITO;
    querys.push(this.findAll(params));

    // Vencidos até 30 dias
    params.data_inicio = format(startOfDay(subDays(today, 30)), dateFormat);
    params.data_fim = format(endOfDay(today), dateFormat);
    params.status_vencimento = StatusVencimento.VENCIDOS;
    params.tipo_cobranca = TipoCobranca.DEBITO;
    params.situacao = 1;
    querys.push(this.findAll(params));

    // Vencidos de 31 até 60 dias
    params.data_inicio = format(startOfDay(subDays(today, 60)), dateFormat);
    params.data_fim = format(endOfDay(subDays(today, 31)), dateFormat);
    params.status_vencimento = StatusVencimento.VENCIDOS;
    params.tipo_cobranca = TipoCobranca.DEBITO;
    params.situacao = 1;
    querys.push(this.findAll(params));

    // Vencidos de 61 até 90 dias
    params.data_inicio = format(startOfDay(subDays(today, 90)), dateFormat);
    params.data_fim = format(endOfDay(subDays(today, 61)), dateFormat);
    params.status_vencimento = StatusVencimento.VENCIDOS;
    params.tipo_cobranca = TipoCobranca.DEBITO;
    params.situacao = 1;
    querys.push(this.findAll(params));

    // Vencidos de 91 dias acima
    params.data_inicio = format(startOfDay(subDays(today, 365)), dateFormat);
    params.data_fim = format(endOfDay(subDays(today, 91)), dateFormat);
    params.status_vencimento = StatusVencimento.VENCIDOS;
    params.tipo_cobranca = TipoCobranca.DEBITO;
    params.situacao = 1;
    querys.push(this.findAll(params));

    await Promise.all(querys)
      .then((data) => {
        const resumo1 = this.sumValoresCobranca(data[0]);
        results.push({
          id: 1,
          label: 'A vencer 0 a 30 dias',
          valor: resumo1,
        });

        const resumo2 = this.sumValoresCobranca(data[1]);
        results.push({
          id: 2,
          label: 'A vencer 31 a 60 dias',
          valor: resumo2,
        });

        const resumo3 = this.sumValoresCobranca(data[2]);
        results.push({
          id: 3,
          label: 'A vencer 61 a 90 dias',
          valor: resumo3,
        });

        const resumo4 = this.sumValoresCobranca(data[3]);
        results.push({
          id: 4,
          label: 'Vencidos até 30 dias',
          valor: resumo4,
        });

        const resumo5 = this.sumValoresCobranca(data[4]);
        results.push({
          id: 5,
          label: 'Vencidos de 31 até 60 dias',
          valor: resumo5,
        });

        const resumo6 = this.sumValoresCobranca(data[5]);
        results.push({
          id: 6,
          label: 'Vencidos de 61 até 90 dias',
          valor: resumo6,
        });

        const resumo7 = this.sumValoresCobranca(data[6]);
        results.push({
          id: 7,
          label: 'Vencidos de 91 dias acima',
          valor: resumo7,
        });
      })
      .catch((err) => this.logger.error(err));

    return results;
  }

  async getResumoMensal(params: FindCobrancaDTO): Promise<TotalizadorDTO[]> {
    const results: TotalizadorDTO[] = [];
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    const dateFormat = 'yyyy-MM-dd HH:mm:ss';
    const today = startOfDay(new Date());
    const totalMonths = 6;
    const querys = [];
    let startDate = startOfMonth(subMonths(today, 3));

    delete params.status_vencimento;
    delete params.tipo_cobranca;

    for (let i = 0; i < totalMonths; i++) {
      params.data_inicio = format(startDate, dateFormat);
      params.data_fim = format(endOfMonth(startDate), dateFormat);
      querys.push(this.findAll(params));
      results.push({
        id: i,
        label: meses[startDate.getMonth()],
        valor: 0,
      });
      startDate = addMonths(startDate, 1);
    }

    await Promise.all(querys)
      .then((data) => {
        for (let i = 0; i < data.length; i++) {
          results[i].valor = this.sumValoresCobranca(data[i]);
        }
      })
      .catch((err) => this.logger.error(err));

    return results;
  }
}
