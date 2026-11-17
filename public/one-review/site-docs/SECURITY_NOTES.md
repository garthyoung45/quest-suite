# Security notes

- The page makes no network calls of its own. Only Google Fonts load from outside; checked by the test (no other requests).
- No live endpoints, keys, tokens, owner URLs, version ids or family information are on the page or in its scripts.
- The Security Laboratory makes throwaway ECDSA P-256 keys in the visitor's browser (non-extractable) and discards them. It shows the kind of check the real gate uses; it is not the live code.
- The developer sandbox is a mock in the browser. Its response shapes are illustrative, not the live contract.
- Nothing is stored in the browser.
- Text the visitor types (sandbox title) is shown with textContent, never as HTML.
