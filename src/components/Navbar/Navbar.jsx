import React, { useContext, useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import { useNavigate } from "react-router-dom";
import logoLight from "../../assets/images/Logo-SKEMA-Couleur.png";
import logoDark from "../../assets/images/Logo-SKEMA-Blanc.png";
import { ThemeContext } from "../../context/ThemeContext";
import { useSession } from "../../context/SessionContext";
import { translations } from "../../constants/translations";

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const logo = isDark ? logoDark : logoLight;
  const icon = isDark ? "☀️" : "🌓";
  const navigate = useNavigate();

  const refresh = () => {
    navigate(0);
  };

  const { lang, setLang } = useSession();
  const t = translations[lang];

  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
    setMenuOpen(false); 
  };

  return (
    <header className={`${styles.navbar} ${isDark ? styles.dark : ""}`}>
      <div className={styles.desktopContent}>
        <div className={styles.left}>
          <button onClick={refresh} className={styles.logoBtn}>
            <img src={logo} alt="SKEMA Logo" className={styles.logoImg} />
          </button>

          <button onClick={refresh} className={styles.titleBtn}>
            <div className={styles.titleBlock}>
              <span className={`${styles.title} ${isDark ? styles.titleDark : ""}`}>
                Oraculum
                <span className={`${styles.hr} ${isDark ? styles.hrDark : ""}`}>HR</span>
              </span>
              <span className={`${styles.subtitle} ${isDark ? styles.subtitleDark : ""}`}>
                {t.bySkema}
              </span>
            </div>
          </button>
        </div>

        <div className={styles.right}>
          <div className={styles.langToggle} onClick={() => setLang(lang === "en" ? "fr" : "en")}>
            <span className={lang === "en" ? styles.activeLang : ""}>EN</span>
            <span> / </span>
            <span className={lang === "fr" ? styles.activeLang : ""}>FR</span>
          </div>
          <button className={styles.modeToggle} onClick={toggleTheme}>{icon}</button>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>

        </div>
      </div>
      <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? "✕" : "☰"}
      </button>

      {menuOpen && (
        <>
          <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
          <div className={`${styles.mobileMenu} ${isDark ? styles.dark : ""}`}>
            <img src={logo} alt="SKEMA Logo" className={styles.logoImg} />
            <div className={styles.titleBlock}>
              <span className={`${styles.title} ${isDark ? styles.titleDark : ""}`}>
                Oraculum<span className={`${styles.hr} ${isDark ? styles.hrDark : ""}`}>HR</span>
              </span>
              <span className={`${styles.subtitle} ${isDark ? styles.subtitleDark : ""}`}>
                {t.bySkema}
              </span>
            </div>

            <div className={styles.langToggle} onClick={() => setLang(lang === "en" ? "fr" : "en")}>
              <span className={lang === "en" ? styles.activeLang : ""}>EN</span>
              <span> / </span>
              <span className={lang === "fr" ? styles.activeLang : ""}>FR</span>
            </div>


            <button className={styles.modeToggle} onClick={toggleTheme}>
              {icon}
            </button>
          </div>
        </>

      )}

    </header>
  );
};

export default Navbar;
