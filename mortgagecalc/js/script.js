// script.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mortgage-form');
  const resultsContainer = document.getElementById('results');
  const clearAllButton = document.getElementById('clear-all');

  form.addEventListener('submit', (event) => {
      event.preventDefault();
      calculateRepayments();
  });

  clearAllButton.addEventListener('click', () => {
      form.reset();
      clearResults();
  });

  function calculateRepayments() {
      const amount = parseFloat(form.amount.value);
      const term = parseFloat(form.term.value);
      const rate = parseFloat(form.rate.value) / 100;
      const type = form.type.value;

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
          <img src="illustration-empty.svg" alt="empty illustration">
          <h2>Results shown here</h2>
          <p>Complete the form and click “calculate repayments” to see what your monthly repayments would be.</p>
      `;
  }
});
