// 書き込み系処理の排他制御ラッパー
// 全ての書き込みハンドラー（updatePc・registerPc）で使用する
// タイムアウト: 10秒。取得できない場合はエラーをスロー
function withLock<T>(fn: () => T): T {
  const lock = LockService.getScriptLock()
  try {
    lock.waitLock(10000)
    return fn()
  } catch (e) {
    throw new Error("他のユーザーが更新中です。再試行してください")
  } finally {
    lock.releaseLock()
  }
}