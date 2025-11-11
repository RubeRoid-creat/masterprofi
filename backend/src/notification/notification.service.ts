import { Injectable } from "@nestjs/common";
import { NotificationGateway } from "./notification.gateway";

@Injectable()
export class NotificationService {
  constructor(private notificationGateway: NotificationGateway) {}

  notifyOrderCreated(order: any) {
    this.notificationGateway.emitOrderCreated(order);
  }

  notifyOrderStatusChanged(orderId: string, status: string) {
    this.notificationGateway.emitOrderStatusChanged(orderId, status);
  }
}
