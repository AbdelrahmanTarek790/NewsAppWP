import React from 'react';
import { View, ViewProps } from 'react-native';
import { Text } from '@/components/ui/text';

export interface BadgeProps extends ViewProps {
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ className = '', children, style, ...props }) => {
  return (
    <View 
      className={`inline-flex items-center rounded-full px-2 py-1 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
};

export interface BadgeTextProps {
  className?: string;
  children?: React.ReactNode;
}

export const BadgeText: React.FC<BadgeTextProps> = ({ className = '', children }) => {
  return (
    <Text className={`text-xs font-medium ${className}`}>
      {children}
    </Text>
  );
};