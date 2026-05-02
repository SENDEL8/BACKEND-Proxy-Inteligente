import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { lenguaje } = request.body;
    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const latency = data?.latency || Date.now() - startTime;
        const timestamp = new Date().toISOString();
        console.log(`${timestamp} | ${lenguaje} | ${latency}ms | Éxito`);
      }),
      catchError((err) => {
        const timestamp = new Date().toISOString();
        const latency = Date.now() - startTime;
        console.log(`${timestamp} | ${lenguaje || 'N/A'} | ${latency}ms | Fallo`);
        return throwError(() => err);
      }),
    );
  }
}
