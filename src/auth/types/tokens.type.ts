export type Tokens = {
  accessToken: AccessToken;
  refreshToken: string;
};

export type AccessToken = {
  access_token: string;
  expires_at: number;
};
