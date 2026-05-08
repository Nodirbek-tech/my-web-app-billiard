export declare class StopAndPayDto {
    discount?: number;
    serviceFee?: number;
    method: 'CASH' | 'CARD' | 'MIXED';
    cashAmount?: number;
    cardAmount?: number;
    notes?: string;
    cashierName?: string;
    bonusRedeemed?: number;
}
