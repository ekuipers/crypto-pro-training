// ============================================================
// AUTH (client) — account button + sign-in modal (Suite SSO)
// ------------------------------------------------------------
// Ported from CryptoPro Charts' src/js/auth.js, adapted to this project's own
// modal convention (#authModalBackdrop + .style.display, matching CryptoPro
// Trader's client/src/fragments/modals.html pattern) instead of Charts'
// generic showModal()/closeModal() helpers, which don't exist here. Talks to
// /api/me, /api/auth/*. Session data is scoped server-side via the cookie,
// so signing in/out is just a page reload.
// ============================================================

let _authCurrentUser = null;

function authEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Renders the otpauth:// URI as a QR image via the vendored qrcode-lib.js
// (global `qrcode`, loaded alongside this script — see scriptLoader.js's
// loadAuthScript()). Falls back to the plain link if the library didn't load.
function totpQrTag(otpauthUri) {
  if (typeof window.qrcode !== 'function') return `<p class="small">${authEsc(otpauthUri)}</p>`;
  const qr = window.qrcode(0, 'M');
  qr.addData(otpauthUri);
  qr.make();
  return qr.createImgTag(6, 8, '2FA setup QR code');
}

function openAuthModal() {
  document.getElementById('authModalBackdrop').style.display = 'flex';
}
function closeAuthModal() {
  document.getElementById('authModalBackdrop').style.display = 'none';
}

function renderAuthView(title, bodyHtml, footerHtml) {
  document.getElementById('authModalBody').innerHTML = `
    <div class="modal-header">
      <div class="modal-title">${authEsc(title)}</div>
      <button onclick="closeAuthModal()">✕</button>
    </div>
    <div class="modal-body">${bodyHtml}</div>
    <div class="modal-footer">${footerHtml}</div>
  `;
  openAuthModal();
}

async function fetchMe() {
  try {
    const r = await fetch('/api/me');
    if (!r.ok) return { user: null };
    return await r.json();
  } catch {
    return { user: null };
  }
}

function renderAccountButton(user) {
  const btn = document.getElementById('accountBtn');
  if (!btn) return;
  if (user) {
    const name = user.displayName || user.username;
    btn.innerHTML = `<span class="acct-avatar-fallback">${authEsc(name.charAt(0).toUpperCase())}</span><span class="acct-name">${authEsc(name)}</span>`;
    btn.title = `Signed in as ${name}`;
  } else {
    btn.innerHTML = '👤 Sign in';
    btn.title = 'Sign in to your CryptoPro Suite account';
  }
}

// One form, two explicit actions — "Create account" and "Sign in" both submit
// the same username/password. No mode toggle, so the visible "Create account"
// button always creates the account (rather than just re-rendering the form).
function openSignInModal() {
  renderAuthView(
    'Sign in to CryptoPro Training',
    `
    <p class="small">New here? Pick a username and password and choose <b>Create account</b>. The same account signs you into every CryptoPro Suite app.</p>
    <div class="auth-field"><label>Username</label><input id="authUser" autocomplete="username" placeholder="3-32 letters, digits, . _ -"></div>
    <div class="auth-field"><label>Password</label><input id="authPass" type="password" autocomplete="current-password" placeholder="at least 6 characters"></div>
    <div class="auth-field" id="authTotpRow" style="display:none"><label>2FA code</label><input id="authTotp" inputmode="numeric" autocomplete="one-time-code" placeholder="6-digit code" maxlength="6"></div>
    <div class="auth-err" id="authErr"></div>
    `,
    `<button id="authRegisterBtn">Create account</button>
     <button class="primary" id="authLoginBtn">Sign in</button>`,
  );

  const userEl = document.getElementById('authUser');
  const passEl = document.getElementById('authPass');
  const totpRow = document.getElementById('authTotpRow');
  const totpEl = document.getElementById('authTotp');
  const errEl = document.getElementById('authErr');
  const buttons = [document.getElementById('authRegisterBtn'), document.getElementById('authLoginBtn')];
  userEl.focus();

  let busy = false;
  const go = async (action) => {
    if (busy) return;
    const username = userEl.value.trim();
    const password = passEl.value;
    if (!username || !password) { errEl.textContent = 'Enter a username and password.'; return; }
    busy = true; buttons.forEach(b => (b.disabled = true));
    errEl.textContent = action === 'register' ? 'Creating account…' : 'Signing in…';
    const reset = () => { busy = false; buttons.forEach(b => (b.disabled = false)); };
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const body = { username, password };
      if (action === 'login' && totpRow.style.display !== 'none') body.totpCode = totpEl.value.trim();
      const r = await fetch(`/api/auth/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (data.requiresTotp) {
          totpRow.style.display = '';
          totpEl.focus();
          errEl.textContent = data.error || 'Enter your 2FA code.';
          reset();
          return;
        }
        errEl.textContent = data.error || (action === 'register' ? 'Could not create account.' : 'Sign-in failed.');
        reset();
        return;
      }
      window.location.reload();
    } catch (e) {
      errEl.textContent = e.name === 'AbortError' ? 'Server did not respond — please try again.' : 'Network error — try again.';
      reset();
    } finally {
      clearTimeout(timer);
    }
  };
  document.getElementById('authRegisterBtn').addEventListener('click', () => go('register'));
  document.getElementById('authLoginBtn').addEventListener('click', () => go('login'));
  totpEl.addEventListener('keydown', e => { if (e.key === 'Enter') go('login'); });
  passEl.addEventListener('keydown', e => { if (e.key === 'Enter') go('login'); });
}

function openChangePasswordModal() {
  renderAuthView(
    'Change password',
    `
    <div class="auth-field"><label>Current password</label><input id="authCpCur" type="password" autocomplete="current-password"></div>
    <div class="auth-field"><label>New password</label><input id="authCpNew" type="password" autocomplete="new-password" placeholder="at least 6 characters"></div>
    <div class="auth-err" id="authCpErr"></div>
    `,
    `<button onclick="closeAuthModal()">Cancel</button>
     <button class="primary" id="authCpSaveBtn">Save</button>`,
  );
  document.getElementById('authCpSaveBtn').addEventListener('click', async () => {
    const errEl = document.getElementById('authCpErr');
    const currentPassword = document.getElementById('authCpCur').value;
    const newPassword = document.getElementById('authCpNew').value;
    if (!currentPassword || newPassword.length < 6) { errEl.textContent = 'Enter your current password and a new one (6+ chars).'; return; }
    try {
      const r = await fetch('/api/auth/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { errEl.textContent = data.error || 'Could not change password.'; return; }
      closeAuthModal();
    } catch { errEl.textContent = 'Network error — try again.'; }
  });
}

function openSetupTotpModal() {
  renderAuthView('Enable 2FA', '<p class="small">Loading…</p>', '');
  (async () => {
    let setup;
    try {
      const r = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      setup = await r.json();
      if (!r.ok) throw new Error(setup.error || 'Setup failed');
    } catch (e) {
      renderAuthView('Enable 2FA', `<p class="auth-err">${authEsc(e.message)}</p>`, '<button onclick="closeAuthModal()">Close</button>');
      return;
    }
    renderAuthView(
      'Enable 2FA',
      `
      <p class="small">Scan this into any TOTP authenticator app (Google Authenticator, Authy, 1Password…), or enter the secret manually.</p>
      <div class="totp-qr">${totpQrTag(setup.otpauthUri)}</div>
      <div class="totp-secret">${authEsc(setup.secret)}</div>
      <div class="auth-field"><label>Enter the 6-digit code from your app to confirm</label><input id="authTfCode" inputmode="numeric" maxlength="6" placeholder="000000"></div>
      <div class="auth-err" id="authTfErr"></div>
      `,
      `<button onclick="closeAuthModal()">Cancel</button>
       <button class="primary" id="authTfConfirmBtn">Enable</button>`,
    );
    document.getElementById('authTfCode').focus();
    document.getElementById('authTfConfirmBtn').addEventListener('click', async () => {
      const errEl = document.getElementById('authTfErr');
      try {
        const r = await fetch('/api/auth/2fa/enable', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: document.getElementById('authTfCode').value.trim() }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) { errEl.textContent = data.error || 'Invalid code.'; return; }
        window.location.reload();
      } catch { errEl.textContent = 'Network error — try again.'; }
    });
  })();
}

function openDisableTotpModal() {
  renderAuthView(
    'Disable 2FA',
    `
    <div class="auth-field"><label>Confirm your password</label><input id="authDtPass" type="password" autocomplete="current-password"></div>
    <div class="auth-err" id="authDtErr"></div>
    `,
    `<button onclick="closeAuthModal()">Cancel</button>
     <button class="danger" id="authDtConfirmBtn">Disable</button>`,
  );
  document.getElementById('authDtConfirmBtn').addEventListener('click', async () => {
    const errEl = document.getElementById('authDtErr');
    try {
      const r = await fetch('/api/auth/2fa/disable', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: document.getElementById('authDtPass').value }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { errEl.textContent = data.error || 'Could not disable 2FA.'; return; }
      window.location.reload();
    } catch { errEl.textContent = 'Network error — try again.'; }
  });
}

function openAccountModal(user) {
  const name = user.displayName || user.username;
  renderAuthView(
    'Account',
    `
    <div class="acct-card">
      <span class="acct-avatar-fallback acct-avatar-lg">${authEsc(name.charAt(0).toUpperCase())}</span>
      <div>
        <div class="acct-card-name">${authEsc(name)}</div>
        <div class="small">@${authEsc(user.username)}</div>
      </div>
    </div>
    <p class="small">This account is shared across every CryptoPro Suite app.</p>
    `,
    `<button id="authChangePwBtn">Change password</button>
     <button id="authTotpBtn">${user.totpEnabled ? 'Disable 2FA' : 'Enable 2FA'}</button>
     <button onclick="closeAuthModal()">Close</button>
     <button class="danger" id="authLogoutBtn">Sign out</button>`,
  );
  document.getElementById('authChangePwBtn').addEventListener('click', openChangePasswordModal);
  document.getElementById('authTotpBtn').addEventListener('click', () => (user.totpEnabled ? openDisableTotpModal() : openSetupTotpModal()));
  document.getElementById('authLogoutBtn').addEventListener('click', async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    window.location.reload();
  });
}

async function initAuth() {
  const me = await fetchMe();
  _authCurrentUser = me.user;
  renderAccountButton(me.user);
  const btn = document.getElementById('accountBtn');
  if (btn) btn.addEventListener('click', () => (_authCurrentUser ? openAccountModal(_authCurrentUser) : openSignInModal()));
}

initAuth();
