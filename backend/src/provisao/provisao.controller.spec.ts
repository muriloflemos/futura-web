import { Test, TestingModule } from '@nestjs/testing';
import { ProvisaoController } from './provisao.controller';

describe('ProvisaoController', () => {
  let controller: ProvisaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProvisaoController],
    }).compile();

    controller = module.get<ProvisaoController>(ProvisaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
