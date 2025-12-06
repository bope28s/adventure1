// 게임 상태
let currentCharacter = null;
let currentEvent = 0;
let gameState = {
    friendship: 50,
    courage: 50,
    knowledge: 50
};

// 캐릭터 이름 매핑
const characterNames = {
    harry: '해리 포터',
    ron: '론 위즐리',
    hermione: '헤르미온느 그레인저'
};

// 게임 데이터 - 각 주인공별 10개 이벤트
const gameData = {
    harry: [
        {
            story: "나는 더즐리 집 지하실에서 깨어났다. 오늘은 내 11번째 생일이었다. 갑자기 문이 부서지며 거대한 남자가 나타났다. 그는 자신을 해그리드라고 소개했다. 나는 마법사라는 사실을 처음 알게 되었다!",
            choices: [
                { text: "해그리드와 함께 호그와트로 가기로 결정한다", effects: { courage: 10 }, next: 1 },
                { text: "더즐리 가족과 함께 있기로 한다", effects: { courage: -10 }, next: 1 },
                { text: "마법 세계에 대해 더 물어본다", effects: { knowledge: 10 }, next: 1 }
            ]
        },
        {
            story: "다이애건 앨리에 도착했다! 마법 세계의 상점가였다. 올리벤더의 지팡이 가게에서 나만의 지팡이를 찾아야 한다. 올리벤더 할아버지가 여러 지팡이를 시도해보라고 했다.",
            choices: [
                { text: "첫 번째 지팡이를 선택한다", effects: { knowledge: -5 }, next: 2 },
                { text: "여러 지팡이를 차례로 시도해본다", effects: { knowledge: 10 }, next: 2 },
                { text: "올리벤더 할아버지의 조언을 듣는다", effects: { knowledge: 15 }, next: 2 }
            ]
        },
        {
            story: "킹스 크로스 역 9와 4분의 3 승강장에 도착했다. 벽을 향해 뛰어들어야 한다는 말을 들었지만 무섭다. 론 위즐리 가족이 지나가는 것을 보았다.",
            choices: [
                { text: "용기를 내어 벽을 향해 뛴다", effects: { courage: 15 }, next: 3 },
                { text: "론의 어머니에게 도움을 요청한다", effects: { friendship: 10 }, next: 3 },
                { text: "주변을 더 둘러본다", effects: { knowledge: 5 }, next: 3 }
            ]
        },
        {
            story: "호그와트 특급 열차에서 론과 헤르미온느를 만났다. 론은 마법을 보여주려 했지만 실패했다. 헤르미온느는 모든 것을 알고 있는 것 같았다.",
            choices: [
                { text: "론을 격려하고 친구가 되자고 한다", effects: { friendship: 15 }, next: 4 },
                { text: "헤르미온느와 대화를 나눈다", effects: { knowledge: 10, friendship: 5 }, next: 4 },
                { text: "혼자 조용히 앉아있는다", effects: { friendship: -10 }, next: 4 }
            ]
        },
        {
            story: "기숙사 배정 모자 앞에 섰다. 모자는 내가 슬리데린에 적합하다고 말했다. 하지만 해그리드는 그리핀도르를 추천했다. 어느 기숙사를 선택할까?",
            choices: [
                { text: "그리핀도르를 선택한다", effects: { courage: 15, friendship: 10 }, next: 5 },
                { text: "슬리데린을 선택한다", effects: { courage: -10, knowledge: 10 }, next: 5 },
                { text: "모자의 결정을 따른다", effects: { knowledge: 5 }, next: 5 }
            ]
        },
        {
            story: "첫 마법 수업 시간이었다. 플리트윅 교수는 깃털을 띄우는 마법을 가르쳤다. 헤르미온느는 이미 성공했지만 나는 아직 실패했다.",
            choices: [
                { text: "집중해서 다시 시도한다", effects: { knowledge: 15, courage: 5 }, next: 6 },
                { text: "헤르미온느에게 도움을 요청한다", effects: { friendship: 10, knowledge: 5 }, next: 6 },
                { text: "포기하고 다음 수업을 기다린다", effects: { knowledge: -10, courage: -5 }, next: 6 }
            ]
        },
        {
            story: "할로윈 밤, 트롤이 학교에 침입했다는 소식이 들렸다. 헤르미온느가 화장실에 숨어있다는 것을 알았다. 론과 함께 그녀를 구하러 가야 한다.",
            choices: [
                { text: "용감하게 트롤과 맞선다", effects: { courage: 20, friendship: 15 }, next: 7 },
                { text: "교사들에게 도움을 요청한다", effects: { knowledge: 10, courage: -5 }, next: 7 },
                { text: "론과 함께 작전을 세운다", effects: { friendship: 20, knowledge: 10 }, next: 7 }
            ]
        },
        {
            story: "첫 퀴디치 경기 날이었다. 스니치를 쫓던 중 내 빗자리가 흔들리기 시작했다. 누군가 나에게 저주를 걸고 있는 것 같았다.",
            choices: [
                { text: "빗자리를 붙잡고 버틴다", effects: { courage: 20 }, next: 8 },
                { text: "경기를 포기하고 내린다", effects: { courage: -15, friendship: -10 }, next: 8 },
                { text: "헤르미온느의 도움을 받는다", effects: { friendship: 15, knowledge: 10 }, next: 8 }
            ]
        },
        {
            story: "크리스마스 밤, 미러 오브 에리세드를 발견했다. 거울 속에서 부모님과 함께 있는 나를 보았다. 매일 밤 거울 앞에 서서 그들을 바라보고 싶었다.",
            choices: [
                { text: "거울 앞에 매일 서서 부모님을 본다", effects: { courage: -10, knowledge: -5 }, next: 9 },
                { text: "덤블도어 교수의 조언을 듣고 거울을 떠난다", effects: { knowledge: 15, courage: 10 }, next: 9 },
                { text: "친구들에게 거울에 대해 말한다", effects: { friendship: 15, knowledge: 5 }, next: 9 }
            ]
        },
        {
            story: "마법사의 돌을 지키기 위해 마지막 방에 도착했다. 퀴렐 교수가 볼드모트와 함께 있었다. 그들은 마법사의 돌을 원했다. 나는 그들을 막아야 한다!",
            choices: [
                { text: "용감하게 퀴렐과 맞선다", effects: { courage: 25 }, ending: "courage" },
                { text: "마법사의 돌을 파괴한다", effects: { knowledge: 20, courage: 15 }, ending: "wisdom" },
                { text: "친구들의 도움을 기다린다", effects: { friendship: 25, courage: 10 }, ending: "friendship" }
            ]
        }
    ],
    ron: [
        {
            story: "킹스 크로스 역에서 해리를 처음 만났다. 그는 9와 4분의 3 승강장을 찾지 못하고 있었다. 나는 그에게 도움을 줄 수 있었다.",
            choices: [
                { text: "해리에게 승강장을 찾는 방법을 알려준다", effects: { friendship: 15, courage: 5 }, next: 1 },
                { text: "엄마에게 해리를 소개시켜준다", effects: { friendship: 20 }, next: 1 },
                { text: "조용히 지나간다", effects: { friendship: -10 }, next: 1 }
            ]
        },
        {
            story: "호그와트 특급 열차에서 해리와 함께 앉았다. 나는 마법을 보여주려고 했지만 실패했다. 부끄러웠지만 해리는 웃지 않았다.",
            choices: [
                { text: "해리와 더 친해지려고 노력한다", effects: { friendship: 15 }, next: 2 },
                { text: "다른 주제로 대화를 바꾼다", effects: { courage: 5 }, next: 2 },
                { text: "혼자 조용히 앉아있는다", effects: { friendship: -5 }, next: 2 }
            ]
        },
        {
            story: "기숙사 배정을 받았다. 나는 당연히 그리핀도르에 배정되었다. 해리도 그리핀도르에 배정되었고, 우리는 같은 방을 쓰게 되었다!",
            choices: [
                { text: "해리와 함께 기숙사를 탐험한다", effects: { friendship: 15, courage: 5 }, next: 3 },
                { text: "다른 학생들과 친해진다", effects: { friendship: 10 }, next: 3 },
                { text: "침대에 누워 쉰다", effects: { courage: -5 }, next: 3 }
            ]
        },
        {
            story: "첫 마법 수업에서 나는 실패했다. 해리와 헤르미온느는 성공했지만 나는 깃털을 움직이지 못했다. 좌절감이 들었다.",
            choices: [
                { text: "포기하지 않고 계속 연습한다", effects: { courage: 15, knowledge: 10 }, next: 4 },
                { text: "해리에게 도움을 요청한다", effects: { friendship: 15, knowledge: 5 }, next: 4 },
                { text: "포기하고 다른 일을 한다", effects: { knowledge: -10, courage: -10 }, next: 4 }
            ]
        },
        {
            story: "할로윈 밤, 헤르미온느가 트롤 때문에 위험에 빠졌다는 소식을 들었다. 해리와 함께 그녀를 구하러 가야 했다.",
            choices: [
                { text: "해리와 함께 용감하게 트롤과 맞선다", effects: { courage: 20, friendship: 20 }, next: 5 },
                { text: "교사들에게 먼저 알린다", effects: { knowledge: 10, courage: -5 }, next: 5 },
                { text: "혼자서 트롤을 막으려고 한다", effects: { courage: 15, friendship: -5 }, next: 5 }
            ]
        },
        {
            story: "체스 클럽에 가입했다. 나는 체스를 잘한다. 하지만 마법 체스는 조금 달랐다. 큰 체스 말들이 실제로 움직였다!",
            choices: [
                { text: "마법 체스를 배우기 위해 열심히 연습한다", effects: { knowledge: 15, courage: 5 }, next: 6 },
                { text: "친구들에게 체스를 가르쳐준다", effects: { friendship: 15 }, next: 6 },
                { text: "체스 클럽을 그만둔다", effects: { knowledge: -10 }, next: 6 }
            ]
        },
        {
            story: "해리의 첫 퀴디치 경기를 보러 갔다. 해리의 빗자리가 이상하게 흔들리고 있었다. 누군가 해리에게 저주를 걸고 있는 것 같았다.",
            choices: [
                { text: "헤르미온느와 함께 누군지 찾아본다", effects: { friendship: 15, knowledge: 10 }, next: 7 },
                { text: "교사들에게 알린다", effects: { knowledge: 10, courage: -5 }, next: 7 },
                { text: "그냥 지켜본다", effects: { friendship: -10 }, next: 7 }
            ]
        },
        {
            story: "크리스마스에 엄마가 보낸 털실 스웨터를 받았다. 형들의 것과 달리 내 것은 마음에 들지 않았다. 하지만 엄마의 마음은 따뜻했다.",
            choices: [
                { text: "스웨터를 고맙게 받아들인다", effects: { friendship: 10, courage: 5 }, next: 8 },
                { text: "스웨터를 입지 않는다", effects: { friendship: -10 }, next: 8 },
                { text: "친구들에게 스웨터를 보여준다", effects: { friendship: 15 }, next: 8 }
            ]
        },
        {
            story: "해리와 헤르미온느가 마법사의 돌을 찾으러 간다는 것을 알았다. 나도 함께 가고 싶었다. 하지만 위험할 수 있었다.",
            choices: [
                { text: "용감하게 친구들과 함께 간다", effects: { courage: 20, friendship: 20 }, next: 9 },
                { text: "교사들에게 알린다", effects: { knowledge: 10, courage: -10 }, next: 9 },
                { text: "혼자서 다른 방법을 찾는다", effects: { knowledge: 15, friendship: -5 }, next: 9 }
            ]
        },
        {
            story: "마법사의 돌을 지키는 마지막 방에 도착했다. 거대한 마법 체스판이 있었다. 나는 체스를 잘하지만 이번에는 실제로 위험했다!",
            choices: [
                { text: "용감하게 체스 게임에 참여한다", effects: { courage: 25, knowledge: 15 }, ending: "courage" },
                { text: "해리와 헤르미온느를 먼저 보낸다", effects: { friendship: 25, courage: 10 }, ending: "friendship" },
                { text: "다른 방법을 찾는다", effects: { knowledge: 20, courage: 5 }, ending: "wisdom" }
            ]
        }
    ],
    hermione: [
        {
            story: "호그와트 특급 열차에서 해리와 론을 처음 만났다. 나는 이미 모든 교과서를 읽었고, 모든 마법을 알고 싶었다. 그들에게 이것을 말하고 싶었다.",
            choices: [
                { text: "해리와 론에게 지식을 나눈다", effects: { friendship: 10, knowledge: 5 }, next: 1 },
                { text: "조용히 책을 읽는다", effects: { knowledge: 10, friendship: -5 }, next: 1 },
                { text: "그들과 친구가 되려고 노력한다", effects: { friendship: 15 }, next: 1 }
            ]
        },
        {
            story: "기숙사에 배정되었다. 나는 그리핀도르에 배정되었고, 해리와 론과 같은 기숙사였다. 하지만 나는 공부에 집중하고 싶었다.",
            choices: [
                { text: "도서관에 가서 공부한다", effects: { knowledge: 15 }, next: 2 },
                { text: "해리와 론과 친해진다", effects: { friendship: 15, knowledge: -5 }, next: 2 },
                { text: "기숙사를 탐험한다", effects: { courage: 10, knowledge: 5 }, next: 2 }
            ]
        },
        {
            story: "첫 마법 수업에서 나는 유일하게 성공했다. 플리트윅 교수는 나를 칭찬했다. 하지만 다른 학생들은 나를 이상하게 봤다.",
            choices: [
                { text: "다른 학생들에게 도움을 준다", effects: { friendship: 15, knowledge: 5 }, next: 3 },
                { text: "계속해서 더 배운다", effects: { knowledge: 15, friendship: -5 }, next: 3 },
                { text: "조용히 앉아있는다", effects: { courage: -5 }, next: 3 }
            ]
        },
        {
            story: "할로윈 밤, 화장실에서 울고 있었다. 론이 내 마법을 비웃었다고 생각했다. 그때 트롤이 학교에 침입했다는 소식이 들렸다.",
            choices: [
                { text: "화장실에 숨어서 기다린다", effects: { courage: -10 }, next: 4 },
                { text: "용기를 내어 도움을 요청한다", effects: { courage: 15, friendship: 10 }, next: 4 },
                { text: "책에서 트롤에 대해 찾아본다", effects: { knowledge: 15, courage: 5 }, next: 4 }
            ]
        },
        {
            story: "해리와 론이 나를 구해주었다. 그들은 트롤과 맞서 싸웠다. 나는 그들에게 고마웠고, 진짜 친구가 되었다.",
            choices: [
                { text: "해리와 론에게 고마움을 표현한다", effects: { friendship: 20 }, next: 5 },
                { text: "앞으로 더 도움이 되겠다고 말한다", effects: { friendship: 15, knowledge: 5 }, next: 5 },
                { text: "조용히 고마움을 마음에 간직한다", effects: { friendship: 10 }, next: 5 }
            ]
        },
        {
            story: "해리의 퀴디치 경기 날이었다. 해리의 빗자리가 이상하게 흔들리고 있었다. 나는 이것이 저주라는 것을 알았다.",
            choices: [
                { text: "도서관에서 저주에 대해 찾아본다", effects: { knowledge: 15 }, next: 6 },
                { text: "교사들에게 즉시 알린다", effects: { knowledge: 10, courage: 5 }, next: 6 },
                { text: "직접 해리를 도와주러 간다", effects: { friendship: 15, courage: 10 }, next: 6 }
            ]
        },
        {
            story: "스네이프 교수가 해리에게 저주를 걸고 있다는 것을 발견했다! 나는 스네이프의 로브에 불을 지폈다. 하지만 나중에 알고 보니 진짜 범인은 퀴렐이었다.",
            choices: [
                { text: "실수를 인정하고 배운다", effects: { knowledge: 15, courage: 5 }, next: 7 },
                { text: "다시 한번 더 조사한다", effects: { knowledge: 20 }, next: 7 },
                { text: "친구들에게 말한다", effects: { friendship: 10, knowledge: 5 }, next: 7 }
            ]
        },
        {
            story: "크리스마스에 도서관에서 마법사의 돌에 대한 책을 읽고 있었다. 니콜라스 플라멜과 마법사의 돌에 대해 알게 되었다.",
            choices: [
                { text: "해리와 론에게 이 정보를 공유한다", effects: { friendship: 20, knowledge: 10 }, next: 8 },
                { text: "더 깊이 연구한다", effects: { knowledge: 20, friendship: -5 }, next: 8 },
                { text: "교사들에게 알린다", effects: { knowledge: 10, courage: 5 }, next: 8 }
            ]
        },
        {
            story: "해리와 론이 마법사의 돌을 찾으러 가려고 했다. 나는 이것이 위험하다는 것을 알고 있었다. 하지만 친구들을 혼자 두고 싶지 않았다.",
            choices: [
                { text: "친구들과 함께 가되 계획을 세운다", effects: { knowledge: 20, friendship: 15, courage: 10 }, next: 9 },
                { text: "교사들에게 알리려고 한다", effects: { knowledge: 15, courage: -10 }, next: 9 },
                { text: "혼자서 다른 방법을 찾는다", effects: { knowledge: 25, friendship: -10 }, next: 9 }
            ]
        },
        {
            story: "마법사의 돌을 지키는 마지막 방에 도착했다. 논리 퍼즐이 있었다. 나는 이것을 풀 수 있었다. 하지만 해리가 혼자 볼드모트와 맞서야 했다.",
            choices: [
                { text: "퍼즐을 풀고 해리를 도와준다", effects: { knowledge: 25, friendship: 20, courage: 15 }, ending: "wisdom" },
                { text: "해리를 먼저 보내고 뒤에서 지원한다", effects: { friendship: 25, knowledge: 15 }, ending: "friendship" },
                { text: "해리와 함께 용감하게 맞선다", effects: { courage: 25, friendship: 15 }, ending: "courage" }
            ]
        }
    ]
};

// 결말 텍스트
const endings = {
    courage: {
        harry: "용감한 선택으로 볼드모트를 물리쳤다! 해리는 진정한 그리핀도르의 용기를 보여주었다. 마법사의 돌은 안전하게 보호되었고, 해리는 영웅이 되었다.",
        ron: "용감하게 체스 게임에 참여한 론은 친구들을 구했다! 론의 용기는 그리핀도르의 진정한 정신을 보여주었다. 친구들은 론을 영웅으로 기억했다.",
        hermione: "용감하게 해리와 함께 맞선 헤르미온느는 지식뿐만 아니라 용기도 가지고 있음을 증명했다! 그녀의 용기는 모든 것을 바꿨다."
    },
    wisdom: {
        harry: "지혜로운 선택으로 마법사의 돌을 파괴했다! 해리는 단순한 용기보다 더 큰 지혜를 보여주었다. 볼드모트의 계획은 실패했고, 해리는 현명한 선택을 했다.",
        ron: "론은 다른 방법을 찾아 친구들을 구했다! 때로는 직접 맞서는 것보다 더 현명한 방법이 있다는 것을 보여주었다. 론의 지혜는 모두를 구했다.",
        hermione: "헤르미온느의 지식과 논리적 사고가 모든 것을 해결했다! 그녀의 똑똑함이 친구들을 구했고, 마법사의 돌도 안전하게 보호되었다. 진정한 지혜의 승리였다!"
    },
    friendship: {
        harry: "친구들의 도움으로 위기를 극복했다! 해리는 혼자가 아니라는 것을 깨달았다. 진정한 우정의 힘이 볼드모트보다 강하다는 것을 증명했다.",
        ron: "론의 우정과 희생이 친구들을 구했다! 론은 친구를 위해 자신을 희생할 수 있다는 것을 보여주었다. 진정한 우정의 힘이 승리했다!",
        hermione: "헤르미온느의 지원과 우정이 해리를 구했다! 그녀는 친구를 위해 모든 지식을 동원했다. 우정의 힘이 마법보다 강하다는 것을 증명했다!"
    }
};

// 이벤트 리스너 초기화 함수
function initEventListeners() {
    console.log('게임 초기화 시작');
    
    // 캐릭터 카드에 이벤트 리스너 추가
    const characterCards = document.querySelectorAll('.character-card');
    console.log('찾은 캐릭터 카드 개수:', characterCards.length);
    
    if (characterCards.length === 0) {
        console.error('캐릭터 카드를 찾을 수 없습니다!');
        return;
    }
    
    characterCards.forEach(function(card) {
        // 기존 이벤트 리스너 제거 후 새로 추가
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        newCard.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const character = this.getAttribute('data-character');
            console.log('클릭된 캐릭터:', character);
            if (character) {
                startGame(character);
            } else {
                console.error('캐릭터 속성을 찾을 수 없습니다!');
            }
        });
        
        // 호버 효과를 위한 스타일 확인
        newCard.style.cursor = 'pointer';
        newCard.style.userSelect = 'none';
    });
}

// DOM이 로드된 후 실행 (여러 방법 시도)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEventListeners);
} else {
    // DOM이 이미 로드된 경우
    initEventListeners();
}

// 추가 안전장치: window.onload
window.addEventListener('load', function() {
    // 이미 초기화되었는지 확인
    const cards = document.querySelectorAll('.character-card');
    let hasListeners = false;
    cards.forEach(function(card) {
        if (card.onclick || card.getAttribute('data-initialized')) {
            hasListeners = true;
        }
    });
    
    if (!hasListeners && cards.length > 0) {
        console.log('window.onload에서 이벤트 리스너 재초기화');
        initEventListeners();
    }
});

// 게임 시작
function startGame(character) {
    console.log('게임 시작:', character);
    
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
        return;
    }
    
    selectionScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    const characterNameElement = document.getElementById('current-character-name');
    if (characterNameElement) {
        characterNameElement.textContent = characterNames[character];
    }
    
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.style.display = 'none';
    }
    
    showEvent();
}

// 이벤트 표시
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

    if (!storyText || !choicesContainer || !eventNumber) {
        console.error('DOM 요소를 찾을 수 없습니다.');
        return;
    }

    eventNumber.textContent = currentEvent + 1;
    storyText.textContent = event.story;

    choicesContainer.innerHTML = '';
    event.choices.forEach(function(choice, index) {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = (index + 1) + '. ' + choice.text;
        button.addEventListener('click', function() {
            makeChoice(choice);
        });
        choicesContainer.appendChild(button);
    });
}

// 선택 처리
function makeChoice(choice) {
    // 상태 업데이트
    if (choice.effects) {
        Object.keys(choice.effects).forEach(function(key) {
            gameState[key] = Math.max(0, Math.min(100, gameState[key] + choice.effects[key]));
        });
    }

    // 결말인지 확인
    if (choice.ending) {
        showEnding(choice.ending);
    } else if (choice.next !== undefined) {
        currentEvent = choice.next;
        showEvent();
    } else {
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
    }
}

// 결말 표시
function showEnding(endingType) {
    const storyText = document.getElementById('story-text');
    const choicesContainer = document.getElementById('choices-container');
    const restartBtn = document.getElementById('restart-btn');

    if (!storyText || !choicesContainer || !restartBtn) {
        console.error('DOM 요소를 찾을 수 없습니다.');
        return;
    }

    const endingText = endings[endingType][currentCharacter];
    const statsText = '\n\n최종 수치:\n우정: ' + gameState.friendship + '\n용기: ' + gameState.courage + '\n지식: ' + gameState.knowledge;

    storyText.textContent = endingText + statsText;
    choicesContainer.innerHTML = '';
    restartBtn.style.display = 'block';
    restartBtn.onclick = function() {
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('character-selection').classList.add('active');
    };
}

