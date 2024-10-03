import React from 'react';
import { images } from './assets/images';

interface IWithdrawGiftProps {
    handleDrawGifts: (code: string) => void;
}
const WithdrawGift: React.FunctionComponent<IWithdrawGiftProps> = ({ handleDrawGifts }) => {
    const handle = (code: string) => {
        handleDrawGifts(code);
    }

    return (<>
        <div className="absolute top-[50%]  -translate-y-[50%] w-full left-0">
            <div className="relative">
                <img src={images.thu_cam_on} alt="" className="w-full" />
                <div className="absolute bottom-4 left-[50%] -translate-x-[50%] w-full px-5">
                    <div className="text-center w-full flex justify-center gap-3">
                        <div className="">
                            <img src={images.btn_tu_rut} alt="" onClick={() => handle('tu-rut-qua')} />
                        </div>
                        <div className="">
                            <img src={images.btn_nguoi_than_rut} alt="" onClick={() => handle('nguoi-than-rut-qua')} />
                        </div>

                    </div>
                </div>
            </div>

        </div>
        <div className="absolute bottom-10 left-0 w-full flex justify-center">
            <div className="relative">
                <img src={images.btn_bg_qua_da_rut} alt="" />
                <img src={images.text_qua_da_rut} alt="" className='absolute left-[50%] -translate-x-[50%] top-[50%] -translate-y-[50%]' />

            </div>

        </div>
    </>)
}

export default WithdrawGift;