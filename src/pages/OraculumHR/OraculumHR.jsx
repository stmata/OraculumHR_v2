import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import DocFormatHelper from '../../components/DocFormatHelper/DocFormatHelper';
import UploadZone from '../../components/UploadZone/UploadZone';
import DocTypeSelector from '../../components/DocTypeSelector/DocTypeSelector';
import DocTypeModal from '../../components/DocTypeModal/DocTypeModal';
import styles from './OraculumHR.module.css';
import ProcessButton from '../../components/ProcessButton/ProcessButton';
import { useSession } from '../../context/SessionContext';
import FilterBar from '../../components/FilterBar/FilterBar';
import DownloadFormatSelect from '../../components/DownloadFormatSelect/DownloadFormatSelect';
import ResultList from '../../components/ResultList/ResultList';

const OraculumHR = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("idcard");
  const { extractedData } = useSession();
  const [format, setFormat] = useState("PDF")

  const handleTypeChange = (newType) => {
    setSelectedDocType(newType);
    setShowModal(false);
  };

  return (
    <MainLayout>
      <DocFormatHelper />

      <div className={styles.mainSection}>
        <div className={styles.upload}>
          <UploadZone forceFixedHeight={true} />

        </div>
        <div className={styles.selector}>
          <DocTypeSelector
            selected={selectedDocType}
            onEdit={() => setShowModal(true)}
            forceFixedHeight={true}
          />
        </div>
      </div>
      <ProcessButton />
      {extractedData?.length > 0 && (
        <>
          <FilterBar />
          <DownloadFormatSelect value={format} onChange={setFormat} />
          <ResultList />
        </>
      )}

      {showModal && (
        <DocTypeModal
          selected={selectedDocType}
          onClose={() => setShowModal(false)}
          onSelect={handleTypeChange}
        />
      )}
    </MainLayout>
  );
};

export default OraculumHR;