import { PrismaService } from '../prisma/prisma.service';
export interface UpdateSettingsData {
    cashbackPercent?: number;
    dayHourlyPrice?: number;
    nightHourlyPrice?: number;
    dayStartTime?: string;
    nightStartTime?: string;
    address?: string;
    contactPhone?: string;
}
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    update(data: UpdateSettingsData): Promise<{
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
