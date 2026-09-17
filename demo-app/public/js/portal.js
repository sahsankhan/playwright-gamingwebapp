const NAV_ITEMS = [
  { href: '/lobby.html', label: 'Lobby', testId: 'nav-lobby' },
  { href: '/shop.html', label: 'Shop', testId: 'nav-shop' },
  { href: '/leaderboard.html', label: 'Leaderboard', testId: 'nav-leaderboard' },
  { href: '/profile.html', label: 'Profile', testId: 'nav-profile' },
  { href: '/settings.html', label: 'Settings', testId: 'nav-settings' },
];

function renderTopbar(activePath) {
  const root = document.getElementById('portal-topbar');
  if (!root) {
    return;
  }

  const user = window.ArcadeAuth.getUser();
  root.innerHTML = `
    <div class="topbar-main">
      <div class="brand">Arcade <span>Portal</span></div>
      <nav class="nav-links" data-test="main-nav">
        ${NAV_ITEMS.map(
          (item) => `
            <a href="${item.href}"
               data-test="${item.testId}"
               class="${activePath === item.href ? 'active' : ''}">${item.label}</a>
          `,
        ).join('')}
      </nav>
    </div>
    <div class="topbar-actions">
      <div class="pill" data-test="coin-balance">Coins: <strong id="coin-balance">${user?.coins ?? 0}</strong></div>
      <span class="muted">Signed in as </span>
      <strong data-test="portal-username">${user?.username ?? 'Player'}</strong>
      <button id="logout-btn" class="secondary" data-test="logout-btn" type="button">Logout</button>
    </div>
  `;

  window.ArcadeAuth.bindLogout();
}

async function refreshWallet() {
  const payload = await window.ArcadeAuth.api('/api/me');
  window.ArcadeAuth.setSession(window.ArcadeAuth.getToken(), payload);

  const coinEl = document.getElementById('coin-balance');
  if (coinEl) {
    coinEl.textContent = String(payload.coins);
  }

  const usernameEl = document.querySelector('[data-test="portal-username"]');
  if (usernameEl) {
    usernameEl.textContent = payload.username;
  }

  return payload;
}

function bindFilterTabs(onChange) {
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach((entry) => entry.classList.remove('active'));
      button.classList.add('active');
      onChange(button.dataset.filter ?? 'all');
    });
  });
}

window.ArcadePortal = {
  renderTopbar,
  refreshWallet,
  bindFilterTabs,
};
