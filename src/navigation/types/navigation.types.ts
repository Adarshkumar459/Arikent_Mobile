import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyOTP: { email?: string; resetToken?: string; otpCode?: string } | undefined;
  CreateNewPassword: { resetToken?: string } | undefined;
  PasswordUpdated: undefined;
};

export type OnboardingStackParamList = {
  OrganizeTasks: undefined;
  StayOnTopTasks: undefined;
  TrackExpenses: undefined;
  AchieveGoals: undefined;
  ReadyToStart: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  DashboardLoading: undefined;
  DashboardEmpty: undefined;
  DashboardError: undefined;
  Reminders: undefined;
  ReminderDetails: { reminderId: string };
  SelectedDate: { date: string };
  Notes: undefined;
  Habits: undefined;
  CreateHabit: undefined;
  EditHabit: { habitId: string };
  HabitDetails: { habitId: string };
};

export type TasksStackParamList = {
  TaskList: undefined;
  AddTask: undefined;
  EditTask: { taskId: string };
  TaskDetails: { taskId: string };
  TaskFilter: undefined;
  TaskEmpty: undefined;
  TaskLoading: undefined;
  TaskError: undefined;
};

export type ExpensesStackParamList = {
  ExpenseList: undefined;
  AddExpense: undefined;
  EditExpense: { expenseId: string };
  ExpenseDetails: { expenseId: string };
  ExpenseAnalytics: undefined;
  ExpenseFilter: undefined;
  ExpenseEmpty: undefined;
  ExpenseLoading: undefined;
  ExpenseError: undefined;
};

export type GoalsStackParamList = {
  GoalList: undefined;
  AddGoal: undefined;
  EditGoal: { goalId: string };
  GoalDetails: { goalId: string };
  UpdateGoalProgress: { goalId: string };
  GoalCompleted: { goalId?: string } | undefined;
  GoalEmpty: undefined;
  GoalLoading: undefined;
  GoalError: undefined;
};

export type CalendarStackParamList = {
  Calendar: undefined;
  SelectedDate: { date: string };
  Reminders: undefined;
  AddReminder: undefined;
  ReminderDetails: { reminderId: string };
  RemindersEmpty: undefined;
};

export type NotesStackParamList = {
  NoteList: undefined;
  NoteDetails: { noteId: string };
  CreateNote: undefined;
  EditNote: { noteId: string };
  NoteSearch: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  PersonalInformation: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  Preferences: undefined;
  SecuritySettings: undefined;
  About: undefined;
  DeleteAccount: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  TasksTab: NavigatorScreenParams<TasksStackParamList>;
  ExpensesTab: NavigatorScreenParams<ExpensesStackParamList>;
  GoalsTab: NavigatorScreenParams<GoalsStackParamList>;
  NotesTab: NavigatorScreenParams<NotesStackParamList>;
  CalendarTab: NavigatorScreenParams<CalendarStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};
