import { IsOptional, IsString } from 'class-validator';

export class CloturerSeanceDto {
  @IsString()
  @IsOptional()
  rapportFinal?: string;
}
