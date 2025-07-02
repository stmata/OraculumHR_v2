import React, { useContext, useEffect, useState } from "react";
import styles from "./DiplomaResult.module.css";
import { ThemeContext } from "../../../context/ThemeContext";
import { useSession } from "../../../context/SessionContext";
import { translations } from "../../../constants/translations";

const DiplomaResult = ({ data }) => {
  const {
    selectedCards,
    setSelectedCards,
    filterMode,
    searchTerm,
    uploadedFiles,
    setExtractedData,
    docType,
    lang,
  } = useSession();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const t = translations[lang];

  const isManualData = (data) => {
    return Object.values(data).some(
      (val) => typeof val === "string" && val.toLowerCase().includes("please enter manually")
    );
  };

  const safeId = isManualData(data)
    ? `manual-${data._sourceFileIndex}`
    : `${data.fullname || "unknown"}__${data.institution || "unk"}_${data.field_of_study || "unk"}_${data.degree || "unk"}`;

  const [editMode, setEditMode] = useState(false);
  const [showFile, setShowFile] = useState(false);
  const [formData, setFormData] = useState(data);
  const sourceFile = uploadedFiles?.[data._sourceFileIndex] || null;
  const fileUrl = sourceFile ? URL.createObjectURL(sourceFile) : null;

  const isSelected = selectedCards.includes(safeId);
  const hasManualWarning = isManualData(editMode ? formData : data);

  const withFallback = (value) => {
    const raw = value?.trim().toLowerCase();
    if (!raw || raw === "not provided" || raw === "non fourni") return t.notProvided;
    if (raw === "please enter manually") return t.plsmanually;
    return value;
  };

  useEffect(() => {
    if (!editMode) setFormData({ ...data });
  }, [data]);
useEffect(() => {
  if (isManualData(data)) return;

  const shouldSelect = (() => {
    if (filterMode === "All") return true;

    if (filterMode === "Search") {
      const term = searchTerm?.trim().toLowerCase();
      return term && Object.values(data).some(
        (val) => typeof val === "string" && val.toLowerCase().includes(term)
      );
    }

    return false;
  })();

  if (shouldSelect && !selectedCards.includes(safeId)) {
    setSelectedCards((prev) => [...prev, safeId]);
  }
}, [filterMode, searchTerm, safeId, selectedCards]);

  useEffect(() => {
    return () => fileUrl && URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  const isFieldMissing = () => {
    const checks = [
      "fullname",
      "institution",
      "field_of_study",
      "degree",
      "graduation_date",
      "diploma_number",
    ];
    const source = editMode ? formData : data;
    return checks.some((key) => {
      const val = source[key];
      if (!val) return true;
      const raw = val.toString().trim().toLowerCase();
      return raw === "" || raw === "not provided" || raw === "double check";
    });
  };

  const hasWarning = !hasManualWarning && isFieldMissing();

  const toggleSelect = () => {
    if (!safeId || isManualData(data)) return;
    const already = selectedCards.includes(safeId);

    switch (filterMode) {
      case "Manually":
        setSelectedCards((prev) =>
          already ? prev.filter((x) => x !== safeId) : [...new Set([...prev, safeId])]
        );
        break;
      case "All":
        if (!already) setSelectedCards((prev) => [...prev, safeId]);
        break;
      case "Search": {
        const term = searchTerm?.trim().toLowerCase();
        if (!term) return;
        const matches = Object.values(data).some(
          (val) => typeof val === "string" && val.toLowerCase().includes(term)
        );
        if (matches && !already) setSelectedCards((prev) => [...prev, safeId]);
        break;
      }
      default:
        break;
    }
  };

  const handleDoubleClick = () => {
    setEditMode(true);
    setFormData({ ...formData });
  };

  const handleChange = (key) => (e) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = () => {
    setEditMode(false);
    setExtractedData((prev) =>
      prev.map((d) => (d._sourceFileIndex === data._sourceFileIndex ? { ...formData } : d))
    );
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData(data);
  };

  if (docType !== "diploma") return null;

  return (
    <div className={styles.resultWrapper}>
      <div
        className={`${styles.card} ${isDark ? styles.darkCard : ""} ${isSelected ? styles.selected : ""}`}
        tabIndex={0}
        onClick={() => !editMode && toggleSelect()}
        onDoubleClick={handleDoubleClick}
      >
        {hasWarning && (
          <div className={styles.customToastWarning}>
            <div className={styles.toastIcon}>⚠️</div>
            <div className={styles.toastText}>{t.incompleteFieldsWarning}</div>
          </div>
        )}
        {hasManualWarning && (
          <div className={styles.customToastError}>
            <div className={styles.toastIcon}>❗</div>
            <div className={styles.toastText}>{t.manuallyFieldsWarning}</div>
          </div>
        )}

        <div className={styles.contentRow}>
          <div className={styles.middle}>
            <div className={styles.nameRow}>
              {editMode ? (
                <div className={styles.inputGroup}>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.name} :</div>
                  <input
                    type="text"
                    className={`${styles.editInputFN} ${isDark ? styles.darkeditInputFN : ""}`}
                    value={formData.fullname}
                    onChange={handleChange("fullname")}
                  />
                </div>
              ) : (
                <div className={styles.name}>{withFallback(data.fullname)}</div>
              )}
            </div>
            <div className={styles.meta}>
              {editMode ? (
                <>
                  <div className={styles.inputGroup}>
                    <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.degree} :</div>
                    <input
                      type="text"
                      className={`${styles.editInputMeta} ${isDark ? styles.darkeditInputMeta : ""}`}
                      value={formData.degree}
                      onChange={handleChange("degree")}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.major} :</div>
                    <input
                      type="text"
                      className={`${styles.editInputMeta} ${isDark ? styles.darkeditInputMeta : ""}`}
                      value={formData.field_of_study}
                      onChange={handleChange("field_of_study")}
                    />
                  </div>
                </>
              ) : (
                `${withFallback(data.degree)} — ${withFallback(data.field_of_study)}`
              )}
            </div>
            <div className={styles.meta}>
              {editMode ? (
                <div className={styles.inputGroup}>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.university} :</div>
                  <input
                    type="text"
                    className={`${styles.editInputFN} ${isDark ? styles.darkeditInputFN : ""}`}
                    value={formData.institution}
                    onChange={handleChange("institution")}
                  />
                </div>
              ) : (
                withFallback(data.institution)
              )}
            </div>
          </div>

          <div className={styles.right}>
            <div>
              {editMode ? (
                <div className={styles.inputGroup}>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.date_obtention} :</div>
                  <input
                    type="text"
                    className={`${styles.editInputDate} ${isDark ? styles.darkEditInputDate : ""}`}
                    value={formData.graduation_date}
                    onChange={handleChange("graduation_date")}
                  />
                </div>
              ) : (
                withFallback(data.graduation_date)
              )}
            </div>
            <div>
              {editMode ? (
                <div className={styles.inputGroup}>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.diploma_number} :</div>
                  <input
                    type="text"
                    className={`${styles.editInputLang} ${isDark ? styles.darkEditInputLang : ""}`}
                    value={formData.diploma_number}
                    onChange={handleChange("diploma_number")}
                  />
                </div>
              ) : (
                withFallback(data.diploma_number)
              )}
            </div>
            {sourceFile && (
              <button className={styles.moreBtn} onClick={(e) => { e.stopPropagation(); setShowFile((prev) => !prev); }}>
                📄
              </button>
            )}
          </div>
        </div>

        {editMode && (
          <div className={styles.actionButtons}>
            <button
              onClick={handleSave}
              className={`${styles.saveButton} ${isDark ? styles.darkSaveButton : ""}`}
            >
              {t.save || "Save"}
            </button>
            <button
              onClick={handleCancel}
              className={`${styles.saveButton} ${isDark ? styles.darkSaveButton : ""}`}
            >
              {t.cancel || "Cancel"}
            </button>
          </div>
        )}
      </div>

      {showFile && sourceFile && (
        <div className={styles.filePreview}>
          {sourceFile.type.includes("pdf") ? (
            <iframe src={fileUrl} width="100%" height="100%" />
          ) : sourceFile.type.includes("image") ? (
            <img src={fileUrl} alt="Preview" />
          ) : (
            <p style={{ color: "red", fontWeight: "bold" }}>
              {t.unsupportedFormat} <strong>{sourceFile.name}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DiplomaResult;
