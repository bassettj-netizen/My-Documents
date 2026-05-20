import { chatRoles, commentTypes, type ChatValue } from '@goat-ui/goat-ui-core'

export const QUICK_PROMPTS = [
  { label: 'Summarise Document',   prompt: 'Please summarise this document.' },
  { label: 'Find Citations',       prompt: 'Identify all citations and legal references.' },
  { label: 'Extract Key Figures',  prompt: 'What are the key financial figures?' },
  { label: 'Identify Obligations', prompt: 'What legal or contractual obligations are described?' },
  { label: 'Draft Client Summary', prompt: 'Draft a brief client-facing summary.' },
]

export function makeChatValue(content: string, role: 'sender' | 'receiver'): ChatValue {
  return {
    user: {
      avatar: { srcPlaceholder: role === 'receiver' ? 'AI' : 'AM' },
      name: role === 'receiver' ? 'CoPilot' : 'You',
      role: role === 'receiver' ? chatRoles.RECEIVER : chatRoles.SENDER,
    },
    value: { type: commentTypes.TEXT, content },
    sentAt: 'Just now',
  }
}

export function getMockAiResponse(prompt: string, docName: string, summary: string): string {
  const name = docName.replace(/_/g, ' ')
  const p = prompt.toLowerCase()

  if (p.includes('summar')) {
    return `Here is a summary of **${name}**:\n\n${summary}\n\nThe document is in compliance with applicable German regulatory requirements for the relevant assessment period.`
  }
  if (p.includes('citation') || p.includes('reference')) {
    return `**Identified References in ${name}:**\n\n1. Körperschaftsteuergesetz (KStG) § 8 Abs. 1\n2. Abgabenordnung (AO) § 233a — Interest on tax arrears\n3. Umsatzsteuergesetz (UStG) § 15 — Input tax deduction\n4. Bundessteuerblatt II 2024, Seite 412\n5. BFH-Urteil vom 15.03.2023, Az. I R 12/21\n\n5 references identified in total.`
  }
  if (p.includes('figure') || p.includes('financial')) {
    return `**Key Financial Figures:**\n\n${summary}\n\nAdditional calculated metrics:\n• Effective tax rate: ~15–16%\n• Payment deadline: 30 days from assessment date\n• Penalty exposure if overdue: 1% per month (§ 240 AO)`
  }
  if (p.includes('obligation')) {
    return `**Legal & Contractual Obligations:**\n\n1. Submission deadline: 31 July following the assessment year\n2. Document retention: 10 years (§ 147 AO)\n3. Electronic filing required per E-Bilanz Regulation (§ 5b EStG)\n4. Notarisation required for associated real-asset transfers\n5. Reporting obligation to Federal Statistics Office if turnover > €5M`
  }
  if (p.includes('draft') || p.includes('client')) {
    return `**Draft Client Summary:**\n\nDear Client,\n\nWe have reviewed the **${name}** for the relevant period. The document confirms your current regulatory position and outlines outstanding obligations.\n\nWe recommend reviewing Sections 3 and 5 in detail prior to the upcoming submission deadline. Please do not hesitate to contact us should you require clarification.\n\nKind regards,\nYour Advisory Team`
  }

  return `I have analysed **${name}**.\n\n${summary}\n\nIs there a specific aspect of this document you would like me to explore further?`
}

export const COPILOT_GREETING = (docName: string) =>
  `Hello! I'm CoPilot, your AI assistant for this document.\n\nI've loaded **${docName.replace(/_/g, ' ')}** and I'm ready to help. You can ask me to summarise, extract figures, find citations, or draft a client summary — or just ask me anything about the document.`
