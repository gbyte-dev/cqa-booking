import Swal from 'sweetalert2';

function isDark() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function themedSwal(overrides = {}) {
  const dark = isDark();
  return Swal.mixin({
    background: dark ? '#111827' : '#ffffff',
    color: dark ? '#f3f4f6' : '#171c2d',
    confirmButtonColor: dark ? '#818cf8' : '#667eea',
    cancelButtonColor: dark ? '#374151' : '#e5e7eb',
    buttonsStyling: true,
    customClass: {
      popup: 'rounded-2xl',
      confirmButton: 'rounded-lg px-5 py-2 text-sm font-semibold',
      cancelButton: 'rounded-lg px-5 py-2 text-sm font-semibold',
    },
    ...overrides,
  });
}

export function notifySuccess(message, title = 'Success') {
  return themedSwal().fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonText: 'OK',
    timer: 3000,
    timerProgressBar: true,
  });
}

export function notifyError(message = 'Something went wrong. Please try again.', title = 'Something went wrong') {
  return themedSwal().fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'OK',
  });
}

export function notifyWarning(message, title = 'Please check') {
  return themedSwal().fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: 'OK',
  });
}

export function notifyInfo(message, title = 'Heads up') {
  return themedSwal().fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonText: 'OK',
  });
}

// Compatibility helper for legacy browser alerts. It keeps presentation concerns
// out of page actions while preserving the original action flow.
export function notify(message) {
  const value = String(message ?? '');
  const text = value.replace(/^[✅❌⚠️ℹ️]\s*/u, '').replace(/^Error:\s*/i, '');

  if (/^[❌]|\berror\b|\bfailed\b|\bunable\b/i.test(value)) {
    return notifyError('We couldn’t complete that request. Please try again.');
  }
  if (/^[⚠️]|\bplease\b/i.test(value)) return notifyWarning(text);
  if (/^[✅]|\bsuccess/i.test(value)) return notifySuccess(text);
  return notifyInfo(text || 'Your request has been received.');
}

export async function confirmAction({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  confirmText = 'Yes, continue',
  cancelText = 'Cancel',
  danger = false,
} = {}) {
  const result = await themedSwal({
    confirmButtonColor: danger ? '#dc3545' : undefined,
  }).fire({
    icon: danger ? 'warning' : 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });
  return result.isConfirmed;
}
