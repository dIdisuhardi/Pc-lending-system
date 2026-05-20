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