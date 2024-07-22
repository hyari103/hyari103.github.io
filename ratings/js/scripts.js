// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const ratingBtns = document.querySelectorAll('.rating-btn');
    const submitBtn = document.querySelector('.submit-btn');
    const ratingState = document.querySelector('.rating-state');
    const thankYouState = document.querySelector('.thank-you-state');
    const selectedRating = document.getElementById('selected-rating');
  
    let selectedValue = 0;
  
    ratingBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        ratingBtns.forEach(btn => btn.classList.remove('active'));
        btn.classList.add('active');
        selectedValue = btn.textContent;
      });
    });
  
    submitBtn.addEventListener('click', () => {
      if (selectedValue > 0) {
        selectedRating.textContent = selectedValue;
        ratingState.classList.add('hidden');
        thankYouState.classList.remove('hidden');
        thankYouState.classList.add('visible');
      }
    });
  });
  