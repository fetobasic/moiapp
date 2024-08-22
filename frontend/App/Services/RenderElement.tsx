import React from 'react';

export default function renderElement(Element: React.ReactElement): () => React.ReactElement {
  return () => Element;
}
