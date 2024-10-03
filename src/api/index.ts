import axios from "axios";
import { ApiProp } from "components/model/types/type";

export const baseUrl = "https://minigame3tot.winwingroup.vn/";

export const api = {

    followOA: () => baseUrl + "api/mini-game-2010/follow-oa",
    checkFollow: () => baseUrl + "api/mini-game-2010/check-follow-oa",
    checkInvoice: () => baseUrl + "api/mini-game-2010/check-invoice",
    checkWithdrawGift: () => baseUrl + "api/mini-game-2010/check-withdraw",
    createWithdrawGiftRelative: () => baseUrl + "api/mini-game-2010/create-withdraw-gifts-relative",
    withdrawGift: () => baseUrl + "api/mini-game-2010/withdraw-gifts",
}
const requests = async ({ url, method, data, params }: ApiProp) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        const config = { method, url, data, params, headers };
        const res = await axios(config);

        return res.data;
    } catch (error) {
        console.log(error);
    }
};
const secret_key = "yA28BT3r2yFQ8VSPD3zC";
const IdOa = '3310494139050166655';
const app_id = '495748070586388815';

export { requests, IdOa, secret_key, app_id };

