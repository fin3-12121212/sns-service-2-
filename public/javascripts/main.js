document.addEventListener("DOMContentLoaded", function() {
    console.log("JavaScript file loaded successfully.");

    function showPostForm() {
        document.getElementById('post-form').style.display = 'block';
    }

    function hidePostForm() {
        document.getElementById('post-form').style.display = 'none';
    }

    async function submitPostForm(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        console.log("Submitting post form with data:", data);

        try {
            const response = await fetch('/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('게시글이 작성되었습니다.');
                hidePostForm();
                loadPosts(data.board);
            } else {
                const error = await response.json();
                console.error("Error submitting post:", error);
                alert(`오류: ${error.message}`);
            }
        } catch (error) {
            console.error("Error submitting post:", error);
            alert(`오류: ${error.message}`);
        }
    }

    async function loadPosts(boardTitle) {
        console.log("Loading posts for board:", boardTitle);

        try {
            const response = await fetch(`/posts/board/${boardTitle}`);
            const posts = await response.json();

            if (!Array.isArray(posts)) {
                throw new Error("Expected an array of posts");
            }

            const postsList = document.getElementById('posts-list');
            postsList.innerHTML = '';

            posts.forEach(post => {
                const postItem = document.createElement('div');
                postItem.classList.add('post-item');
                postItem.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.content}</p>
                    <small>게시판: ${post.board}, 작성자: ${post.user?.username ?? 'Unknown'}, 작성일: ${new Date(post.createdAt).toLocaleDateString()}</small>
                `;
                postsList.appendChild(postItem);
            });
        } catch (error) {
            console.error("Error loading posts:", error);
        }
    }

    async function loadAllPosts() {
        console.log("Loading all posts");

        try {
            const response = await fetch(`/posts`);
            const posts = await response.json();

            if (!Array.isArray(posts)) {
                throw new Error("Expected an array of posts");
            }

            const postsList = document.getElementById('posts-list');
            postsList.innerHTML = '';

            posts.forEach(post => {
                const postItem = document.createElement('div');
                postItem.classList.add('post-item');
                postItem.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.content}</p>
                    <small>게시판: ${post.board}, 작성자: ${post.user?.username ?? 'Unknown'}, 작성일: ${new Date(post.createdAt).toLocaleDateString()}</small>
                `;
                postsList.appendChild(postItem);
            });
        } catch (error) {
            console.error("Error loading all posts:", error);
        }
    }

    function checkLogin() {
        const token = localStorage.getItem('token');
        if (token) {
            // 토큰이 있는 경우 로그인 상태로 처리
            const user = jwt_decode(token); // jwt-decode 라이브러리 사용
            document.getElementById('welcome-message').innerText = `Welcome, ${user.username}`;
            document.getElementById('comment-form-container').style.display = 'block';
            document.getElementById('register-button').style.display = 'none';
            document.getElementById('login-button').style.display = 'none';
            document.getElementById('logout-button').style.display = 'block';

            // 로그인한 사용자의 ID와 이름 표시
            const userInfo = document.getElementById('user-info');
            const userInfoText = document.createElement('span');
            userInfoText.innerText = `(${user.username}), (${user.name})`;
            userInfo.insertBefore(userInfoText, document.getElementById('logout-button'));
        } else {
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('comment-form-container').style.display = 'none';
            document.getElementById('register-button').style.display = 'block';
            document.getElementById('login-button').style.display = 'block';
            document.getElementById('logout-button').style.display = 'none';
        }
    }

    // 로그인 상태 확인
    checkLogin();

    // 함수들을 글로벌 범위로 노출
    window.showPostForm = showPostForm;
    window.hidePostForm = hidePostForm;
    window.submitPostForm = submitPostForm;
    window.loadPosts = loadPosts;

    // 이벤트 리스너 설정
    document.getElementById('home-link').addEventListener('click', () => {
        window.location.href = '/';
    });

    document.getElementById('register-button').addEventListener('click', () => {
        window.location.href = '/register.html';
    });

    document.getElementById('login-button').addEventListener('click', () => {
        window.location.href = '/login.html';
    });

    document.getElementById('logout-button').addEventListener('click', async () => {
        try {
            const response = await fetch('/users/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                localStorage.removeItem('token');
                alert('로그아웃 되었습니다.');
                window.location.href = '/';
            } else {
                const result = await response.json();
                alert('로그아웃 실패: ' + result.message);
            }
        } catch (error) {
            console.error('Error logging out:', error);
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    });

    document.querySelectorAll('.board-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const boardTitle = event.target.getAttribute('data-board');
            document.getElementById('board-title').innerText = boardTitle;
            loadPosts(boardTitle);
        });
    });

    document.getElementById('search-button').addEventListener('click', async () => {
        const query = document.getElementById('search-input').value;
        if (!query) return alert('검색어를 입력하세요.');

        const response = await fetch(`/posts/search?query=${encodeURIComponent(query)}`);
        const posts = await response.json();
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '';

        if (posts.length === 0) {
            searchResults.innerHTML = '<p>검색 결과가 없습니다.</p>';
        } else {
            posts.forEach(post => {
                const postItem = document.createElement('div');
                postItem.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.content}</p>
                    <p>게시판: ${post.board}</p>
                    <p>작성자: ${post.author}</p>
                    <p>작성일: ${new Date(post.createdAt).toLocaleString()}</p>
                `;
                searchResults.appendChild(postItem);
            });
        }
    });

    loadAllPosts(); // 모든 게시글 불러오기
});
