// 게임 상태
let currentCharacter = null;
let currentEvent = 0;
let gameState = {
    friendship: 50,
    courage: 50,
    knowledge: 50
};
let pendingChoice = null; // 선택 확인을 위한 변수

// 캐릭터 이름 매핑
const characterNames = {
    harry: '해리 포터',
    ron: '론 위즐리',
    hermione: '헤르미온느 그레인저'
};

// 사운드 재생 함수
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(function(err) {
            console.log('사운드 재생 실패:', err);
        });
    }
}

// 배열 셔플 함수 (Fisher-Yates 알고리즘)
function shuffleArray(array) {
    const shuffled = array.slice(); // 원본 배열 복사
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 게임 데이터 - 각 주인공별 10개 이벤트 (중간 결말 포함, 질문 형태로 마무리)
const gameData = {
    harry: [
        {
            title: "해리의 생일",
            story: "나는 더즐리 집 지하실에서 깨어났다. 오늘은 내 11번째 생일이었다. 갑자기 문이 부서지며 거대한 남자가 나타났다. 그는 자신을 해그리드라고 소개했다. 나는 마법사라는 사실을 처음 알게 되었다! 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
            choices: [
                { text: "해그리드와 함께 호그와트로 가기로 결정한다", effects: { courage: 10 }, next: 1 },
                { text: "더즐리 가족과 함께 있기로 한다", effects: { courage: -20 }, ending: "early_quit" },
                { text: "마법 세계에 대해 더 물어본다", effects: { knowledge: 10 }, next: 1 }
            ]
        },
        {
            title: "지팡이 선택",
            story: "다이애건 앨리에 도착했다! 마법 세계의 상점가였다. 올리벤더의 지팡이 가게에서 나만의 지팡이를 찾아야 한다. 올리벤더 할아버지가 여러 지팡이를 시도해보라고 했다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
            choices: [
                { text: "첫 번째 지팡이를 무작정 선택한다", effects: { knowledge: -10 }, ending: "wrong_wand" },
                { text: "여러 지팡이를 차례로 시도해본다", effects: { knowledge: 10 }, next: 2 },
                { text: "올리벤더 할아버지의 조언을 듣는다", effects: { knowledge: 15 }, next: 2 }
            ]
        },
        {
            title: "9와 4분의 3 승강장",
            story: "킹스 크로스 역 9와 4분의 3 승강장에 도착했다. 벽을 향해 뛰어들어야 한다는 말을 들었지만 무섭다. 론 위즐리 가족이 지나가는 것을 보았다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
            choices: [
                { text: "용기를 내어 벽을 향해 뛴다", effects: { courage: 15 }, next: 3 },
                { text: "론의 어머니에게 도움을 요청한다", effects: { friendship: 10 }, next: 3 },
                { text: "무서워서 집으로 돌아간다", effects: { courage: -30 }, ending: "gave_up" }
            ]
        },
        {
            title: "호그와트 특급 열차",
            story: "호그와트 특급 열차에서 론과 헤르미온느를 만났다. 론은 마법을 보여주려 했지만 실패했다. 헤르미온느는 모든 것을 알고 있는 것 같았다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
            choices: [
                { text: "론을 격려하고 친구가 되자고 한다", effects: { friendship: 15 }, next: 4 },
                { text: "헤르미온느와 대화를 나눈다", effects: { knowledge: 10, friendship: 5 }, next: 4 },
                { text: "혼자 조용히 앉아있어 친구를 사귀지 않는다", effects: { friendship: -20 }, ending: "lonely" }
            ]
        },
        {
            title: "기숙사 배정",
            story: "기숙사 배정 모자 앞에 섰다. 모자는 내가 슬리데린에 적합하다고 말했다. 하지만 해그리드는 그리핀도르를 추천했다. 어느 기숙사를 선택할까?",
            image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80",
            choices: [
                { text: "그리핀도르를 선택한다", effects: { courage: 15, friendship: 10 }, next: 5 },
                { text: "슬리데린을 선택한다", effects: { courage: -10, knowledge: 10 }, ending: "slytherin_path" },
                { text: "모자의 결정을 따른다", effects: { knowledge: 5 }, next: 5 }
            ]
        },
        {
            title: "첫 마법 수업",
            story: "첫 마법 수업 시간이었다. 플리트윅 교수는 깃털을 띄우는 마법을 가르쳤다. 헤르미온느는 이미 성공했지만 나는 아직 실패했다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
            choices: [
                { text: "집중해서 다시 시도한다", effects: { knowledge: 15, courage: 5 }, next: 6 },
                { text: "헤르미온느에게 도움을 요청한다", effects: { friendship: 10, knowledge: 5 }, next: 6 },
                { text: "포기하고 마법을 배우지 않는다", effects: { knowledge: -30, courage: -20 }, ending: "no_magic" }
            ]
        },
        {
            title: "할로윈의 트롤",
            story: "할로윈 밤, 트롤이 학교에 침입했다는 소식이 들렸다. 헤르미온느가 화장실에 숨어있다는 것을 알았다. 론과 함께 그녀를 구하러 가야 한다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
            choices: [
                { text: "용감하게 트롤과 맞선다", effects: { courage: 20, friendship: 15 }, next: 7 },
                { text: "교사들에게 도움을 요청한다", effects: { knowledge: 10, courage: -5 }, next: 7 },
                { text: "무서워서 숨는다", effects: { courage: -25, friendship: -20 }, ending: "coward" }
            ]
        },
        {
            title: "첫 퀴디치 경기",
            story: "첫 퀴디치 경기 날이었다. 스니치를 쫓던 중 내 빗자리가 흔들리기 시작했다. 누군가 나에게 저주를 걸고 있는 것 같았다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&q=80",
            choices: [
                { text: "빗자리를 붙잡고 버틴다", effects: { courage: 20 }, next: 8 },
                { text: "경기를 포기하고 내린다", effects: { courage: -15, friendship: -10 }, ending: "quit_quidditch" },
                { text: "헤르미온느의 도움을 받는다", effects: { friendship: 15, knowledge: 10 }, next: 8 }
            ]
        },
        {
            title: "소망의 거울",
            story: "크리스마스 밤, 소망의 거울을 발견했다. 거울 속에서 부모님과 함께 있는 나를 보았다. 매일 밤 거울 앞에 서서 그들을 바라보고 싶었다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
            choices: [
                { text: "거울 앞에 매일 서서 부모님을 본다", effects: { courage: -10, knowledge: -5 }, ending: "mirror_addiction" },
                { text: "덤블도어 교수의 조언을 듣고 거울을 떠난다", effects: { knowledge: 15, courage: 10 }, next: 9 },
                { text: "친구들에게 거울에 대해 말한다", effects: { friendship: 15, knowledge: 5 }, next: 9 }
            ]
        },
        {
            title: "마법사의 돌",
            story: "마법사의 돌을 지키기 위해 마지막 방에 도착했다. 퀴렐 교수가 볼드모트와 함께 있었다. 그들은 마법사의 돌을 원했다. 나는 그들을 막아야 한다! 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80",
            choices: [
                { text: "용감하게 퀴렐과 맞선다", effects: { courage: 25 }, ending: "courage" },
                { text: "마법사의 돌을 파괴한다", effects: { knowledge: 20, courage: 15 }, ending: "wisdom" },
                { text: "친구들의 도움을 기다린다", effects: { friendship: 25, courage: 10 }, ending: "friendship" }
            ]
        }
    ],
    ron: [
        {
            title: "킹스 크로스 역",
            story: "킹스 크로스 역에서 해리를 처음 만났다. 그는 9와 4분의 3 승강장을 찾지 못하고 있었다. 나는 그에게 도움을 줄 수 있었다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
            choices: [
                { text: "해리에게 승강장을 찾는 방법을 알려준다", effects: { friendship: 15, courage: 5 }, next: 1 },
                { text: "엄마에게 해리를 소개시켜준다", effects: { friendship: 20 }, next: 1 },
                { text: "부끄러워서 조용히 지나간다", effects: { friendship: -15 }, ending: "missed_friendship" }
            ]
        },
        {
            title: "호그와트 특급 열차",
            story: "호그와트 특급 열차에서 해리와 함께 앉았다. 나는 마법을 보여주려고 했지만 실패했다. 부끄러웠지만 해리는 웃지 않았다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
            choices: [
                { text: "해리와 더 친해지려고 노력한다", effects: { friendship: 15 }, next: 2 },
                { text: "다른 주제로 대화를 바꾼다", effects: { courage: 5 }, next: 2 },
                { text: "부끄러워서 다른 칸으로 이동한다", effects: { friendship: -20 }, ending: "shy_ron" }
            ]
        },
        {
            title: "그리핀도르 기숙사",
            story: "기숙사 배정을 받았다. 나는 당연히 그리핀도르에 배정되었다. 해리도 그리핀도르에 배정되었고, 우리는 같은 방을 쓰게 되었다! 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80",
            choices: [
                { text: "해리와 함께 기숙사를 탐험한다", effects: { friendship: 15, courage: 5 }, next: 3 },
                { text: "다른 학생들과 친해진다", effects: { friendship: 10 }, next: 3 },
                { text: "침대에 누워 쉰다", effects: { courage: -5 }, next: 3 }
            ]
        },
        {
            title: "첫 마법 수업",
            story: "첫 마법 수업에서 나는 실패했다. 해리와 헤르미온느는 성공했지만 나는 깃털을 움직이지 못했다. 좌절감이 들었다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
            choices: [
                { text: "포기하지 않고 계속 연습한다", effects: { courage: 15, knowledge: 10 }, next: 4 },
                { text: "해리에게 도움을 요청한다", effects: { friendship: 15, knowledge: 5 }, next: 4 },
                { text: "포기하고 마법을 배우지 않는다", effects: { knowledge: -30, courage: -20 }, ending: "ron_gave_up" }
            ]
        },
        {
            title: "할로윈의 트롤",
            story: "할로윈 밤, 헤르미온느가 트롤 때문에 위험에 빠졌다는 소식을 들었다. 해리와 함께 그녀를 구하러 가야 했다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
            choices: [
                { text: "해리와 함께 용감하게 트롤과 맞선다", effects: { courage: 20, friendship: 20 }, next: 5 },
                { text: "교사들에게 먼저 알린다", effects: { knowledge: 10, courage: -5 }, next: 5 },
                { text: "무서워서 도망간다", effects: { courage: -25, friendship: -25 }, ending: "ron_coward" }
            ]
        },
        {
            title: "마법 체스",
            story: "체스 클럽에 가입했다. 나는 체스를 잘한다. 하지만 마법 체스는 조금 달랐다. 큰 체스 말들이 실제로 움직였다! 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80",
            choices: [
                { text: "마법 체스를 배우기 위해 열심히 연습한다", effects: { knowledge: 15, courage: 5 }, next: 6 },
                { text: "친구들에게 체스를 가르쳐준다", effects: { friendship: 15 }, next: 6 },
                { text: "체스 클럽을 그만둔다", effects: { knowledge: -10 }, next: 6 }
            ]
        },
        {
            title: "해리의 퀴디치 경기",
            story: "해리의 첫 퀴디치 경기를 보러 갔다. 해리의 빗자리가 이상하게 흔들리고 있었다. 누군가 해리에게 저주를 걸고 있는 것 같았다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&q=80",
            choices: [
                { text: "헤르미온느와 함께 누군지 찾아본다", effects: { friendship: 15, knowledge: 10 }, next: 7 },
                { text: "교사들에게 알린다", effects: { knowledge: 10, courage: -5 }, next: 7 },
                { text: "그냥 지켜본다", effects: { friendship: -20 }, ending: "ron_passive" }
            ]
        },
        {
            title: "크리스마스 선물",
            story: "크리스마스에 엄마가 보낸 털실 스웨터를 받았다. 형들의 것과 달리 내 것은 마음에 들지 않았다. 하지만 엄마의 마음은 따뜻했다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&q=80",
            choices: [
                { text: "스웨터를 고맙게 받아들인다", effects: { friendship: 10, courage: 5 }, next: 8 },
                { text: "스웨터를 입지 않고 버린다", effects: { friendship: -20 }, ending: "ungrateful" },
                { text: "친구들에게 스웨터를 보여준다", effects: { friendship: 15 }, next: 8 }
            ]
        },
        {
            title: "💎 마법사의 돌 모험",
            story: "해리와 헤르미온느가 마법사의 돌을 찾으러 간다는 것을 알았다. 나도 함께 가고 싶었다. 하지만 위험할 수 있었다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80",
            choices: [
                { text: "용감하게 친구들과 함께 간다", effects: { courage: 20, friendship: 20 }, next: 9 },
                { text: "교사들에게 알린다", effects: { knowledge: 10, courage: -10 }, ending: "told_teachers" },
                { text: "혼자서 다른 방법을 찾는다", effects: { knowledge: 15, friendship: -5 }, next: 9 }
            ]
        },
        {
            title: "마지막 체스 게임",
            story: "마법사의 돌을 지키는 마지막 방에 도착했다. 거대한 마법 체스판이 있었다. 나는 체스를 잘하지만 이번에는 실제로 위험했다! 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80",
            choices: [
                { text: "용감하게 체스 게임에 참여한다", effects: { courage: 25, knowledge: 15 }, ending: "courage" },
                { text: "해리와 헤르미온느를 먼저 보낸다", effects: { friendship: 25, courage: 10 }, ending: "friendship" },
                { text: "다른 방법을 찾는다", effects: { knowledge: 20, courage: 5 }, ending: "wisdom" }
            ]
        }
    ],
    hermione: [
        {
            title: "호그와트 특급 열차",
            story: "호그와트 특급 열차에서 해리와 론을 처음 만났다. 나는 이미 모든 교과서를 읽었고, 모든 마법을 알고 싶었다. 그들에게 이것을 말하고 싶었다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
            choices: [
                { text: "해리와 론에게 지식을 나눈다", effects: { friendship: 10, knowledge: 5 }, next: 1 },
                { text: "조용히 책을 읽는다", effects: { knowledge: 10, friendship: -5 }, next: 1 },
                { text: "그들과 친구가 되려고 노력한다", effects: { friendship: 15 }, next: 1 }
            ]
        },
        {
            title: "그리핀도르 기숙사",
            story: "기숙사에 배정되었다. 나는 그리핀도르에 배정되었고, 해리와 론과 같은 기숙사였다. 하지만 나는 공부에 집중하고 싶었다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80",
            choices: [
                { text: "도서관에 가서 공부한다", effects: { knowledge: 15 }, next: 2 },
                { text: "해리와 론과 친해진다", effects: { friendship: 15, knowledge: -5 }, next: 2 },
                { text: "공부만 하고 친구를 사귀지 않는다", effects: { knowledge: 20, friendship: -30 }, ending: "hermione_lonely" }
            ]
        },
        {
            title: "첫 마법 수업",
            story: "첫 마법 수업에서 나는 유일하게 성공했다. 플리트윅 교수는 나를 칭찬했다. 하지만 다른 학생들은 나를 이상하게 봤다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
            choices: [
                { text: "다른 학생들에게 도움을 준다", effects: { friendship: 15, knowledge: 5 }, next: 3 },
                { text: "계속해서 더 배운다", effects: { knowledge: 15, friendship: -5 }, next: 3 },
                { text: "자만심에 빠져 공부를 게을리한다", effects: { knowledge: -20, friendship: -15 }, ending: "hermione_arrogant" }
            ]
        },
        {
            title: "할로윈의 트롤",
            story: "할로윈 밤, 화장실에서 울고 있었다. 론이 내 마법을 비웃었다고 생각했다. 그때 트롤이 학교에 침입했다는 소식이 들렸다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
            choices: [
                { text: "화장실에 숨어서 기다린다", effects: { courage: -15 }, ending: "hermione_hiding" },
                { text: "용기를 내어 도움을 요청한다", effects: { courage: 15, friendship: 10 }, next: 4 },
                { text: "책에서 트롤에 대해 찾아본다", effects: { knowledge: 15, courage: 5 }, next: 4 }
            ]
        },
        {
            title: "진짜 친구들",
            story: "해리와 론이 나를 구해주었다. 그들은 트롤과 맞서 싸웠다. 나는 그들에게 고마웠고, 진짜 친구가 되었다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
            choices: [
                { text: "해리와 론에게 고마움을 표현한다", effects: { friendship: 20 }, next: 5 },
                { text: "앞으로 더 도움이 되겠다고 말한다", effects: { friendship: 15, knowledge: 5 }, next: 5 },
                { text: "조용히 고마움을 마음에 간직한다", effects: { friendship: 10 }, next: 5 }
            ]
        },
        {
            title: "해리의 퀴디치 경기",
            story: "해리의 퀴디치 경기 날이었다. 해리의 빗자리가 이상하게 흔들리고 있었다. 나는 이것이 저주라는 것을 알았다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
            choices: [
                { text: "도서관에서 저주에 대해 찾아본다", effects: { knowledge: 15 }, next: 6 },
                { text: "교사들에게 즉시 알린다", effects: { knowledge: 10, courage: 5 }, next: 6 },
                { text: "직접 해리를 도와주러 간다", effects: { friendship: 15, courage: 10 }, next: 6 }
            ]
        },
        {
            title: "저주 조사",
            story: "스네이프 교수가 해리에게 저주를 걸고 있다는 것을 발견했다! 나는 스네이프의 로브에 불을 지폈다. 하지만 나중에 알고 보니 진짜 범인은 퀴렐이었다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&q=80",
            choices: [
                { text: "실수를 인정하고 배운다", effects: { knowledge: 15, courage: 5 }, next: 7 },
                { text: "다시 한번 더 조사한다", effects: { knowledge: 20 }, next: 7 },
                { text: "실수를 인정하지 않고 고집한다", effects: { knowledge: -15, friendship: -10 }, ending: "hermione_stubborn" }
            ]
        },
        {
            title: "마법사의 돌 연구",
            story: "크리스마스에 도서관에서 마법사의 돌에 대한 책을 읽고 있었다. 니콜라스 플라멜과 마법사의 돌에 대해 알게 되었다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
            choices: [
                { text: "해리와 론에게 이 정보를 공유한다", effects: { friendship: 20, knowledge: 10 }, next: 8 },
                { text: "더 깊이 연구한다", effects: { knowledge: 20, friendship: -5 }, next: 8 },
                { text: "정보를 혼자만 알고 행동한다", effects: { knowledge: 15, friendship: -20 }, ending: "hermione_secretive" }
            ]
        },
        {
            title: "💎 마법사의 돌 모험",
            story: "해리와 론이 마법사의 돌을 찾으러 가려고 했다. 나는 이것이 위험하다는 것을 알고 있었다. 하지만 친구들을 혼자 두고 싶지 않았다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
            choices: [
                { text: "친구들과 함께 가되 계획을 세운다", effects: { knowledge: 20, friendship: 15, courage: 10 }, next: 9 },
                { text: "교사들에게 알리려고 한다", effects: { knowledge: 15, courage: -10 }, ending: "hermione_told_teachers" },
                { text: "혼자서 다른 방법을 찾는다", effects: { knowledge: 25, friendship: -10 }, next: 9 }
            ]
        },
        {
            title: "논리 퍼즐",
            story: "마법사의 돌을 지키는 마지막 방에 도착했다. 논리 퍼즐이 있었다. 나는 이것을 풀 수 있었다. 하지만 해리가 혼자 볼드모트와 맞서야 했다. 어떻게 할까?",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
            choices: [
                { text: "퍼즐을 풀고 해리를 도와준다", effects: { knowledge: 25, friendship: 20, courage: 15 }, ending: "wisdom" },
                { text: "해리를 먼저 보내고 뒤에서 지원한다", effects: { friendship: 25, knowledge: 15 }, ending: "friendship" },
                { text: "해리와 함께 용감하게 맞선다", effects: { courage: 25, friendship: 15 }, ending: "courage" }
            ]
        }
    ]
};

// 결말 텍스트 (확장된 결말들)
const endings = {
    // 성공 결말들
    courage: {
        title: {
            harry: "🏆 용감한 영웅",
            ron: "🏆 용감한 친구",
            hermione: "🏆 용감한 마법사"
        },
        originalMatchRate: {
            harry: 90,
            ron: 85,
            hermione: 78
        },
        harry: "용감한 선택으로 볼드모트를 물리쳤다! 해리는 진정한 그리핀도르의 용기를 보여주었다. 마법사의 돌은 안전하게 보호되었고, 해리는 영웅이 되었다.",
        ron: "용감하게 체스 게임에 참여한 론은 친구들을 구했다! 론의 용기는 그리핀도르의 진정한 정신을 보여주었다. 친구들은 론을 영웅으로 기억했다.",
        hermione: "용감하게 해리와 함께 맞선 헤르미온느는 지식뿐만 아니라 용기도 가지고 있음을 증명했다! 그녀의 용기는 모든 것을 바꿨다."
    },
    wisdom: {
        title: {
            harry: "🧠 지혜로운 영웅",
            ron: "🧠 현명한 친구",
            hermione: "🧠 지혜로운 마법사"
        },
        originalMatchRate: {
            harry: 75,
            ron: 70,
            hermione: 95
        },
        harry: "지혜로운 선택으로 마법사의 돌을 파괴했다! 해리는 단순한 용기보다 더 큰 지혜를 보여주었다. 볼드모트의 계획은 실패했고, 해리는 현명한 선택을 했다.",
        ron: "론은 다른 방법을 찾아 친구들을 구했다! 때로는 직접 맞서는 것보다 더 현명한 방법이 있다는 것을 보여주었다. 론의 지혜는 모두를 구했다.",
        hermione: "헤르미온느의 지식과 논리적 사고가 모든 것을 해결했다! 그녀의 똑똑함이 친구들을 구했고, 마법사의 돌도 안전하게 보호되었다. 진정한 지혜의 승리였다!"
    },
    friendship: {
        title: {
            harry: "💝 우정 있는 영웅",
            ron: "💝 진실한 친구",
            hermione: "💝 우정 있는 마법사"
        },
        originalMatchRate: {
            harry: 82,
            ron: 90,
            hermione: 87
        },
        harry: "친구들의 도움으로 위기를 극복했다! 해리는 혼자가 아니라는 것을 깨달았다. 진정한 우정의 힘이 볼드모트보다 강하다는 것을 증명했다.",
        ron: "론의 우정과 희생이 친구들을 구했다! 론은 친구를 위해 자신을 희생할 수 있다는 것을 보여주었다. 진정한 우정의 힘이 승리했다!",
        hermione: "헤르미온느의 지원과 우정이 해리를 구했다! 그녀는 친구를 위해 모든 지식을 동원했다. 우정의 힘이 마법보다 강하다는 것을 증명했다!"
    },
    // 조기 포기 결말들
    early_quit: {
        title: {
            harry: "😔 놓친 기회의 소년"
        },
        originalMatchRate: {
            harry: 5
        },
        harry: "더즐리 가족과 함께 있기로 한 해리는 마법 세계로 가지 않았다. 평범한 삶을 살았지만, 마법사의 피가 흐르는 해리는 항상 뭔가 부족함을 느꼈다. 마법 세계는 그를 기다리고 있었지만, 해리는 그 기회를 놓쳤다."
    },
    wrong_wand: {
        title: {
            harry: "❌ 잘못된 선택의 소년"
        },
        originalMatchRate: {
            harry: 15
        },
        harry: "잘못된 지팡이를 선택한 해리는 마법을 제대로 사용할 수 없었다. 호그와트에서 수업을 따라가지 못하고 결국 퇴학당했다. 올리벤더 할아버지의 조언을 듣지 않은 것이 큰 실수였다."
    },
    gave_up: {
        title: {
            harry: "😰 두려운 소년"
        },
        originalMatchRate: {
            harry: 10
        },
        harry: "무서워서 집으로 돌아간 해리는 마법 세계로 가지 않았다. 승강장을 통과하지 못한 해리는 평범한 머글의 삶을 살았다. 하지만 마법 세계는 그를 필요로 했고, 해리의 선택은 많은 사람들에게 영향을 미쳤다."
    },
    lonely: {
        title: {
            harry: "😢 외로운 소년"
        },
        originalMatchRate: {
            harry: 40
        },
        harry: "친구를 사귀지 않은 해리는 호그와트에서 외로웠다. 론과 헤르미온느는 다른 친구들과 함께했고, 해리는 혼자서 모든 것을 해결해야 했다. 우정의 힘을 알지 못한 해리는 많은 위기에서 혼자서 고군분투했다."
    },
    slytherin_path: {
        title: {
            harry: "🐍 다른 길의 마법사"
        },
        originalMatchRate: {
            harry: 25
        },
        harry: "슬리데린을 선택한 해리는 완전히 다른 길을 걷게 되었다. 슬리데린의 가르침을 받은 해리는 냉정하고 야망 있는 마법사가 되었지만, 진정한 친구들을 잃었다. 그리핀도르의 용기와 우정 대신, 슬리데린의 야망이 해리를 이끌었다."
    },
    no_magic: {
        title: {
            harry: "💔 포기한 소년"
        },
        originalMatchRate: {
            harry: 20
        },
        harry: "마법을 포기한 해리는 호그와트에서 제대로 된 교육을 받지 못했다. 다른 학생들보다 뒤처진 해리는 자신감을 잃었고, 결국 마법 세계에서 도망치듯 떠났다. 마법사의 피를 가지고도 마법을 사용하지 못하는 비극적인 결말이었다."
    },
    coward: {
        title: {
            harry: "😨 용기 없는 소년"
        },
        originalMatchRate: {
            harry: 30
        },
        harry: "트롤 앞에서 도망친 해리는 헤르미온느를 구하지 못했다. 론은 해리를 실망스러워했고, 해리는 자신의 용기 부족에 대해 깊이 후회했다. 이 사건 이후 해리는 친구들의 신뢰를 잃었고, 외로워졌다."
    },
    quit_quidditch: {
        title: {
            harry: "🏃 포기한 선수"
        },
        originalMatchRate: {
            harry: 35
        },
        harry: "퀴디치 경기를 포기한 해리는 그리핀도르 팀의 실망을 샀다. 퀴디치를 좋아했던 해리였지만, 두려움에 굴복한 선택은 해리의 명성을 손상시켰다. 이후 해리는 퀴디치를 다시 하지 않았다."
    },
    mirror_addiction: {
        title: {
            harry: "🪞 과거에 사로잡힌 소년"
        },
        originalMatchRate: {
            harry: 45
        },
        harry: "소망의 거울에 중독된 해리는 매일 밤 거울 앞에서 부모님을 보며 시간을 보냈다. 공부도 게임도 소홀해진 해리는 점점 쇠약해졌고, 덤블도어 교수가 거울을 옮긴 후에도 해리는 거울을 찾아 헤맸다. 과거에 사로잡힌 해리는 미래를 향해 나아가지 못했다."
    },
    // 론의 결말들
    missed_friendship: {
        title: {
            ron: "😔 놓친 우정의 소년"
        },
        originalMatchRate: {
            ron: 10
        },
        ron: "해리에게 말을 걸지 못한 론은 해리와 친구가 되지 못했다. 론은 평범한 학생으로 호그와트를 다녔지만, 해리와의 우정 없이는 많은 모험을 경험하지 못했다. 용기를 내지 못한 것이 론의 가장 큰 후회였다."
    },
    shy_ron: {
        title: {
            ron: "😳 수줍은 소년"
        },
        originalMatchRate: {
            ron: 15
        },
        ron: "부끄러워서 다른 칸으로 이동한 론은 해리와 친구가 되지 못했다. 론은 혼자서 호그와트 생활을 시작했고, 해리와 헤르미온느는 다른 친구들과 함께했다. 론의 수줍음이 큰 기회를 놓치게 했다."
    },
    ron_gave_up: {
        title: {
            ron: "💔 포기한 소년"
        },
        originalMatchRate: {
            ron: 20
        },
        ron: "마법을 포기한 론은 호그와트에서 제대로 된 교육을 받지 못했다. 형들처럼 뛰어난 마법사가 되고 싶었지만, 포기한 론은 점점 뒤처졌다. 론의 부모님은 실망했고, 론 자신도 자신감을 잃었다."
    },
    ron_coward: {
        title: {
            ron: "😨 용기 없는 소년"
        },
        originalMatchRate: {
            ron: 30
        },
        ron: "트롤 앞에서 도망친 론은 헤르미온느를 구하지 못했다. 해리는 론을 실망스러워했고, 론은 자신의 용기 부족에 대해 깊이 후회했다. 이 사건 이후 론은 해리와 헤르미온느의 신뢰를 잃었고, 외로워졌다."
    },
    ron_passive: {
        title: {
            ron: "😐 수동적인 친구"
        },
        originalMatchRate: {
            ron: 35
        },
        ron: "해리를 도와주지 않은 론은 해리가 위험에 빠졌을 때 아무것도 하지 않았다. 론의 수동적인 태도는 해리와의 우정을 손상시켰고, 론은 자신이 진정한 친구가 아니라는 것을 깨달았다."
    },
    ungrateful: {
        title: {
            ron: "😤 감사하지 못한 소년"
        },
        originalMatchRate: {
            ron: 25
        },
        ron: "엄마가 보낸 스웨터를 버린 론은 엄마의 마음을 아프게 했다. 론의 무례한 행동은 가족들에게 실망을 주었고, 론은 자신의 행동을 깊이 후회했다. 감사하지 못한 론은 점점 외로워졌다."
    },
    told_teachers: {
        title: {
            ron: "📚 규칙을 따른 소년"
        },
        originalMatchRate: {
            ron: 50
        },
        ron: "교사들에게 알린 론은 해리와 헤르미온느의 모험을 막았다. 교사들이 개입하면서 마법사의 돌은 안전하게 보호되었지만, 론은 친구들의 신뢰를 잃었다. 때로는 규칙을 지키는 것보다 친구를 믿는 것이 중요하다는 것을 나중에 깨달았다."
    },
    // 헤르미온느의 결말들
    hermione_lonely: {
        title: {
            hermione: "😢 외로운 마법사"
        },
        originalMatchRate: {
            hermione: 40
        },
        hermione: "공부만 하고 친구를 사귀지 않은 헤르미온느는 호그와트에서 외로웠다. 똑똑했지만 친구가 없었던 헤르미온느는 많은 위기 상황에서 혼자서 해결해야 했다. 지식은 많았지만, 우정의 힘을 알지 못했다."
    },
    hermione_arrogant: {
        title: {
            hermione: "😤 자만심에 빠진 마법사"
        },
        originalMatchRate: {
            hermione: 30
        },
        hermione: "자만심에 빠진 헤르미온느는 공부를 게을리했다. 처음에는 뛰어났지만, 자만심으로 인해 다른 학생들에게 뒤처지기 시작했다. 겸손함의 중요성을 깨달았지만, 이미 늦었다."
    },
    hermione_hiding: {
        title: {
            hermione: "😰 숨어버린 마법사"
        },
        originalMatchRate: {
            hermione: 25
        },
        hermione: "화장실에 숨어있던 헤르미온느는 해리와 론이 트롤과 싸우는 것을 보았다. 하지만 그녀는 아무것도 하지 못했다. 용기를 내지 못한 헤르미온느는 자신의 한계를 깨달았고, 이후로도 용기 있는 선택을 하지 못했다."
    },
    hermione_stubborn: {
        title: {
            hermione: "🤦 고집스러운 마법사"
        },
        originalMatchRate: {
            hermione: 35
        },
        hermione: "실수를 인정하지 않은 헤르미온느는 고집스러운 태도로 친구들을 멀리했다. 자신의 실수를 인정하지 않으려는 헤르미온느는 점점 외로워졌고, 친구들의 신뢰를 잃었다. 때로는 실수를 인정하는 것이 더 큰 용기라는 것을 나중에 깨달았다."
    },
    hermione_secretive: {
        title: {
            hermione: "🤐 비밀스러운 마법사"
        },
        originalMatchRate: {
            hermione: 30
        },
        hermione: "정보를 혼자만 알고 행동한 헤르미온느는 해리와 론을 배제했다. 헤르미온느는 혼자서 문제를 해결하려고 했지만, 실패했다. 우정은 정보를 나누는 것에서 시작한다는 것을 깨달았지만, 이미 늦었다."
    },
    hermione_told_teachers: {
        title: {
            hermione: "📚 규칙을 따른 마법사"
        },
        originalMatchRate: {
            hermione: 55
        },
        hermione: "교사들에게 알린 헤르미온느는 해리와 론의 모험을 막았다. 규칙을 지키는 것이 중요하다고 생각했지만, 때로는 친구를 믿고 함께 위험을 감수하는 것이 더 중요하다는 것을 나중에 깨달았다."
    }
};

// 선택 확인 화면 표시
function showChoiceConfirm(choice) {
    pendingChoice = choice;
    const confirmScreen = document.getElementById('choice-confirm-screen');
    const confirmText = document.getElementById('confirm-choice-text');
    const gameScreen = document.getElementById('game-screen');
    
    if (confirmScreen && confirmText && gameScreen) {
        confirmText.textContent = '선택한 내용: ' + choice.text;
        gameScreen.style.display = 'none';
        gameScreen.classList.remove('active');
        confirmScreen.style.display = 'block';
        confirmScreen.classList.add('active');
        playSound('clickSound');
    }
}

// 선택 확인 화면 닫기
function closeChoiceConfirm() {
    const confirmScreen = document.getElementById('choice-confirm-screen');
    const gameScreen = document.getElementById('game-screen');
    
    if (confirmScreen && gameScreen) {
        confirmScreen.style.display = 'none';
        confirmScreen.classList.remove('active');
        gameScreen.style.display = 'block';
        gameScreen.classList.add('active');
        playSound('clickSound');
    }
}

// 실제 선택 처리 함수
function processChoice(choice) {
    closeChoiceConfirm();
    
    // 상태 업데이트
    if (choice.effects) {
        Object.keys(choice.effects).forEach(function(key) {
            gameState[key] = Math.max(0, Math.min(100, gameState[key] + choice.effects[key]));
        });
    }

    // 결말인지 확인
    if (choice.ending) {
        setTimeout(function() {
            showEnding(choice.ending);
        }, 500);
    } else if (choice.next !== undefined) {
        setTimeout(function() {
            currentEvent = choice.next;
            showEvent();
        }, 500);
    } else {
        setTimeout(function() {
            currentEvent++;
            if (currentEvent >= gameData[currentCharacter].length) {
                // 기본 결말 (가장 높은 수치에 따라)
                const maxStat = Object.keys(gameState).reduce(function(a, b) {
                    return gameState[a] > gameState[b] ? a : b;
                });
                const endingType = maxStat === 'courage' ? 'courage' : (maxStat === 'knowledge' ? 'wisdom' : 'friendship');
                showEnding(endingType);
            } else {
                showEvent();
            }
        }, 500);
    }
}

// 이벤트 표시 함수
function showEvent() {
    if (!currentCharacter || !gameData[currentCharacter]) {
        console.error('캐릭터 데이터를 찾을 수 없습니다.');
        return;
    }
    
    const event = gameData[currentCharacter][currentEvent];
    if (!event) {
        console.error('이벤트를 찾을 수 없습니다.');
        return;
    }
    
    const storyText = document.getElementById('story-text');
    const choicesContainer = document.getElementById('choices-container');
    const eventNumber = document.getElementById('event-number');
    const storyImageContainer = document.getElementById('story-image-container');
    const storyContainer = document.getElementById('story-container');
    const endingTitle = document.getElementById('ending-title');

    if (!storyText || !choicesContainer || !eventNumber) {
        console.error('DOM 요소를 찾을 수 없습니다.');
        return;
    }

    // 결말 제목 숨기기 (이벤트 화면에서는 제목 숨김)
    if (endingTitle) {
        endingTitle.style.display = 'none';
    }

    // 페이드 인 애니메이션
    if (storyContainer) {
        storyContainer.style.opacity = '0';
        storyContainer.style.transform = 'translateY(20px)';
    }

    eventNumber.textContent = currentEvent + 1;
    
    // 이벤트 제목 표시
    if (event.title && endingTitle) {
        endingTitle.textContent = event.title;
        endingTitle.style.display = 'block';
        endingTitle.style.opacity = '0';
        endingTitle.style.transform = 'translateY(-20px)';
    }
    
    storyText.textContent = event.story;

    // 배경 이미지 설정
    if (storyImageContainer && event.image) {
        storyImageContainer.style.backgroundImage = 'url(' + event.image + ')';
        storyImageContainer.style.display = 'block';
    } else if (storyImageContainer) {
        storyImageContainer.style.display = 'none';
    }

    choicesContainer.innerHTML = '';
    
    // 선택지 순서를 랜덤하게 섞기
    const shuffledChoices = shuffleArray(event.choices);
    
    shuffledChoices.forEach(function(choice, index) {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = (index + 1) + '. ' + choice.text;
        button.style.opacity = '0';
        button.style.transform = 'translateX(-20px)';
        button.addEventListener('click', function() {
            showChoiceConfirm(choice);
        });
        choicesContainer.appendChild(button);
        
        // 버튼 애니메이션
        setTimeout(function() {
            button.style.transition = 'all 0.5s ease';
            button.style.opacity = '1';
            button.style.transform = 'translateX(0)';
        }, 100 * (index + 1));
    });

    // 스토리 애니메이션
    setTimeout(function() {
        if (storyContainer) {
            storyContainer.style.transition = 'all 0.5s ease';
            storyContainer.style.opacity = '1';
            storyContainer.style.transform = 'translateY(0)';
        }
        
        // 이벤트 제목 애니메이션
        if (event.title && endingTitle) {
            setTimeout(function() {
                endingTitle.style.transition = 'all 0.5s ease';
                endingTitle.style.opacity = '1';
                endingTitle.style.transform = 'translateY(0)';
            }, 200);
        }
    }, 100);
}

// 선택 처리 함수 (확인 화면으로 이동)
function makeChoice(choice) {
    showChoiceConfirm(choice);
}

// 책 이야기와의 일치도 표시 함수
function showOriginalMatchRate(endingType) {
    const matchContainer = document.getElementById('original-match-container');
    const matchValue = document.getElementById('original-match-value');

    if (!matchContainer || !matchValue) {
        console.error('책 이야기 일치도 요소를 찾을 수 없습니다.');
        return;
    }

    // 일치율 값 가져오기
    const matchRate = endings[endingType] && endings[endingType].originalMatchRate && endings[endingType].originalMatchRate[currentCharacter]
        ? endings[endingType].originalMatchRate[currentCharacter]
        : 0;

    // 값 설정
    matchValue.textContent = matchRate;
    
    // 컨테이너 표시
    matchContainer.style.display = 'block';
    matchContainer.style.opacity = '0';
    matchContainer.style.transform = 'translateY(20px)';

    setTimeout(function() {
        matchContainer.style.transition = 'all 0.5s ease';
        matchContainer.style.opacity = '1';
        matchContainer.style.transform = 'translateY(0)';
    }, 100);
}

// 통계 그래프 표시 함수
function showStatsGraph() {
    const statsContainer = document.getElementById('stats-graph-container');
    const friendshipBar = document.getElementById('friendship-bar');
    const courageBar = document.getElementById('courage-bar');
    const knowledgeBar = document.getElementById('knowledge-bar');
    const friendshipValue = document.getElementById('friendship-value');
    const courageValue = document.getElementById('courage-value');
    const knowledgeValue = document.getElementById('knowledge-value');

    if (!statsContainer || !friendshipBar || !courageBar || !knowledgeBar) {
        console.error('통계 그래프 요소를 찾을 수 없습니다.');
        return;
    }

    // 값 설정
    if (friendshipValue) friendshipValue.textContent = gameState.friendship;
    if (courageValue) courageValue.textContent = gameState.courage;
    if (knowledgeValue) knowledgeValue.textContent = gameState.knowledge;

    // 그래프 표시
    statsContainer.style.display = 'block';
    statsContainer.style.opacity = '0';
    statsContainer.style.transform = 'translateY(20px)';

    setTimeout(function() {
        statsContainer.style.transition = 'all 0.5s ease';
        statsContainer.style.opacity = '1';
        statsContainer.style.transform = 'translateY(0)';

        // 애니메이션으로 바 채우기
        setTimeout(function() {
            friendshipBar.style.transition = 'width 1s ease';
            friendshipBar.style.width = gameState.friendship + '%';
        }, 200);

        setTimeout(function() {
            courageBar.style.transition = 'width 1s ease';
            courageBar.style.width = gameState.courage + '%';
        }, 400);

        setTimeout(function() {
            knowledgeBar.style.transition = 'width 1s ease';
            knowledgeBar.style.width = gameState.knowledge + '%';
        }, 600);
    }, 100);
}

// 결말 표시 함수
function showEnding(endingType) {
    const storyText = document.getElementById('story-text');
    const choicesContainer = document.getElementById('choices-container');
    const restartBtn = document.getElementById('restart-btn');
    const storyContainer = document.getElementById('story-container');
    const confirmScreen = document.getElementById('choice-confirm-screen');
    const endingTitle = document.getElementById('ending-title');

    if (!storyText || !choicesContainer || !restartBtn) {
        console.error('DOM 요소를 찾을 수 없습니다.');
        return;
    }

    // 선택 확인 화면이 열려있으면 닫기
    if (confirmScreen && confirmScreen.classList.contains('active')) {
        confirmScreen.style.display = 'none';
        confirmScreen.classList.remove('active');
    }

    // 결말 제목 표시
    const endingTitleText = endings[endingType] && endings[endingType].title && endings[endingType].title[currentCharacter]
        ? endings[endingType].title[currentCharacter]
        : null;
    
    if (endingTitle) {
        if (endingTitleText) {
            endingTitle.textContent = endingTitleText;
            endingTitle.style.display = 'block';
            endingTitle.style.opacity = '0';
            endingTitle.style.transform = 'translateY(-20px)';
        } else {
            endingTitle.style.display = 'none';
        }
    }

    const endingText = endings[endingType] && endings[endingType][currentCharacter] 
        ? endings[endingType][currentCharacter] 
        : '게임이 끝났습니다.';

    // 페이드 인 애니메이션
    if (storyContainer) {
        storyContainer.style.opacity = '0';
        storyContainer.style.transform = 'translateY(20px)';
    }

    storyText.textContent = endingText;
    choicesContainer.innerHTML = '';
    
    // 통계 그래프 표시
    showStatsGraph();
    
    // 책 이야기와의 일치도 표시 (약간의 지연 후 표시)
    setTimeout(function() {
        showOriginalMatchRate(endingType);
    }, 500);
    
    setTimeout(function() {
        if (storyContainer) {
            storyContainer.style.transition = 'all 0.5s ease';
            storyContainer.style.opacity = '1';
            storyContainer.style.transform = 'translateY(0)';
        }
        
        // 제목 애니메이션
        if (endingTitle && endingTitleText) {
            setTimeout(function() {
                endingTitle.style.transition = 'all 0.5s ease';
                endingTitle.style.opacity = '1';
                endingTitle.style.transform = 'translateY(0)';
            }, 200);
        }
        restartBtn.style.display = 'block';
        restartBtn.style.opacity = '0';
        restartBtn.style.transform = 'translateY(20px)';
        setTimeout(function() {
            restartBtn.style.transition = 'all 0.5s ease';
            restartBtn.style.opacity = '1';
            restartBtn.style.transform = 'translateY(0)';
        }, 200);
    }, 100);
    
    // 다시 시작하기 버튼 이벤트 (기존 이벤트 제거 후 새로 등록)
    restartBtn.onclick = null; // 기존 이벤트 제거
    restartBtn.onclick = function() {
        playSound('clickSound');
        
        // 선택 확인 화면 닫기
        if (confirmScreen) {
            confirmScreen.style.display = 'none';
            confirmScreen.classList.remove('active');
        }
        
        // 게임 화면 닫기
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.style.transition = 'opacity 0.5s ease';
            gameScreen.style.opacity = '0';
        }
        
        setTimeout(function() {
            const selectionScreen = document.getElementById('character-selection');
            if (gameScreen) {
                gameScreen.classList.remove('active');
                gameScreen.style.display = 'none';
            }
            if (selectionScreen) {
                selectionScreen.classList.add('active');
                selectionScreen.style.display = 'block';
                selectionScreen.style.opacity = '0';
                setTimeout(function() {
                    selectionScreen.style.transition = 'opacity 0.5s ease';
                    selectionScreen.style.opacity = '1';
                }, 50);
            }
            
            // 통계 그래프 숨기기
            const statsContainer = document.getElementById('stats-graph-container');
            if (statsContainer) {
                statsContainer.style.display = 'none';
            }
            
            // 책 이야기 일치도 그래프 숨기기
            const matchContainer = document.getElementById('original-match-container');
            if (matchContainer) {
                matchContainer.style.display = 'none';
            }
        }, 500);
    };
}

// 게임 시작 함수 (전역에 즉시 노출)
window.startGame = function(character) {
    console.log('=== startGame 함수 호출됨 ===');
    console.log('캐릭터:', character);
    
    if (!character) {
        console.error('캐릭터가 지정되지 않았습니다.');
        alert('캐릭터를 선택해주세요.');
        return;
    }
    
    if (!characterNames[character]) {
        console.error('유효하지 않은 캐릭터:', character);
        alert('유효하지 않은 캐릭터입니다.');
        return;
    }
    
    playSound('clickSound');
    
    currentCharacter = character;
    currentEvent = 0;
    gameState = {
        friendship: 50,
        courage: 50,
        knowledge: 50
    };

    const selectionScreen = document.getElementById('character-selection');
    const gameScreen = document.getElementById('game-screen');
    
    if (!selectionScreen || !gameScreen) {
        console.error('화면 요소를 찾을 수 없습니다.');
        alert('게임 화면을 찾을 수 없습니다. 페이지를 새로고침해주세요.');
        return;
    }
    
    // 페이드 아웃 애니메이션
    selectionScreen.style.transition = 'opacity 0.5s ease';
    selectionScreen.style.opacity = '0';
    
    setTimeout(function() {
        selectionScreen.classList.remove('active');
        selectionScreen.style.display = 'none';
        gameScreen.classList.add('active');
        gameScreen.style.display = 'block';
        gameScreen.style.opacity = '0';
        gameScreen.style.transform = 'translateY(20px)';
        
        // 페이드 인 애니메이션
        setTimeout(function() {
            gameScreen.style.transition = 'all 0.5s ease';
            gameScreen.style.opacity = '1';
            gameScreen.style.transform = 'translateY(0)';
        }, 50);
        
        const characterNameElement = document.getElementById('current-character-name');
        const characterIconElement = document.getElementById('current-character-icon');
        if (characterNameElement) {
            characterNameElement.textContent = characterNames[character];
        }
        
        // 캐릭터 아이콘 설정
        if (characterIconElement) {
            const iconPaths = {
                harry: 'image/Harry.png',
                ron: 'image/Ron.png',
                hermione: 'image/Hermione.png'
            };
            if (iconPaths[character]) {
                characterIconElement.src = iconPaths[character];
                characterIconElement.alt = characterNames[character];
                characterIconElement.style.display = 'block';
            } else {
                characterIconElement.style.display = 'none';
            }
        }
        
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.style.display = 'none';
        }
        
        // 통계 그래프 숨기기
        const statsContainer = document.getElementById('stats-graph-container');
        if (statsContainer) {
            statsContainer.style.display = 'none';
        }
        
        // 결말 제목 숨기기
        const endingTitle = document.getElementById('ending-title');
        if (endingTitle) {
            endingTitle.style.display = 'none';
        }
        
        showEvent();
    }, 500);
};

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 선택 확인 화면 버튼 이벤트
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');
    
    if (confirmYes) {
        confirmYes.addEventListener('click', function() {
            if (pendingChoice) {
                processChoice(pendingChoice);
            }
        });
    }
    
    if (confirmNo) {
        confirmNo.addEventListener('click', function() {
            closeChoiceConfirm();
        });
    }
    
    // 첫 화면 페이드 인
    const selectionScreen = document.getElementById('character-selection');
    if (selectionScreen) {
        selectionScreen.style.opacity = '0';
        setTimeout(function() {
            selectionScreen.style.transition = 'opacity 0.5s ease';
            selectionScreen.style.opacity = '1';
        }, 100);
    }
});
