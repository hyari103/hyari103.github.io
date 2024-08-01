document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mortgage-form');
  const resultsContainer = document.getElementById('results');
  const clearAllButton = document.getElementById('clear-all');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const isValid = validateForm();
    if (isValid) {
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
      showError(amount);
    } else {
      clearError(amount);
    }

    if (!term.value) {
      isValid = false;
      showError(term);
    } else {
      clearError(term);
    }

    if (!rate.value) {
      isValid = false;
      showError(rate);
    } else {
      clearError(rate);
    }

    if (!form.querySelector('input[name="type"]:checked')) {
      isValid = false;
      showError(radioGroup);
    } else {
      clearError(radioGroup);
    }

    return isValid;
  }

  function showError(input) {
    input.classList.add('error');
    let error = input.parentNode.querySelector('.error-message');
    if (!error) {
      error = document.createElement('div');
      error.className = 'error-message';
      error.innerText = 'This field is required';
      input.parentNode.appendChild(error);
    }
  }

  function clearError(input) {
    input.classList.remove('error');
    const error = input.parentNode.querySelector('.error-message');
    if (error) {
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

    const totalRepayment = monthlyRepayment * term * 12;
    displayResults(monthlyRepayment, totalRepayment);
  }

  function displayResults(monthlyRepayment, totalRepayment) {
    resultsContainer.innerHTML = `
      <div class="results-header">
        <h2>Your results</h2>
        <p>Your results are shown below based on the information you provided. To adjust the results, edit the form and click “calculate repayments” again.</p>
      </div>
      <div class="results-content">
        <div class="monthly-repayment">
          <p>Your monthly repayments</p>
          <h3>£${monthlyRepayment.toFixed(2)}</h3>
        </div>
        <hr>
        <div class="total-repayment">
          <p>Total you'll repay over the term</p>
          <h3>£${totalRepayment.toFixed(2)}</h3>
        </div>
      </div>
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
