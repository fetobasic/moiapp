import React from 'react';
import { View, Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { Colors, Fonts, Metrics } from 'App/Themes';
import { Pressable } from 'App/Components';
import { setToClipboard } from 'App/Services/Clipboard';

export type Row = {
  title: string;
  description?: string;
  style?: StyleProp<TextStyle>;
  iconSettings?: { icon: React.ReactNode; handlePress: () => void };
  useClipboard?: boolean;
};

export type InformationRowProps = {
  rows: Array<Row>;
};

function SecretSettings({ rows }: InformationRowProps) {
  return (
    <View>
      {rows.map(({ title, description, iconSettings, style: textStyle, useClipboard }, ind) => (
        <Pressable
          disabled={!useClipboard}
          onPress={() => setToClipboard(description)}
          style={[styles.container, ind === 0 && styles.firstRow, ind === rows.length - 1 && styles.lastRow]}>
          <View style={[styles.textContainer]}>
            <Text style={[styles.text]} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          </View>
          <View style={[styles.rightSideContainer]}>
            {iconSettings ? (
              <Pressable onPress={iconSettings.handlePress} style={styles.btn}>
                {iconSettings.icon}
              </Pressable>
            ) : (
              <Text style={[styles.text, textStyle]}>{description}</Text>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: Metrics.halfMargin,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  firstRow: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  lastRow: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  btn: {
    padding: 3,
  },
  textContainer: { flex: 1, justifyContent: 'center' },
  rightSideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    ...Fonts.font.base.bodyTwo,
  },
});

export default SecretSettings;
