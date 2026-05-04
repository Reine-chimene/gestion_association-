import { IsArray, IsDecimal, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CotisationDto {
  @IsString()
  membreId!: string;

  @IsDecimal()
  montantTontine!: number;

  @IsDecimal()
  @IsOptional()
  montantEpargneAnnuelle?: number;

  @IsDecimal()
  @IsOptional()
  montantEpargneScolaire?: number;

  @IsDecimal()
  @IsOptional()
  montantProjets?: number;

  @IsDecimal()
  @IsOptional()
  montantRemboursementPret?: number;
}

export class CollecterCotisationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CotisationDto)
  cotisations!: CotisationDto[];
}
