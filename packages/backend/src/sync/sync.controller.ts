import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { SyncService, SyncBatchInput } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  push(@Body() batch: SyncBatchInput) {
    return this.syncService.pushBatch(batch);
  }

  @Get('pull')
  pull(@Query('since') since: string) {
    const sinceNumber = parseInt(since, 10) || 0;
    return this.syncService.pullChanges(sinceNumber);
  }
}
