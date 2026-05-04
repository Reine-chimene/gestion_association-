import { IsNotEmpty, IsEnum, IsNumber, Min, IsOptional } from 'class-validator';
import { TypeEpargne } from '@prisma/client';

export class RedistribuerDto {
  @IsNotEmpty()
  @IsEnum(TypeEpargne)
  type!: TypeEpargne;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tauxInteret?: number; // Taux d'intérêt annuel en pourcentage (ex: 5 pour 5%)
}
