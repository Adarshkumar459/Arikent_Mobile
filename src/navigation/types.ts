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
  Goals: undefined;
  GoalDetails: { goalId: string };
  CreateGoal: undefined;
  EditGoal: { goalId: string };
  UpdateGoalProgress: { goalId: string };

  Habits: undefined;
  CreateHabit: undefined;
  HabitDetails: { habitId: string };
  EditHabit: { habitId: string };
  HabitHistory: { habitId: string };
  HabitStats: { habitId: string };

  Calendar: undefined;
  SelectedDate: { date: string };
  CreateEvent: undefined;
  EventDetails: { eventId: string };
  EditEvent: { eventId: string };

  Reminders: undefined;
  CreateReminder: undefined;
  ReminderDetails: { reminderId: string };
  EditReminder: { reminderId: string };

  Expenses: undefined;
  CreateExpense: undefined;
  ExpenseDetails: { expenseId: string };
  EditExpense: { expenseId: string };
  ExpenseAnalytics: undefined;
  FilterExpenses: undefined;

  Notes: undefined;
  CreateNote: undefined;
  NoteDetails: { noteId: string };
  EditNote: { noteId: string };
  NoteSearch: undefined;
  NoteCategories: undefined;
};

export type RootStackParamList = AuthStackParamList & MainStackParamList;
