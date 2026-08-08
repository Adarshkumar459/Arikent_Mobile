import React from 'react';
import { Button, ButtonProps } from './Button';

export interface OutlineButtonProps extends Omit<ButtonProps, 'variant'> {
  title?: string;
}

export const OutlineButton: React.FC<OutlineButtonProps> = ({ title, label, ...props }) => {
  return <Button variant="secondary" label={title || label || ''} {...props} />;
};
