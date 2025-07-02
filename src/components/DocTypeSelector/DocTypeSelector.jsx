import React, { useContext } from "react";
import styles from "./DocTypeSelector.module.css";
import { FiEdit2 } from "react-icons/fi";
import { ThemeContext } from "../../context/ThemeContext";
import { useSession } from "../../context/SessionContext";
import socialSecurityImg from "../../assets/images/ss.jpg";
import idCardImg from "../../assets/images/idcard.jpg";
import passportImg from "../../assets/images/passport.jpg";
import resumeImg from "../../assets/images/cv.png";
import diplomaImg from "../../assets/images/diploma.jpg";
import bankImg from "../../assets/images/card.jpg";

const docTypes = {
  idcard: {
    label: "ID Card",
    image: idCardImg
  },
  passport: {
    label: "Passport",
    image: passportImg,
  },
  resume: {
    label: "Resume",
    image: resumeImg,
  },
  diploma: {
    label: "Diploma",
    image: diplomaImg,
  },
  bank: {
    label: "Bank Doc",
    image: bankImg,
  },
   social_security: {
    label: "Social Security",
    image: socialSecurityImg,
  },
};

const DocTypeSelector = ({ onEdit, forceFixedHeight = false }) => {
  const { docType } = useSession();
  const { label, image } = docTypes[docType] || docTypes["idcard"];
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div
      className={`${styles.card} ${forceFixedHeight ? styles.fixedHeight : ""} ${isDark ? styles.dark : ""}`}
    >
      <div className={styles.imageWrapper}>
        <img src={image} alt={label} className={styles.bgImage} />
        <button className={styles.editBtn} onClick={onEdit} title="Change document type">
          <FiEdit2 />
        </button>
      </div>
    </div>
  );
};

export default DocTypeSelector;
