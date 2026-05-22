<script setup lang="ts">
import { useRouter } from 'vue-router';

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

// 📦 부모 컴포넌트로부터 전달받을 props 설정
const props = defineProps<{
  post: Post;
}>();

const router = useRouter();

/**
 * 🔗 개별 행 클릭 시 상세 페이지로 이동
 */
const navigateToDetail = () => {
  router.push(`/post/${props.post.id}`);
};

/**
 * 🗓️ 날짜 표기 형식 변환 헬퍼 (YYYY-MM-DD HH:mm)
 */
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
</script>

<template>
  <!-- 얇은 카드 형태로 디자인된 개별 게시글 행 -->
  <div class="board-row-card" @click="navigateToDetail">
    <div class="row-header">
      <span class="row-category-badge" :class="post.category">{{ post.category || '일반' }}</span>
      <span class="row-views-badge">
        <svg class="views-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        {{ post.views }}
      </span>
    </div>
    
    <h3 class="row-title">{{ post.title }}</h3>
    
    <div class="row-meta">
      <span class="meta-author">
        <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        {{ post.author }}
      </span>
      <span class="meta-date">
        <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {{ formatDate(post.createdAt) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
/* 개별 게시글 카드 스타일링 */
.board-row-card {
  background: hsla(222, 20%, 12%, 0.4);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 24px;
  cursor: pointer;
  transition: var(--transition-smooth);
  position: relative;
  overflow: hidden;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 카드 호버 시 햅틱 피드백 및 네온 아우터 글로우 활성화 */
.board-row-card:hover {
  transform: translateY(-2px);
  background: hsla(222, 20%, 12%, 0.7);
  border-color: hsla(263, 90%, 65%, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2), 0 0 15px hsla(263, 90%, 65%, 0.1);
}

.board-row-card:active {
  transform: translateY(0) scale(0.98);
}

/* 카드 헤더 정보 */
.row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 카테고리 배지 */
.row-category-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: hsla(224, 100%, 65%, 0.15);
  color: var(--accent-blue);
  border: 1px solid hsla(224, 100%, 65%, 0.2);
}

/* 카테고리별 테마 변경 */
.row-category-badge.공지사항 {
  background: hsla(263, 90%, 65%, 0.15);
  color: var(--accent-purple);
  border-color: hsla(263, 90%, 65%, 0.2);
}

.row-category-badge.기술팁 {
  background: hsla(150, 80%, 55%, 0.15);
  color: var(--accent-emerald);
  border-color: hsla(150, 80%, 55%, 0.2);
}

/* 조회수 배지 */
.row-views-badge {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.views-icon {
  width: 14px;
  height: 14px;
}

/* 제목 */
.row-title {
  font-size: 1.15rem;
  color: var(--text-primary);
  font-weight: 600;
  line-height: 1.4;
  word-break: break-all;
}

/* 작성자, 일자 정보 */
.row-meta {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.meta-author, .meta-date {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  width: 13px;
  height: 13px;
  color: var(--text-muted);
}
</style>
