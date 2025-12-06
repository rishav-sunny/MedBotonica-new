import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

interface LogoutSliderProps {
  onLogout: () => void;
}

export const LogoutSlider = ({ onLogout }: LogoutSliderProps) => {
  const sliderWidth = width - 40;
  const knobSize = 54;
  const maxSlide = sliderWidth - knobSize - 8;
  
  const panX = useRef(new Animated.Value(0)).current;
  const opacity = panX.interpolate({
    inputRange: [0, maxSlide],
    outputRange: [1, 0],
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const clampedX = Math.max(0, Math.min(gesture.dx, maxSlide));
        panX.setValue(clampedX);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > maxSlide * 0.85) {
          Animated.timing(panX, {
            toValue: maxSlide,
            duration: 200,
            useNativeDriver: false,
          }).start(onLogout);
        } else {
          Animated.spring(panX, {
            toValue: 0,
            tension: 80,
            friction: 8,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.Text style={[styles.text, { opacity }]}>
          slide to log out
        </Animated.Text>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.knob, { transform: [{ translateX: panX }] }]}
        >
          <Text style={styles.arrow}>→</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  track: {
    height: 58,
    backgroundColor: "#DCECCE",
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  text: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#1B4332",
    letterSpacing: -0.4,
  },
  knob: {
    width: 54,
    height: 50,
    backgroundColor: "#2ECC71",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  arrow: {
    fontSize: 26,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});