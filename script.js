/* ===== Page Load ===== */
window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
    initObserver();
    initNav();
    initSmoothScroll();
    initAudioPlayer();
    initWorkCards();
    initModal();
    initDiscordCopy();
});

/* ===== Intersection Observer — Reveal on Scroll ===== */
function initObserver() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    els.forEach(el => observer.observe(el));
}

/* ===== Navigation ===== */
function initNav() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        nav.classList.toggle('scrolled', y > 60);
        lastScroll = y;
    }, { passive: true });

    // Mobile toggle
    toggle.addEventListener('click', () => {
        const isOpen = links.classList.toggle('open');
        toggle.classList.toggle('active');
        toggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu on link click
    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            links.classList.remove('open');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
}

/* ===== Smooth Scrolling ===== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

/* ===== Audio Player ===== */
function initAudioPlayer() {
    const audio = document.getElementById('globalAudio');
    let currentCard = null;

    window._audioPlayer = {
        play(card, src) {
            // If clicking the same card, toggle play/pause
            if (currentCard === card && !audio.paused) {
                audio.pause();
                setCardState(card, false);
                return;
            }

            // Stop previous
            if (currentCard && currentCard !== card) {
                setCardState(currentCard, false);
            }

            currentCard = card;
            audio.src = src;
            audio.play().catch(() => {});
            setCardState(card, true);
        },

        stop() {
            audio.pause();
            audio.currentTime = 0;
            if (currentCard) {
                setCardState(currentCard, false);
                currentCard = null;
            }
        }
    };

    audio.addEventListener('ended', () => {
        if (currentCard) {
            setCardState(currentCard, false);
            currentCard = null;
        }
    });

    audio.addEventListener('timeupdate', () => {
        if (!currentCard || audio.paused) return;
        const bar = currentCard.querySelector('.work-progress-bar');
        if (bar && audio.duration) {
            const pct = (audio.currentTime / audio.duration) * 100;
            bar.style.width = pct + '%';
        }
    });

    function setCardState(card, playing) {
        const btn = card.querySelector('.work-play-btn');
        if (!btn) return;

        if (playing) {
            card.classList.add('audio-active');
            btn.classList.add('playing');
            btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        } else {
            card.classList.remove('audio-active');
            btn.classList.remove('playing');
            btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            const bar = card.querySelector('.work-progress-bar');
            if (bar) bar.style.width = '0%';
        }
    }
}

/* ===== Work Card Click Handlers ===== */
function initWorkCards() {
    document.querySelectorAll('.work-card').forEach(card => {
        const type = card.dataset.type;

        const playBtn = card.querySelector('.work-play-btn');
        const viewBtn = card.querySelector('.work-view-btn');

        if (type === 'audio' && playBtn) {
            playBtn.addEventListener('click', e => {
                e.stopPropagation();
                const src = card.dataset.src;
                if (src) window._audioPlayer.play(card, src);
            });
        }

        if (type === 'youtube') {
            const handler = e => {
                e.stopPropagation();
                const videoId = card.dataset.videoId;
                if (videoId) openModal('youtube', videoId);
            };
            if (playBtn) playBtn.addEventListener('click', handler);
            card.addEventListener('click', handler);
        }

        if (type === 'video') {
            const handler = e => {
                e.stopPropagation();
                const src = card.dataset.src;
                if (src) openModal('video', src);
            };
            if (playBtn) playBtn.addEventListener('click', handler);
            card.addEventListener('click', handler);
        }

        if (type === 'image') {
            const handler = e => {
                e.stopPropagation();
                const src = card.dataset.src;
                if (src) openModal('image', src);
            };
            if (viewBtn) viewBtn.addEventListener('click', handler);
            card.addEventListener('click', handler);
        }
    });
}

/* ===== Modal ===== */
function initModal() {
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementById('modalClose');

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
}

function openModal(type, src) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modalBody');

    // Stop any playing audio
    if (window._audioPlayer) window._audioPlayer.stop();

    if (type === 'youtube') {
        body.innerHTML = `<iframe src="https://www.youtube.com/embed/${src}?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen title="YouTube video"></iframe>`;
    } else if (type === 'video') {
        body.innerHTML = `<video src="${src}" controls autoplay style="width:100%;border-radius:12px;"></video>`;
    } else if (type === 'image') {
        body.innerHTML = `<img src="${src}" alt="Project image">`;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modalBody');

    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Stop media playback
    setTimeout(() => {
        body.innerHTML = '';
    }, 350);
}

/* ===== Discord Copy to Clipboard ===== */
function initDiscordCopy() {
    const btn = document.getElementById('discordCopyBtn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText('yukiigore');
            showToast('✓ Username copied');
        } catch (err) {
            console.error('Failed to copy Discord username: ', err);
            showToast('Failed to copy username');
        }
    });
}

/* ===== Toast Notification ===== */
let toastTimeout;

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    // Reset timeout if clicked rapidly
    clearTimeout(toastTimeout);

    toast.textContent = message;
    toast.classList.add('show');

    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}