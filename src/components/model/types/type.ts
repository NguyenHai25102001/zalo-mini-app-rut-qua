export interface IUser {
    id: string;
    name: string;
    avatar: string;
    idByOA?: string | undefined;
    isSensitive?: boolean | undefined;
    followedOA?: boolean | undefined;
  }
  export interface ApiProp {
    url: string;
    method: string;
    data: any;
    params?: any;
  }
  