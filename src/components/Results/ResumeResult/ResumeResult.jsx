import React, { useContext, useRef, useEffect, useState } from "react";
import styles from "./ResumeResult.module.css";
import { ThemeContext } from "../../../context/ThemeContext";
import { useSession } from "../../../context/SessionContext";
import { translations } from "../../../constants/translations";
import { BsThreeDotsVertical } from "react-icons/bs";

export function useAutosizeTextArea(text, textAreaRef, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (textAreaRef.current) {
      const textArea = textAreaRef.current;
      textArea.style.height = "auto";
      requestAnimationFrame(() => {
        textArea.style.height = textArea.scrollHeight + "px";
      });
    }
  }, [text, textAreaRef, enabled]);
}


const ResumeResult = ({ data }) => {
  const {
    selectedCards,
    setSelectedCards,
    filterMode,
    searchTerm,
    selectedCountry,
    lang,
    uploadedFiles,
    setExtractedData,
  } = useSession();
  const [formData, setFormData] = useState(data);
  const { theme } = useContext(ThemeContext);
  const [localTheme, setLocalTheme] = useState(theme);
  const isDark = localTheme === "dark";
  const t = translations[lang];

  const [showDetails, setShowDetails] = useState(false);
  const [showFile, setShowFile] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const skillsRef = useRef(null);
  const educationRef = useRef(null);
  const experienceRef = useRef(null);

  useAutosizeTextArea(formData.skills, skillsRef, true);
  useAutosizeTextArea(formData.experience, experienceRef, showDetails);
  useAutosizeTextArea(formData.education, educationRef, showDetails);

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (showDetails && skillsRef.current) {
      const textArea = skillsRef.current;
      textArea.style.height = "auto";
      textArea.style.height = textArea.scrollHeight + "px";
    }
  }, [showDetails, formData.experience]);
  useEffect(() => {
    if (showDetails && experienceRef.current) {
      const textArea = experienceRef.current;
      textArea.style.height = "auto";
      textArea.style.height = textArea.scrollHeight + "px";
    }
  }, [showDetails, formData.experience]);

  useEffect(() => {
    if (showDetails && educationRef.current) {
      const textArea = educationRef.current;
      textArea.style.height = "auto";
      textArea.style.height = textArea.scrollHeight + "px";
    }
  }, [showDetails, formData.education]);
  const {
    firstname,
    lastname,
    address,
    phone,
    email,
    experience,
    education,
    skills,
    languages,
    _sourceFileIndex
  } = data;

  const sourceFile = uploadedFiles?.[_sourceFileIndex];
  const fileUrl = sourceFile ? URL.createObjectURL(sourceFile) : null;

  const id = email;
  const isSelected = filterMode === "All" || selectedCards.includes(id);

  const toggleSelect = () => {
    const already = selectedCards.includes(id);

    if (filterMode === "Manually") {
      setSelectedCards(prev =>
        already ? prev.filter(el => el !== id) : [...new Set([...prev, id])]
      );
      return;
    }
    if (already) return;

    if (filterMode === "All") {
      setSelectedCards(prev => [...prev, id]);
      return;
    }

    if (filterMode === "Search") {
      const term = searchTerm?.trim().toLowerCase();
      if (!term) return;
      const matches = Object.values(data).some(
        val => typeof val === "string" && val.toLowerCase().includes(term)
      );
      if (matches) setSelectedCards(prev => [...prev, id]);
      return;
    }

    if (filterMode === "Country") {
      const selected = selectedCountry?.toLowerCase();
      const itemCountry = "canada";
      const match = selected === "anywhere" || itemCountry === selected;
      if (match) setSelectedCards(prev => [...prev, id]);
    }
  };

  useEffect(() => {
    if (filterMode === "All" && !selectedCards.includes(id)) {
      setSelectedCards(prev => [...prev, id]);
    }
  }, [filterMode, id, selectedCards, setSelectedCards]);

  const handleDoubleClick = e => {
    e.stopPropagation();
    setShowDetails(true);
    setEditMode(true);
  };

  const withFallback = value => {
    const raw = value?.trim();
    if (!raw || raw.toLowerCase() === "not provided") return t.notProvided;
    return value;
  };

  const experienceLines = withFallback(experience)
    .split("\n")
    .filter(line => line.trim());
  const firstExperience = experienceLines[0];
  const remainingExperience = experienceLines.slice(1);

  const langList = withFallback(languages)
    .split(",")
    .map(l => l.trim())
    .filter(l => l);
  const displayedLangs = langList.slice(0, 3);
  const remainingLangs = langList.length > 3 ? langList.slice(3) : [];
  const remainingCount = langList.length > 3 ? langList.length - 3 : 0;

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = key => e => {
    setFormData(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = () => {
    setExtractedData(prev =>
      prev.map(d => (d.email === formData.email ? { ...formData } : d))
    );
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData(data);
    setEditMode(false);
  };
  const isFieldMissing = () => {
    const source = editMode ? formData : data;

    const checks = [
      source.firstname,
      source.lastname,
      source.address,
      source.phone,
      source.email,
      source.experience,
      source.education,
      source.skills,
      source.languages,
    ];

    return checks.some((val) => {
      if (!val) return true;
      const raw = val.toString().trim().toLowerCase();
      return raw === "" || raw === "not provided" || raw === "double check";
    });
  };

  const hasWarning = isFieldMissing();
  return (
    <div className={`${styles.resultWrapper} ${showFile ? styles.hasFile : ""}`}>
      <div
        className={`${styles.cardContainer} ${isDark ? styles.darkCard : ""
          } ${isSelected ? styles.selected : ""} ${showDetails ? styles.cardOpen : styles.cardClosed
          }`}
        onClick={() => {
          if (!editMode) toggleSelect();
        }}
        onDoubleClickCapture={handleDoubleClick}
        tabIndex={0}
      >
        {hasWarning && (
          <div className={styles.customToastWarning}>
            <div className={styles.toastIcon}>⚠️</div>
            <div className={styles.toastText}>
              {t.incompleteFieldsWarning}
            </div>
          </div>
        )}
        <div className={styles.cardContent}>

          <div className={styles.topRightWrapper}>

            <button
              className={styles.moreBtn}
              onClick={e => {
                e.stopPropagation();
                setShowFile(prev => !prev);
              }}
            >
              📄
            </button>
            <button
              className={styles.moreBtn}
              onClick={e => {
                e.stopPropagation();
                setShowDetails(prev => !prev);
              }}
            >
              <BsThreeDotsVertical />
            </button>
          </div>
          <div className={styles.left}>
            <div className={styles.fullName}>
              {editMode ? (
                <div className={styles.inputGroup}>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.firstname} :</div>

                  <input
                    className={`${styles.editInput} ${isDark ? styles.darkEditInput : ""
                      }`}
                    value={formData.firstname}
                    onChange={handleChange("firstname")}
                  />
                </div>

              ) : (
                withFallback(firstname)
              )}{" "}
              {editMode ? (
                <div className={styles.inputGroup}>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.surname} :</div>

                  <input
                    className={`${styles.editInput} ${isDark ? styles.darkEditInput : ""
                      }`}
                    value={formData.lastname}
                    onChange={handleChange("lastname")}
                  />
                </div>
              ) : (
                withFallback(lastname)
              )}
            </div>

            <div className={styles.infoRow}>
              <span className={styles.emoji}>✉️</span>
              {editMode ? (
                <input
                  className={`${styles.editInputEmail} ${isDark ? styles.darkEditInputEmail : ""
                    }`}
                  value={formData.email}
                  onChange={handleChange("email")}
                />
              ) : (
                withFallback(email)
              )}
            </div>

            <div className={styles.infoRow}>
              <span className={styles.emoji}>📞</span>
              {editMode ? (
                <input
                  className={`${styles.editInputEmail} ${isDark ? styles.darkEditInputEmail : ""
                    }`}
                  value={formData.phone}
                  onChange={handleChange("phone")}
                />
              ) : (
                withFallback(phone)
              )}
            </div>

            <div className={styles.infoRow}>
              <span className={styles.emoji}>📍</span>
              {editMode ? (
                <input
                  className={`${styles.editInputEmail} ${isDark ? styles.darkEditInputEmail : ""
                    }`}
                  value={formData.address}
                  onChange={handleChange("address")}
                />
              ) : (
                withFallback(address)
              )}
            </div>
          </div>

          <div className={styles.rightt}>
            <div className={styles.experience}>

              {withFallback(firstExperience)}
            </div>

            <div className={styles.languages}>
              {displayedLangs.map((langItem, i) => (
                <span
                  key={i}
                  className={`${styles.langBadge} ${isDark ? styles.darkLangBadge : ""
                    }`}
                >
                  {langItem}
                </span>
              ))}
              {remainingCount > 0 && (
                <span
                  className={`${styles.langExtra} ${isDark ? styles.darkLangExtra : ""
                    }`}
                >
                  +{remainingCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {showDetails && (
          <div
            className={`${styles.detailsBox} ${isDark ? styles.darkDetailsBox : ""
              }`}
            onDoubleClickCapture={handleDoubleClick}
          >
            <div className={styles.detailSection}>
              <div className={styles.detailTitleGreen}>
                {t.skills || "Skills"}
              </div>
              {editMode ? (
                <textarea
                  ref={skillsRef}
                  className={`${styles.editInputSkills} ${isDark ? styles.darkeditInputSkills : ""}`}
                  value={formData.skills}
                  onChange={handleChange("skills")}

                />
              ) : (
                <div className={styles.details} style={{ whiteSpace: "pre-wrap" }}>
                  {withFallback(skills)}
                </div>
              )}
            </div>



            <div className={styles.detailSection}>
              <div className={styles.detailTitleBlur}>
                {t.experience || "Experience"}
              </div>
              {editMode ? (
                <textarea
                  ref={experienceRef}
                  className={`${styles.editInputSkills} ${isDark ? styles.darkeditInputSkills : ""}`}
                  value={formData.experience}
                  onChange={handleChange("experience")}
                />
              ) : (
                <div className={styles.details}>
                  {remainingExperience.length > 0 ? (
                    remainingExperience.map((line, i) => <div key={i}>{line}</div>)
                  ) : (
                    <div>{t.notProvided}</div>
                  )}
                </div>
              )}
            </div>


            <div className={styles.detailSection}>
              <div className={styles.detailTitleEduc}>
                {t.education || "Education"}
              </div>
              {editMode ? (
                <textarea
                  ref={educationRef}
                  className={`${styles.editInputSkills} ${isDark ? styles.darkeditInputSkills : ""}`}
                  value={formData.education}
                  onChange={handleChange("education")}
                />
              ) : (
                <div className={styles.details}>{withFallback(education)}</div>
              )}

            </div>

            {(editMode || remainingLangs.length > 0) && (
              <div className={styles.detailSection}>
                <div className={styles.detailTitleLang}>
                  {t.languages || "Languages"}
                </div>
                {editMode ? (
                  <input
                    type="text"
                    className={`${styles.editInputSkills} ${isDark ? styles.darkeditInputSkills : ""}`}
                    value={formData.languages}
                    onChange={handleChange("languages")}
                  />
                ) : (
                  <div className={styles.details}>
                    {remainingLangs.join(", ")}
                  </div>
                )}
              </div>
            )}




            {editMode && (
              <div className={styles.actionButtons}>
                <button
                  onClick={handleSave}
                  className={`${styles.saveButton} ${isDark ? styles.darkSaveButton : ""
                    }`}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className={`${styles.saveButton} ${isDark ? styles.darkSaveButton : ""
                    }`}
                >
                  ✖ Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showFile && sourceFile && (
        <div
          className={`${styles.filePreview} 
      ${sourceFile.type.includes("image") ? styles.imagePreview : ""} 
  ${sourceFile.type.includes("image") && editMode ? styles.previewWithEdit : ""}
  ${sourceFile.type.includes("image") && showDetails ? styles.previewWithDetails : ""}
    `}
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

export default ResumeResult;
