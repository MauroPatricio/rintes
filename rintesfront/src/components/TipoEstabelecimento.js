import React, { useState, useEffect } from 'react';
import '../App.css'; // Importando os estilos corretamente

const TipoEstabelecimento = () => {
  const [tipos, setTipos] = useState([]);
  const [nome, setNome] = useState('');

  useEffect(() => {
    carregarTipos();
  }, []);

  // Função para buscar todos os tipos de estabelecimentos
  const carregarTipos = async () => {
    try {
      const response = await fetch('/api/tipo_estabelecimento');
      const data = await response.json();
      setTipos(data);
    } catch (error) {
      console.error("Erro ao carregar tipos de estabelecimento:", error);
    }
  };

  // Função para adicionar um novo tipo de estabelecimento
  const adicionarTipo = async () => {
    if (!nome.trim()) {
      alert("Por favor, insira um nome válido!");
      return;
    }

    try {
      const response = await fetch('/api/tipo_estabelecimento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome }),
      });

      if (!response.ok) {
        throw new Error("Erro ao adicionar tipo de estabelecimento.");
      }

      const novoTipo = await response.json();
      setTipos((prevTipos) => [...prevTipos, novoTipo]); // Atualiza a interface
      alert(`${novoTipo.nome} foi adicionado com sucesso!`); // Mensagem de sucesso
      setNome('');
    } catch (error) {
      console.error("Erro ao adicionar tipo de estabelecimento:", error);
    }
  };

  // Função para remover um tipo de estabelecimento
  const removerTipo = async (id) => {
    try {
      const response = await fetch(`/api/tipo_estabelecimento/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Erro ao remover tipo de estabelecimento.");
      }

      // Encontrando o nome do tipo removido antes de atualizar a lista
      const tipoRemovido = tipos.find(tipo => tipo._id === id);
      setTipos((prevTipos) => prevTipos.filter((tipo) => tipo._id !== id));

      alert(`${tipoRemovido.nome} foi removido com sucesso!`); // Mensagem de sucesso
    } catch (error) {
      console.error("Erro ao remover tipo de estabelecimento:", error);
    }
  };

  return (
    <div className="admin-container">
      <h2>Tipos de Estabelecimento</h2>

      <div className="form-container">
        <input 
          value={nome} 
          onChange={(e) => setNome(e.target.value)} 
          placeholder="Nome do tipo" 
        />
        <button onClick={adicionarTipo}>Adicionar</button>
      </div>

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
                <button 
                  onClick={() => removerTipo(tipo._id)} 
                  className="delete-btn"
                >
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

export default TipoEstabelecimento;
