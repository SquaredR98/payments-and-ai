'use client'

import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  useForm,
  useFormModified,
  useFormProcessing,
  useDocumentInfo,
  useOperation,
  useHotkey,
  useEditDepth,
} from '@payloadcms/ui'
import './styles.css'

export function SidebarSave() {
  const { submit } = useForm()
  const modified = useFormModified()
  const processing = useFormProcessing()
  const { uploadStatus } = useDocumentInfo()
  const operation = useOperation()
  const editDepth = useEditDepth()
  const ref = useRef<HTMLButtonElement>(null)
  const [container, setContainer] = useState<Element | null>(null)

  useEffect(() => {
    const sidebarWrap = document.querySelector('.document-fields__sidebar-wrap')
    if (!sidebarWrap) return

    setContainer(sidebarWrap)

    // Hide doc-controls when sidebar save is active
    const form = document.querySelector('.collection-edit__form')
    if (form) form.classList.add('sidebar-save-active')

    return () => {
      if (form) form.classList.remove('sidebar-save-active')
    }
  }, [])

  const disabled =
    processing ||
    (operation === 'update' && !modified) ||
    uploadStatus === 'uploading'

  // Replicate Ctrl+S / Cmd+S hotkey from original SaveButton
  useHotkey({ cmdCtrlKey: true, editDepth, keyCodes: ['s'] }, (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && ref.current) ref.current.click()
  })

  const handleClick = () => {
    if (uploadStatus === 'uploading') return
    return void submit()
  }

  // No sidebar → render nothing → doc-controls stays visible (class not added)
  if (!container) return null

  return createPortal(
    <div className="sidebar-save">
      <button
        ref={ref}
        type="button"
        className={`sidebar-save__btn${disabled ? ' sidebar-save__btn--disabled' : ''}${processing ? ' sidebar-save__btn--processing' : ''}`}
        disabled={disabled}
        onClick={handleClick}
        id="action-save"
      >
        {processing ? 'Saving...' : 'Save'}
      </button>
    </div>,
    container,
  )
}
