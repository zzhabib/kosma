import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { type TextBlock } from '../../types'

export function TextBlockView({ block }: { block: TextBlock }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-white/95">{children}</strong>,
        em: ({ children }) => <em className="italic text-white/80">{children}</em>,
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-')
          return isBlock ? (
            <code className="block bg-black/30 rounded px-3 py-2 text-xs font-mono text-white/70 overflow-x-auto whitespace-pre">
              {children}
            </code>
          ) : (
            <code className="bg-black/30 rounded px-1 py-0.5 text-xs font-mono text-white/70">{children}</code>
          )
        },
        pre: ({ children }) => <pre className="my-1">{children}</pre>,
        ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 my-1">{children}</ol>,
        li: ({ children }) => <li className="text-white/85">{children}</li>,
        h1: ({ children }) => <h1 className="font-semibold text-base text-white/95 mb-1">{children}</h1>,
        h2: ({ children }) => <h2 className="font-semibold text-sm text-white/90 mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="font-medium text-sm text-white/85 mb-1">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-white/20 pl-3 text-white/60 italic my-1">{children}</blockquote>
        ),
        hr: () => <hr className="border-white/10 my-2" />,
        a: ({ children, href }) => (
          <a href={href} className="text-blue-300/80 underline underline-offset-2 hover:text-blue-200">{children}</a>
        ),
      }}
    >
      {block.text}
    </ReactMarkdown>
  )
}
