import { IsNotEmpty, IsString } from 'class-validator';

export class RejeterAideDto {
  @IsNotEmpty()
  @IsString()
  motif!: string;
}
