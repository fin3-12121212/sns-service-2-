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

        console.log("Submitting post form with data:", formData);

        try {
            const response = await fetch('/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                alert('게시글이 작성되었습니다.');
                hidePostForm();
                loadPosts(formData.get('board'));
            } else {
                const error = await response.text();
                console.error("Error submitting post:", error);
                try {
                    const jsonError = JSON.parse(error);
                    if (jsonError.message === 'Token expired') {
                        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                        window.location.href = '/login.html';
                    } else {
                        alert(`오류: ${jsonError.message}`);
                    }
                } catch (e) {
                    alert(`오류: ${error}`);
                }
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
                    ${post.image ? `<img src="/${post.image}" alt="Post image">` : ''}
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
                    ${post.image ? `<img src="/${post.image}" alt="Post image">` : ''}
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

            // 로그인한 사용자의 ID와 이름 표시 대신 로그아웃 버튼만 보이도록 변경
            const userInfoText = document.getElementById('user-info-text');
            if (userInfoText) {
                userInfoText.remove();
            }
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

        try {
            console.log('Sending search request for query:', query); // 로그 추가
            const response = await fetch(`/posts/search?query=${encodeURIComponent(query)}`);
            console.log('Search response status:', response.status); // 응답 상태 로그

            if (!response.ok) {
                throw new Error('Failed to search posts');
            }
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
                        <p>작성자: ${post.user?.username ?? 'Unknown'}</p>
                        <p>작성일: ${new Date(post.createdAt).toLocaleString()}</p>
                    `;
                    searchResults.appendChild(postItem);
                });
            }
        } catch (error) {
            console.error('Error searching posts:', error);
            alert('게시글 검색 중 오류가 발생했습니다.');
        }
    });

    loadAllPosts(); // 모든 게시글 불러오기
});
