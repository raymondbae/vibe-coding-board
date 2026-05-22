import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 라우터 연동 (확장자 생략으로 TS 빌드 오류 방어)
import './assets/board.css' // 프리미엄 다크/글래스모피즘 전역 스타일시트

const app = createApp(App);

// 🔗 Vue Router 플러그인 탑재
app.use(router);

// 앱 마운트
app.mount('#app');

