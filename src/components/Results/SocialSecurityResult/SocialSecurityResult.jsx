import React, { useContext, useEffect, useState } from "react";
import styles from "./SocialSecurityResult.module.css";
import { useSession } from "../../../context/SessionContext";
import { ThemeContext } from "../../../context/ThemeContext";
import { translations } from "../../../constants/translations";
import { countryData } from "../../../constants/countryFlags";

const SocialSecurityResult = ({ data }) => {
    const {
        docType,
        selectedCards,
        setSelectedCards,
        filterMode,
        searchTerm,
        selectedCountry,
        setDetectedCountries,
        uploadedFiles,
        setExtractedData,
    } = useSession();

    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";
    const { lang } = useSession();
    const t = translations[lang];

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ ...data });
    const [showFile, setShowFile] = useState(false);

    const {
        fullname,
        social_security_number,
        issuing_country,
        issuing_date,
        expiration_date,
        _sourceFileIndex
    } = data;

    const sourceFile = uploadedFiles?.[_sourceFileIndex];
    const fileUrl = sourceFile ? URL.createObjectURL(sourceFile) : null;
    const isSelected = selectedCards.includes(social_security_number);

    const isManualData = (data) =>
        Object.values(data).some(
            (val) =>
                typeof val === "string" &&
                val.toLowerCase().includes("please enter manually")
        );

    const hasManualWarning = isManualData(data);

    const getCountryInfo = (nationality) => {
        const lowerCountry = nationality?.toLowerCase();
        return countryData.find(
            (c) =>
                c.name.toLowerCase() === lowerCountry ||
                c.isoAlpha3?.toLowerCase() === lowerCountry ||
                (Array.isArray(c.aliases) &&
                    c.aliases.some((alias) => alias.toLowerCase() === lowerCountry))
        );
    };

    const countryInfo = getCountryInfo(issuing_country);

    useEffect(() => {
        if (!editMode) setFormData({ ...data });
    }, [data]);

    useEffect(() => {
        if (!countryInfo) return;
        setDetectedCountries((prev) => {
            const exists = prev.some((c) => c.name === countryInfo.name);
            return exists ? prev : [...prev, { name: countryInfo.name, flag: countryInfo.flag }];
        });
    }, [countryInfo, setDetectedCountries]);

    const withFallback = (value) => {
        const raw = value?.trim().toLowerCase();
        if (!raw || raw === "not provided" || raw === "non fourni") return t.notProvided;
        if (raw === "please enter manually") return t.plsmanually;
        return value;
    };

    const handleDoubleClick = () => {
        setEditMode(true);
        setFormData({ ...formData });
    };

    const handleChange = (key) => (e) =>
        setFormData((prev) => ({ ...prev, [key]: e.target.value }));

    const handleSave = () => {
        const id = formData._sourceFileIndex;
        setExtractedData((prev) =>
            prev.map((d) => (d._sourceFileIndex === id ? { ...formData } : d))
        );
        setEditMode(false);
    };

    const handleCancel = () => {
        setEditMode(false);
        setFormData(data);
    };

    const toggleSelect = () => {
        const id = social_security_number;
        if (!id || isManualData(data)) return;
        const alreadySelected = selectedCards.includes(id);

        switch (filterMode) {
            case "Manually":
                setSelectedCards((prev) =>
                    alreadySelected ? prev.filter((v) => v !== id) : [...prev, id]
                );
                break;
            case "All":
                if (!alreadySelected) setSelectedCards((prev) => [...prev, id]);
                break;
            case "Search": {
                if (alreadySelected) break;
                const term = searchTerm?.trim().toLowerCase();
                if (!term) break;
                const matches = Object.values(data).some(
                    (val) => typeof val === "string" && val.toLowerCase().includes(term)
                );
                if (matches) setSelectedCards((prev) => [...prev, id]);
                break;
            }
            case "Country": {
                if (alreadySelected) break;
                const selected = selectedCountry?.toLowerCase();
                const itemCountry = issuing_country?.toLowerCase();
                const match = selected === "anywhere" || itemCountry === selected;
                if (match) setSelectedCards((prev) => [...prev, id]);
                break;
            }
            default:
                break;
        }
    };

    if (docType !== "social_security") return null;
    const isFieldMissing = () => {
        const source = editMode ? formData : data;
        const fieldsToCheck = [
            source.fullname,
            source.social_security_number,
            source.issuing_country,
            source.issuing_date,
            source.expiration_date,
        ];
        return fieldsToCheck.some((val) => {
            if (!val) return true;
            const raw = val.toString().trim().toLowerCase();
            return raw === "" || raw === "not provided" || raw === "double check" || raw === "non fourni";
        });
    };

    const hasWarning = isFieldMissing();

    return (
        <div className={styles.resultWrapper}>
            <div
                className={`${styles.card} ${isDark ? styles.darkCard : ""} ${isSelected ? styles.selected : ""}`}
                tabIndex={0}
                onClick={() => {
                    if (!editMode) toggleSelect();
                }}
                onDoubleClick={handleDoubleClick}
            >
                {hasManualWarning && (
                    <div className={styles.customToastError}>
                        <div className={styles.toastIcon}>❗</div>
                        <div className={styles.toastText}>{t.manuallyFieldsWarning}</div>
                    </div>
                )}
                {hasWarning && (
                    <div className={styles.customToastWarning}>
                        <div className={styles.toastIcon}>⚠️</div>
                        <div className={styles.toastText}>{t.incompleteFieldsWarning}</div>
                    </div>
                )}
                <div className={styles.contentRow}>
                    <div className={styles.left}>
                        <div className={styles.flag}>{countryInfo?.flag || "🏳️"}</div>
                        <div className={styles.country}>
                            {editMode ? (
                                <>
                                    <div className={styles.inputGroup}>
                                        <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.country} :</div>
                                        <input
                                            value={formData.issuing_country}
                                            onChange={handleChange("issuing_country")}
                                            className={`${styles.editInputPays} ${isDark ? styles.darkEditInputPays : ""}`}
                                        />
                                    </div>
                                </>
                            ) : (
                                withFallback(countryInfo?.name || issuing_country)
                            )}
                        </div>
                    </div>

                    <div className={styles.middle}>
                        {editMode ? (
                            <div className={styles.nameRow}>
                                <div className={styles.inputGroup}>
                                    <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.fullname} :</div>
                                    <input
                                        value={formData.fullname}
                                        onChange={handleChange("fullname")}
                                        className={`${styles.editInputFN} ${isDark ? styles.darkeditInputFN : ""}`}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.ss_number} :</div>
                                    <input
                                        value={formData.social_security_number}
                                        onChange={handleChange("social_security_number")}
                                        className={`${styles.idNumberInput} ${isDark ? styles.darkIdNumber : ""}`}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className={styles.nameRow}>
                                <span className={styles.name}>{withFallback(fullname)}</span>
                                <span className={`${styles.idNumber} ${isDark ? styles.darkIdNumber : ""}`}>
                                    {withFallback(social_security_number)}
                                </span>
                            </div>
                        )}

                        <div className={styles.meta}>
                            {editMode ? (
                                <div className={styles.inputGroup}>
                                    <div className={styles.editLabel}>{t.issuing_date} :</div>
                                    <input
                                        value={formData.issuing_date}
                                        onChange={handleChange("issuing_date")}
                                        className={`${styles.editInputLN} ${isDark ? styles.darkeditInputLN : ""}`}
                                    />
                                </div>
                            ) : (
                                <div>{withFallback(issuing_date)}</div>
                            )}
                        </div>
                    </div>


                    <div className={styles.right}>
                        {editMode ? (
                            <div className={styles.inputGroup}>
                                <div className={styles.editLabel}>{t.expiry_date} :</div>
                                <input
                                    value={formData.expiration_date}
                                    onChange={handleChange("expiration_date")}
                                    className={`${styles.editInputDate} ${isDark ? styles.darkeditInputDate : ""}`}
                                />
                            </div>
                        ) : (
                            withFallback(expiration_date)
                        )}
                        <button
                            className={styles.moreBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowFile((prev) => !prev);
                            }}
                        >
                            📄
                        </button>
                    </div>
                </div>

                {editMode && (
                    <div className={styles.actionButtons}>
                        <button onClick={handleSave} className={`${styles.saveButton} ${isDark ? styles.darkSaveButton : ""}`}>Save</button>
                        <button onClick={handleCancel} className={`${styles.saveButton} ${isDark ? styles.darkSaveButton : ""}`}>✖ Cancel</button>
                    </div>
                )}
            </div>

            {showFile && sourceFile && (
                <div className={styles.filePreview}>
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

export default SocialSecurityResult;
