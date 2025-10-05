import React from 'react';
import { Svg, Path, Circle } from 'react-native-svg';

interface BitcoinIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const BitcoinIcon: React.FC<BitcoinIconProps> = ({
  width = 24,
  height = 24,
  color = '#F7931A',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 7H16V9H14V11H16V13H14V15H16V17H13V16H11V17H8V15H10V13H8V11H10V9H8V7H11V8H13V7ZM11 9V11H13V9H11ZM11 13V15H13V13H11Z"
        fill="white"
      />
    </Svg>
  );
};