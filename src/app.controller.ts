import { Controller, Post, Body, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { OllamaService, LLMResponse } from './ollama.service';
import { GenerateTestDto } from './generate-test.dto';
import { LoggingInterceptor } from './logging.interceptor';

@Controller('proxy')
@UseInterceptors(LoggingInterceptor)
export class AppController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Post('generate')
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateTest(@Body() body: GenerateTestDto): Promise<LLMResponse> {
    return this.ollamaService.generateUnitTest(body.lenguaje, body.codigo);
  }
}
