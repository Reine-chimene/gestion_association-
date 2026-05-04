import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateSeanceDto {
  @IsDateString()
  date!: string;

  @IsString()
  @IsOptional()
  rapportSeance?: string;
}
