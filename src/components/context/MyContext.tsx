import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { IUser } from 'components/model/types/type';
import { getUserInfo } from "zmp-sdk/apis";


interface AppContextType {
    user: IUser;
    phoneUser: string | null;
    setPhoneUser: React.Dispatch<React.SetStateAction<string | null>>;
    setUser: React.Dispatch<React.SetStateAction<IUser>>;
  }
  const initialAppContext: AppContextType = {
    user: {
      id: "",
      avatar: "",
      name: "",
      idByOA: "",
      isSensitive: false,
      followedOA: false,
    },
    phoneUser: "",
    setPhoneUser: () => null,
    setUser: () => null,
  };
// Tạo context với giá trị mặc định
// Tạo provider component
export const AppContext = createContext<AppContextType>(initialAppContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser>(initialAppContext.user);
  const [phoneUser, setPhoneUser] = useState("");
  const getUser = async () => {
    try {
      const { userInfo } = await getUserInfo({
        autoRequestPermission: true,
      });
      if (userInfo) {
        setUser(userInfo);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getUser();
  }, []);
  return (
    <AppContext.Provider value={{ user, phoneUser, setPhoneUser, setUser }}>
      {children}
    </AppContext.Provider>
  );
};