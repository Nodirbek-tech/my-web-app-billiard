import { SettingsService } from './settings.service';
declare class UpdateSettingsDto {
    cashbackPercent?: number;
    dayHourlyPrice?: number;
    nightHourlyPrice?: number;
    dayStartTime?: string;
    nightStartTime?: string;
    address?: string;
    contactPhone?: string;
}
export declare class SettingsController {
    private settings;
    constructor(settings: SettingsService);
    get(): Promise<{
        id: number;
        cashbackPercent: number;
        dayHourlyPrice: number;
        nightHourlyPrice: number;
        dayStartTime: string;
        nightStartTime: string;
        address: string;
        contactPhone: string;
    }>;
    update(dto: UpdateSettingsDto): Promise<{
        id: number;
        cashbackPercent: number;
        dayHourlyPrice: number;
        nightHourlyPrice: number;
        dayStartTime: string;
        nightStartTime: string;
        address: string;
        contactPhone: string;
    }>;
}
export {};
