/**
 * SimpleValidator for Bootstrap 5
 * A lightweight, old-school form validation library.
 */
(function (window) {
    'use strict';

    function SimpleValidator(formSelector, options) {
        this.form = document.querySelector(formSelector);
        this.options = options || {};
        this.fields = this.options.fields || {};

        if (!this.form) {
            console.error('SimpleValidator: Form not found for selector ' + formSelector);
            return;
        }

        this.init();
    }

    SimpleValidator.prototype.init = function () {
        var self = this;
        // Disable default HTML5 validation
        this.form.setAttribute('novalidate', true);

        this.form.addEventListener('submit', function (e) {
            self.validate(e);
        });

        // Real-time validation: clear "invalid" class as user types if fixed
        this.form.addEventListener('input', function (e) {
            self.handleInput(e);
        });
    };

    SimpleValidator.prototype.handleInput = function (e) {
        var input = e.target;
        var fieldName = input.getAttribute('name');

        // Only validate if we have a config for this field
        if (!this.fields[fieldName]) return;

        // If the field is currently marked as invalid, re-validate immediately
        // This creates a "lazy" validation pattern: we don't nag until they submit,
        // but we clear errors immediately when they fix them.
        if (input.classList.contains('is-invalid')) {
            var fieldConfig = this.fields[fieldName];
            var valid = fieldConfig.test(input.value);
            if (valid) {
                this.clearError(input);
            }
        }
    };

    SimpleValidator.prototype.validate = function (e) {
        var self = this;
        var isValid = true;
        var errors = {};
        var values = {};

        // Reset all errors first? Or handle per field?
        // Let's iterate over defined fields
        for (var fieldName in this.fields) {
            if (this.fields.hasOwnProperty(fieldName)) {
                var fieldConfig = this.fields[fieldName];
                var input = this.form.querySelector('[name="' + fieldName + '"]');

                if (!input) continue;

                var value = input.value;
                values[fieldName] = value;
                var valid = fieldConfig.test(value);

                if (!valid) {
                    isValid = false;
                    errors[fieldName] = fieldConfig.error_message;
                    self.showError(input, fieldConfig.error_message);
                } else {
                    self.clearError(input);
                }
            }
        }

        if (isValid) {
            // Handle Loading State
            var btn = this.options.submitButton
                ? document.querySelector(this.options.submitButton)
                : this.form.querySelector('[type="submit"]');

            var reset = function () { }; // Default no-op if no button

            if (btn) {
                var originalHtml = btn.innerHTML;
                var loadingHtml = this.options.submitButtonLoading;

                if (loadingHtml) {
                    btn.innerHTML = loadingHtml;
                }
                btn.disabled = true;

                reset = function () {
                    btn.disabled = false;
                    btn.innerHTML = originalHtml;
                };
            }

            if (typeof this.options.onValid === 'function') {
                this.options.onValid(e, this.form, values, reset);
            }
            // If onValid is NOT provided, form submits normally (button stays disabled/loading)
        } else {
            e.preventDefault();
            e.stopPropagation();
            if (typeof this.options.onInvalid === 'function') {
                this.options.onInvalid(errors);
            }
        }
    };

    SimpleValidator.prototype.showError = function (input, message) {
        // Bootstrap 5: Add is-invalid class
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');

        // Find or create invalid-feedback
        var feedback = input.parentNode.querySelector('.invalid-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            input.parentNode.appendChild(feedback);
        }
        feedback.textContent = message;
    };

    SimpleValidator.prototype.clearError = function (input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid'); // Optional: show green tick
    };

    // Expose Global
    window.SimpleValidator = SimpleValidator;

})(window);
