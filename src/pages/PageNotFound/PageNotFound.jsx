import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PageNotFound.module.css';
import { translations } from '../../constants/translations';
import { useSession } from '../../context/SessionContext';

const PageNotFound = () => {
  const { lang } = useSession();
  const t = translations[lang];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h1 className={styles.title}>404 - {t.notFound.title}</h1>
        <p className={styles.message}>{t.notFound.message}</p>
        <Link to="/" className={styles.link}>
          {t.notFound.backHome}
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;
