# Scientific Calculator (Python)

Developed by **Tonde**.

This project is a **responsive scientific calculator** built with **Python + Flask** (no Streamlit). It runs as a small web app in your browser, so it works well on:

- Desktop
- Tablets
- Mobile devices

## What you get

- A clean calculator UI
- Standard + scientific operations
- A safe expression evaluator (no raw Python `eval`)
- Calculation history

## Requirements

- Python 3.10+ recommended
- Internet is **not** required to run it locally

## Quick start (Windows / PowerShell)

From the project folder:

```bash
pip install -r requirements.txt
python app.py
```

Then open `http://127.0.0.1:5000` in your browser.

## Recommended setup (virtual environment)

Using a virtual environment avoids package conflicts.

### Windows (PowerShell)

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

## How to use

You can either:

- Click the on-screen buttons
- Type directly into the input field

Then press:

- `=` to calculate
- `C` to clear
- `⌫` to remove the last character

### DEG mode

When **DEG** is enabled:

- `sin(30)` means **30 degrees**

When **DEG** is disabled (RAD mode):

- `sin(3.14159/2)` means approximately **1**

## Supported operations

### Basic operators

- `+` addition
- `-` subtraction
- `×` multiplication (you can also type `*`)
- `÷` division (you can also type `/`)
- `%` modulo

### Power

- `^` power (example: `2^3`)
- `**` is also supported (example: `2**3`)

### Parentheses

- Use `(` and `)` for grouping

## Supported functions

The calculator supports the following functions (type them like normal function calls):

- `sin(x)`
- `cos(x)`
- `tan(x)`
- `asin(x)`
- `acos(x)`
- `atan(x)`
- `log(x)` base 10
- `ln(x)` natural log
- `sqrt(x)` square root
- `exp(x)` e^x
- `abs(x)` absolute value
- `fact(x)` factorial (x is converted to an integer)

## Supported constants

- `pi`
- `e`

## Examples

```text
(2+3)*4
sqrt(9)+2^3
log(100)
ln(e)
fact(5)
sin(30)
cos(pi)
```

## Safety / evaluation model

This project **does not** evaluate arbitrary Python code.

Instead, it parses your input into a Python AST and only allows:

- Numeric constants
- A restricted set of operators (`+ - * / % **`)
- A restricted set of functions (`sin`, `cos`, `log`, etc.)

This prevents executing unsafe code while still allowing calculator-style expressions.

## Troubleshooting

### `ModuleNotFoundError: No module named 'flask'`

Install dependencies:

```bash
pip install -r requirements.txt
```

Then run the app:

```bash
python app.py
```

### The app doesn’t open in my browser

Copy the URL printed in the terminal, for example:

`http://127.0.0.1:5000`

## Credits

Developed by **Tonde**.

## License (Tutorial-only)

This repository is provided **for tutorial/learning purposes only**.

See `LICENSE` for the complete terms.
