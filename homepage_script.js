// Store bookings in localStorage
let userBookings = [];
let currentQRCode = null;
let currentBookingData = null;
let adminModal = null;
let currentAdminRow = null;

// Load saved bookings from localStorage
function loadBookings() {
    const saved = localStorage.getItem('joNinBookings');
    if (saved) {
        userBookings = JSON.parse(saved);
    } else {
        // Add some sample bookings for demo
        userBookings = [];
    }
}

// Save bookings to localStorage
function saveBookings() {
    localStorage.setItem('joNinBookings', JSON.stringify(userBookings));
}

// Get current user (using localStorage for demo)
function getCurrentUser() {
    let user = localStorage.getItem('joNinCurrentUser');
    if (!user) {
        user = {
            id: 'guest_' + Math.random().toString(36).substr(2, 9),
            name: 'Guest',
            email: ''
        };
        localStorage.setItem('joNinCurrentUser', JSON.stringify(user));
    } else {
        user = JSON.parse(user);
    }
    return user;
}

// Update guest name display
function updateGuestDisplay() {
    const user = getCurrentUser();
    const guestNameSpan = document.getElementById('guestNameDisplay');
    if (guestNameSpan && user.name) {
        guestNameSpan.textContent = user.name;
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.background = type === 'success' ? '#1B6B3A' : '#BE2130';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Generate QR Code
function generateQRCode(data) {
    return new Promise((resolve) => {
        const qrContainer = document.createElement('div');
        new QRCode(qrContainer, {
            text: data,
            width: 200,
            height: 200,
            colorDark: "#2C1A0E",
            colorLight: "#FFFFFF",
            correctLevel: QRCode.CorrectLevel.H
        });
        setTimeout(() => {
            const qrImage = qrContainer.querySelector('img');
            if (qrImage) {
                resolve(qrImage.src);
            } else {
                const canvas = qrContainer.querySelector('canvas');
                if (canvas) {
                    resolve(canvas.toDataURL());
                }
            }
        }, 100);
    });
}

// Set active menu item
function setActive(el) {
    document.querySelectorAll('.menu-item').forEach(function(item) {
        item.classList.remove('active');
    });
    el.classList.add('active');
}

// Search filter
document.addEventListener('DOMContentLoaded', function() {
    loadBookings();
    updateGuestDisplay();
    
    // Initialize calendar if flatpickr is loaded
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#date-picker", {
            dateFormat: "Y-m-d",
            minDate: "today",
            onChange: function(selectedDates, dateStr, instance) {
                filterAvailability(dateStr);
            }
        });
        
        flatpickr("#b-date", {
            dateFormat: "Y-m-d",
            minDate: "today",
            onChange: function(selectedDates, dateStr, instance) {
                updateTotalPrice();
            }
        });
    }
    
    // Search filter
    var searchBar = document.querySelector('.search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', function() {
            var query = this.value.toLowerCase();
            document.querySelectorAll('.listing-card').forEach(function(card) {
                var text = card.innerText.toLowerCase();
                card.style.display = text.includes(query) ? '' : 'none';
            });
            updateSectionCounts();
        });
    }
    
    // Guest count filter
    const guestCountInput = document.getElementById('guest-count');
    if (guestCountInput) {
        guestCountInput.addEventListener('input', function() {
            filterByGuestCount(this.value);
        });
    }
    
    // Book Now / Add On buttons
    document.querySelectorAll('.book-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = btn.closest('.listing-card');
            
            if (btn.disabled) {
                // Remove selection
                btn.textContent = btn.innerText === 'Add On' ? 'Add On' : 'Book Now';
                btn.style.background = '';
                btn.style.color = '';
                btn.disabled = false;
                card.classList.remove('card-selected');
            } else {
                // Add selection
                const originalText = btn.innerText === 'Add On' ? 'Add On' : 'Book Now';
                btn.textContent = '✓ Selected';
                btn.style.background = '#1B6B3A';
                btn.style.color = 'white';
                btn.disabled = true;
                card.classList.add('card-selected');
            }
            updateTotalPrice();
        });
    });
    
    // Close modals on backdrop click
    var bmodal = document.getElementById('booking-modal');
    if (bmodal) {
        bmodal.addEventListener('click', function(e) {
            if (e.target === bmodal) closeBookingModal();
        });
    }
    
    var confModal = document.getElementById('confirmation-modal');
    if (confModal) {
        confModal.addEventListener('click', function(e) {
            if (e.target === confModal) closeConfirmationModal();
        });
    }
    
    var bookingsModal = document.getElementById('bookings-modal');
    if (bookingsModal) {
        bookingsModal.addEventListener('click', function(e) {
            if (e.target === bookingsModal) closeBookingsModal();
        });
    }
    
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showToast('Thanks! Your message has been sent.', 'success');
            contactForm.reset();
        });
    }

    const adminTableButtons = document.querySelectorAll('.admin-table .table-btn');
    adminTableButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            handleAdminTableAction(btn);
        });
    });

    const adminSidebarButtons = document.querySelectorAll('.sidebar-btn');
    adminSidebarButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            handleAdminSidebarAction(btn);
        });
    });

    adminModal = document.getElementById('admin-modal');
    if (adminModal) {
        adminModal.addEventListener('click', function(e) {
            if (e.target === adminModal) closeAdminModal();
        });
    }

    updateSectionCounts();
});

// Filter availability by date
function filterAvailability(date) {
    // For demo, just log. In production, you'd check database
    console.log("Checking availability for:", date);
}

// Filter by guest count
function filterByGuestCount(count) {
    const guestNum = parseInt(count) || 0;
    document.querySelectorAll('.listing-card').forEach(function(card) {
        const maxGuests = parseInt(card.dataset.maxGuests) || 999;
        if (guestNum > 0 && guestNum > maxGuests) {
            card.style.display = 'none';
        } else {
            if (card.style.display !== 'none') {
                card.style.display = '';
            }
        }
    });
    updateSectionCounts();
}

// Update section counts based on visible cards
function updateSectionCounts() {
    const sections = ['passes', 'cottages', 'rooms', 'events'];
    sections.forEach(section => {
        const sectionElement = document.getElementById(`section-${section}`);
        if (sectionElement) {
            const visibleCards = sectionElement.querySelectorAll('.listing-card:not([style*="display: none"])').length;
            const countSpan = sectionElement.querySelector('.listing-count');
            if (countSpan) {
                countSpan.textContent = `${visibleCards} available`;
            }
        }
    });
}

function handleAdminTableAction(button) {
    const row = button.closest('tr');
    if (!row) {
        showToast('Unable to locate booking row.', 'error');
        return;
    }

    const booking = {
        id: row.dataset.bookingId || '',
        guest: row.dataset.guest || row.querySelector('td')?.innerText || 'Guest',
        package: row.dataset.package || row.querySelectorAll('td')[1]?.innerText || '',
        date: row.dataset.date || row.querySelectorAll('td')[2]?.innerText || '',
        status: row.dataset.status || row.querySelector('.status')?.innerText || ''
    };

    const status = row.querySelector('.status');
    const action = button.innerText.trim();

    if (action === 'Confirm') {
        if (status) {
            status.textContent = 'Confirmed';
            status.className = 'status status-confirmed';
        }
        row.dataset.status = 'Confirmed';
        button.textContent = 'Details';
        showToast(`Booking confirmed for ${booking.guest}.`, 'success');
    } else if (action === 'Details') {
        openAdminModal('details', booking, row);
    } else if (action === 'Manage') {
        openAdminModal('manage', booking, row);
    } else {
        showToast(`Action triggered: ${action}.`, 'success');
    }
}

function handleAdminSidebarAction(button) {
    const action = button.innerText.trim();
    if (action === 'Add New Staff') {
        showToast('Opening staff setup tools...', 'success');
    } else if (action === 'Update Rates') {
        showToast('Navigating to rates update workflow...', 'success');
    } else if (action === 'Schedule Maintenance') {
        showToast('Opening maintenance schedule planner...', 'success');
    } else {
        showToast(`Action: ${action}`, 'success');
    }
}

function openAdminModal(mode, booking, row) {
    if (!adminModal) return;

    currentAdminRow = row;
    const statusText = booking.status || row.dataset.status || row.querySelector('.status')?.innerText || '';
    const content = document.getElementById('admin-modal-content');
    if (!content) return;

    if (mode === 'details') {
        content.innerHTML = `
            <h3>Booking Details</h3>
            <div class="admin-modal-details">
                <div><strong>Guest</strong><span>${booking.guest}</span></div>
                <div><strong>Package</strong><span>${booking.package}</span></div>
                <div><strong>Date</strong><span>${booking.date}</span></div>
                <div><strong>Status</strong><span>${statusText}</span></div>
                <div><strong>Booking ID</strong><span>${booking.id}</span></div>
            </div>
            <div class="admin-modal-actions">
                <button class="admin-action-btn confirm" onclick="updateBookingStatus('Confirmed')">Confirm</button>
                <button class="admin-action-btn pending" onclick="updateBookingStatus('Pending')">Set Pending</button>
                <button class="admin-action-btn booked" onclick="updateBookingStatus('Booked')">Mark Booked</button>
            </div>
        `;
    } else {
        content.innerHTML = `
            <h3>Manage Booking</h3>
            <p>Use these controls to update the booking status or review the reservation.</p>
            <div class="admin-modal-details">
                <div><strong>Guest</strong><span>${booking.guest}</span></div>
                <div><strong>Package</strong><span>${booking.package}</span></div>
                <div><strong>Date</strong><span>${booking.date}</span></div>
                <div><strong>Status</strong><span>${statusText}</span></div>
            </div>
            <div class="admin-modal-actions">
                <button class="admin-action-btn confirm" onclick="updateBookingStatus('Confirmed')">Confirm</button>
                <button class="admin-action-btn pending" onclick="updateBookingStatus('Pending')">Set Pending</button>
                <button class="admin-action-btn booked" onclick="updateBookingStatus('Booked')">Mark Booked</button>
            </div>
        `;
    }

    adminModal.classList.add('active');
}

function closeAdminModal() {
    if (!adminModal) return;
    adminModal.classList.remove('active');
    currentAdminRow = null;
}

function updateBookingStatus(status) {
    if (!currentAdminRow) return;
    const statusSpan = currentAdminRow.querySelector('.status');
    if (statusSpan) {
        statusSpan.textContent = status;
        statusSpan.className = 'status status-' + status.toLowerCase();
    }
    currentAdminRow.dataset.status = status;
    showToast(`Booking status updated to ${status}.`, 'success');
    closeAdminModal();
}

// Calculate total price based on selected items
function calculateTotalPrice() {
    let total = 0;
    const selectedCards = document.querySelectorAll('.listing-card.card-selected');
    
    selectedCards.forEach(card => {
        const priceText = card.querySelector('.card-price').innerText;
        let price = 0;
        const priceMatch = priceText.match(/₱(\d+)/);
        if (priceMatch) {
            price = parseInt(priceMatch[1]);
        }
        total += price;
    });
    
    const guests = parseInt(document.getElementById('b-guests')?.value) || 1;
    const guestCount = parseInt(document.getElementById('guest-count')?.value) || 1;
    
    // For passes, multiply by number of guests
    const hasPass = Array.from(document.querySelectorAll('.listing-card.card-selected')).some(card => 
        card.classList.contains('card-pass')
    );
    
    if (hasPass) {
        const passPrice = 150;
        total = (passPrice * guests) + (total - passPrice);
    }
    
    return total;
}

// Update total price display
function updateTotalPrice() {
    const total = calculateTotalPrice();
    const totalEl = document.getElementById('b-total');
    if (totalEl) {
        totalEl.textContent = `₱${total}`;
    }
}

// Open booking modal
function openBookingModal() {
    const selectedCards = document.querySelectorAll('.listing-card.card-selected');
    const itemsList = document.getElementById('b-selected-items');
    const totalEl = document.getElementById('b-total');
    
    if (selectedCards.length === 0) {
        showToast('Please select at least one item by clicking "Book Now" or "Add On" on your chosen options.', 'error');
        return;
    }
    
    let items = [];
    selectedCards.forEach(function(card) {
        const title = card.querySelector('h3').innerText;
        const priceText = card.querySelector('.card-price').innerText;
        items.push('✓ ' + title + ' — ' + priceText);
    });
    
    itemsList.innerHTML = items.join('<br>');
    
    const total = calculateTotalPrice();
    totalEl.textContent = `₱${total}`;
    
    // Set default date
    const datePicker = document.getElementById('b-date');
    if (datePicker && !datePicker.value) {
        const today = new Date().toISOString().split('T')[0];
        datePicker.value = today;
    }
    
    document.getElementById('booking-modal').classList.add('active');
}

function closeBookingModal() {
    document.getElementById('booking-modal').classList.remove('active');
}

function closeConfirmationModal() {
    document.getElementById('confirmation-modal').classList.remove('active');
    currentQRCode = null;
    currentBookingData = null;
}

function closeBookingsModal() {
    document.getElementById('bookings-modal').classList.remove('active');
}

// Submit booking
async function submitBooking(method) {
    const name = document.getElementById('b-name').value.trim();
    const email = document.getElementById('b-email').value.trim();
    const phone = document.getElementById('b-phone').value.trim();
    const date = document.getElementById('b-date').value;
    const guests = document.getElementById('b-guests').value;
    const specialRequests = document.getElementById('b-notes').value;
    
    if (!name || !email || !date || !guests) {
        showToast('Please fill in your name, email, date of visit, and number of guests.', 'error');
        return;
    }
    
    if (!email.includes('@')) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }
    
    // Get selected items
    const selectedCards = document.querySelectorAll('.listing-card.card-selected');
    const selectedItems = [];
    selectedCards.forEach(card => {
        selectedItems.push({
            name: card.querySelector('h3').innerText,
            type: card.dataset.type || 'unknown',
            price: parseInt(card.querySelector('.card-price').innerText.match(/₱(\d+)/)?.[1] || 0)
        });
    });
    
    const totalAmount = calculateTotalPrice();
    const paymentMethod = method === 'online' ? 'Online (GCash/Bank Transfer)' : (method === 'visit' ? 'Pay at Resort' : 'To be confirmed');
    const paymentStatus = method === 'online' ? 'pending' : (method === 'visit' ? 'pending_payment' : 'pending');
    
    // Generate unique booking ID
    const bookingId = 'JN' + new Date().getTime() + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    // Create booking object
    const booking = {
        id: bookingId,
        name: name,
        email: email,
        phone: phone,
        date: date,
        guests: parseInt(guests),
        selectedItems: selectedItems,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        status: 'pending',
        specialRequests: specialRequests,
        createdAt: new Date().toISOString(),
        qrData: `${bookingId}|${name}|${date}|${totalAmount}`
    };
    
    // Save to localStorage
    userBookings.push(booking);
    saveBookings();
    
    // Update current user info
    const user = getCurrentUser();
    user.name = name;
    user.email = email;
    localStorage.setItem('joNinCurrentUser', JSON.stringify(user));
    updateGuestDisplay();
    
    // Generate QR code
    const qrData = JSON.stringify({
        bookingId: bookingId,
        name: name,
        date: date,
        guests: guests,
        items: selectedItems.map(i => i.name),
        amount: totalAmount
    });
    
    const qrImageData = await generateQRCode(qrData);
    
    // Show confirmation with QR code
    showConfirmationModal(booking, qrImageData);
    
    // Close booking modal
    closeBookingModal();
    
    // Reset selections
    document.querySelectorAll('.listing-card.card-selected').forEach(card => {
        const btn = card.querySelector('.book-btn');
        if (btn) {
            btn.textContent = btn.innerText === 'Add On' ? 'Add On' : 'Book Now';
            btn.style.background = '';
            btn.style.color = '';
            btn.disabled = false;
            card.classList.remove('card-selected');
        }
    });
}

// Show confirmation modal with QR code
function showConfirmationModal(booking, qrImageData) {
    const modal = document.getElementById('confirmation-modal');
    const qrContainer = document.getElementById('qr-code-display');
    const summaryDetails = document.getElementById('booking-summary-details');
    const messageEl = document.getElementById('confirmation-message');
    
    currentBookingData = booking;
    
    messageEl.innerHTML = `Your booking has been successfully created!<br>Booking ID: <strong>${booking.id}</strong>`;
    
    // Clear and add QR code
    qrContainer.innerHTML = '';
    const qrImg = document.createElement('img');
    qrImg.src = qrImageData;
    qrImg.style.width = '200px';
    qrImg.style.height = '200px';
    qrContainer.appendChild(qrImg);
    
    // Build summary
    summaryDetails.innerHTML = `
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Guests:</strong> ${booking.guests}</p>
        <p><strong>Items:</strong> ${booking.selectedItems.map(i => i.name).join(', ')}</p>
        <p><strong>Total Amount:</strong> ₱${booking.totalAmount}</p>
        <p><strong>Payment:</strong> ${booking.paymentMethod}</p>
    `;
    
    modal.classList.add('active');
}

// Download QR code
function downloadQRCode() {
    const qrImg = document.querySelector('#qr-code-display img');
    if (qrImg) {
        const link = document.createElement('a');
        link.download = `jo-nin-booking-${currentBookingData?.id || 'qr'}.png`;
        link.href = qrImg.src;
        link.click();
        showToast('QR Code downloaded!', 'success');
    } else {
        showToast('Unable to download QR code.', 'error');
    }
}

// Show my bookings
function showMyBookings() {
    const user = getCurrentUser();
    const userEmail = user.email;
    
    // Filter bookings by email
    const myBookings = userBookings.filter(b => b.email === userEmail || b.name === user.name);
    
    const bookingsList = document.getElementById('bookings-list');
    
    if (myBookings.length === 0) {
        bookingsList.innerHTML = '<p style="text-align: center; color: #888;">You don\'t have any bookings yet.</p>';
    } else {
        bookingsList.innerHTML = myBookings.map(booking => `
            <div class="booking-item">
                <div class="booking-info">
                    <h4>${booking.selectedItems.map(i => i.name).join(', ')}</h4>
                    <p>📅 ${booking.date} | 👥 ${booking.guests} guests</p>
                    <p>💰 ₱${booking.totalAmount} | ${booking.paymentMethod}</p>
                    <p>🆔 Booking ID: ${booking.id}</p>
                </div>
                <div>
                    <span class="booking-status status-${booking.status === 'pending' ? 'pending' : 'confirmed'}">
                        ${booking.status === 'pending' ? 'Pending' : 'Confirmed'}
                    </span>
                    <button class="booking-view-qr" onclick="viewBookingQR('${booking.id}')">View QR</button>
                </div>
            </div>
        `).join('');
    }
    
    document.getElementById('bookings-modal').classList.add('active');
}

// View QR code from saved booking
async function viewBookingQR(bookingId) {
    const booking = userBookings.find(b => b.id === bookingId);
    if (booking) {
        const qrData = JSON.stringify({
            bookingId: booking.id,
            name: booking.name,
            date: booking.date,
            guests: booking.guests,
            items: booking.selectedItems.map(i => i.name),
            amount: booking.totalAmount
        });
        const qrImageData = await generateQRCode(qrData);
        showConfirmationModal(booking, qrImageData);
        closeBookingsModal();
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('joNinCurrentUser');
        window.location.href = 'homepage_index.html';
    }
}

function openNewReservation() {
    window.location.href = 'booking_index.html';
}

function viewReports() {
    window.location.href = 'admin_reports_index.html';
}

// Update total price when guests change
document.addEventListener('DOMContentLoaded', function() {
    const guestInput = document.getElementById('b-guests');
    if (guestInput) {
        guestInput.addEventListener('input', updateTotalPrice);
    }
    
    const mainGuestInput = document.getElementById('guest-count');
    if (mainGuestInput) {
        mainGuestInput.addEventListener('input', updateTotalPrice);
    }
});