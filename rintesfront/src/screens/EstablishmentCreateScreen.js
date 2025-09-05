import React, { useContext, useReducer, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, error: action.payload, loadingCreate: false };
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true };
    case 'UPLOAD_SUCCESS':
      return { ...state, loadingUpload: false };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false };
    default:
      return state;
  }
};

export default function EstablishmentCreateScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, loadingCreate, loadingUpload }, dispatch] = useReducer(reducer, {
    loading: false,
    error: '',
    loadingCreate: false,
    loadingUpload: false,
  });

  const [nome, setNome] = useState('');
  const [img, setImg] = useState('');

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
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: 'UPLOAD_SUCCESS' });
      setImg(data.secure_url);
      toast.success('Upload de Imagem com Sucesso. Clique em Registar');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      await axios.post(
        `/api/tipoestabelecimentos/`,
        {
          nome,
          img,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Tipo estabelecimento criado com sucesso');
      navigate('/admin/tipoestabelecimentos/');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'CREATE_FAIL', payload: getError(err) });
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Tipo de estabelecimento</title>
      </Helmet>
      <h1>Criar Tipo de Estabelecimento</h1>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox>{error}</MessageBox>
      ) : (
        <>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="nome">
              <Form.Label>Nome</Form.Label>
              <Form.Control value={nome} onChange={(e) => setNome(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="imgPreview">
              <Form.Label>Imagem atual</Form.Label>
              {img && (
                <div>
                  <img
                    src={img}
                    alt="Pré-visualização"
                    style={{ width: '6rem', height: '6rem', objectFit: 'cover' }}
                    className="mb-2"
                  />
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="img">
              <Form.Label>Upload da Imagem</Form.Label>
              <Form.Control type="file" onChange={uploadFileHandler} required={!img} />
              {loadingUpload && <LoadingBox />}
            </Form.Group>

            <div className="mb-3">
              <Button className="customButtom" variant="light" type="submit" disabled={loadingCreate}>
                Registar
              </Button>
              {loadingCreate && <LoadingBox />}
            </div>
          </Form>
        </>
      )}
    </Container>
  );
}
