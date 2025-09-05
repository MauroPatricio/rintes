import React, { useContext, useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import Container from 'react-bootstrap/Container';
import { Store } from '../Store';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'EDIT_REQUEST':
      return { ...state, loadingEdit: true };
    case 'EDIT_SUCCESS':
      return { ...state, loadingEdit: false };
    case 'EDIT_FAIL':
      return { ...state, loadingEdit: false, error: action.payload };

    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true };
    case 'UPLOAD_SUCCESS':
      return { ...state, loadingUpload: false };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, error: action.payload };

    default:
      return state;
  }
};

export default function EstablishmentEditScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const { id: tipoId } = params;


  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, loadingEdit, loadingUpload }, dispatch] = useReducer(reducer, {
    loading: false,
    error: '',
    loadingEdit: false,
    loadingUpload: false,
  });

  const [nome, setNome] = useState('');
  const [img, setImg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/tipoestabelecimentos/${tipoId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setNome(data.nome || '');
        setImg(data.img || '');
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    fetchData();
  }, [tipoId, userInfo]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const bodyFormData = new FormData();
    bodyFormData.append('file', file);

    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const { data } = await axios.post('/api/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setImg(data.secure_url);
      dispatch({ type: 'UPLOAD_SUCCESS' });
      toast.success('Imagem enviada com sucesso');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'EDIT_REQUEST' });
      await axios.put(
        `/api/tipoestabelecimentos/${tipoId}`,
        { nome, img },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: 'EDIT_SUCCESS' });
      toast.success('Tipo de estabelecimento atualizado com sucesso');
      navigate('/admin/tipoestabelecimentos');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'EDIT_FAIL', payload: getError(err) });
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Editar Tipo de Estabelecimento</title>
      </Helmet>
      <h1>Editar Tipo de Estabelecimento</h1>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="nome">
            <Form.Label>Nome</Form.Label>
            <Form.Control value={nome} onChange={(e) => setNome(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-3" controlId="img">
            <Form.Label>Imagem Atual</Form.Label>
            {img && (
              <div>
                <img
                  src={img}
                  alt="Imagem"
                  style={{ width: '6rem', height: '6rem', objectFit: 'cover' }}
                />
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="upload">
            <Form.Label>Alterar Imagem</Form.Label>
            <Form.Control type="file" onChange={uploadFileHandler} />
            {loadingUpload && <LoadingBox />}
          </Form.Group>

          <div className="mb-3">
            <Button type="submit" variant="light" disabled={loadingEdit}>
              Atualizar
            </Button>
            {loadingEdit && <LoadingBox />}
          </div>
        </Form>
      )}
    </Container>
  );
}
