import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Headers,
    UseGuards,
} from '@nestjs/common';
import { GformService } from './gform.service';
import { GformWebhookDto } from './dto';
import { JwtAuthGuard } from '../../auth';

@Controller('integrations/gform')
export class GformController {
    constructor(private readonly gformService: GformService) { }

    // Webhook endpoint for Google Apps Script
    @Post('webhook')
    processWebhook(
        @Body() data: GformWebhookDto,
        @Headers('x-api-key') apiKey: string,
    ) {
        return this.gformService.processWebhook(data, apiKey);
    }

    @Get('history')
    @UseGuards(JwtAuthGuard)
    getImportHistory(
        @Query('formId') formId?: string,
        @Query('limit') limit?: string,
    ) {
        return this.gformService.getImportHistory(
            formId,
            limit ? parseInt(limit, 10) : 50,
        );
    }
}
