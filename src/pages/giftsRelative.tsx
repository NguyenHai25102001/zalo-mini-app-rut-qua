import { images } from 'components/assets/images';
import React, { useContext, useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Page, useSnackbar } from 'zmp-ui';
import successSound from '../components/assets/audio/successSound.mp3';
import FireworksEffect from 'components/FireworksEffect ';
import { api, baseUrl, requests } from 'api';
import { AppContext } from 'components/context/MyContext';
import axios from 'axios';


interface IGiftProps {
    name: string;
    code: string;
}

const GiftRelative = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const { openSnackbar } = useSnackbar();
    
    const [isReceived, setIsReceived] = React.useState(false);
    const [imageGift, setImageGift] = React.useState<string>("");
    const [checkWithdraw, setCheckWithdraw] = React.useState<boolean>(false);
    
    const code = searchParams.get("code");
    const phone = searchParams.get("phone");

    // Function to play success sound
    const playSuccessSound = () => {
        const sound = new Audio(successSound);
        sound.play();
    };

    // Function to handle gift withdrawal
    const withdrawGift = async () => {
        if (checkWithdraw) {
            openSnackbar({
                type: "warning",
                text: "Bạn đã rút quà",
                position: "top",
                duration: 3000,
            });
            return;
        }

        try {
            const response = await requests({
                url: api.withdrawGift(),
                method: "POST",
                data: {
                    type_list_gift_yourself: 1,
                    code_invoice: code,
                },
            });

            setImageGift(`${baseUrl}${response?.gift?.image}`);
            playSuccessSound();
            setIsReceived(true);

            openSnackbar({
                type: "success",
                text: "Rút quà thành công",
                position: "top",
                duration: 3000,
            });
        } catch (error) {
            console.error("Error withdrawing gift:", error);
            openSnackbar({
                type: "error",
                text: "Đã xảy ra lỗi khi rút quà",
                position: "top",
                duration: 3000,
            });
        }
    };

    // Function to check if the gift has already been withdrawn
    const checkWithdrawGift = async () => {
        try {
            const response = await axios({
                method: "GET",
                url: api.checkWithdrawGift(),
                params: { phone: phone },
            });

            if (response.data.status !== 1) {
                setCheckWithdraw(true);
                openSnackbar({
                    type: "warning",
                    text: "Bạn đã rút quà",
                    position: "top",
                    duration: 3000,
                });
            } else {
                setCheckWithdraw(false);
            }
        } catch (error) {
            console.error("Error checking withdraw status:", error);
            openSnackbar({
                type: "error",
                text: "Lỗi khi kiểm tra trạng thái rút quà",
                position: "top",
                duration: 3000,
            });
        }
    };

    // useEffect hook to check if the gift has been withdrawn on component mount
    useEffect(() => {
        if (phone) {
            checkWithdrawGift();
        }
    }, [phone]);

    return (
        <Page className='page bg-main relative'>
            <img src={images.bg_bottom_left} className="absolute bottom-0 left-0 w-[100px]" alt="" />
            <img src={images.bg_top_right} className="absolute  top-0 right-0  w-[100px]" alt="" />

            <div className="absolute top-[50px] z-10 w-full flex justify-center left-0">
                {/* <img src={images.banner_mini_gamer} alt="" className='max-h-[150px]' onClick={() => setIsReceived(false)} /> */}
                <img src={images.banner_mini_gamer} alt="" className='max-h-[150px]' />
            </div>

            {
                !isReceived && (
                    <div className="absolute top-[55%] -translate-y-[50%] left-[50%] -translate-x-[50%] w-full flex justify-center">
                        <img src={images.qua_nguoi_than} alt="" className='w-[70%]' />
                    </div>

                )
            }

            {
                !isReceived && (
                    <div className="absolute bottom-10 w-full left-0 flex justify-center">
                        <img src={images.btn_rut_qua} alt="" onClick={withdrawGift} />
                    </div>
                )
            }
            {isReceived && <FireworksEffect trigger={true} />}

            {
                isReceived && (
                    <>
                        <div className="absolute top-[55%] -translate-y-[50%] left-[50%] -translate-x-[50%] w-full flex justify-center">
                            <img src={imageGift} alt="" className='w-[70%] animate-zoom-rotate' />
                        </div>
                        <div className="absolute bottom-10 w-full left-0 flex justify-center">

                            <img src={images.button_nhan_qua} alt="" onClick={() => { navigate("/") }} />
                        </div>
                    </>
                )
            }

        </Page>
    )

}
export default GiftRelative;