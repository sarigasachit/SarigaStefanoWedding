V7.4.2 MEDIA RESTORE

- Keeps localhost port 8789 so existing Creator uploads in IndexedDB remain available.
- Restores the old V7 Creator-upload media mechanism for foreground page videos.
- Title + uploaded video remain on the LEFT; body content remains on the RIGHT on narrative pages.
- If no video is uploaded, no foreground player appears.
- Kerala & Beyond and Three Days layouts are unchanged.
- Cache-bust updated to v=20mediarestore so Chrome loads the corrected JS/CSS.

IMPORTANT: close the old localhost:8789 command window/server before starting this folder, otherwise Windows may keep serving the previous folder on port 8789. Then run START_WEBSITE.bat.
