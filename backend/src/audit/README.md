# Audit Log System

Система логирования действий пользователей для MasterProfi.

## Использование

### Автоматическое логирование через декоратор

```typescript
import { Audit } from '../audit/decorators/audit.decorator';
import { AuditAction } from '../audit/entities/audit-log.entity';

@Controller('orders')
export class OrdersController {
  @Post()
  @Audit(AuditAction.ORDER_CREATE, 'order')
  async create(@Body() dto: CreateOrderDto) {
    // Автоматически залогируется при создании
  }
}
```

### Ручное логирование через сервис

```typescript
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/entities/audit-log.entity';

@Injectable()
export class OrdersService {
  constructor(private auditService: AuditService) {}

  async update(id: string, dto: UpdateOrderDto) {
    const oldOrder = await this.findOne(id);
    const updated = await this.save(updatedOrder);
    
    await this.auditService.log(AuditAction.ORDER_UPDATE, 'order', {
      userId: currentUser.id,
      entityId: id,
      oldValues: { status: oldOrder.status },
      newValues: { status: updated.status },
      description: 'Order status changed',
    });
    
    return updated;
  }
}
```

## API Endpoints

- `GET /api/audit` - Все логи (лимит 100)
- `GET /api/audit/user/:userId` - Логи пользователя
- `GET /api/audit/entity/:entityType/:entityId` - Логи по сущности

