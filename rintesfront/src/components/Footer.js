import React, { useEffect } from 'react'; 
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { Link } from 'react-router-dom';
import LanguageSwitcher from './../LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  const { t } = useTranslation();

  const openLink = (url, e) => {
    e.preventDefault();
    const newTab = window.open(url, '_blank');
    newTab.focus();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <footer className="text-center text-lg-start text-white" style={{ backgroundColor: "#00563f" }}>
      
      {/* Top section */}
      <section className="d-flex justify-content-between p-4" style={{ backgroundColor: "#00563f" }}>
        <div className="me-5">
          <span>{t('stayconnected')}</span>
        </div>
        <div>
          <a href="#" onClick={(e) => openLink("https://web.facebook.com/profile.php?id=61551226670311", e)} style={{ color: "#ffffff" }} className="me-4">
            <FaFacebookF />
          </a>
          <a href="#" onClick={(e) => openLink("https://www.youtube.com/channel/UCgP2pdDdw5F_y40-nh4Vw9A", e)} style={{ color: "#ffffff" }} className="me-4">
            <FaYoutube />
          </a>
          <a href="#" onClick={(e) => openLink("https://www.tiktok.com/@nhiquelashopofficial", e)} style={{ color: "#ffffff" }} className="me-4">
            <FaTiktok />
          </a>
          <a href="#" onClick={(e) => openLink("https://www.instagram.com/nhiquelashop/", e)} style={{ color: "#ffffff" }} className="me-4">
            <FaInstagram />
          </a>
          <LanguageSwitcher />
        </div>
      </section>

      {/* Middle section */}
      <section>
        <div className="container text-center text-md-start mt-5">
          <div className="row mt-3">
            
            {/* Logo */}
            <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
              <img
                style={{ width: "12rem", height: "6rem", textAlign: "center" }}
                src="rintes.jpeg"
                alt="rintes"
              />
            </div>

            {/* About */}
            <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold" style={{ color: "#ffffff" }}>Rintes</h6>
              <hr
                className="mb-4 mt-0 d-inline-block mx-auto"
                style={{ backgroundColor: "#ffffff", width: "60px", height: "2px" }}
              />
              <p style={{ color: "#ffffff" }}>{t('everythinginhands')}<br />{t('wedeliveryourorder')}</p>
            </div>

            {/* Links */}
            <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold" style={{ color: "#ffffff" }}>{t('importantlinks')}</h6>
              <hr
                className="mb-4 mt-0 d-inline-block mx-auto"
                style={{ backgroundColor: "#ffffff", width: "60px", height: "2px" }}
              />
              <p><Link to="/benefits" className="link-none" style={{ color: "#ffffff" }}>{t('benefits')}</Link></p>
              <p><Link to="/help" className="link-none" style={{ color: "#ffffff" }}>{t('howtobuy')}</Link></p>
              <p><Link to="/howtobeseller" className="link-none" style={{ color: "#ffffff" }}>{t('howtobesupplier')}</Link></p>
              <p><Link to="/terms" className="link-none" style={{ color: "#ffffff" }}>{t('termsandcondition')}</Link></p>
              <p><Link to="/returnpolicy" className="link-none" style={{ color: "#ffffff" }}>{t('returnpolicy')}</Link></p>
              <p><Link to="/privacy" className="link-none" style={{ color: "#ffffff" }}>{t('privacy')}</Link></p>
              <p><Link to="/aboutus" className="link-none" style={{ color: "#ffffff" }}>{t('aboutus')}</Link></p>
            </div>

            {/* Contacts */}
            <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
              <h6 className="text-uppercase fw-bold" style={{ color: "#ffffff" }}>{t('contacts')}</h6>
              <hr
                className="mb-4 mt-0 d-inline-block mx-auto"
                style={{ backgroundColor: "#ffffff", width: "60px", height: "2px" }}
              />
              <p style={{ color: "#ffffff" }}><FontAwesomeIcon icon={faPhone} /> {t('hotline')}: +258 853600036</p>
              <p style={{ color: "#ffffff" }}>+258 853600036</p>
              <p style={{ color: "#ffffff" }}>{t('emaillang')}</p>
              <p style={{ color: "#ffffff" }}>{t('mozambique')}, {t('maputocity')}, Malhangalene</p>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom section */}
      <div className="text-center p-3" style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", color: "#ffffff" }}>
        © 2025 {t('reservedrights')}
      </div>
    </footer>
  );
}
