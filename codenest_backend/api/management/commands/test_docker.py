"""
Management command to test Docker-based code execution.
Usage: python manage.py test_docker
"""

from django.core.management.base import BaseCommand
from api.docker_executor import get_executor


class Command(BaseCommand):
    help = 'Test Docker-based code execution'

    def handle(self, *args, **options):
        executor = get_executor()
        
        if not executor.is_available():
            self.stdout.write(self.style.ERROR('❌ Docker is not available'))
            self.stdout.write(self.style.WARNING('Please ensure Docker is installed and running'))
            return
        
        self.stdout.write(self.style.SUCCESS('✅ Docker is available'))
        self.stdout.write('')
        
        # Test Python
        self.stdout.write(self.style.WARNING('Testing Python execution...'))
        python_code = '''
print("Hello from Python!")
x = int(input())
y = int(input())
print(f"Sum: {x + y}")
'''
        result = executor.execute_code('python', python_code, '5\n10\n')
        self._print_result(result)
        
        # Test JavaScript
        self.stdout.write(self.style.WARNING('Testing JavaScript execution...'))
        js_code = '''
console.log("Hello from JavaScript!");
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lines = [];
rl.on('line', (line) => {
    lines.push(line);
    if (lines.length === 2) {
        const sum = parseInt(lines[0]) + parseInt(lines[1]);
        console.log(`Sum: ${sum}`);
        rl.close();
    }
});
'''
        result = executor.execute_code('javascript', js_code, '5\n10\n')
        self._print_result(result)
        
        # Test C++
        self.stdout.write(self.style.WARNING('Testing C++ execution...'))
        cpp_code = '''
#include <iostream>
using namespace std;

int main() {
    cout << "Hello from C++!" << endl;
    int x, y;
    cin >> x >> y;
    cout << "Sum: " << (x + y) << endl;
    return 0;
}
'''
        result = executor.execute_code('cpp', cpp_code, '5\n10\n')
        self._print_result(result)
        
        # Test Java
        self.stdout.write(self.style.WARNING('Testing Java execution...'))
        java_code = '''
import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        int y = sc.nextInt();
        System.out.println("Sum: " + (x + y));
        sc.close();
    }
}
'''
        result = executor.execute_code('java', java_code, '5\n10\n')
        self._print_result(result)
        
        # Test with test cases
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('Testing with multiple test cases...'))
        testcases = [
            {'input': '2\n3\n', 'expected_output': 'Sum: 5'},
            {'input': '10\n20\n', 'expected_output': 'Sum: 30'},
            {'input': '-5\n5\n', 'expected_output': 'Sum: 0'},
        ]
        
        simple_code = '''
x = int(input())
y = int(input())
print(f"Sum: {x + y}")
'''
        
        result = executor.execute_with_testcases('python', simple_code, testcases)
        self.stdout.write(f"Passed: {result['passed']}/{result['total']}")
        for tc_result in result['results']:
            status = '✅' if tc_result['passed'] else '❌'
            self.stdout.write(f"  {status} Test case {tc_result['testcase']}: {tc_result.get('execution_time', 0):.3f}s")
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('✅ All tests completed!'))
    
    def _print_result(self, result):
        if result.get('is_error'):
            self.stdout.write(self.style.ERROR(f"  ❌ Error: {result.get('error', 'Unknown error')}"))
            if result.get('stderr'):
                self.stdout.write(f"  stderr: {result['stderr'][:200]}")
        else:
            self.stdout.write(self.style.SUCCESS(f"  ✅ Success"))
            self.stdout.write(f"  Output: {result.get('stdout', '')[:200]}")
            self.stdout.write(f"  Time: {result.get('execution_time', 0):.3f}s")
            self.stdout.write(f"  Memory: {result.get('memory_used', 0) / 1024:.2f} KB")
        self.stdout.write('')
