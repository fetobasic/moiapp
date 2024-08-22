export const getBatteryLevels = (level: number) => {
  const ratio = 180 / 100;
  const paddindRatio = 0.08;
  const paddingValue = paddindRatio * level;

  const rotation = level * ratio;
  const textRotation = -level * ratio;
  const padding = level > 50 ? 8 - paddingValue : paddingValue;

  return {
    rotation,
    padding,
    textRotation,
  };
};
