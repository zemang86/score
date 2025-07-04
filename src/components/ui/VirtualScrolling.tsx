import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'

interface VirtualScrollingProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number // Number of items to render outside visible area
  className?: string
  onScroll?: (scrollTop: number) => void
  getItemKey?: (item: T, index: number) => string | number
}

export function VirtualScrolling<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  getItemKey
}: VirtualScrollingProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate which items should be visible
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
  }, [items, visibleRange.startIndex, visibleRange.endIndex])

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight

  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    onScroll?.(newScrollTop)
  }, [onScroll])

  // Expose scroll methods
  const scrollTo = useCallback((index: number) => {
    if (containerRef.current) {
      const scrollTop = index * itemHeight
      containerRef.current.scrollTop = scrollTop
      setScrollTop(scrollTop)
    }
  }, [itemHeight])

  const scrollToTop = useCallback(() => {
    scrollTo(0)
  }, [scrollTo])

  // Note: For external scroll control, pass methods through props or context if needed

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Total container to maintain scroll height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index
            const key = getItemKey ? getItemKey(item, actualIndex) : actualIndex
            
            return (
              <div
                key={key}
                style={{
                  height: itemHeight,
                  overflow: 'hidden'
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Grid version for responsive layouts
interface VirtualGridProps<T> {
  items: T[]
  itemHeight: number
  itemsPerRow: number
  containerHeight: number
  gap?: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
  onScroll?: (scrollTop: number) => void
  getItemKey?: (item: T, index: number) => string | number
}

export function VirtualGrid<T>({
  items,
  itemHeight,
  itemsPerRow,
  containerHeight,
  gap = 0,
  renderItem,
  overscan = 2,
  className = '',
  onScroll,
  getItemKey
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate rows and visible range
  const totalRows = Math.ceil(items.length / itemsPerRow)
  const rowHeight = itemHeight + gap

  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    )
    return { startRow, endRow }
  }, [scrollTop, rowHeight, containerHeight, totalRows, overscan])

  // Get visible items grouped by rows
  const visibleRows = useMemo(() => {
    const rows: T[][] = []
    for (let row = visibleRange.startRow; row <= visibleRange.endRow; row++) {
      const startIndex = row * itemsPerRow
      const endIndex = Math.min(startIndex + itemsPerRow, items.length)
      const rowItems = items.slice(startIndex, endIndex)
      if (rowItems.length > 0) {
        rows.push(rowItems)
      }
    }
    return rows
  }, [items, visibleRange.startRow, visibleRange.endRow, itemsPerRow])

  const totalHeight = totalRows * rowHeight
  const offsetY = visibleRange.startRow * rowHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    onScroll?.(newScrollTop)
  }, [onScroll])

  const scrollToRow = useCallback((rowIndex: number) => {
    if (containerRef.current) {
      const scrollTop = rowIndex * rowHeight
      containerRef.current.scrollTop = scrollTop
      setScrollTop(scrollTop)
    }
  }, [rowHeight])

  const scrollToItem = useCallback((itemIndex: number) => {
    const rowIndex = Math.floor(itemIndex / itemsPerRow)
    scrollToRow(rowIndex)
  }, [itemsPerRow, scrollToRow])

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleRows.map((rowItems, rowIndex) => {
            const actualRowIndex = visibleRange.startRow + rowIndex
            
            return (
              <div
                key={actualRowIndex}
                style={{
                  height: itemHeight,
                  marginBottom: gap,
                  display: 'flex',
                  gap: gap
                }}
              >
                {rowItems.map((item, itemIndex) => {
                  const actualIndex = actualRowIndex * itemsPerRow + itemIndex
                  const key = getItemKey ? getItemKey(item, actualIndex) : actualIndex
                  
                  return (
                    <div
                      key={key}
                      style={{
                        flex: `0 0 calc((100% - ${gap * (itemsPerRow - 1)}px) / ${itemsPerRow})`,
                        height: itemHeight,
                        overflow: 'hidden'
                      }}
                    >
                      {renderItem(item, actualIndex)}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Table version for tabular data
interface VirtualTableProps<T> {
  items: T[]
  rowHeight: number
  containerHeight: number
  columns: Array<{
    key: string
    width: string | number
    render: (item: T, index: number) => React.ReactNode
  }>
  overscan?: number
  className?: string
  onScroll?: (scrollTop: number) => void
  getItemKey?: (item: T, index: number) => string | number
  headerComponent?: React.ReactNode
}

export function VirtualTable<T>({
  items,
  rowHeight,
  containerHeight,
  columns,
  overscan = 5,
  className = '',
  onScroll,
  getItemKey,
  headerComponent
}: VirtualTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const headerHeight = headerComponent ? 40 : 0 // Assume 40px header height
  const scrollableHeight = containerHeight - headerHeight

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + scrollableHeight) / rowHeight) + overscan
    )
    return { startIndex, endIndex }
  }, [scrollTop, rowHeight, scrollableHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
  }, [items, visibleRange.startIndex, visibleRange.endIndex])

  const totalHeight = items.length * rowHeight
  const offsetY = visibleRange.startIndex * rowHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    onScroll?.(newScrollTop)
  }, [onScroll])

  return (
    <div className={`${className}`} style={{ height: containerHeight }}>
      {/* Header */}
      {headerComponent && (
        <div style={{ height: headerHeight, position: 'sticky', top: 0, zIndex: 1 }}>
          {headerComponent}
        </div>
      )}
      
      {/* Scrollable content */}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: scrollableHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            {visibleItems.map((item, index) => {
              const actualIndex = visibleRange.startIndex + index
              const key = getItemKey ? getItemKey(item, actualIndex) : actualIndex
              
              return (
                <div
                  key={key}
                  style={{
                    height: rowHeight,
                    display: 'flex',
                    borderBottom: '1px solid #e5e7eb'
                  }}
                >
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      style={{
                        width: column.width,
                        flexShrink: 0,
                        padding: '8px 12px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {column.render(item, actualIndex)}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for dynamic item height (more complex scenarios)
export function useVirtualScrolling<T>(
  items: T[],
  containerHeight: number,
  getItemHeight: (item: T, index: number) => number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0)
  
  // Calculate cumulative heights for dynamic sizing
  const itemPositions = useMemo(() => {
    const positions: number[] = []
    let currentPosition = 0
    
    items.forEach((item, index) => {
      positions[index] = currentPosition
      currentPosition += getItemHeight(item, index)
    })
    
    return positions
  }, [items, getItemHeight])

  const totalHeight = itemPositions.length > 0 
    ? itemPositions[itemPositions.length - 1] + getItemHeight(items[items.length - 1], items.length - 1)
    : 0

  // Binary search to find visible range
  const visibleRange = useMemo(() => {
    if (itemPositions.length === 0) return { startIndex: 0, endIndex: 0 }

    // Find start index
    let startIndex = 0
    for (let i = 0; i < itemPositions.length; i++) {
      if (itemPositions[i] >= scrollTop) {
        startIndex = Math.max(0, i - overscan)
        break
      }
    }

    // Find end index
    let endIndex = itemPositions.length - 1
    const scrollBottom = scrollTop + containerHeight
    for (let i = startIndex; i < itemPositions.length; i++) {
      if (itemPositions[i] > scrollBottom) {
        endIndex = Math.min(itemPositions.length - 1, i + overscan)
        break
      }
    }

    return { startIndex, endIndex }
  }, [scrollTop, containerHeight, itemPositions, overscan])

  return {
    visibleRange,
    totalHeight,
    itemPositions,
    setScrollTop
  }
}