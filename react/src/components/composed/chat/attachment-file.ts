"use client"

import { useEffect, useState } from "react"

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  ogg: "audio/ogg",
  pdf: "application/pdf",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  json: "application/json",
  xml: "text/xml",
}

export function attachmentMimeType(file: File): string {
  return file.type && file.type !== "application/octet-stream"
    ? file.type
    : (MIME_BY_EXTENSION[file.name.split(".").pop()?.toLowerCase() ?? ""] ??
        file.type)
}

export function attachmentFileKind(
  file: File
):
  { kind: "image" } | { kind: "media"; audio: boolean } | { kind: "document" } {
  const mime = attachmentMimeType(file)
  if (mime.startsWith("image/")) return { kind: "image" }
  if (mime.startsWith("video/") || mime.startsWith("audio/"))
    return { kind: "media", audio: mime.startsWith("audio/") }
  return { kind: "document" }
}

interface FilePreview {
  file: File
  url?: string
  text?: string
}

/** Each mounted attachment owns its URL, so clearing the tray cannot break a sent preview. */
export function useAttachmentFile(file?: File) {
  const [preview, setPreview] = useState<FilePreview>()
  useEffect(() => {
    if (!file) return
    let active = true
    let url: string | undefined
    // Create browser resources after mounting; cancelled renders never allocate a URL.
    void Promise.resolve().then(async () => {
      if (!active) return
      try {
        const mime = attachmentMimeType(file)
        const blob =
          mime && file.type !== mime ? file.slice(0, file.size, mime) : file
        url = URL.createObjectURL(blob)
        const text =
          mime.startsWith("text/") || mime === "application/json"
            ? await file.slice(0, 8192).text()
            : undefined
        if (active) setPreview({ file, url, text })
      } catch {
        if (active) setPreview({ file, url })
      }
    })
    return () => {
      active = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [file])
  return preview?.file === file ? preview : undefined
}
