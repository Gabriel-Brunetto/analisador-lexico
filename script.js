let dictionary = [];
let matrix = { q0: {} };
let stateCount = 0;

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

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
  } else {
    output(`⚠️ '${word}' já está no dicionário.`);
  }
}

// Reaproveita prefixos e regras já criadas na matriz
function addWordToMatrix(word){
  let current = 'q0';
  for(const symbol of word){
    if(!matrix[current]) matrix[current] = {};
    if(!matrix[current][symbol]){
      stateCount++;
      const nextState = 'q'+stateCount;
      matrix[current][symbol] = nextState;
      matrix[nextState] = {};
    }
    current = matrix[current][symbol];
  }
  // Marca estado final sem sobrescrever regras existentes
  matrix[current]['fim'] = 'qf';
}

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

function output(msg){
  const out = document.getElementById('output');
  out.textContent = msg;
}

function simulate(word){
  if(!/^[a-z]+$/.test(word)){
    output(`❌ Palavra '${word}' inválida.`);
    return;
  }
  let current = 'q0';
  const tbody = document.getElementById('matrixBody');
  const rows = [...tbody.querySelectorAll('tr')];
  output(`🔍 Simulando '${word}'...`);
  let index = 0;
  const interval = setInterval(()=>{
    if(index>=word.length){
      clearInterval(interval);
      if(matrix[current] && matrix[current]['fim']==='qf'){
        output(`✅ '${word}' reconhecida!`);
      } else {
        output(`❌ '${word}' rejeitada.`);
      }
      return;
    }
    const symbol = word[index];
    const next = matrix[current] && matrix[current][symbol];
    rows.forEach(r=>r.classList.remove('highlight'));
    const highlight = [...rows].find(r=>r.cells[0].textContent===current && r.cells[1].textContent===symbol);
    if(highlight) highlight.classList.add('highlight');
    current = next || 'erro';
    index++;
  },500);
}

document.getElementById('addBtn').onclick=()=>{
  const w=document.getElementById('wordInput').value.trim().toLowerCase();
  if(w){addWordToDictionary(w);document.getElementById('wordInput').value='';}
};

document.getElementById('checkBtn').onclick=()=>{
  const w=document.getElementById('checkInput').value.trim().toLowerCase();
  if(w){simulate(w);document.getElementById('checkInput').value='';}
};
