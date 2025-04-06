// Add type declarations for process
declare module 'process' {
    global {
      namespace NodeJS {
        interface Process {
          browser: boolean;
          env: Record<string, string>;
          version: string;
          nextTick: (callback: (...args: any[]) => void, ...args: any[]) => void;
        }
      }
      
      var process: NodeJS.Process;
    }
  
    export = process;
  }
  
  declare module 'process/browser' {
    export = process;
  }
  
  declare module 'process/browser.js' {
    export = process;
  }