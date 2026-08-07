// ===== Shared utilities used by every page =====

/** Fetch a JSON data file with a helpful error on the page if it fails. */
async function fetchJSON(path) {
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`โหลดข้อมูลไม่สำเร็จ: ${path}`, err);
    showDataError(path);
    throw err;
  }
}

function showDataError(path) {
  const banner = document.createElement('div');
  banner.className =
    'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-coral-600 text-white text-sm px-4 py-2 rounded-lg shadow-card fade-in';
  banner.textContent = `โหลดข้อมูลไม่สำเร็จ: ${path} (หากเปิดไฟล์ตรง ๆ ให้รันผ่านเซิร์ฟเวอร์ในเครื่อง เช่น python -m http.server)`;
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 6000);
}

function formatNumber(n) {
  return Number(n).toLocaleString('th-TH');
}

// tone -> tailwind class map (background tint, text, ring)
const TONE_CLASSES = {
  ocean: { bg: 'bg-ocean-50', text: 'text-ocean-700', ring: 'ring-ocean-100', dot: 'bg-ocean-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-100', dot: 'bg-amber-500' },
  coral: { bg: 'bg-coral-50', text: 'text-coral-600', ring: 'ring-coral-100', dot: 'bg-coral-500' },
  dark: { bg: 'bg-ocean-900', text: 'text-white', ring: 'ring-ocean-800', dot: 'bg-sand-300' },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-100', dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-100', dot: 'bg-amber-500' },
  danger: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-100', dot: 'bg-rose-500' }
};

function toneClasses(tone) {
  return TONE_CLASSES[tone] || TONE_CLASSES.ocean;
}

// Map a raw status label to a tone, used across agenda/workflow pages
function statusTone(status) {
  if (!status) return 'ocean';
  if (status.includes('เสร็จสิ้น')) return 'success';
  if (status.includes('เร่งรัด')) return 'danger';
  if (status.includes('ถัดไป')) return 'warning';
  return 'ocean';
}

function statusBadge(status) {
  const t = toneClasses(statusTone(status));
  return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${t.bg} ${t.text} ring-1 ${t.ring}">
    <span class="w-1.5 h-1.5 rounded-full ${t.dot}"></span>${status}
  </span>`;
}

/** Animate a number counting up inside an element. */
function animateCounter(el, target, duration = 900) {
  const start = 0;
  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + (target - start) * eased);
    el.textContent = formatNumber(value);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ===== Shared navigation =====
const NAV_LINKS = [
  { href: 'index.html', label: 'ภาพรวม' },
  { href: '2.html', label: 'โครงสร้างกลไก' },
  { href: '3.html', label: 'การขับเคลื่อนวาระ' },
  { href: '4.html', label: 'วาระสำคัญ' },
  // { href: 'structure.html', label: 'โครงสร้างกลไก' },
  // { href: 'workflow.html', label: 'การขับเคลื่อนวาระ' },
  // { href: 'agenda.html', label: 'วาระสำคัญ' },
  // { href: 'analysis.html', label: 'สรุปและข้อเสนอแนะ' }
];

function currentPage() {
  const path = window.location.pathname.split('/').pop();
  return path === '' ? 'index.html' : path;
}

function renderNav() {
  const mount = document.getElementById('site-nav');
  if (!mount) return;
  const page = currentPage();

  const linkItems = NAV_LINKS.map(
    (l) => `<a href="${l.href}" class="nav-link block md:inline-block px-3 py-2 rounded-lg text-sm font-medium text-ocean-100 hover:text-white hover:bg-white/10 transition ${l.href === page ? 'active' : ''}">${l.label}</a>`
  ).join('');

  mount.innerHTML = `
  <nav class="bg-ocean-900 shadow-card sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <a href="index.html" class="flex items-center gap-2 text-white font-bold">
          <span class="inline-flex items-center justify-center w-9 h-9 rounded bg-ocean-700 text-sand-300 p-1"><img src="./assets/img/logo.png"></span>
          <span class="text-sm sm:text-base leading-tight">กลไกการดำเนินงาน<br class="hidden sm:block"><span class="text-xs font-normal text-ocean-200"> ทรัพยากรทางทะเลและชายฝั่ง</span></span>
        </a>
        <div class="hidden md:flex items-center gap-1">${linkItems}</div>
        <button id="nav-toggle" class="md:hidden text-white p-2 rounded-lg hover:bg-white/10" aria-label="เปิดเมนู">
          <svg id="icon-open" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          <svg id="icon-close" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div id="mobile-menu" class="md:hidden hidden pb-4 space-y-1">${linkItems}</div>
    </div>
  </nav>`;

  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');
  toggle.addEventListener('click', () => {
    menu.classList.toggle('hidden');
    iconOpen.classList.toggle('hidden');
    iconClose.classList.toggle('hidden');
  });
}

function renderFooter() {
  const mount = document.getElementById('site-footer');
  if (!mount) return;
  mount.innerHTML = `
  <footer class="mt-16 border-t border-ocean-100 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-ocean-700/70 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p>กองยุทธศาสตร์และแผนงาน กรมทรัพยากรทางทะเลและชายฝั่ง</code></p>
      <p>ปีงบประมาณ พ.ศ. 2567 – 2568</p>
    </div>
  </footer>`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  renderFooter();
});
