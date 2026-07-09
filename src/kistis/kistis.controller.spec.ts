import { Test, TestingModule } from '@nestjs/testing';
import { KistisController } from './kistis.controller';
import { KistisService } from './kistis.service';

describe('KistisController', () => {
  let controller: KistisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KistisController],
      providers: [KistisService],
    }).compile();

    controller = module.get<KistisController>(KistisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
