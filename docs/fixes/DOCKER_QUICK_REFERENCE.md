# 🐳 Docker Execution - Quick Reference

## Installation

```bash
# 1. Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop

# 2. Install Python Docker SDK
cd CodeNest/codenest_backend
.\venv\Scripts\activate
pip install docker

# 3. Pull images (optional, auto-pulled when needed)
docker pull python:3.11-slim
docker pull node:18-slim
docker pull openjdk:17-slim
docker pull gcc:11
```

## Quick Setup (Windows)

```bash
cd CodeNest/codenest_backend
.\setup_docker.bat
```

## Testing

```bash
# Test Docker execution
python manage.py test_docker

# Check Docker status
docker ps
docker images
```

## API Endpoints

### Execute Code
```bash
POST /api/execute-code/
{
  "language": "python",
  "code": "print('Hello')",
  "stdin": ""
}
```

### Submit Solution
```bash
POST /api/submissions/submit_solution/
{
  "problem_id": 1,
  "language": "python",
  "code": "x = int(input())\nprint(x * 2)"
}
```

## Supported Languages

| Language | Version | Timeout |
|----------|---------|---------|
| Python | 3.11 | 5s |
| JavaScript | Node 18 | 5s |
| Java | 17 | 10s |
| C++ | GCC 11 | 10s |
| C | GCC 11 | 10s |

## Resource Limits

- **Memory:** 256 MB
- **CPU:** 50% of one core
- **Network:** Disabled
- **Timeout:** 5-10s (language-dependent)

## Common Commands

```bash
# Check Docker
docker --version
docker ps

# View logs
docker logs <container_id>

# Clean up
docker container prune
docker image prune

# Monitor resources
docker stats
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Docker not available | Start Docker Desktop |
| Permission denied | Add user to docker group (Linux) |
| Timeout | Optimize code or increase timeout |
| Image not found | Run `docker pull <image>` |

## Code Examples

### Python
```python
x = int(input())
y = int(input())
print(x + y)
```

### JavaScript
```javascript
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin
});

let lines = [];
rl.on('line', (line) => {
    lines.push(line);
    if (lines.length === 2) {
        console.log(parseInt(lines[0]) + parseInt(lines[1]));
        rl.close();
    }
});
```

### C++
```cpp
#include <iostream>
using namespace std;

int main() {
    int x, y;
    cin >> x >> y;
    cout << x + y << endl;
    return 0;
}
```

### Java
```java
import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        int y = sc.nextInt();
        System.out.println(x + y);
    }
}
```

## Performance Tips

1. Pre-pull images before production
2. Monitor disk space regularly
3. Clean up unused containers
4. Use appropriate timeouts
5. Enable rate limiting

## Security Checklist

- [x] Network disabled
- [x] Resource limits enforced
- [x] Automatic cleanup
- [x] Timeout protection
- [x] Rate limiting enabled
- [x] Container isolation

## Fallback Behavior

```
Docker Available? 
  ├─ Yes → Use Docker (fast, secure)
  └─ No  → Use Piston API (slower, external)
```

## Monitoring

```bash
# Active containers
docker ps

# Resource usage
docker stats

# Disk usage
docker system df

# Logs
docker logs <container_id>
```

## Quick Links

- [Full Guide](DOCKER_EXECUTION_GUIDE.md)
- [Docker Docs](https://docs.docker.com/)
- [Python SDK](https://docker-py.readthedocs.io/)

---

**Need Help?** Check `DOCKER_EXECUTION_GUIDE.md` for detailed documentation.
