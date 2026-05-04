import { IsString, IsNumber, IsEnum, Min } from 'class-validator';

export class VendreInteretsDto {
  @IsString()
  vendeurId!: string;

  @IsString()
  acheteurId!: string;

  @IsNumber()
  @Min(0.01)
  montantInterets!: number;

  @IsNumber()
  @Min(0.01)
  montantOffre!: number;

  @IsEnum(['LOT_UNIQUE', 'MULTI_PARTS'])
  modalite!: 'LOT_UNIQUE' | 'MULTI_PARTS';
}
