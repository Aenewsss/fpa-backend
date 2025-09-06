import { Test, TestingModule } from '@nestjs/testing';
import { UsageTermsPageController } from './usage-terms-page.controller';

describe('UsageTermsPageController', () => {
  let controller: UsageTermsPageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsageTermsPageController],
    }).compile();

    controller = module.get<UsageTermsPageController>(UsageTermsPageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
