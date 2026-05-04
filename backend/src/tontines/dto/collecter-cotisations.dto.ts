import { IsArray, ValidateNested, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class CotisationDto {
  @IsString()
  membreId!: string;

  @IsBoolean()
  paye!: boolean;
}

export class CollecterCotisationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CotisationDto)
  cotisations!: CotisationDto[];
}
