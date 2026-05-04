import { IsOptional, IsString } from 'class-validator';

export class ApprouverAideDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
