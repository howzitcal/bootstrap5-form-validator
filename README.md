# BS5FormValidator

A lightweight, "old school" JavaScript form validation library designed for Bootstrap 5. It handles validation logic, error styling, and submit button states without any build step required.

## Features

-   **Bootstrap 5 Compatible**: Automatically toggles `is-invalid`/`is-valid` classes and manages `.invalid-feedback`.
-   **Real-time Validation**: Clears errors immediately as the user types valid data.
-   **Submit Button State**: Automatically disables the button and shows a loading spinner during processing.
-   **AJAX Ready**: Simple callbacks for success and failure handling.
-   **Full Data Collection**: Collects all form values (even non-validated ones) for easy AJAX submission.
-   **Zero Dependencies**: Just drop it in and use it.

## Installation

Include the script in your HTML file (after Bootstrap):

```html
<script src="bs5-form-validator.min.js"></script>
```

## Usage

### 1. Create your HTML Form

Ensure your inputs have `name` attributes.

```html
<form id="myForm">
    <div class="mb-3">
        <label class="form-label">Email</label>
        <input type="email" class="form-control" name="email">
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

### 2. Initialize the Validator

```javascript
new BS5FormValidator('#myForm', {
    fields: {
        email: {
            test: function(val) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            },
            error_message: "Please enter a valid email"
        }
    },
    // Optional: Loading state HTML
    submitButtonLoading: '<span class="spinner-border spinner-border-sm"></span> Sending...',
    
    onValid: function(event, form, values, reset) {
        // Prevent default submission for AJAX
        event.preventDefault();

        // Perform your AJAX request
        console.log("Submitting:", values);

        // Simulate request
        setTimeout(function() {
            alert("Done!");
            // Call reset() to re-enable the button and restore original text
            reset();
        }, 2000);
    },
    
    onInvalid: function(errors) {
        console.log("Validation failed:", errors);
    }
});
```

## Configuration Options

| Option | Type | Description |
| :--- | :--- | :--- |
| `fields` | `Object` | **Required**. Key-value pairs where keys match input `name` attributes. |
| `submitButtonLoading` | `String` | HTML content to display inside the button during loading state. |
| `onValid` | `Function` | Callback when form is valid. Receives `(event, form, values, reset)`. `values` contains **all** form fields. |
| `onInvalid` | `Function` | Callback when form is invalid. Receives `(errors)`. |

### Field Configuration

Each field object in `fields` requires:

-   `test(value)`: A function that returns `true` if valid, `false` otherwise.
-   `error_message`: The string to display in the `.invalid-feedback` div.

## License

MIT
