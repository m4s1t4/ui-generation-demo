'use client'

import ReactMarkdown from 'react-markdown'
import { memo } from 'react'

export const MemoizedReactMarkdown = memo(
  ReactMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
)
