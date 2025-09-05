import React, { useEffect, useReducer, useContext, useState } from 'react';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import axios from 'axios';
import '../App.css';

// ✅ Reducer para gerenciar estado como no Dashboard
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, tipos: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_SUCCESS':
      return { ...state, tipos: [...state.tipos, action.payload], loading: false };
    case 'DELETE_SUCCESS':
      return { ...state, tipos: state.tipos.filter((tipo) => tipo._id !== action.payload), loading: false };
    default:
      return state;
  }
};

const AdminTipoEstabelecimento = () => {
  const { state: globalState } = useContext(Store);
  const { userInfo } = globalState;
  const [nome, setNome] = useState('');
  const [file, setFile] = useState(null);


  // ✅ Estado controlado pelo reducer
  const [{ loading, tipos, error }, dispatch] = useReducer(reducer, { loading: true, tipos: [], error: '' });

  useEffect(() => {
    const fetchTipos = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get('/api/tipo_estabelecimento', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchTipos();
  }, [userInfo]);

  // ✅ Adicionar novo tipo SEM recarregar
  const adicionarTipo = async () => {
    if (!nome.trim()) {
      alert('O nome não pode estar vazio!');
      return;
    }

    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await axios.post(
        '/api/tipo_estabelecimento',
        { nome },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: 'ADD_SUCCESS', payload: data });
      alert(`Tipo de estabelecimento "${data.nome}" adicionado com sucesso!`);
      setNome('');
    } catch (err) {
      dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
    }
  };

  // ✅ Remover tipo SEM recarregar
  const removerTipo = async (id) => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      await axios.delete(`/api/tipo_estabelecimento/${id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: 'DELETE_SUCCESS', payload: id });
      alert(`O Estabelecimento foi removido!`);
    } catch (err) {
      dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
    }
  };

  return (
    <div className="admin-container">
      <h2>Tipos de Estabelecimento</h2>

      {error && <MessageBox variant="danger">{error}</MessageBox>}
      {loading && <LoadingBox />}

      {/* Formulário de adição */}
      <div className="form-container">
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do tipo" />
        <button onClick={adicionarTipo} disabled={loading}>Adicionar</button>
      </div>
      <div >
        <input type='text' value="Imagem do Produto"  />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
      </div>


      {/* Tabela de tipos cadastrados */}
      <table className="tipo-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tipos.map((tipo) => (
            <tr key={tipo._id}>
              <td>{tipo.nome}</td>
              <td>
                <button className="delete-btn" onClick={() => removerTipo(tipo._id)} disabled={loading}>
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTipoEstabelecimento;
