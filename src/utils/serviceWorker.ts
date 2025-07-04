// Service Worker Registration and PWA Utilities
export interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void
  onSuccess?: (registration: ServiceWorkerRegistration) => void
  onOffline?: () => void
  onOnline?: () => void
}

class PWAManager {
  private installPrompt: PWAInstallPrompt | null = null
  private registration: ServiceWorkerRegistration | null = null
  private isOnline = navigator.onLine
  private updateAvailable = false

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    // Listen for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('💾 PWA install prompt available')
      e.preventDefault()
      this.installPrompt = e as any
      this.notifyInstallAvailable()
    })

    // Listen for PWA installation
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed successfully')
      this.installPrompt = null
      this.notifyInstallSuccess()
    })

    // Listen for online/offline status
    window.addEventListener('online', () => {
      console.log('🌐 Back online')
      this.isOnline = true
      this.handleOnlineStatus()
    })

    window.addEventListener('offline', () => {
      console.log('📱 Gone offline')
      this.isOnline = false
      this.handleOfflineStatus()
    })

    // Listen for service worker messages
    navigator.serviceWorker?.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event)
    })
  }

  // Register Service Worker
  async registerServiceWorker(config: ServiceWorkerConfig = {}) {
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Worker not supported')
      return false
    }

    try {
      console.log('🔄 Registering Service Worker...')
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      this.registration = registration
      
      console.log('✅ Service Worker registered:', registration.scope)

      // Handle updates
      registration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found')
        const newWorker = registration.installing
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 New Service Worker installed, update available')
              this.updateAvailable = true
              config.onUpdate?.(registration)
              this.notifyUpdateAvailable()
            }
          })
        }
      })

      // Handle successful registration
      if (registration.active) {
        config.onSuccess?.(registration)
      }

      // Check for updates periodically
      this.setupUpdateCheck(registration)

      return true
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
      return false
    }
  }

  // Install PWA
  async installPWA(): Promise<boolean> {
    if (!this.installPrompt) {
      console.warn('⚠️ PWA install prompt not available')
      return false
    }

    try {
      await this.installPrompt.prompt()
      const choiceResult = await this.installPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted PWA installation')
        return true
      } else {
        console.log('❌ User dismissed PWA installation')
        return false
      }
    } catch (error) {
      console.error('❌ PWA installation failed:', error)
      return false
    }
  }

  // Update Service Worker
  async updateServiceWorker(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      await this.registration.update()
      
      // Skip waiting and activate new service worker
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Service Worker update failed:', error)
      return false
    }
  }

  // Background Sync
  async registerBackgroundSync(tag: string): Promise<boolean> {
    if (!this.registration || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('⚠️ Background Sync not supported')
      return false
    }

    try {
      // Type assertion for Background Sync API
      const syncManager = (this.registration as any).sync
      await syncManager.register(tag)
      console.log(`🔄 Background sync registered: ${tag}`)
      return true
    } catch (error) {
      console.error(`❌ Background sync failed for ${tag}:`, error)
      return false
    }
  }

  // Push Notifications
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications not supported')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      console.warn('⚠️ Notifications denied by user')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('❌ Notification permission request failed:', error)
      return false
    }
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.warn('⚠️ Service Worker not registered')
      return null
    }

    try {
      const hasPermission = await this.requestNotificationPermission()
      if (!hasPermission) {
        return null
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(
          // Replace with your VAPID public key
          'BN4GvZtEZiZuqkn6dp9wxPF6ZXGvSvfDuZkST-jb-pDXrjsT4xo8SyQe9GWrP7q8rT5v1Z8gR9iOqV-8LQjPcf4'
        )
      })

      console.log('✅ Push notification subscription created')
      return subscription
    } catch (error) {
      console.error('❌ Push notification subscription failed:', error)
      return null
    }
  }

  // Cache Management
  async getCacheStats(): Promise<Record<string, number>> {
    if (!this.registration) {
      return {}
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data || {})
      }

      this.registration!.active?.postMessage(
        { type: 'CACHE_STATS' },
        [messageChannel.port2]
      )

      // Timeout after 5 seconds
      setTimeout(() => resolve({}), 5000)
    })
  }

  async clearCache(cacheName?: string): Promise<boolean> {
    try {
      if (cacheName) {
        const deleted = await caches.delete(cacheName)
        console.log(`🗑️ Cache ${cacheName} ${deleted ? 'deleted' : 'not found'}`)
        return deleted
      } else {
        // Clear all caches
        const cacheNames = await caches.keys()
        const deletePromises = cacheNames.map(name => caches.delete(name))
        await Promise.all(deletePromises)
        console.log(`🗑️ Cleared ${cacheNames.length} caches`)
        return true
      }
    } catch (error) {
      console.error('❌ Cache clearing failed:', error)
      return false
    }
  }

  // Performance Monitoring
  markPerformance(name: string, detail?: any) {
    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'PERFORMANCE_MARK',
        name,
        timestamp: Date.now(),
        detail
      })
    }

    // Also mark in main thread
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name)
    }
  }

  measurePerformance(startMark: string, endMark: string, name?: string) {
    if ('performance' in window && 'measure' in performance) {
      try {
        const measureName = name || `${startMark}-to-${endMark}`
        performance.measure(measureName, startMark, endMark)
        
        const measure = performance.getEntriesByName(measureName)[0]
        this.markPerformance('performance-measure', {
          name: measureName,
          duration: measure.duration
        })
        
        return measure.duration
      } catch (error) {
        console.warn('⚠️ Performance measurement failed:', error)
        return 0
      }
    }
    return 0
  }

  // Utility methods
  private setupUpdateCheck(registration: ServiceWorkerRegistration) {
    // Check for updates every hour
    setInterval(() => {
      registration.update().catch(() => {
        // Ignore errors for periodic checks
      })
    }, 60 * 60 * 1000)
  }

  private handleServiceWorkerMessage(event: MessageEvent) {
    const { data } = event
    
    if (data?.type === 'CACHE_UPDATED') {
      console.log('📦 Cache updated:', data.cacheName)
    }
    
    if (data?.type === 'BACKGROUND_SYNC_SUCCESS') {
      console.log('🔄 Background sync completed:', data.tag)
    }
  }

  private handleOnlineStatus() {
    // Trigger background sync when coming back online
    this.registerBackgroundSync('exam-sync')
    this.registerBackgroundSync('analytics-sync')
    
    // Notify app components
    window.dispatchEvent(new CustomEvent('pwa-online'))
  }

  private handleOfflineStatus() {
    // Notify app components
    window.dispatchEvent(new CustomEvent('pwa-offline'))
  }

  private notifyInstallAvailable() {
    window.dispatchEvent(new CustomEvent('pwa-install-available'))
  }

  private notifyInstallSuccess() {
    window.dispatchEvent(new CustomEvent('pwa-install-success'))
  }

  private notifyUpdateAvailable() {
    window.dispatchEvent(new CustomEvent('pwa-update-available'))
  }

  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Getters
  get isInstallable(): boolean {
    return this.installPrompt !== null
  }

  get isUpdateAvailable(): boolean {
    return this.updateAvailable
  }

  get isRegistered(): boolean {
    return this.registration !== null
  }

  get connectionStatus(): boolean {
    return this.isOnline
  }
}

// Export singleton instance
export const pwaManager = new PWAManager()

// Convenience functions
export const registerSW = (config?: ServiceWorkerConfig) => 
  pwaManager.registerServiceWorker(config)

export const installPWA = () => 
  pwaManager.installPWA()

export const updateSW = () => 
  pwaManager.updateServiceWorker()

export const requestNotifications = () => 
  pwaManager.requestNotificationPermission()

export const subscribeToPush = () => 
  pwaManager.subscribeToPushNotifications()

export const getCacheStats = () => 
  pwaManager.getCacheStats()

export const clearAllCaches = () => 
  pwaManager.clearCache()

export const markPerformance = (name: string, detail?: any) => 
  pwaManager.markPerformance(name, detail)

export const measurePerformance = (start: string, end: string, name?: string) => 
  pwaManager.measurePerformance(start, end, name)

// Default configuration
export const defaultSWConfig: ServiceWorkerConfig = {
  onUpdate: (registration) => {
    console.log('🆕 App update available')
    // Could show update notification to user
  },
  onSuccess: (registration) => {
    console.log('✅ App is now offline-ready')
  }
}