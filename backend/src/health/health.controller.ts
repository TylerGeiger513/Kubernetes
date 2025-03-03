// Health endpoint that verifies mongo & redis connections

import { Controller, Get } from "@nestjs/common";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
    // Inject HealthService
    constructor(private readonly healthService: HealthService) { }

    @Get()
    async healthCheck(): Promise<{ redis: string; mongo: string }> {
        return this.healthService.checkDatabaseHealth();
    }
}

