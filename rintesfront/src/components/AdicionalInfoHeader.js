import React, { useContext, useEffect } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Row, Col } from 'react-bootstrap';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Store } from '../Store';
import { useTranslation } from 'react-i18next';
import '../styles/AdicionalInfoHeader.css';

export default function AdicionalInfoHeader() {
  const { t } = useTranslation();
  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Row
      className="bg-color-row shadow-sm rounded p-3 mb-3"
      style={{
        textAlign: 'center',
        background: 'linear-gradient(90deg, #00563f, #6BA87D)', // gradiente verde moderno
        color: '#fff', // letras brancas
        alignItems: 'center',
      }}
    >
      <Col
        md={12}
        className="delivery-info mb-2"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          color: '#fff', // garante branco mesmo no texto em negrito
        }}
      >
        <FontAwesomeIcon icon={faClock} style={{ fontSize: '1.2rem', color: '#fff' }} />
        <b>{t('delivertime')}: 7:30 {t('as')} 20:30</b>
      </Col>
      
      {userInfo && userInfo.isSeller && !userInfo.isApproved && (
        <Col md={12} style={{ textAlign: 'center', marginTop: '5px' }}>
          <span
            className="not-approved-seller badge rounded-pill p-2"
            style={{
              backgroundColor: '#FF6B6B', // tom vermelho claro para destaque
              color: '#fff', // letras brancas
            }}
          >
            {t('sellernotauthorizedyet')}
          </span>
        </Col>
      )}
    </Row>
  );
}
