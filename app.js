// app.js
document.addEventListener('DOMContentLoaded', () => {
    // Element refs
    const textInput      = document.getElementById('textInput');
    const docTitleInput  = document.getElementById('docTitle');
    const addDocBtn      = document.getElementById('addDocBtn');
    const tabList        = document.getElementById('tabList');
    const oneWordBtn     = document.getElementById('oneWordBtn');
    const highlightBtn   = document.getElementById('highlightBtn');
    const prevBtn        = document.getElementById('prevBtn');
    const nextBtn        = document.getElementById('nextBtn');
    const decreaseFontBtn= document.getElementById('decreaseFont');
    const increaseFontBtn= document.getElementById('increaseFont');
    const themeToggleBtn = document.getElementById('themeToggle');
    const fullTextDiv    = document.getElementById('fullText');
    const singleWordDiv  = document.getElementById('singleWord');
  
    // State
    let documents           = [];
    let currentDocIndex     = null;
    let oneWordActive       = false;
    let highlightActive     = false;
    let currentWords        = [];
    let currentWordIndex    = 0;
    let currentHighlightIdx = 0;
    let baseFontSize        = 18;
  
    // Add new pasted document
    function addDocument() {
      const text = textInput.value.trim();
      if (!text) {
        alert('Please paste some text first.');
        return;
      }
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
  
    // Show chosen document in the fullText area
    function displayContent(idx) {
      currentDocIndex = parseInt(idx, 10);
      if (isNaN(currentDocIndex)) return;
      const doc = documents[currentDocIndex];
  
      // Exit any mode
      if (oneWordActive)      toggleOneWordMode();
      if (highlightActive)    toggleHighlightMode();
  
      // Render paragraphs
      fullTextDiv.innerHTML = '';
      doc.text.split(/\n{2,}/).forEach(par => {
        if (!par.trim()) return;
        const p = document.createElement('p');
        p.textContent = par;
        fullTextDiv.appendChild(p);
      });
  
      // Restore defaults
      fullTextDiv.style.fontSize = `${baseFontSize}px`;
      fullTextDiv.style.display   = 'block';
      singleWordDiv.style.display = 'none';
    }
  
    // Wrap each word in a span.word for highlighting
    function wrapWordsInSpans() {
      document
        .querySelectorAll('#fullText p')
        .forEach(p => {
          const words = p.textContent.split(' ');
          p.innerHTML = '';
          words.forEach((w, i) => {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = w;
            p.appendChild(span);
            if (i < words.length - 1) {
              p.appendChild(document.createTextNode(' '));
            }
          });
        });
    }
  
    // One‑Word Mode toggle
    function toggleOneWordMode() {
      if (oneWordActive) {
        // Exit
        singleWordDiv.style.display = 'none';
        fullTextDiv.style.display   = 'block';
        oneWordBtn.textContent      = 'One‑Word Mode';
        prevBtn.style.display       = 'none';
        nextBtn.style.display       = 'none';
        oneWordActive = false;
      } else {
        // Enter
        const doc = documents[currentDocIndex];
        currentWords     = doc.text.split(/\s+/);
        currentWordIndex = 0;
        fullTextDiv.style.display   = 'none';
        singleWordDiv.style.display = 'block';
        singleWordDiv.textContent   = currentWords[0] || '';
        oneWordBtn.textContent      = 'Exit One‑Word Mode';
        prevBtn.style.display       = 'inline-block';
        nextBtn.style.display       = 'inline-block';
        highlightBtn.disabled       = true;
        oneWordActive = true;
      }
    }
  
    // Highlight Mode toggle
    function toggleHighlightMode() {
      if (highlightActive) {
        // Exit
        const highlighted = fullTextDiv.querySelector('.highlight');
        if (highlighted) highlighted.classList.remove('highlight');
        highlightBtn.textContent = 'Highlight Mode';
        prevBtn.style.display    = 'none';
        nextBtn.style.display    = 'none';
        highlightActive          = false;
        oneWordBtn.disabled      = false;
      } else {
        // Enter
        wrapWordsInSpans();
        const spans = fullTextDiv.querySelectorAll('.word');
        if (!spans.length) return;
        currentHighlightIdx = 0;
        spans[0].classList.add('highlight');
        highlightBtn.textContent = 'Exit Highlight Mode';
        prevBtn.style.display    = 'inline-block';
        nextBtn.style.display    = 'inline-block';
        oneWordBtn.disabled      = true;
        highlightActive = true;
      }
    }
  
    // Advance or rewind in current mode
    function showNextWord() {
      if (oneWordActive) {
        if (currentWordIndex < currentWords.length - 1) {
          currentWordIndex++;
          singleWordDiv.textContent = currentWords[currentWordIndex];
        }
      } else if (highlightActive) {
        advanceHighlight();
      }
    }
    function showPrevWord() {
      if (oneWordActive) {
        if (currentWordIndex > 0) {
          currentWordIndex--;
          singleWordDiv.textContent = currentWords[currentWordIndex];
        }
      } else if (highlightActive) {
        rewindHighlight();
      }
    }
  
    // Move the highlight in full text
    function advanceHighlight() {
      const spans = fullTextDiv.querySelectorAll('.word');
      if (!spans.length) return;
      spans[currentHighlightIdx].classList.remove('highlight');
      if (currentHighlightIdx < spans.length - 1) {
        currentHighlightIdx++;
      }
      spans[currentHighlightIdx].classList.add('highlight');
      spans[currentHighlightIdx].scrollIntoView({ behavior:'smooth', block:'center' });
    }
    function rewindHighlight() {
      const spans = fullTextDiv.querySelectorAll('.word');
      if (!spans.length) return;
      spans[currentHighlightIdx].classList.remove('highlight');
      if (currentHighlightIdx > 0) {
        currentHighlightIdx--;
      }
      spans[currentHighlightIdx].classList.add('highlight');
      spans[currentHighlightIdx].scrollIntoView({ behavior:'smooth', block:'center' });
    }
  
    // Adjust font size
    function updateFontSize(delta) {
      baseFontSize = Math.max(12, baseFontSize + delta);
      fullTextDiv.style.fontSize = `${baseFontSize}px`;
    }
  
    // Toggle light/dark theme
    function toggleTheme() {
      document.body.classList.toggle('dark');
      themeToggleBtn.textContent = document.body.classList.contains('dark')
        ? 'Light Mode'
        : 'Dark Mode';
    }
  
    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (oneWordActive || highlightActive) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          showNextWord();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          showPrevWord();
        } else if (e.key === 'Escape') {
          if (oneWordActive)      toggleOneWordMode();
          if (highlightActive)    toggleHighlightMode();
        }
      }
    });
  
    // Event bindings
    addDocBtn.addEventListener('click', addDocument);
    tabList.addEventListener('change', () => {
      if (tabList.value !== '') displayContent(tabList.value);
    });
    oneWordBtn.addEventListener('click', toggleOneWordMode);
    highlightBtn.addEventListener('click', toggleHighlightMode);
    nextBtn.addEventListener('click', showNextWord);
    prevBtn.addEventListener('click', showPrevWord);
    increaseFontBtn.addEventListener('click', () => updateFontSize(2));
    decreaseFontBtn.addEventListener('click', () => updateFontSize(-2));
    themeToggleBtn.addEventListener('click', toggleTheme);
  });
  