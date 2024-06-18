// 랜덤 색상 생성 함수
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// 페이지 로드 시 랜덤 색상 설정
document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const randomColor = getRandomColor();
    header.style.backgroundColor = randomColor;

    loadAllPosts(); // 모든 게시글 불러오기
});

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
    const response = await fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (response.ok) {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    } else {
        const result = await response.json();
        alert('로그아웃 실패: ' + result.message);
    }
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

document.querySelectorAll('.board-list a').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const boardTitle = event.target.getAttribute('data-board');
        document.getElementById('board-title').innerText = boardTitle;
        loadPosts(boardTitle);

        // 랜덤 색상 변경
        const header = document.getElementById('header');
        const randomColor = getRandomColor();
        header.style.backgroundColor = randomColor;
    });
});

async function loadPosts(boardTitle) {
    const response = await fetch(`/posts/board/${boardTitle}`);
    const posts = await response.json();
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '';

    posts.forEach(post => {
        const postItem = document.createElement('li');
        postItem.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <p>게시판: ${post.board}</p>
            <p>작성자: ${post.author}</p>
            <p>작성일: ${new Date(post.createdAt).toLocaleString()}</p>
        `;
        postsList.appendChild(postItem);
    });
}

async function loadAllPosts() {
    const response = await fetch(`/posts`);
    const posts = await response.json();
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '';

    posts.forEach(post => {
        const postItem = document.createElement('li');
        postItem.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <p>게시판: ${post.board}</p>
            <p>작성자: ${post.author}</p>
            <p>작성일: ${new Date(post.createdAt).toLocaleString()}</p>
        `;
        postsList.appendChild(postItem);
    });
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

        // 로그인한 사용자의 ID와 이름 표시
        const userInfo = document.getElementById('user-info');
        const userInfoText = document.createElement('span');
        userInfoText.innerText = `(${user.username}), (${user.name})`;
        userInfo.insertBefore(userInfoText, document.getElementById('logout-button'));
    } else {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('comment-form-container').style.display = 'none';
    }
}

// 로그인 상태 확인
checkLogin();
