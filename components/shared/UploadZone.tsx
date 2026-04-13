'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { formatFileSize } from '@/utils/format'

interface UploadedFile {
  id: string
  file: File
  preview: string
}

interface UploadZoneProps {
  maxFiles?: number
  maxSize?: number // in bytes
  onFilesChange?: (files: File[]) => void
  className?: string
}

export function UploadZone({
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  onFilesChange,
  className,
}: UploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: unknown[]) => {
    setError(null)

    if (rejectedFiles.length > 0) {
      setError('Some files were rejected. Check size and format.')
      return
    }

    if (files.length + acceptedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`)
      return
    }

    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }))

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles.map((f) => f.file))
  }, [files, maxFiles, onFilesChange])

  const removeFile = (id: string) => {
    const updatedFiles = files.filter((f) => f.id !== id)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles.map((f) => f.file))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxSize,
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles,
  })

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer',
          'flex flex-col items-center justify-center text-center',
          isDragActive
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50',
          files.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        
        <div className={cn(
          'p-3 rounded-full mb-4 transition-colors',
          isDragActive ? 'bg-violet-500/20' : 'bg-zinc-800'
        )}>
          <Upload className={cn(
            'h-6 w-6',
            isDragActive ? 'text-violet-400' : 'text-zinc-400'
          )} />
        </div>

        <p className="text-white font-medium mb-1">
          {isDragActive ? 'Drop your images here' : 'Drag & drop images'}
        </p>
        <p className="text-sm text-zinc-400 mb-3">
          or click to browse
        </p>
        <p className="text-xs text-zinc-500">
          PNG, JPG, WebP up to {formatFileSize(maxSize)} • Max {maxFiles} images
        </p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <AnimatePresence>
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800"
              >
                <Image
                  src={file.preview}
                  alt={file.file.name}
                  fill
                  className="object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(file.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* File name */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs text-white truncate">
                    {file.file.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Counter */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-zinc-400">
          <ImageIcon className="h-4 w-4" />
          <span>{files.length} / {maxFiles} images</span>
        </div>
        {files.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFiles([])
              onFilesChange?.([])
            }}
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  )
}
