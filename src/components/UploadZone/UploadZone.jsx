import React, { useRef, useContext } from "react";
import styles from "./UploadZone.module.css";
import { useSession } from "../../context/SessionContext";
import { translations } from "../../constants/translations";
import { ThemeContext } from "../../context/ThemeContext";
import { PiEyeClosed } from "react-icons/pi";
import { FaRegEye } from "react-icons/fa";

const UploadZone = ({ onFilesSelected, forceFixedHeight = false }) => {
  const fileInputRef = useRef();
  const { lang, docType, uploadedFiles, setUploadedFiles, showList, setShowList, setExtractedData, setSelectedCards, setDetectedCountries, setFilterMode, setSelectedCountry, setSearchTerm } = useSession();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const t = translations[lang];

  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setExtractedData(null);
    setSelectedCards([]);
    setDetectedCountries([]);
    setFilterMode("Manually");
    setSelectedCountry("anywhere");
    setSearchTerm("");
    setUploadedFiles(selectedFiles);
    onFilesSelected?.(selectedFiles);
    setShowList(true);
  };
  const fileAccept = docType === "resume"
    ? ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    : ".jpg,.jpeg,.png,.pdf,.doc,.docx,image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";


  return (
    <div className={`${styles.uploadZone} ${isDark ? styles.dark : ""} ${forceFixedHeight ? styles.fixedHeight : ""}`}>
      <div className={styles.emoji}>📤</div>
      <p className={styles.whiteSpaceText}>{t.uploadText}</p>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={fileAccept}
        style={{ display: "none" }}
        onChange={handleChange}
      />


      <div className={styles.buttonRow}>
        <button
          className={`${styles.uploadButton} ${isDark ? styles.darkButton : ""}`}
          onClick={() => fileInputRef.current.click()}
        >
          {t.uploadBtn}
        </button>

        <button
          className={`${styles.eyeToggle} ${showList ? styles.active : ""} ${isDark ? styles.darkeyeToggle : ""}`}
          onClick={() => setShowList((prev) => !prev)}
          title={showList ? t.hideFiles : t.showFiles}
        >
          {showList ? <FaRegEye /> : <PiEyeClosed />}
        </button>
      </div>

      {uploadedFiles.length > 0 && (
        <>

          {showList && (
            <ul className={styles.fileList}>
              {uploadedFiles.map((file, idx) => (
                <li key={idx}>{`${idx + 1}- ${file.name}`}</li>
              ))}
            </ul>
          )}
        </>
      )}


    </div>
  );
};

export default UploadZone;
