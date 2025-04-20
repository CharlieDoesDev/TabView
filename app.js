 
(() => {  
  const textInput      = document.getElementById('textInput');  
  const docTitleInput  = document.getElementById('docTitle');  
  const addDocBtn      = document.getElementById('addDocBtn');  
  const tabList        = document.getElementById('tabList');  
  const oneWordModeSel = document.getElementById('oneWordMode');  
  const oneWordDelayIn = document.getElementById('oneWordDelay');  
  const oneWordBtn     = document.getElementById('oneWordBtn');  
  const highlightBtn   = document.getElementById('highlightBtn');  
  const prevBtn        = document.getElementById('prevBtn');  
  const nextBtn        = document.getElementById('nextBtn');  
  const decreaseFont   = document.getElementById('decreaseFont');  
  const increaseFont   = document.getElementById('increaseFont');  
  const themeToggle    = document.getElementById('themeToggle');  
  const fullTextDiv    = document.getElementById('fullText');  
  const singleWordDiv  = document.getElementById('singleWord');  

  let documents        = [];  
  let currentDocIndex  = null;  
  let oneWordActive    = false;  
  let highlightActive  = false;  
  let autoTimer        = null;  
  let baseFontSize     = 18;  
  let currentWords     = [];  
  let currentChars     = [];  
  let idxCurrent       = 0;  

  function addDocument() {  
    const text = textInput.value.trim();  
    if (!text) return alert('Paste text first.');  
    const title = docTitleInput.value.trim() || `Document ${documents.length+1}`;  
    documents.push({ title, text });  
    const opt = document.createElement('option');  
    opt.value = documents.length - 1;  
    opt.textContent = title;  
    tabList.appendChild(opt);  
    tabList.value = opt.value;  
    textInput.value = '';  
    docTitleInput.value = '';  
    displayContent(opt.value);  
  }  

  function displayContent(i) {  
    currentDocIndex = +i;  
    if (isNaN(currentDocIndex)) return;  
    exitOneWordMode();  
    exitHighlightMode();  
    const doc = documents[currentDocIndex];  
    fullTextDiv.innerHTML = '';  
    doc.text.split(/\n{2,}/).forEach(p => {  
      if (!p.trim()) return;  
      const el = document.createElement('p'); el.textContent = p;  
      fullTextDiv.appendChild(el);  
    });  
    fullTextDiv.style.fontSize = baseFontSize + 'px';  
    fullTextDiv.style.display   = 'block';  
    singleWordDiv.style.display = 'none';  
  }  

  function wrapSpans() {  
    document.querySelectorAll('#fullText p').forEach(p => {  
      const words = p.textContent.split(' ');  
      p.innerHTML = '';  
      words.forEach((w,i) => {  
        const sp = document.createElement('span');  
        sp.className = 'word'; sp.textContent = w;  
        p.appendChild(sp);  
        if(i<words.length-1) p.appendChild(document.createTextNode(' '));  
      });  
    });  
  }  

  function exitOneWordMode() {  
    if (autoTimer) clearInterval(autoTimer);  
    singleWordDiv.style.display = 'none';  
    fullTextDiv.style.display   = 'block';  
    prevBtn.style.display       = 'none';  
    nextBtn.style.display       = 'none';  
    oneWordBtn.textContent      = 'Start One‑Word Mode';  
    highlightBtn.disabled       = false;  
    oneWordActive = false;  
  }  

  function exitHighlightMode() {  
    const hl = fullTextDiv.querySelector('.highlight');  
    if (hl) hl.classList.remove('highlight');  
    prevBtn.style.display       = 'none';  
    nextBtn.style.display       = 'none';  
    highlightBtn.textContent    = 'Highlight Mode';  
    oneWordBtn.disabled         = false;  
    highlightActive = false;  
  }  

  function toggleOneWordMode() {  
    if (!oneWordActive) enterOneWordMode(); else exitOneWordMode();  
  }  

  function enterOneWordMode() {  
    const mode  = oneWordModeSel.value;  
    const delay = parseFloat(oneWordDelayIn.value) * 1000;  
    const txt   = documents[currentDocIndex].text;  
    fullTextDiv.style.display   = 'none';  
    singleWordDiv.style.display = 'flex';  
    highlightBtn.disabled   = true;  
    oneWordBtn.textContent  = 'Exit One‑Word Mode';  
    oneWordActive = true;  
    idxCurrent = 0;  
    if (mode === 'char') {  
      currentChars = txt.split('');  
      showChar();  
      autoTimer = setInterval(showChar, delay);  
    } else {  
      currentWords = txt.split(/\s+/);  
      showWord();  
      if (mode === 'word') {  
        autoTimer = setInterval(showWord, delay);  
        prevBtn.style.display = 'none';  
        nextBtn.style.display = 'none';  
      } else {  
        prevBtn.style.display = 'inline-block';  
        nextBtn.style.display = 'inline-block';  
      }  
    }  
  }  

  function showWord() {  
    if (idxCurrent >= currentWords.length) return clearInterval(autoTimer);  
    singleWordDiv.textContent = currentWords[idxCurrent++];  
  }  

  function showChar() {  
    if (idxCurrent >= currentChars.length) return clearInterval(autoTimer);  
    singleWordDiv.textContent = currentChars[idxCurrent++];  
  }  

  function toggleHighlightMode() {  
    if (!highlightActive) {  
      enterHighlightMode();  
    } else exitHighlightMode();  
  }  

  function enterHighlightMode() {  
    exitOneWordMode();  
    wrapSpans();  
    const spans = fullTextDiv.querySelectorAll('.word');  
    if (!spans.length) return;  
    idxCurrent = 0;  
    spans[0].classList.add('highlight');  
    highlightBtn.textContent = 'Exit Highlight Mode';  
    prevBtn.style.display    = 'inline-block';  
    nextBtn.style.display    = 'inline-block';  
    oneWordBtn.disabled      = true;  
    highlightActive = true;  
  }  

  function advanceHighlight(by = 1) {  
    const spans = fullTextDiv.querySelectorAll('.word');  
    spans[idxCurrent].classList.remove('highlight');  
    idxCurrent = Math.min(spans.length-1, idxCurrent+by);  
    spans[idxCurrent].classList.add('highlight');  
    spans[idxCurrent].scrollIntoView({ behavior:'smooth', block:'center' });  
  }  

  function rewindHighlight(by = 1) {  
    const spans = fullTextDiv.querySelectorAll('.word');  
    spans[idxCurrent].classList.remove('highlight');  
    idxCurrent = Math.max(0, idxCurrent-by);  
    spans[idxCurrent].classList.add('highlight');  
    spans[idxCurrent].scrollIntoView({ behavior:'smooth', block:'center' });  
  }  

  function updateFontSize(delta) {  
    baseFontSize = Math.max(12, baseFontSize+delta);  
    fullTextDiv.style.fontSize = baseFontSize+'px';  
  }  

  function toggleTheme() {  
    document.body.classList.toggle('dark');  
    themeToggle.textContent = document.body.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';  
  }  

  document.addEventListener('keydown', e => {  
    if (oneWordActive || highlightActive) {  
      if (e.key === 'ArrowRight' || e.key === ' ') {  
        e.preventDefault();  
        if (oneWordActive) showWord(); else advanceHighlight();  
      } else if (e.key === 'ArrowLeft') {  
        e.preventDefault();  
        if (highlightActive) rewindHighlight();  
      } else if (e.key === 'Escape') {  
        if (oneWordActive) exitOneWordMode();  
        if (highlightActive) exitHighlightMode();  
      }  
    }  
  });  

  addDocBtn.addEventListener('click', addDocument);  
  tabList.addEventListener('change', () => displayContent(tabList.value));  
  oneWordBtn.addEventListener('click', toggleOneWordMode);  
  highlightBtn.addEventListener('click', toggleHighlightMode);  
  nextBtn.addEventListener('click', () => {  
    if (oneWordActive) showWord(); else if (highlightActive) advanceHighlight();  
  });  
  prevBtn.addEventListener('click', () => {  
    if (highlightActive) rewindHighlight();  
  });  
  increaseFont.addEventListener('click', () => updateFontSize(2));  
  decreaseFont.addEventListener('click', () => updateFontSize(-2));  
  themeToggle.addEventListener('click', toggleTheme);  
})();