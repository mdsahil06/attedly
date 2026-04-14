import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Camera
} from 'lucide-react';

export default function AttendanceScanner() {
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; name?: string; time?: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false); // Default to false to avoid immediate prompt
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  const startScanner = async () => {
    setPermissionError(null);
    try {
      // Ensure any existing scanner is stopped
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        await qrCodeRef.current.stop();
      }

      const html5QrCode = new Html5Qrcode("reader");
      qrCodeRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error("Unable to start scanner", err);
      if (err?.toString().includes("NotAllowedError") || err?.toString().includes("Permission denied")) {
        setPermissionError("Camera permission was denied. Please allow camera access in your browser settings and click 'Retry'.");
      } else {
        setPermissionError("Could not access camera. Please ensure no other app is using it and try again.");
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    // We don't auto-start here to avoid immediate permission prompt on mount
    // which can be blocked by browsers if not triggered by user action.
    return () => {
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        qrCodeRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, []);

  async function onScanSuccess(decodedText: string) {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roll_no: decodedText })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setScanResult({ 
          success: true, 
          message: `Attendance marked for ${data.name}`, 
          name: data.name, 
          time: data.time 
        });
      } else {
        setScanResult({ 
          success: false, 
          message: data.error || 'Failed to mark attendance' 
        });
      }
    } catch (error) {
      setScanResult({ success: false, message: 'Server error occurred' });
    }

    // Reset after 3 seconds
    setTimeout(() => {
      setScanResult(null);
      isProcessingRef.current = false;
    }, 3000);
  }

  function onScanFailure(error: any) {
    // Ignore scan failures as they happen constantly when no QR is in view
  }

  const toggleScanner = async () => {
    if (isScanning) {
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        await qrCodeRef.current.stop();
      }
      setIsScanning(false);
    } else {
      await startScanner();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">QR Attendance Scanner</h1>
        <p className="text-gray-500 mt-1">Point the camera at a student's QR code to mark attendance</p>
      </div>

      <div className="relative">
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xl overflow-hidden min-h-[300px] flex items-center justify-center relative">
          <div id="reader" className="w-full rounded-2xl overflow-hidden border-0"></div>
          
          {!isScanning && !permissionError && (
            <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center p-8 text-center z-10">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Camera Ready</h3>
              <p className="text-gray-500 mt-2 max-w-xs">Click the button below to start the scanner and grant camera permissions.</p>
              <button 
                onClick={toggleScanner}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all transform active:scale-95"
              >
                Start Scanner
              </button>
            </div>
          )}

          {permissionError && (
            <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center p-8 text-center z-10">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-red-900">Permission Denied</h3>
              <p className="text-red-700 mt-2 max-w-xs">{permissionError}</p>
              <button 
                onClick={startScanner}
                className="mt-6 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-100 transition-all transform active:scale-95"
              >
                Retry Permission
              </button>
            </div>
          )}
        </div>

        {/* Scan Result Overlay */}
        <AnimatePresence>
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`absolute inset-x-4 bottom-4 p-6 rounded-2xl shadow-2xl flex items-center gap-4 border z-20 ${
                scanResult.success 
                  ? "bg-green-50 border-green-200 text-green-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                scanResult.success ? "bg-green-200" : "bg-red-200"
              }`}>
                {scanResult.success ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">{scanResult.success ? 'Success!' : 'Error'}</p>
                <p className="text-sm opacity-90">{scanResult.message}</p>
                {scanResult.time && (
                  <p className="text-xs mt-1 font-mono">Logged at: {scanResult.time}</p>
                )}
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 animate-spin opacity-50" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={toggleScanner}
          className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors"
        >
          {isScanning ? (
            <>Stop Camera</>
          ) : (
            <>Start Camera</>
          )}
        </button>
      </div>

      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <QrCode className="text-blue-600 w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-blue-900">How it works</h4>
          <ul className="text-sm text-blue-700 mt-1 space-y-1 list-disc list-inside">
            <li>Ensure the student's QR code is clearly visible</li>
            <li>Keep the camera steady and centered</li>
            <li>The system will automatically log the date and time</li>
            <li>Duplicate scans for the same day are automatically prevented</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

