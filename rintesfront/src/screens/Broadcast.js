import React, { useContext, useReducer, useState } from 'react';
import { Store } from '../Store';
import { getError } from '../utils';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';

const reducer = (state, action) => {
  switch (action.type) {
    case 'BROADCAST_REQUEST':
      return { ...state, loadingBroadcast: true };
    case 'BROADCAST_SUCCESS':
      return { ...state, loadingBroadcast: false, successBroadcast: true };
    case 'BROADCAST_FAIL':
      return { ...state, loadingBroadcast: false, errorBroadcast: action.payload };
    case 'BROADCAST_RESET':
      return { ...state, successBroadcast: false, errorBroadcast: '' };
    default:
      return state;
  }
};

export default function BroadcastScreen() {
  const [{ loadingBroadcast, errorBroadcast, successBroadcast }, dispatch] = useReducer(reducer, {
    loadingBroadcast: false,
    errorBroadcast: '',
    successBroadcast: false,
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [data, setData] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      toast.error('Título e corpo são obrigatórios.');
      return;
    }

    let jsonData = null;
    if (data.trim()) {
      try {
        jsonData = JSON.parse(data);
      } catch (err) {
        toast.error('Payload JSON inválido.');
        return;
      }
    }

    try {
      dispatch({ type: 'BROADCAST_REQUEST' });
      const { data: response } = await axios.post(
        '/api/notifications/broadcast',
        { title, body, data: jsonData },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: 'BROADCAST_SUCCESS' });
      toast.success(response.message || 'Notificações enviadas com sucesso!');
      setTitle('');
      setBody('');
      setData('');
    } catch (err) {
      dispatch({ type: 'BROADCAST_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <Helmet>
        <title>Enviar Broadcast</title>
      </Helmet>
      <h1>Enviar Notificação Broadcast</h1>
      <form onSubmit={submitHandler}>
        <div className="mb-3">
          <label htmlFor="title">Título</label>
          <input
            id="title"
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título da notificação"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="body">Mensagem</label>
          <textarea
            id="body"
            rows="3"
            className="form-control"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Digite o corpo da notificação"
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="data">Payload JSON (opcional)</label>
          <textarea
            id="data"
            rows="3"
            className="form-control"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder='Exemplo: { "screen": "Promoções", "id": 123 }'
          ></textarea>
        </div>

        <div>
          <Button type="submit" variant="primary" disabled={loadingBroadcast}>
            {loadingBroadcast ? 'Enviando...' : 'Enviar Broadcast'}
          </Button>
        </div>
      </form>

      <div className="mt-3">
        {loadingBroadcast && <LoadingBox />}
        {errorBroadcast && <MessageBox variant="danger">{errorBroadcast}</MessageBox>}
        {successBroadcast && <MessageBox variant="success">Broadcast enviado com sucesso!</MessageBox>}
      </div>
    </div>
  );
}
