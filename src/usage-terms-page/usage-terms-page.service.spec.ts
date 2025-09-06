import { Test, TestingModule } from '@nestjs/testing';
import { UsageTermsPageService } from './usage-terms-page.service';

describe('UsageTermsPageService', () => {
  let service: UsageTermsPageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsageTermsPageService],
    }).compile();

    service = module.get<UsageTermsPageService>(UsageTermsPageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
