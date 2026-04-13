export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const isLast = i === retries - 1
      if (isLast) throw error
      console.log(`Replicate retry ${i + 1}/${retries}...`)
      await new Promise(r => setTimeout(r, delay * (i + 1)))
    }
  }
  throw new Error('Max retries reached')
}