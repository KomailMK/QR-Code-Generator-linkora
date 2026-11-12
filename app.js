'use strict';

(() => {
  const $ = (id) => document.getElementById(id);

  const state = {
    platform: 'Website',
    customPlatform: '',
    style: 'minimal',
    user: null,
    profile: null,
    history: [],
    qrReady: false,
    qrTimer: null,
    activeView: 'studio'
  };

  const platformIcons = {
    Website: '🌐',
    YouTube: '▶',
    Instagram: '◎',
    LinkedIn: 'in',
    TikTok: '♪',
    Facebook: 'f',
    X: '𝕏',
    WhatsApp: '✆',
    Spotify: '≈',
    Other: '✦'
  };

  const iconForPlatform = (platform) => platformIcons[platform] || '✦';

  const platformSvgPaths = {
    Instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
    TikTok: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z',
    WhatsApp: 'M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.33 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41',
    Spotify: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z'
  };

  const presets = {
    Website:   { accent: '#A2CB4B', foreground: '#1B2419', background: '#FFFFFF', card: '#FFFFFF', text: '#171A17' },
    YouTube:   { accent: '#E64B43', foreground: '#1D1D1D', background: '#FFFFFF', card: '#FFFDFC', text: '#171A17' },
    Instagram: { accent: '#C56F9D', foreground: '#2D1D2B', background: '#FFFFFF', card: '#FFF9FC', text: '#2D1D2B' },
    LinkedIn:  { accent: '#4B91C5', foreground: '#173348', background: '#FFFFFF', card: '#F7FBFF', text: '#172A38' },
    TikTok:    { accent: '#67C9BE', foreground: '#101A1A', background: '#FFFFFF', card: '#F4FFFC', text: '#101A1A' },
    Facebook:  { accent: '#6C8DD4', foreground: '#1F3157', background: '#FFFFFF', card: '#F7F9FF', text: '#182642' },
    X:         { accent: '#9DA69B', foreground: '#171A17', background: '#FFFFFF', card: '#FFFFFF', text: '#171A17' },
    WhatsApp:  { accent: '#76BE77', foreground: '#1F3C25', background: '#FFFFFF', card: '#F7FFF7', text: '#18351D' },
    Spotify:   { accent: '#8EC65D', foreground: '#17331F', background: '#FFFFFF', card: '#F7FFF3', text: '#17331F' },
    Other:     { accent: '#A2CB4B', foreground: '#1B2419', background: '#FFFFFF', card: '#FFFFFF', text: '#171A17' }
  };

  const styleThemes = {
    minimal:   { card: '#FFFFFF', text: '#171A17', muted: '#747E6D', qrColor: '#1B2419', qrBg: '#FFFFFF', accent: '#A2CB4B', gradient: null },
    spotlight: { card: '#1C241A', text: '#F4F6EF', muted: '#B6C2AE', qrColor: '#1B2419', qrBg: '#FFFFFF', accent: '#CAFA69', gradient: null },
    gradient:  { card: '#EDF8D9', text: '#1A261C', muted: '#5F6E62', qrColor: '#1E3224', qrBg: '#FFFFFF', accent: '#8FC249', gradient: ['#EDF8D9', '#E3EDFA'] },
    frame:     { card: '#FFFFFF', text: '#171A17', muted: '#747E6D', qrColor: '#1B2419', qrBg: '#FFFFFF', accent: '#B7EC4C', gradient: null },
    navy:      { card: '#0D1B32', text: '#F2F7FF', muted: '#AFC3DE', qrColor: '#102A4C', qrBg: '#FFFFFF', accent: '#66B2FF', gradient: ['#0D1B32', '#244D7F'] },
    purple:    { card: '#2B1742', text: '#F8F2FF', muted: '#CFBBE6', qrColor: '#2B1742', qrBg: '#FFFFFF', accent: '#D09CFA', gradient: ['#2B1742', '#7854A9'] },
    pink:      { card: '#FFF0F7', text: '#4A1932', muted: '#8A526D', qrColor: '#6C2548', qrBg: '#FFFFFF', accent: '#E07AA8', gradient: ['#FFF0F7', '#EDB0CC'] },
    blue:      { card: '#EAF5FF', text: '#122E4D', muted: '#527296', qrColor: '#183C63', qrBg: '#FFFFFF', accent: '#5AA6E8', gradient: ['#EAF5FF', '#7CB9EC'] }
  };

  const safe = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const hex = (s, fallback = '#000000') => {
    const val = String(s || fallback).trim();
    return /^#[0-9a-fA-F]{6}$/.test(val) ? val.toUpperCase() : fallback.toUpperCase();
  };

  const showToast = (msg, isError = false) => {
    const el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('error', Boolean(isError));
    el.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => el.classList.remove('show'), 2800);
  };

  // Universal tactile tap/press feedback for both logged-out and logged-in users
  const bindUniversalTapEffects = () => {
    const interactiveSelector =
      '.btn, .nav-links a, .nav-links button, .footer-links a, .brand, .signed-user, .platform-option, .style-option, .icon-btn, .color-field, .switch, .faq-item summary';

    const clearPressed = () => {
      document.querySelectorAll('.is-pressed').forEach((el) => el.classList.remove('is-pressed'));
    };

    document.addEventListener('pointerdown', (e) => {
      const target = e.target.closest(interactiveSelector);
      if (target && !target.disabled) {
        target.classList.add('is-pressed');
      }
    }, { passive: true });

    ['pointerup', 'pointercancel', 'mouseleave', 'dragend'].forEach((evt) => {
      document.addEventListener(evt, clearPressed, { passive: true });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const target = e.target.closest(interactiveSelector);
      if (target && !target.disabled) {
        target.classList.add('is-pressed');
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      clearPressed();
    });
  };

  // Smooth inertia expand & collapse animations for FAQ accordions
  const bindSmoothAccordions = () => {
  document.querySelectorAll('.faq-item').forEach((details) => {
    const summary = details.querySelector('summary');
    const content = details.querySelector('p');
    if (!summary || !content) return;

    let heightAnim = null;
    let contentAnim = null;
    let isClosing = false;
    let isExpanding = false;

    const cleanup = () => {
      details.style.height = '';
      details.style.overflow = '';
      details.classList.remove('is-closing');
      isClosing = false;
      isExpanding = false;
      heightAnim = null;
      contentAnim = null;
    };

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        details.open = !details.open;
        return;
      }

      const startHeight = `${details.offsetHeight}px`;
      details.style.overflow = 'hidden';

      if (isClosing || !details.open) {
        if (heightAnim) heightAnim.cancel();
        if (contentAnim) contentAnim.cancel();
        details.classList.remove('is-closing');
        isClosing = false;
        isExpanding = true;
        details.style.height = startHeight;
        details.open = true;

        // Wait for browser to paint the 'open' state before measuring
        requestAnimationFrame(() => {
          const endHeight = `${summary.offsetHeight + content.offsetHeight}px`;
          heightAnim = details.animate(
            [{ height: startHeight }, { height: endHeight }],
            { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
          );
          contentAnim = content.animate(
            [
              { opacity: 0, transform: 'translateY(-6px)' },
              { opacity: 1, transform: 'translateY(0)' }
            ],
            { duration: 380, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
          );
          heightAnim.onfinish = () => cleanup();
          heightAnim.oncancel = () => { isExpanding = false; };
        });
      } else if (isExpanding || details.open) {
        if (heightAnim) heightAnim.cancel();
        if (contentAnim) contentAnim.cancel();
        details.classList.add('is-closing');
        isExpanding = false;
        isClosing = true;

        const endHeight = `${summary.offsetHeight}px`;
        heightAnim = details.animate(
          [{ height: startHeight }, { height: endHeight }],
          { duration: 340, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
        contentAnim = content.animate(
          [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-4px)' }
          ],
          { duration: 250, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
        heightAnim.onfinish = () => {
          details.open = false;
          cleanup();
        };
        heightAnim.oncancel = () => {
          details.classList.remove('is-closing');
          isClosing = false;
        };
      }
    });
  });
};

  const currentPlatform = () =>
    state.platform === 'Other' ? (state.customPlatform.trim() || 'Other') : state.platform;

  const normalizeUrl = (rawInput) => {
    const raw = String(rawInput ?? '').trim();
    if (!raw) return '';
    try {
      const parsed = new URL(raw);
      if (['http:', 'https:', 'mailto:', 'tel:', 'sms:'].includes(parsed.protocol)) {
        return parsed.href;
      }
    } catch {}
    try {
      return new URL('https://' + raw).href;
    } catch {
      return '';
    }
  };

  const destination = () => normalizeUrl($('url-input')?.value || '');

  const shortDomain = (raw) => {
    const cleanRaw = String(raw || '').trim();
    if (!cleanRaw) return 'your-link-here.com';
    try {
      const u = new URL(cleanRaw);
      if (u.protocol === 'mailto:' || u.protocol === 'tel:' || u.protocol === 'sms:') {
        return u.pathname;
      }
      return (u.hostname.replace(/^www\./, '') + (u.pathname !== '/' ? u.pathname : '')).slice(0, 48);
    } catch {
      return cleanRaw.slice(0, 48) || 'your-link-here.com';
    }
  };

  const readDesign = () => ({
    style: state.style,
    qrColor: hex($('qr-color')?.value, '#1B2419'),
    qrBackground: hex($('qr-bg')?.value, '#FFFFFF'),
    cardBackground: hex($('card-bg')?.value, '#FFFFFF'),
    accentColor: hex($('accent-color')?.value, '#A2CB4B'),
    cardTextColor: hex($('card-text-color')?.value, '#171A17'),
    qrSize: Number($('qr-size')?.value) || 190,
    showUrl: Boolean($('show-url')?.checked),
    showBrand: Boolean($('show-brand')?.checked),
    title: ($('card-title')?.value || '').trim() || 'Scan to connect',
    subtitle: ($('card-subtitle')?.value || '').trim(),
    platform: currentPlatform()
  });

  const setColorLabel = (id) => {
    const input = $(id);
    const label = $(id + '-value');
    if (input && label) label.textContent = hex(input.value);
  };

  const applyColorPreset = (platform) => {
    const p = presets[platform] || presets.Other;
    const styleTheme = styleThemes[state.style] || styleThemes.minimal;

    $('accent-color').value = p.accent;
    $('qr-color').value = p.foreground;
    $('qr-bg').value = p.background;

    if (state.style === 'minimal' || state.style === 'frame') {
      $('card-bg').value = p.card;
      $('card-text-color').value = p.text;
    } else {
      $('card-bg').value = styleTheme.card;
      $('card-text-color').value = styleTheme.text;
    }

    ['qr-color', 'qr-bg', 'card-bg', 'accent-color', 'card-text-color'].forEach(setColorLabel);

    if (platform === 'YouTube') {
      $('card-title').value = 'Watch something great';
      $('card-subtitle').value = 'Tap into the next video.';
    } else if (platform === 'Instagram') {
      $('card-title').value = 'Follow along';
      $('card-subtitle').value = 'A little more life, in one scan.';
    } else if (platform === 'LinkedIn') {
      $('card-title').value = "Let's connect";
      $('card-subtitle').value = 'Find me on LinkedIn.';
    } else if (platform === 'Spotify') {
      $('card-title').value = 'Press play';
      $('card-subtitle').value = 'Good things sound better shared.';
    } else if (platform === 'WhatsApp') {
      $('card-title').value = 'Say hello';
      $('card-subtitle').value = 'Scan to start a conversation.';
    } else {
      $('card-title').value = 'Scan to connect';
      $('card-subtitle').value = 'Your next click starts here.';
    }
  };

  const setPlatform = (platform, doPreset = false) => {
    state.platform = platform;
    document.querySelectorAll('.platform-option').forEach((b) => {
      b.classList.toggle('active', b.dataset.platform === platform);
    });
    const customWrap = $('custom-platform-wrap');
    if (customWrap) {
      customWrap.classList.toggle('hidden', platform !== 'Other');
      if (platform === 'Other') $('custom-platform')?.focus();
    }
    if (doPreset) applyColorPreset(platform);
    updatePreview();
  };

  const setStyle = (style, applyThemeColors = true) => {
    state.style = styleThemes[style] ? style : 'minimal';
    document.querySelectorAll('.style-option').forEach((b) => {
      b.classList.toggle('active', b.dataset.style === state.style);
    });

    if (applyThemeColors) {
      const theme = styleThemes[state.style];
      $('card-bg').value = theme.card;
      $('card-text-color').value = theme.text;
      $('qr-color').value = theme.qrColor;
      $('qr-bg').value = theme.qrBg;
      $('accent-color').value = theme.accent;
      ['qr-color', 'qr-bg', 'card-bg', 'accent-color', 'card-text-color'].forEach(setColorLabel);
    }
    updatePreview();
  };

  /**
   * Generates a standalone <canvas> with the QR code.
   * Copies pixels onto a fresh canvas so qrcode.min.js's async makeImage() callback
   * can never hide the visible DOM canvas.
   */
  const createQrCanvas = (text, size, darkColor, lightColor) => {
    if (!window.QRCode || !text) return null;
    const temp = document.createElement('div');
    const qrPixelSize = Math.max(128, Math.round(size || 256));
    new window.QRCode(temp, {
      text,
      width: qrPixelSize,
      height: qrPixelSize,
      colorDark: darkColor || '#1B2419',
      colorLight: lightColor || '#FFFFFF',
      correctLevel: window.QRCode.CorrectLevel.H
    });
    const srcCanvas = temp.querySelector('canvas');
    if (!srcCanvas) return null;

    const cleanCanvas = document.createElement('canvas');
    cleanCanvas.width = srcCanvas.width;
    cleanCanvas.height = srcCanvas.height;
    const ctx = cleanCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(srcCanvas, 0, 0);
    return cleanCanvas;
  };

  const getStyleBackgroundCSS = (style, cardBg) => {
    const theme = styleThemes[style];
    const defaultCard = theme ? theme.card.toUpperCase() : '#FFFFFF';
    const userCard = hex(cardBg, defaultCard);
    if (theme && theme.gradient && userCard === defaultCard) {
      return `linear-gradient(145deg, ${theme.gradient[0]}, ${theme.gradient[1]})`;
    }
    return userCard;
  };

  const getMutedTextColor = (textColor, style) => {
    const theme = styleThemes[style];
    if (theme && hex(textColor) === hex(theme.text)) {
      return theme.muted;
    }
    const c = hex(textColor).slice(1);
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? 'rgba(244, 246, 239, 0.74)' : 'rgba(23, 26, 23, 0.62)';
  };

  const getLocalStats = () => {
    try {
      const raw = localStorage.getItem('linkora_qr_stats');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const recordLocalStat = (platform) => {
    try {
      const list = getLocalStats();
      list.unshift({ platform: platform || 'Website', created_at: new Date().toISOString() });
      localStorage.setItem('linkora_qr_stats', JSON.stringify(list.slice(0, 200)));
    } catch {}
    updateStats();
  };

  const updateStats = () => {
    const sourceItems = state.user && state.history.length ? state.history : getLocalStats();
    const count = sourceItems.length;
    const platformsCount = new Set(sourceItems.map((i) => i.platform || 'Website')).size;
    let lastCreated = '—';
    if (count > 0 && sourceItems[0]?.created_at) {
      const d = new Date(sourceItems[0].created_at);
      if (!Number.isNaN(d.getTime())) {
        lastCreated = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }

    if ($('stat-created')) $('stat-created').textContent = String(count);
    if ($('stat-platforms')) $('stat-platforms').textContent = String(platformsCount);
    if ($('stat-last')) $('stat-last').textContent = lastCreated;
  };

  const updatePreview = () => {
    const d = readDesign();
    const url = destination();
    const card = $('qr-card-preview');
    if (!card) return;

    card.className = `qr-card-preview ${d.style}`;
    card.style.background = getStyleBackgroundCSS(d.style, d.cardBackground);
    card.style.color = d.cardTextColor;
    card.style.borderColor = d.style === 'frame' ? d.accentColor : 'rgba(255, 255, 255, .75)';
    card.style.setProperty('--preview-accent', d.accentColor);
    card.style.setProperty('--preview-text', d.cardTextColor);
    card.style.setProperty('--preview-muted', getMutedTextColor(d.cardTextColor, d.style));
    card.style.setProperty('--qr-paper', d.qrBackground);

    const iconEl = $('preview-platform-icon');
    if (iconEl) {
      if (platformSvgPaths[state.platform]) {
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${platformSvgPaths[state.platform]}"/></svg>`;
      } else {
        iconEl.textContent = iconForPlatform(state.platform);
      }
      iconEl.style.background = d.accentColor;
      iconEl.style.color = '#171A17';
    }

    const kickerEl = $('preview-kicker');
    if (kickerEl) {
      kickerEl.textContent = d.platform.toUpperCase();
      kickerEl.style.color = d.accentColor;
    }

    const titleEl = $('preview-title');
    if (titleEl) {
      titleEl.textContent = d.title;
      titleEl.style.color = d.cardTextColor;
    }

    const subEl = $('preview-subtitle');
    if (subEl) {
      subEl.textContent = d.subtitle;
      subEl.classList.toggle('hidden', !d.subtitle);
    }

    const holder = $('preview-qr-holder');
    if (holder) {
      holder.style.width = `${d.qrSize}px`;
      holder.style.height = `${d.qrSize}px`;
      holder.style.background = d.qrBackground;
      holder.innerHTML = '';

      if (url) {
        const qrCanvas = createQrCanvas(url, (d.qrSize - 22) * 3, d.qrColor, d.qrBackground);
        if (qrCanvas) {
          holder.appendChild(qrCanvas);
          state.qrReady = true;
        }
      } else {
        state.qrReady = false;
        const ph = document.createElement('div');
        ph.className = 'qr-placeholder';
        ph.innerHTML = 'Your QR code<br>will appear here';
        holder.appendChild(ph);
      }
    }

    const urlEl = $('preview-url');
    if (urlEl) {
      urlEl.textContent = shortDomain(url);
      urlEl.classList.toggle('hidden', !d.showUrl);
    }

    const brandEl = $('preview-brand');
    if (brandEl) {
      brandEl.style.visibility = d.showBrand ? 'visible' : 'hidden';
    }

    const sizeLabel = $('qr-size-value');
    if (sizeLabel) sizeLabel.textContent = `${d.qrSize} px`;
  };

  const roundRectPath = (ctx, x, y, w, h, r) => {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  };

  const wrapCanvasText = (ctx, text, maxWidth) => {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const lines = [];
    let current = words[0];

    for (let i = 1; i < words.length; i++) {
      const candidate = current + ' ' + words[i];
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        lines.push(current);
        current = words[i];
      }
    }
    lines.push(current);
    return lines;
  };

  /**
   * Pixel-Perfect High-DPI Card Renderer
   */
  const renderCardToCanvas = async (designInput, targetUrl, platformOverride, scale = 3) => {
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch {}
    }

    const d = {
      style: designInput?.style || 'minimal',
      qrColor: hex(designInput?.qrColor, '#1B2419'),
      qrBackground: hex(designInput?.qrBackground, '#FFFFFF'),
      cardBackground: hex(designInput?.cardBackground, '#FFFFFF'),
      accentColor: hex(designInput?.accentColor, '#A2CB4B'),
      cardTextColor: hex(designInput?.cardTextColor, '#171A17'),
      qrSize: Number(designInput?.qrSize) || 190,
      showUrl: designInput?.showUrl !== false,
      showBrand: designInput?.showBrand !== false,
      title: (designInput?.title || 'Scan to connect').trim(),
      subtitle: (designInput?.subtitle || '').trim(),
      platform: platformOverride || designInput?.platform || 'Website'
    };

    const cardWidth = 302;
    const paddingX = 20;
    const paddingTop = d.style === 'frame' ? 16 : 20;
    const paddingBottom = 16;
    const maxTextWidth = cardWidth - paddingX * 2;

    const measureCanvas = document.createElement('canvas');
    const mctx = measureCanvas.getContext('2d');

    mctx.font = "600 25px 'Space Grotesk', sans-serif";
    const titleLines = wrapCanvasText(mctx, d.title, maxTextWidth);
    const titleLineHeight = 27.5;
    const titleBlockHeight = titleLines.length * titleLineHeight;

    mctx.font = "400 11px 'DM Sans', sans-serif";
    const subtitleLines = d.subtitle ? wrapCanvasText(mctx, d.subtitle, 225) : [];
    const subtitleLineHeight = 16;
    const subtitleBlockHeight = subtitleLines.length ? subtitleLines.length * subtitleLineHeight + 16 : 8;

    const headerHeight = 31 + 15;
    const urlHeight = d.showUrl ? 14 + 14 : 0;
    const footerHeight = 17 + 14;

    const calculatedHeight =
      paddingTop +
      headerHeight +
      titleBlockHeight +
      8 +
      subtitleBlockHeight +
      d.qrSize +
      urlHeight +
      footerHeight +
      paddingBottom;

    const cardHeight = Math.max(350, Math.ceil(calculatedHeight));

    const canvas = document.createElement('canvas');
    canvas.width = cardWidth * scale;
    canvas.height = cardHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    ctx.save();
    roundRectPath(ctx, 0, 0, cardWidth, cardHeight, 24);
    ctx.clip();

    const theme = styleThemes[d.style];
    const defaultCardHex = theme ? hex(theme.card) : '#FFFFFF';
    if (theme && theme.gradient && hex(d.cardBackground) === defaultCardHex) {
      const grad = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
      grad.addColorStop(0, theme.gradient[0]);
      grad.addColorStop(1, theme.gradient[1]);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = d.cardBackground;
    }
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    const sheenAlpha = d.style === 'spotlight' || d.style === 'navy' || d.style === 'purple' ? 0.08 : 0.22;
    const sheen = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
    sheen.addColorStop(0, `rgba(255, 255, 255, ${sheenAlpha * 1.4})`);
    sheen.addColorStop(0.4, 'rgba(255, 255, 255, 0)');
    sheen.addColorStop(1, `rgba(255, 255, 255, ${sheenAlpha})`);
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    if (d.style === 'frame') {
      ctx.strokeStyle = d.accentColor;
      ctx.lineWidth = 10;
      roundRectPath(ctx, 0, 0, cardWidth, cardHeight, 24);
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 2;
      roundRectPath(ctx, 0, 0, cardWidth, cardHeight, 24);
      ctx.stroke();
    }

    const innerBorderAlpha =
      d.style === 'spotlight' ? 0.22 : d.style === 'navy' || d.style === 'purple' ? 0.36 : 0.74;
    ctx.strokeStyle = `rgba(255, 255, 255, ${innerBorderAlpha})`;
    ctx.lineWidth = 1;
    roundRectPath(ctx, 8, 8, cardWidth - 16, cardHeight - 16, 13);
    ctx.stroke();

    let cursorY = paddingTop;

    const kickerText = d.platform.toUpperCase();
    ctx.font = "700 10px 'DM Sans', sans-serif";
    const kickerWidth = ctx.measureText(kickerText).width + kickerText.length * 1.4;
    const iconBoxSize = 31;
    const gap = 9;
    const totalPlatformWidth = iconBoxSize + gap + kickerWidth;
    const startX = (cardWidth - totalPlatformWidth) / 2;

    ctx.save();
    ctx.translate(startX + iconBoxSize / 2, cursorY + iconBoxSize / 2);
    ctx.rotate((-5 * Math.PI) / 180);
    ctx.shadowColor = 'rgba(18, 28, 15, 0.14)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    roundRectPath(ctx, -iconBoxSize / 2, -iconBoxSize / 2, iconBoxSize, iconBoxSize, 11);
    ctx.fillStyle = d.accentColor;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#171A17';
    ctx.font = "700 13px 'Space Grotesk', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const knownPlatform = Object.keys(platformIcons).find(
      (k) => k.toLowerCase() === d.platform.toLowerCase()
    );
    ctx.fillText(iconForPlatform(knownPlatform || 'Other'), 0, 1);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = d.accentColor;
    ctx.font = "700 10px 'DM Sans', sans-serif";
    ctx.textBaseline = 'middle';
    let kx = startX + iconBoxSize + gap;
    const ky = cursorY + iconBoxSize / 2 + 1;
    for (const ch of kickerText) {
      ctx.fillText(ch, kx, ky);
      kx += ctx.measureText(ch).width + 1.4;
    }
    ctx.restore();

    cursorY += iconBoxSize + 15;

    ctx.save();
    ctx.fillStyle = d.cardTextColor;
    ctx.font = "600 25px 'Space Grotesk', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (const line of titleLines) {
      ctx.fillText(line, cardWidth / 2, cursorY);
      cursorY += titleLineHeight;
    }
    ctx.restore();

    cursorY += 6;

    const mutedColor = getMutedTextColor(d.cardTextColor, d.style);
    if (subtitleLines.length) {
      ctx.save();
      ctx.fillStyle = mutedColor;
      ctx.font = "400 11px 'DM Sans', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (const line of subtitleLines) {
        ctx.fillText(line, cardWidth / 2, cursorY);
        cursorY += subtitleLineHeight;
      }
      ctx.restore();
      cursorY += 14;
    } else {
      cursorY += 8;
    }

    const qrBoxSize = d.qrSize;
    const qrBoxX = (cardWidth - qrBoxSize) / 2;
    const qrBoxY = cursorY;

    ctx.save();
    ctx.shadowColor = 'rgba(21, 31, 16, 0.12)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    roundRectPath(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 13);
    ctx.fillStyle = d.qrBackground;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const qrInnerPad = 11;
    const qrDrawSize = qrBoxSize - qrInnerPad * 2;
    const qrCanvas = createQrCanvas(
      targetUrl,
      qrDrawSize * scale,
      d.qrColor,
      d.qrBackground
    );
    if (qrCanvas) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(qrCanvas, qrBoxX + qrInnerPad, qrBoxY + qrInnerPad, qrDrawSize, qrDrawSize);
    }
    ctx.restore();

    cursorY += qrBoxSize;

    if (d.showUrl) {
      cursorY += 14;
      ctx.save();
      ctx.fillStyle = mutedColor;
      ctx.font = "500 10px 'DM Sans', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(shortDomain(targetUrl), cardWidth / 2, cursorY);
      ctx.restore();
    }

    const footerY = cardHeight - paddingBottom - 9;
    ctx.save();
    ctx.fillStyle = d.cardTextColor;
    ctx.font = "700 10px 'Space Grotesk', sans-serif";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('MADE TO BE SHARED', paddingX, footerY);

    if (d.showBrand) {
      ctx.fillStyle = mutedColor;
      ctx.font = "600 9px 'DM Sans', sans-serif";
      ctx.textAlign = 'right';
      ctx.fillText('LINKORA ✳', cardWidth - paddingX, footerY);
    }
    ctx.restore();

    ctx.restore();
    return canvas;
  };

  const triggerCanvasDownload = (canvas, filename) => {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const slugify = (str) =>
    String(str || 'linkora-qr')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'linkora-qr';

  const downloadCardPng = async (designOverride, urlOverride, platformOverride) => {
    const d = designOverride || readDesign();
    const url = urlOverride || destination();
    if (!url) {
      showToast('Paste a destination link first to generate your QR code.', true);
      $('url-input')?.focus();
      return;
    }
    try {
      const canvas = await renderCardToCanvas(d, url, platformOverride || d.platform, 3);
      triggerCanvasDownload(canvas, `${slugify(d.platform)}-${slugify(d.title)}-card.png`);
      recordLocalStat(platformOverride || d.platform);
      showToast('Branded QR card downloaded!');
    } catch (err) {
      console.error(err);
      showToast('Could not export the QR card image.', true);
    }
  };

  const shareViaEmail = (designOverride, urlOverride, platformOverride) => {
    const d = designOverride || readDesign();
    const url = urlOverride || destination();
    if (!url) {
      showToast('Enter a destination link before sharing via email.', true);
      $('url-input')?.focus();
      return;
    }

    const platform = platformOverride || d.platform || 'Website';
    const senderName =
      (state.profile && state.profile.display_name) ||
      (state.user && (state.user.name || state.user.email)) ||
      'Linkora QR Studio';

    const subject = `${d.title} — ${platform} Link & QR Card`;
    const bodyLines = [
      'Hello,',
      '',
      `Here are the ${platform} link and QR card details shared via ${senderName}:`,
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `  ${d.title.toUpperCase()}`,
      d.subtitle ? `  ${d.subtitle}` : null,
      '',
      `  • Platform:     ${platform}`,
      `  • Direct Link:  ${url}`,
      `  • Short Domain: ${shortDomain(url)}`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      'How to use:',
      '1. Open the direct link above on any device, or',
      '2. Scan the attached Linkora QR card with your phone camera.',
      '',
      'Best regards,',
      senderName,
      '—',
      'Generated with Linkora QR Studio'
    ].filter((line) => line !== null);

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\r\n'))}`;
    showToast('Opened email draft!');
  };

  const copyDestinationLink = async () => {
    const url = destination();
    if (!url) {
      showToast('Paste a destination link first.', true);
      $('url-input')?.focus();
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast('Destination link copied to clipboard!');
    } catch {
      showToast('Could not copy link automatically.', true);
    }
  };

  const switchView = (view) => {
    state.activeView = view;
    const pub = $('public-content');
    const hist = $('history-view');
    const prof = $('profile-view');

    if (pub) pub.classList.toggle('hidden', view !== 'studio');
    if (hist) hist.classList.toggle('hidden', view !== 'history');
    if (prof) prof.classList.toggle('hidden', view !== 'profile');

    $('show-studio')?.classList.toggle('active', view === 'studio');
    $('show-history')?.classList.toggle('active', view === 'history');
    $('show-profile')?.classList.toggle('active', view === 'profile');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderHistory = async () => {
    const listEl = $('history-list');
    const emptyEl = $('history-empty');
    updateStats();
    if (!listEl || !emptyEl) return;

    listEl.innerHTML = '';
    if (!state.history.length) {
      emptyEl.classList.remove('hidden');
      return;
    }
    emptyEl.classList.add('hidden');

    for (const item of state.history) {
      const d = item.design || {};
      const row = document.createElement('div');
      row.className = 'history-item';

      const symbol = document.createElement('div');
      symbol.className = 'history-symbol';
      symbol.style.background = d.qrBackground || '#FFFFFF';

      const qrThumb = createQrCanvas(
        item.target_url,
        140,
        d.qrColor || '#1B2419',
        d.qrBackground || '#FFFFFF'
      );
      if (qrThumb) symbol.appendChild(qrThumb);

      const info = document.createElement('div');
      info.className = 'history-info';
      info.innerHTML = `
        <strong>${safe(item.label || d.title || 'Scan to connect')}</strong>
        <p>${safe(item.platform || 'Website')} · ${safe(shortDomain(item.target_url))}</p>
      `;

      const dateStr = item.created_at
        ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '';
      const meta = document.createElement('div');
      meta.className = 'history-meta';
      meta.textContent = dateStr;

      const actions = document.createElement('div');
      actions.className = 'history-actions';

      const loadBtn = document.createElement('button');
      loadBtn.type = 'button';
      loadBtn.className = 'icon-btn';
      loadBtn.title = 'Load into Studio';
      loadBtn.setAttribute('aria-label', 'Load into Studio');
      loadBtn.textContent = '✎';
      loadBtn.addEventListener('click', () => loadHistoryItemIntoStudio(item));

      const dlBtn = document.createElement('button');
      dlBtn.type = 'button';
      dlBtn.className = 'icon-btn';
      dlBtn.title = 'Download card PNG';
      dlBtn.setAttribute('aria-label', 'Download card PNG');
      dlBtn.textContent = '↓';
      dlBtn.addEventListener('click', () =>
        downloadCardPng(
          { ...d, title: item.label || d.title },
          item.target_url,
          item.platform || d.platform
        )
      );

      const mailBtn = document.createElement('button');
      mailBtn.type = 'button';
      mailBtn.className = 'icon-btn';
      mailBtn.title = 'Share via Email';
      mailBtn.setAttribute('aria-label', 'Share via Email');
      mailBtn.textContent = '✉';
      mailBtn.addEventListener('click', () =>
        shareViaEmail(
          { ...d, title: item.label || d.title },
          item.target_url,
          item.platform || d.platform
        )
      );

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'icon-btn';
      delBtn.title = 'Delete saved QR';
      delBtn.setAttribute('aria-label', 'Delete saved QR');
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => deleteHistoryItem(item.id));

      actions.append(loadBtn, dlBtn, mailBtn, delBtn);
      row.append(symbol, info, meta, actions);
      listEl.appendChild(row);
    }
  };

  const loadHistoryItemIntoStudio = (item) => {
    const d = item.design || {};
    $('url-input').value = item.target_url || '';

    const savedPlatform = item.platform || d.platform || 'Website';
    setPlatform(savedPlatform, false);

    setStyle(d.style || 'minimal', false);

    $('qr-color').value = hex(d.qrColor, '#1B2419');
    $('qr-bg').value = hex(d.qrBackground, '#FFFFFF');
    $('card-bg').value = hex(d.cardBackground, '#FFFFFF');
    $('accent-color').value = hex(d.accentColor, '#A2CB4B');
    $('card-text-color').value = hex(d.cardTextColor, '#171A17');
    ['qr-color', 'qr-bg', 'card-bg', 'accent-color', 'card-text-color'].forEach(setColorLabel);

    $('qr-size').value = String(d.qrSize || 190);
    $('show-url').checked = d.showUrl !== false;
    $('show-brand').checked = d.showBrand !== false;
    $('card-title').value = item.label || d.title || 'Scan to connect';
    $('card-subtitle').value = d.subtitle ?? '';

    updatePreview();
    switchView('studio');
    document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
    showToast('Loaded saved QR design into Studio!');
  };

  const fetchHistory = async () => {
    if (!state.user) return;
    const loader = $('history-loading');
    loader?.classList.remove('hidden');
    try {
      const res = await fetch('/api/qr-history');
      if (res.ok) {
        const data = await res.json();
        state.history = Array.isArray(data.items) ? data.items : [];
        await renderHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      loader?.classList.add('hidden');
    }
  };

  const saveCurrentQrToHistory = async () => {
    const url = destination();
    if (!url) {
      showToast('Paste a destination link before saving.', true);
      $('url-input')?.focus();
      return;
    }
    if (!state.user) {
      showToast('Sign in to save QR codes to your account.');
      setTimeout(() => {
        window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
      }, 650);
      return;
    }

    const btn = $('save-history-btn');
    const d = readDesign();
    if (btn) btn.disabled = true;

    try {
      const res = await fetch('/api/qr-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: d.title,
          target_url: url,
          platform: d.platform,
          design: d
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Could not save QR code.', true);
        return;
      }
      if (data.item) {
        state.history.unshift(data.item);
        recordLocalStat(d.platform);
        await renderHistory();
        showToast('Saved to My QR codes!');
      }
    } catch {
      showToast('Network error while saving QR code.', true);
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      const res = await fetch(`/api/qr-history?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        state.history = state.history.filter((item) => String(item.id) !== String(id));
        await renderHistory();
        showToast('Removed from My QR codes.');
      }
    } catch {
      showToast('Could not delete QR item.', true);
    }
  };

  const populateProfileUI = () => {
    const p = state.profile || {};
    const email = state.user?.email || '';
    const displayName = p.display_name || state.user?.name || email.split('@')[0] || 'My workspace';
    const initial = (displayName.trim()[0] || 'L').toUpperCase();

    if ($('header-avatar')) $('header-avatar').textContent = initial;
    if ($('header-name')) $('header-name').textContent = displayName;
    if ($('profile-avatar')) $('profile-avatar').textContent = initial;
    if ($('profile-card-name')) $('profile-card-name').textContent = displayName;
    if ($('profile-card-bio')) {
      $('profile-card-bio').textContent = p.bio || 'Custom QR cards and branded links.';
    }
    if ($('profile-card-email')) $('profile-card-email').textContent = email;

    if ($('profile-name')) $('profile-name').value = p.display_name || '';
    if ($('profile-bio')) $('profile-bio').value = p.bio || '';
    if ($('profile-website')) $('profile-website').value = p.website || '';
    if ($('profile-accent')) {
      $('profile-accent').value = hex(p.accent_color, '#CAFA69');
      setColorLabel('profile-accent');
    }
  };

  const fetchProfile = async () => {
    if (!state.user) return;
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        state.profile = data.profile || {};
        populateProfileUI();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const btn = $('profile-save-btn');
    if (btn) btn.disabled = true;
    try {
      const payload = {
        display_name: $('profile-name')?.value || '',
        bio: $('profile-bio')?.value || '',
        website: $('profile-website')?.value || '',
        accent_color: $('profile-accent')?.value || '#CAFA69'
      };
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Could not update profile.', true);
        return;
      }
      state.profile = data.profile;
      populateProfileUI();
      showToast('Profile settings saved!');
    } catch {
      showToast('Could not save profile settings.', true);
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  const applyProfileDefaultsToStudio = () => {
    const p = state.profile || {};
    if (p.website && !$('url-input').value.trim()) {
      $('url-input').value = p.website;
    }
    if (p.accent_color) {
      $('accent-color').value = hex(p.accent_color, '#CAFA69');
      setColorLabel('accent-color');
    }
    updatePreview();
    switchView('studio');
    showToast('Applied your profile defaults to the Studio!');
  };

  const checkSession = async () => {
    const auth = window.hatchable && window.hatchable.auth;
    if (!auth || typeof auth.getSession !== 'function') return;

    try {
      const session = await auth.getSession();
      if (session && session.user) {
        state.user = session.user;
        $('public-nav')?.classList.add('hidden');
        $('account-nav')?.classList.remove('hidden');
        $('header-login')?.classList.add('hidden');
        $('header-user')?.classList.remove('hidden');
        await Promise.all([fetchProfile(), fetchHistory()]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const init = () => {
    bindUniversalTapEffects();
    bindSmoothAccordions();

    document.querySelectorAll('.platform-option').forEach((btn) => {
      btn.addEventListener('click', () => setPlatform(btn.dataset.platform, true));
    });

    $('custom-platform')?.addEventListener('input', (e) => {
      state.customPlatform = e.target.value;
      updatePreview();
    });

    document.querySelectorAll('.style-option').forEach((btn) => {
      btn.addEventListener('click', () => setStyle(btn.dataset.style, true));
    });

    ['url-input', 'card-title', 'card-subtitle', 'qr-size'].forEach((id) => {
      $(id)?.addEventListener('input', () => {
        clearTimeout(state.qrTimer);
        state.qrTimer = setTimeout(updatePreview, 40);
      });
    });

    ['qr-color', 'qr-bg', 'card-bg', 'accent-color', 'card-text-color'].forEach((id) => {
      $(id)?.addEventListener('input', () => {
        setColorLabel(id);
        updatePreview();
      });
    });

    $('profile-accent')?.addEventListener('input', () => setColorLabel('profile-accent'));

    ['show-url', 'show-brand'].forEach((id) => {
      $(id)?.addEventListener('change', updatePreview);
    });

    $('download-card-btn')?.addEventListener('click', () => downloadCardPng());
    $('save-history-btn')?.addEventListener('click', saveCurrentQrToHistory);
    $('copy-link-btn')?.addEventListener('click', copyDestinationLink);

    $('show-studio')?.addEventListener('click', () => switchView('studio'));
    $('show-history')?.addEventListener('click', () => switchView('history'));
    $('show-profile')?.addEventListener('click', () => switchView('profile'));
    $('header-user')?.addEventListener('click', () => switchView('profile'));
    $('header-user')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        switchView('profile');
      }
    });

    $('history-new-btn')?.addEventListener('click', () => switchView('studio'));
    $('empty-create-btn')?.addEventListener('click', () => switchView('studio'));
    $('header-create')?.addEventListener('click', () => switchView('studio'));
    $('brand-home')?.addEventListener('click', (e) => {
      if (state.activeView !== 'studio') {
        e.preventDefault();
        switchView('studio');
      }
    });

    document.querySelectorAll('[data-nav-studio]').forEach((el) => {
      el.addEventListener('click', () => switchView('studio'));
    });

    $('profile-form')?.addEventListener('submit', saveProfile);
    $('apply-profile-preset-btn')?.addEventListener('click', applyProfileDefaultsToStudio);
    $('logout-btn')?.addEventListener('click', async () => {
      const auth = window.hatchable && window.hatchable.auth;
      try {
        if (auth && typeof auth.logout === 'function') await auth.logout();
        else if (auth && typeof auth.signOut === 'function') await auth.signOut();
      } catch {}
      window.location.href = '/';
    });

    updatePreview();
    updateStats();
    checkSession();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();