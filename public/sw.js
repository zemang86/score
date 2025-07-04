// Service Worker for Edventure+ PWA
const CACHE_NAME = 'edventure-plus-v1.0.0'
const STATIC_CACHE = 'static-v1.0.0'
const DYNAMIC_CACHE = 'dynamic-v1.0.0'
const OFFLINE_CACHE = 'offline-v1.0.0'

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/index.css',
  '/offline.html'
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^.*\/api\/.*$/,
  /^.*\/supabase\/.*$/,
  /^.*\/auth\/.*$/
]

// Large assets that benefit from caching
const CACHEABLE_EXTENSIONS = [
  '.js',
  '.css',
  '.woff2',
  '.woff',
  '.ttf',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.ico'
]

// ========================
// INSTALL EVENT
// ========================
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets')
        return cache.addAll(STATIC_ASSETS.map(url => {
          return new Request(url, { credentials: 'same-origin' })
        }))
      }),
      
      // Cache offline page
      caches.open(OFFLINE_CACHE).then((cache) => {
        return cache.add('/offline.html')
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

// ========================
// ACTIVATE EVENT
// ========================
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== OFFLINE_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Take control of all pages
      self.clients.claim()
    ])
  )
})

// ========================
// FETCH EVENT - Request Handling
// ========================
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return
  }

  event.respondWith(handleRequest(request))
})

// ========================
// REQUEST HANDLING STRATEGIES
// ========================
async function handleRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Strategy 1: Static assets - Cache First
    if (isStaticAsset(request)) {
      return await cacheFirst(request, STATIC_CACHE)
    }
    
    // Strategy 2: API calls - Network First with Cache Fallback
    if (isApiCall(request)) {
      return await networkFirstWithCache(request, DYNAMIC_CACHE)
    }
    
    // Strategy 3: Navigation requests - Network First with Offline Fallback
    if (request.mode === 'navigate') {
      return await navigationStrategy(request)
    }
    
    // Strategy 4: Everything else - Stale While Revalidate
    return await staleWhileRevalidate(request, DYNAMIC_CACHE)
    
  } catch (error) {
    console.error('❌ Request handling error:', error)
    return await getOfflineFallback(request)
  }
}

// ========================
// CACHING STRATEGIES
// ========================

// Cache First - For static assets that rarely change
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  // If not in cache, fetch and cache
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    throw error
  }
}

// Network First - For API calls that need fresh data
async function networkFirstWithCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      console.log('📱 Serving cached API response for:', request.url)
      return cachedResponse
    }
    throw error
  }
}

// Stale While Revalidate - For resources that can be stale
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request)
  
  // Always try to fetch fresh version in background
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => {
    // Network error, ignore
  })
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse
  }
  
  // If no cache, wait for network
  return await fetchPromise
}

// Navigation Strategy - For page requests
async function navigationStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache navigation responses
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page
    return await caches.match('/offline.html')
  }
}

// ========================
// HELPER FUNCTIONS
// ========================

function isStaticAsset(request) {
  const url = new URL(request.url)
  return CACHEABLE_EXTENSIONS.some(ext => url.pathname.endsWith(ext))
}

function isApiCall(request) {
  const url = new URL(request.url)
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href))
}

async function getOfflineFallback(request) {
  if (request.mode === 'navigate') {
    return await caches.match('/offline.html')
  }
  
  // Return a basic offline response for other requests
  return new Response('Offline - Please check your internet connection', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  })
}

// ========================
// BACKGROUND SYNC
// ========================
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag)
  
  if (event.tag === 'exam-sync') {
    event.waitUntil(syncOfflineExams())
  }
  
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics())
  }
})

async function syncOfflineExams() {
  try {
    console.log('📚 Syncing offline exams...')
    
    // Get offline exams from IndexedDB or localStorage
    const offlineExams = await getOfflineExams()
    
    for (const exam of offlineExams) {
      try {
        // Attempt to sync each exam
        const response = await fetch('/api/exams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(exam)
        })
        
        if (response.ok) {
          // Remove from offline storage after successful sync
          await removeOfflineExam(exam.id)
          console.log('✅ Synced exam:', exam.id)
        }
      } catch (error) {
        console.error('❌ Failed to sync exam:', exam.id, error)
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error)
  }
}

async function syncAnalytics() {
  try {
    console.log('📊 Syncing analytics data...')
    // Implementation for analytics sync
  } catch (error) {
    console.error('❌ Analytics sync failed:', error)
  }
}

// ========================
// OFFLINE DATA MANAGEMENT
// ========================
async function getOfflineExams() {
  // Try to get from localStorage first (simpler implementation)
  try {
    const stored = localStorage.getItem('offline-exams')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    return []
  }
}

async function removeOfflineExam(examId) {
  try {
    const stored = localStorage.getItem('offline-exams')
    if (stored) {
      const exams = JSON.parse(stored)
      const filtered = exams.filter(exam => exam.id !== examId)
      localStorage.setItem('offline-exams', JSON.stringify(filtered))
    }
  } catch (error) {
    console.error('❌ Failed to remove offline exam:', error)
  }
}

// ========================
// PUSH NOTIFICATIONS
// ========================
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Edventure+',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Edventure+', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// ========================
// PERFORMANCE MONITORING
// ========================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_MARK') {
    console.log('📈 Performance mark:', event.data)
    // Could send to analytics service
  }
  
  if (event.data && event.data.type === 'CACHE_STATS') {
    getCacheStats().then(stats => {
      event.ports[0].postMessage(stats)
    })
  }
})

async function getCacheStats() {
  const cacheNames = await caches.keys()
  const stats = {}
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    stats[cacheName] = keys.length
  }
  
  return stats
}

// ========================
// ERROR HANDLING
// ========================
self.addEventListener('error', (event) => {
  console.error('🚨 Service Worker error:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection in SW:', event.reason)
  event.preventDefault()
})

console.log('🔄 Service Worker script loaded')