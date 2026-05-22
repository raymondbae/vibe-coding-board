import { db } from '../db.js';

// 데이터베이스 초기화 진행 여부 및 대기용 Promise 관리 변수
let isDbInitialized = false;
let dbInitializationPromise: Promise<void> | null = null;

/**
 * 데이터베이스 테이블 스키마 생성 및 초기 더미 데이터 주입 함수
 */
async function initDatabase(): Promise<void> {
  try {
    console.log('[DB-Init] 데이터베이스 초기화 시작...');

    // 1. posts 테이블 생성 쿼리 수행
    await db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        views INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[DB-Init] posts 테이블이 준비되었습니다.');

    // 2. 더미 데이터 자동 삽입 (테이블이 비어있을 때만 수행)
    const countResult = await db.execute('SELECT COUNT(*) as count FROM posts');
    const count = Number(countResult.rows[0]?.count || 0);

    if (count === 0) {
      console.log('[DB-Init] 게시판에 더미 데이터를 주입합니다...');
      
      const dummyPosts = [
        {
          title: '안티그래비티와 함께하는 바이브 코딩 입문 🚀',
          author: '홍길동',
          content: '반갑습니다! Vite + Vue 3 환경에서 Vanilla CSS와 함께 고품격 다크 글래스모피즘 일반 게시판을 만드는 실습 글입니다. 데이터베이스는 Turso Cloud DB 및 로컬 SQLite 파일 모드로 유기적으로 연동됩니다.',
          category: '공지사항',
        },
        {
          title: 'Vite 개발 서버와 Vercel Serverless Function 완벽 조율 ⚡',
          author: '이순신',
          content: '서버리스 아키텍처에서 빈번히 발생하는 콜드 스타트 500 오류를 방지하기 위해, 동기화 락(Sync Lock) 미들웨어를 도입하여 테이블 인스턴스 초기화 정합성을 완벽히 조율하는 구조입니다.',
          category: '기술팁',
        },
        {
          title: 'Vanilla CSS로 구현한 명품 다크 글래스모피즘 UI ✨',
          author: '임꺽정',
          content: '본 프로젝트는 UI 프레임워크나 테일윈드 없이, 순수 Vanilla CSS와 HSL 컬러 하모니, cubic-bezier 이징 애니메이션, backdrop-filter 블러 효과를 정밀하게 적용하여 최고 사양의 프리미엄 디자인을 구현했습니다.',
          category: '자유',
        }
      ];

      for (const post of dummyPosts) {
        await db.execute({
          sql: 'INSERT INTO posts (title, author, content, category) VALUES (?, ?, ?, ?)',
          args: [post.title, post.author, post.content, post.category]
        });
      }
      console.log('[DB-Init] 더미 데이터 3개 주입이 성공적으로 완료되었습니다.');
    }
  } catch (error) {
    console.error('[DB-Init] 데이터베이스 초기화 중 오류가 발생했습니다:', error);
    throw error;
  }
}

/**
 * 🔒 데이터베이스 동기화 보장 미들웨어 (Sync Lock Middleware)
 * - 서버리스 환경의 콜드 스타트 시, 비동기 테이블 생성과 더미 데이터 주입이 완료될 때까지
 * - 들어오는 모든 API 요청을 안전하게 차단/대기시킴으로써 동시성 쿼리 충돌을 예방합니다.
 */
export async function ensureDbInitialized(req: any, res: any, next: any) {
  if (!isDbInitialized) {
    if (!dbInitializationPromise) {
      dbInitializationPromise = initDatabase().then(() => {
        isDbInitialized = true;
      });
    }
    try {
      // 초기화 완료 시까지 후속 요청들을 대기시킵니다.
      await dbInitializationPromise;
    } catch (err) {
      return res.status(500).json({
        error: '데이터베이스 초기화 도중 치명적인 오류가 발생하여 요청을 처리할 수 없습니다.',
        details: String(err)
      });
    }
  }
  next();
}
