import { IsString, IsEnum, IsDecimal, IsInt, IsOptional, IsBoolean, Min } from 'class-validator';
import { ModeCalcul } from '@prisma/client';

export class UpdateTypeSanctionDto {
  @IsString()
  @IsOptional()
  nom?: string;

  @IsEnum(ModeCalcul)
  @IsOptional()
  modeCalcul?: ModeCalcul;

  @IsDecimal()
  @IsOptional()
  montantFixe?: number;

  @IsDecimal()
  @IsOptional()
  pourcentage?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  joursDeGrace?: number;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}
