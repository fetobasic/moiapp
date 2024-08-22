import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { FileSystem } from 'react-native-file-access';
import Share from 'react-native-share';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { HeaderSimple as Header, Pressable } from 'App/Components';
import { useMount } from 'App/Hooks';
import { fileLogger } from 'App/Services/FileLogger';
import { showConfirm } from 'App/Services/Alert';

import WarningIcon from 'App/Images/Icons/warn.svg';

type Props = {
  defaultFiles?: string[];
};

const FileLogger = (props: Props) => {
  const [files, setFiles] = useState<string[]>(props.defaultFiles || []);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useMount(() => {
    FileSystem.ls(fileLogger.FILES_DIR).then(setFiles);
  });

  const deleteFile = async () => {
    if (!selectedFile) {
      return;
    }

    await FileSystem.unlink(`${fileLogger.FILES_DIR}/${selectedFile}`);
    setFiles(files.filter((file) => file !== selectedFile));
    setSelectedFile(null);
  };

  const deleteAllFiles = async () => {
    files.forEach(async (file) => {
      await FileSystem.unlink(`${fileLogger.FILES_DIR}/${file}`);
    });
    setFiles([]);
    setSelectedFile(null);
  };

  const shareFile = async () => {
    if (!selectedFile) {
      return;
    }

    Share.open({
      filename: selectedFile,
      type: 'text/plain',
      url: `file://${fileLogger.FILES_DIR}/${selectedFile}`,
    });
  };

  const renderItem = ({ item }: { item: string }) => {
    return (
      <Pressable testID={`selectFile_${item}`} style={styles.rowSection} onPress={() => setSelectedFile(item)}>
        <View style={[styles.check, selectedFile === item && styles.checkSelected]}>
          {selectedFile === item && <View style={styles.round} />}
        </View>
        <Text style={styles.textFileName}>{item}</Text>
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <View style={styles.sectionEmty}>
      <Text style={Fonts.font.condensed.h3}>No files found</Text>
    </View>
  );

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Logger Files" />
      <FlatList style={styles.container} data={files} renderItem={renderItem} ListEmptyComponent={renderEmpty} />
      <View style={styles.bottomSection}>
        <Pressable
          testID="deleteFile"
          disabled={!selectedFile}
          style={styles.button}
          onPress={() =>
            showConfirm(
              'Delete',
              `Are you sure you want to delete ${selectedFile}?`,
              deleteFile,
              undefined,
              undefined,
              false,
              <WarningIcon />,
            )
          }>
          <Text style={[styles.textFileName, !selectedFile && styles.buttonDisabled]}>Delete</Text>
        </Pressable>
        <Pressable
          testID="deleteAllFiles"
          disabled={!files.length}
          style={[styles.button, !files.length && styles.buttonDisabled]}
          onPress={() =>
            showConfirm(
              'Delete All',
              'Are you sure you want to delete all files',
              deleteAllFiles,
              undefined,
              undefined,
              false,
              <WarningIcon />,
            )
          }>
          <Text style={styles.textFileName}>Delete All</Text>
        </Pressable>
        <Pressable testID="shareBtn" disabled={!selectedFile} style={styles.button} onPress={() => shareFile()}>
          <Text style={[styles.textFileName, !selectedFile && styles.buttonDisabled]}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.marginSection,
  },
  sectionEmty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Metrics.bigMargin * 2,
  },
  rowSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Metrics.marginSection,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.transparentWhite('0.87'),
    marginRight: Metrics.baseMargin,
  },
  checkSelected: {
    borderColor: Colors.green,
  },
  round: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
  },
  textFileName: {
    ...Fonts.style.subtitleOne,
  },
  bottomSection: {
    flexDirection: 'row',
    marginBottom: Metrics.marginSection,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Metrics.marginSection,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default FileLogger;
