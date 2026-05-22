<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// --- 상태 관리 ---
const isEditMode = ref(false);
const isLoading = ref(false);
const isSubmitting = ref(false);

const form = ref({
  title: '',
  author: '',
  content: '',
  category: '일반'
});

/**
 * 📥 수정 모드일 때 기존 데이터 불러오기
 */
const fetchPostForEdit = async () => {
  const id = route.params.id;
  if (!id) return;
  
  isLoading.value = true;
  try {
    const response = await fetch(`/api/posts/${id}`);
    const data = await response.json();
    
    if (data.success) {
      form.value = {
        title: data.post.title,
        author: data.post.author,
        content: data.post.content,
        category: data.post.category || '일반'
      };
    } else {
      alert('수정할 게시글을 불러오지 못했습니다: ' + data.error);
      router.push('/');
    }
  } catch (error) {
    console.error('데이터 바인딩 오류:', error);
    alert('서버와 통신하는 중 문제가 발생했습니다.');
    router.push('/');
  } finally {
    isLoading.value = false;
  }
};

/**
 * 💾 폼 전송 (저장 / 수정) 처리
 */
const handleSubmit = async () => {
  // 1. 유효성 검사
  if (!form.value.title.trim()) {
    alert('제목을 입력해 주세요.');
    return;
  }
  if (!form.value.author.trim()) {
    alert('작성자를 입력해 주세요.');
    return;
  }
  if (!form.value.content.trim()) {
    alert('내용을 입력해 주세요.');
    return;
  }

  isSubmitting.value = true;
  
  try {
    const method = isEditMode.value ? 'PUT' : 'POST';
    const endpoint = isEditMode.value ? `/api/posts/${route.params.id}` : '/api/posts';
    
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(isEditMode.value ? '게시글이 정상적으로 수정되었습니다.' : '새 게시글이 성공적으로 등록되었습니다.');
      // 상세 페이지로 이동 (신규 등록이면 반환된 id, 수정이면 현재 route id)
      const targetId = isEditMode.value ? route.params.id : data.id;
      router.push(`/post/${targetId}`);
    } else {
      alert(data.error || '저장에 실패했습니다.');
    }
  } catch (error) {
    console.error('폼 제출 오류:', error);
    alert('게시글 저장 도중 서버 측 오류가 발생했습니다.');
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * 🔙 취소 클릭 시 이전 화면으로 리다이렉션
 */
const handleCancel = () => {
  if (confirm('작성 중인 내용이 저장되지 않을 수 있습니다.\n정말로 취소하시겠습니까?')) {
    if (isEditMode.value) {
      router.push(`/post/${route.params.id}`);
    } else {
      router.push('/');
    }
  }
};

onMounted(() => {
  // 라우터 경로에 id가 포착되면 수정 모드로 동적 전환
  if (route.params.id) {
    isEditMode.value = true;
    fetchPostForEdit();
  }
});
</script>

<template>
  <div class="board-container">
    
    <!-- 뒤로가기 링크 -->
    <div class="nav-back-zone">
      <button @click="handleCancel" class="btn-back">
        <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        이전으로 돌아가기
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-state glass-card">
      <div class="spinner"></div>
      <p>기존 게시글 데이터를 불러오고 있습니다...</p>
    </div>

    <!-- ✍️ 글쓰기/글수정 입력 폼 영역 -->
    <main v-else class="glass-card form-card">
      <header class="form-header">
        <h2 class="gradient-text">{{ isEditMode ? '게시글 수정하기' : '새로운 이야기 작성' }}</h2>
        <p class="form-subtitle">생각을 자유롭게 남기고 공유해 보세요.</p>
      </header>

      <form @submit.prevent="handleSubmit" class="board-form">
        
        <div class="form-row-grid">
          <!-- 카테고리 필드 -->
          <div class="form-group">
            <label class="form-label">카테고리</label>
            <select v-model="form.category" class="form-select">
              <option value="일반">일반</option>
              <option value="공지사항">공지사항</option>
              <option value="기술팁">기술팁</option>
              <option value="자유">자유</option>
            </select>
          </div>

          <!-- 작성자 필드 (수정 시에는 읽기 전용) -->
          <div class="form-group">
            <label class="form-label">작성자</label>
            <input 
              type="text" 
              v-model="form.author" 
              :readonly="isEditMode" 
              :placeholder="isEditMode ? '' : '이름을 입력하세요'"
              class="form-input" 
              :class="{ 'readonly-input': isEditMode }"
              maxlength="20"
            />
          </div>
        </div>

        <!-- 제목 필드 -->
        <div class="form-group">
          <label class="form-label">제목</label>
          <input 
            type="text" 
            v-model="form.title" 
            placeholder="마음을 끄는 멋진 제목을 작성해 보세요." 
            class="form-input" 
            maxlength="100"
          />
        </div>

        <!-- 본문 내용 필드 -->
        <div class="form-group">
          <label class="form-label">본문 내용</label>
          <textarea 
            v-model="form.content" 
            placeholder="풍부하고 따뜻한 내용을 이곳에 펼쳐보세요..." 
            class="form-textarea"
          ></textarea>
        </div>

        <!-- 액션 제어 버튼 존 -->
        <div class="form-footer-actions">
          <button type="button" @click="handleCancel" class="btn btn-secondary">
            취소
          </button>
          
          <button type="submit" :disabled="isSubmitting" class="btn btn-primary btn-save">
            <span v-if="isSubmitting">저장 중...</span>
            <span v-else>
              {{ isEditMode ? '수정 완료' : '등록 하기' }}
            </span>
          </button>
        </div>

      </form>
    </main>

  </div>
</template>

<style scoped>
/* 뒤로가기 버튼 */
.nav-back-zone {
  margin-bottom: 20px;
}

.btn-back {
  background: transparent;
  border: none;
  color: var(--text-secondary);
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

/* 폼 전용 카드 */
.form-card {
  padding: 45px 50px;
}

.form-header {
  border-bottom: 1px solid var(--border-glass);
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.form-header h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 6px;
}

.form-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* 카테고리 + 작성자 2열 배치 */
.form-row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 600px) {
  .form-row-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

/* 읽기전용 인풋 */
.readonly-input {
  background: hsla(222, 20%, 12%, 0.2) !important;
  color: var(--text-muted);
  cursor: not-allowed;
  border-color: var(--border-glass) !important;
  box-shadow: none !important;
}

/* 액션 버튼 존 */
.form-footer-actions {
  border-top: 1px solid var(--border-glass);
  padding-top: 24px;
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-save {
  min-width: 120px;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 로딩 상태 */
.loading-state {
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

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
