import React from 'react';
import { Button, ButtonProps } from './Button';

export interface SecondaryButtonProps extends Omit<ButtonProps, 'variant'> {
  title?: string;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({ title, label, ...props }) => {
  return <Button variant="secondary" label={title || label || ''} {...props} />;
};
