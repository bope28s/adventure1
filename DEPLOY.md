# 배포 가이드

## GitHub에 푸시하기

1. GitHub에서 새 저장소를 생성하세요: https://github.com/new
   - 저장소 이름: `harry-potter-adventure-game` (또는 원하는 이름)
   - Public으로 설정
   - README, .gitignore, license는 추가하지 마세요 (이미 있습니다)

2. 아래 명령어를 실행하세요 (YOUR_USERNAME을 본인의 GitHub 사용자명으로 변경):

```bash
git remote add origin https://github.com/YOUR_USERNAME/harry-potter-adventure-game.git
git push -u origin main
```

## Vercel에 배포하기

### 방법 1: Vercel 웹사이트에서 배포 (추천)

1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. "Add New Project" 클릭
4. 방금 만든 GitHub 저장소 선택
5. 프로젝트 설정:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (비워두기)
   - Output Directory: (비워두기)
6. "Deploy" 클릭

### 방법 2: Vercel CLI 사용

```bash
npm i -g vercel
vercel
```

## 배포 후

배포가 완료되면 Vercel이 자동으로 URL을 제공합니다.
예: `https://harry-potter-adventure-game.vercel.app`

