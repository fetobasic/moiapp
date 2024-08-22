import React, { ReactElement, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Metrics } from 'App/Themes';
import { Button, RadioButtons } from './index';
import ModalWindow from './ModalWindow';

type Item = {
  value: string | number;
  label: any;
  icon?: ReactElement;
};

type Props = {
  value?: Item;
  placeholder?: string;
  header?: (() => ReactElement) | string;
  data: Item[];
  renderElement?: (item: Item[], onPress: (item: Item) => void, selectedProduct: Item) => ReactElement;
  onChange: (item: Item) => void;
  visible: boolean;
  animationType?: 'none' | 'slide' | 'fade' | undefined;
  transparent?: boolean;
  onCancel: () => void;
  confirmTitle?: string;
};

const SelectModal = ({ data = [], value, header, renderElement, onChange, visible, onCancel, confirmTitle }: Props) => {
  const [selectedProduct, setProduct] = useState<Item>(value || data[0]);

  const onCancelHandler = () => {
    setProduct(value || data[0]);
    onCancel();
  };

  return (
    <ModalWindow style={styles.content} visible={visible} header={header}>
      <>
        <ScrollView>
          {renderElement ? (
            renderElement(data, setProduct, selectedProduct)
          ) : (
            <RadioButtons data={data} selectedValue={selectedProduct} onChange={(item) => setProduct(item)} />
          )}
        </ScrollView>
        <View style={styles.buttons}>
          <Button
            testID="selectModalCancelPress"
            style={styles.btnLeft}
            inverse
            title="CANCEL"
            onPress={onCancelHandler}
          />
          <Button
            testID="selectModalApplyPress"
            style={styles.btnRight}
            title={confirmTitle || 'APPLY'}
            onPress={() => onChange(selectedProduct)}
          />
        </View>
      </>
    </ModalWindow>
  );
};

const styles = StyleSheet.create({
  content: {
    marginHorizontal: Metrics.halfMargin,
  },
  buttons: {
    marginHorizontal: Metrics.baseMargin,
    flexDirection: 'row',
  },
  btnLeft: {
    flex: 1,
    marginRight: Metrics.halfMargin,
  },
  btnRight: {
    flex: 1,
  },
});

export default SelectModal;
