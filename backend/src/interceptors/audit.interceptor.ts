import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    // Only log state-changing requests
    const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    return next.handle().pipe(
      tap(() => {
        if (isStateChanging && user) {
          const action = `${method} ${url}`;
          this.auditService.log(action, user.id).catch((err) => {
            console.error('Failed to log audit:', err);
          });
        }
      }),
    );
  }
}
