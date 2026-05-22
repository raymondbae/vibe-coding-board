<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BoardRow from '../components/BoardRow.vue';

// 게시글 데이터 타입 인터페이스 정의
interface Post {
  id: number;
  title: string;
  author: string;
  content: string;
  category?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// 페이징 메타데이터 인터페이스
interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const router = useRouter();
const route = useRoute();

// --- 상태 관리 ---
const posts = ref<Post[]>([]);
const pagination = ref<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
const searchInput = ref(''); // 입력창 텍스트
const activeSearch = ref(''); // 실제 검색 쿼리
const isLoading = ref(true);

/**
 * 📥 백엔드 API로부터 게시글 데이터 가져오기
 */
const fetchPosts = async (page = 1) => {
  isLoading.value = true;
  try {
    const url = new URL('/api/posts', window.location.origin);
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', '8'); // 한 페이지당 8개씩 노출
    
    if (activeSearch.value) {
      url.searchParams.append('search', activeSearch.value);
    }

    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.success) {
      posts.value = data.posts;
      pagination.value = data.pagination;
    }
  } catch (error) {
    console.error('게시글 로드 오류:', error);
  } finally {
    isLoading.value = false;
  }
};

/**
 * 🔍 검색 실행
 */
const handleSearch = () => {
  activeSearch.value = searchInput.value;
  // URL 쿼리 파라미터 업데이트
  router.push({ path: '/', query: { page: '1', search: searchInput.value } });
};

/**
 * 📄 페이지 변경 핸들러
 */
const changePage = (targetPage: number) => {
  if (targetPage < 1 || targetPage > pagination.value.totalPages) return;
  router.push({
    path: '/',
    query: { ...route.query, page: String(targetPage) }
  });
};

// URL 쿼리가 바뀔 때마다 데이터를 연동시키는 반응형 와처 구성
watch(
  () => route.query,
  (newQuery) => {
    const page = parseInt(newQuery.page as string) || 1;
    const search = (newQuery.search as string) || '';
    searchInput.value = search;
    activeSearch.value = search;
    fetchPosts(page);
  },
  { immediate: true }
);

onMounted(() => {
  // watch(immediate: true) 옵션으로 인해 마운트 시 데이터와 URL 쿼리 상태가 자동 동기화됩니다.
});
</script>

<template>
  <div class="board-container">
    <!-- 서비스 로고 헤더 영역 -->
    <header class="board-header">
      <div class="header-main">
        <h1 class="logo gradient-text">Premium Vibe Board</h1>
        <p class="subtitle">Google Antigravity & Vue 3가 선사하는 고품격 스마트 게시판</p>
      </div>
      <router-link to="/write" class="btn btn-primary btn-write-action">
        <svg class="write-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        새 글 작성
      </router-link>
    </header>

    <!-- 메인 카드 컨테이너 -->
    <main class="glass-card list-card">
      
      <!-- 검색 필터 존 -->
      <section class="filter-zone">
        <div class="search-bar-wrapper">
          <input 
            type="text" 
            v-model="searchInput" 
            @keydown.enter="handleSearch"
            placeholder="제목이나 내용으로 검색해보세요..." 
            class="search-input"
          />
          <button @click="handleSearch" class="btn btn-search">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
      </section>

      <!-- 로딩 인디케이터 스피너 -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>서버리스 함수로부터 데이터를 불러오는 중...</p>
      </div>

      <!-- 게시글 목록 렌더링 영역 -->
      <div v-else class="posts-list-wrapper">
        <div v-if="posts.length > 0" class="posts-rows">
          <BoardRow 
            v-for="post in posts" 
            :key="post.id" 
            :post="post" 
          />
        </div>
        
        <!-- 검색 결과 등이 없는 빈 상태(Empty State) -->
        <div v-else class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <h3>등록된 게시글이 없습니다.</h3>
          <p>첫 번째 글의 주인공이 되어보세요!</p>
          <router-link to="/write" class="btn btn-secondary btn-sm" style="margin-top: 16px;">
            첫 글 작성하기
          </router-link>
        </div>
      </div>

      <!-- 페이징 내비게이션 존 -->
      <nav v-if="!isLoading && pagination.totalPages > 1" class="pagination-nav">
        <!-- 이전 페이지 버튼 -->
        <button 
          @click="changePage(pagination.page - 1)" 
          :disabled="pagination.page === 1" 
          class="btn-page btn-page-arrow"
        >
          &lt;
        </button>

        <!-- 페이지 번호 글래스 칩 리스트 -->
        <button 
          v-for="pageNum in pagination.totalPages" 
          :key="pageNum" 
          @click="changePage(pageNum)" 
          class="btn-page"
          :class="{ active: pageNum === pagination.page }"
        >
          {{ pageNum }}
        </button>

        <!-- 다음 페이지 버튼 -->
        <button 
          @click="changePage(pagination.page + 1)" 
          :disabled="pagination.page === pagination.totalPages" 
          class="btn-page btn-page-arrow"
        >
          &gt;
        </button>
      </nav>

    </main>
  </div>
</template>

<style scoped>
/* 헤더 전체 */
.board-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.header-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.logo {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.1;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.btn-write-action {
  height: 46px;
}

.write-icon {
  width: 18px;
  height: 18px;
}

/* 카드 크기 조율 */
.list-card {
  padding: 30px;
}

/* 필터 영역 */
.filter-zone {
  margin-bottom: 24px;
}

/* 검색창 포커스 애니메이션 */
.search-bar-wrapper {
  display: flex;
  position: relative;
  border-radius: var(--radius-md);
  background: hsla(222, 20%, 12%, 0.4);
  border: 1px solid var(--border-glass);
  padding: 4px 6px;
  transition: var(--transition-smooth);
}

.search-bar-wrapper:focus-within {
  border-color: transparent;
  background: hsla(222, 20%, 12%, 0.7);
  box-shadow: 0 0 0 1px var(--accent-blue), 0 0 15px hsla(224, 100%, 65%, 0.15);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 14px;
  color: var(--text-primary);
  font-size: 0.95rem;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.btn-search {
  background: transparent;
  color: var(--text-secondary);
  padding: 8px 12px;
}

.btn-search:hover {
  color: var(--accent-blue);
  transform: scale(1.1);
}

.search-icon {
  width: 16px;
  height: 16px;
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-glass);
  border-top-color: var(--accent-blue);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 빈 목록 상태 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.empty-state p {
  font-size: 0.9rem;
}

/* 페이징 내비게이션 */
.pagination-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
}

.btn-page {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--border-glass);
  background: hsla(0, 0%, 100%, 0.03);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.btn-page:hover:not(:disabled) {
  border-color: var(--accent-blue);
  color: var(--accent-blue);
  background: hsla(224, 100%, 65%, 0.05);
}

.btn-page.active {
  background: var(--gradient-accent);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 0 12px hsla(224, 100%, 65%, 0.35);
}

.btn-page:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-page-arrow {
  font-weight: bold;
}
</style>
