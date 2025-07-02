import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const [lang, setLang] = useState("en");
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [extractedData, setExtractedData] = useState(null);
    const [selectedCards, setSelectedCards] = useState([]);
    const [detectedCountries, setDetectedCountries] = useState([]);
    const [filterMode, setFilterMode] = useState("All");
    const [selectedCountry, setSelectedCountry] = useState("anywhere");
    const [searchTerm, setSearchTerm] = useState("");
    const [showList, setShowList] = useState(true);
    const initialDocType = localStorage.getItem("docType") || "";
    const [docType, setDocTypeState] = useState(initialDocType);
    const setDocType = (value) => {
        setDocTypeState(value);
        localStorage.setItem("docType", value);
    };
    return (
        <SessionContext.Provider
            value={{
                showList,
                setShowList,
                lang,
                setLang,
                docType,
                setDocType,
                uploadedFiles,
                setUploadedFiles,
                selectedCards,
                setSelectedCards,
                detectedCountries,
                setDetectedCountries,
                extractedData,
                setExtractedData,
                filterMode,
                setFilterMode,
                selectedCountry,
                setSelectedCountry,
                searchTerm,
                setSearchTerm,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};

SessionProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useSession = () => useContext(SessionContext);
