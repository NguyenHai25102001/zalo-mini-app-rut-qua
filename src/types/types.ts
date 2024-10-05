export interface CheckWithdrawal {
    status: number;
    type: number;
    info_withdraw: {
        id: number;
        id_kiotviet_product: number;
        code_invoice_kiotviet: string;
        name: string;
        image: string;
        total: number;
        status: number;
        type: number;

    }
    info_withdraw_relative?: {
        id: number,
        user_id: number,
        branch_id: 1000000478,
        type_withdraw: number,
        phone: string,
        code_invoice_kiotviet: string,
        sold_by_name: string,
        customer_name: string,
        status_value: string,
        description: string,
        payments_day: Date,
        type: number,
        status: number,
    }
}