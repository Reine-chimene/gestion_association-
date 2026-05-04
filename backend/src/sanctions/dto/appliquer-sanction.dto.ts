import { IsString, IsDecimal } from 'class-validator';

export class AppliquerSanctionDto {
  @IsString()
  membreId!: string;

  @IsString()
  typeSanctionId!: string;

  @IsString()
  motif!: string;

  @IsDecimal()
  montant!: number;
}
