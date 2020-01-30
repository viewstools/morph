import { promises as fs } from 'fs'

export default async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (error) {}
}
