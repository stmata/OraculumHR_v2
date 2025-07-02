import React, { useContext, useEffect, useState } from "react";
import styles from "./BankResult.module.css";
import { ThemeContext } from "../../../context/ThemeContext";
import { useSession } from "../../../context/SessionContext";
import { translations } from "../../../constants/translations";
import { countryData } from "../../../constants/countryFlags";

const BankResult = ({ data }) => {
  const {
    selectedCards,
    setSelectedCards,
    filterMode,
    setDetectedCountries,
    uploadedFiles,
    setExtractedData,
    docType,
    lang,
    searchTerm,
    selectedCountry,
  } = useSession();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const t = translations[lang];

  const {
    libellé_du_compte,
    code_pays,
    code_iban,
    code_bic,
    nom_banque,
    guichet_banque,
    _sourceFileIndex,
  } = data;

  const cleanIban = (code_iban || "").replace(/\s+/g, "");
  const cleanBic = (code_bic || "").replace(/\s+/g, "");
  const isManualData = (target) => {
    return Object.values(target).some(
      (val) => typeof val === "string" && val.toLowerCase().includes("please enter manually")
    );
  };
  const safeId = isManualData(data)
    ? `manual-${_sourceFileIndex}`
    : `${cleanIban}${cleanBic}` || `${_sourceFileIndex}`;


  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(data);
  const [showFile, setShowFile] = useState(false);

  const sourceFile = uploadedFiles?.[_sourceFileIndex] || null;
  const fileUrl = sourceFile ? URL.createObjectURL(sourceFile) : null;

  const isSelected = selectedCards.includes(safeId);

  useEffect(() => {
    return () => fileUrl && URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

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

      if (filterMode === "Country") {
        const selected = selectedCountry?.toLowerCase();
        const itemCountry = code_pays?.toLowerCase();
        return selected === "anywhere" || itemCountry === selected;
      }

      return false;
    })();

    if (shouldSelect && !selectedCards.includes(safeId)) {
      setSelectedCards((prev) => [...prev, safeId]);
    }
  }, [filterMode, searchTerm, selectedCountry, selectedCards, safeId]);

  const isFieldMissing = () => {
    const source = editMode ? formData : data;
    const fields = [
      source.libellé_du_compte,
      source.code_pays,
      source.code_iban,
      source.code_bic,
      source.nom_banque,
      source.guichet_banque,
    ];
    return fields.some((val) => {
      if (!val) return true;
      const raw = val.toString().trim().toLowerCase();
      return raw === "" || raw === "not provided" || raw === "double check";
    });
  };

  const hasManualWarning = isManualData(data);
  const hasWarning = !hasManualWarning && isFieldMissing();

  const toggleSelect = () => {
    if (!safeId || isManualData(data)) return;
    const already = selectedCards.includes(safeId);
    setSelectedCards((prev) =>
      already ? prev.filter((el) => el !== safeId) : [...new Set([...prev, safeId])]
    );
  };

 const handleDoubleClick = () => {
  const raw = (formData.guichet_banque || "").toString().trim().toLowerCase();
  const invalidValues = ["", "not provided", "double check", "please enter manually", "non fourni"];
  const fixedGuichet = invalidValues.includes(raw) ? formData.nom_banque || "" : formData.guichet_banque;

  setEditMode(true);
  setFormData((prev) => ({
    ...prev,
    guichet_banque: fixedGuichet,
  }));
};


  const handleChange = (key) => (e) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  // const handleSave = () => {
  //   setEditMode(false);
  //   setExtractedData((prev) =>
  //     prev.map((d) => {
  //       const idCompare = `${(d.code_iban || "").replace(/\s+/g, "")}${(d.code_bic || "").replace(/\s+/g, "")}`;
  //       return idCompare === safeId ? { ...formData } : d;
  //     })
  //   );
  // };
  const handleSave = () => {
    const id = formData._sourceFileIndex;
    setExtractedData((prev) =>
      prev.map((d) =>
        d._sourceFileIndex === id ? { ...formData } : d
      )
    );
    setEditMode(false);
  };
  const handleCancel = () => {
    setEditMode(false);
    setFormData(data);
  };

  const toggleShowFile = (e) => {
    e.stopPropagation();
    setShowFile((prev) => !prev);
  };

  const getCountryInfo = (code) => {
    const match = countryData.find(
      (c) => c.isoAlpha2?.toLowerCase() === code?.toLowerCase()
    );
    return match || { name: code || "Unknown", flag: "🏳️" };
  };
  const countryInfo = getCountryInfo(code_pays);

  useEffect(() => {
    const name = countryInfo?.name?.toLowerCase();

    if (
      !name ||
      name === "not provided" ||
      name === "please enter manually" ||
      name === "non fourni" ||
      name.trim() === ""
    ) {
      return;
    }

    setDetectedCountries((prev) => {
      const exists = prev.some((c) => c.name.toLowerCase() === countryInfo.name.toLowerCase());
      return exists ? prev : [...prev, { name: countryInfo.name, flag: countryInfo.flag }];
    });
  }, [countryInfo, setDetectedCountries]);

  useEffect(() => {
    const raw = (data.guichet_banque || "").toString().trim().toLowerCase();
    const invalidValues = ["", "not provided", "double check", "please enter manually", "non fourni"];

    if (invalidValues.includes(raw)) {
      setFormData((prev) => ({
        ...prev,
        guichet_banque: data.nom_banque || "", // remplace la valeur
      }));
    }
  }, [data]);


  const withFallback = (value) => {
    const raw = value?.toString().trim();
    if (!raw || raw.toLowerCase() === "not provided") return t.notProvided;
    if (raw.toLowerCase() === "please enter manually") return t.plsmanually;
    return value;
  };

  if (docType !== "bank") return null;

  return (
    <div className={styles.cardWrapper}>
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
          <div className={styles.left}>
            <div className={styles.flag}>{countryInfo.flag}</div>
            {editMode ? (
              <>
                <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.country} :</div>
                <input
                  type="text"
                  className={`${styles.editInputPays} ${isDark ? styles.darkEditInputPays : ""}`}
                  value={formData.code_pays}
                  onChange={handleChange("code_pays")}
                />
              </>
            ) : (
              <div className={styles.country}>{withFallback(countryInfo.name)}</div>
            )}
          </div>

          <div className={styles.middle}>
            <div className={styles.nameRow}>
              {editMode ? (
                <>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.name} :</div>
                  <input
                    type="text"
                    className={`${styles.editInputFN} ${isDark ? styles.darkeditInputFN : ""}`}
                    value={formData.libellé_du_compte}
                    onChange={handleChange("libellé_du_compte")}
                  />
                </>
              ) : (
                <div className={styles.name}>{withFallback(libellé_du_compte)}</div>
              )}

              <div className={styles.value}>
                {editMode ? (
                  <>
                    <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>IBAN :</div>
                    <input
                      type="text"
                      className={`${styles.editInputFN} ${isDark ? styles.darkeditInputMeta : ""}`}
                      value={formData.code_iban}
                      onChange={handleChange("code_iban")}
                    />
                  </>
                ) : (
                  <span className={styles.iban}>{withFallback(code_iban)}</span>
                )}
              </div>

              <div className={styles.value}>
                {editMode ? (
                  <>
                    <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>BIC :</div>
                    <input
                      type="text"
                      className={`${styles.editInputFN} ${isDark ? styles.darkeditInputMeta : ""}`}
                      value={formData.code_bic}
                      onChange={handleChange("code_bic")}
                    />
                  </>
                ) : (
                  <span className={styles.iban}>{withFallback(code_bic)}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.meta}>
              {editMode ? (
                <div className={styles.inputGroup}>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.bankName} :</div>
                  <input
                    type="text"
                    className={`${styles.editInputGuichet} ${isDark ? styles.darkEditInputGuichet : ""}`}
                    value={formData.nom_banque}
                    onChange={handleChange("nom_banque")}
                  />
                </div>
              ) : (
                withFallback(nom_banque)
              )}
            </div>

            <div className={styles.meta}>
              {editMode ? (
                <div className={styles.inputGroup}>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.bankBranch} :</div>
                  <textarea
                    className={`${styles.editInputGuichet} ${isDark ? styles.darkEditInputGuichet : ""}`}
                    value={formData.guichet_banque}
                    onChange={handleChange("guichet_banque")}
                    rows={5}
                  />
                </div>
              ) : (
                (() => {
                  const raw = guichet_banque?.toString().trim().toLowerCase();
                  const isInvalid = !raw || ["not provided", "please enter manually", "double check", "non fourni"].includes(raw);
                  return withFallback(isInvalid ? nom_banque : guichet_banque);
                })()
              )}

            </div>

            {sourceFile && (
              <button className={styles.moreBtn} onClick={toggleShowFile}>
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
        <div
          className={
            sourceFile.type.includes("image")
              ? styles.imagePreview
              : styles.filePreview
          }
        >
          {sourceFile.type.includes("pdf") ? (
            <iframe src={fileUrl} />
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

export default BankResult;