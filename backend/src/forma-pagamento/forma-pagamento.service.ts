import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db.service';

@Injectable()
export class FormaPagamentoService {
  constructor(private readonly db: DbService) {}

  findAll() {
    return this.db.formaPagamento.findMany();
  }
}
