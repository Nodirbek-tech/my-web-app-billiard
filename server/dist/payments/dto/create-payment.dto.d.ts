export declare class CreatePaymentDto {
    sessionId: number;
    discount?: number;
    method: 'CASH' | 'CARD';
}
