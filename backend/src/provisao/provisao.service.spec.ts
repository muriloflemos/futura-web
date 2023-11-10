import { Test, TestingModule } from '@nestjs/testing';
import { ProvisaoService } from './provisao.service';

describe('ProvisaoService', () => {
  let service: ProvisaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProvisaoService],
    }).compile();

    service = module.get<ProvisaoService>(ProvisaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
