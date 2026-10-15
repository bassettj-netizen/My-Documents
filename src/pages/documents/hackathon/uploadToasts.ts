import { createElement, useCallback } from 'react'
import { Spinner, toastPlacements, Typography, useNotifications } from '@goat-ui/goat-ui-core'

/**
 * Hackathon Oct '26 (V4/V5) — the file processing toasts from Bulk Edit Version 3: a bottom-right
 * "Uploading…" toast with a spinner, which turns into "Extracting metadata…" after a second, then
 * closes after another second and is followed by an "Upload successful" toast bottom left.
 * The files are only added (`commit`) at that point, so they appear together with the success toast.
 */

const TEXT = {
  en: { uploading: 'Uploading...', extracting: 'Extracting metadata...', done: 'Upload successful', one: '1 document', many: (n: number) => `${n} documents` },
  de: { uploading: 'Wird hochgeladen …', extracting: 'Metadaten werden extrahiert …', done: 'Upload erfolgreich', one: '1 Dokument', many: (n: number) => `${n} Dokumente` },
}

let runCounter = 0

export function useProcessingUpload(lang: 'en' | 'de' = 'en') {
  const { notification } = useNotifications()

  return useCallback((fileNames: string[], commit: () => void) => {
    if (fileNames.length === 0) return
    const t = TEXT[lang]
    // A key per run, so two uploads in quick succession each keep their own toast.
    runCounter += 1
    const key = `hackathon-upload-${runCounter}`
    const label = fileNames.length === 1 ? fileNames[0] : t.many(fileNames.length)
    const content = (text: string) => createElement(
      'div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
      createElement(Spinner, { size: 'small' }),
      createElement(Typography, null, text),
    )
    const step = (title: string) => notification.default({
      key, title, placement: toastPlacements.BOTTOM_RIGHT, duration: 0, leadingIcon: false, content: content(label),
    })

    step(t.uploading)
    setTimeout(() => step(t.extracting), 1000)
    setTimeout(() => {
      notification.destroy(key)
      commit()
      notification.success({
        title: t.done,
        placement: toastPlacements.BOTTOM_LEFT,
        duration: 5,
        content: createElement(Typography, null, fileNames.length === 1 ? t.one : t.many(fileNames.length)),
      })
    }, 2000)
  }, [notification, lang])
}
