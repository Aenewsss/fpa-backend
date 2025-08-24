import { Test, TestingModule } from '@nestjs/testing';
import { WebstoriesService } from './webstories.service';

describe('WebstoriesService', () => {
  let service: WebstoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebstoriesService],
    }).compile();

    service = module.get<WebstoriesService>(WebstoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
