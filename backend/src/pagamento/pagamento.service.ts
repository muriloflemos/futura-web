import { Injectable, Logger } from '@nestjs/common';
import {
  format,
  startOfDay,
  endOfDay,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
  addWeeks,
} from 'date-fns';
import { DbService } from '../db.service';
import { OracleDbService } from '../oracle-db.service';
import { OracleQueryBuilder as OQB } from '../helpers/oracle-query-builder';
import { PagamentoDTO } from './dto/pagamento.dto';
import { FindPagamentoDTO } from './dto/find-pagamento.dto';
import {
  SavePagamentoDTO,
  savePagamentoDtoToData,
} from './dto/save-pagamento.dto';
import { Usuario, Pagamento, Provisao } from '@prisma/client';
import { TotalizadorDTO } from '../dtos/totalizador.dto';
import { ProvisaoService } from '../provisao/provisao.service';
import { FindProvisaoDTO } from 'src/provisao/dto/find-provisao.dto';

const getQueryPagamentos = () => {
  return new OQB('PAGAR P')
    .select([
      'P.CTRL_PAG id',
      'C.CODI_EMP id_unidade',
      'CE.IDEN_EMP unidade',
      'C.CODI_TRA id_parceiro',
      'TR.RAZA_TRA parceiro',
      'P.DVEN_PAG vencimento',
      '(COALESCE(P.VLOR_PAG, 0) - (SELECT COALESCE(SUM(B.VLOR_CPB), 0) FROM CPGBAIXA B WHERE B.CTRL_PAG = P.CTRL_PAG)) valor',
      'C.DOCU_CPG numero',
      'T.DESC_TDO modalidade',
      'TC.DESC_TCO carteira',
    ])
    .join('CABPAGAR C', '(P.CTRL_CPG = C.CTRL_CPG)')
    .join('CADEMP CE', '(C.CODI_EMP = CE.CODI_EMP)')
    .join('TRANSAC TR', '(C.CODI_TRA = TR.CODI_TRA)')
    .join('TIPDOC T', '(T.CODI_TDO = C.CODI_TDO)')
    .join('TIPCOB TC', '(P.CODI_TCO = TC.CODI_TCO)')
    .where(
      '(COALESCE(P.VLOR_PAG, 0) - (SELECT COALESCE(SUM(B.VLOR_CPB), 0) FROM CPGBAIXA B WHERE B.CTRL_PAG = P.CTRL_PAG)) > 0',
    );
};

@Injectable()
export class PagamentoService {
  private readonly logger = new Logger(PagamentoService.name);

  constructor(
    private readonly oracleDB: OracleDbService,
    private readonly db: DbService,
    private readonly provisaoService: ProvisaoService,
  ) {}

  async findAll(params: FindPagamentoDTO): Promise<PagamentoDTO[]> {
    const dateFormat = 'yyyy-MM-dd HH:mm:ss';
    const dbDateFormat = 'YYYY-MM-DD HH24:MI:SS';
    const sqlParams = [];
    const query = getQueryPagamentos();

    if (params.id_empresa) {
      if (Array.isArray(params.id_empresa)) {
        query.where(`C.CODI_EMP IN (${params.id_empresa.join(', ')})`);
      } else {
        query.where(`C.CODI_EMP = :id_empresa`);
        sqlParams.push(params.id_empresa);
      }
    }

    if (params.data_inicio && params.data_fim) {
      const data_inicio = format(new Date(params.data_inicio), dateFormat);
      const data_fim = format(new Date(params.data_fim), dateFormat);
      query.where(
        `P.DVEN_PAG BETWEEN TO_DATE(:data_inicio, '${dbDateFormat}') AND TO_DATE(:data_fim, '${dbDateFormat}')`,
      );
      sqlParams.push(data_inicio);
      sqlParams.push(data_fim);
    }

    if (params.parceiro) {
      query.where('TR.RAZA_TRA LIKE :parceiro');
      sqlParams.push(`%${params.parceiro.toUpperCase()}%`);
    }

    if (params.numero && params.numero > 0) {
      query.where('C.DOCU_CPG = :numero');
      sqlParams.push(params.numero.toString());
    }

    if (params.modalidade) {
      let modalidades = Array.isArray(params.modalidade)
        ? params.modalidade
        : [params.modalidade];
      modalidades = modalidades.map((value) => +value);
      query.where(`C.CODI_TDO IN (${modalidades.join(', ')})`);
    }

    if (params.carteira) {
      let carteiras = Array.isArray(params.carteira)
        ? params.carteira
        : [params.carteira];
      carteiras = carteiras.map((value) => +value);
      query.where(`P.CODI_TCO IN (${carteiras.join(', ')})`);
    }

    let sql = query.build();

    if (params.sort && params.sortDirection) {
      sql = `${sql} ORDER BY ${params.sort} ${params.sortDirection}`;
    } else {
      sql = `${sql} ORDER BY vencimento asc`;
    }

    // this.logger.debug(`SQL Query: \n ${sql}`);
    // this.logger.debug(`Params: ${JSON.stringify(sqlParams)}`);

    const result = await this.oracleDB.query(sql, sqlParams);
    const results: PagamentoDTO[] = [];
    if (result && result.rows.length > 0) {
      const ids = result.rows.map((r: any) => `${r[0]}`);
      const pagamentos = await this.findPagamentos(ids);
      result.rows.forEach((r: any) => {
        const pagamento = pagamentos.find((value) => value.controle == r[0]);
        const dto: PagamentoDTO = {
          id: r[0],
          id_unidade: r[1],
          unidade: r[2],
          id_parceiro: r[3],
          parceiro: r[4],
          vencimento: r[5],
          valor: r[6],
          numero: r[7],
          modalidade: r[8],
          carteira: r[9],
          ajuste: pagamento?.ajuste ? Number(pagamento?.ajuste) : null,
          valorTotal: pagamento?.ajuste
            ? r[6] + Number(pagamento?.ajuste)
            : r[6],
          observacao: pagamento?.observacao || null,
        };
        results.push(dto);
      });
    }

    return results;
  }

  async findPagamentos(ids: string[]): Promise<Pagamento[]> {
    const where: any = {
      controle: { in: ids },
    };
    return await this.db.pagamento.findMany({ where });
  }

  async save(
    pagamento: SavePagamentoDTO,
    usuario: Usuario,
  ): Promise<PagamentoDTO[]> {
    const upserts = [];
    for (const controle of pagamento.controle) {
      const data = savePagamentoDtoToData(pagamento);
      upserts.push(
        this.db.pagamento.upsert({
          where: {
            controle: controle,
          },
          update: {
            id_usuario: usuario.id,
            ...data,
          },
          create: {
            controle: controle,
            id_usuario: usuario.id,
            ...data,
          },
        }),
      );
    }
    const pagamentos = await this.db.$transaction(upserts);
    if (!pagamentos) return [];

    const query = getQueryPagamentos();
    query.where(`P.CTRL_PAG IN (${pagamento.controle.join(', ')})`);
    const sql = query.build();
    const result = await this.oracleDB.query(sql, []);
    const results: PagamentoDTO[] = [];

    if (result && result.rows.length > 0) {
      result.rows.forEach((r: any) => {
        const pagamentoDTO = pagamentos.find((value) => value.controle == r[0]);
        results.push({
          id: r[0],
          id_unidade: r[1],
          unidade: r[2],
          id_parceiro: r[3],
          parceiro: r[4],
          vencimento: r[5],
          valor: r[6],
          numero: r[7],
          modalidade: r[8],
          carteira: r[9],
          ajuste: pagamentoDTO?.ajuste ? Number(pagamentoDTO?.ajuste) : null,
          valorTotal: pagamentoDTO?.ajuste
            ? r[6] + Number(pagamentoDTO?.ajuste)
            : r[6],
          observacao: pagamentoDTO?.observacao ?? null,
        });
      });
    }

    return results;
  }

  private sumValoresPagamento(data: PagamentoDTO[]): number {
    let sum = 0;
    data.forEach((cobranca) => (sum += cobranca.valor + cobranca.ajuste));
    return sum;
  }

  private sumProvisoes(data: Provisao[]): number {
    let sum = 0;
    data.forEach((item) => (sum += Number(item.valor)));
    return sum;
  }

  private paramsToFindProvisaoDTO(params: FindPagamentoDTO): FindProvisaoDTO {
    const result: FindProvisaoDTO = {
      id_empresa: params.id_empresa,
      data_inicio: new Date(params.data_inicio).toISOString(),
      data_fim: new Date(params.data_fim).toISOString(),
    };

    if (params.modalidade) {
      result.modalidade = params.modalidade;
    }

    if (params.parceiro) {
      result.parceiro = params.parceiro;
    }

    return result;
  }

  async getResumoPagamentos(
    params: FindPagamentoDTO,
  ): Promise<TotalizadorDTO[]> {
    const results: TotalizadorDTO[] = [];
    const querys = [];
    const dateFormat = 'yyyy-MM-dd HH:mm:ss';
    const displayFormat = 'dd/MM';
    const today = startOfDay(new Date());
    const labels = [];
    let startDate, endDate;

    for (let i = 0; i < 8; i++) {
      startDate = addWeeks(addDays(startOfWeek(today), 1), i);
      endDate = addWeeks(addDays(endOfWeek(today), 1), i);
      params.data_inicio = format(startDate, dateFormat);
      params.data_fim = format(endDate, dateFormat);
      querys.push(this.findAll(params));
      querys.push(
        this.provisaoService.find(this.paramsToFindProvisaoDTO(params)),
      );
      labels.push(`${format(startDate, displayFormat)} - ${format(endDate, displayFormat)}`);
    }

    await Promise.all(querys)
      .then((data) => {
        let index = 1;
        for (let i = 0; i < data.length; i += 2) {
          const resumo = this.sumValoresPagamento(data[i]);
          const provisoes = this.sumProvisoes(data[i + 1]);
          results.push({
            id: index,
            label: labels[index - 1],
            valor: resumo + provisoes,
          });
          index++;
        }
      })
      .catch((err) => this.logger.error(err));

    return results;
  }

  async getResumoMensal(params: FindPagamentoDTO): Promise<TotalizadorDTO[]> {
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
    const totalMonths = 8;
    const querys = [];
    let startDate = startOfMonth(today);

    for (let i = 0; i < totalMonths; i++) {
      params.data_inicio = format(startDate, dateFormat);
      params.data_fim = format(endOfMonth(startDate), dateFormat);
      querys.push(this.findAll(params));
      querys.push(
        this.provisaoService.find(this.paramsToFindProvisaoDTO(params)),
      );
      const mes = meses[startDate.getMonth()];
      const ano = format(startDate, 'yyyy');
      results.push({
        id: i,
        label: `${mes} / ${ano}`,
        valor: 0,
      });
      startDate = addMonths(startDate, 1);
    }

    await Promise.all(querys)
      .then((data) => {
        let index = 0;
        for (let i = 0; i < data.length; i += 2) {
          const resumo = this.sumValoresPagamento(data[i]);
          const provisoes = this.sumProvisoes(data[i + 1]);
          results[index].valor = resumo + provisoes;
          index++;
        }
      })
      .catch((err) => this.logger.error(err));

    return results;
  }
}
