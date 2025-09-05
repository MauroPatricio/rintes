import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobile } from '@fortawesome/free-solid-svg-icons';
import { faTextSlash } from '@fortawesome/free-solid-svg-icons';
import { faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { faClockFour } from '@fortawesome/free-solid-svg-icons';
import { CiCreditCard1 } from "react-icons/ci";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useContext, useEffect, useReducer, useState } from 'react';
import { Store } from '../Store.js';
import { toast } from 'react-toastify';
import { getError } from '../utils.js';
import LoadingBox from '../components/LoadingBox.js';
import CountryFlag from 'react-country-flag';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FaCalendarAlt } from "react-icons/fa";
import { GoNumber } from "react-icons/go";
import { useTranslation } from 'react-i18next';


const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, documentTypes: action.payload.documentTypes, pages: action.payload.pages};
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'FETCH_REQUEST_PROVINCE':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS_PROVINCE':
      return { ...state, loading: false, provinces: action.payload.provinces, pages: action.payload.pages};
    case 'FETCH_FAIL_PROVINCE':
      return { ...state, loading: false, error: action.payload };
    case 'USER_REQUEST':
      return { ...state, loadingUser: true };
    case 'USER_SIGNIN':
      return { ...state, registerUser: action.payload, loadingUser: false };
    case 'USER_FAIL':
      return { ...state, registerUserFail: action.payload, loadingUser: false };
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true };
    case 'UPLOAD_SUCCESS':
      return { ...state, loadingUpload: false, errorUpload: '' };
    case 'UPLOAD_FAIL':
      return { ...state, errorUpload: action.payload, loadingUpload: false };
    default:
      return state;
  }
};



export default function SignupScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { search } = useLocation();
  const urlToRedirect = new URLSearchParams(search).get('redirect');
  const redirect = urlToRedirect ? urlToRedirect : '/';

  // User state
  const { state: globalState } = useContext(Store);
  const userInfo = globalState?.userInfo || null; // Garante que não seja 'undefined'
  

  const [tipoEstabelecimento, setTipoEstabelecimento] = useState("");
  const [tiposEstabelecimento, setTiposEstabelecimento] = useState([]);
  

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const response = await fetch('/api/tipoestabelecimentos');
        if (!response.ok) {
          throw new Error('Erro ao buscar tipos');
        }
        const data = await response.json();
        setTiposEstabelecimento(data.tipoestabelecimentos);
      } catch (error) {
        console.error("Erro ao buscar tipos de estabelecimento:", error);
      }
    };
  
    fetchTipos();
  }, []);
  
  
  
  
  

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [checkedTerms, setCheckedTerms] = useState(false);

  // Seller state
  const [sellerName, setSellerName] = useState('');
  const [sellerDescription, setSellerDescription] = useState('');
  const [sellerLocation, setSellerLocation] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [sellerLogo, setSellerLogo] = useState('');
  const [opentime, setOpentime] = useState('');
  const [closetime, setClosetime] = useState('');

  // Bank account state
  const [phoneNumberAccount, setPhoneNumberAccount] = useState('');
  const [alternativePhoneNumberAccount, setAlternativePhoneNumberAccount] = useState('');
  const [accountType, setAccountType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [alternativeAccountType, setAlternativeAccountType] = useState('');
  const [alternativeAccountNumber, setAlternativeAccountNumber] = useState('');

  // Work days state
  const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira','Sexta-feira','Sábado'];
  const [workDaysWithTime, setWorkDaysWithTime] = useState([]);
  const [dayOfWeek, setDayOfWeek] = useState('');

  const accountTypes = [
    { _id: 1, name: 'BCI' },
    { _id: 2, name: 'BIM' },
    { _id: 3, name: 'MOZA' },
    { _id: 4, name: 'ABSA' },
    { _id: 5, name: 'FNB' },
  ];

  const { dispatch: ctxDispatch } = useContext(Store);
  const [
    { loadingUser, loadingUpload, provinces },
    dispatch
  ] = useReducer(reducer, { 
    loadingUser: false, 
    registerUserFail: [], 
    registerUser: {} 
  });

  //const { userInfo } = state;

  // Handle geolocation
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada neste navegador.');
      return;
    }
  
    toast.info('Obtendo localização... Por favor, permita o acesso à localização.');
  
    const options = {
      enableHighAccuracy: true,  // Try to get the most accurate position
      timeout: 10000,           // Wait max 10 seconds
      maximumAge: 0             // Don't use a cached position
    };
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLatitude(latitude);
        setLongitude(longitude);
        toast.success(`Localização obtida com sucesso! (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização: ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Usuário negou a solicitação de geolocalização.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Informação de localização indisponível.';
            break;
          case error.TIMEOUT:
            errorMessage += 'A solicitação de localização expirou.';
            break;
          case error.UNKNOWN_ERROR:
            errorMessage += 'Ocorreu um erro desconhecido.';
            break;
        }
        toast.error(errorMessage);
        
        // Fallback: Try to get approximate location using IP if precise location fails
        getApproximateLocation();
      },
      options
    );
  };
  
  // Fallback method using IP-based geolocation
  const getApproximateLocation = async () => {
    try {
      toast.info('Tentando obter localização aproximada...');
      const response = await axios.get('https://ipapi.co/json/');
      if (response.data.latitude && response.data.longitude) {
        setLatitude(response.data.latitude);
        setLongitude(response.data.longitude);
        toast.success(`Localização aproximada obtida (${response.data.latitude.toFixed(4)}, ${response.data.longitude.toFixed(4)})`);
      } else {
        toast.error('Não foi possível obter localização aproximada.');
      }
    } catch (ipError) {
      toast.error('Falha ao obter localização aproximada: ' + getError(ipError));
    }
  };

  // Remove work day
  const removeDayWeek = (index) => {
    const workDays = [...workDaysWithTime];
    workDays.splice(index, 1);
    setWorkDaysWithTime(workDays);
  };

  // Add work day
  const handleAddItem = () => {
    if (!dayOfWeek || !opentime || !closetime) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    const selectedWorkDay = workDaysWithTime.find((workDay) => workDay.dayOfWeek === dayOfWeek);    
    if (selectedWorkDay) {
      toast.error('Este dia já foi adicionado.');
      return;
    }

    let dayNumber = 0;
    if (dayOfWeek.includes("Dom") || dayOfWeek.includes("Sun")) dayNumber = 0;
    else if (dayOfWeek.includes("Seg") || dayOfWeek.includes("Mon")) dayNumber = 1;
    else if (dayOfWeek.includes("Ter") || dayOfWeek.includes("Tue")) dayNumber = 2;
    else if (dayOfWeek.includes("Qua") || dayOfWeek.includes("Wed")) dayNumber = 3;
    else if (dayOfWeek.includes("Qui") || dayOfWeek.includes("Thu")) dayNumber = 4;
    else if (dayOfWeek.includes("Sex") || dayOfWeek.includes("Fri")) dayNumber = 5;
    else if (dayOfWeek.includes("Sab") || dayOfWeek.includes("Sat")) dayNumber = 6;
    else if (dayOfWeek.includes("Fer") || dayOfWeek.includes("Hol")) dayNumber = 7;
    
    const newItem = {
      dayOfWeek,
      opentime,
      closetime,
      dayNumber
    };
    
    setWorkDaysWithTime([...workDaysWithTime, newItem]);
    setDayOfWeek('');
    setOpentime('');
    setClosetime('');
  };

  // Handle file upload
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    
    try {
      ctxDispatch({ type: 'UPLOAD_REQUEST' });
      const { data } = await axios.post('/api/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      ctxDispatch({ type: 'UPLOAD_SUCCESS', payload: data });
      setSellerLogo(data.secure_url);
      toast.success('Upload de Imagem com Sucesso. Clique em Registar');
    } catch (err) {
      toast.error(getError(err));
      ctxDispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
    }
  };

  // Form submission
  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (phoneNumber.length !== 9) {
      toast.error('O número de telefone deve possuir 9 digitos');
      return;
    }
    
    if (!phoneNumber.startsWith('82') && !phoneNumber.startsWith('83') && 
        !phoneNumber.startsWith('84') && !phoneNumber.startsWith('85') && 
        !phoneNumber.startsWith('86') && !phoneNumber.startsWith('87')) {
      toast.error('Número de operadora incorrecto');
      return;
    }
    
    if (password.length <= 5) {
      toast.error('A password deve possuir no minimo 6 digitos');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As passwords não conferem');
      return;
    }

    if (!checkedTerms) {
      toast.error('Você deve aceitar os termos e condições');
      return;
    }

    // Seller-specific validation
    if (isSeller) {
      if (workDaysWithTime.length === 0) {
        toast.error('Por favor, adicione os dias úteis de trabalho e horário');
        return;
      }
      
      if (!sellerLogo) {
        toast.error('Por favor, adicione a logo da loja');
        return;
      }
      
      if (!latitude || !longitude) {
        toast.error('Latitude e longitude são obrigatórias para vendedores.');
        return;
      }
      
      if (!sellerName || !sellerDescription || !sellerLocation || !sellerAddress) {
        toast.error('Por favor, preencha todos os campos obrigatórios da loja');
        return;
      }
      
      if (!phoneNumberAccount || !accountType || !accountNumber) {
        toast.error('Por favor, preencha os dados bancários obrigatórios');
        return;
      }
    }

    try {
      ctxDispatch({ type: 'USER_REQUEST' });

      const { data } = await axios.post('/api/users/signup', {
        name,
        phoneNumber,
        email,
        password,
        isSeller,
        sellerName,
        sellerDescription,
        sellerLogo,
        sellerLocation,
        sellerAddress,
        phoneNumberAccount,
        alternativePhoneNumberAccount,
        accountType,
        accountNumber,
        alternativeAccountType,
        alternativeAccountNumber,
        workDaysWithTime,
        latitude,
        longitude,
        tipoEstabelecimento
      });
      
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      navigate(redirect || '/');
    } catch (err) {
      ctxDispatch({ type: 'USER_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  // Fetch provinces on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST_PROVINCE' });
        const { data } = await axios.get('/api/provinces');
        dispatch({ type: 'FETCH_SUCCESS_PROVINCE', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL_PROVINCE', payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Container className="small-conteiner">
      <Helmet>
        <title>{t('newaccount')}</title>
      </Helmet>
      <h1 className="my-3">{t('newaccount')}</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <FontAwesomeIcon icon={faTextSlash} /> <Form.Label>{t('name')}</Form.Label>
          <Form.Control
            type="text"
            required
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="phoneNumber">
          <FontAwesomeIcon icon={faMobile} /> <Form.Label>{t('phone')}:  <CountryFlag countryCode="MZ" svg className="mz-flag" /> [+258]</Form.Label>
          <Form.Control
            type="text"
            maxLength={9}
            pattern="[0-9]*"
            title="Insira apenas números"
            placeholder="8********"
            required
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="email">
          <FontAwesomeIcon icon={faEnvelopeOpenText} /> <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            placeholder=".com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        

        <Form.Group className="mb-3" controlId="password">
          <FontAwesomeIcon icon={faLock} /> <Form.Label>{t('password')}: <small className='color-transparent'>{t('musthave6digits')}</small></Form.Label>
          <Form.Control
            type="password"
            placeholder="******"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="confirmPassword">
          <FontAwesomeIcon icon={faLockOpen} /> <Form.Label>{t('confirmpassword')}</Form.Label>
          <Form.Control
            type="password"
            placeholder="******"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Check 
          className='mb-3' 
          type="checkbox" 
          id="isSeller"
          label={t('wanttobeoursupplier')} 
          checked={isSeller}
          onChange={(e) => setIsSeller(e.target.checked)}
        />

        {isSeller && (
          <>
            <br/>
            <div><h4>{t('bankdata')}</h4>

              <Form.Group className="mb-3" controlId="sellerPhoneNumberAccount">
                <GoNumber /> <Form.Label>{t('phonenumbertransfers')}</Form.Label>
                <Form.Control
                  type="text"
                  maxLength={9}
                  pattern="[0-9]*"
                  title="Insira apenas números"
                  placeholder="8********"
                  value={phoneNumberAccount}
                  required
                  onChange={(e) => setPhoneNumberAccount(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="sellerPhoneNumberAccountAlternative">
                <GoNumber /> <Form.Label>{t('phonenumbertransfersoptional')}</Form.Label>
                <Form.Control
                  type="text"
                  maxLength={9}
                  pattern="[0-9]*"
                  title="Insira apenas números"
                  placeholder="8********"
                  value={alternativePhoneNumberAccount}
                  onChange={(e) => setAlternativePhoneNumberAccount(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="sellerAccountType">
                <CiCreditCard1 /> <Form.Label>{t('accounttype')}</Form.Label>
                <Form.Select 
                  aria-label="Tipo de conta"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)} 
                  required
                >
                  <option value="">{t('select')}</option>
                  {accountTypes.map(accountType => (
                    <option key={accountType._id} value={accountType.name}>
                      {accountType.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="accountNumber">
                <GoNumber /> <Form.Label>{t('accountnumber')}</Form.Label>
                <Form.Control
                  type="number"
                  value={accountNumber}
                  required
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="accountTypeAlternative">
                <CiCreditCard1 /> <Form.Label>{t('accounttypeoptional')}</Form.Label>
                <Form.Select 
                  aria-label="Tipo de conta para transferências"
                  value={alternativeAccountType}
                  onChange={(e) => setAlternativeAccountType(e.target.value)}
                >
                  <option value="">{t('select')}</option>
                  {accountTypes.map(accountType => (
                    <option key={accountType._id} value={accountType.name}>
                      {accountType.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="numeroAccountAlternative">
                <GoNumber /><Form.Label>{t('accountnumberoptional')}</Form.Label>
                <Form.Control
                  type="number"
                  value={alternativeAccountNumber}
                  onChange={(e) => setAlternativeAccountNumber(e.target.value)}
                />
              </Form.Group>
            </div>

            <br/>
            <div><h4>{t('storedetails')} </h4>
              <Form.Group className="mb-3" controlId="sellerName">
                <FontAwesomeIcon icon={faTextSlash} /> <Form.Label>{t('storename')}</Form.Label>
                <Form.Control
                  type="text"
                  value={sellerName}
                  required
                  onChange={(e) => setSellerName(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="sellerLogo">
                <Form.Label>{t('storelogo')}</Form.Label>
                {sellerLogo && (
                  <img
                    style={{
                      width: '6rem',
                      height: '6rem',
                      alignItems: 'center',
                      alignContent: 'center',
                    }}
                    src={sellerLogo}
                    alt={name}
                    className="card-img-top"
                  />
                )}
              </Form.Group>

              <Form.Group className="mb-3" controlId="imageFile">
                <Form.Label>Upload logo</Form.Label>
                <Form.Control type="file" onChange={uploadFileHandler} required={!sellerLogo} />
                {loadingUpload && <LoadingBox></LoadingBox>}
              </Form.Group>

              <Form.Group className="mb-3" controlId="sellerDescription">
                <FontAwesomeIcon icon={faTextSlash} /> <Form.Label>{t('storedescription')}</Form.Label>
                <Form.Control
                  as="textarea"
                  value={sellerDescription}
                  required
                  onChange={(e) => setSellerDescription(e.target.value)}
                />
              </Form.Group>

              {latitude && longitude && (
                <div className="mt-3">
                  <p>
                    {t('latitude')}: {latitude} &nbsp; {t('longitude')}: {longitude}
                  </p>
                </div>
              )}
              
              <Button variant="secondary" onClick={handleGeolocation}>
                {t('getlocation')}
              </Button>


              <Form.Group className="mb-3" controlId="tipoEstabelecimento">
              <FontAwesomeIcon icon={faTextSlash} />
  <Form.Label>Tipo de Estabelecimento</Form.Label>
  <Form.Select
    aria-label="Tipo de Estabelecimento"
    value={tipoEstabelecimento}
    onChange={(e) => setTipoEstabelecimento(e.target.value)}
    required
  >
    <option value="">Selecione</option>
    {Array.isArray(tiposEstabelecimento) && tiposEstabelecimento.length > 0 ? (
      tiposEstabelecimento.map(tipo => (
        <option key={tipo._id} value={tipo._id}>
          {tipo.nome}
        </option>
      ))
    ) : (
      <option disabled>Nenhum tipo de estabelecimento encontrado</option>
    )}
  </Form.Select>
</Form.Group>




              
              <Form.Group className="mb-3" controlId="sellerLocation">
                <FontAwesomeIcon icon={faTextSlash} /> <Form.Label>{t('province')}</Form.Label>
                <Form.Select 
                  aria-label="Provincia"
                  value={sellerLocation}
                  onChange={(e) => setSellerLocation(e.target.value)} 
                  required
                >
                  <option value="">{t('select')}</option>
                  {provinces && provinces.map(province => (
                    <option key={province._id} value={province._id}>
                      {province.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              

              <Form.Group className="mb-3" controlId="address">
                <FontAwesomeIcon icon={faTextSlash} /> <Form.Label>{t('storeaddress')}</Form.Label>
                <Form.Control
                  as="textarea"
                  value={sellerAddress}
                  required
                  onChange={(e) => setSellerAddress(e.target.value)}
                />
              </Form.Group>

              <div>
                <Form.Group className="mb-3" controlId="dayWeek">
                  <FaCalendarAlt /> <Form.Label>{t('weekday')}</Form.Label>
                  <Form.Select 
                    aria-label="Week"
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                  >
                    <option value="">{t('select')}</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="sellerOpentime">
                  <FontAwesomeIcon icon={faClock} /> <Form.Label>{t('openingtime')}</Form.Label>
                  <Form.Control
                    type="time"
                    value={opentime}
                    onChange={(e) => setOpentime(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="sellerClosetime">
                  <FontAwesomeIcon icon={faClockFour} /> <Form.Label>{t('closingtime')}</Form.Label>
                  <Form.Control
                    type="time"
                    value={closetime}
                    onChange={(e) => setClosetime(e.target.value)}
                  />
                </Form.Group>
                
                <Button onClick={handleAddItem}>{t('add')}</Button>
              </div>

              {workDaysWithTime.length > 0 && <h6>{t('businessdays')}</h6>}
              <ul>
                {workDaysWithTime.map((item, index) => (
                  <li key={index}>
                    {item.dayOfWeek}: {item.opentime} - {item.closetime}
                    <Button
                      variant="light"
                      onClick={() => removeDayWeek(index)}
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <Form.Check 
          type="checkbox"
          label={<span>
            Li e concordo com os{' '}
            <a href="/terms">termos e condições</a>
          </span>}
          id="myCheckbox"
          required
          checked={checkedTerms}
          onChange={(e) => setCheckedTerms(e.target.checked)}
        />    

        <div className="mb-3">
          <Button className='customButtom' variant='light' disabled={loadingUser} type="submit">
            {t('create')}
          </Button>
          {loadingUser && <LoadingBox></LoadingBox>}
        </div>
        
        <div className="mb-3">
          {t('alreadyhaveaccount')}{' '}
          <Link className="link" to={`/signin?redirect=${redirect}`}>{t('start')}</Link>
        </div>
      </Form>
    </Container>
  );
}