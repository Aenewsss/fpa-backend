import { Test, TestingModule } from '@nestjs/testing';
import { ContactPageService } from './contact-page.service';

describe('ContactPageService', () => {
  let service: ContactPageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactPageService],
    }).compile();

    service = module.get<ContactPageService>(ContactPageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
