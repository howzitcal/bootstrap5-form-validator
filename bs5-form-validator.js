/**
 * BS5FormValidator for Bootstrap 5
 * A lightweight, old-school form validation library.
 */
(function (window) {
    'use strict';

    function BS5FormValidator(formSelector, options) {
        this.form = document.querySelector(formSelector);
        this.options = options || {};
        this.fields = this.options.fields || {};

        if (!this.form) {
            console.error('BS5FormValidator: Form not found for selector ' + formSelector);
            return;
        }

        this.init();
    }

    BS5FormValidator.prototype.init = function () {
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

    BS5FormValidator.prototype.handleInput = function (e) {
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

    BS5FormValidator.prototype.validate = function (e) {
        var self = this;
        var isValid = true;
        var errors = {};
        var values = {};

        // 1. Collect all values from the form (even non-validated ones)
        // We use querySelectorAll to find all inputs, selects, and textareas with a name
        var elements = this.form.querySelectorAll('[name]');
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            var name = el.getAttribute('name');
            var type = el.getAttribute('type');

            if (type === 'radio') {
                if (el.checked) {
                    values[name] = el.value;
                }
            } else if (type === 'checkbox') {
                // If multiple checkboxes have same name, we should probably make an array
                // But for "simple", let's just handle single boolean or overwrite
                // A better approach for old school:
                if (!values.hasOwnProperty(name)) {
                    // Check if there are other checkboxes with same name
                    var checkboxes = self.form.querySelectorAll('[name="' + name + '"]');
                    if (checkboxes.length > 1) {
                        // It's a group, collected checked ones
                        var checked = [];
                        for (var j = 0; j < checkboxes.length; j++) {
                            if (checkboxes[j].checked) checked.push(checkboxes[j].value);
                        }
                        values[name] = checked;
                    } else {
                        values[name] = el.checked;
                    }
                }
            } else {
                values[name] = el.value;
            }
        }

        // 2. Validate specific fields
        for (var fieldName in this.fields) {
            if (this.fields.hasOwnProperty(fieldName)) {
                var fieldConfig = this.fields[fieldName];
                var input = this.form.querySelector('[name="' + fieldName + '"]');

                if (!input) continue;

                var value = input.value;
                // values[fieldName] = value; // Already collected above
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
            var btn = this.form.querySelector('[type="submit"]');

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

    BS5FormValidator.prototype.showError = function (input, message) {
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

    BS5FormValidator.prototype.clearError = function (input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid'); // Optional: show green tick
    };

    // Expose Global
    window.BS5FormValidator = BS5FormValidator;

})(window);
