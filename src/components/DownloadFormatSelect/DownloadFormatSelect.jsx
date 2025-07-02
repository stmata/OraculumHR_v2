import React, { useContext, useEffect } from "react";
import styles from "./DownloadFormatSelect.module.css";
import { BsDownload } from "react-icons/bs";
import { ThemeContext } from "../../context/ThemeContext";
import { useSession } from "../../context/SessionContext";
import CustomSelect from "../FilterBar/CustomSelect";
import { translations } from "../../constants/translations";
import { exportDataAs } from "../../utils/exportUtils";

const DownloadFormatSelect = ({ value, onChange, className = "" }) => {
    const { theme } = useContext(ThemeContext);
    const { lang, selectedCards, extractedData } = useSession();
    const isDark = theme === "dark";
    const t = translations[lang];

    const { filterMode, setFilterMode } = useSession();

    const filterOptions = [
        { label: `✅ ${t.all}`, value: "All" },
        { label: `✋ ${t.manually}`, value: "Manually" },
    ];
    const formats = [
        { label: "JSON", value: "json" },
        { label: "Excel", value: "xls" },
        { label: "CSV", value: "csv" },
    ];
    // const isDisabled = selectedCards.length === 0;

    useEffect(() => {
        if (!value && selectedCards.length > 0) {
            onChange("csv");
        }
    }, [value, selectedCards, onChange]);

    // const isDisabled = selectedCards.length === 0 || extractedData.some(item => {
    //     if (!selectedCards.includes(item._sourceFileIndex)) return false;
    //     return Object.values(item).some(
    //         (val) =>
    //             typeof val === "string" &&
    //             val.toLowerCase().includes("please enter manually")
    //     );
    // });
    useEffect(() => {
        if (!filterMode || filterMode !== "All") {
            setFilterMode("All");
        }
    }, []);

    const isManualData = (data) => {
        return Object.values(data).some(
            (val) =>
                typeof val === "string" &&
                val.toLowerCase().includes("please enter manually")
        );
    };

    // const getSafeId = (item) => {
    //     return isManualData(item)
    //         ? `manual-${item._sourceFileIndex}`
    //         : item.passport_number ||
    //           item.document_number ||
    //           item.id_number ||
    //           item.email ||
    //           item.document_id ||
    //           item._sourceFileIndex?.toString() || 
    //           `fallback-${Math.random()}`;
    // };

    // const getSafeId = (item) => {
    //     return isManualData(item)
    //         ? `manual-${item._sourceFileIndex}`
    //         : item.passport_number ||
    //           (item.fullname && item.institution && item.field_of_study && item.degree
    //             ? `${item.fullname}__${item.institution}_${item.field_of_study}_${item.degree}`
    //             : null);
    // };

    const getSafeId = (item) => {
        const isManual = isManualData(item);
        if (isManual) return `manual-${item._sourceFileIndex}`;

        const rawIban = item.code_iban || "";
        const rawBic = item.code_bic || "";
        const cleanIban = rawIban.replace(/\s+/g, "");
        const cleanBic = rawBic.replace(/\s+/g, "");
        const bankId = cleanIban && cleanBic ? `${cleanIban}${cleanBic}` : null;

        const diplomaId =
            item.fullname &&
                item.institution &&
                item.field_of_study &&
                item.degree
                ? `${item.fullname}__${item.institution}_${item.field_of_study}_${item.degree}`
                : null;

        return (
            item.passport_number ||
            item.social_security_number ||
            item.document_number ||
            item.id_number ||
            item.email ||
            item.document_id ||
            bankId ||
            diplomaId ||
            `${item._sourceFileIndex}`
        );
    };


    const isDisabled = selectedCards.length === 0;

    const handleExport = (format) => {
        if (isDisabled) return;

        const uniqueMap = new Map();

        extractedData.forEach((item) => {
            const exportId =
                item.full_name && item.date
                    ? `${item.full_name}__${item.date}`
                    : null;

            const cleanIban = (item.code_iban || "").replace(/\s+/g, "");
            const cleanBic = (item.code_bic || "").replace(/\s+/g, "");
            const bankId =
                cleanIban && cleanBic ? `${cleanIban}${cleanBic}` : null;

            const diplomaID =
                item.fullname && item.institution && item.field_of_study && item.degree
                    ? `${item.fullname}__${item.institution}_${item.field_of_study}_${item.degree}`
                    : null;
            const clean = (val) => (val || "").toString().trim().toLowerCase();

            const fallbackId = clean(item.firstname) && clean(item.lastname)
                ? `${item.firstname}__${item.lastname}_${item._sourceFileIndex || 0}`
                : `unknown_${item._sourceFileIndex || Math.random()}`;
            const id =
                item.document_number ||
                item._sourceFileIndex ||
                item.id_number ||
                item.passport_number ||
                (clean(item.email) && clean(item.email) !== "not provided" ? item.email : null) ||
                item.document_id ||
                bankId ||
                exportId ||
                diplomaID ||
                fallbackId ||
                null;

            // const safeId = getSafeId(item).toString();
            // if (selectedCards.includes(safeId) && !uniqueMap.has(safeId)) {
            //     uniqueMap.set(safeId, item);
            // }
            const safeId = getSafeId(item);
            if (selectedCards.includes(safeId) && !uniqueMap.has(safeId)) {
                uniqueMap.set(safeId, item);
            }

        });

        const filtered = Array.from(uniqueMap.values()).map((item) => {
            const { _sourceFileIndex, ...rest } = item;

            const raw = (item.guichet_banque || "").toString().trim().toLowerCase();
            const invalidValues = ["", "not provided", "double check", "please enter manually", "non fourni"];
            const isBankDoc =
                item.code_iban || item.code_bic || item.nom_banque || item.guichet_banque;

            if (isBankDoc && invalidValues.includes(raw)) {
                return {
                    ...rest,
                    guichet_banque: item.nom_banque || "",
                };
            }

            return rest;
        });


        exportDataAs(format, filtered);
    };

    return (
        <div className={styles.all}>
            <div
                className={`
          ${styles.formatButtonGroup}
          ${isDark ? styles.dark : ""}
          ${className}
        `}
            >
                {formats.map(({ label, value }) => (
                    <button
                        key={value}
                        className={`
              ${styles.formatButton}
              ${isDark ? styles.darkButton : ""}
              ${isDisabled ? styles.disabled : ""}
            `}
                        onClick={() => {
                            if (!isDisabled) handleExport(value);
                        }}
                        disabled={isDisabled}
                    >
                        <BsDownload className={styles.icon} />
                        {label}
                    </button>
                ))}
            </div>
            <CustomSelect
                options={filterOptions}
                value={filterOptions.find((opt) => opt.value === filterMode)}
                onChange={(selected) => setFilterMode(selected.value)}
                getOptionLabel={(option) => option.label}
                icon="📂"
            />
        </div>
    );
};

export default DownloadFormatSelect;
