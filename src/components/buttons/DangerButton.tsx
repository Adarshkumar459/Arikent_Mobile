import React from 'react';
import { Button, ButtonProps } from './Button';

export interface DangerButtonProps extends Omit<ButtonProps, 'variant'> {
  title?: string;
}

export const DangerButton: React.FC<DangerButtonProps> = ({ title, label, ...props }) => {
  return <Button variant="danger" label={title || label || ''} {...props} />;
};
