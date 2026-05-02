import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { OllamaService } from './ollama.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [OllamaService],
})
export class AppModule {}
