import React from 'react';
import { Svg, Path, Circle } from 'react-native-svg';

interface StarknetIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const StarknetIcon: React.FC<StarknetIconProps> = ({
  width = 24,
  height = 24,
  color = '#6B46C1',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path
        d="M12 4L4 8V16L12 20L20 16V8L12 4Z"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <Path d="M12 8L8 10V14L12 16L16 14V10L12 8Z" fill="white" />
    </Svg>
  );
};