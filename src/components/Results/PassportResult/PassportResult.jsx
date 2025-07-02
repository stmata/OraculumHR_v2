import React, { useContext, useEffect, useState } from "react";
import styles from "./PassportResult.module.css";
import { countryData } from "../../../constants/countryFlags";
import { useSession } from "../../../context/SessionContext";
import { ThemeContext } from "../../../context/ThemeContext";
import { translations } from "../../../constants/translations";

const PassportResult = ({ data }) => {
    const {
        selectedCards,
        setSelectedCards,
        filterMode,
        searchTerm,
        selectedCountry,
        setDetectedCountries,
        uploadedFiles,
        setExtractedData
    } = useSession();

    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";
    const { lang } = useSession();
    const t = translations[lang];

    const [showFile, setShowFile] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState(data);
    const isManualData = (data) => {
        return Object.values(data).some(
            (val) =>
                typeof val === "string" &&
                val.toLowerCase().includes("please enter manually")
        );
    };
    const hasManualWarning = isManualData(data);
    useEffect(() => {
        if (!editMode) {
            setFormData({ ...data });
        }
    }, [data]);


    const {
        nationality,
        firstname,
        lastname,
        passport_number,
        date_of_birth,
        expiration_date,
        place_of_birth,
        _sourceFileIndex
    } = data;

    const safeId = isManualData(data) ? `manual-${_sourceFileIndex}` : passport_number;

    const isSelected = selectedCards.includes(safeId);

    const withFallback = (value) => {
        const raw = value?.trim().toLowerCase();
        if (!raw || raw === "not provided" || raw === "non fourni") return t.notProvided;
        if (raw === "please enter manually") return t.plsmanually;
        return value;
    };

    const toggleSelect = () => {
        if (!safeId) return;
        if (isManualData(data)) return;

        const alreadySelected = selectedCards.includes(safeId);

        if (filterMode === "Manually") {
            setSelectedCards((prev) =>
                alreadySelected ? prev.filter((el) => el !== safeId) : [...new Set([...prev, safeId])]
            );
            return;
        }

        if (alreadySelected) return;

        if (filterMode === "All") {
            setSelectedCards((prev) => [...prev, safeId]);
            return;
        }

        if (filterMode === "Search") {
            const term = searchTerm?.trim().toLowerCase();
            if (!term) return;
            const matches = Object.values(data).some(
                (val) => typeof val === "string" && val.toLowerCase().includes(term)
            );
            if (matches) {
                setSelectedCards((prev) => [...prev, safeId]);
            }
            return;
        }

        if (filterMode === "Country") {
            const selected = selectedCountry?.toLowerCase();
            const itemCountry = nationality?.toLowerCase();
            const match = selected === "anywhere" || itemCountry === selected;
            if (match) {
                setSelectedCards((prev) => [...prev, safeId]);
            }
        }
    };


    const getCountryInfo = (nationality) => {
        const lowerCountry = nationality?.toLowerCase();
        return countryData.find(
            (c) =>
                c.name.toLowerCase() === lowerCountry ||
                c.isoAlpha3?.toLowerCase() === lowerCountry ||
                (Array.isArray(c.aliases) && c.aliases.some((alias) => alias.toLowerCase() === lowerCountry))
        );
    };

    const countryInfo = getCountryInfo(nationality);

    useEffect(() => {
        if (!countryInfo) return;
        setDetectedCountries((prev) => {
            const exists = prev.some((c) => c.name === countryInfo.name);
            return exists ? prev : [...prev, { name: countryInfo.name, flag: countryInfo.flag }];
        });
    }, [countryInfo, setDetectedCountries]);

    const handleDoubleClick = () => {
        setEditMode(true);
        setFormData({ ...formData });
    };

    const handleChange = (key) => (e) => {
        setFormData((prev) => ({ ...prev, [key]: e.target.value }));
    };

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

    const sourceFile = uploadedFiles?.[_sourceFileIndex];
    const fileUrl = sourceFile ? URL.createObjectURL(sourceFile) : null;

    useEffect(() => {
        return () => {
            if (fileUrl) URL.revokeObjectURL(fileUrl);
        };
    }, [fileUrl]);


    const isFieldMissing = () => {
        const source = editMode ? formData : data;

        const checks = [
            source.nationality,
            source.firstname,
            source.lastname,
            source.passport_number,
            source.date_of_birth,
            source.expiration_date,
            source.place_of_birth,
        ];
        return checks.some((val) => {
            if (!val) return true;
            const raw = val.toString().trim().toLowerCase();
            return raw === "" || raw === "not provided" || raw === "double check";
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
                {hasWarning && (
                    <div className={styles.customToastWarning}>
                        <div className={styles.toastIcon}>⚠️</div>
                        <div className={styles.toastText}>
                            {t.incompleteFieldsWarning}
                        </div>
                    </div>
                )}
                {hasManualWarning && (
                    <div className={styles.customToastError}>
                        <div className={styles.toastIcon}>❗</div>
                        <div className={styles.toastText}>
                            {t.manuallyFieldsWarning}
                        </div>
                    </div>
                )}

                <div className={styles.contentRow}>
                    <div className={styles.left}>

                        <div className={styles.flag}>{countryInfo?.flag || "🏳️"}</div>
                        <div className={styles.country}>

                            {editMode ? (
                                <>  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.country} :</div>

                                    <input
                                        value={formData.nationality}
                                        onChange={handleChange("nationality")}
                                        className={`${styles.editInputPays} ${isDark ? styles.darkEditInputPays : ""}`}
                                    />
                                </>

                            ) : (
                                withFallback(countryInfo?.name || nationality)
                            )}
                        </div>
                    </div>

                    <div className={styles.middle}>
                        <div className={styles.nameRow}>
                            <div className={styles.name}>
                                {editMode ? (
                                    <>
                                        <div className={styles.nameRow}>
                                            <div className={styles.inputGroup}>
                                                <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.firstname} :</div>
                                                <input
                                                    value={formData.firstname}
                                                    onChange={handleChange("firstname")}
                                                    className={`${styles.editInputFN} ${isDark ? styles.darkeditInputFN : ""}`}
                                                />
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.surname} :</div>
                                                <input
                                                    value={formData.lastname}
                                                    onChange={handleChange("lastname")}
                                                    className={`${styles.editInputLN} ${isDark ? styles.darkeditInputLN : ""}`}
                                                />
                                            </div>
                                        </div>

                                    </>
                                ) : (
                                    `${withFallback(firstname)} — ${withFallback(lastname)}`
                                )}

                                {/* {editMode ? (
                                    <div className={styles.inputGroup}>
                                        <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.passport_type} :</div>
                                        <div className={styles.greenBadge}>
                                            <input
                                                value={formData.passport_type}
                                                onChange={handleChange("passport_type")}
                                                className={`${styles.type} ${isDark ? styles.darktype : ""}`}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.greenBadge}>
                                        {withFallback(passport_type)}
                                    </div>
                                )} */}

                                {editMode ? (
                                    <div className={styles.inputGroup}>
                                        <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.id_number} :</div>
                                        <div className={styles.idNumber}>
                                            <input
                                                value={formData.passport_number}
                                                onChange={handleChange("passport_number")}
                                                className={`${styles.idNumberInput} ${isDark ? styles.darkIdNumber : ""}`}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <span className={`${styles.idNumber} ${isDark ? styles.darkIdNumber : ""}`}>
                                        {withFallback(passport_number)}
                                    </span>
                                )}

                            </div>
                        </div>

                        <div className={styles.meta}>
                            {editMode ? (
                                <>
                                    <div className={styles.inputGroup}>
                                        <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.place_of_birth} :</div>
                                        <input
                                            value={formData.place_of_birth}
                                            onChange={handleChange("place_of_birth")}
                                            className={`${styles.editInputLN} ${isDark ? styles.darkeditInputLN : ""}`}
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.date_of_birth} :</div>
                                        <input
                                            value={formData.date_of_birth}
                                            onChange={handleChange("date_of_birth")}
                                            className={`${styles.editInputLN} ${isDark ? styles.darkeditInputLN : ""}`}
                                        />
                                    </div>
                                </>
                            ) : (
                                `${withFallback(place_of_birth)} — ${withFallback(date_of_birth)}`
                            )}
                        </div>

                    </div>

                    <div className={styles.right}>
                        <div>
                            {editMode ? (
                                <div className={styles.inputGroup}>
                                    <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.expiry_date} :</div>
                                    <input
                                        value={formData.expiration_date}
                                        onChange={handleChange("expiration_date")}
                                        className={`${styles.editInputDate} ${isDark ? styles.darkeditInputDate : ""}`}
                                    />
                                </div>

                            ) : (
                                withFallback(expiration_date)
                            )}
                        </div>
                        {/* <div>
                            {editMode ? (
                                <div className={styles.inputGroup}>
                                    <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.city} :</div>
                                    <input
                                        value={formData.city}
                                        onChange={handleChange("city")}
                                        className={`${styles.editInputDate} ${isDark ? styles.darkeditInputDate : ""}`}
                                    />
                                </div>
                            ) : (
                                withFallback(city)
                            )}
                        </div> */}
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
                        <button
                            onClick={handleSave}
                            className={`${styles.saveButton} ${isDark ? styles.darkSaveButton : ""}`}
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className={`${styles.saveButton} ${isDark ? styles.darkSaveButton : ""}`}
                        >
                            ✖ Cancel
                        </button>
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

export default PassportResult;
