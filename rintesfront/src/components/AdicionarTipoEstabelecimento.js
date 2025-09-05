import { useState,useContext } from 'react';
import axios from 'axios';
import { Store } from '../Store';

const AdicionarTipoEstabelecimento = () => {
  const [nome, setNome] = useState('');
  const [file, setFile] = useState(null);
    const { state } = useContext(Store);
    const { userInfo } = state;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('imagem', file);

    const response = await fetch('http://localhost:5000/api/tipo_estabelecimento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome }),
    });

    if (response.ok) {
      setNome('');
      if (file) {
            const {resposta } = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }).then((res) => res.json())
      .then((data) => {
        alert('Tipo de Estabelecimento criado com sucesso!');
        console.log('Enviado com sucesso:', data);
      })
      .catch((err) => {
        alert('Erro ao criar tipo de estabelecimento');
      });
      }
      setFile(null);
    } else {
      alert('Erro ao criar tipo de estabelecimento');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome do Estabelecimento"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      <button type="submit">Adicionar</button>
    </form>
  );
};


export default AdicionarTipoEstabelecimento;
