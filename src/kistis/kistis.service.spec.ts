import { Test, TestingModule } from '@nestjs/testing';
import { KistisService } from './kistis.service';

describe('KistisService', () => {
  let service: KistisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KistisService],
    }).compile();

    service = module.get<KistisService>(KistisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
