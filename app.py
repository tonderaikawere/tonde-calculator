import ast
import math
from dataclasses import dataclass

from flask import Flask, jsonify, render_template, request


# ---------- Safe evaluator ----------
@dataclass(frozen=True)
class EvalConfig:
    deg_mode: bool


_ALLOWED_BINOPS = {
    ast.Add: lambda a, b: a + b,
    ast.Sub: lambda a, b: a - b,
    ast.Mult: lambda a, b: a * b,
    ast.Div: lambda a, b: a / b,
    ast.Mod: lambda a, b: a % b,
    ast.Pow: lambda a, b: a**b,
}

_ALLOWED_UNARYOPS = {
    ast.UAdd: lambda a: +a,
    ast.USub: lambda a: -a,
}


def _wrap_trig(fn, cfg: EvalConfig):
    if not cfg.deg_mode:
        return fn

    def _deg(x: float) -> float:
        return fn(math.radians(x))

    return _deg


def _build_env(cfg: EvalConfig) -> dict:
    return {
        "pi": math.pi,
        "e": math.e,
        "abs": abs,
        "round": round,
        "sqrt": math.sqrt,
        "ln": math.log,
        "log": math.log10,
        "exp": math.exp,
        "fact": lambda n: math.factorial(int(n)),
        "factorial": lambda n: math.factorial(int(n)),
        "sin": _wrap_trig(math.sin, cfg),
        "cos": _wrap_trig(math.cos, cfg),
        "tan": _wrap_trig(math.tan, cfg),
        "asin": _wrap_trig(math.asin, cfg),
        "acos": _wrap_trig(math.acos, cfg),
        "atan": _wrap_trig(math.atan, cfg),
    }


def _build_env_with_vars(cfg: EvalConfig, vars_env: dict) -> dict:
    env = _build_env(cfg)
    for k, v in (vars_env or {}).items():
        if not isinstance(k, str):
            continue
        if not isinstance(v, (int, float)):
            continue
        env[k] = float(v)
    return env


def _eval_node(node: ast.AST, env: dict) -> float:
    if isinstance(node, ast.Expression):
        return _eval_node(node.body, env)

    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return float(node.value)
        raise ValueError("Only numbers are allowed")

    if isinstance(node, ast.Name):
        if node.id in env and isinstance(env[node.id], (int, float)):
            return float(env[node.id])
        raise ValueError(f"Unknown symbol: {node.id}")

    if isinstance(node, ast.BinOp):
        op_type = type(node.op)
        if op_type not in _ALLOWED_BINOPS:
            raise ValueError("Operator not allowed")
        left = _eval_node(node.left, env)
        right = _eval_node(node.right, env)
        return float(_ALLOWED_BINOPS[op_type](left, right))

    if isinstance(node, ast.UnaryOp):
        op_type = type(node.op)
        if op_type not in _ALLOWED_UNARYOPS:
            raise ValueError("Unary operator not allowed")
        val = _eval_node(node.operand, env)
        return float(_ALLOWED_UNARYOPS[op_type](val))

    if isinstance(node, ast.Call):
        if not isinstance(node.func, ast.Name):
            raise ValueError("Only simple function calls are allowed")
        fn_name = node.func.id
        if fn_name not in env or not callable(env[fn_name]):
            raise ValueError(f"Unknown function: {fn_name}")
        args = [_eval_node(a, env) for a in node.args]
        if node.keywords:
            raise ValueError("Keyword arguments are not allowed")
        return float(env[fn_name](*args))

    raise ValueError("Expression not allowed")


def safe_eval(expr: str, cfg: EvalConfig) -> float:
    expr = expr.strip()
    if not expr:
        raise ValueError("Empty expression")

    # Simple normalizations
    expr = expr.replace("×", "*").replace("÷", "/")
    expr = expr.replace("^", "**")

    # Guard against extremely long inputs
    if len(expr) > 250:
        raise ValueError("Expression too long")

    env = _build_env(cfg)
    tree = ast.parse(expr, mode="eval")
    return _eval_node(tree, env)


def safe_eval_with_vars(expr: str, cfg: EvalConfig, vars_env: dict) -> float:
    expr = expr.strip()
    if not expr:
        raise ValueError("Empty expression")

    expr = expr.replace("×", "*").replace("÷", "/")
    expr = expr.replace("^", "**")

    if len(expr) > 250:
        raise ValueError("Expression too long")

    env = _build_env_with_vars(cfg, vars_env)
    tree = ast.parse(expr, mode="eval")
    return _eval_node(tree, env)


app = Flask(__name__)


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/eval")
def api_eval():
    data = request.get_json(silent=True) or {}
    expr = str(data.get("expr", ""))
    deg = bool(data.get("deg", True))
    cfg = EvalConfig(deg_mode=deg)

    try:
        value = safe_eval(expr, cfg)
        if abs(value - int(value)) < 1e-12:
            out = str(int(value))
        else:
            out = str(value)
        return jsonify({"ok": True, "result": out})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 400


@app.post("/api/evalfx")
def api_evalfx():
    data = request.get_json(silent=True) or {}
    expr = str(data.get("expr", ""))
    deg = bool(data.get("deg", True))
    cfg = EvalConfig(deg_mode=deg)

    try:
        xmin = float(data.get("xmin", -10))
        xmax = float(data.get("xmax", 10))
        points = int(data.get("points", 200))
    except Exception:
        return jsonify({"ok": False, "error": "Invalid graph parameters"}), 400

    if points < 20 or points > 800:
        return jsonify({"ok": False, "error": "Points must be between 20 and 800"}), 400
    if not math.isfinite(xmin) or not math.isfinite(xmax) or xmin == xmax:
        return jsonify({"ok": False, "error": "Invalid x-range"}), 400

    if xmin > xmax:
        xmin, xmax = xmax, xmin

    step = (xmax - xmin) / (points - 1)
    xs = []
    ys = []
    for i in range(points):
        x = xmin + step * i
        try:
            y = safe_eval_with_vars(expr, cfg, {"x": x})
            if not math.isfinite(y):
                y = None
        except Exception:
            y = None
        xs.append(x)
        ys.append(y)

    return jsonify({"ok": True, "xs": xs, "ys": ys})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True, use_reloader=False)
