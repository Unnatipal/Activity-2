(() => {
  const SIZE = 9;
  const BOX = 3;
  const gridEl = document.getElementById('grid');
  const palette = document.getElementById('palette');
  const newBtn = document.getElementById('newBtn');
  const checkBtn = document.getElementById('checkBtn');
  const difficulty = document.getElementById('difficulty');
  const hintBtn = document.getElementById('hintBtn');
  const solveBtn = document.getElementById('solveBtn');

  let solution = [];
  let puzzle = [];
  let original = [];
  let selected = null;

  function copyGrid(g){
    return g.map(r=>r.slice());
  }

  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
  }

  // generate a full valid Sudoku using backtracking
  function generateSolved(){
    const board = Array.from({length:SIZE}, ()=>Array.from({length:SIZE}, ()=>0));

    function isSafe(r,c,v){
      for(let i=0;i<SIZE;i++) if(board[r][i]===v) return false;
      for(let i=0;i<SIZE;i++) if(board[i][c]===v) return false;
      const br = Math.floor(r/BOX)*BOX, bc = Math.floor(c/BOX)*BOX;
      for(let i=0;i<BOX;i++) for(let j=0;j<BOX;j++) if(board[br+i][bc+j]===v) return false;
      return true;
    }

    function fillCell(idx){
      if(idx>=SIZE*SIZE) return true;
      const r = Math.floor(idx / SIZE), c = idx % SIZE;
      const nums = Array.from({length:SIZE}, (_,i)=>i+1);
      shuffle(nums);
      for(const v of nums){
        if(isSafe(r,c,v)){
          board[r][c]=v;
          if(fillCell(idx+1)) return true;
          board[r][c]=0;
        }
      }
      return false;
    }

    fillCell(0);
    return board;
  }

  function makePuzzle(solved, removals=40){
    const p = copyGrid(solved);
    const coords = [];
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) coords.push([r,c]);
    shuffle(coords);
    for(let i=0;i<removals && i<coords.length;i++){
      const [r,c] = coords[i]; p[r][c] = 0;
    }
    return p;
  }

  function render(){
    gridEl.innerHTML = '';
    for(let r=0;r<SIZE;r++){
      for(let c=0;c<SIZE;c++){
        const val = puzzle[r][c];
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = r; cell.dataset.c = c;
        if(val!==0){ 
          cell.textContent = val; 
          cell.dataset.val = String(val);
          if(original[r] && original[r][c]) cell.classList.add('prefill');
          else if(original[r] && !original[r][c]) cell.classList.add('hint');
        } else {
          cell.dataset.val = '';
        }
        cell.addEventListener('click', ()=> selectCell(cell));
        gridEl.appendChild(cell);
      }
    }
  }

  function selectCell(cell){
    // clear previous highlights
    document.querySelectorAll('.cell').forEach(el=>el.classList.remove('selected','same-row','same-col','same-box'));
    selected = cell; selected.classList.add('selected');
    const r = Number(cell.dataset.r), c = Number(cell.dataset.c);
    // highlight same row & column
    document.querySelectorAll('.cell').forEach(el=>{
      const er = Number(el.dataset.r), ec = Number(el.dataset.c);
      if(er===r) el.classList.add('same-row');
      if(ec===c) el.classList.add('same-col');
      // same 3x3 box
      const boxR = Math.floor(er/BOX), boxC = Math.floor(ec/BOX);
      if(boxR===Math.floor(r/BOX) && boxC===Math.floor(c/BOX)) el.classList.add('same-box');
    });
  }

  palette.addEventListener('click', (e)=>{
    const btn = e.target.closest('.pbtn'); if(!btn) return;
    const v = Number(btn.dataset.val);
    if(!selected) return;
    const r = Number(selected.dataset.r), c = Number(selected.dataset.c);
    // don't change prefilled
    if(selected.classList.contains('prefill')) return;
    puzzle[r][c] = v||0;
    selected.textContent = v||'';
    selected.classList.remove('invalid');
  });

  function checkGrid(){
    let ok = true;
    document.querySelectorAll('.cell').forEach(el=>el.classList.remove('invalid'));
    // rows
    for(let r=0;r<SIZE;r++){
      const seen = new Map();
      for(let c=0;c<SIZE;c++){
        const v = puzzle[r][c];
        if(!v) { ok=false; continue; }
        if(seen.has(v)){
          markCell(r,c); markCell(r,seen.get(v)); ok=false;
        } else seen.set(v,c);
      }
    }
    // cols
    for(let c=0;c<SIZE;c++){
      const seen = new Map();
      for(let r=0;r<SIZE;r++){
        const v = puzzle[r][c];
        if(!v) { ok=false; continue; }
        if(seen.has(v)){
          markCell(r,c); markCell(seen.get(v),c); ok=false;
        } else seen.set(v,r);
      }
    }
    // boxes
    for(let br=0;br<SIZE;br+=BOX){
      for(let bc=0;bc<SIZE;bc+=BOX){
        const seen = new Map();
        for(let i=0;i<BOX;i++) for(let j=0;j<BOX;j++){
          const r = br+i, c = bc+j; const v = puzzle[r][c];
          if(!v) { ok=false; continue; }
          if(seen.has(v)){
            const [or,oc] = seen.get(v); markCell(r,c); markCell(or,oc); ok=false;
          } else seen.set(v,[r,c]);
        }
      }
    }
    return ok;
  }

  function markCell(r,c){
    const cell = document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
    if(cell) cell.classList.add('invalid');
  }

  function newGame(){
    const s = generateSolved();
    solution = s;
    const diff = difficulty ? difficulty.value : 'medium';
    let removals = 46;
    if(diff==='easy') removals = 36;
    if(diff==='medium') removals = 46;
    if(diff==='hard') removals = 54;
    puzzle = makePuzzle(solution, removals);
    original = copyGrid(puzzle);
    render();
  }

  newBtn.addEventListener('click', ()=> newGame());
  checkBtn.addEventListener('click', ()=>{
    const ok = checkGrid();
    if(ok) alert('Nice! Puzzle looks valid.'); else alert('Some issues found — highlighted in red.');
  });

  hintBtn.addEventListener('click', ()=>{
    const empties = [];
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(!puzzle[r][c]) empties.push([r,c]);
    if(empties.length===0) { alert('No empty cells to hint.'); return; }
    const [r,c] = empties[Math.floor(Math.random()*empties.length)];
    puzzle[r][c] = solution[r][c];
    render();
  });

  solveBtn.addEventListener('click', ()=>{
    if(!confirm('Reveal full solution?')) return;
    puzzle = copyGrid(solution); render();
  });

  // initial
  newGame();

  // draggable floating window
  const floating = document.getElementById('floating');
  const dragHandle = document.getElementById('dragHandle');
  let dragging=false, startX=0, startY=0, origX=0, origY=0;

  const minBtn = document.getElementById('minBtn');
  const closeBtn = document.getElementById('closeBtn');
  const dockBtn = document.getElementById('dock');

  dragHandle.addEventListener('pointerdown', (e)=>{
    dragging=true; dragHandle.setPointerCapture(e.pointerId);
    startX = e.clientX; startY = e.clientY;
    const style = window.getComputedStyle(floating);
    const matrix = new DOMMatrixReadOnly(style.transform);
    origX = matrix.m41; origY = matrix.m42;
    dragHandle.style.cursor='grabbing';
  });
  window.addEventListener('pointermove', (e)=>{
    if(!dragging) return;
    const dx = e.clientX - startX; const dy = e.clientY - startY;
    floating.style.transform = `translate(${origX + dx}px, ${origY + dy}px)`;
  });
  window.addEventListener('pointerup', (e)=>{ dragging=false; dragHandle.style.cursor='grab'; });

  // persist position and state
  function saveState(){
    try{
      const style = window.getComputedStyle(floating);
      const matrix = new DOMMatrixReadOnly(style.transform);
      const state = {
        x: matrix.m41 || 0,
        y: matrix.m42 || 0,
        minimized: floating.classList.contains('minimized'),
        hidden: floating.classList.contains('hidden')
      };
      localStorage.setItem('sudoku_window_state', JSON.stringify(state));
    }catch(e){}
  }
  window.addEventListener('pointerup', saveState);

  // restore
  try{
    const raw = localStorage.getItem('sudoku_window_state');
    if(raw){
      const st = JSON.parse(raw);
      if(typeof st.x==='number' && typeof st.y==='number') floating.style.transform = `translate(${st.x}px, ${st.y}px)`;
      if(st.minimized) floating.classList.add('minimized');
      if(st.hidden){ floating.classList.add('hidden'); dockBtn.classList.remove('hidden'); }
    }
  }catch(e){}

  minBtn.addEventListener('click', ()=>{
    floating.classList.toggle('minimized');
    if(floating.classList.contains('minimized')){
      // when minimized keep visible but compact
    }
    saveState();
  });

  closeBtn.addEventListener('click', ()=>{
    floating.classList.add('hidden');
    dockBtn.classList.remove('hidden');
    saveState();
  });

  dockBtn.addEventListener('click', ()=>{
    floating.classList.remove('hidden');
    dockBtn.classList.add('hidden');
    saveState();
  });

})();
