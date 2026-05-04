import { IsString, IsEnum, IsDecimal, IsInt, IsOptional, IsBoolean, Min } from 'class-validator';
import { ModeCalcul } from '@prisma/client';

export class CreateTypeSanctionDto {
  @IsString()
  nom!: string;

  @IsEnum(ModeCalcul)
  modeCalcul!: ModeCalcul;

  @IsDecimal()
  @IsOptional()
  montantFixe?: number;

  @IsDecimal()
  @IsOptional()
  pourcentage?: number;

  @IsInt()
  @Min(0)
  joursDeGrace!: number;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}
