import { IsString, IsNumber, IsPositive, IsEnum, IsOptional } from 'class-validator';

export class EnregistrerPaiementDto {
  @IsString()
  membreId!: string;

  @IsNumber()
  @IsPositive()
  montant!: number;

  @IsEnum(['PRELEVEMENT_AUTO', 'PAIEMENT_MANUEL'])
  @IsOptional()
  modePaiement?: 'PRELEVEMENT_AUTO' | 'PAIEMENT_MANUEL';
}
