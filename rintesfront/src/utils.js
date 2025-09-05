
import { MdWifiOff } from "react-icons/md";

export const getError = (error) => {
  // Handle cases where error object is not properly structured
  if (!error || !error.response) {
    return error?.message || 'Ocorreu um erro desconhecido';
  }

  // Check for specific error messages
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Handle specific status codes
  switch (error?.response?.status) {
    case 500:
      return (
        <div style={{ textAlign: 'center' }}>
          <MdWifiOff /> Verifique a sua INTERNET
        </div>
      );
    case 503:
      return 'Formato de Imagem Inválido';
    case 404:
      return 'Recurso não encontrado';
    case 401:
      return 'Não autorizado - por favor faça login';
    case 403:
      return 'Acesso proibido';
    default:
      return error.message || 'Ocorreu um erro inesperado';
  }
};

export const formatedDate = (dateToFormat) =>{
  const datetimeStr = dateToFormat;
const datetime = new Date(datetimeStr);

const day = datetime.getDate().toString().padStart(2, '0'); // Get the day and pad with leading 0 if needed
const month = (datetime.getMonth() + 1).toString().padStart(2, '0'); // Get the month and pad with leading 0 if needed (note that getMonth() returns a 0-based index)
const year = datetime.getFullYear();

const hours = datetime.getHours().toString().padStart(2, '0'); // Get the hours and pad with leading 0 if needed
const minutes = datetime.getMinutes().toString().padStart(2, '0'); // Get the minutes and pad with leading 0 if needed
const seconds = datetime.getSeconds().toString().padStart(2, '0'); // Get the seconds and pad with leading 0 if needed

const formattedDatetime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
return formattedDatetime; // Output: 29/04/2023 00:50:49
}

export const truncateString = (str, maxLength) => {
  
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};
