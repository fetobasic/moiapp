import { WiFiList } from 'App/Types/Yeti';

export const getWifiListSection = (list: WiFiList[]) => {
  const saved: WiFiList[] = [];
  const unsaved: WiFiList[] = [];
  const section = [];

  list.forEach((item) => {
    if (item.saved) {
      saved.push(item);
    } else {
      unsaved.push(item);
    }
  });

  if (saved.length > 0) {
    section.push({
      title: 'My Saved Networks',
      data: saved,
    });
  }

  if (unsaved.length > 0) {
    section.push({
      title: saved.length > 0 ? 'Other Networks' : 'Networks',
      data: unsaved,
    });
  }

  return section;
};
