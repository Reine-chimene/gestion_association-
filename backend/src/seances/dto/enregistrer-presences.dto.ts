import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PresenceDto {
  @IsString()
  membreId!: string;

  @IsBoolean()
  present!: boolean;

  @IsString()
  @IsOptional()
  justification?: string;
}

export class EnregistrerPresencesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PresenceDto)
  presences!: PresenceDto[];
}
