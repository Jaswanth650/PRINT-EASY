const DELIVERY_FEE = 20;
const PRICES = { bw: 2, colour: 10 };
const STORAGE_KEY = 'printeasy_orders_v1';
let selectedFile = null;
let estimatedPages = 0;
let toastTimer;

const el = (id) => document.getElementById(id);
const fileInput = el('fileInput');
const uploadZone = el('uploadZone');
const orderForm = el('orderForm');

function showToast(message) {
  const toast = el('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function formatMoney(amount) {
  return `₹${amount.toFixed(2)}`;
}

function getPagesFromPdf(file) {
  // This lightweight frontend demo estimates pages from the PDF text structure.
  // It does not upload files to a server or guarantee an exact page count.
  return file.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    const raw = new TextDecoder('latin1').decode(bytes);
    const matches = raw.match(/\/Type\s*\/Page\b/g);
    return matches && matches.length ? matches.length : 1;
  }).catch(() => 1);
}

async function handleFile(file) {
  if (!file) return;
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    showToast('Please choose a PDF file.');
    fileInput.value = '';
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast('File is too large. Maximum size is 10 MB.');
    fileInput.value = '';
    return;
  }
  selectedFile = file;
  el('uploadTitle').textContent = file.name;
  el('uploadHint').textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB · PDF selected`;
  estimatedPages = await getPagesFromPdf(file);
  el('pageCount').textContent = `~${estimatedPages}`;
  updateSummary();
  showToast('PDF selected successfully.');
}

function updateSummary() {
  const type = el('printType').value;
  const copies = Math.min(50, Math.max(1, Number.parseInt(el('copies').value, 10) || 1));
  const sides = el('sides').value;
  const pages = estimatedPages || 0;
  // Double-sided printing uses the same per-sheet rate; this demo charges per printed page.
  const printCost = pages * copies * PRICES[type];
  const total = printCost + DELIVERY_FEE;
  el('summaryType').textContent = type === 'bw' ? 'Black & white' : 'Colour';
  el('summaryCopies').textContent = copies;
  el('printingCost').textContent = formatMoney(printCost);
  el('totalCost').textContent = formatMoney(total);
  return { copies, pages, printCost, total, sides, type };
}

function readOrders() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function renderOrders() {
  const orders = readOrders();
  const container = el('ordersList');
  if (!orders.length) {
    container.innerHTML = `<div class="empty-orders"><span>▤</span><h3>No orders yet</h3><p>Your placed orders will show up here.</p><a href="#order" class="text-link">Place your first order →</a></div>`;
    return;
  }
  container.innerHTML = orders.map((order) => {
    const statusClass = order.status === 'Delivered' ? 'delivered' : order.status === 'Printing' ? 'printing' : '';
    return `<article class="order-item">
      <div class="order-item-main"><span class="order-file-icon">PDF</span><div><h3>${escapeHtml(order.fileName)}</h3><p>Order #${order.id} · ${escapeHtml(order.date)} · ${order.pages} page(s) × ${order.copies}</p></div></div>
      <div class="order-item-right"><strong>${formatMoney(order.total)}</strong><span class="status-pill ${statusClass}">${order.status}</span><div class="order-actions"><button type="button" data-action="advance" data-id="${order.id}">Update demo status</button></div></div>
    </article>`;
  }).join('');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
}

function placeOrder(event) {
  event.preventDefault();
  if (!selectedFile) {
    showToast('Please upload a PDF before placing your order.');
    uploadZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (!orderForm.reportValidity()) return;
  const details = updateSummary();
  const order = {
    id: Date.now().toString().slice(-7),
    fileName: selectedFile.name,
    pages: estimatedPages,
    copies: details.copies,
    type: details.type,
    sides: details.sides,
    total: details.total,
    customer: el('customerName').value.trim(),
    address: el('address').value.trim(),
    status: 'Order received',
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  };
  const orders = readOrders();
  orders.unshift(order);
  saveOrders(orders);
  renderOrders();
  orderForm.reset();
  selectedFile = null;
  estimatedPages = 0;
  fileInput.value = '';
  el('uploadTitle').textContent = 'Choose a file to upload';
  el('uploadHint').textContent = 'or drag and drop your PDF here';
  el('pageCount').textContent = '—';
  updateSummary();
  showToast(`Order #${order.id} placed! This is a demo order.`);
  el('my-orders').scrollIntoView({ behavior: 'smooth' });
}

fileInput.addEventListener('change', (event) => handleFile(event.target.files[0]));
['printType', 'paperSize', 'sides', 'copies'].forEach((id) => el(id).addEventListener('change', updateSummary));
el('minusCopies').addEventListener('click', () => { el('copies').value = Math.max(1, (Number(el('copies').value) || 1) - 1); updateSummary(); });
el('plusCopies').addEventListener('click', () => { el('copies').value = Math.min(50, (Number(el('copies').value) || 1) + 1); updateSummary(); });
el('copies').addEventListener('input', () => { if (el('copies').value !== '') updateSummary(); });
orderForm.addEventListener('submit', placeOrder);

['dragover', 'dragenter'].forEach((eventName) => uploadZone.addEventListener(eventName, (event) => { event.preventDefault(); uploadZone.classList.add('dragover'); }));
['dragleave', 'drop'].forEach((eventName) => uploadZone.addEventListener(eventName, (event) => { event.preventDefault(); uploadZone.classList.remove('dragover'); }));
uploadZone.addEventListener('drop', (event) => handleFile(event.dataTransfer.files[0]));

el('ordersList').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action="advance"]');
  if (!button) return;
  const steps = ['Order received', 'Printing', 'Delivered'];
  const orders = readOrders();
  const order = orders.find((item) => item.id === button.dataset.id);
  if (!order) return;
  order.status = steps[(steps.indexOf(order.status) + 1) % steps.length];
  saveOrders(orders);
  renderOrders();
  showToast(`Demo status updated: ${order.status}`);
});

el('clearOrders').addEventListener('click', () => {
  if (!readOrders().length) { showToast('There are no demo orders to clear.'); return; }
  if (confirm('Clear all saved demo orders from this browser?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderOrders();
    showToast('Demo orders cleared.');
  }
});

updateSummary();
renderOrders();
