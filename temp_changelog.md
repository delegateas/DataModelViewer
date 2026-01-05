## [2.3.0] - 2025-12-20

### Features

* security headers: 1. X-DNS-Prefetch-Control: on Purpose: Controls DNS prefetching for external resources Protection: Allows the browser to proactively resolve domain names in the background, improving performance while still being safe when set to "on" 2. Strict-Transport-Security: max-age=63072000; includeSubDomains; preload Purpose: Forces browsers to only connect via HTTPS Protection: Prevents man-in-the-middle attacks by ensuring all communication is encrypted Details: max-age=63072000 = 2 years includeSubDomains = applies to all subdomains too preload = allows inclusion in browser HSTS preload lists 3. X-Frame-Options: SAMEORIGIN Purpose: Controls whether your site can be embedded in iframes Protection: Prevents clickjacking attacks where attackers embed your site in a malicious iframe Details: SAMEORIGIN allows framing only from your own domain 4. X-Content-Type-Options: nosniff Purpose: Prevents browsers from MIME-type sniffing Protection: Stops browsers from interpreting files as a different MIME type than declared (e.g., executing a text file as JavaScript) Result: Reduces XSS attack surface 5. X-XSS-Protection: 1; mode=block Purpose: Enables browser's built-in XSS filter Protection: Blocks pages when cross-site scripting attacks are detected Note: Legacy header (modern browsers use CSP instead), but provides defense-in-depth for older browsers 6. Referrer-Policy: strict-origin-when-cross-origin Purpose: Controls what referrer information is sent with requests Protection: Prevents leaking sensitive information in URLs Details: Sends full URL for same-origin requests, only origin for cross-origin HTTPS requests, nothing for HTTP downgrades 7. Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=() Purpose: Controls which browser features and APIs can be used Protection: Disables unnecessary permissions that could be exploited Details: camera=() = no camera access microphone=() = no microphone access geolocation=() = no location tracking interest-cohort=() = disables FLoC tracking (privacy protection) 8. Content-Security-Policy (CSP) This is the most important and complex header. Let me break down each directive: default-src 'self' Default policy: only allow resources from your own domain script-src 'self' 'unsafe-eval' 'unsafe-inline' Scripts: Allow from your domain 'unsafe-eval': Allows eval() - needed for Next.js development/runtime 'unsafe-inline': Allows inline <script> tags - needed for Next.js style-src 'self' 'unsafe-inline' Styles: Allow from your domain and inline styles (needed for React/Next.js) img-src 'self' data: https: Images: Allow from your domain, data URIs (base64 images), and any HTTPS source font-src 'self' data: Fonts: Allow from your domain and data URIs connect-src 'self' API calls/WebSockets: Only allow connections to your own domain frame-ancestors 'self' Embedding: Similar to X-Frame-Options, only allow your own domain to frame your site base-uri 'self' Base tag: Prevent injection of <base> tags that could redirect relative URLs form-action 'self' Form submissions: Only allow forms to submit to your own domain ([68efb5a](https://github.com/delegateas/DataModelViewer/commit/68efb5a))
* rate limit and brute force password protection. ([6eef484](https://github.com/delegateas/DataModelViewer/commit/6eef484))
* carousel item for home page. ([4a60b3e](https://github.com/delegateas/DataModelViewer/commit/4a60b3e))
* Entra security group required authentication ([ec1f11b](https://github.com/delegateas/DataModelViewer/commit/ec1f11b))
* UI indication for slower Entra login ([373a46d](https://github.com/delegateas/DataModelViewer/commit/373a46d))
* use normal grant flow instead of baked in, in the app service. ([226faae](https://github.com/delegateas/DataModelViewer/commit/226faae))
* EntraID authentication ([c2994db](https://github.com/delegateas/DataModelViewer/commit/c2994db))

### Bug Fixes

* changed boolean to string variables in pipelines, as boolean kept breaking in odd ways. ([4c11593](https://github.com/delegateas/DataModelViewer/commit/4c11593))
* coalsace other optional params ([5ebfa31](https://github.com/delegateas/DataModelViewer/commit/5ebfa31))
* coalesce the booleans in pipeline ([4a29b83](https://github.com/delegateas/DataModelViewer/commit/4a29b83))
* Revert "Revert "fix: correct filtered relationship count shown on tab."" ([0fbb482](https://github.com/delegateas/DataModelViewer/commit/0fbb482))
* npm package version bump to remove critial and high vulnerabilities. ([e77783a](https://github.com/delegateas/DataModelViewer/commit/e77783a))
* swapped to correct env variables in auth config and pipelines ([e3721e3](https://github.com/delegateas/DataModelViewer/commit/e3721e3))
* clear Entra cookies and session on logout, like with password authentication ([88d4035](https://github.com/delegateas/DataModelViewer/commit/88d4035))
* save session when logged in with entra ([930a4c7](https://github.com/delegateas/DataModelViewer/commit/930a4c7))
* Revert "fix: correct filtered relationship count shown on tab." ([80dee42](https://github.com/delegateas/DataModelViewer/commit/80dee42))
* always redirect to loign ([275c2d0](https://github.com/delegateas/DataModelViewer/commit/275c2d0))

### Other Changes

* changed naming in pipelines for less confusion ([bb78a32](https://github.com/delegateas/DataModelViewer/commit/bb78a32))
* readme update ([f21be88](https://github.com/delegateas/DataModelViewer/commit/f21be88))
* carousel images also move with the text on home page. ([6facf7b](https://github.com/delegateas/DataModelViewer/commit/6facf7b))
* Revert "Revert "chore: eslint error fixes"" ([3481c24](https://github.com/delegateas/DataModelViewer/commit/3481c24))
* Revert "chore: eslint error fixes" ([a1f56ac](https://github.com/delegateas/DataModelViewer/commit/a1f56ac))
* Microsoft icon for AD login ([f6b7bbb](https://github.com/delegateas/DataModelViewer/commit/f6b7bbb))
* can remove server serialization. Not used clientside ([759d4d5](https://github.com/delegateas/DataModelViewer/commit/759d4d5))
* removed old unused files from root folder ([e417de3](https://github.com/delegateas/DataModelViewer/commit/e417de3))


