import { Controller, Get, Header } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { MetricsService } from "./metrics.service";

@ApiTags("Metrics")
@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header("Content-Type", "text/plain; version=0.0.4")
  @ApiOperation({ summary: "Get Prometheus metrics" })
  @ApiResponse({ 
    status: 200, 
    description: "Returns metrics in Prometheus format",
    content: {
      "text/plain": {
        schema: {
          type: "string",
          example: "# HELP masterprofi_http_requests_total Total number of HTTP requests\n# TYPE masterprofi_http_requests_total counter\nmasterprofi_http_requests_total{method=\"GET\",route=\"/api/users\",status_code=\"200\"} 10"
        }
      }
    }
  })
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
