// progress-dashboard.js
// This script dynamically renders the English progress dashboard, stores progress in Supabase,
// and provides a simple Q&A test interface for each module (Reading, Writing, Listening, Speaking).

document.addEventListener('DOMContentLoaded', async () => {
  // Ensure Supabase client is ready
  if (typeof supabaseClient === 'undefined' || !supabaseClient) {
    console.warn('Supabase client not initialized – dashboard disabled');
    return;
  }

  // Get current user (assumes Supabase auth is used)
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    console.warn('No user logged in – dashboard disabled');
    return;
  }

  const modules = ['Reading', 'Writing', 'Listening', 'Speaking'];
  const progress = await fetchProgress(user.id);

  const container = document.getElementById('progress-dashboard');
  if (!container) return;

  modules.forEach(mod => {
    const modProg = progress.find(p => p.module === mod) || { completed: false };
    const card = document.createElement('div');
    card.className = 'module-card';
    card.innerHTML = `
      <h4>${mod} Module</h4>
      <label>
        <input type="checkbox" ${modProg.completed ? 'checked' : ''} data-module="${mod}" class="module-complete-checkbox"/>
        Completed
      </label>
      <button data-module="${mod}" class="start-test-btn">Start Test</button>
      <div class="test-area" id="test-${mod}" style="display:none; margin-top:10px;">
        <p class="question-text"></p>
        <div class="options"></div>
        <button class="submit-answer-btn">Submit Answer</button>
        <p class="feedback" style="margin-top:8px;"></p>
      </div>
    `;
    container.appendChild(card);
  });

  // Handle checkbox changes – store completion state
  container.addEventListener('change', async e => {
    if (e.target.matches('.module-complete-checkbox')) {
      const module = e.target.dataset.module;
      const completed = e.target.checked;
      await upsertProgress(user.id, module, completed);
    }
  });

  // Open test UI
  container.addEventListener('click', async e => {
    if (e.target.matches('.start-test-btn')) {
      const module = e.target.dataset.module;
      const testDiv = document.getElementById(`test-${module}`);
      testDiv.style.display = 'block';
      await loadQuestion(module, testDiv);
    }
  });

  // Submit answer handling
  container.addEventListener('click', async e => {
    if (e.target.matches('.submit-answer-btn')) {
      const testDiv = e.target.closest('.test-area');
      const module = testDiv.id.replace('test-', '');
      const selected = testDiv.querySelector('input[name="option"]:checked');
      if (!selected) return alert('Select an answer first');
      const isCorrect = selected.value === 'correct';
      const feedback = testDiv.querySelector('.feedback');
      if (isCorrect) {
        feedback.textContent = '✅ Correct! Progress saved.';
        await upsertProgress(user.id, module, true);
        const checkbox = document.querySelector(`.module-complete-checkbox[data-module="${module}"]`);
        if (checkbox) checkbox.checked = true;
      } else {
        feedback.textContent = `❌ Wrong. Correct answer: ${testDiv.dataset.correctAnswer}`;
      }
    }
  });
});

// Helper: fetch user progress rows
async function fetchProgress(userId) {
  const { data, error } = await supabaseClient
    .from('user_progress')
    .select('module, completed')
    .eq('user_id', userId);
  if (error) console.error('Fetch progress error', error);
  return data || [];
}

// Helper: upsert progress record
async function upsertProgress(userId, module, completed) {
  const { error } = await supabaseClient
    .from('user_progress')
    .upsert({ user_id: userId, module, completed })
    .eq('user_id', userId)
    .eq('module', module);
  if (error) console.error('Upsert progress error', error);
}

// Simple question bank – replace with real questions later
const QUESTION_BANK = {
  Reading: {
    question: 'What is the main purpose of the platform?',
    options: ['Improve speaking', 'Master English for IELTS', 'Learn programming', 'Study math'],
    correct: 1
  },
  Writing: {
    question: 'Which component is essential for a good paragraph?',
    options: ['Title', 'Introduction, Body, Conclusion', 'Header', 'Footer'],
    correct: 1
  },
  Listening: {
    question: 'How many sections are there in the IELTS listening test?',
    options: ['2', '3', '4', '5'],
    correct: 2
  },
  Speaking: {
    question: 'What does IELTS Speaking Part 2 ask you to do?',
    options: ['Answer short questions', 'Give a talk from a cue card', 'Discuss a topic', 'Listen'],
    correct: 1
  }
};

async function loadQuestion(module, testDiv) {
  const q = QUESTION_BANK[module];
  if (!q) return;
  testDiv.dataset.correctAnswer = q.options[q.correct];
  const qEl = testDiv.querySelector('.question-text');
  const optsDiv = testDiv.querySelector('.options');
  qEl.textContent = q.question;
  optsDiv.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const id = `${module}-opt-${idx}`;
    const label = document.createElement('label');
    label.style.display = 'block';
    label.innerHTML = `
      <input type="radio" name="option" id="${id}" value="${idx === q.correct ? 'correct' : 'incorrect'}"/>
      ${opt}
    `;
    optsDiv.appendChild(label);
  });
}
