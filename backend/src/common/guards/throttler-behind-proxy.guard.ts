import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Используем IP из заголовков если есть прокси
    const forwarded = req.headers?.["x-forwarded-for"] as string;
    if (forwarded) {
      return forwarded.split(",")[0]?.trim() || "unknown";
    }
    return (req.ip || req.socket?.remoteAddress || "unknown") as string;
  }
}
