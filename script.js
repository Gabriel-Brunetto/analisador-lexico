let listaDePalavras = [];
let matrizDeTransicao = { q0: {} };
let contadorDeEstados = 0;

const ALFABETO = 'abcdefghijklmnopqrstuvwxyz'.split('');
const TEMPO_ANIMACAO = 500;

function palavraEhValida(palavra) {
  const regexApenasLetrasMinusculas = /^[a-z]+$/;
  return regexApenasLetrasMinusculas.test(palavra);
}

function palavraJaExisteNoDicionario(palavra) {
  return listaDePalavras.includes(palavra);
}

function adicionarPalavraAoDicionario(palavra) {
  if (!palavraEhValida(palavra)) {
    mostrarMensagem(`❌ Palavra inválida: ${palavra}`, 'erro');
    return;
  }

  if (palavraJaExisteNoDicionario(palavra)) {
    mostrarMensagem(`⚠️ '${palavra}' já está no dicionário.`, 'aviso');
    return;
  }

  listaDePalavras.push(palavra);
  mostrarMensagem(`✅ Palavra '${palavra}' adicionada ao dicionário.`, 'sucesso');

  adicionarPalavraNoAutomato(palavra);
  atualizarTabelaDeTransicoes();
  atualizarListaDePalavras();
}

function removerPalavraDoDicionario(palavra) {
  const posicaoDaPalavra = listaDePalavras.indexOf(palavra);

  if (posicaoDaPalavra > -1) {
    listaDePalavras.splice(posicaoDaPalavra, 1);
    mostrarMensagem(`🗑️ Palavra '${palavra}' removida do dicionário.`, 'info');

    reconstruirAutomatoCompleto();
    atualizarListaDePalavras();
  }
}

function adicionarPalavraNoAutomato(palavra) {
  let estadoAtual = 'q0';

  for (const letra of palavra) {
    if (!matrizDeTransicao[estadoAtual]) {
      matrizDeTransicao[estadoAtual] = {};
    }

    if (!matrizDeTransicao[estadoAtual][letra]) {
      contadorDeEstados++;
      const proximoEstado = 'q' + contadorDeEstados;
      
      matrizDeTransicao[estadoAtual][letra] = proximoEstado;
      matrizDeTransicao[proximoEstado] = {};
    }

    estadoAtual = matrizDeTransicao[estadoAtual][letra];
  }

  matrizDeTransicao[estadoAtual]['fim'] = 'qf';
}

function reconstruirAutomatoCompleto() {
  matrizDeTransicao = { q0: {} };
  contadorDeEstados = 0;

  listaDePalavras.forEach(palavra => {
    adicionarPalavraNoAutomato(palavra);
  });

  atualizarTabelaDeTransicoes();
}

function simularReconhecimentoDaPalavra(palavra) {
  if (!palavraEhValida(palavra)) {
    mostrarMensagem(`❌ Palavra '${palavra}' inválida. Use apenas letras minúsculas (a-z).`, 'erro');
    return;
  }

  if (listaDePalavras.length === 0) {
    mostrarMensagem(`⚠️ Adicione palavras ao dicionário antes de consultar.`, 'aviso');
    return;
  }

  let estadoAtual = 'q0';
  const tabelaDeTransicoes = document.getElementById('matrixBody');
  const linhasDaTabela = [...tabelaDeTransicoes.querySelectorAll('tr')];

  mostrarMensagem(`🔍 Simulando reconhecimento de '${palavra}'...`, 'info');

  let indiceDaLetra = 0;

  const intervaloDeAnimacao = setInterval(() => {
    if (indiceDaLetra >= palavra.length) {
      clearInterval(intervaloDeAnimacao);
      removerDestaquesDaTabela(linhasDaTabela);

      if (matrizDeTransicao[estadoAtual] && matrizDeTransicao[estadoAtual]['fim'] === 'qf') {
        mostrarMensagem(`✅ Palavra '${palavra}' foi reconhecida! Está no dicionário.`, 'sucesso');
      } else {
        mostrarMensagem(`❌ Palavra '${palavra}' não foi reconhecida. Não está no dicionário.`, 'erro');
      }
      return;
    }

    const letraAtual = palavra[indiceDaLetra];
    const proximoEstado = matrizDeTransicao[estadoAtual] && matrizDeTransicao[estadoAtual][letraAtual];

    removerDestaquesDaTabela(linhasDaTabela);

    const linhaParaDestacar = encontrarLinhaDeTransicao(linhasDaTabela, estadoAtual, letraAtual);

    if (linhaParaDestacar) {
      linhaParaDestacar.classList.add('highlight');
    }

    if (!proximoEstado) {
      clearInterval(intervaloDeAnimacao);
      removerDestaquesDaTabela(linhasDaTabela);
      mostrarMensagem(`❌ Palavra '${palavra}' NÃO RECONHECIDA. Transição inválida no símbolo '${letraAtual}'.`, 'erro');
      return;
    }

    estadoAtual = proximoEstado;
    indiceDaLetra++;

  }, TEMPO_ANIMACAO);
}

function encontrarLinhaDeTransicao(linhas, estado, simbolo) {
  return linhas.find(linha => 
    linha.cells[0].textContent === estado && 
    linha.cells[1].textContent === simbolo
  );
}

function removerDestaquesDaTabela(linhas) {
  linhas.forEach(linha => linha.classList.remove('highlight'));
}

function atualizarTabelaDeTransicoes() {
  const corpoTabela = document.getElementById('matrixBody');
  corpoTabela.innerHTML = '';

  for (const estado in matrizDeTransicao) {
    for (const simbolo in matrizDeTransicao[estado]) {
      const novaLinha = document.createElement('tr');
      const estadoDestino = matrizDeTransicao[estado][simbolo];
      
      novaLinha.innerHTML = `
        <td>${estado}</td>
        <td>${simbolo}</td>
        <td>${estadoDestino}</td>
      `;
      
      corpoTabela.appendChild(novaLinha);
    }
  }
}

function atualizarListaDePalavras() {
  const elementoLista = document.getElementById('wordList');
  elementoLista.innerHTML = '';

  if (listaDePalavras.length === 0) {
    elementoLista.innerHTML = `
      <li style="text-align:center; color:#999;">
        Nenhuma palavra adicionada
      </li>
    `;
    return;
  }

  listaDePalavras.forEach((palavra, indice) => {
    const itemDaLista = document.createElement('li');
    itemDaLista.innerHTML = `
      <span style="color: black;">
        <strong>${indice + 1}.</strong> ${palavra}
      </span>
      <button onclick="removerPalavraDoDicionario('${palavra}')" class="remove-btn">
        Remover
      </button>
    `;
    elementoLista.appendChild(itemDaLista);
  });
}

function mostrarMensagem(mensagem, tipo) {
  const elementoSaida = document.getElementById('output');
  elementoSaida.textContent = mensagem;
  elementoSaida.style.padding = '15px';
  elementoSaida.style.marginTop = '20px';
  elementoSaida.style.borderRadius = '4px';

  const estilosPorTipo = {
    sucesso: {
      background: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    erro: {
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    aviso: {
      background: '#fff3cd',
      color: '#856404',
      border: '1px solid #ffeaa7'
    },
    info: {
      background: '#d1ecf1',
      color: '#0c5460',
      border: '1px solid #bee5eb'
    }
  };

  let tipoIdentificado = tipo;
  if (!tipo) {
    if (mensagem.includes('✅')) tipoIdentificado = 'sucesso';
    else if (mensagem.includes('❌')) tipoIdentificado = 'erro';
    else if (mensagem.includes('⚠️')) tipoIdentificado = 'aviso';
    else tipoIdentificado = 'info';
  }

  const estilo = estilosPorTipo[tipoIdentificado];
  Object.assign(elementoSaida.style, estilo);
}

function configurarEventosDaInterface() {
  document.getElementById('addBtn').addEventListener('click', () => {
    const campoPalavra = document.getElementById('wordInput');
    const palavra = campoPalavra.value.trim().toLowerCase();

    if (palavra) {
      adicionarPalavraAoDicionario(palavra);
      campoPalavra.value = '';
    } else {
      mostrarMensagem('⚠️ Digite uma palavra para adicionar.', 'aviso');
    }
  });

  document.getElementById('checkBtn').addEventListener('click', () => {
    const campoConsulta = document.getElementById('checkInput');
    const palavra = campoConsulta.value.trim().toLowerCase();

    if (palavra) {
      simularReconhecimentoDaPalavra(palavra);
      campoConsulta.value = '';
    } else {
      mostrarMensagem('⚠️ Digite uma palavra para consultar.', 'aviso');
    }
  });

  document.getElementById('wordInput').addEventListener('keypress', (evento) => {
    if (evento.key === 'Enter') {
      document.getElementById('addBtn').click();
    }
  });

  document.getElementById('checkInput').addEventListener('keypress', (evento) => {
    if (evento.key === 'Enter') {
      document.getElementById('checkBtn').click();
    }
  });
}

function inicializarSistema() {
  configurarEventosDaInterface();
  mostrarMensagem('👋 Bem-vindo! Adicione palavras ao dicionário para começar.', 'info');
}

inicializarSistema();