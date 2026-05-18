let authModal = null;

function getCurrentUser() {
  try {
    const stored = localStorage.getItem('joNinCurrentUser');
    if (!stored) {
      const guest = {
        id: 'guest_' + Math.random().toString(36).substr(2, 9),
        name: 'Guest',
        email: ''
      };
      localStorage.setItem('joNinCurrentUser', JSON.stringify(guest));
      return guest;
    }
    return JSON.parse(stored);
  } catch (err) {
    return { id: 'guest', name: 'Guest', email: '' };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  authModal = document.getElementById('auth-modal');

  if (authModal) {
    authModal.addEventListener('click', (event) => {
      if (event.target === authModal) {
        closeModal();
      }
    });
  }

  initOTP();
});

function openModal() {
  const user = getCurrentUser();
  if (user.name !== 'Guest') {
    window.location.href = 'booking_index.html';
    return;
  }

  if (!authModal) {
    authModal = document.getElementById('auth-modal');
  }
  if (!authModal) return;

  authModal.classList.add('active');
  document.body.classList.add('modal-open');
  switchCard('login');
}

function switchCard(name) {
  ['login', 'register', 'otp', 'admin'].forEach((id) => {
    const card = document.getElementById('card-' + id);
    if (card) card.classList.remove('visible');
  });
  const target = document.getElementById('card-' + name);
  if (target) target.classList.add('visible');
}

function initOTP() {
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach((box, index) => {
    box.addEventListener('input', () => {
      if (box.value && index < boxes.length - 1) {
        boxes[index + 1].focus();
      }
    });
    box.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !box.value && index > 0) {
        boxes[index - 1].focus();
      }
    });
  });
}

function closeModal() {
  if (!authModal) {
    authModal = document.getElementById('auth-modal');
  }
  if (!authModal) return;

  authModal.classList.remove('active');
  document.body.classList.remove('modal-open');
}

function checkLoginAndBook() {
  const user = getCurrentUser();
  if (user.name === 'Guest') {
    openModal();
  } else {
    window.location.href = 'booking_index.html';
  }
}
