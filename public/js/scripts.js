// js script for the login page

document.addEventListener('DOMContentLoaded', () => {
  // Password visibility toggle
  const passwordToggle = document.querySelector('.password-toggle');
  const passwordInput = document.getElementById('password');

  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      // Toggle between password and text type
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;

      // Optionally, change the icon based on visibility state
      const eyeIcon = passwordToggle.querySelector('svg');
      if (eyeIcon) {
        const pathData = `
          <path
            d="M4.18292 11.6021C4.86636 8.32689 7.7182 6 10.9238 6C14.1295 6 16.9813 8.32688 17.6648 11.6021C17.7212 11.8725 17.9861 12.0459 18.2564 11.9895C18.5267 11.933 18.7001 11.6682 18.6437 11.3979C17.8664 7.67312 14.6173 5 10.9238 5C7.23043 5 3.98125 7.67311 3.204 11.3979C3.1476 11.6682 3.32101 11.933 3.59132 11.9895C3.86164 12.0459 4.12651 11.8725 4.18292 11.6021ZM10.9238 8C8.99083 8 7.42383 9.567 7.42383 11.5C7.42383 13.433 8.99083 15 10.9238 15C12.8568 15 14.4238 13.433 14.4238 11.5C14.4238 9.567 12.8568 8 10.9238 8ZM8.42383 11.5C8.42383 10.1193 9.54312 9 10.9238 9C12.3045 9 13.4238 10.1193 13.4238 11.5C13.4238 12.8807 12.3045 14 10.9238 14C9.54312 14 8.42383 12.8807 8.42383 11.5Z"
            fill="#2B3545"
          />
        `;
        eyeIcon.innerHTML = pathData; // Keeps same path, update if you want different for open/closed
      }
    });
  }

  // Handle form submission
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');

      if (!emailInput.value || !passwordInput.value) {
        alert('Please fill in all required fields');
        return;
      }

      const loginButton = document.querySelector('.login-button');
      if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';
      }

      fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: emailInput.value,
          password: passwordInput.value,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((errorData) => {
              throw new Error(errorData.message || 'Unknown error');
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log('Login successful:', data);
          window.location.href = '/docs';
        })
        .catch((error) => {
          console.error('Login failed:', error);
          alert(`Login failed: ${error.message}`);
        })
        .finally(() => {
          if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = 'Log in';
          }
        });
    });
  }
});
