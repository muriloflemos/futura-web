import { Test, TestingModule } from '@nestjs/testing';
import { ModalidadeController } from './modalidade.controller';
import { ModalidadeService } from './modalidade.service';

describe('ModalidadeController', () => {
  let controller: ModalidadeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModalidadeController],
      providers: [ModalidadeService],
    }).compile();

    controller = module.get<ModalidadeController>(ModalidadeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
