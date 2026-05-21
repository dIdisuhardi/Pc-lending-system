import { useEffect, useRef, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { gasApi } from "../api/gas"
import TopBar from "../components/common/TopBar"
import ErrorDialog from "../components/common/ErrorDialog"
 
export default function QrScanPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
 
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const scanningRef = useRef(false)
 
  const [error, setError] = useState<string>("")
  const [scanning, setScanning] = useState(false)
 
  const stopCamera = useCallback(() => {
    scanningRef.current = false
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setScanning(false)
  }, [])
 
  useEffect(() => {
    if (!isAuthenticated) return
 
    let cancelled = false
 
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        startScanLoop()
      } catch {
        setError("カメラへのアクセスを許可してください。")
      }
    }
 
    const startScanLoop = () => {
      scanningRef.current = true
      setScanning(true)
 
      const detectedRef = { current: false }
 
      const scan = async () => {
        if (cancelled || !scanningRef.current || detectedRef.current) return
        if (!videoRef.current || !canvasRef.current) {
          rafRef.current = requestAnimationFrame(scan)
          return
        }
        const video = videoRef.current
        const canvas = canvasRef.current
        if (video.readyState < video.HAVE_ENOUGH_DATA) {
          rafRef.current = requestAnimationFrame(scan)
          return
        }
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          rafRef.current = requestAnimationFrame(scan)
          return
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        try {
          const { default: decodeQR } = await import("qr/decode.js")
          const result = decodeQR({
            height: imageData.height,
            width: imageData.width,
            data: imageData.data,
          })
          if (result) {
            detectedRef.current = true  // 重複検出・重複APIコールを防ぐ
            stopCamera()
            const pc = await gasApi.getPcByNo(result)
            if (!pc) {
              setError(`QRコードの番号「${result}」に該当するPCが見つかりません。`)
              detectedRef.current = false
              startCamera()
              return
            }
            navigate(`/pc/${result}`, { state: { pc } })
            return
          }
        } catch {
          // QR未検出は無視してループ継続
        }
        rafRef.current = requestAnimationFrame(scan)
      }
 
      rafRef.current = requestAnimationFrame(scan)
    }
 
    startCamera()
 
    return () => {
      cancelled = true
      stopCamera()
    }
  }, [isAuthenticated, stopCamera, navigate])
 
  return (
    <div style={styles.page}>
      <TopBar title="QRスキャン" showPcList />
 
      <div style={styles.body}>
        <div style={styles.card}>
          {!isAuthenticated ? (
            // ── 未ログイン状態 ──────────────────────────────
            <div style={styles.lockedState}>
              <div style={styles.iconWrap}>
                {/* スキャンフレーム＋鍵アイコン */}
                <div style={styles.scanFrameStatic}>
                  <span style={styles.cornerTL} />
                  <span style={styles.cornerTR} />
                  <span style={styles.cornerBL} />
                  <span style={styles.cornerBR} />
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>
              <p style={styles.lockedText}>ログイン後にカメラが起動します</p>
            </div>
          ) : (
            // ── ログイン済み・スキャン中 ────────────────────
            <div style={styles.cameraState}>
              <div style={styles.cameraWrap}>
                <video ref={videoRef} style={styles.video} muted playsInline />
                <canvas ref={canvasRef} style={styles.hiddenCanvas} />
                {/* スキャンフレームオーバーレイ */}
                {scanning && (
                  <div style={styles.overlayWrap}>
                    <div style={styles.scanFrameLive}>
                      <span style={styles.cornerTL} />
                      <span style={styles.cornerTR} />
                      <span style={styles.cornerBL} />
                      <span style={styles.cornerBR} />
                      {/* 中央十字 */}
                      <div style={styles.crossH} />
                      <div style={styles.crossV} />
                    </div>
                    <p style={styles.scanHint}>カメラ起動中 — QRコードをかざしてください</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
 
        {/* 右側テキスト */}
        <div style={styles.sideText}>
          <p style={styles.sideTitle}>スキャン方法</p>
          <p style={styles.sideBody}>
            PCに貼付されたQRシールをカメラに向けてください。自動で読み取り、PC情報画面へ遷移します。
          </p>
        </div>
      </div>
 
      {error && <ErrorDialog message={error} onClose={() => setError("")} />}
    </div>
  )
}

const CORNER_SIZE = 20;
const CORNER_THICK = 3;
const CORNER_COLOR = "#333";
const cornerBase: React.CSSProperties = {
  position: "absolute",
  width: CORNER_SIZE,
  height: CORNER_SIZE,
  borderColor: CORNER_COLOR,
  borderStyle: "solid",
};

const styles: Record<string, React.CSSProperties> = {
  body: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    padding: "40px 24px",
    flexWrap: "wrap",
  },
  card: {
    width: "75%",
    height: "512px",
    background: "#FFE4B5",
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
  },
  lockedState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrameStatic: {
    position: "relative",
    width: 100,
    height: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  lockedText: {
    fontSize: 14,
    fontWeight: 500,
    color: "#333",
    margin: 0,
    textAlign: "center",
  },
  cameraState: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  cameraWrap: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  hiddenCanvas: {
    display: "none",
  },
  overlayWrap: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    background: "transparent",
  },
  scanFrameLive: {
    position: "relative",
    width: 120,
    height: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  crossH: {
    position: "absolute",
    width: 28,
    height: CORNER_THICK,
    background: CORNER_COLOR,
    borderRadius: 2,
  },
  crossV: {
    position: "absolute",
    width: CORNER_THICK,
    height: 28,
    background: CORNER_COLOR,
    borderRadius: 2,
  },
  scanHint: {
    fontSize: 12,
    color: "#333",
    margin: 0,
    textAlign: "center",
  },
  cornerTL: {
    ...cornerBase,
    top: 0,
    left: 0,
    borderWidth: `${CORNER_THICK}px 0 0 ${CORNER_THICK}px`,
  },
  cornerTR: {
    ...cornerBase,
    top: 0,
    right: 0,
    borderWidth: `${CORNER_THICK}px ${CORNER_THICK}px 0 0`,
  },
  cornerBL: {
    ...cornerBase,
    bottom: 0,
    left: 0,
    borderWidth: `0 0 ${CORNER_THICK}px ${CORNER_THICK}px`,
  },
  cornerBR: {
    ...cornerBase,
    bottom: 0,
    right: 0,
    borderWidth: `0 ${CORNER_THICK}px ${CORNER_THICK}px 0`,
  },
  sideText: {
    width: "20%",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  sideTitle: {
    fontSize: 16,
    fontWeight: 600,
    margin: 0,
    color: "#222",
  },
  sideBody: {
    fontSize: 13,
    color: "#555",
    lineHeight: 1.7,
    margin: 0,
  },
};
