import { useEffect } from 'react';

/**
 * Component to inject Monaco Editor autocomplete fix styles
 * This ensures the suggest widget text is visible
 */
function MonacoStyleFix() {
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.id = 'monaco-autocomplete-ultra-fix';
    style.textContent = `
      /* ULTRA FIX for Monaco Editor Autocomplete */
      .monaco-editor .suggest-widget,
      .monaco-editor .suggest-widget *,
      .monaco-editor .suggest-widget *::before,
      .monaco-editor .suggest-widget *::after {
        color: #ffffff !important;
      }
      
      .monaco-editor .suggest-widget {
        background: #252526 !important;
        border: 1px solid #454545 !important;
      }
      
      .monaco-editor .suggest-widget .monaco-list .monaco-list-row {
        background: transparent !important;
      }
      
      .monaco-editor .suggest-widget .monaco-list .monaco-list-row:hover {
        background: #2a2d2e !important;
      }
      
      .monaco-editor .suggest-widget .monaco-list .monaco-list-row.focused,
      .monaco-editor .suggest-widget .monaco-list .monaco-list-row.selected {
        background: #094771 !important;
      }
      
      /* Override any inline color styles */
      .monaco-editor .suggest-widget [style*="color"] {
        color: #ffffff !important;
      }
    `;
    
    // Append to head
    document.head.appendChild(style);
    
    // Cleanup
    return () => {
      const existingStyle = document.getElementById('monaco-autocomplete-ultra-fix');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything
}

export default MonacoStyleFix;
