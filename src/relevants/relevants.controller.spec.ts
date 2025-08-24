import { Test, TestingModule } from '@nestjs/testing';
import { RelevantsController } from './relevants.controller';

describe('RelevantsController', () => {
  let controller: RelevantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RelevantsController],
    }).compile();

    controller = module.get<RelevantsController>(RelevantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
