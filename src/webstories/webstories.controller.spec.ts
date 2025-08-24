import { Test, TestingModule } from '@nestjs/testing';
import { WebstoriesController } from './webstories.controller';

describe('WebstoriesController', () => {
  let controller: WebstoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebstoriesController],
    }).compile();

    controller = module.get<WebstoriesController>(WebstoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
