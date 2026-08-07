export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { devToken?: string } | undefined;
};

export type MainStackParamList = {
  Home: undefined;
  CreateTask: undefined;
  TaskDetails: { taskId: string };
  EditTask: { taskId: string };
  Profile: undefined;
  AccountSettings: undefined;
};

export type RootStackParamList = AuthStackParamList & MainStackParamList;
