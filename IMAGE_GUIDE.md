# 이미지 검색 가이드

각 이벤트에 맞는 해리포터 영화 장면 이미지를 찾아서 `game.js`의 각 이벤트 `image` 필드에 URL을 추가하세요.

## 무료 이미지 사이트
- **Unsplash**: https://unsplash.com (무료, 고품질)
- **Pexels**: https://www.pexels.com (무료)
- **Pixabay**: https://pixabay.com (무료)

## 각 이벤트별 검색 키워드

### 해리 포터

1. **11번째 생일 / 해그리드 등장**
   - 검색어: "Harry Potter cupboard under stairs", "Harry Potter 11th birthday", "Hagrid first meeting"
   - 영화 장면: 더즐리 집 지하실, 해그리드가 문을 부수고 들어오는 장면

2. **다이애건 앨리 / 올리벤더 지팡이 가게**
   - 검색어: "Diagon Alley", "Ollivanders wand shop", "Harry Potter wand choosing"
   - 영화 장면: 다이애건 앨리 거리, 올리벤더 가게 내부

3. **킹스 크로스 역 / 9와 4분의 3 승강장**
   - 검색어: "King's Cross station platform 9 3/4", "Harry Potter platform", "Hogwarts Express platform"
   - 영화 장면: 킹스 크로스 역, 벽을 통과하는 장면

4. **호그와트 특급 열차**
   - 검색어: "Hogwarts Express train", "Harry Potter train compartment", "Ron Hermione train"
   - 영화 장면: 열차 칸 안, 론과 헤르미온느를 만나는 장면

5. **기숙사 배정 / 정렬 모자**
   - 검색어: "Sorting Hat ceremony", "Harry Potter sorting hat", "Gryffindor Slytherin"
   - 영화 장면: 그레이트 홀, 정렬 모자 의식

6. **첫 마법 수업**
   - 검색어: "Hogwarts classroom", "Harry Potter magic class", "Wingardium Leviosa"
   - 영화 장면: 교실, 플리트윅 교수 수업

7. **트롤 사건**
   - 검색어: "Harry Potter troll scene", "Hogwarts bathroom troll", "Halloween troll"
   - 영화 장면: 화장실, 트롤과의 전투

8. **퀴디치 경기**
   - 검색어: "Quidditch match", "Harry Potter quidditch", "Golden Snitch"
   - 영화 장면: 퀴디치 경기장, 빗자리 위 해리

9. **미러 오브 에리세드**
   - 검색어: "Mirror of Erised", "Harry Potter mirror", "Christmas mirror"
   - 영화 장면: 거울 앞의 해리, 부모님을 보는 장면

10. **마법사의 돌 최종 장면**
    - 검색어: "Philosopher's Stone final scene", "Harry Potter Quirrell Voldemort", "Stone chamber"
    - 영화 장면: 마지막 방, 퀴렐과 볼드모트

### 론 위즐리

1. **킹스 크로스 역에서 해리 만남**
   - 검색어: "Ron Weasley King's Cross", "Harry Ron first meeting"
   
2. **호그와트 특급 열차**
   - 검색어: "Ron train compartment", "Ron chocolate frog"
   
3. **기숙사 배정**
   - 검색어: "Ron Gryffindor", "Ron Harry dormitory"
   
4. **마법 수업 실패**
   - 검색어: "Ron magic class", "Ron wand practice"
   
5. **트롤 사건**
   - 검색어: "Ron troll fight", "Ron Hermione troll"
   
6. **체스 클럽**
   - 검색어: "Ron chess", "Wizard chess"
   
7. **퀴디치 경기 관전**
   - 검색어: "Ron watching quidditch", "Ron Hermione quidditch"
   
8. **크리스마스 스웨터**
   - 검색어: "Ron Weasley sweater", "Christmas at Hogwarts"
   
9. **마법사의 돌 모험**
   - 검색어: "Ron chess game", "Ron sacrifice chess"
   
10. **최종 체스 게임**
    - 검색어: "Ron giant chess", "Ron chess sacrifice"

### 헤르미온느 그레인저

1. **호그와트 특급 열차**
   - 검색어: "Hermione train", "Hermione first appearance"
   
2. **기숙사 배정**
   - 검색어: "Hermione Gryffindor", "Hermione sorting"
   
3. **첫 마법 수업 성공**
   - 검색어: "Hermione magic class", "Hermione Wingardium Leviosa"
   
4. **트롤 사건**
   - 검색어: "Hermione bathroom troll", "Hermione crying bathroom"
   
5. **트롤 구출**
   - 검색어: "Harry Ron save Hermione", "Troll fight"
   
6. **퀴디치 저주 조사**
   - 검색어: "Hermione library", "Hermione research"
   
7. **스네이프 조사**
   - 검색어: "Hermione Snape", "Hermione fire spell"
   
8. **마법사의 돌 연구**
   - 검색어: "Hermione library research", "Hermione Nicolas Flamel"
   
9. **마법사의 돌 모험**
   - 검색어: "Hermione potion puzzle", "Hermione logic puzzle"
   
10. **최종 퍼즐**
    - 검색어: "Hermione potion riddle", "Hermione final puzzle"

## 이미지 URL 추가 방법

1. 위의 검색 키워드로 이미지를 찾습니다
2. 이미지를 클릭하여 원본 페이지로 이동합니다
3. 이미지 URL을 복사합니다 (우클릭 → "이미지 주소 복사")
4. `game.js` 파일에서 해당 이벤트의 `image` 필드에 URL을 붙여넣습니다

예시:
```javascript
{
    story: "...",
    image: "https://images.unsplash.com/photo-1234567890?w=800&q=80",
    choices: [...]
}
```

## 주의사항

- 저작권이 있는 이미지는 사용하지 마세요
- 무료 이미지 사이트(Unsplash, Pexels 등)의 이미지를 사용하세요
- 이미지 URL이 유효한지 확인하세요
- 이미지 크기는 800px 너비 정도가 적당합니다

