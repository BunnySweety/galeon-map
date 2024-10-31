/**
 * @fileoverview Performance configuration and management for the hospital map application
 * @author BunnySweety
 * @version 1.0.0
 */

/**
 * Performance configuration constants
 */
const PerformanceConfig = {
  MARKERS: {
    CHUNK_SIZE: 50,
    CHUNK_DELAY: 10,
    CHUNK_INTERVAL: 50,
    VISIBLE_FIRST: true
  },
  IMAGES: {
    LAZY_LOAD_DISTANCE: 100,
    CACHE_TTL: 3600000, // 1 hour
    MAX_CACHE_SIZE: 100,
    DEFAULT_QUALITY: 0.8
  },
  THROTTLE: {
    RESIZE: 250,
    MAP_MOVE: 100,
    CLUSTER_UPDATE: 200
  },
  WORKERS: {
    COUNT: 4,
    TASK_TIMEOUT: 5000
  },
  CACHE: {
    MAX_AGE: 86400000, // 24 hours
    VERSION: '1.0.0'
  }
};

/**
 * Performance Manager Class
 * Handles all performance optimizations
 */
class PerformanceManager {
  constructor() {
    this.imageCache = new Map();
    this.intersectionObserver = this.setupIntersectionObserver();
    this.workerPool = null;
    this.measures = new Map();
    this.setupPerformanceMonitoring();
  }

  /**
   * Setup intersection observer for lazy loading
   */
  setupIntersectionObserver() {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
          }
        });
      },
      {
        rootMargin: `${PerformanceConfig.IMAGES.LAZY_LOAD_DISTANCE}px`,
        threshold: 0.1
      }
    );
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(this.handlePerformanceEntries.bind(this));
      observer.observe({ entryTypes: ['resource', 'navigation', 'longtask'] });
    }
  }

  /**
   * Handle performance entries
   */
  handlePerformanceEntries(entries) {
    entries.getEntries().forEach(entry => {
      if (entry.entryType === 'resource' && entry.initiatorType === 'img') {
        this.optimizeImage(entry);
      }
    });
  }

  /**
   * Start performance measurement
   */
  startMeasure(name) {
    this.measures.set(name, performance.now());
  }

  /**
   * End performance measurement
   */
  endMeasure(name) {
    const startTime = this.measures.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.measures.delete(name);
      return duration;
    }
    return null;
  }

  /**
   * Load and cache image
   */
  async loadImage(imgElement) {
    const src = imgElement.dataset.src;
    if (!src) return;

    try {
      if (this.imageCache.has(src)) {
        const cached = this.imageCache.get(src);
        if (Date.now() - cached.timestamp < PerformanceConfig.IMAGES.CACHE_TTL) {
          imgElement.src = cached.data;
          return;
        }
      }

      const response = await fetch(src);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Manage cache size
      if (this.imageCache.size >= PerformanceConfig.IMAGES.MAX_CACHE_SIZE) {
        const oldestKey = Array.from(this.imageCache.keys())[0];
        URL.revokeObjectURL(this.imageCache.get(oldestKey).data);
        this.imageCache.delete(oldestKey);
      }

      this.imageCache.set(src, {
        data: objectUrl,
        timestamp: Date.now(),
        size: blob.size
      });

      imgElement.src = objectUrl;
    } catch (error) {
      console.error('Error loading image:', error);
      imgElement.src = './assets/images/placeholder.png';
    }
  }

  /**
   * Optimize marker rendering
   */
  async optimizeMarkerRendering(markers, map, cluster) {
    const bounds = map.getBounds();
    const visibleMarkers = [];
    const deferredMarkers = [];

    markers.forEach(marker => {
      if (bounds.contains(marker.getLatLng())) {
        visibleMarkers.push(marker);
      } else {
        deferredMarkers.push(marker);
      }
    });

    // Add visible markers first
    await this.processMarkerChunk(visibleMarkers, cluster);

    // Add remaining markers in background
    if (deferredMarkers.length > 0) {
      requestIdleCallback(() => {
        this.processMarkerChunk(deferredMarkers, cluster);
      });
    }
  }

  /**
   * Process marker chunks
   */
  async processMarkerChunk(markers, cluster) {
    const chunks = this.chunkArray(markers, PerformanceConfig.MARKERS.CHUNK_SIZE);

    for (const chunk of chunks) {
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          cluster.addLayers(chunk);
          resolve();
        });
      });

      await new Promise(resolve => {
        setTimeout(resolve, PerformanceConfig.MARKERS.CHUNK_DELAY);
      });
    }
  }

  /**
   * Split array into chunks
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Enhance cluster performance
   */
  enhanceClusterPerformance(cluster) {
    cluster.options.chunkedLoading = true;
    cluster.options.chunkInterval = PerformanceConfig.MARKERS.CHUNK_INTERVAL;
    cluster.options.chunkDelay = PerformanceConfig.MARKERS.CHUNK_DELAY;

    return cluster;
  }

  /**
   * Optimize the performance of an image resource based on its size and load time.   *
   * @param {PerformanceEntry} entry - The performance entry object containing image resource details.
   */
  optimizeImage(entry) {
    try {
        if (!entry || !entry.name) return;
        
        const url = entry.name;
        const size = entry.transferSize || 0;
        const loadTime = entry.duration || 0;

        if (size > PerformanceConfig.IMAGES.MAX_SIZE || 
            loadTime > PerformanceConfig.IMAGES.MAX_LOAD_TIME) {
            console.warn('Image performance issue:', {
                url,
                size: `${(size / 1024).toFixed(2)}KB`,
                loadTime: `${loadTime.toFixed(2)}ms`
            });
        }

        if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            const img = document.querySelector(`img[src="${url}"]`);
            if (img && this.intersectionObserver) {
                this.intersectionObserver.observe(img);
            }
        }
    } catch (error) {
        console.error('Error optimizing image:', error);
    }
}

static PERFORMANCE_CONFIG = {
    IMAGES: {
        MAX_SIZE: 500 * 1024, // 500KB
        MAX_LOAD_TIME: 3000,  // 3 secondes
        ...PerformanceConfig.IMAGES
    }
};

  /**
   * Cleanup
   */
  destroy() {
    this.intersectionObserver?.disconnect();
    this.imageCache.forEach(cache => {
      URL.revokeObjectURL(cache.data);
    });
    this.imageCache.clear();
    this.measures.clear();
    this.workerPool?.terminate();
  }
}

export { PerformanceManager, PerformanceConfig };