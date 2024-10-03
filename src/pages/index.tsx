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
import { api, app_id, IdOa, secret_key } from "api";
import { GetSettingReturn } from "zmp-sdk";
import { Link } from "react-router-dom";

const HomePage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [is_checked_code, setIsCheckedCode] = React.useState(false);
  const [code, setCode] = React.useState<string>("tesst");
  const [showPhone, setShowPhone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFollow, setShowFollow] = useState<boolean>(false);
  const { user, phoneUser, setPhoneUser, setUser } = React.useContext(AppContext);


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

  // Check if the user has already withdrawn a gift
  const checkWithdrawGift = async () => {
    try {
      const res = await axios.get(api.checkWithdrawGift(), {
        params: { phone: phoneUser },
      });

      if (res.data.status !== 1) {
        navigate("/gift", { state: { name: res.data.data.name, code: res.data.data.code } });
        openSnackbar({
          type: "warning",
          text: "Bạn đã rút quà",
          position: "top",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    checkWithdrawGift();
  }, [phoneUser]);

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
  } ,[]);


 
  useEffect(() => {
    if (user?.followedOA === false && !!phoneUser) {
      setShowFollow(true);
    }
  }, [phoneUser, user?.followedOA]);


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
        is_checked_code ? <WithdrawGift handleDrawGifts={handleDrawGifts} /> :
          <FormCode handleCheckCode={handleCheckCode} />
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
