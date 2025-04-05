import { waitFor } from '@testing-library/react'; // Add waitFor import
/**
 * PWA and Service Worker Tests
 */

import { register, unregister } from '../serviceWorkerRegistration';
import { SearchResult } from '../types/search'; // Assuming this type might be needed by other parts, adjust if not

// --- Mocks ---

// Mock Service Worker Global Scope (self)
const mockSWGlobalScope = {
    addEventListener: jest.fn(),
    skipWaiting: jest.fn(() => Promise.resolve()),
    clients: {
        claim: jest.fn(() => Promise.resolve()),
        openWindow: jest.fn(() => Promise.resolve(null)),
    },
    registration: {
        showNotification: jest.fn(() => Promise.resolve()),
    },
    location: {
        origin: 'http://localhost',
    },
} as any;
Object.assign(global, mockSWGlobalScope);

// Dummy types/mocks for complex SW features
const mockPushManager: Partial<PushManager> = {
    getSubscription: jest.fn(() => Promise.resolve(null)),
    permissionState: jest.fn(() => Promise.resolve('prompt' as PermissionState)),
    subscribe: jest.fn(() => Promise.reject(new Error('Not implemented'))),
};
type SyncManager = {};
type PeriodicSyncManager = {};

const mockUnregister = jest.fn(() => Promise.resolve(true));
const mockServiceWorker = {
    state: 'activated',
    postMessage: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    scriptURL: '/serviceWorker.js',
    onstatechange: null,
    onerror: null,
} as unknown as ServiceWorker;

const baseMockServiceWorkerRegistration: Partial<ServiceWorkerRegistration> = {
    scope: '/',
    unregister: mockUnregister,
    update: jest.fn(() => Promise.resolve()),
    active: null,
    installing: null,
    waiting: null,
    navigationPreload: {
        enable: jest.fn(() => Promise.resolve()),
        disable: jest.fn(() => Promise.resolve()),
        setHeaderValue: jest.fn(() => Promise.resolve()),
        getState: jest.fn(() => Promise.resolve({ enabled: false, headerValue: '' })),
    },
    pushManager: mockPushManager as PushManager,
    onupdatefound: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
};

let baseMockServiceWorkerContainer: Partial<ServiceWorkerContainer>;

// Mock fetch
const mockFetchResponse: Partial<Response> = {
    status: 200, ok: true, headers: new Headers({ 'content-type': 'application/javascript' }),
    clone: jest.fn().mockReturnThis(), json: () => Promise.resolve({}), text: () => Promise.resolve(''),
    redirected: false, statusText: 'OK', type: 'basic', url: '', body: null, bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)), blob: () => Promise.resolve(new Blob()), formData: () => Promise.resolve(new FormData()),
};
global.fetch = jest.fn(() => Promise.resolve(mockFetchResponse as Response));


// Mock CacheStorage and Cache
let mockCacheMatch = jest.fn<Promise<Response | undefined>, [RequestInfo, CacheQueryOptions?]>(() => Promise.resolve(undefined));
let mockCacheAddAll = jest.fn<Promise<void>, [RequestInfo[]]>(() => Promise.resolve());
let mockCachePut = jest.fn<Promise<void>, [RequestInfo, Response]>(() => Promise.resolve());
let mockCacheDelete = jest.fn<Promise<boolean>, [RequestInfo, CacheQueryOptions?]>(() => Promise.resolve(true));
let mockCacheKeys = jest.fn<Promise<readonly Request[]>, []>(() => Promise.resolve([])); // Readonly Request[] might be closer? Or string[]? Check Cache API spec. Let's use string[] for simplicity.
let mockCacheStorageKeys = jest.fn<Promise<string[]>, []>(() => Promise.resolve([]));


const mockCache: Partial<Cache> = {
    match: mockCacheMatch, addAll: mockCacheAddAll, put: mockCachePut,
    delete: mockCacheDelete, keys: mockCacheKeys,
};
const mockCaches: Partial<CacheStorage> = {
    open: jest.fn(() => Promise.resolve(mockCache as Cache)),
    match: jest.fn(() => Promise.resolve(undefined)), // Top-level match
    keys: mockCacheStorageKeys, // Use specific mock for CacheStorage keys
    delete: jest.fn(() => Promise.resolve(true)),
};
Object.defineProperty(global, 'caches', { value: mockCaches, writable: true });

// Mock URL
const mockURLInstance = { origin: 'http://localhost', href: '' };
const OriginalURL = global.URL;
const MockURLConstructor = jest.fn().mockImplementation((url, base) => {
    const baseOrigin = base ? (new OriginalURL(base)).origin : 'http://localhost';
    return { ...mockURLInstance, href: url, origin: baseOrigin };
});
(MockURLConstructor as any).createObjectURL = jest.fn(() => 'blob:http://localhost/mock-object-url');
(MockURLConstructor as any).revokeObjectURL = jest.fn();
(MockURLConstructor as any).canParse = jest.fn(() => true);
global.URL = MockURLConstructor as any;


// Mock console
global.console = { ...console, log: jest.fn(), error: jest.fn(), warn: jest.fn() };

// --- Helper to setup mocks per test ---
const setupServiceWorkerMocks = (options: {
    controller?: ServiceWorker | null,
    installingWorkerState?: ServiceWorkerState | null,
    registrationResult?: Partial<ServiceWorkerRegistration> | null
} = {}) => {
    const installingWorker = options.installingWorkerState
        ? { ...mockServiceWorker, state: options.installingWorkerState, onstatechange: null } as ServiceWorker
        : null;

    const registration = {
        ...baseMockServiceWorkerRegistration,
        installing: installingWorker,
        active: options.controller === undefined ? baseMockServiceWorkerRegistration.active : options.controller,
        ...(options.registrationResult || {})
    } as ServiceWorkerRegistration;

    const container = {
        ...baseMockServiceWorkerContainer,
        // Ensure register always returns a promise resolving to the registration
        register: jest.fn(() => Promise.resolve(registration)), // Explicitly return Promise
        ready: Promise.resolve(registration),
        controller: options.controller === undefined ? baseMockServiceWorkerContainer.controller : options.controller,
    };

    Object.defineProperty(global.navigator, 'serviceWorker', {
        value: container,
        writable: true,
    });

    return { registration, installingWorker, container };
};

// --- Helper to simulate SW events ---
const swEventListeners: { [key: string]: ((event: any) => void)[] } = {};
mockSWGlobalScope.addEventListener = jest.fn((type, listener) => {
    if (!swEventListeners[type]) swEventListeners[type] = [];
    swEventListeners[type].push(listener);
});

let waitUntilPromises: Promise<any>[] = [];
let respondWithPromises: Promise<Response>[] = []; // Store respondWith promises

function dispatchSWEvent(type: string, eventData: any) {
    const listeners = swEventListeners[type] || [];
    const event = {
        ...eventData,
        waitUntil: jest.fn((promise: Promise<any>) => {
            waitUntilPromises.push(promise);
        }),
        // Store the promise passed to respondWith, ensuring it's always a Promise
        respondWith: jest.fn((responsePromise: Response | Promise<Response>) => {
            const promise = Promise.resolve(responsePromise); // Ensure it's a promise
            respondWithPromises.push(promise);
            // Jest tests often need the promise returned for chaining/awaiting
            return promise; 
        }),
        request: eventData.request || new Request(eventData.url || '/', { headers: eventData.headers }),
    };
    listeners.forEach(listener => listener(event));
    return event;
}

async function awaitWaitUntil() {
    // Simplify back to basic setTimeout yield
    await new Promise(resolve => setTimeout(resolve, 0)); 
    // Still await waitUntil promises as they are explicitly pushed
    await Promise.all(waitUntilPromises);
    waitUntilPromises = [];
    // Clear respondWith promises here too, although we won't explicitly await them
    respondWithPromises = []; 
}


// --- Tests ---
describe('Service Worker Registration', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        baseMockServiceWorkerContainer = { /* Initialize base container */
             register: jest.fn(() => Promise.resolve(baseMockServiceWorkerRegistration as ServiceWorkerRegistration)),
             ready: Promise.resolve(baseMockServiceWorkerRegistration as ServiceWorkerRegistration),
             getRegistration: jest.fn(() => Promise.resolve(undefined)),
             controller: null, addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn(),
        };
        setupServiceWorkerMocks();

        // Reset cache mocks
        mockCacheMatch = jest.fn<Promise<Response | undefined>, [RequestInfo, CacheQueryOptions?]>(() => Promise.resolve(undefined));
        mockCacheAddAll = jest.fn<Promise<void>, [RequestInfo[]]>(() => Promise.resolve());
        mockCachePut = jest.fn<Promise<void>, [RequestInfo, Response]>(() => Promise.resolve());
        mockCacheDelete = jest.fn<Promise<boolean>, [RequestInfo, CacheQueryOptions?]>(() => Promise.resolve(true));
        mockCacheKeys = jest.fn<Promise<readonly Request[]>, []>(() => Promise.resolve([]));
        mockCacheStorageKeys = jest.fn<Promise<string[]>, []>(() => Promise.resolve([]));
        (mockCaches.open as jest.Mock).mockResolvedValue(mockCache as Cache);
        (mockCaches.delete as jest.Mock).mockResolvedValue(true);

        global.fetch = jest.fn(() => Promise.resolve(mockFetchResponse as Response));
        (global.URL as any).createObjectURL.mockClear();
        (global.URL as any).revokeObjectURL.mockClear();
        (global.URL as any).canParse.mockClear().mockReturnValue(true);

        process.env.NODE_ENV = 'production';
        process.env.PUBLIC_URL = 'http://localhost';
        Object.defineProperty(window, 'location', { value: { hostname: 'localhost', href: 'http://localhost', reload: jest.fn() }, writable: true });
    });

    afterEach(() => { process.env.NODE_ENV = 'test'; });

    it('should attempt to register service worker in production', async () => { // Make test async
        const { container } = setupServiceWorkerMocks();
        register();
        window.dispatchEvent(new Event('load'));
        // Use waitFor for assertion
        await waitFor(() => expect(container.register).toHaveBeenCalledWith('/serviceWorker.js')); 
    });

    describe('registerValidSW', () => {
         it('should call onSuccess callback when registration is successful and no controller exists', async () => {
            const onSuccess = jest.fn();
            const { registration, installingWorker } = setupServiceWorkerMocks({ controller: null, installingWorkerState: 'installed' });
            register({ onSuccess });
            window.dispatchEvent(new Event('load'));
            await awaitWaitUntil(); 
            if (installingWorker?.onstatechange) (installingWorker.onstatechange as Function)({ type: 'statechange', target: installingWorker });
            await awaitWaitUntil(); 
            // Use waitFor for assertion as state changes might be asynchronous
            await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(registration)); 
        });
        it('should call onUpdate callback when new content is available', async () => {
            const onUpdate = jest.fn();
            const { registration, installingWorker } = setupServiceWorkerMocks({ controller: mockServiceWorker, installingWorkerState: 'installed' });
            register({ onUpdate });
            window.dispatchEvent(new Event('load'));
            await awaitWaitUntil(); 
             if (installingWorker?.onstatechange) (installingWorker.onstatechange as Function)({ type: 'statechange', target: installingWorker });
            await awaitWaitUntil(); 
            // Use waitFor for assertion as state changes might be asynchronous
            await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(registration)); 
        });
    });

     describe('checkValidServiceWorker', () => {
         it('should register if service worker is valid', async () => {
            const { container } = setupServiceWorkerMocks();
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse as Response);
            register();
            window.dispatchEvent(new Event('load'));
            await awaitWaitUntil(); 
            // Use waitFor for assertion
            await waitFor(() => expect(container.register).toHaveBeenCalledWith('/serviceWorker.js')); 
        });
        it('should handle fetch errors (offline)', async () => {
            const onSuccess = jest.fn();
            const { registration } = setupServiceWorkerMocks();
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
            (navigator.serviceWorker as any).ready = Promise.resolve(registration);
            register({ onSuccess });
            window.dispatchEvent(new Event('load'));
            await awaitWaitUntil(); 
            await navigator.serviceWorker.ready;
            await awaitWaitUntil(); 
            // Use waitFor for assertion
            await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(registration)); 
        });
    });

    describe('unregister', () => {
         it('should call registration.unregister()', async () => {
             const { registration } = setupServiceWorkerMocks();
             (navigator.serviceWorker as any).ready = Promise.resolve(registration);
            unregister();
            await navigator.serviceWorker.ready;
            // Use waitFor for assertion
            await waitFor(() => expect(mockUnregister).toHaveBeenCalled()); 
        });
    });

});

// --- Service Worker Logic Tests ---
describe('Service Worker Logic', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset cache mocks
        mockCacheMatch = jest.fn<Promise<Response | undefined>, [RequestInfo, CacheQueryOptions?]>(() => Promise.resolve(undefined));
        mockCacheAddAll = jest.fn<Promise<void>, [RequestInfo[]]>(() => Promise.resolve());
        mockCachePut = jest.fn<Promise<void>, [RequestInfo, Response]>(() => Promise.resolve());
        mockCacheDelete = jest.fn<Promise<boolean>, [RequestInfo, CacheQueryOptions?]>(() => Promise.resolve(true));
        mockCacheKeys = jest.fn<Promise<readonly Request[]>, []>(() => Promise.resolve([]));
        (mockCaches.open as jest.Mock).mockResolvedValue(mockCache as Cache);
        (mockCaches.delete as jest.Mock).mockResolvedValue(true);
        mockCacheStorageKeys = jest.fn<Promise<string[]>, []>(() => Promise.resolve([])); // Use correct mock
        // Reset fetch mock
        global.fetch = jest.fn(() => Promise.resolve(mockFetchResponse as Response));
        // Reset SW scope mocks
        (mockSWGlobalScope.skipWaiting as jest.Mock).mockClear();
        (mockSWGlobalScope.clients.claim as jest.Mock).mockClear();
        waitUntilPromises = [];
        respondWithPromises = []; // Clear this too
    });

    it('install event should cache static assets', async () => {
        dispatchSWEvent('install', {});
        await awaitWaitUntil();
        await waitFor(() => {
            expect(mockCaches.open).toHaveBeenCalledWith(expect.stringContaining('static'));
            expect(mockCacheAddAll).toHaveBeenCalledWith(expect.arrayContaining(['/', '/index.html', '/manifest.json']));
            expect(mockSWGlobalScope.skipWaiting).toHaveBeenCalled();
        });
    });

    it('activate event should delete old caches', async () => {
        const oldCacheName = 'old-cache-v1';
        const staticCacheName = 'business-assistant-static-v1'; // Match name in SW
        const dynamicCacheName = 'business-assistant-dynamic-v1'; // Match name in SW
        mockCacheStorageKeys.mockResolvedValueOnce([oldCacheName, staticCacheName, dynamicCacheName]); // Use correct mock

        dispatchSWEvent('activate', {});
        await awaitWaitUntil();

        await waitFor(() => {
            expect(mockCaches.delete).toHaveBeenCalledWith(oldCacheName);
            expect(mockCaches.delete).toHaveBeenCalledTimes(1);
            expect(mockSWGlobalScope.clients.claim).toHaveBeenCalled();
        });
    });

    describe('fetch event', () => {
        it('should return cached response for static assets (cache first)', async () => {
            const mockCachedResponse = new Response('cached content');
            mockCacheMatch.mockImplementationOnce(() => Promise.resolve(mockCachedResponse));
            const request = new Request('/index.html');
            const event = dispatchSWEvent('fetch', { request });

            await awaitWaitUntil();
            await waitFor(async () => {
                expect(event.respondWith).toHaveBeenCalled();
                const respondWithPromise = (event.respondWith as jest.Mock).mock.results[0]?.value;
                expect(respondWithPromise).toBeDefined();
                const finalResponse = await respondWithPromise;
                expect(mockCacheMatch).toHaveBeenCalledWith(request);
                expect(global.fetch).not.toHaveBeenCalled();
                expect(finalResponse).toBe(mockCachedResponse);
            });
        });

         it('should fetch and cache static asset if not in cache', async () => {
            mockCacheMatch.mockResolvedValueOnce(undefined);
            const networkResponse = { ...mockFetchResponse, clone: jest.fn().mockReturnThis() } as Response;
            (global.fetch as jest.Mock).mockResolvedValueOnce(networkResponse); 
            const request = new Request('/static/js/bundle.js');

            const event = dispatchSWEvent('fetch', { request }); 
            await awaitWaitUntil();
            await waitFor(async () => {
                expect(event.respondWith).toHaveBeenCalled(); 
                const respondWithPromise = (event.respondWith as jest.Mock).mock.results[0]?.value;
                expect(respondWithPromise).toBeDefined();
                const finalResponse = await respondWithPromise;
                expect(mockCacheMatch).toHaveBeenCalledWith(request);
                expect(global.fetch).toHaveBeenCalledWith(request);
                expect(mockCaches.open).toHaveBeenCalledWith(expect.stringContaining('dynamic'));
                expect(mockCachePut).toHaveBeenCalledWith(request, networkResponse);
                expect(finalResponse).toBe(networkResponse);
            });
    });

    it('should use network first for API calls', async () => {
        const networkResponse = { ...mockFetchResponse, clone: jest.fn().mockReturnThis(), status: 201 } as Response;
        (global.fetch as jest.Mock).mockResolvedValueOnce(networkResponse); 
        mockCachePut = jest.fn(); // Reset mockCachePut for this test
        (mockCaches.open as jest.Mock).mockResolvedValue({ ...mockCache, put: mockCachePut }); // Ensure open returns cache with put
        const request = new Request('/api/data');

        const event = dispatchSWEvent('fetch', { request }); 
        await awaitWaitUntil();
        await waitFor(async () => {
            expect(event.respondWith).toHaveBeenCalled();
            const respondWithPromise = (event.respondWith as jest.Mock).mock.results[0]?.value;
            expect(respondWithPromise).toBeDefined();
            const finalResponse = await respondWithPromise;
            expect(global.fetch).toHaveBeenCalledWith(request);
            expect(mockCaches.open).toHaveBeenCalledWith(expect.stringContaining('dynamic'));
            expect(mockCachePut).toHaveBeenCalledWith(request, networkResponse);
            // Don't check mockCacheMatch here as network-first shouldn't call it on success
            // expect(mockCacheMatch).not.toHaveBeenCalled(); 
            expect(finalResponse).toBe(networkResponse);
        });
    });

    it('should fallback to cache for API calls if network fails', async () => {
        const mockCachedResponse = new Response('cached api data');
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failed')); 
        mockCacheMatch.mockImplementationOnce(() => Promise.resolve(mockCachedResponse)); 
        const request = new Request('/api/data');

        const event = dispatchSWEvent('fetch', { request }); 
        await awaitWaitUntil();
        await waitFor(async () => {
            expect(event.respondWith).toHaveBeenCalled();
            const respondWithPromise = (event.respondWith as jest.Mock).mock.results[0]?.value;
            expect(respondWithPromise).toBeDefined();
            const finalResponse = await respondWithPromise;
            expect(global.fetch).toHaveBeenCalledWith(request);
            expect(mockCacheMatch).toHaveBeenCalledWith(request);
            expect(finalResponse).toBe(mockCachedResponse);
        });
    });

     it('should return root cache match for HTML request if network fails and cache miss', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failed')); 
        mockCacheMatch.mockResolvedValueOnce(undefined); // Cache miss for original request
        const offlinePageResponse = new Response('offline page'); 
        mockCacheMatch.mockImplementationOnce(() => Promise.resolve(offlinePageResponse)); // Cache hit for '/'

        const request = new Request('/some-page', { headers: { 'accept': 'text/html,application/xhtml+xml' } });
        const event = dispatchSWEvent('fetch', { request }); 
        await awaitWaitUntil();
        await waitFor(async () => {
            expect(event.respondWith).toHaveBeenCalled();
            const respondWithPromise = (event.respondWith as jest.Mock).mock.results[0]?.value;
            expect(respondWithPromise).toBeDefined();
            const finalResponse = await respondWithPromise;
            expect(global.fetch).toHaveBeenCalledWith(request);
            expect(mockCacheMatch).toHaveBeenCalledWith(request);
            expect(mockCacheMatch).toHaveBeenCalledWith('/');
            expect(finalResponse).toBe(offlinePageResponse);
        });
    });

    it('should ignore non-GET requests', async () => {
         const request = new Request('/api/post', { method: 'POST' });
         const event = dispatchSWEvent('fetch', { request });
         await awaitWaitUntil();
         // No need for waitFor here as we expect it NOT to be called
         expect(event.respondWith).not.toHaveBeenCalled(); 
    });

     it('should ignore cross-origin requests', async () => {
         const request = new Request('https://external.com/data');
         const event = dispatchSWEvent('fetch', { request });
         await awaitWaitUntil();
         // No need for waitFor here as we expect it NOT to be called
         expect(event.respondWith).not.toHaveBeenCalled(); 
    });
});

});

// TODO: Add describe block for Background Sync
// describe('Background Sync', () => { ... });

// TODO: Add describe block for Push Notifications
// describe('Push Notifications', () => { ... });