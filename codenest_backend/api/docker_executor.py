"""
Docker-based secure code execution system for CodeNest.
Provides isolated, resource-limited environments for running user code.
"""

import docker
import json
import time
import tempfile
import os
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class DockerExecutor:
    """
    Secure code executor using Docker containers.
    Each execution runs in an isolated container with resource limits.
    """
    
    # Language configurations with Docker images and execution commands
    LANGUAGE_CONFIGS = {
        'python': {
            'image': 'python:3.11-slim',
            'file_extension': '.py',
            'compile_command': None,
            'run_command': 'python {filename}',
            'timeout': 5,
        },
        'javascript': {
            'image': 'node:18-slim',
            'file_extension': '.js',
            'compile_command': None,
            'run_command': 'node {filename}',
            'timeout': 5,
        },
        'java': {
            'image': 'eclipse-temurin:17-jdk-alpine',
            'file_extension': '.java',
            'compile_command': 'javac {filename}',
            'run_command': 'java {classname}',
            'timeout': 10,
        },
        'cpp': {
            'image': 'gcc:11',
            'file_extension': '.cpp',
            'compile_command': 'g++ -o program {filename} -std=c++17',
            'run_command': './program',
            'timeout': 10,
        },
        'c': {
            'image': 'gcc:11',
            'file_extension': '.c',
            'compile_command': 'gcc -o program {filename}',
            'run_command': './program',
            'timeout': 10,
        },
    }
    
    # Resource limits
    MEMORY_LIMIT = '256m'  # 256 MB
    CPU_PERIOD = 100000    # 100ms
    CPU_QUOTA = 50000      # 50% of one CPU core
    NETWORK_DISABLED = True
    
    def __init__(self):
        """Initialize Docker client."""
        try:
            self.client = docker.from_env()
            self.client.ping()
            logger.info("Docker client initialized successfully")
        except docker.errors.DockerException as e:
            logger.error(f"Failed to initialize Docker client: {e}")
            self.client = None
    
    def is_available(self) -> bool:
        """Check if Docker is available."""
        return self.client is not None
    
    def execute_code(
        self,
        language: str,
        code: str,
        stdin: str = "",
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Execute code in a Docker container.
        
        Args:
            language: Programming language (python, javascript, java, cpp, c)
            code: Source code to execute
            stdin: Standard input for the program
            timeout: Execution timeout in seconds (overrides default)
        
        Returns:
            Dictionary with execution results:
            {
                'stdout': str,
                'stderr': str,
                'exit_code': int,
                'execution_time': float,
                'memory_used': int,
                'is_error': bool,
                'error': str (if error occurred)
            }
        """
        if not self.is_available():
            return {
                'error': 'Docker is not available. Please ensure Docker is installed and running.',
                'is_error': True
            }
        
        if language not in self.LANGUAGE_CONFIGS:
            return {
                'error': f'Unsupported language: {language}',
                'is_error': True
            }
        
        config = self.LANGUAGE_CONFIGS[language]
        timeout = timeout or config['timeout']
        
        try:
            # Pull image if not exists
            self._ensure_image(config['image'])
            
            # Create temporary directory for code
            with tempfile.TemporaryDirectory() as tmpdir:
                # Write code to file
                filename = f"solution{config['file_extension']}"
                filepath = os.path.join(tmpdir, filename)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(code)
                
                # For Java, extract class name
                classname = None
                if language == 'java':
                    classname = self._extract_java_classname(code)
                    if not classname:
                        return {
                            'error': 'Could not find public class in Java code',
                            'is_error': True
                        }
                    # Rename file to match class name
                    new_filename = f"{classname}.java"
                    new_filepath = os.path.join(tmpdir, new_filename)
                    os.rename(filepath, new_filepath)
                    filename = new_filename
                
                # Compile if needed
                if config['compile_command']:
                    compile_result = self._run_in_container(
                        config['image'],
                        config['compile_command'].format(
                            filename=filename,
                            classname=classname
                        ),
                        tmpdir,
                        "",
                        timeout=timeout
                    )
                    
                    if compile_result['exit_code'] != 0:
                        return {
                            'stdout': compile_result['stdout'],
                            'stderr': compile_result['stderr'],
                            'exit_code': compile_result['exit_code'],
                            'execution_time': compile_result['execution_time'],
                            'memory_used': 0,
                            'is_error': True,
                            'error': 'Compilation failed'
                        }
                
                # Execute code
                run_command = config['run_command'].format(
                    filename=filename,
                    classname=classname
                )
                
                result = self._run_in_container(
                    config['image'],
                    run_command,
                    tmpdir,
                    stdin,
                    timeout=timeout
                )
                
                return result
                
        except Exception as e:
            logger.error(f"Error executing code: {e}")
            return {
                'error': f'Execution error: {str(e)}',
                'is_error': True
            }
    
    def _ensure_image(self, image: str):
        """Pull Docker image if it doesn't exist."""
        try:
            self.client.images.get(image)
        except docker.errors.ImageNotFound:
            logger.info(f"Pulling Docker image: {image}")
            self.client.images.pull(image)
    
    def _run_in_container(
        self,
        image: str,
        command: str,
        workdir: str,
        stdin: str,
        timeout: int
    ) -> Dict[str, Any]:
        """
        Run command in a Docker container with resource limits.
        
        Args:
            image: Docker image to use
            command: Command to execute
            workdir: Working directory (mounted as volume)
            stdin: Standard input
            timeout: Timeout in seconds
        
        Returns:
            Execution results dictionary
        """
        container = None
        start_time = time.time()
        
        try:
            # If stdin is provided, write it to a file
            stdin_file = None
            if stdin:
                stdin_file = os.path.join(workdir, 'input.txt')
                with open(stdin_file, 'w', encoding='utf-8') as f:
                    f.write(stdin)
                # Modify command to read from file
                command = f"{command} < input.txt"
            
            # Create container with resource limits
            container = self.client.containers.create(
                image=image,
                command=f'sh -c "{command}"',
                volumes={workdir: {'bind': '/workspace', 'mode': 'rw'}},
                working_dir='/workspace',
                mem_limit=self.MEMORY_LIMIT,
                cpu_period=self.CPU_PERIOD,
                cpu_quota=self.CPU_QUOTA,
                network_disabled=self.NETWORK_DISABLED,
                detach=True,
                auto_remove=False  # We'll remove manually after getting stats
            )
            
            # Start container
            container.start()
            
            # Wait for container to finish or timeout
            try:
                exit_code = container.wait(timeout=timeout)
                if isinstance(exit_code, dict):
                    exit_code = exit_code.get('StatusCode', -1)
            except Exception:
                # Timeout occurred
                container.kill()
                execution_time = time.time() - start_time
                return {
                    'stdout': '',
                    'stderr': f'Execution timed out after {timeout} seconds',
                    'exit_code': -1,
                    'execution_time': execution_time,
                    'memory_used': 0,
                    'is_error': True,
                    'error': 'Time limit exceeded'
                }
            
            # Get output
            logs = container.logs(stdout=True, stderr=True)
            output = logs.decode('utf-8', errors='replace')
            
            # Get stats
            try:
                stats = container.stats(stream=False)
                memory_used = stats['memory_stats'].get('usage', 0)
            except:
                memory_used = 0
            
            execution_time = time.time() - start_time
            
            # Split stdout and stderr (Docker combines them)
            # For simplicity, we'll put everything in stdout
            # A more sophisticated approach would capture them separately
            
            return {
                'stdout': output if exit_code == 0 else '',
                'stderr': output if exit_code != 0 else '',
                'exit_code': exit_code,
                'execution_time': round(execution_time, 3),
                'memory_used': memory_used,
                'is_error': exit_code != 0
            }
            
        except docker.errors.ContainerError as e:
            execution_time = time.time() - start_time
            return {
                'stdout': '',
                'stderr': str(e),
                'exit_code': e.exit_status,
                'execution_time': execution_time,
                'memory_used': 0,
                'is_error': True,
                'error': 'Container error'
            }
        except docker.errors.ImageNotFound:
            return {
                'error': f'Docker image not found: {image}',
                'is_error': True
            }
        except Exception as e:
            execution_time = time.time() - start_time
            return {
                'stdout': '',
                'stderr': str(e),
                'exit_code': -1,
                'execution_time': execution_time,
                'memory_used': 0,
                'is_error': True,
                'error': 'Execution failed'
            }
        finally:
            # Clean up container
            if container:
                try:
                    container.remove(force=True)
                except Exception as e:
                    logger.error(f"Failed to remove container: {e}")
            
            # Clean up stdin file
            if stdin and stdin_file and os.path.exists(stdin_file):
                try:
                    os.remove(stdin_file)
                except:
                    pass
    
    def _extract_java_classname(self, code: str) -> Optional[str]:
        """Extract public class name from Java code."""
        import re
        match = re.search(r'public\s+class\s+(\w+)', code)
        if match:
            return match.group(1)
        return None
    
    def execute_with_testcases(
        self,
        language: str,
        code: str,
        testcases: list
    ) -> Dict[str, Any]:
        """
        Execute code against multiple test cases.
        
        Args:
            language: Programming language
            code: Source code
            testcases: List of dicts with 'input' and 'expected_output'
        
        Returns:
            Dictionary with results for all test cases
        """
        results = []
        passed = 0
        total = len(testcases)
        
        for i, testcase in enumerate(testcases):
            result = self.execute_code(
                language=language,
                code=code,
                stdin=testcase.get('input', '')
            )
            
            if result.get('is_error'):
                results.append({
                    'testcase': i + 1,
                    'passed': False,
                    'input': testcase.get('input', ''),
                    'expected': testcase.get('expected_output', ''),
                    'actual': result.get('stderr', ''),
                    'error': result.get('error', 'Execution failed'),
                    'execution_time': result.get('execution_time', 0)
                })
            else:
                actual_output = result.get('stdout', '').strip()
                expected_output = testcase.get('expected_output', '').strip()
                
                # Normalize outputs for comparison
                actual_normalized = '\n'.join(line.rstrip() for line in actual_output.split('\n')).rstrip()
                expected_normalized = '\n'.join(line.rstrip() for line in expected_output.split('\n')).rstrip()
                
                is_passed = actual_normalized == expected_normalized
                if is_passed:
                    passed += 1
                
                results.append({
                    'testcase': i + 1,
                    'passed': is_passed,
                    'input': testcase.get('input', ''),
                    'expected': expected_output,
                    'actual': actual_output,
                    'execution_time': result.get('execution_time', 0),
                    'memory_used': result.get('memory_used', 0)
                })
        
        return {
            'passed': passed,
            'total': total,
            'all_passed': passed == total,
            'results': results
        }


# Singleton instance
_executor = None

def get_executor() -> DockerExecutor:
    """Get or create DockerExecutor singleton."""
    global _executor
    if _executor is None:
        _executor = DockerExecutor()
    return _executor
