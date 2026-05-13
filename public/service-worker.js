/*
The primary goal is to optimize asset delivery by intercepting requests
for resources from 'pgn.chessbase.com' and serving them from our local
For more information on Service Workers, refer to the MDN documentation:
https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker_API/Using_Service_Workers


--- Cache Management Strategy ---

If at any point you want to force pages that use this service worker to start using a fresh
cache, then increment the CACHE_VERSION value. It will kick off the service worker update
flow and the old cache(s) will be purged as part of the activate event handler when the
updated service worker is activated.
NOTE: Before update the CACHE_VERSION change the folder stucture too.
*/

var CACHE_VERSION = 1;
var CHESS_CACHE = `chess-cache-v${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
    // Interface forces the waiting service worker to become the active service worker
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(enableNavigationPreload());
    // When a service worker is initially registered, pages won't use it until they next load.
    // The claim() method causes those pages to be controlled immediately.
    // https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
    // we are doing this in active listener so that clients loaded in the same scope 
    //do not need to be reloaded before their fetches will go through this service worker.
    event.waitUntil(self.clients.claim());
    // Delete all caches that aren't named in CHESS_CACHE.
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (CHESS_CACHE !== cacheName) {
                        console.log("Deleting outdated cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                    return undefined;
                }),
            ),
        ),
    );
});

self.addEventListener('fetch', (event) => {
    const requestUrl = event.request.url;
    const url = new URL(requestUrl);

    if (url.host === "pgn.chessbase.com" || requestUrl.endsWith('Enginemin.js')) {
        const fileName = getFilenameFromURL(requestUrl);
        const currentOrigin = self.location.origin;
        const chessResourceUrl = `${currentOrigin}/assets/v${CACHE_VERSION}`; // TODO: need to remove https://assets.coachchess.ai/v1
        let replacementUrl = null;

        if (requestUrl.endsWith('.png')) {
            replacementUrl = chessResourceUrl  +'/icons/' + fileName.toLowerCase();
        } else if (requestUrl.endsWith('.jpg')) {
            replacementUrl = chessResourceUrl  +'/icons/' + fileName.toLowerCase();
        } else if (requestUrl.endsWith('.mp3')) {
            replacementUrl = chessResourceUrl  + '/chess_sounds/' + fileName;
        } else if (/fritzajax3\.js/.test(requestUrl)) {
            replacementUrl = chessResourceUrl  + '/fritzajax3.js';
        } else if (/enginemin\.js/.test(requestUrl) || /Enginemin\.js/.test(requestUrl)) {
            replacementUrl = chessResourceUrl  + '/Enginemin.js';
        } else if (/Fritz3\.wasm/.test(requestUrl)) {
            replacementUrl = chessResourceUrl  + '/Fritz3.wasm';
        } else {
            console.log("No replacement URL found for: ", requestUrl);  
        }

        const handleFetch = async (cache) => {
            try {
                const response = await fetch(replacementUrl)
                // console.log("Fetched response: ", response.headers.get("content-type")); 
                // Content-type: 'text/html' will be return in
                // the response when the file is not found in the server.
                // So, if the content-type is 'text/html', it means the file is not found.
                
                if ( 
                    response.headers.has('content-type') &&
                    response.headers.get('content-type').match(/text\/html/i)
                ) {
                    // Alert missing file and fetch from the pgn network also add that into cache
                    await alertMissingFile(requestUrl, replacementUrl)
                    const pgnResponse = await fetch(event.request);
                    cache.put(replacementUrl, pgnResponse.clone());
                    return pgnResponse;
                } else if (response.ok) {
                    cache.put(replacementUrl, response.clone());
                }
                return response;
            } catch (error) {
                await alertMissingFile(requestUrl, replacementUrl)
                return fetch(event.request)
            }
        };

        event.respondWith(
            caches.open(CHESS_CACHE)
                .then(async (cache) => {
                    const response = await cache.match(replacementUrl);
                    if (response) {
                        // console.log("Found response in cache:", replacementUrl);
                        return response;
                    }
                    // console.log("No response for", replacementUrl, "found in cache. Fetching from network...");
                    return handleFetch(cache);
                })
                .catch((error) => {
                    console.error("Error in fetch handler:", error);
                    // Fallback to default network
                    return fetch(event.request);
                })
        );
    }
    // If the request doesn't match pgn url, let it pass through normally
});

const alertMissingFile = async (pgnURL, ourURL) => {
    console.log("Requested File not found: ", ourURL + " for " + pgnURL);
    await self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'FETCH_ERROR',
                message: 'Unexpected Error. Please report to System Admin (File Not Found In Backend)',
                ourURL: ourURL,
                pgnURL: pgnURL
            });
        });
    });
}

const enableNavigationPreload = async () => {
    if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
    }
};

function getFilenameFromURL(url) {
    const parts = url.split("/");
    return parts[parts.length - 1];
}
