<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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

const route = useRoute();
const router = useRouter();

// --- 상태 관리 ---
const post = ref<Post | null>(null);
const isLoading = ref(true);
const errorMsg = ref('');

/**
 * 📥 게시글 상세 내역 가져오기
 */
const fetchPostDetail = async () => {
  isLoading.value = true;
  errorMsg.value = '';
  try {
    const id = route.params.id;
    const response = await fetch(`/api/posts/${id}`);
    const data = await response.json();
    
    if (data.success) {
      post.value = data.post;
    } else {
      errorMsg.value = data.error || '게시글을 찾을 수 없습니다.';
    }
  } catch (error) {
    console.error('상세 로드 오류:', error);
    errorMsg.value = '서버와의 통신 도중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
};

/**
 * 🗑️ 게시글 삭제 액션
 */
const handleDelete = async () => {
  if (!post.value) return;
  
  const isConfirmed = confirm('정말로 이 게시글을 삭제하시겠습니까?\n삭제된 내용은 복구할 수 없습니다.');
  if (!isConfirmed) return;

  try {
    const response = await fetch(`/api/posts/${post.value.id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    
    if (data.success) {
      alert('게시글이 안전하게 삭제되었습니다.');
      router.push('/');
    } else {
      alert(data.error || '삭제 중 문제가 발생했습니다.');
    }
  } catch (error) {
    console.error('삭제 처리 오류:', error);
    alert('삭제 요청 도중 서버 오류가 발생했습니다.');
  }
};

/**
 * 🗓️ 날짜 표기 형식 변환 헬퍼 (YYYY-MM-DD HH:mm:ss)
 */
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

onMounted(() => {
  fetchPostDetail();
});
</script>

<template>
  <div class="board-container">
    
    <!-- 뒤로가기 내비게이션 -->
    <div class="nav-back-zone">
      <router-link to="/" class="btn-back">
        <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        게시판 목록으로 돌아가기
      </router-link>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-state glass-card">
      <div class="spinner"></div>
      <p>게시글 내용을 불러오고 있습니다...</p>
    </div>

    <!-- 에러 에러 상태 -->
    <div v-else-if="errorMsg" class="error-state glass-card">
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <h3>오류가 발생했습니다</h3>
      <p>{{ errorMsg }}</p>
      <router-link to="/" class="btn btn-secondary btn-sm" style="margin-top: 16px;">
        목록으로 이동
      </router-link>
    </div>

    <!-- 📖 게시글 상세 내용 렌더링 영역 (잡지 레이아웃) -->
    <article v-else-if="post" class="glass-card detail-card">
      
      <!-- 상세 머리글 정보 -->
      <header class="detail-header">
        <div class="detail-category-zone">
          <span class="category-badge" :class="post.category">{{ post.category || '일반' }}</span>
        </div>
        
        <h2 class="detail-title gradient-text">{{ post.title }}</h2>
        
        <!-- 실버 칩 메타데이터 배지 리스트 -->
        <div class="detail-meta-row">
          <div class="meta-item">
            <span class="meta-label">작성자</span>
            <span class="meta-value">{{ post.author }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">등록일</span>
            <span class="meta-value">{{ formatDate(post.createdAt) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">조회수</span>
            <span class="meta-value highlight">{{ post.views }}</span>
          </div>
        </div>
      </header>

      <!-- 본문 영역 (시원한 라인 하이트 및 서체 튜닝) -->
      <section class="detail-body-content">
        <p class="body-text">{{ post.content }}</p>
      </section>

      <!-- 액션 제어 버튼 존 (목록, 수정, 삭제) -->
      <footer class="detail-footer-actions">
        <router-link to="/" class="btn btn-secondary">
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          목록
        </router-link>
        
        <div class="edit-delete-group">
          <router-link :to="`/write/${post.id}`" class="btn btn-primary btn-edit-neon">
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/>
            </svg>
            수정
          </router-link>
          
          <button @click="handleDelete" class="btn btn-danger btn-delete-neon">
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            삭제
          </button>
        </div>
      </footer>

    </article>
  </div>
</template>

<style scoped>
/* 뒤로가기 존 */
.nav-back-zone {
  margin-bottom: 20px;
}

.btn-back {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: var(--transition-smooth);
}

.btn-back:hover {
  color: var(--accent-blue);
  transform: translateX(-4px);
}

.back-icon {
  width: 16px;
  height: 16px;
}

/* 카드 세부 튜닝 */
.detail-card {
  padding: 50px;
}

/* 상세 머리글 */
.detail-header {
  border-bottom: 1px solid var(--border-glass);
  padding-bottom: 28px;
  margin-bottom: 32px;
}

.detail-category-zone {
  margin-bottom: 12px;
}

/* 카테고리 배지 */
.category-badge {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: hsla(224, 100%, 65%, 0.15);
  color: var(--accent-blue);
  border: 1px solid hsla(224, 100%, 65%, 0.2);
}

.category-badge.공지사항 {
  background: hsla(263, 90%, 65%, 0.15);
  color: var(--accent-purple);
  border-color: hsla(263, 90%, 65%, 0.2);
}

.category-badge.기술팁 {
  background: hsla(150, 80%, 55%, 0.15);
  color: var(--accent-emerald);
  border-color: hsla(150, 80%, 55%, 0.2);
}

.detail-title {
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1.25;
  margin-bottom: 24px;
  word-break: break-all;
}

/* 실버 메타 칩 */
.detail-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  background: hsla(0, 0%, 100%, 0.04);
  border: 1px solid var(--border-glass);
  padding: 6px 14px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.meta-label {
  color: var(--text-muted);
  font-weight: 500;
}

.meta-value {
  color: var(--text-secondary);
  font-weight: 600;
}

.meta-value.highlight {
  color: var(--accent-emerald);
}

/* 본문 */
.detail-body-content {
  padding: 10px 0 40px 0;
  min-height: 250px;
}

.body-text {
  font-size: 1.08rem;
  line-height: 1.8;
  color: hsla(210, 40%, 98%, 0.9);
  white-space: pre-wrap;
  word-break: break-all;
}

/* 액션 제어 */
.detail-footer-actions {
  border-top: 1px solid var(--border-glass);
  padding-top: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-delete-group {
  display: flex;
  gap: 12px;
}

.action-icon {
  width: 16px;
  height: 16px;
}

/* 수정/삭제 버튼 햅틱 바이브 효과 */
.btn-edit-neon:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.45);
}

.btn-delete-neon:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 4px 15px rgba(244, 63, 94, 0.4);
}

/* 로딩/에러 */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-glass);
  border-top-color: var(--accent-blue);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.error-icon {
  width: 56px;
  height: 56px;
  color: var(--accent-rose);
}

.error-state h3 {
  font-size: 1.4rem;
  color: var(--text-primary);
}

.error-state p {
  color: var(--text-secondary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
