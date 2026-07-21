class NeumorphismSignupForm {
    constructor() {
        this.form = document.getElementById('signupForm');
        this.nameInput = document.getElementById('name');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.submitButton = this.form.querySelector('.signup-btn');

        this.init();
    }

    init() {
        this.bindEvents();
        this.setupPasswordToggle();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.nameInput.addEventListener('blur', () => this.validateName());
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        this.nameInput.addEventListener('input', () => this.clearError('name'));
        this.emailInput.addEventListener('input', () => this.clearError('email'));
        this.passwordInput.addEventListener('input', () => this.clearError('password'));
    }

    setupPasswordToggle() {
        this.passwordToggle.addEventListener('click', () => {
            const type = this.passwordInput.type === 'password' ? 'text' : 'password';
            this.passwordInput.type = type;
            this.passwordToggle.classList.toggle('show-password', type === 'text');
        });
    }

    validateName() {
        const name = this.nameInput.value.trim();
        if (!name) {
            this.showError('name', 'Full name is required');
            return false;
        }
        this.clearError('name');
        return true;
    }

    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            this.showError('email', 'Email is required');
            return false;
        }
        if (!emailRegex.test(email)) {
            this.showError('email', 'Please enter a valid email address');
            return false;
        }
        this.clearError('email');
        return true;
    }

    validatePassword() {
        const password = this.passwordInput.value;
        if (!password) {
            this.showError('password', 'Password is required');
            return false;
        }
        if (password.length < 6) {
            this.showError('password', 'Password must be at least 6 characters');
            return false;
        }
        this.clearError('password');
        return true;
    }

    showError(field, message) {
        const formGroup = document.getElementById(field).closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);

        formGroup.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    clearError(field) {
        const formGroup = document.getElementById(field).closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);

        formGroup.classList.remove('error');
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    }

    handleSubmit(e) {
        e.preventDefault();

        const isNameValid = this.validateName();
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();

        if (!isNameValid || !isEmailValid || !isPasswordValid) {
            return;
        }

        this.submitButton.classList.add('loading');
        this.submitButton.disabled = true;

        this.form.submit();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NeumorphismSignupForm();
});