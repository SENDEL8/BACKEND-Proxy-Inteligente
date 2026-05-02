import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';

export interface LLMResponse {
  readonly testCode: string;
  readonly latency: number;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
  private readonly modelName = process.env.OLLAMA_MODEL || 'llama3.2';

  async generateUnitTest(lenguaje: string, codigo: string): Promise<LLMResponse> {
    const startTime = Date.now();
    
    const systemPrompt = `Eres un experto en testing de software de nivel Senior.
Tu tarea es generar UNA PRUEBA UNITARIA funcional para la función proporcionada en el lenguaje ${lenguaje}.

Reglas de Oro:
1. Identifica la librería estándar para ${lenguaje}: (ej. JUnit para Java, PyTest para Python, Jest para JS/TS).
2. El código DEBE incluir la declaración de la función original o una instrucción de importación comentada para que sea SINTÁCTICAMENTE CORRECTO.
3. No inventes comportamientos: No generes tests para casos que la función original no maneja (ej. si no hay valores por defecto, no testees con un solo argumento).
4. Devuelve ÚNICAMENTE el código. Sin prosa, sin explicaciones, sin saludos.
5. Asegúrate de incluir los 'imports' necesarios de la librería de testing identificada.
6. El código debe estar listo para ser ejecutado.`;

    const prompt = `Lenguaje: ${lenguaje}\nCódigo:\n${codigo}`;

    try {
      const response = await axios.post(this.ollamaUrl, {
        model: this.modelName,
        prompt: prompt,
        system: systemPrompt,
        stream: false,
        options: {
          temperature: 0.1, // Baja temperatura para respuestas deterministas y técnicas
        },
      }, {
        timeout: 30000, // 30 segundos de timeout
      });

      const testCode = response.data.response.trim();
      
      // Validación básica de salida: verificar que no esté vacío y parezca código
      if (!testCode || testCode.length < 10) {
        throw new Error('La respuesta del modelo no parece contener código coherente.');
      }

      const latency = Date.now() - startTime;

      return {
        testCode,
        latency,
      };
    } catch (error) {
      this.logger.error(`Error llamando a Ollama: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        throw new HttpException('El motor de inferencia no está disponible.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      if (error.code === 'ECONNABORTED') {
        throw new HttpException('Timeout esperando la respuesta del modelo.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw new HttpException(
        error.message || 'Error interno al procesar la solicitud.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
