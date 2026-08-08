import React from 'react';
import { Button, ButtonProps } from './Button';

export interface PrimaryButtonProps extends Omit<ButtonProps, 'variant'> {
  title?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, label, ...props }) => {
  return <Button variant="primary" label={title || label || ''} {...props} />;
};
