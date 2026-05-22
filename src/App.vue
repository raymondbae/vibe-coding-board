<script setup lang="ts">
// 🚀 메인 애플리케이션 진입점 레이아웃 컴포넌트
</script>

<template>
  <!-- 전체 화면의 상단 헤더 데코레이션 및 라우터 뷰 래퍼 -->
  <div class="app-wrapper">
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style scoped>
/* 페이지 전환 페이드 애니메이션 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
