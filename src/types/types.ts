export interface CheckWithdrawal {
    status: number;
    type: number;
    gift: {
        id: number;
        id_kiotviet_product: number;
        code_kiotviet_product: string;
        name: string;
        image: string;
        total: number;
        status: number;

    }
}