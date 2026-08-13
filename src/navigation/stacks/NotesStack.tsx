import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NotesStackParamList } from '../types/navigation.types';
import { NotesScreen } from '../../screens/notes/NotesScreen';
import { NoteDetailsScreen } from '../../screens/notes/NoteDetailsScreen';
import { CreateNoteScreen } from '../../screens/notes/CreateNoteScreen';
import { EditNoteScreen } from '../../screens/notes/EditNoteScreen';
import { NoteSearchScreen } from '../../screens/notes/NoteSearchScreen';
import { colors } from '../../theme';

const Stack = createNativeStackNavigator<NotesStackParamList>();

export const NotesStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="NoteList"
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
      }}
    >
      <Stack.Screen name="NoteList" component={NotesScreen} />
      <Stack.Screen name="NoteDetails" component={NoteDetailsScreen} />
      <Stack.Screen name="CreateNote" component={CreateNoteScreen} />
      <Stack.Screen name="EditNote" component={EditNoteScreen} />
      <Stack.Screen name="NoteSearch" component={NoteSearchScreen} />
    </Stack.Navigator>
  );
};
