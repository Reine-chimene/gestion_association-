import { IsOptional, IsNumber, Min } from 'class-validator';

export class DistribuerCagnotteDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  retenuesPrets?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retenuesSanctions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retenuesComplementFonds?: number;
}
