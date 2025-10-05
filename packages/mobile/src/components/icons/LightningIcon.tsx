import React from 'react';
import { Svg, Path, Circle } from 'react-native-svg';

interface LightningIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const LightningIcon: React.FC<LightningIconProps> = ({
  width = 24,
  height = 24,
  color = '#FBB040',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path
        d="M13 2L3 14H11L9 22L21 10H13L15 2Z"
        fill="white"
      />
    </Svg>
  );
};