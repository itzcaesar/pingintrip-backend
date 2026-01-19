import { SettingsService } from './settings.service';
import { UpdateBusinessSettingsDto } from './dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getBusinessSettings(): Promise<any>;
    updateBusinessSettings(dto: UpdateBusinessSettingsDto): Promise<any>;
}
