function openModal() {
  document.getElementById('auth-modal').classList.add('active');
  switchCard('login');
}

function closeModal() {
  document.getElementById('auth-modal').classList.remove('active');
}

function switchCard(name) {
  ['login', 'register', 'otp', 'admin'].forEach(function(id) {
    var el = document.getElementById('card-' + id);
    if (el) el.classList.remove('visible');
  });
  var target = document.getElementById('card-' + name);
  if (target) target.classList.add('visible');
}

function initOTP() {
  var boxes = document.querySelectorAll('.otp-box');
  boxes.forEach(function(box, i) {
    box.addEventListener('input', function() {
      if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !box.value && i > 0) boxes[i - 1].focus();
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initOTP();
  var modal = document.getElementById('auth-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeModal();
    });
  }
});