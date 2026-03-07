import requests

PISTON_API_URL = "https://emkc.org/api/v2/piston/execute"

LANGUAGE_MAP = {
    "python": {"language": "python", "version": "3.10.0"},
    "javascript": {"language": "javascript", "version": "18.15.0"},
    "java": {"language": "java", "version": "15.0.2"},
    "cpp": {"language": "c++", "version": "10.2.0"},
}

def execute_code_piston(language, code, stdin=""):
    """
    Executes code using the Piston API.
    """
    if language not in LANGUAGE_MAP:
        return {"error": f"Unsupported language: {language}"}
        
    config = LANGUAGE_MAP[language]
    
    payload = {
        "language": config["language"],
        "version": config["version"],
        "files": [
            {
                "content": code
            }
        ],
        "stdin": stdin,
        "run_timeout": 3000,
        "compile_timeout": 10000
    }
    
    try:
        response = requests.post(PISTON_API_URL, json=payload, timeout=15)
        response.raise_for_status()
        result = response.json()
        
        # Piston response format:
        # {
        #   "run": {
        #     "stdout": "...",
        #     "stderr": "...",
        #     "output": "...",
        #     "code": 0,
        #     "signal": null
        #   },
        #   "language": "python",
        #   "version": "3.10.0"
        # }
        
        run_result = result.get("run", {})
        return {
            "output": run_result.get("output", ""),
            "stdout": run_result.get("stdout", ""),
            "stderr": run_result.get("stderr", ""),
            "is_error": run_result.get("code", 0) != 0
        }
        
    except requests.exceptions.RequestException as e:
        return {"error": f"Execution failed: {str(e)}"}
