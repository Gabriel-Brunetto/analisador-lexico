let dictionary = [];
let matrix = { q0: {} };
let stateCount = 0;

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Adiciona palavra ao dicionário
function addWordToDictionary(word){
  if(!/^[a-z]+$/.test(word)){
    output(`❌ Palavra inválida: ${word}`);
    return;
  }
  if(!dictionary.includes(word)){
    dictionary.push(word);
    output(`✅ Palavra '${word}' adicionada ao dicionário.`);
    addWordToMatrix(word);
    renderMatrix();
    renderDictionary();
  } else {
    output(`⚠️ '${word}' já está no dicionário.`);
  }
}

// Renderiza a lista de palavras do dicionário
function renderDictionary(){
  const list = document.getElementById('wordList');
  list.innerHTML = '';
  
  if(dictionary.length === 0){
    list.innerHTML = '<li style="text-align:center; color:#999;">Nenhuma palavra adicionada</li>';
    return;
  }
  
  dictionary.forEach((word, idx) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <span style="color: black;"><strong>${idx + 1}.</strong> ${word}</span>
      <button onclick="removeWord('${word}')" class="remove-btn">Remover</button>
    `;
    list.appendChild(item);
  });
}

// Remove palavra do dicionário
function removeWord(word){
  const index = dictionary.indexOf(word);
  if(index > -1){
    dictionary.splice(index, 1);
    output(`🗑️ Palavra '${word}' removida do dicionário.`);
    rebuildMatrix();
    renderDictionary();
  }
}

// Reconstrói a matriz do zero com as palavras restantes
function rebuildMatrix(){
  matrix = { q0: {} };
  stateCount = 0;
  dictionary.forEach(word => addWordToMatrix(word));
  renderMatrix();
}

// Adiciona palavra à matriz de transição (reaproveita prefixos)
function addWordToMatrix(word){
  let current = 'q0';
  for(const symbol of word){
    if(!matrix[current]) matrix[current] = {};
    if(!matrix[current][symbol]){
      stateCount++;
      const nextState = 'q' + stateCount;
      matrix[current][symbol] = nextState;
      matrix[nextState] = {};
    }
    current = matrix[current][symbol];
  }
  // Marca estado final
  matrix[current]['fim'] = 'qf';
}

// Renderiza a matriz de transição na tabela
function renderMatrix(){
  const tbody = document.getElementById('matrixBody');
  tbody.innerHTML = '';
  
  for(const state in matrix){
    for(const symbol in matrix[state]){
      const row = document.createElement('tr');
      row.innerHTML = `<td>${state}</td><td>${symbol}</td><td>${matrix[state][symbol]}</td>`;
      tbody.appendChild(row);
    }
  }
}

// Exibe mensagem de saída
function output(msg){
  const out = document.getElementById('output');
  out.textContent = msg;
  out.style.padding = '15px';
  out.style.marginTop = '20px';
  out.style.borderRadius = '4px';
  
  if(msg.includes('✅')){
    out.style.background = '#d4edda';
    out.style.color = '#155724';
    out.style.border = '1px solid #c3e6cb';
  } else if(msg.includes('❌')){
    out.style.background = '#f8d7da';
    out.style.color = '#721c24';
    out.style.border = '1px solid #f5c6cb';
  } else if(msg.includes('⚠️')){
    out.style.background = '#fff3cd';
    out.style.color = '#856404';
    out.style.border = '1px solid #ffeaa7';
  } else if(msg.includes('🗑️')){
    out.style.background = '#e2e3e5';
    out.style.color = '#383d41';
    out.style.border = '1px solid #d6d8db';
  } else {
    out.style.background = '#d1ecf1';
    out.style.color = '#0c5460';
    out.style.border = '1px solid #bee5eb';
  }
}

// Simula o reconhecimento de uma palavra
function simulate(word){
  if(!/^[a-z]+$/.test(word)){
    output(`❌ Palavra '${word}' inválida. Use apenas letras minúsculas (a-z).`);
    return;
  }
  
  if(dictionary.length === 0){
    output(`⚠️ Adicione palavras ao dicionário antes de consultar.`);
    return;
  }
  
  let current = 'q0';
  const tbody = document.getElementById('matrixBody');
  const rows = [...tbody.querySelectorAll('tr')];
  
  output(`🔍 Simulando reconhecimento de '${word}'...`);
  
  let index = 0;
  const interval = setInterval(() => {
    if(index >= word.length){
      clearInterval(interval);
      rows.forEach(r => r.classList.remove('highlight'));
      
      if(matrix[current] && matrix[current]['fim'] === 'qf'){
        output(`✅ Palavra '${word}' RECONHECIDA! Está no dicionário.`);
      } else {
        output(`❌ Palavra '${word}' NÃO RECONHECIDA. Não está no dicionário.`);
      }
      return;
    }
    
    const symbol = word[index];
    const next = matrix[current] && matrix[current][symbol];
    
    // Remove highlight anterior
    rows.forEach(r => r.classList.remove('highlight'));
    
    // Adiciona highlight na transição atual
    const highlight = rows.find(r => 
      r.cells[0].textContent === current && 
      r.cells[1].textContent === symbol
    );
    
    if(highlight){
      highlight.classList.add('highlight');
    }
    
    if(!next){
      clearInterval(interval);
      rows.forEach(r => r.classList.remove('highlight'));
      output(`❌ Palavra '${word}' NÃO RECONHECIDA. Transição inválida no símbolo '${symbol}'.`);
      return;
    }
    
    current = next;
    index++;
  }, 500);
}

// Event Listeners
document.getElementById('addBtn').addEventListener('click', () => {
  const word = document.getElementById('wordInput').value.trim().toLowerCase();
  if(word){
    addWordToDictionary(word);
    document.getElementById('wordInput').value = '';
  } else {
    output('⚠️ Digite uma palavra para adicionar.');
  }
});

document.getElementById('checkBtn').addEventListener('click', () => {
  const word = document.getElementById('checkInput').value.trim().toLowerCase();
  if(word){
    simulate(word);
    document.getElementById('checkInput').value = '';
  } else {
    output('⚠️ Digite uma palavra para consultar.');
  }
});

// Permite adicionar palavra pressionando Enter
document.getElementById('wordInput').addEventListener('keypress', (e) => {
  if(e.key === 'Enter'){
    document.getElementById('addBtn').click();
  }
});

document.getElementById('checkInput').addEventListener('keypress', (e) => {
  if(e.key === 'Enter'){
    document.getElementById('checkBtn').click();
  }
});

// Inicializa a interface
output('👋 Bem-vindo! Adicione palavras ao dicionário para começar.');