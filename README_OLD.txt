SARIGA & STEFANO — READER + CREATOR WEBSITE

Guest mode: index.html
Creator mode: creator.html
Prototype creator password: saggu-stefano

Creator Mode can edit all current text fields, add unlimited agenda items, delete items, and reorder items.
It can save a draft in your browser and export an updated content.json.

IMPORTANT SECURITY NOTE
The password in this static prototype is only a convenience lock and can be discovered by someone inspecting creator.js.
For a truly secure online Creator Mode, connect creator.html to real authentication and storage when we choose hosting (for example Netlify Identity/CMS, Supabase, or Firebase).

PUBLISHING CHANGES IN THIS PROTOTYPE
1. Open creator.html through a local server or host.
2. Edit and click Export content.json.
3. Replace the website's old content.json with the exported file.
4. Upload/publish. Guests using index.html cannot edit the site.

LOCAL PREVIEW
Because browsers often block fetch() from file://, open the folder through a local server.
Example: python -m http.server 8000
then visit http://localhost:8000
Python here is only a local server, not part of the website.
