import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateDepotDto {
  @IsString()
  @IsNotEmpty()
  membreId!: string;

  @IsString()
  @IsNotEmpty()
  type!: string; // Type de cotisation (TONTINE, EPARGNE, etc.)

  @IsNumber()
  @IsPositive()
  montant!: number;

  @IsString()
  @IsNotEmpty()
  preuveUrl!: string; // URL de la preuve de paiement (screenshot)

  @IsString()
  @IsNotEmpty()
  motifAbsence!: string; // Motif de l'absence à la séance

  @IsString()
  @IsNotEmpty()
  operateur!: string; // ORANGE_MONEY ou MTN_MONEY
}
