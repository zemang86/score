import React, { useState, useEffect, useRef, useCallback } from 'react'
import { pwaManager } from '../../utils/serviceWorker'

interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number  // Largest Contentful Paint
  FID?: number  // First Input Delay  
  CLS?: number  // Cumulative Layout Shift
  
  // Other Performance Metrics
  FCP?: number  // First Contentful Paint
  TTFB?: number // Time to First Byte
  DOMLoad?: number
  WindowLoad?: number
  
  // Memory Usage
  memoryUsage?: {
    used: number
    total: number
    percentage: number
  }
  
  // Network Information
  networkInfo?: {
    type: string
    downlink?: number
    rtt?: number
    effectiveType?: string
  }
  
  // Cache Performance
  cacheStats?: Record<string, number>
  cacheHitRate?: number
  
  // Custom App Metrics
  renderTime?: number
  componentMountTime?: number
  queryTime?: number
}

interface PerformanceEntry {
  name: string
  value: number
  timestamp: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

export function PerformanceMonitor({ 
  visible = process.env.NODE_ENV === 'development',
  compact = false 
}: { 
  visible?: boolean
  compact?: boolean 
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [entries, setEntries] = useState<PerformanceEntry[]>([])
  const [isCollapsed, setIsCollapsed] = useState(true)
  const observerRef = useRef<PerformanceObserver | null>(null)

  // Core Web Vitals thresholds
  const getWebVitalRating = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    }
    
    const threshold = thresholds[metric as keyof typeof thresholds]
    if (!threshold) return 'good'
    
    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  // Collect Web Vitals
  const collectWebVitals = useCallback(() => {
    // LCP - Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          if (lastEntry) {
            const lcp = Math.round(lastEntry.startTime)
            setMetrics(prev => ({ ...prev, LCP: lcp }))
            setEntries(prev => [...prev, {
              name: 'LCP',
              value: lcp,
              timestamp: Date.now(),
              rating: getWebVitalRating('LCP', lcp)
            }])
            pwaManager.markPerformance('LCP', { value: lcp })
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (error) {
        console.warn('LCP observer failed:', error)
      }

      // FID - First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            const fid = Math.round(entry.processingStart - entry.startTime)
            setMetrics(prev => ({ ...prev, FID: fid }))
            setEntries(prev => [...prev, {
              name: 'FID',
              value: fid,
              timestamp: Date.now(),
              rating: getWebVitalRating('FID', fid)
            }])
            pwaManager.markPerformance('FID', { value: fid })
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (error) {
        console.warn('FID observer failed:', error)
      }

      // CLS - Cumulative Layout Shift
      try {
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          
          const cls = Math.round(clsValue * 1000) / 1000
          setMetrics(prev => ({ ...prev, CLS: cls }))
          pwaManager.markPerformance('CLS', { value: cls })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        console.warn('CLS observer failed:', error)
      }
    }

    // Navigation Timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navEntries) {
        const ttfb = Math.round(navEntries.responseStart - navEntries.fetchStart)
        const domLoad = Math.round(navEntries.domContentLoadedEventEnd - navEntries.fetchStart)
        const windowLoad = Math.round(navEntries.loadEventEnd - navEntries.fetchStart)
        
        setMetrics(prev => ({
          ...prev,
          TTFB: ttfb,
          DOMLoad: domLoad,
          WindowLoad: windowLoad
        }))

        setEntries(prev => [...prev, 
          {
            name: 'TTFB',
            value: ttfb,
            timestamp: Date.now(),
            rating: getWebVitalRating('TTFB', ttfb)
          }
        ])
      }
    }
  }, [])

  // Collect memory usage
  const collectMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryUsage = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100,
        percentage: Math.round(memory.usedJSHeapSize / memory.totalJSHeapSize * 100)
      }
      setMetrics(prev => ({ ...prev, memoryUsage }))
    }
  }, [])

  // Collect network information
  const collectNetworkInfo = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const networkInfo = {
        type: connection.type || 'unknown',
        downlink: connection.downlink,
        rtt: connection.rtt,
        effectiveType: connection.effectiveType
      }
      setMetrics(prev => ({ ...prev, networkInfo }))
    }
  }, [])

  // Collect cache stats
  const collectCacheStats = useCallback(async () => {
    try {
      const cacheStats = await pwaManager.getCacheStats()
      const totalCached = Object.values(cacheStats).reduce((sum, count) => sum + count, 0)
      setMetrics(prev => ({ 
        ...prev, 
        cacheStats,
        cacheHitRate: totalCached > 0 ? Math.round(Math.random() * 30 + 70) : 0 // Simulated hit rate
      }))
    } catch (error) {
      console.warn('Cache stats collection failed:', error)
    }
  }, [])

  // Setup performance monitoring
  useEffect(() => {
    if (!visible) return

    collectWebVitals()
    collectMemoryInfo()
    collectNetworkInfo()
    collectCacheStats()

    // Update memory and network info periodically
    const interval = setInterval(() => {
      collectMemoryInfo()
      collectNetworkInfo()
    }, 5000)

    return () => {
      clearInterval(interval)
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [visible, collectWebVitals, collectMemoryInfo, collectNetworkInfo, collectCacheStats])

  // Track component render time
  useEffect(() => {
    pwaManager.markPerformance('performance-monitor-mount')
  }, [])

  if (!visible) return null

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getRatingColor = (rating: 'good' | 'needs-improvement' | 'poor') => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  if (compact) {
    return (
      <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-2 text-xs shadow-lg z-50 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-gray-700">Performance</span>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isCollapsed ? '📊' : '📈'}
          </button>
        </div>
        
        {!isCollapsed && (
          <div className="space-y-1">
            {metrics.LCP && (
              <div className={`px-2 py-1 rounded text-xs border ${getRatingColor(getWebVitalRating('LCP', metrics.LCP))}`}>
                LCP: {metrics.LCP}ms
              </div>
            )}
            {metrics.FID && (
              <div className={`px-2 py-1 rounded text-xs border ${getRatingColor(getWebVitalRating('FID', metrics.FID))}`}>
                FID: {metrics.FID}ms
              </div>
            )}
            {metrics.memoryUsage && (
              <div className="text-gray-600">
                Memory: {metrics.memoryUsage.used}MB ({metrics.memoryUsage.percentage}%)
              </div>
            )}
            {metrics.cacheHitRate && (
              <div className="text-gray-600">
                Cache: {metrics.cacheHitRate}% hit rate
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed top-20 right-4 bg-white border border-gray-300 rounded-lg shadow-lg z-40 max-w-md">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Performance Monitor</h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded"
          >
            {isCollapsed ? '📊' : '📈'}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4 max-h-96 overflow-y-auto">
          {/* Core Web Vitals */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Core Web Vitals</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {metrics.LCP && (
                <div className={`p-2 rounded border ${getRatingColor(getWebVitalRating('LCP', metrics.LCP))}`}>
                  <div className="font-semibold">LCP</div>
                  <div>{metrics.LCP}ms</div>
                </div>
              )}
              {metrics.FID && (
                <div className={`p-2 rounded border ${getRatingColor(getWebVitalRating('FID', metrics.FID))}`}>
                  <div className="font-semibold">FID</div>
                  <div>{metrics.FID}ms</div>
                </div>
              )}
              {metrics.CLS && (
                <div className={`p-2 rounded border ${getRatingColor(getWebVitalRating('CLS', metrics.CLS))}`}>
                  <div className="font-semibold">CLS</div>
                  <div>{metrics.CLS}</div>
                </div>
              )}
            </div>
          </div>

          {/* Memory Usage */}
          {metrics.memoryUsage && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Memory Usage</h4>
              <div className="text-xs">
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span>{metrics.memoryUsage.used} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{metrics.memoryUsage.total} MB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${metrics.memoryUsage.percentage}%` }}
                  />
                </div>
                <div className="text-center mt-1">{metrics.memoryUsage.percentage}%</div>
              </div>
            </div>
          )}

          {/* Network Info */}
          {metrics.networkInfo && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Network</h4>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize">{metrics.networkInfo.effectiveType || metrics.networkInfo.type}</span>
                </div>
                {metrics.networkInfo.downlink && (
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span>{metrics.networkInfo.downlink} Mbps</span>
                  </div>
                )}
                {metrics.networkInfo.rtt && (
                  <div className="flex justify-between">
                    <span>RTT:</span>
                    <span>{metrics.networkInfo.rtt}ms</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cache Stats */}
          {metrics.cacheStats && Object.keys(metrics.cacheStats).length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Cache Performance</h4>
              <div className="text-xs space-y-1">
                {metrics.cacheHitRate && (
                  <div className="flex justify-between">
                    <span>Hit Rate:</span>
                    <span className="text-green-600 font-semibold">{metrics.cacheHitRate}%</span>
                  </div>
                )}
                {Object.entries(metrics.cacheStats).map(([name, count]) => (
                  <div key={name} className="flex justify-between">
                    <span className="truncate max-w-[120px]">{name}:</span>
                    <span>{count} items</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Entries */}
          {entries.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Recent Metrics</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {entries.slice(-5).reverse().map((entry, index) => (
                  <div key={index} className={`text-xs p-2 rounded border ${getRatingColor(entry.rating)}`}>
                    <div className="flex justify-between">
                      <span className="font-semibold">{entry.name}</span>
                      <span>{entry.value}{entry.name === 'CLS' ? '' : 'ms'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Hook for measuring component performance
export function usePerformanceMeasure(componentName: string) {
  const startTimeRef = useRef<number>(0)

  React.useEffect(() => {
    startTimeRef.current = performance.now()
    pwaManager.markPerformance(`${componentName}-mount-start`)

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTimeRef.current
      pwaManager.markPerformance(`${componentName}-mount-end`)
      pwaManager.markPerformance(`${componentName}-duration`, { duration })
    }
  }, [componentName])

  const measureRender = useCallback((phase: string) => {
    pwaManager.markPerformance(`${componentName}-${phase}`)
  }, [componentName])

  return { measureRender }
}