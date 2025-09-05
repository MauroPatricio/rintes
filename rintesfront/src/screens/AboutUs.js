import React, { useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import { Helmet } from 'react-helmet-async';

export default function Alvara() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Helmet>
        <title>Sobre nós</title>
      </Helmet>
      <Card>
        <Card.Body style={{ paddingLeft: '50px', paddingRight: '50px' }}>
          <h4 className='howitworks link'><b>Sobre nós</b></h4>
          <br/>
          <p><b>ALVARÁ N°:</b> 55440/11/01/PS/2023</p>
          <p><b>DECRETO N°:</b> 34/2013, de 2 de Agosto</p>
          <br/>
          <p><b>Titular:</b> NHIQUELA SERVIÇOS & CONSULTORIA, SU, LDA</p>
          <p><b>NUIT:</b> 401581928</p>
          <p><b>Atividade Principal:</b> 62010 - ATIVIDADES DE PROGRAMAÇÃO INFORMÁTICA</p>
          <br/>
          <p><b>Endereço do Estabelecimento:</b></p>
          <p>AV./RUA DA MALHANGALENE, BAIRRO MALHANGALENE, N° 11,</p>
          <p>ANDAR 3°, KAMPFUMU, MAPUTO CIDADE</p>
          <br/>
          <p><b>Validade:</b> POR TEMPO INDETERMINADO</p>
          <br/>
          <p><b>Atividade(s) Secundária(s):</b></p>
          <p>62021 - ATIVIDADES DE CONSULTORIA E PROGRAMAÇÃO INFORMÁTICA</p>
          <p>62022 - GESTÃO E EXPLORAÇÃO DE EQUIPAMENTO INFORMÁTICO</p>
          <br/>
          <p><b>Estabelecimento:</b></p>
          <p>1 AV./RUA DA MALHANGALENE, BAIRRO MALHANGALENE, Nº 11, ANDAR 3º, KAMPFUMU, MAPUTO CIDADE</p>
          <br/>
          <p><b>O titular da licença deve:</b></p>
          <ul>
            <li>Cumprir com as condições e requisitos legais da laboração, higiene, segurança, saúde e segurança pública e meio ambiente e de ordenamento território;</li>
            <li>Observar o horário de trabalho do estabelecimento;</li>
            <li>Manter em arquivo a documentação pertinente à constituição e registo da entidade legal bem como à propriedade ou locação do estabelecimento comercial;</li>
            <li>Colaborar com a entidade licenciadora prestando a informação e dados que lhe forem solicitados para e durante a vistoria;</li>
            <li>Comunicar à autoridade licenciadora com a antecedência mínima de 10 dias úteis:</li>
            <ul>
              <li>A alteração de dados da licença, da firma e sede do titular da licença (incluindo o trespasse), do objeto do pacto social, de alterações ao imóvel onde funciona o estabelecimento, e do mandatário, no caso das representações comerciais estrangeiras;</li>
              <li>O encerramento temporário ou definitivo de quaisquer dos seus estabelecimentos e a suspensão de atividades;</li>
              <li>A alteração do horário de funcionamento dos estabelecimentos.</li>
            </ul>
          </ul>
          <br/>
          <p><b>Código de verificação:</b> 004772023013670041492255</p>
          <p>Conferir o código em <a href="http://www.dasp.mic.gov.mz/contra-prova" target="_blank" rel="noopener noreferrer">http://www.dasp.mic.gov.mz/contra-prova</a></p>
          <br/>
          <p><b>Maputo Cidade, 10 de Julho de 2023</b></p>
        </Card.Body>
      </Card>
    </div>
  );
}
