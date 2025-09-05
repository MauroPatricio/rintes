import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

const LoginPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    // Verifica se o usuário está logado antes de exibir o popup
    const isUserLoggedIn = localStorage.getItem("userInfo"); 
    if (!isUserLoggedIn) {
      setShowPopup(false);
    }
  }, []);

  const closePopupAndRedirect = () => {
    setShowPopup(false); // Fecha o popup
    navigate("/signin"); // Redireciona para a página de login
  };

  const closePopup = () => {
    setShowPopup(false); // Apenas fecha o popup
  };

  return (
    <>
      {showPopup && (
        <div style={styles.popupBackground}>
          <div style={styles.popupContent}>
            <button style={styles.closeBtn} onClick={closePopup}>X</button>
            <h3 style={{ color:'#5A00CC'}}>Login Obrigatório</h3>
            <p>Faça login para continuar com a compra.</p>
            <div style={styles.buttonContainer}>
              <button style={styles.loginBtn} onClick={closePopupAndRedirect}>
                Fazer Login
              </button>
              <button style={styles.cancelBtn} onClick={closePopup}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  popupBackground: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popupContent: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#5A00CC',
    borderRadius: '5px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '15px',
  },
  loginBtn: {
    backgroundColor: '#5A00CC',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  cancelBtn: {
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default LoginPopup;
