import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

// 페이지별 뷰 컴포넌트를 동적으로 임포트(Lazy Loading)하여 로딩 성능을 최적화합니다.
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'BoardList',
    component: () => import('../pages/BoardList.vue'),
    meta: { title: '게시글 목록 - Premium Vibe Board' }
  },
  {
    path: '/post/:id',
    name: 'BoardDetail',
    component: () => import('../pages/BoardDetail.vue'),
    meta: { title: '게시글 상세 - Premium Vibe Board' }
  },
  {
    path: '/write',
    name: 'BoardWrite',
    component: () => import('../pages/BoardWrite.vue'),
    meta: { title: '새 글 작성 - Premium Vibe Board' }
  },
  {
    path: '/write/:id',
    name: 'BoardEdit',
    component: () => import('../pages/BoardWrite.vue'),
    meta: { title: '게시글 수정 - Premium Vibe Board' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 브라우저 탭 타이틀을 동적으로 갱신해주는 내비게이션 가드 설정
router.afterEach((to) => {
  document.title = (to.meta.title as string) || 'Premium Vibe Board';
});

export default router;
