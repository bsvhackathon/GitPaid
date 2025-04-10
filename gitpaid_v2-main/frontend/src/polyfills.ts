// Import buffer polyfill
import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;

// No need to import process directly - we'll handle it in webpack