import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { colors, elevation } from '../../theme';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'large' | string;
  showText?: boolean;
  imageSource?: ImageSourcePropType;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = false,
  imageSource = require('../../../assets/arkient-logo.png'),
}) => {
  const getDimensions = () => {
    const normSize = size === 'large' ? 'lg' : size;
    switch (normSize) {
      case 'sm':
        return { box: 36, font: 16, icon: 20 };
      case 'lg':
        return { box: 72, font: 32, icon: 44 };
      case 'xl':
        return { box: 96, font: 44, icon: 60 };
      case 'md':
      default:
        return { box: 52, font: 24, icon: 32 };
    }
  };

  const { box, font } = getDimensions();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logoBox,
          { width: box, height: box, borderRadius: box * 0.28 },
        ]}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            style={{ width: box, height: box, borderRadius: box * 0.28 }}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.emblemContainer}>
            <Text style={[styles.emblemText, { fontSize: font }]}>A</Text>
            <View style={styles.sparkle} />
          </View>
        )}
      </View>
      {showText ? (
        <Text style={[styles.brandName, { fontSize: font * 0.95 }]}>ARKIENT</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...elevation.medium,
  },
  emblemContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  emblemText: {
    color: colors.surface,
    fontWeight: '800',
    letterSpacing: -1,
  },
  sparkle: {
    position: 'absolute',
    top: '18%',
    right: '20%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#93C5FD',
  },
  brandName: {
    marginTop: 8,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1.5,
  },
});
