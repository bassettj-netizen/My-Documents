import { createContext, useContext, type ReactNode } from 'react'
import type { AreaContent } from './content/types'
import { HR } from './content/hr'
import { LAW } from './content/law'
import { FINANCE } from './content/finance'
import { OD } from './content/od'
import { REAL_ESTATE } from './content/realEstate'

/**
 * Workspaces User Testing Nov '26: Workspaces 2.0 Version 21 as ten prototypes — five subject areas, each in English
 * and German. All ten are the same code; the area and language come from the URL (/projects/user-testing-nov-26/hr-en).
 *
 * Keeping English and German in step:
 * - Every on-screen string sits in a `defineText(en, de)` pair. `de` must have exactly the keys of `en`, so a string
 *   added to the English version doesn't build until its German counterpart is written.
 * - Everything that changes by subject area (documents, CoPilot content, workspace examples, product name) is in
 *   content/<area>.ts as `{ en, de }`, both typed `AreaContent`, so the two languages always have the same fields.
 */

export type Lang = 'en' | 'de'
export type Area = 'hr' | 'law' | 'finance' | 'od' | 'real-estate'

export const AREAS: Area[] = ['hr', 'law', 'finance', 'od', 'real-estate']
export const LANGS: Lang[] = ['en', 'de']
export const USER_TESTING_ROOT = '/projects/user-testing-nov-26'
export const prototypeBase = (area: Area, lang: Lang) => `${USER_TESTING_ROOT}/${area}-${lang}`

export const AREA_CONTENT: Record<Area, Record<Lang, AreaContent>> = {
  hr: HR,
  law: LAW,
  finance: FINANCE,
  od: OD,
  'real-estate': REAL_ESTATE,
}

/** Which prototype a path is in, if any. */
export function prototypeFromPath(pathname: string): { area: Area; lang: Lang; base: string } | null {
  for (const area of AREAS) for (const lang of LANGS) {
    const base = prototypeBase(area, lang)
    if (pathname === base || pathname.startsWith(`${base}/`)) return { area, lang, base }
  }
  return null
}

type Prototype = { area: Area; lang: Lang; base: string; content: AreaContent }

const PrototypeContext = createContext<Prototype | null>(null)

export function PrototypeProvider({ area, lang, children }: { area: Area; lang: Lang; children: ReactNode }) {
  return (
    <PrototypeContext.Provider value={{ area, lang, base: prototypeBase(area, lang), content: AREA_CONTENT[area][lang] }}>
      {children}
    </PrototypeContext.Provider>
  )
}

export function usePrototype(): Prototype {
  const value = useContext(PrototypeContext)
  if (!value) throw new Error('usePrototype must be used inside a PrototypeProvider')
  return value
}

/** This prototype's subject-area content, in its language. */
export const useArea = () => usePrototype().content

// ─── Paired English/German text ───────────────────────────────────────────────

/** The German side of a text pair: the same keys, strings for strings and functions with the same arguments for functions. */
export type Translation<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => R
    : T[K] extends string
      ? string
      : T[K] extends readonly (infer U)[]
        ? readonly Translation<U>[]
        : T[K] extends object
          ? Translation<T[K]>
          : T[K]
}

export type TextPair<T> = { en: T; de: Translation<T> }

/** A component's on-screen strings in English and German. TypeScript rejects a `de` that's missing a key from `en`. */
export function defineText<T extends Record<string, unknown>>(en: T, de: Translation<T>): TextPair<T> {
  return { en, de }
}

/** Picks a text pair's strings for this prototype's language. */
export function useText<T>(pair: TextPair<T>): T {
  return pair[usePrototype().lang] as T
}
