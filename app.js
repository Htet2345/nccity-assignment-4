/*
  Storyline — Assignment 4
  ---------------------------------------
  - fetch() retrieves posts and login data from local JSON files.
  - map(), filter(), find(), slice() and reduce() manipulate the post data.
  - localStorage keeps authentication and CRUD changes between page loads.

  A static browser cannot rewrite data.json. POST/PUT/DELETE requests are still
  attempted for the assignment requirement; localStorage is the graceful
  client-side fallback when no writable API server is available.
*/

(() => {
  'use strict';

  const KEYS = {
    posts: 'storyline_posts',
    auth: 'storyline_auth'
  };

  const demoUsers = [
    { id: 1, name: 'Admin', email: 'admin@example.com', password: 'password123' }
  ];

  const authors = [
    'Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Harry',
    'Ivy', 'Jack', 'Katie', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter',
    'Quinn', 'Riley', 'Sophia', 'Thomas'
  ];

  const sampleContent = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  ];

  // This fallback lets the pages still open by double-clicking when browsers
  // block fetch() for file:// URLs. A local server will use data.json instead.
  const fallbackPosts = Array.from({ length: 40 }, (_, index) => {
    const id = index + 1;
    const dayOffset = Math.floor(index / 20);
    const hour = 10 + (index % 20);
    return {
      id,
      title: `Item ${id}`,
      image_url: 'https://via.placeholder.com/150',
      content: sampleContent[index % sampleContent.length],
      created_at: new Date(Date.UTC(2023, 8, 29 + dayOffset, hour)).toISOString(),
      created_by: authors[index % authors.length]
    };
  });

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Storage is unavailable:', error);
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('Could not save data:', error);
      return false;
    }
  }

  function removeStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Could not clear stored data:', error);
    }
  }

  async function loadPosts() {
    const saved = readStorage(KEYS.posts);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (error) {
        console.warn('Stored posts were invalid. Loading data.json instead.', error);
      }
    }

    try {
      const response = await fetch('data.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const posts = await response.json();
      if (!Array.isArray(posts)) throw new Error('data.json did not contain an array');
      writeStorage(KEYS.posts, JSON.stringify(posts));
      return posts;
    } catch (error) {
      console.warn('Could not fetch data.json; using the built-in fallback.', error);
      return fallbackPosts.map(post => ({ ...post }));
    }
  }

  function savePosts(posts) {
    writeStorage(KEYS.posts, JSON.stringify(posts));
  }

  async function requestMutation(method, payload) {
    try {
      const response = await fetch('data.json', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`The server returned ${response.status}`);
      return { synced: true };
    } catch (error) {
      // Live Server and other static servers cannot write JSON. The operation
      // has already been saved locally, so the app remains fully functional.
      console.info(`${method} was saved locally because no writable API is connected.`, error.message);
      return { synced: false, error };
    }
  }

  function getAuth() {
    const saved = readStorage(KEYS.auth);
    if (!saved) return null;
    try {
      const auth = JSON.parse(saved);
      return auth && auth.token ? auth : null;
    } catch {
      return null;
    }
  }

  function setAuth(user) {
    const tokenSource = `${user.email}:${Date.now()}`;
    const token = btoa(tokenSource);
    writeStorage(KEYS.auth, JSON.stringify({ token, user: { id: user.id, name: user.name, email: user.email } }));
  }

  function logout() {
    removeStorage(KEYS.auth);
    window.location.href = 'index.html';
  }

  function renderNavigation() {
    const container = document.getElementById('navActions');
    if (!container) return;

    const auth = getAuth();
    if (auth) {
      container.innerHTML = `
        <a class="nav-link" href="index.html">Posts</a>
        <a class="nav-button" href="create.html">+ Create post</a>
        <button class="logout-button" id="logoutButton" type="button">Logout</button>
      `;
      document.getElementById('logoutButton').addEventListener('click', logout);
    } else {
      container.innerHTML = '<a class="nav-button" href="login.html">Login</a>';
    }
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return new Intl.DateTimeFormat('en', {
      year: 'numeric', month: 'short', day: 'numeric'
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function makeCover(post) {
    const palettes = [
      ['#285943', '#e0a638'], ['#263f63', '#d88955'], ['#6f3949', '#efbc78'],
      ['#315d67', '#95c5b1'], ['#614c79', '#e3a85b']
    ];
    const [start, end] = palettes[Math.abs(Number(post.id) || 0) % palettes.length];
    const title = escapeHtml(post.title || 'Story').slice(0, 24);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${start}"/><stop offset="1" stop-color="${end}"/></linearGradient></defs>
      <rect width="900" height="560" fill="url(#g)"/><circle cx="740" cy="90" r="180" fill="white" opacity=".08"/><circle cx="160" cy="500" r="230" fill="white" opacity=".07"/>
      <text x="55" y="475" fill="white" font-size="54" font-family="Georgia" font-weight="bold">${title}</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function coverFor(post) {
    const url = String(post.image_url || '').trim();
    return !url || url.includes('via.placeholder.com') ? makeCover(post) : url;
  }

  function createPostCard(post) {
    const article = document.createElement('article');
    article.className = 'post-card';
    const detailUrl = `post.html?id=${encodeURIComponent(post.id)}`;
    article.innerHTML = `
      <a class="post-cover-link" href="${detailUrl}" aria-label="Read ${escapeHtml(post.title)}">
        <img class="post-cover" src="${escapeHtml(coverFor(post))}" alt="">
      </a>
      <div class="post-card-body">
        <span class="post-number">Story ${escapeHtml(post.id)}</span>
        <h3><a href="${detailUrl}">${escapeHtml(post.title)}</a></h3>
        <p class="post-excerpt">${escapeHtml(post.content)}</p>
        <div class="post-meta">
          <span class="post-author">${escapeHtml(post.created_by)}</span>
          <time datetime="${escapeHtml(post.created_at)}">${formatDate(post.created_at)}</time>
        </div>
      </div>
    `;

    const image = article.querySelector('img');
    image.addEventListener('error', () => {
      image.src = makeCover(post);
    }, { once: true });
    return article;
  }

  async function initHome() {
    const status = document.getElementById('pageStatus');
    const grid = document.getElementById('postGrid');
    const search = document.getElementById('postSearch');
    const allPosts = await loadPosts();

    // slice() gets the final 20 posts and reverse() presents newest first.
    const latestPosts = allPosts.slice(-20).reverse();

    function render(query = '') {
      const normalized = query.trim().toLowerCase();
      // filter() performs the live title/content/author search.
      const visible = latestPosts.filter(post =>
        [post.title, post.content, post.created_by]
          .some(value => String(value).toLowerCase().includes(normalized))
      );

      grid.innerHTML = '';
      status.textContent = '';
      if (!visible.length) {
        grid.innerHTML = '<div class="empty-state"><h3>No stories found</h3><p>Try a different search phrase.</p></div>';
        return;
      }

      // map() converts each post object to a DOM card.
      visible.map(createPostCard).forEach(card => grid.appendChild(card));
    }

    search.addEventListener('input', event => render(event.target.value));
    render();
  }

  async function initLogin() {
    if (getAuth()) {
      window.location.replace('index.html');
      return;
    }

    const form = document.getElementById('loginForm');
    const errorBox = document.getElementById('loginError');
    const button = document.getElementById('loginButton');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    form.addEventListener('submit', async event => {
      event.preventDefault();
      errorBox.textContent = '';
      button.disabled = true;
      button.textContent = 'Checking…';

      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;

      try {
        let users;
        try {
          const response = await fetch('users.json', { cache: 'no-store' });
          if (!response.ok) throw new Error(`Login request failed (${response.status})`);
          users = await response.json();
        } catch (requestError) {
          console.warn('Using demo login because users.json could not be fetched.', requestError);
          users = demoUsers;
        }

        // find() selects the user whose credentials match the form.
        const user = users.find(candidate =>
          candidate.email.toLowerCase() === email && candidate.password === password
        );

        if (!user) throw new Error('The email or password is incorrect.');
        setAuth(user);

        const requested = new URLSearchParams(window.location.search).get('next');
        const safeNext = requested && /^[a-z0-9._?=&-]+\.html(?:\?.*)?$/i.test(requested)
          ? requested
          : 'index.html';
        window.location.href = safeNext;
      } catch (error) {
        errorBox.textContent = error.message || 'Unable to log in. Please try again.';
        button.disabled = false;
        button.textContent = 'Log in';
      }
    });
  }

  async function initPost() {
    const status = document.getElementById('pageStatus');
    const article = document.getElementById('postDetail');
    const id = Number(new URLSearchParams(window.location.search).get('id'));
    const posts = await loadPosts();

    // find() locates the requested detail record.
    const post = posts.find(item => Number(item.id) === id);
    if (!post) {
      status.innerHTML = '<h2>Post not found</h2><p>The requested story may have been deleted.</p>';
      return;
    }

    status.textContent = '';
    document.title = `${post.title} | Storyline`;
    const auth = getAuth();
    article.innerHTML = `
      <header class="detail-header">
        <p class="eyebrow">Story ${escapeHtml(post.id)}</p>
        <h1>${escapeHtml(post.title)}</h1>
        <div class="detail-meta">
          <strong>${escapeHtml(post.created_by)}</strong><span>·</span>
          <time datetime="${escapeHtml(post.created_at)}">${formatDate(post.created_at)}</time>
        </div>
      </header>
      <img class="detail-cover" src="${escapeHtml(coverFor(post))}" alt="Cover for ${escapeHtml(post.title)}">
      <div class="detail-content">${escapeHtml(post.content)}</div>
      ${auth ? `
        <div class="detail-actions">
          <a class="button button-secondary" href="create.html?id=${encodeURIComponent(post.id)}">Edit post</a>
          <button class="button button-danger" id="deletePost" type="button">Delete post</button>
        </div>
      ` : '<p class="owner-note"><a href="login.html">Log in</a> to edit or delete this post.</p>'}
    `;

    const cover = article.querySelector('.detail-cover');
    cover.addEventListener('error', () => { cover.src = makeCover(post); }, { once: true });

    if (!auth) return;
    const modal = document.getElementById('deleteModal');
    const openDelete = document.getElementById('deletePost');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');

    function setModal(open) {
      modal.classList.toggle('open', open);
      modal.setAttribute('aria-hidden', String(!open));
    }

    openDelete.addEventListener('click', () => setModal(true));
    cancelDelete.addEventListener('click', () => setModal(false));
    modal.addEventListener('click', event => {
      if (event.target === modal) setModal(false);
    });

    confirmDelete.addEventListener('click', async () => {
      confirmDelete.disabled = true;
      confirmDelete.textContent = 'Deleting…';
      // filter() removes the selected object without mutating the original array.
      const updatedPosts = posts.filter(item => Number(item.id) !== id);
      savePosts(updatedPosts);
      await requestMutation('DELETE', { id });
      window.location.href = 'index.html';
    });
  }

  function requireLogin() {
    if (getAuth()) return true;
    const current = `${location.pathname.split('/').pop()}${location.search}`;
    window.location.replace(`login.html?next=${encodeURIComponent(current)}`);
    return false;
  }

  function showFieldError(input, output, message) {
    input.closest('.form-field').classList.toggle('invalid', Boolean(message));
    output.textContent = message;
  }

  async function initEditor() {
    if (!requireLogin()) return;

    const form = document.getElementById('postForm');
    const saveButton = document.getElementById('savePost');
    const generalError = document.getElementById('editorError');
    const titleInput = document.getElementById('title');
    const imageInput = document.getElementById('imageUrl');
    const authorInput = document.getElementById('author');
    const contentInput = document.getElementById('content');
    const params = new URLSearchParams(window.location.search);
    const editId = Number(params.get('id'));
    let posts = await loadPosts();
    let existing = null;

    if (editId) {
      // find() retrieves the existing post for editing.
      existing = posts.find(post => Number(post.id) === editId);
      if (!existing) {
        generalError.textContent = 'That post could not be found.';
        saveButton.disabled = true;
        return;
      }
      document.title = `Edit ${existing.title} | Storyline`;
      document.getElementById('editorEyebrow').textContent = 'Update story';
      document.getElementById('editorTitle').textContent = 'Edit post';
      saveButton.textContent = 'Save changes';
      document.getElementById('editorBack').href = `post.html?id=${encodeURIComponent(editId)}`;
      titleInput.value = existing.title;
      imageInput.value = existing.image_url || '';
      authorInput.value = existing.created_by;
      contentInput.value = existing.content;
    }

    form.addEventListener('submit', async event => {
      event.preventDefault();
      generalError.textContent = '';
      const title = titleInput.value.trim();
      const author = authorInput.value.trim();
      const content = contentInput.value.trim();

      showFieldError(titleInput, document.getElementById('titleError'), title ? '' : 'Please enter a post title.');
      showFieldError(authorInput, document.getElementById('authorError'), author ? '' : 'Please enter an author name.');
      showFieldError(contentInput, document.getElementById('contentError'), content.length >= 20 ? '' : 'Content must contain at least 20 characters.');
      if (!title || !author || content.length < 20) return;

      saveButton.disabled = true;
      saveButton.textContent = existing ? 'Saving…' : 'Publishing…';

      try {
        if (existing) {
          const updatedPost = {
            ...existing,
            title,
            image_url: imageInput.value.trim(),
            content,
            created_by: author
          };
          // map() replaces only the edited post in the array.
          posts = posts.map(post => Number(post.id) === editId ? updatedPost : post);
          savePosts(posts);
          await requestMutation('PUT', updatedPost);
          window.location.href = `post.html?id=${encodeURIComponent(editId)}`;
        } else {
          // reduce() safely finds the greatest ID before creating a new one.
          const nextId = posts.reduce((maximum, post) => Math.max(maximum, Number(post.id) || 0), 0) + 1;
          const newPost = {
            id: nextId,
            title,
            image_url: imageInput.value.trim(),
            content,
            created_at: new Date().toISOString(),
            created_by: author
          };
          posts = [...posts, newPost];
          savePosts(posts);
          await requestMutation('POST', newPost);
          window.location.href = `post.html?id=${encodeURIComponent(nextId)}`;
        }
      } catch (error) {
        generalError.textContent = 'The post could not be saved. Please try again.';
        saveButton.disabled = false;
        saveButton.textContent = existing ? 'Save changes' : 'Publish post';
      }
    });
  }

  async function start() {
    renderNavigation();
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    const page = document.body.dataset.page;
    if (page === 'home') await initHome();
    if (page === 'login') await initLogin();
    if (page === 'post') await initPost();
    if (page === 'editor') await initEditor();
  }

  start().catch(error => {
    console.error('Application error:', error);
    const status = document.getElementById('pageStatus');
    if (status) status.textContent = 'Something went wrong. Please refresh the page.';
  });
})();
