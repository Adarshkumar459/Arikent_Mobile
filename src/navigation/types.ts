export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { devToken?: string } | undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  AccountSettings: undefined;
};

export type RootStackParamList = AuthStackParamList & MainStackParamList;
