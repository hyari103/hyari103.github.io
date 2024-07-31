// script.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mortgage-form');
  const resultsContainer = document.getElementById('results');
  const clearAllButton = document.getElementById('clear-all');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (validateForm()) {
      calculateRepayments();
    }
  });

  clearAllButton.addEventListener('click', () => {
    form.reset();
    clearResults();
    clearValidationErrors();
  });

  function validateForm() {
    let isValid = true;
    const amount = form.amount;
    const term = form.term;
    const rate = form.rate;
    const radioGroup = document.querySelector('.radio-group');
    
    if (!amount.value) {
      isValid = false;
      showError(amount, 'This field is required');
    } else {
      clearError(amount);
    }

    if (!term.value) {
      isValid = false;
      showError(term, 'This field is required');
    } else {
      clearError(term);
    }

    if (!rate.value) {
      isValid = false;
      showError(rate, 'This field is required');
    } else {
      clearError(rate);
    }

    if (!form.querySelector('input[name="type"]:checked')) {
      isValid = false;
      radioGroup.classList.add('error');
      if (!radioGroup.querySelector('.error-message')) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.innerText = 'This field is required';
        radioGroup.appendChild(error);
      }
    } else {
      radioGroup.classList.remove('error');
      const error = radioGroup.querySelector('.error-message');
      if (error) error.remove();
    }

    return isValid;
  }

  function showError(input, message) {
    input.classList.add('error');
    let error = input.nextElementSibling;
    if (!error || !error.classList.contains('error-message')) {
      error = document.createElement('div');
      error.className = 'error-message';
      input.parentNode.appendChild(error);
    }
    error.innerText = message;
  }

  function clearError(input) {
    input.classList.remove('error');
    const error = input.nextElementSibling;
    if (error && error.classList.contains('error-message')) {
      error.remove();
    }
  }

  function clearValidationErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => error.remove());
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
  }

  function calculateRepayments() {
    const amount = parseFloat(form.amount.value);
    const term = parseFloat(form.term.value);
    const rate = parseFloat(form.rate.value) / 100;
    const type = form.querySelector('input[name="type"]:checked').value;

    let monthlyRepayment;

    if (type === 'repayment') {
      const monthlyRate = rate / 12;
      const numberOfPayments = term * 12;
      monthlyRepayment = (amount * monthlyRate) / (1 - Math.pow((1 + monthlyRate), -numberOfPayments));
    } else if (type === 'interest-only') {
      monthlyRepayment = (amount * rate) / 12;
    }

    displayResults(monthlyRepayment);
  }

  function displayResults(monthlyRepayment) {
    resultsContainer.innerHTML = `
      <h2>Results</h2>
      <p>Your monthly repayment is: £${monthlyRepayment.toFixed(2)}</p>
    `;
  }

  function clearResults() {
    resultsContainer.innerHTML = `
      <img src="images/illustration-empty.svg" alt="empty illustration">
      <h2>Results shown here</h2>
      <p>Complete the form and click “calculate repayments” to see what your monthly repayments would be.</p>
    `;
  }
});
