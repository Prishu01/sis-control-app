import React from 'react';
import { Pressable, Animated, PressableProps, StyleProp, ViewStyle } from 'react-native';

interface ScalePressableProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleValue?: number;
}

export const ScalePressable = ({ 
  children, 
  style, 
  scaleValue = 0.96,
  ...props 
}: ScalePressableProps) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: scaleValue,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};
