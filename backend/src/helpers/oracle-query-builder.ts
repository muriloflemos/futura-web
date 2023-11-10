export class OracleQueryBuilder {
  private fields: string[] = [];
  private joins: string[] = [];
  private conditions: string[] = [];
  private strOrderBy = '';
  private strGroupBy = '';

  constructor(private tableName: string) {}

  select(field: string | string[]): OracleQueryBuilder {
    this.fields.push(...field);
    return this;
  }

  join(table: string, condition: string, tipo = 'INNER'): OracleQueryBuilder {
    const join = `${tipo} JOIN ${table} ON ${condition}`;
    this.joins.push(join);
    return this;
  }

  where(condition: string): OracleQueryBuilder {
    this.conditions.push(condition);
    return this;
  }

  groupBy(fields: string): OracleQueryBuilder {
    this.strOrderBy = `GROUP BY ${fields}`;
    return this;
  }

  orderBy(sort: string, direction: string): OracleQueryBuilder {
    this.strOrderBy = `ORDER BY ${sort} ${direction}`;
    return this;
  }

  private buildFrom(): string {
    let from = this.tableName;

    for (const join of this.joins) {
      from += `\n${join}`;
    }

    return from;
  }

  private buildWhere(): string {
    let where = '1 = 1';

    for (const condition of this.conditions) {
      where += `\nAND ${condition}`;
    }

    return where;
  }

  build(): string {
    const fields = this.fields.length > 0 ? this.fields.join(', ') : '*';

    let query = `SELECT ${fields}`;
    query += `\nFROM ${this.buildFrom()}`;
    query += `\nWHERE ${this.buildWhere()}`;
    if (this.strGroupBy != '') query += `\n${this.strGroupBy}`;
    if (this.strOrderBy != '') query += `\n${this.strOrderBy}`;

    return query;
  }
}
