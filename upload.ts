import formidable from 'formidable'
import { mkdirSync } from 'fs'

export let uploadDir = 'uploads'

mkdirSync(uploadDir, { recursive: true })

export let form = formidable({
  uploadDir,
  allowEmptyFiles: false,
  maxFiles: 2,
  maxFileSize: 200 * 1024 ** 2,
  keepExtensions: true,
  multiples:true,
  filter: part => part.mimetype?.startsWith('image/') || false,
})

export function extractFile(
  file: formidable.File[] | formidable.File,
): formidable.File |  formidable.File[] | undefined {
  return Array.isArray(file) ? (file as formidable.File[]): file
}


