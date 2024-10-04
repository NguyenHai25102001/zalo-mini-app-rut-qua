import { images } from 'components/assets/images';
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Page, useSnackbar, Sheet as ZMPSheet } from 'zmp-ui';
import successSound from '../components/assets/audio/successSound.mp3';
import FireworksEffect from 'components/FireworksEffect ';
import { api, app_id, baseUrl, IdOa, requests, secret_key } from "api";
import { AppContext } from 'components/context/MyContext';
import axios from 'axios';
import { followOA, getAccessToken, getPhoneNumber, getSetting } from 'zmp-sdk/apis';


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

    const phone = searchParams.get("phone");
    const [code, setCode] = React.useState<string>("");


    const [showFollow, setShowFollow] = useState<boolean>(false);
    const { user, phoneUser, setPhoneUser, setUser } = React.useContext(AppContext);
    const [statusGiftUser, setStatusGiftUser] = React.useState<number | null>(null);
    const [showPhone, setShowPhone] = useState(false);
    const [loading, setLoading] = useState(true);


    // Function to play success sound
    const playSuccessSound = () => {
        const sound = new Audio(successSound);
        sound.play();
    };

    useEffect(() => {
        if (phone !== phoneUser) {
            setCheckWithdraw(true);
        }

    }, [phone, phoneUser]);

    // Function to handle gift withdrawal
    const withdrawGift = async () => {
        const { authSetting } = await getSetting({});

        if (!authSetting["scope.userPhonenumber"]) {
            setShowPhone(true);
            return;
        }

        if (checkWithdraw || phone !== phoneUser) {
            openSnackbar({
                type: "warning",
                text: "Số điện thoại không khớp với người gửi quà",
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
                    code_invoice: code,
                },
            });
            console.log("response", response);


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

    const handleFollow = async () => {
        try {
            followOA({
                id: IdOa,
                success: followOARequest,
                fail: (err) => console.error("Thất bại", err),
            });
        } catch (error) {
            console.error(error);
        }
    };



    // Follow OA API call
    const followOARequest = async () => {
        try {
            setLoading(true);
            const res = await axios.post(api.followOA(), {
                phone: phoneUser,
                type: '1',
                app_id,
            });

            if (res.data.status) {
                openSnackbar({
                    type: "success",
                    text: "Theo dõi thành công",
                    position: "top",
                    duration: 3000,
                });
                setUser({ ...user, followedOA: true });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    const handleLogin = async () => {
        try {
            setShowPhone(false);
            setLoading(true);
            const accessToken = await getAccessToken({});
            const resToken = await getPhoneNumber();
            const response = await axios.get("https://graph.zalo.me/v2.0/me/info", {
                headers: {
                    access_token: accessToken,
                    code: resToken.token,
                    secret_key,
                },
            });

            const phoneNumber = String(response.data?.data?.number).replace("84", "0");
            checkFollowStatus(phoneNumber);
            setPhoneUser(phoneNumber);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const checkFollowStatus = async (phone: string) => {
        try {
            const res = await axios.get(api.checkFollow(), {
                params: {
                    phone,
                    app_id,
                },
            });

            if (res.data.status) {
                setUser({ ...user, followedOA: true });
                setShowFollow(false);
            } else {
                console.log("Chưa follow");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getSettingUser = async () => {
        try {
            const { authSetting } = await getSetting({});

            if (authSetting["scope.userPhonenumber"]) {
                handleLogin();
            }
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        getSettingUser();
    }, []);



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



            <ZMPSheet
                mask
                visible={showPhone}
                title={""}
                onClose={() => setShowPhone(false)}
                swipeToClose
                height={"50%"}
            >
                <div className="flex flex-col items-center h-full w-full py-5  border-t border-[#EDEDED]">

                    <p className=" text-base font-bold text-black my-5">
                        Cấp quyền truy cập số điện thoại
                    </p>
                    <p className="w-[90%] text-center text-base text-black font-normal leading-7 flex-1">
                        Chúng tôi cần bạn cung cấp số điện thoại để tham gia chương trình.
                        <br />
                        Chúng tôi sẽ liên hệ với bạn qua số điện thoại bạn cung cấp để nhận phần thưởng.

                    </p>
                    <div
                        className="bg-[#3669C9] w-[90%] flex justify-center items-center py-3 rounded-[10px]"
                        onClick={() => handleLogin()}
                    >
                        <p className="text-sm font-medium text-white text-center">
                            Cho phép
                        </p>
                    </div>
                </div>
            </ZMPSheet>

            <ZMPSheet
                mask
                visible={showFollow}
                title={""}
                onClose={() => setShowFollow(false)}
                swipeToClose
                height={"50%"}
            >
                <div className="flex flex-col items-center  gap-5 h-full w-full py-5  border-t border-[#EDEDED]">

                    <p className="text-base font-semibold mt-1">Theo dõi chúng tôi</p>
                    <p className="w-[90%] text-base text-center flex-1 mt-2">
                        Để nhận thông báo về chương trình và các ưu đãi hấp dẫn
                    </p>
                    <div
                        className="bg-[#3669C9] w-[90%] flex justify-center items-center py-3 rounded-[10px]"
                        onClick={() => {
                            setShowFollow(false);
                            handleFollow();
                        }}
                    >
                        <p className="text-sm font-medium text-white text-center">
                            Follow OA
                        </p>
                    </div>
                </div>
            </ZMPSheet>

        </Page>
    )

}
export default GiftRelative;