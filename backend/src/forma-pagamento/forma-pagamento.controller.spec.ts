import { Test, TestingModule } from '@nestjs/testing';
import { FormaPagamentoController } from './forma-pagamento.controller';
import { FormaPagamentoService } from './forma-pagamento.service';

describe('FormaPagamentoController', () => {
  let controller: FormaPagamentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormaPagamentoController],
      providers: [FormaPagamentoService],
    }).compile();

    controller = module.get<FormaPagamentoController>(FormaPagamentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
