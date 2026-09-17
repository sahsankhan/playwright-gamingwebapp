function createGame(options) {
  const canvas = document.getElementById('game-canvas');
  const scoreEl = document.getElementById('game-score');
  const statusEl = document.getElementById('game-status');
  const startBtn = document.getElementById('start-game-btn');
  const pauseBtn = document.getElementById('pause-game-btn');
  const endBtn = document.getElementById('end-game-btn');
  const ctx = canvas.getContext('2d');

  let running = false;
  let paused = false;
  let sessionStarted = false;
  let score = 0;
  let frame = 0;

  const simulate = new URLSearchParams(window.location.search).get('simulate') === 'true';

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#08111f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#6cf0ff';
    ctx.fillRect(40 + (frame % 500), 180, 80, 24);

    ctx.fillStyle = '#a855f7';
    for (let i = 0; i < 5; i += 1) {
      ctx.fillRect(60 + i * 110, 60 + ((frame + i * 20) % 80), 70, 18);
    }

    ctx.fillStyle = '#e8eefc';
    ctx.font = '16px Segoe UI';
    ctx.fillText(options.title, 20, 30);

    if (paused) {
      ctx.fillStyle = 'rgba(4, 8, 18, 0.65)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#e8eefc';
      ctx.font = '24px Segoe UI';
      ctx.fillText('Paused', canvas.width / 2 - 40, canvas.height / 2);
    }
  }

  function tick() {
    if (!paused) {
      frame += 1;
      if (running && frame % 20 === 0) {
        score += 10;
        scoreEl.textContent = String(score);
      }
    }

    statusEl.textContent = paused ? 'Paused' : running ? 'Playing' : sessionStarted ? 'Ready' : 'Idle';
    statusEl.dataset.state = paused ? 'paused' : running ? 'playing' : sessionStarted ? 'ready' : 'idle';
    draw();

    if (running) {
      window.requestAnimationFrame(tick);
    }
  }

  async function finishSession() {
    if (score <= 0) {
      return null;
    }
    return window.ArcadeAuth.api(`/api/games/${options.slug}/score`, {
      method: 'POST',
      body: JSON.stringify({ score }),
    });
  }

  function startSession() {
    if (sessionStarted) {
      return;
    }
    sessionStarted = true;
    running = true;
    paused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    endBtn.disabled = false;
    tick();

    if (simulate) {
      window.setTimeout(async () => {
        await endSession();
      }, 1400);
    }
  }

  async function endSession() {
    if (!sessionStarted) {
      return;
    }
    running = false;
    paused = false;
    pauseBtn.disabled = true;
    endBtn.disabled = true;

    const payload = await finishSession();
    statusEl.textContent = 'Finished';
    statusEl.dataset.state = 'finished';

    if (payload && typeof options.onResults === 'function') {
      options.onResults(payload);
    }
  }

  function togglePause() {
    if (!sessionStarted || !running) {
      return;
    }
    paused = !paused;
    if (!paused) {
      tick();
    } else {
      statusEl.textContent = 'Paused';
      statusEl.dataset.state = 'paused';
      draw();
    }
  }

  draw();

  if (simulate) {
    window.setTimeout(async () => {
      try {
        await window.ArcadeAuth.api(`/api/games/${options.slug}/session`, {
          method: 'POST',
          body: JSON.stringify({ difficulty: 'normal' }),
        });
        startSession();
      } catch {
        startSession();
      }
    }, 300);
  }

  return {
    startSession,
    endSession,
    togglePause,
    getScore: () => score,
  };
}

window.ArcadeGame = { createGame };
