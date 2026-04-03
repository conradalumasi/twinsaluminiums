/* ========================================
   TWIN ALUMINIUM WORKS - MAIN JAVASCRIPT
   ======================================== */

// DOM Elements
var header = document.querySelector('.header');
var mobileMenuBtn = document.querySelector('.mobile-menu-btn');
var navMenu = document.querySelector('.nav-menu');
var scrollTopBtn = document.querySelector('.scroll-top');

// Security: Sanitize input to prevent XSS
function sanitizeInput(str) {
  if (!str) return '';
  return String(str).replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Local Storage Helpers
function getStoredBookings() {
  var bookings = localStorage.getItem('taw_bookings');
  return bookings ? JSON.parse(bookings) : [];
}

function getStoredMessages() {
  var messages = localStorage.getItem('taw_messages');
  return messages ? JSON.parse(messages) : [];
}

function loadStoredData() {
  if (!localStorage.getItem('taw_bookings')) {
    localStorage.setItem('taw_bookings', JSON.stringify([]));
  }
  if (!localStorage.getItem('taw_messages')) {
    localStorage.setItem('taw_messages', JSON.stringify([]));
  }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  initHeader();
  initMobileMenu();
  initScrollToTop();
  initAnimations();
  initContactForm();
  initBookingForm();
  initAdminPanel();
  initFilterButtons();
  initModal();
  loadStoredData();
});

// ========================================
// HEADER FUNCTIONALITY
// ========================================

function initHeader() {
  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    if (scrollTopBtn) {
      if (window.scrollY > 500) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  });
}

// ========================================
// MOBILE MENU
// ========================================

function initMobileMenu() {
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenuBtn.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    var navLinks = navMenu.querySelectorAll('.nav-link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        mobileMenuBtn.classList.remove('active');
        navMenu.classList.remove('active');
      });
    }
    document.addEventListener('click', function(e) {
      if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
        mobileMenuBtn.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }
}

// ========================================
// SCROLL TO TOP
// ========================================

function initScrollToTop() {
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ========================================
// SCROLL ANIMATIONS
// ========================================

function initAnimations() {
  var animatedElements = document.querySelectorAll('.animate-on-scroll, .service-card, .product-card, .project-card, .feature-card, .testimonial-card');
  var observer = new IntersectionObserver(function(entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add('visible');
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  for (var j = 0; j < animatedElements.length; j++) {
    observer.observe(animatedElements[j]);
  }
}

// ========================================
// CONTACT FORM
// ========================================

function initContactForm() {
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = document.getElementById('name').value;
      var email = document.getElementById('email').value;
      var phone = document.getElementById('phone').value;
      var subject = document.getElementById('subject').value;
      var message = document.getElementById('message').value;
      if (!name || !email || !message) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }
      var formData = {
        id: Date.now(),
        name: sanitizeInput(name),
        email: sanitizeInput(email),
        phone: sanitizeInput(phone),
        subject: sanitizeInput(subject),
        message: sanitizeInput(message),
        date: new Date().toISOString(),
        status: 'unread'
      };
      var messages = getStoredMessages();
      messages.push(formData);
      localStorage.setItem('taw_messages', JSON.stringify(messages));
      showNotification('Message sent successfully! We will get back to you soon.', 'success');
      contactForm.reset();
    });
  }
}

// ========================================
// BOOKING FORM
// ========================================

var currentStep = 1;
var totalSteps = 3;

function initBookingForm() {
  var bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    updateBookingSteps();
    var nextBtn = document.getElementById('nextStep');
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        if (validateBookingStep(currentStep)) {
          if (currentStep < totalSteps) {
            currentStep++;
            updateBookingSteps();
          }
        }
      });
    }
    var prevBtn = document.getElementById('prevStep');
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        if (currentStep > 1) {
          currentStep--;
          updateBookingSteps();
        }
      });
    }
    var nextStep2 = document.getElementById('nextStep2');
    if (nextStep2) {
      nextStep2.addEventListener('click', function() {
        var date = document.getElementById('bookingDate').value;
        var time = document.getElementById('bookingTime').value;
        if (date && time) {
          if (validateBookingStep(2)) {
            currentStep++;
            updateBookingSteps();
          }
        } else {
          showNotification('Please select date and time', 'error');
        }
      });
    }
    var prevStep2 = document.getElementById('prevStep2');
    if (prevStep2) {
      prevStep2.addEventListener('click', function() {
        currentStep--;
        updateBookingSteps();
      });
    }
    var submitBtn = document.getElementById('submitBooking');
    if (submitBtn) {
      submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        var termsAccept = document.getElementById('termsAccept');
        if (!termsAccept.checked) {
          showNotification('Please accept the terms and conditions', 'error');
          return;
        }
        submitBooking();
      });
    }
  }
}

function updateBookingSteps() {
  var steps = document.querySelectorAll('.step');
  for (var i = 0; i < steps.length; i++) {
    steps[i].classList.remove('active', 'completed');
    if (i + 1 < currentStep) {
      steps[i].classList.add('completed');
    } else if (i + 1 === currentStep) {
      steps[i].classList.add('active');
    }
  }
  var contents = document.querySelectorAll('.booking-form-content');
  for (var j = 0; j < contents.length; j++) {
    contents[j].classList.remove('active');
    if (j + 1 === currentStep) {
      contents[j].classList.add('active');
    }
  }
  var prevBtn = document.getElementById('prevStep');
  var nextBtn = document.getElementById('nextStep');
  var submitBtn = document.getElementById('submitBooking');
  if (prevBtn) prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-block';
  if (nextBtn) nextBtn.style.display = currentStep === totalSteps ? 'none' : 'inline-block';
  if (submitBtn) submitBtn.style.display = currentStep === totalSteps ? 'inline-block' : 'none';
}

function validateBookingStep(step) {
  if (step === 1) {
    var service = document.getElementById('service').value;
    if (!service) {
      showNotification('Please select a service', 'error');
      return false;
    }
  } else if (step === 2) {
    var date = document.getElementById('bookingDate').value;
    var time = document.getElementById('bookingTime').value;
    if (!date || !time) {
      showNotification('Please select date and time', 'error');
      return false;
    }
  } else if (step === 3) {
    var name = document.getElementById('clientName').value;
    var email = document.getElementById('clientEmail').value;
    var phone = document.getElementById('clientPhone').value;
    if (!name || !email || !phone) {
      showNotification('Please fill in all contact details', 'error');
      return false;
    }
  }
  return true;
}

function submitBooking() {
  var bookingData = {
    id: Date.now(),
    service: sanitizeInput(document.getElementById('service').value),
    date: sanitizeInput(document.getElementById('bookingDate').value),
    time: sanitizeInput(document.getElementById('bookingTime').value),
    name: sanitizeInput(document.getElementById('clientName').value),
    email: sanitizeInput(document.getElementById('clientEmail').value),
    phone: sanitizeInput(document.getElementById('clientPhone').value),
    address: sanitizeInput(document.getElementById('clientAddress').value),
    notes: sanitizeInput(document.getElementById('bookingNotes').value),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  var bookings = getStoredBookings();
  bookings.push(bookingData);
  localStorage.setItem('taw_bookings', JSON.stringify(bookings));
  showNotification('Booking submitted successfully! We will confirm your appointment soon.', 'success');
  document.getElementById('bookingForm').reset();
  currentStep = 1;
  updateBookingSteps();
  setTimeout(function() {
    window.location.href = 'index.html';
  }, 2000);
}

// ========================================
// ADMIN PANEL
// ========================================

function initAdminPanel() {
  var adminTabs = document.querySelectorAll('.admin-tab');
  var adminContents = document.querySelectorAll('.admin-content');
  for (var i = 0; i < adminTabs.length; i++) {
    adminTabs[i].addEventListener('click', function() {
      var target = this.dataset.target;
      for (var j = 0; j < adminTabs.length; j++) {
        adminTabs[j].classList.remove('active');
      }
      this.classList.add('active');
      for (var k = 0; k < adminContents.length; k++) {
        adminContents[k].classList.remove('active');
        if (adminContents[k].id === target) {
          adminContents[k].classList.add('active');
        }
      }
      if (target === 'bookings-content' && typeof loadBookingsTable === 'function') {
        loadBookingsTable();
      } else if (target === 'messages-content' && typeof loadMessagesTable === 'function') {
        loadMessagesTable();
      }
    });
  }
  if (typeof loadAdminStats === 'function') loadAdminStats();
}

// ========================================
// FILTER BUTTONS (Projects)
// ========================================

function initFilterButtons() {
  var filterBtns = document.querySelectorAll('.filter-btn');
  var projectCards = document.querySelectorAll('.project-card');
  for (var i = 0; i < filterBtns.length; i++) {
    filterBtns[i].addEventListener('click', function() {
      for (var j = 0; j < filterBtns.length; j++) {
        filterBtns[j].classList.remove('active');
      }
      this.classList.add('active');
      var filter = this.dataset.filter;
      for (var k = 0; k < projectCards.length; k++) {
        if (filter === 'all' || projectCards[k].dataset.category === filter) {
          projectCards[k].style.display = 'block';
          projectCards[k].style.animation = 'fadeIn 0.5s ease';
        } else {
          projectCards[k].style.display = 'none';
        }
      }
    });
  }
}

// ========================================
// MODAL
// ========================================

function initModal() {
  var modalClose = document.querySelector('.modal-close');
  var modal = document.querySelector('.modal');
  if (modalClose && modal) {
    modalClose.addEventListener('click', function() {
      modal.classList.remove('active');
    });
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
}

function showModal(title, content) {
  var modal = document.querySelector('.modal');
  var modalTitle = document.querySelector('.modal-header h3');
  var modalBody = document.querySelector('.modal-body');
  if (modal && modalTitle && modalBody) {
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.classList.add('active');
  }
}

// ========================================
// NOTIFICATIONS
// ========================================

function showNotification(message, type) {
  type = type || 'info';
  var notification = document.querySelector('.notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  notification.textContent = message;
  notification.className = 'notification notification-' + type + ' show';
  setTimeout(function() {
    notification.classList.remove('show');
  }, 4000);
}
// Disable right click (basic protection)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// Disable certain keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Disable F12
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }
    // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if ((e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || 
        (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        return false;
    }
});
// ========================================
// UTILITY FUNCTIONS
// ========================================

var anchors = document.querySelectorAll('a[href^="#"]');
for (var i = 0; i < anchors.length; i++) {
  anchors[i].addEventListener('click', function(e) {
    var href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
}

function validateEmail(email) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  var re = /^[\d\s\-\+\(\)]+$/;
  return re.test(phone) && phone.length >= 10;
}

window.showNotification = showNotification;
window.showModal = showModal;

console.log('Twin Aluminium Works - Website Loaded Successfully');