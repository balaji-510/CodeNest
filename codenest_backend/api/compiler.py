import subprocess
import tempfile
import os
import time
import re

LANGUAGE_MAP = {
    "python":     {"ext": ".py",   "run": ["python", "{file}"],          "compile": None},
    "javascript": {"ext": ".js",   "run": ["node", "{file}"],            "compile": None},
    "java":       {"ext": ".java", "run": ["java", "{classname}"],       "compile": ["javac", "{file}"]},
    "cpp":        {"ext": ".cpp",  "run": [".{sep}program"],             "compile": ["g++", "-o", "program", "{file}", "-std=c++17"]},
    "c":          {"ext": ".c",    "run": [".{sep}program"],             "compile": ["gcc", "-o", "program", "{file}"]},
}

TIMEOUT = 10  # seconds


def execute_code_piston(language, code, stdin=""):
    """
    Execute code locally using subprocess (no external API needed).
    Falls back gracefully if the runtime is not installed.
    """
    if language not in LANGUAGE_MAP:
        return {"error": f"Unsupported language: {language}"}

    config = LANGUAGE_MAP[language]
    sep = os.sep

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            # Determine filename
            if language == "java":
                match = re.search(r'public\s+class\s+(\w+)', code)
                classname = match.group(1) if match else "Solution"
                filename = f"{classname}.java"
            else:
                filename = f"solution{config['ext']}"

            filepath = os.path.join(tmpdir, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(code)

            # Compile step
            if config["compile"]:
                compile_cmd = [
                    part.format(file=filename, classname=classname if language == "java" else "")
                    for part in config["compile"]
                ]
                comp = subprocess.run(
                    compile_cmd,
                    cwd=tmpdir,
                    capture_output=True,
                    text=True,
                    timeout=TIMEOUT,
                )
                if comp.returncode != 0:
                    return {
                        "stdout": "",
                        "stderr": comp.stderr,
                        "output": comp.stderr,
                        "is_error": True,
                    }

            # Run step
            run_cmd = [
                part.format(
                    file=filename,
                    classname=classname if language == "java" else "",
                    sep=sep,
                )
                for part in config["run"]
            ]

            start = time.time()
            proc = subprocess.run(
                run_cmd,
                cwd=tmpdir,
                input=stdin,
                capture_output=True,
                text=True,
                timeout=TIMEOUT,
            )
            elapsed = round(time.time() - start, 3)

            is_error = proc.returncode != 0
            output = proc.stdout if not is_error else proc.stderr

            return {
                "stdout": proc.stdout,
                "stderr": proc.stderr,
                "output": output,
                "is_error": is_error,
                "execution_time": elapsed,
            }

    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "Time limit exceeded", "output": "Time limit exceeded", "is_error": True}
    except FileNotFoundError as e:
        # Runtime not installed on this machine
        return {"error": f"Runtime not found: {e}. Please install the required language runtime or start Docker."}
    except Exception as e:
        return {"error": f"Execution failed: {str(e)}"}
