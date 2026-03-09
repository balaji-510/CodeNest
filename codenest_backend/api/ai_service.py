"""
AI Service for CodeNest
Integrates with multiple AI providers: OpenAI, Google Gemini, Groq
"""

import os
import json
import requests
from django.conf import settings

class AIService:
    """
    AI Service that can use multiple providers
    Priority: Groq (free) > OpenAI > Gemini > Fallback
    """
    
    @staticmethod
    def get_ai_response(query, context):
        """
        Get AI response from available provider
        
        Args:
            query: User's question
            context: Dict with code, language, problem details
            
        Returns:
            AI generated response text
        """
        # Try providers in order of preference
        providers = [
            ('GROQ', AIService._get_groq_response),
            ('OPENAI', AIService._get_openai_response),
            ('GEMINI', AIService._get_gemini_response),
        ]
        
        for provider_name, provider_func in providers:
            api_key = getattr(settings, f'{provider_name}_API_KEY', None)
            if api_key and api_key != 'your-api-key-here':
                try:
                    response = provider_func(query, context, api_key)
                    if response:
                        return response
                except Exception as e:
                    print(f"{provider_name} failed: {str(e)}")
                    continue
        
        # Fallback to rule-based responses
        return AIService._get_fallback_response(query, context)
    
    @staticmethod
    def _build_system_prompt():
        """Build the system prompt for AI"""
        return """You are an expert coding tutor and mentor for a competitive programming platform called CodeNest. Your role is to:

1. **Provide Hints, Not Solutions**: Guide students without giving away complete answers
2. **Explain Concepts**: Break down complex topics into understandable parts
3. **Analyze Code**: Review code for efficiency, correctness, and best practices
4. **Teach Complexity**: Explain time and space complexity with Big O notation
5. **Debug Issues**: Help identify and fix errors
6. **Encourage Learning**: Be supportive and educational

Guidelines:
- Use clear, concise language
- Include code examples when helpful
- Use emojis for better readability (💡 for hints, ⚡ for complexity, 📝 for explanations)
- Format responses with markdown
- Be encouraging and positive
- Don't give direct solutions unless explicitly asked
- Focus on teaching problem-solving approaches

Remember: Your goal is to help students learn and improve their coding skills!"""
    
    @staticmethod
    def _build_user_prompt(query, context):
        """Build the user prompt with context"""
        code = context.get('code', '')
        language = context.get('language', 'javascript')
        problem_title = context.get('problemTitle', '')
        problem_description = context.get('problemDescription', '')
        
        prompt = f"Question: {query}\n\n"
        
        if problem_title:
            prompt += f"Problem: {problem_title}\n"
        
        if problem_description:
            prompt += f"Description: {problem_description[:300]}...\n\n"
        
        if code:
            prompt += f"Current Code ({language}):\n```{language}\n{code}\n```\n\n"
        
        prompt += "Please provide a helpful, educational response."
        
        return prompt
    
    @staticmethod
    def _get_groq_response(query, context, api_key):
        """
        Get response from Groq (Fast, Free, Good quality)
        Uses Llama 3 model
        """
        url = "https://api.groq.com/openai/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "llama-3.3-70b-versatile",  # Updated model
            "messages": [
                {"role": "system", "content": AIService._build_system_prompt()},
                {"role": "user", "content": AIService._build_user_prompt(query, context)}
            ],
            "temperature": 0.7,
            "max_tokens": 1000,
            "top_p": 1,
            "stream": False
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        return result['choices'][0]['message']['content']
    
    @staticmethod
    def _get_openai_response(query, context, api_key):
        """
        Get response from OpenAI GPT
        Uses GPT-3.5-turbo or GPT-4
        """
        url = "https://api.openai.com/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "gpt-3.5-turbo",  # or "gpt-4" for better quality
            "messages": [
                {"role": "system", "content": AIService._build_system_prompt()},
                {"role": "user", "content": AIService._build_user_prompt(query, context)}
            ],
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        return result['choices'][0]['message']['content']
    
    @staticmethod
    def _get_gemini_response(query, context, api_key):
        """
        Get response from Google Gemini
        Uses Gemini Pro model
        """
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        system_prompt = AIService._build_system_prompt()
        user_prompt = AIService._build_user_prompt(query, context)
        
        data = {
            "contents": [{
                "parts": [{
                    "text": f"{system_prompt}\n\n{user_prompt}"
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1000,
            }
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']
    
    @staticmethod
    def _get_fallback_response(query, context):
        """
        Fallback rule-based responses when no AI provider is available
        """
        query_lower = query.lower()
        code = context.get('code', '')
        problem_title = context.get('problemTitle', '')
        
        # Hint request
        if 'hint' in query_lower or 'guide' in query_lower or 'stuck' in query_lower:
            return f"""💡 **Hint for "{problem_title}":**

Here's a step-by-step approach without giving away the solution:

1. **Understand the Problem:**
   - Read the problem statement carefully
   - Identify the input and output format
   - Note any constraints

2. **Think About Data Structures:**
   - What data structure would be most efficient?
   - Arrays, Hash Maps, Sets, Trees, or Graphs?

3. **Consider the Algorithm:**
   - Can you solve it with a simple loop?
   - Do you need nested loops?
   - Is there a pattern you've seen before?

4. **Start Simple:**
   - Write a brute force solution first
   - Then optimize if needed

**Common Patterns to Consider:**
- Two Pointers
- Sliding Window
- Hash Map for O(1) lookups
- Sorting for easier processing

Would you like me to explain any specific approach in more detail?

---
*Note: For more detailed AI-powered assistance, please configure an AI API key in settings.*"""
        
        # Complexity analysis
        elif 'complexity' in query_lower or 'time' in query_lower or 'space' in query_lower:
            if code:
                has_nested_loops = code.count('for') >= 2 or code.count('while') >= 2
                has_recursion = 'def ' in code and (code.count('def') > 1 or 'return' in code)
                has_hashmap = 'dict' in code or 'Map' in code or 'HashMap' in code or '{}' in code
                
                if has_nested_loops:
                    time_complexity = "O(n²)"
                    time_explanation = "Your code uses nested loops, resulting in quadratic time complexity."
                    optimization = "Consider using a Hash Map to reduce this to O(n) by trading space for time."
                elif has_recursion:
                    time_complexity = "O(2ⁿ) or O(n)"
                    time_explanation = "Recursive solutions can vary. Without memoization, it might be exponential."
                    optimization = "Use dynamic programming or memoization to optimize recursive solutions."
                else:
                    time_complexity = "O(n)"
                    time_explanation = "Your code appears to iterate through the data once."
                    optimization = "This is already efficient for most cases!"
                
                space_complexity = "O(n)" if has_hashmap else "O(1)"
                space_explanation = "Using a Hash Map" if has_hashmap else "Using constant extra space"
                
                return f"""⚡ **Complexity Analysis:**

**Time Complexity:** {time_complexity}
{time_explanation}

**Space Complexity:** {space_complexity}
{space_explanation}

**Optimization Suggestion:**
{optimization}

**Big O Notation Guide:**
- O(1): Constant - Best
- O(log n): Logarithmic - Excellent
- O(n): Linear - Good
- O(n log n): Linearithmic - Acceptable
- O(n²): Quadratic - Can be improved
- O(2ⁿ): Exponential - Needs optimization

---
*Note: For more detailed AI-powered analysis, please configure an AI API key in settings.*"""
            else:
                return "Please share your code so I can analyze its time and space complexity!"
        
        # General help
        return """👋 **I'm here to help!**

I can assist you with:

🎯 **Hints & Guidance:**
- Get hints without spoilers
- Step-by-step approach
- Problem-solving strategies

💡 **Code Analysis:**
- Explain how your code works
- Identify potential issues
- Suggest improvements

⚡ **Complexity Analysis:**
- Time complexity (Big O)
- Space complexity
- Optimization suggestions

📚 **Concept Clarification:**
- Data structures
- Algorithms
- Design patterns

🐛 **Debugging:**
- Find and fix errors
- Handle edge cases
- Test strategies

**Note:** For more intelligent, context-aware responses, please configure an AI API key (Groq, OpenAI, or Gemini) in the Django settings.

What would you like help with?"""
