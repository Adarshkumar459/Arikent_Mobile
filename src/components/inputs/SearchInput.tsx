import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { TextInput, TextInputProps } from './TextInput';
import { typography, colors } from '../../theme';

export type SearchInputProps = TextInputProps;

export const SearchInput: React.FC<SearchInputProps> = (props) => {
  return (
    <TextInput
      placeholder="Search..."
      leftIcon={<Text style={styles.searchIcon}>🔍</Text>}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  searchIcon: { ...typography.body, color: colors.textSecondary },
});
