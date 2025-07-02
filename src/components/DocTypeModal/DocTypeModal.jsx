import React, { useContext } from "react";
import styles from "./DocTypeModal.module.css";
import { useSession } from "../../context/SessionContext";
import { translations } from "../../constants/translations";
import idCardImg from "../../assets/images/idcard.jpg";
import passportImg from "../../assets/images/passport.jpg";
import resumeImg from "../../assets/images/cv.png";
import diplomaImg from "../../assets/images/diploma.jpg";
import bankImg from "../../assets/images/card.jpg";
import { ThemeContext } from "../../context/ThemeContext";
import socialSecurityImg from "../../assets/images/ss.jpg";

const docTypes = [
  { id: "idcard", labelKey: "idCard", image: idCardImg },
  { id: "passport", labelKey: "passport", image: passportImg },
  { id: "resume", labelKey: "resume", image: resumeImg },
  { id: "diploma", labelKey: "diploma", image: diplomaImg },
  { id: "bank", labelKey: "bankDoc", image: bankImg },
  { id: "social_security", labelKey: "social_security", image: socialSecurityImg },
];
const DocTypeModal = ({ onClose }) => {
  const {
    lang,
    docType,
    setUploadedFiles,
    setExtractedData,
    setSelectedCards,
    setDetectedCountries,
    setFilterMode,
    setSelectedCountry,
    setSearchTerm,
    setDocType
  } = useSession();
  
  const t = translations[lang];
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const handleClickOutside = (e) => {
    if (e.target.classList.contains(styles.overlay)) {
      onClose();
    }
  };

  return (
    <div className={`${styles.overlay} ${isDark ? styles.dark : ""}`} onClick={handleClickOutside}>
      <div className={`${styles.modal} ${isDark ? styles.dark : ""}`}>
        <h3 className={`${styles.title} ${isDark ? styles.darkTitle : ""}`}>
          {t.chooseDocType}
        </h3>
        <div className={styles.typeGrid}>
          {docTypes.map((type) => (
            <div
              key={type.id}
              className={`${styles.typeCard} ${docType === type.id ? styles.active : ""}`}
              onClick={() => {
                setDocType(type.id);
                setExtractedData(null);
                setUploadedFiles([]);
                setSelectedCards([]);
                setDetectedCountries([]);
                setFilterMode("Manually");
                setSelectedCountry("anywhere");
                setSearchTerm("");
                onClose();
              }}
            >
              <img src={type.image} alt={t[type.labelKey]} className={styles.cardImage} />
              <div className={styles.label}>{t[type.labelKey]}</div>
            </div>
          ))}
        </div>
        <button className={styles.closeBtn} onClick={onClose}>{t.cancel}</button>
      </div>
    </div>
  );
};

export default DocTypeModal;
