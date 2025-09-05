import { useEffect, useState } from 'react';

const ListaTiposEstabelecimento = () => {
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/tipo_estabelecimento')
      .then((response) => response.json())
      .then((data) => setTipos(data))
      .catch((error) => console.error('Erro ao buscar tipos:', error));
  }, []);

  const handleDelete = async (id) => {
    const response = await fetch(`http://localhost:5000/api/tipo_estabelecimento/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      alert('Tipo de estabelecimento removido!');
      setTipos(tipos.filter((tipo) => tipo._id !== id)); // Atualiza a lista
    } else {
      alert('Erro ao remover tipo de estabelecimento');
    }
  };

  return (
    <div>
      <h2>Lista de Tipos de Estabelecimento</h2>
      <ul>
        {tipos.map((tipo) => (
          <li key={tipo._id}>
            {tipo.nome} 
            <button onClick={() => handleDelete(tipo._id)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListaTiposEstabelecimento;
