import { Injectable } from '@nestjs/common';
import { TipoEstoque } from 'src/users/user';
import { OracleDbService } from '../oracle-db.service';
import { ProdutoEstoqueDTO } from './dto/produto-estoque.dto';

@Injectable()
export class ProdutoService {
  constructor(private readonly oracleDB: OracleDbService) {}

  async findAll(
    nome: string,
    id_empresa: number,
    tipo_estoque: TipoEstoque,
    limit: number,
  ): Promise<ProdutoEstoqueDTO[]> {
    const sql = `
      SELECT DISTINCT
      PS.CODI_PSV,
      PS.DESC_PSV,
      PS.UNID_PSV
      FROM PRODSERV PS
      INNER JOIN PRODUTO P ON P.CODI_PSV = PS.CODI_PSV
      LEFT JOIN UNIDADEMEDIDA U ON U.UNID_UNM = PS.UNID_PSV
      WHERE PS.CODI_GPR NOT IN (10000002, 10000003)
      AND (PS.SITU_PSV = '' OR PS.SITU_PSV = ' ' OR PS.SITU_PSV IS NULL OR PS.SITU_PSV = 'A')
      AND PS.DESC_PSV LIKE :nome
      AND ROWNUM <= :limit
    `;
    const params = [`%${nome}%`, limit];
    const result = await this.oracleDB.query(sql, params);
    const results: ProdutoEstoqueDTO[] = [];

    if (result && result.rows.length > 0) {
      for (let i = 0; i < result.rows.length; i++) {
        const r = result.rows[i];
        const estoque = await this.getEstoque(r[0], id_empresa, tipo_estoque);
        results.push({
          id: r[0],
          nome: r[1],
          unidade: r[2],
          quantidade: estoque,
        });
      }
    }

    return results;
  }

  private async findDepositos(tipo_estoque: TipoEstoque): Promise<number[]> {
    const sql = `
      SELECT DISTINCT CODI_DPT FROM DEPOSITO 
      WHERE (CODI_DPT = :tipo_estoque OR 0 = :tipo_estoque)
    `;
    const params = [tipo_estoque, tipo_estoque];
    const result = await this.oracleDB.query(sql, params);
    const results: number[] = [];

    if (result && result.rows.length > 0) {
      result.rows.forEach((r: any) => {
        results.push(r[0]);
      });
    }

    return results;
  }

  async getSaldoInicial(
    id_produto: number,
    id_empresa: number,
    ctrl: number,
    deposito: number[],
  ): Promise<number> {
    let sql = '';
    const params = [];

    for (let i = 0; i < deposito.length; i++) {
      if (i > 0) {
        sql += ' UNION ALL ';
      }

      sql += `
        SELECT ESTOQUE 
        FROM TABLE(SALDO_INICIAL(:id_empresa, :ctrl, :id_produto, TO_DATE(CURRENT_DATE), :id_deposito))
      `;

      params.push(id_empresa);
      params.push(ctrl);
      params.push(`${id_produto}`);
      params.push(deposito[i]);
    }

    let saldo = 0;
    const result = await this.oracleDB.query(sql, params);

    if (result && result.rows.length > 0) {
      for (let i = 0; i < result.rows.length; i++) {
        saldo += +result.rows[i];
      }
    }

    return saldo;
  }

  async getEstoque(
    id_produto: number,
    id_empresa: number,
    tipo_estoque: TipoEstoque,
  ): Promise<number> {
    const depositos = await this.findDepositos(tipo_estoque);
    const saldo = this.getSaldoInicial(id_produto, id_empresa, 1, depositos);
    return saldo;
  }
}
