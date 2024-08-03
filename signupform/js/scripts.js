document.getElementById('sign-up').addEventListener('submit', function(event) {
    event.preventDefault();
    clearErrors();

    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    let hasError = false;

    if (!firstName) {
        setError('first-name', 'First Name cannot be empty');
        hasError = true;
    }

    if (!lastName) {
        setError('last-name', 'Last Name cannot be empty');
        hasError = true;
    }

    if (!email) {
        setError('email', 'Email Address cannot be empty');
        hasError = true;
    } else if (!validateEmail(email)) {
        setError('email', 'Looks like this is not an email');
        hasError = true;
    }

    if (!password) {
        setError('password', 'Password cannot be empty');
        hasError = true;
    }

    if (!hasError) {
        // Submit the form
        console.log('Form submitted successfully!');
    }
});

function setError(id, message) {
    const element = document.getElementById(id);
    element.classList.add('error');
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerText = message;
    element.parentElement.insertBefore(errorElement, element.nextSibling);
}

function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => error.remove());

    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(input => input.classList.remove('error'));
}

function validateEmail(email) {
    // Updated regex pattern for email validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
