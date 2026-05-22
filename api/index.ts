import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

// ESM 상대 경로 끝에 반드시 .js 확장자를 명시해야 합니다.
import { ensureDbInitialized } from './middleware/initDb.js';
import postsRouter from './posts.js';

const app = express();

// JSON 및 URL-encoded 요청 본문 파싱 미들웨어 등록
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 교차 출처 리소스 공유(CORS) 미들웨어 탑재 (로컬 통합 테스트 지원)
app.use(cors());

// 🔒 API 서버 기동 시 DB 초기화 정합성을 지키는 동기화 락 미들웨어 등록
app.use(ensureDbInitialized);

// 게시글 API 라우터 바인딩
app.use('/api/posts', postsRouter);

// 기본 환영 메시지 API
app.get('/api', (req, res) => {
  return res.json({
    success: true,
    message: '🚀 Antigravity Premium Vibe-Board API 서버 정상 가동 중'
  });
});

// Vercel Serverless Function 스펙으로 모듈 내보내기
export default app;

// --- 로컬 단독 서버 실행 지원 로직 ---
// node 또는 tsx로 이 파일을 직접 실행한 경우에만 로컬 웹 서버를 구동시킵니다.
const currentFilePath = fileURLToPath(import.meta.url);
const resolvedArgvPath = process.argv[1] ? fs.realpathSync(process.argv[1]) : '';

if (resolvedArgvPath === fs.realpathSync(currentFilePath) || resolvedArgvPath.endsWith('tsx')) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log('\n======================================================');
    console.log(`  🚀 프리미엄 게시판 API 서버가 정상적으로 시작되었습니다.`);
    console.log(`  🔗 주소: http://localhost:${PORT}`);
    console.log('======================================================\n');
  });
}
