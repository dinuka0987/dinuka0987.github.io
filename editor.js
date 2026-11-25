'use strict';
let content;
let photoPreviewURL;
const prepared = new Map();
const statusText = document.querySelector('#editor-status');
function download(data, name, type) {
  const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], {type}));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
function assetButton(key, file, path, outputName) {
  prepared.get(key)?.remove();
  const row = document.createElement('p');
  const button = document.createElement('button'); button.className = 'button secondary'; button.type = 'button';
  button.textContent = 'Download ' + outputName; button.onclick = () => download(file, outputName);
  const note = document.createElement('small'); note.textContent = ' Upload to: ' + path;
  row.append(button, note); document.querySelector('#asset-downloads').append(row); prepared.set(key, row);
}
function addCertificate(value = {}) {
  const fieldset = document.createElement('fieldset');
  const legend = document.createElement('legend'); legend.textContent = 'Certificate'; fieldset.append(legend);
  for (const [key, label, type] of [['title','Certificate title','text'],['issuer','Issuer','text'],['date','Date (optional)','text'],['file','File path (assets/certificates/filename.pdf)','text'],['url','Verification URL (optional)','url']]) {
    const l = document.createElement('label'); l.textContent = label;
    const input = document.createElement('input'); input.dataset.key = key; input.type = type; input.value = value[key] || ''; if(key === 'title' || key === 'issuer') input.required = true;
    l.append(input); fieldset.append(l);
  }
  const uploadLabel = document.createElement('label'); uploadLabel.textContent = 'Certificate PDF or image';
  const upload = document.createElement('input'); upload.type = 'file'; upload.accept = '.pdf,.png,.jpg,.jpeg,.webp';
  uploadLabel.append(upload); fieldset.append(uploadLabel);
  const key = Symbol('certificate');
  upload.onchange = () => {
    const file = upload.files[0]; if (!file) return;
    if (!/\.(pdf|png|jpe?g|webp)$/i.test(file.name)) { statusText.textContent = 'Choose a PDF, PNG, JPG, or WebP file.'; return; }
    const name = file.name.replace(/[^a-zA-Z0-9._-]/g,'-');
    const path = 'assets/certificates/' + name;
    fieldset.querySelector('[data-key="file"]').value = path;
    assetButton(key,file,path,name);
    statusText.textContent = 'Certificate prepared. Download its file below and upload it to the indicated path.';
  };
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'button secondary'; remove.textContent = 'Remove certificate'; remove.onclick = () => { fieldset.remove(); prepared.get(key)?.remove(); prepared.delete(key); };
  guardRemoval(remove, '#add-certificate');
  fieldset.append(remove); document.querySelector('#certificate-editor').append(fieldset);
}
async function initEditor() {
  try {
    const r = await fetch('content.json'); if (!r.ok) throw new Error('Unable to load'); content = await r.json();
    const projectResult = await GitHubProjects.load(content);
    content.projects = projectResult.projects;
    if (content.profilePhoto) {
      document.querySelector('#photo-preview').src = content.profilePhoto;
      document.querySelector('#photo-preview').hidden = false;
    }
    content.projects.forEach(project => {
      const l = document.createElement('label'); l.className = 'pin-option';
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.value = project.repo; checkbox.checked = content.featured.includes(project.repo);
      checkbox.onchange = () => {
        const order = document.querySelector('#pin-order'); const entries = order.value.split(',').map(s=>s.trim()).filter(Boolean);
        order.value = (checkbox.checked ? [...new Set([...entries,project.repo])] : entries.filter(s=>s!==project.repo)).join(', ');
      };
      l.append(checkbox, document.createTextNode(project.name)); document.querySelector('#pin-list').append(l);
    });
    document.querySelector('#pin-order').value = content.featured.join(', ');
    (content.certificates || []).forEach(addCertificate);
    document.querySelector('#editor-controls').hidden = false;
    statusText.textContent = 'Ready. Your current portfolio content is loaded.';
  } catch { statusText.textContent = 'Could not load content.json. Open this editor through a local web server or your GitHub Pages site.'; }
}
document.querySelector('#add-certificate').onclick = () => addCertificate();
document.querySelector('#resume-file').onchange = async event => {
  const file = event.target.files[0]; if (!file) return;
  const signature = await file.slice(0,5).text();
  if (signature !== '%PDF-') { statusText.textContent = 'Please select a valid PDF resume.'; return; }
  content.resume = 'assets/Dinuka_Dilshan_Resume.pdf';
  assetButton('resume', file, content.resume, 'Dinuka_Dilshan_Resume.pdf');
  statusText.textContent = 'Resume prepared. Download it below and upload it into the assets folder.';
};
document.querySelector('#download-content').onclick = () => {
  const featured = [...new Set(document.querySelector('#pin-order').value.split(',').map(s=>s.trim()).filter(Boolean))];
  const unknown = featured.filter(repo => !content.projects.some(p=>p.repo===repo));
  if (unknown.length) { statusText.textContent = 'Unknown repository names: ' + unknown.join(', '); return; }
  const certificates = [];
  for (const fieldset of document.querySelectorAll('#certificate-editor fieldset')) {
    const certificate = {};
    for (const input of fieldset.querySelectorAll('[data-key]')) {
      if (!input.reportValidity()) return;
      certificate[input.dataset.key] = input.value.trim();
    }
    if (certificate.file && !/^assets\/certificates\/[a-zA-Z0-9._-]+\.(pdf|png|jpe?g|webp)$/i.test(certificate.file)) { statusText.textContent = 'Certificate files must use assets/certificates/filename.pdf (or an image extension).'; return; }
    if (certificate.url && !/^https?:\/\//i.test(certificate.url)) { statusText.textContent = 'Verification URLs must begin with https:// or http://.'; return; }
    certificates.push(certificate);
  }
  download(JSON.stringify({...content,featured,certificates},null,2)+'\n','content.json','application/json');
  statusText.textContent = 'Content downloaded. Upload content.json and any new assets to GitHub, then commit to publish.';
};
document.querySelector('#profile-file').onchange = async event => {
  const file = event.target.files[0];
  if (!file || !content) return;
  const formats = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
  const extension = formats[file.type];
  if (!extension) { statusText.textContent = 'Choose a JPG, PNG, or WebP photo.'; return; }
  const candidateURL = URL.createObjectURL(file);
  const probe = new Image();
  try {
    probe.src = candidateURL;
    await probe.decode();
  } catch {
    URL.revokeObjectURL(candidateURL);
    statusText.textContent = 'This image could not be opened. Please choose a valid photo.';
    return;
  }
  if (photoPreviewURL) URL.revokeObjectURL(photoPreviewURL);
  photoPreviewURL = candidateURL;
  const preview = document.querySelector('#photo-preview');
  preview.src = photoPreviewURL;
  preview.hidden = false;
  const filename = 'profile-photo.' + extension;
  content.profilePhoto = 'assets/' + filename;
  assetButton('photo', file, content.profilePhoto, filename);
  statusText.textContent = 'Photo prepared. Download the image and content.json below, then upload both to GitHub.';
};
document.querySelector('#remove-photo').onclick = () => {
  if (!content) return;
  content.profilePhoto = '';
  document.querySelector('#photo-preview').hidden = true;
  document.querySelector('#profile-file').value = '';
  if (photoPreviewURL) URL.revokeObjectURL(photoPreviewURL);
  photoPreviewURL = undefined;
  prepared.get('photo')?.remove();
  prepared.delete('photo');
  statusText.textContent = 'Photo removed from the prepared content. Download and publish content.json to apply this change.';
};
/* UI-only enhancements wrap existing actions; file preparation and publishing
   behavior above remain the source of truth. */
function guardRemoval(button, focusFallback) {
  button.addEventListener('click', async event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const dialog = document.querySelector('#ui-confirm-dialog');
    if (!dialog || dialog.open) return;
    document.querySelector('#ui-confirm-title').textContent = button.textContent.trim() + '?';
    dialog.returnValue = 'cancel';
    const confirmed = new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'delete'), {once:true}));
    dialog.showModal();
    if (await confirmed) {
      button.onclick?.call(button, event);
      if (focusFallback === '#add-certificate') statusText.textContent = 'Certificate removed from prepared content.';
      document.querySelector(focusFallback)?.focus();
    } else button.focus();
  }, {capture:true});
}
function installEditorUI() {
  const stack = document.querySelector('#ui-toast-stack');
  const dialog = document.querySelector('#ui-confirm-dialog');
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const buttons = [...dialog.querySelectorAll('button:not([disabled])')];
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  let lastMessage = '';
  // The persistent banner remains visible; only the toast stack announces it.
  statusText.setAttribute('aria-live', 'off');
  statusText.setAttribute('aria-busy', 'true');
  new MutationObserver(() => {
    const text = statusText.textContent.trim();
    if (!text || text === lastMessage) return;
    lastMessage = text;
    const isError = /^(could not|please|choose|unknown|this image|verification|certificate files)/i.test(text);
    const tone = isError ? 'error' : /downloaded|prepared|loaded|removed/i.test(text) ? 'success' : 'info';
    statusText.dataset.tone = tone;
    statusText.setAttribute('aria-busy', 'false');
    const toast = document.createElement('div');
    toast.className = 'ui-toast';
    toast.dataset.tone = tone;
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'ui-icon');
    icon.setAttribute('data-size', '20');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    outline.setAttribute('d', tone === 'success' ? 'm5 12 4 4L19 6' : 'M12 8h.01M12 11v6M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z');
    icon.append(outline);
    const message = document.createElement('span');
    message.textContent = text;
    toast.append(icon, message);
    stack.append(toast);
    while (stack.children.length > 3) stack.firstElementChild.remove();
    setTimeout(() => toast.remove(), 6000);
  }).observe(statusText, {childList:true, subtree:true, characterData:true});

  const fieldErrors = new WeakMap();
  let errorCount = 0;
  document.addEventListener('invalid', event => {
    const input = event.target;
    if (!input.matches('.editor input, .editor textarea, .editor select')) return;
    let message = fieldErrors.get(input);
    if (!message) {
      message = document.createElement('small');
      message.className = 'ui-field-error';
      message.id = 'ui-field-error-' + ++errorCount;
      message.setAttribute('role', 'alert');
      (input.closest('label') || input).insertAdjacentElement('afterend', message);
      input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), message.id].filter(Boolean).join(' '));
      fieldErrors.set(input, message);
    }
    input.setAttribute('aria-invalid', 'true');
    message.hidden = false;
    message.textContent = input.validationMessage;
  }, true);
  function updateInput(event) {
    const input = event.target;
    const error = fieldErrors.get(input);
    if (error && input.validity.valid) {
      input.removeAttribute('aria-invalid');
      error.hidden = true;
      error.textContent = '';
    }
    // Optional native slider presentation, for future real percentage controls.
    if (input.matches('.ui-range input[type="range"]')) {
      const min = Number(input.min || 0), max = Number(input.max || 100);
      const percentage = max > min ? Math.round((Number(input.value) - min) / (max - min) * 100) : 0;
      const wrapper = input.closest('.ui-range');
      wrapper.style.setProperty('--range-value', percentage + '%');
      const output = wrapper.querySelector('output');
      if (output) output.value = percentage + '%';
      input.setAttribute('aria-valuetext', percentage + '%');
    }
  }
  document.addEventListener('input', updateInput);
  document.addEventListener('change', updateInput);
  guardRemoval(document.querySelector('#remove-photo'), '#profile-file');
}
installEditorUI();
initEditor();
