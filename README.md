# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

---

## 🚀 Vercel 로컬 개발 환경 실행 방법

이 프로젝트는 Vite 기반의 프론트엔드와 `@vercel/node` 기반의 백엔드 API 서버리스 함수(`api/index.ts`)를 함께 제공합니다. 로컬 개발 환경에서 이 두 영역을 권한 에러 없이 효율적으로 테스트하고 연동하려면 **프로젝트 내 로컬 의존성(`npx`)**을 사용하여 실행해 주세요.

### 1. 로컬 Vercel 패키지 설치
글로벌 설치 시의 macOS 권한(`sudo`) 이슈를 예방하기 위해, 프로젝트 개발 의존성(`devDependencies`)으로 Vercel 패키지를 안전하게 추가합니다. *(이미 설치되어 있다면 이 단계를 건너뜁니다)*
```bash
npm install -D vercel
```

### 2. Vercel 로그인 (최초 1회)
로컬 터미널과 본인의 Vercel 계정을 동기화하기 위해 로그인을 수행합니다.
```bash
npx vercel login
```
* 명령어 실행 후 나타나는 안내에 따라 GitHub 또는 이메일을 선택해 간편하게 인증을 마칠 수 있습니다.

### 3. 프로젝트 연결 (최초 1회)
프로젝트 루트 디렉토리에서 아래 명령어를 실행하여 로컬 폴더를 Vercel 프로젝트와 링크시킵니다.
```bash
npx vercel link
```
* 대화형 프롬프트가 실행되면 아래 값을 가이드 삼아 입력합니다:
  * **Set up and deploy “~/github.com/vibe-coding-board”?** `y`
  * **Which scope do you want to deploy to?** 본인의 Vercel 개인/팀 계정 선택
  * **Link to existing project?** 새로 등록하는 것이라면 `n` (새 프로젝트 생성), 기존 배포 건이 있다면 `y`를 누르고 기존 프로젝트 이름 연동
  * **What’s your project’s name?** 프로젝트명 지정 (엔터로 기본값 지정 가능)
  * **In which directory is your code located?** `./` (루트이므로 그대로 엔터)
  * **Want to modify-settings?** `n` (`vercel.json`의 사전 설정을 신뢰하므로 변경 안 함)

설정이 끝나면 프로젝트 루트에 `.vercel` 폴더가 생성되고 링크가 활성화됩니다.

### 4. 로컬 개발 서버 기동
연결이 완료되었다면 아래 명령어로 프론트엔드 빌드 개발 서버와 API 백엔드를 한꺼번에 실시간 기동합니다.
```bash
npx vercel dev
# 또는 축약형 명령어 실행
npx vc dev
```
* **로컬 접속 주소**: 기본적으로 **`http://localhost:3000`** 포트로 실행됩니다. (만약 3000 포트가 이미 다른 작업으로 사용 중이라면, Vercel이 알아서 감지하여 `http://localhost:3001` 등으로 변경해 기동해 줍니다.)
* **포트 변경 방법**: 다른 특정 포트로 강제 실행하고 싶다면 `--port` 옵션을 추가해 주세요.
  ```bash
  npx vercel dev --port 8080
  ```

### 🔐 환경 변수 동기화 팁 (보안 필수)
Vercel 대시보드에 설정된 실서버 및 개발용 환경변수를 로컬 개발 환경으로 가져오려면 다음 명령어를 실행합니다.
```bash
npx vercel env pull .env.local
```
> [!CAUTION]
> **중요 보안 규정**: 환경변수가 포함된 `.env`나 `.env.local` 파일은 인증 정보 및 보안 토큰을 담고 있는 민감한 파일입니다. 보안 유출 및 형상 관리 문제를 방지하기 위해 절대 수동으로 편집하거나 Git 저장소에 커밋/푸시하지 않도록 주의해 주세요. 로컬 템플릿 환경 변수 가이드라인은 프로젝트에 제공된 `.env-sample` 파일을 참조하십시오.


