import { Animated, TouchableWithoutFeedback } from "react-native";
import { useRef } from "react";

export default function AnimatedPressable({ onPress, children, style, disabled, ...rest }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 18 });
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 12 });
  };
  return (
    <TouchableWithoutFeedback
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...rest}
    >
      <Animated.View style={[ style, { transform:[{ scale }] } ]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}