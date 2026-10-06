STORYLINE BLOG — ASSIGNMENT 4
================================

HOW TO RUN
----------
This project uses fetch() to load data.json and users.json, so run it through
a local web server. Do not use VS Code's normal "Run Code" button for HTML.

Recommended method:
1. Open the Assignment-4 folder in VS Code.
2. Install the "Live Server" extension if it is not already installed.
3. Right-click index.html.
4. Select "Open with Live Server".

You can also double-click index.html. The application includes fallback data
for file:// mode, but Live Server is recommended so the JSON fetch requests
work as intended.

DEMO LOGIN
----------
Email:    admin@example.com
Password: password123

FILES
-----
index.html   - Landing page showing the latest 20 posts
login.html   - Authentication page
post.html    - Full post details with edit/delete actions
create.html  - Create and edit post form
styles.css   - Shared responsive styling
app.js       - Fetch, authentication, rendering, and CRUD logic
data.json    - The 40 supplied sample posts
users.json   - Demo user credentials

FEATURES
--------
- Responsive landing page with the last 20 posts
- Live post search
- Login and logout using a localStorage authentication token
- Full post detail page
- Create, edit, and delete posts
- Custom "Are you sure?" delete confirmation
- Graceful fetch error handling
- Browser persistence using localStorage

ARRAY METHODS AND FETCH
-----------------------
- slice() and reverse() select the newest 20 posts.
- filter() powers searching and deletion.
- find() locates users and individual posts.
- map() creates cards and updates an edited post.
- reduce() calculates the next available post ID.
- fetch() loads data.json and users.json.
- POST, PUT, and DELETE fetch requests are attempted for CRUD operations.

IMPORTANT NOTE ABOUT SAVING
---------------------------
A browser cannot directly rewrite a local JSON file. Because this is a static
submission without a backend, create/edit/delete changes are saved in
localStorage. The code also attempts the required HTTP methods and is ready to
connect to a writable API. To restore the original data, clear this site's
localStorage in the browser developer tools.
