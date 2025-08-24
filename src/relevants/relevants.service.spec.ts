import { Test, TestingModule } from '@nestjs/testing';
import { RelevantsService } from './relevants.service';

describe('RelevantsService', () => {
  let service: RelevantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RelevantsService],
    }).compile();

    service = module.get<RelevantsService>(RelevantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
