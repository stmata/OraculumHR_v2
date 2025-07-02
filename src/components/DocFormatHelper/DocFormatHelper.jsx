import { useSession } from "../../context/SessionContext";
import { translations } from "../../constants/translations";
import styles from "./DocFormatHelper.module.css";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";

const DocFormatHelper = () => {
  const { lang } = useSession();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const t = translations[lang];

  return (
    <div className={`${styles.helperContainer} ${isDark ? styles.darkContainer : ""}`}>
      <img
        src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjU2bW5vYWRta3F0N240NWI5dzQ4cTRmbGRyMDIyMWd1ZGdja2M1diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/tsYCcXey7FNqsxMgk3/giphy.gif"
        alt="Animated Guide"
        className={styles.helperGif}
      />
      <div className={styles.textBlock}>

        <p className={`${styles.intro} ${isDark ? styles.introDark : ""}`}>
          {t.intro}
        </p>
        <p className={`${styles.highlight} ${isDark ? styles.highlightDark : ""}`}>
          {t.defaultDoc}
        </p>
      </div>
    </div>
  );
};

export default DocFormatHelper;
