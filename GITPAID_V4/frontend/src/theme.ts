import { createTheme } from '@mui/material/styles';

// Define a custom theme for GitPaid
const gitpaidTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#24292e', // GitHub-like dark color
      light: '#4a5568',
      dark: '#1a202c',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#2da44e', // GitHub-like green color
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff'
    },
    error: {
      main: '#cf222e' // GitHub-like red color
    },
    background: {
      default: '#f6f8fa', // GitHub-like light background
      paper: '#ffffff'
    },
    text: {
      primary: '#24292e',
      secondary: '#57606a'
    }
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 600
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '6px 16px'
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 0 rgba(0,0,0,0.1)'
        }
      }
    }
  }
});

export default gitpaidTheme;