import React from 'react';
import { images } from './assets/images';
import { getSetting } from 'zmp-sdk';


interface IFormCodeProps {
    handleCheckCode: (code: string) => void;
    
}
const FormCode = ({ handleCheckCode }: IFormCodeProps) => {
    const [code, setCode] = React.useState<string>('');

    const handle = () => {
     
        handleCheckCode(code);
    }
    return (
        <div className="absolute top-[55%]  -translate-y-[50%] w-full left-0 px-2 flex justify-center">
            <div className="relative w-[90%]">
                 <img src={images.nhap_ma_hoa_don} alt="" className="w-full  " />
                <div className="absolute top-[63%] left-[50%] -translate-x-[50%] w-full px-5">
                    <input type="text" name="" id="" className="w-full h-[40px] rounded text-xl px-2 py-2" value={code} onChange={(e) => setCode(e.target.value)} />
                    <div className="text-center w-full mt-5 flex justify-center">
                        <img src={images.button_nhan_qua} alt="" className=" w-[200px] object-contain" onClick={handle} />
                    </div>
                </div>
            </div>

        </div>
    )

}
export default FormCode;