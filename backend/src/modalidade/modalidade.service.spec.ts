import { Test, TestingModule } from '@nestjs/testing';
import { ModalidadeService } from './modalidade.service';

describe('ModalidadeService', () => {
  let service: ModalidadeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModalidadeService],
    }).compile();

    service = module.get<ModalidadeService>(ModalidadeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
