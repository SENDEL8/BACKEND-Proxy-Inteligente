import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateTestDto {
  @IsString()
  @IsNotEmpty()
  readonly lenguaje: string;

  @IsString()
  @IsNotEmpty()
  readonly codigo: string;
}
