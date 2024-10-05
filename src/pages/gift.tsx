import { images } from 'components/assets/images';
import React, { useContext, useLayoutEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Icon, Page, useSnackbar } from 'zmp-ui';
import successSound from '../components/assets/audio/successSound.mp3';
import FireworksEffect from 'components/FireworksEffect ';
import { api, baseUrl, requests } from 'api';
import { AppContext } from 'components/context/MyContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { CheckWithdrawal } from 'types/types';
import { IconString } from 'zmp-ui/icon';


interface IGiftProps {
    name: string;
    code: string;
}

const Gift = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { openSnackbar } = useSnackbar();
    const { phoneUser } = useContext(AppContext);

    const [isReceived, setIsReceived] = React.useState(false);
    const [phoneRelative, setPhoneRelative] = React.useState<string>("");
    const [imageGift, setImageGift] = React.useState<string>("");
    const [isCheckGiftRelative, setIsCheckGiftRelative] = React.useState<boolean>(false);
    const [isGiftSuccess, setIsGiftSuccess] = React.useState<boolean>(false);
    const [statusGiftUser, setStatusGiftUser] = React.useState<number | null>(null);
    const [checkWithdraw, setCheckWithdraw] = React.useState<CheckWithdrawal>();
    const { name, code } = location.state as IGiftProps;

    const phoneRegex = /^[0-9]{10}$/;

    const playSuccessSound = () => {
        const sound = new Audio(successSound);
        sound.play();
    };

    const handleReceivedGifts = () => {
        setIsReceived(true);
        playSuccessSound();
    };

    // Create withdraw gift request for a relative
    const createWithdrawGiftRelative = async () => {
        if (!phoneRelative) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập số điện thoại người thân",
                position: "top",
                duration: 3000,
            });
            return;
        }

        if (!phoneRegex.test(phoneRelative)) {
            openSnackbar({
                type: "error",
                text: "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại có 10 chữ số.",
                position: "top",
                duration: 3000,
            });
            return;
        }

        try {
            const response = await requests({
                url: api.createWithdrawGiftRelative(),
                method: "POST",
                data: {
                    phone: phoneUser,
                    phone_relative: phoneRelative,
                },
            });

            if (response.status === 1) {
                setIsCheckGiftRelative(true);
                openSnackbar({
                    type: "success",
                    text: response.msg,
                    position: "top",
                    duration: 3000,
                });
            } else {
                openSnackbar({
                    type: "error",
                    text: "Tạo yêu cầu rút cho người thân quà thất bại",
                    position: "top",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error("Error creating withdraw gift request:", error);
            openSnackbar({
                type: "error",
                text: "Đã xảy ra lỗi khi tạo yêu cầu rút quà",
                position: "top",
                duration: 3000,
            });
        }
    };

    // Withdraw gift for the user
    const withdrawGift = async () => {
        try {
            const response = await requests({
                url: api.withdrawGift(),
                method: "POST",
                data: {
                    type_list_gift_yourself: 1,
                    code_invoice: code,
                },
            });

            setIsGiftSuccess(true);
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

    // Copy gift link to clipboard
    const handleCopyLink = () => {
        console.log(window.location.href);

        const baseUrl = window.location.href.split('/gift')[0];

        if (!phoneRelative || !code) {
            openSnackbar({
                type: "error",
                text: "Đã xảy ra lỗi khi sao chép link",
                position: "top",
                duration: 3000,
            });
            return;
        }
        const link = `https://zalo.me/s/1017356468012563396/gift-relatives/?env=DEVELOPMENT&version=zdev-13f37aa1?code=${code}&phone=${phoneRelative}`;
        navigator.clipboard.writeText(link)
            .then(() => {
                openSnackbar({
                    type: "success",
                    text: "Link đã được sao chép vào clipboard",
                    position: "top",
                    duration: 3000,
                });
            })
            .catch((error) => {
                console.error("Error copying link: ", error);
                openSnackbar({
                    type: "error",
                    text: "Đã xảy ra lỗi khi sao chép link",
                    position: "top",
                    duration: 3000,
                });
            });
    };


    // Check if the user has already withdrawn a gift
    const checkWithdrawGift = async () => {
        try {


            const res = await axios.get(api.checkWithdrawGift(), {
                params: { phone: phoneUser },
            });

            setCheckWithdraw(res.data);

            switch (res.data.status) {
                case 1:
                    setStatusGiftUser(1);
                    break;
                case 2:
                    setStatusGiftUser(2);
                    break;
                case 3:
                    setStatusGiftUser(3);
                    break;
                case 0:
                    setStatusGiftUser(0);
                    setImageGift(`${baseUrl}${res.data.gift.image}`);
                    break;
                default:
                    // Handle unexpected status values if necessary
                    break;
            }
        } catch (error) {
            console.error(error);
        }
    };
    const UpdateIsUserGift = async () => {
        try {
            const result = await Swal.fire({
                title: "Xác nhận quà?",
                text: "Bạn đã nhận từ nhân viên chưa?",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                cancelButtonText: "Chưa nhận",
                confirmButtonText: "Đã nhận",
            });

            if (result.isConfirmed) {
                try {
                    const res = await requests({
                        url: api.update_is_user_gift(),
                        method: "POST",
                        data: { phone: phoneUser }
                    });

                    checkWithdrawGift();
                    if (res?.data.status === 1) {
                        checkWithdrawGift();
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Page className='page bg-main relative'>
            <div className="absolute top-7 left-0" onClick={() => navigate(-1)}>
                <Icon icon="zi-arrow-left" className="font-bold py-3 px-3" size={30} />
            </div>

            <img src={images.bg_top_right} className="absolute  top-0 right-0  w-[100px]" alt="" />

            <div className="absolute top-[50px] z-10 w-full flex justify-center left-0">
                {/* <img src={images.banner_mini_gamer} alt="" className='max-h-[150px]' onClick={() => setIsReceived(false)} /> */}
                <img src={images.banner_mini_gamer} alt="" className='max-h-[150px]' />
            </div>

            {
                !isReceived && (
                    <div className="absolute top-[55%] -translate-y-[50%] left-[50%] -translate-x-[50%] w-full flex justify-center">
                        {
                            name === 'nguoi-than-rut-qua' ? (
                                <img src={images.qua_nguoi_than} alt="" className='w-[70%]' />
                            ) : name === 'tu-rut-qua' ? (
                                <img src={images.qua_tu_rut} alt="" className='w-[70%]' />
                            ) : null
                        }

                    </div>

                )
            }


            {
                !isReceived && (
                    <div className="absolute bottom-10 w-full left-0 flex justify-center">
                        {
                            name === 'tu-rut-qua' ? (
                                <img src={images.btn_rut_qua} alt="" onClick={withdrawGift} />
                            ) : (
                                <img src={images.btn_gui_nguoi_than} alt="" onClick={handleReceivedGifts} />
                            )
                        }
                    </div>
                )
            }
            {isGiftSuccess && <FireworksEffect trigger={true} />}

            {
                isReceived && name === 'tu-rut-qua' && (
                    <>
                        <div className="absolute top-[55%] -translate-y-[50%] left-[50%] -translate-x-[50%] w-full flex justify-center">
                            <img src={imageGift} alt="" className=' animate-zoom-rotate h-[350px] object-contain' />
                        </div>

                        <div className="absolute bottom-10 w-full left-0 flex justify-center">
                            {
                                checkWithdraw?.type === 1 ? <img src={images.thong_diep} alt="" className=" object-contain" /> :
                                    <img src={images.button_nhan_qua} alt="" onClick={UpdateIsUserGift} />
                            }
                        </div>
                    </>
                )
            }

            {
                isReceived && name === 'nguoi-than-rut-qua' && (
                    <>


                        {
                            isCheckGiftRelative ? (<div className="absolute top-[55%] -translate-y-[50%] left-[50%] -translate-x-[50%] w-full flex justify-center px-5">
                                <div className="bg-[#C70D52] bg-opacity-35 w-full rounded py-10 px-5">
                                    <p className='text-blue-950 text-xl font-semibold underline'>Link gửi cho người thân</p>
                                    <div className="flex justify-center mt-5">
                                        <div
                                            className="py-3 p-2 rounded text-white text-center cursor-pointer text-xl font-semibold"
                                            style={{
                                                background: 'linear-gradient(357.61deg, #FC670A 1.94%, #FFF16A 94.52%)'
                                            }}
                                            onClick={handleCopyLink}
                                        >
                                            Sao chép link
                                        </div>
                                    </div>
                                </div>
                            </div>) : (
                                <div className="absolute top-[55%] -translate-y-[50%] left-[50%] -translate-x-[50%] w-full flex justify-center">
                                    <div className="relative w-[90%] flex justify-center">
                                        <img src={images.bg_form_sdt_nguoi_than} alt="" className='w-full' />
                                        <div className="absolute top-[60%] left-0 flex flex-col justify-center items-center w-full">
                                            <input type="text" className='w-[80%] h-[40px] rounded ring-amber-600 p-2 text-xl focus-visible:border-amber-600' onChange={(e) => setPhoneRelative(e.target.value)} />
                                            <img src={images.btb_gui} alt="" className='mt-3' onClick={createWithdrawGiftRelative} />
                                        </div>
                                    </div>
                                </div>
                            )
                        }


                    </>
                )
            }


        </Page>
    )

}
export default Gift;