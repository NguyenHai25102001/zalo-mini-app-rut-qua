import React, { Suspense, useEffect, useState } from "react";
import { List, Page, Icon, useNavigate, useSnackbar, Sheet as ZMPSheet } from "zmp-ui";
import UserCard from "components/user-card";
import { images } from "components/assets/images";
import FormCode from "components/form_code";
import WithdrawGift from "components/withdrawGift";
import { AppContext } from "components/context/MyContext";
import {
  followOA,
  getAccessToken,
  getPhoneNumber,
  getSetting,
  requestSendNotification,
  requestCameraPermission
} from "zmp-sdk/apis";
import axios from "axios";
import { api, app_id, baseUrl, IdOa, requests, secret_key } from "api";
import { GetSettingReturn } from "zmp-sdk";
import { Link } from "react-router-dom";
import { CheckWithdrawal } from "types/types";
import Swal from "sweetalert2";

const HomePage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [is_checked_code, setIsCheckedCode] = React.useState(false);
  const [code, setCode] = React.useState<string>("");
  const [showPhone, setShowPhone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFollow, setShowFollow] = useState<boolean>(false);
  const { user, phoneUser, setPhoneUser, setUser } = React.useContext(AppContext);
  const [statusGiftUser, setStatusGiftUser] = React.useState<number | null>(null);
  const [imageGift, setImageGift] = React.useState<string>("");
  const [checkWithdraw, setCheckWithdraw] = React.useState<CheckWithdrawal>();

  const handleDrawGifts = (name: string) => {
    navigate("/gift", { state: { name, code } });
  };

  const { openSnackbar, setDownloadProgress, closeSnackbar } = useSnackbar();

  const handleCheckCode = async (code: string) => {
    const { authSetting } = await getSetting({});

    if (!authSetting["scope.userPhonenumber"]) {
      setShowPhone(true);
      return;
    }
    if (!code) {
      openSnackbar({
        type: "error",
        text: "Vui lòng nhập mã hóa đơn",
        position: "top",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await axios.get(api.checkInvoice(), {
        params: {
          code_invoice: code,
          phone: phoneUser,
        },
      });

      if (response.data.data !== 1) {
        openSnackbar({
          type: "error",
          text: response.data.message,
          position: "top",
          duration: 3000,
        });
        // checkWithdrawGift
      } else {
        setCode(code);
        setIsCheckedCode(true);
      }
    } catch (error) {
      console.error("Error checking invoice code:", error);
      openSnackbar({
        type: "error",
        text: "Đã xảy ra lỗi khi kiểm tra mã hóa đơn",
        position: "top",
        duration: 3000,
      });
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

  useEffect(() => {
    console.log(checkWithdraw);

  }, [checkWithdraw]);



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
          setCode(res.data.info_withdraw.code_invoice_kiotviet);
          setIsCheckedCode(true);
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
      // setPhoneUser("0354583362");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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



  useEffect(() => {
    if (user?.followedOA === false && !!phoneUser) {
      setShowFollow(true);
    }
  }, [phoneUser, user?.followedOA]);


  useEffect(() => {
    if (phoneUser) {
      checkWithdrawGift();
    }
  }, [phoneUser]);



  const checkIsUserGift = async () => {
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
    <Page className="page bg-main relative ">
      {/* bottom left */}
      <img src={images.bg_bottom_left} className="absolute  bottom-0 left-0 w-[100px]" alt="" />
      <img src={images.bg_bottom_right} className="absolute  bottom-0 right-0  w-[100px]" alt="" />
      <img src={images.bg_top_right} className="absolute  top-0 right-0  w-[100px]" alt="" />

      <div className="absolute top-[50px] z-10 w-full flex justify-center left-0">
        <img src={images.banner_mini_gamer} alt="" className="w-[85%]" />
      </div>


      {
        statusGiftUser === 1 && (
          is_checked_code ?
            <WithdrawGift handleDrawGifts={handleDrawGifts} /> :
            <FormCode handleCheckCode={handleCheckCode} />
        )
      }
      {
        statusGiftUser === 3 && (
          is_checked_code &&
          <WithdrawGift handleDrawGifts={handleDrawGifts} />
        )
      }


      {
        statusGiftUser === 2 && (
          <>
            <div className="absolute top-[50%] left-0 w-full -translate-y-[50%] overflow-auto p-4">
              <div className="text-center flex justify-center">
                <img src={images.box_gift} alt="" className="shake" />
              </div>
              <p className="text-center element text-4xl w-full font-semibold" style={{ fontFamily: 'SVN-KongaPro' }}>
                Đang chờ người thân
                <br />
                của bạn rút quà...</p>

            </div>

            <div className="absolute bottom-6 left-0 w-full flex justify-center ">
              <img src={images.btn_lam_moi} alt="" className=" bject-contain" onClick={checkWithdrawGift} />
            </div>

          </>
        )
      }
      {
        statusGiftUser === 0 && (
          <>
            <div className="absolute top-[55%] left-0 w-full -translate-y-[50%] overflow-auto p-4">
              <div className="text-center flex justify-center">
                <img src={imageGift} alt="" className="h-[450px]" />

              </div>

            </div>

            {
              checkWithdraw?.type === 1 && (
                <div className="absolute bottom-3 left-0 w-full flex justify-center ">
                  <img src={images.thong_diep} alt="" className=" bject-contain" />
                </div>
              )
            }
            {
              checkWithdraw?.type === 0 && (
                <div className="absolute bottom-3 left-0 w-full flex justify-center ">
                  <img src={images.button_nhan_qua} alt="" className=" bject-contain" onClick={checkIsUserGift} />
                </div>
              )
            }


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

      {/* <div className="mt-10 absolute bottom-3 left-0">
        <Link to="/gift-relatives?phone=1234567890&&code=HD539166">gift relative</Link>
      </div> */}

    </Page>


  );
};

export default HomePage;
