import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// --- 초경량 .env 환경 변수 로더 ---
// 외부 라이브러리 의존성 없이 로컬 환경의 .env 파일을 찾아 process.env에 수동으로 주입합니다.
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    // 주석이거나 빈 줄인 경우 무시합니다.
    if (!trimmedLine || trimmedLine.startsWith('#')) return;
    
    const [key, ...valueParts] = trimmedLine.split('=');
    const value = valueParts.join('=').trim();
    if (key) {
      process.env[key.trim()] = value;
    }
  });
}

// 데이터베이스 연결 설정 로드
const dbUrl = process.env.TURSO_DB_URL;
const dbToken = process.env.TURSO_DB_TOKEN;

// 디버깅을 위한 환경 변수 상태 출력 (민감 정보 제외)
console.log('[DB] 데이터베이스 연결 설정 초기화 중...');
console.log('[DB] TURSO_DB_URL 존재 여부:', !!dbUrl);

let clientConfig: { url: string; authToken?: string };

if (dbUrl && dbUrl.startsWith('libsql://')) {
  // 1. Turso Cloud DB 연결 설정 (원격)
  clientConfig = {
    url: dbUrl,
    authToken: dbToken,
  };
  console.log('[DB] Turso Cloud DB 모드로 연결 설정이 완료되었습니다.');
} else {
  // 2. 환경 변수가 없거나 로컬 파일 연결인 경우, 로컬 SQLite 파일 DB 연결 설정
  // CWD(작업 디렉토리) 아래에 local.db 파일을 생성하여 연결합니다.
  const localDbPath = path.join(process.cwd(), 'local.db');
  clientConfig = {
    url: `file:${localDbPath}`,
  };
  console.log(`[DB] 환경 변수가 없어 로컬 SQLite 파일 DB 모드로 연결합니다. (경로: ${localDbPath})`);
}

// LibSQL 데이터베이스 클라이언트 생성
// C++ 네이티브 바인딩 충돌을 방지하며, 프로토콜 규격에 따라 지능적으로 연결 방식을 조율합니다.
export const db = createClient(clientConfig);
