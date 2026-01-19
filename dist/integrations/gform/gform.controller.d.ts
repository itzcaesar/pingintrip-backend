import { GformService } from './gform.service';
import { GformWebhookDto } from './dto';
export declare class GformController {
    private readonly gformService;
    constructor(gformService: GformService);
    processWebhook(data: GformWebhookDto, apiKey: string): Promise<{
        success: boolean;
        bookingId: string;
    }>;
    getImportHistory(formId?: string, limit?: string): Promise<{
        id: string;
        bookingId: string | null;
        responseHash: string;
        formId: string;
        importedAt: Date;
    }[]>;
}
