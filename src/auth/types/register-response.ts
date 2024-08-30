export type LoginInfo = {
  user: UserInfo;
  account: AccountInfo;
  refresh_token?: string;
};

export type UserInfo = {
  id: string;
  name: string;
  login?: string;
  email?: string;
  image: string;
};

type AccountInfo = {
  type: string;
  provider: string;
  providerAccountId: string;
  access_token: string;
  expires_at: number;
};
