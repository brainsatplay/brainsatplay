// Handles requests from the browser and inputs from Node.js
export function getOS(platform = (window.navigator as any)?.userAgentData?.platform || window.navigator.platform) {
    var userAgent = window.navigator.userAgent,
        macosPlatforms = [
            'Macintosh', 
            'MacIntel', 
            'MacPPC', 
            'Mac68K', 
            "macOS",
            "darwin", // Node.js
        ],
        windowsPlatforms = [
            'Win32', 
            'Win64', 
            'Windows', 
            'WinCE', 
            "win32" // Node.js
        ],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = platform; // Will pass lowercase linux and android
  
    if (macosPlatforms.indexOf(platform) !== -1) return 'mac';
    else if (iosPlatforms.indexOf(platform) !== -1) return 'ios';
    else if (windowsPlatforms.indexOf(platform) !== -1) return 'windows';
    else if (/Android/.test(userAgent)) return 'android';
    else if (/Linux/.test(platform))  return 'linux';
  
    return os as 'mac' | 'windows' | 'linux' | 'ios' | 'android';
  }

  