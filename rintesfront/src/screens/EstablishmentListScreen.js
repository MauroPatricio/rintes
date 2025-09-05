import React, { useContext, useEffect, useReducer } from 'react'; 
import { Store } from '../Store';
import axios from 'axios';
import { getError } from '../utils';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Badge from 'react-bootstrap/Badge';
import Col from 'react-bootstrap/Col';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, tipos: action.payload, pages: action.payload.pages };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, successDelete: false };
    default:
      return state;
  }
};

export default function EstablishmentListScreen() {
  const [{ loading, error, tipos = [], loadingDelete, successDelete, pages }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  const { state } = useContext(Store);
  const { userInfo } = state;

  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const {data} = await axios.get(`/api/tipoestabelecimentos`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data.tipoestabelecimentos });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    }
    fetchData();
  }, [userInfo, successDelete, page]);

  const createHandler = () => {
    if (window.confirm('Tem a certeza que deseja criar um novo Tipo de Estabelecimento?')) {
      navigate('/tipoestabelecimento/create');
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Tem a certeza que deseja remover este Tipo de Estabelecimento?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        const { data } = await axios.delete(`/api/tipoestabelecimentos/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success(data.message || 'Removido com sucesso');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(err));
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  return (
    <div>
      <Helmet>
        <title>Tipos de Estabelecimentos</title>
      </Helmet>
      <h1>Tipos de Estabelecimentos</h1>

      <Col className='col text-end'>
        <Button className='customButtom' variant='light' onClick={createHandler}>
          Criar novo Tipo
        </Button>
      </Col>

      {loadingDelete && <LoadingBox />}
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox>{error}</MessageBox>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Imagem</th>
                <th>Nome</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tipos.map((tipo) => (
                <tr key={tipo._id}>
                  <td>
                        {tipo.img ? (
                          <img
                            src={tipo.img}
                            alt={tipo.nome}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          <Badge bg="secondary">Sem imagem</Badge>
                        )}
                      </td>
                  <td>{tipo.nome}</td>
                  <td>
                    <Button
                      variant="light"
                      onClick={() => navigate(`/tipoestabelecimento/${tipo._id}`)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>{' '}
                    <Button
                      variant="light"
                      onClick={() => deleteHandler(tipo._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            {[...Array(pages).keys()].map((x) => (
              <Link
                className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                key={x + 1}
                to={`/admin/tipoestabelecimentos?page=${x + 1}`}
              >
                {x + 1}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
