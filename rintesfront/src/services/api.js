const API_URL = 'http://localhost:5000/api/tipo_estabelecimento';

export const getTiposEstabelecimento = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

export const criarTipoEstabelecimento = async (nome) => {
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });
};