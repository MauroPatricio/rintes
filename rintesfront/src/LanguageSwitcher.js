import React, { useContext, useEffect, useCallback } from 'react';
import i18n from 'i18next';
import { Store } from './Store';

export default function LanguageSwitcher() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { changelng } = state;

  const handleChangeLanguage = useCallback((event) => {
    let selectedLanguage = '';
    if (event && event.target) {
      selectedLanguage = event.target.value;
      ctxDispatch({ type: 'CHANGE_LNG', payload: selectedLanguage });
    } else {
      selectedLanguage = changelng;
    }

    i18n.changeLanguage(selectedLanguage);
  }, [ctxDispatch, changelng]);

  useEffect(() => {
    handleChangeLanguage();
  }, [changelng, handleChangeLanguage]);

  return (
    <select onChange={handleChangeLanguage} style={{ textAlign: 'center' }}>
      <option value="pt">Português</option>
      <option value="en">English</option>
    </select>
  );
}
