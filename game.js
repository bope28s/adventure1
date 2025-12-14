// 게임 상태
let currentPart = 1; // 현재 선택한 편 (1, 2, 3, 4, 5, 6, 7)
let currentCharacter = null;
let currentEvent = 0;
let gameState = {
    friendship: 50,
    courage: 50,
    knowledge: 50
};
let pendingChoice = null; // 선택 확인을 위한 변수

// 게임 상태 저장 함수 (sessionStorage 사용 - 새로고침 시에만 유지)
function saveGameState() {
    const state = {
        currentPart: currentPart,
        currentCharacter: currentCharacter,
        currentEvent: currentEvent,
        gameState: gameState,
        timestamp: Date.now()
    };
    try {
        // sessionStorage 사용: 새로고침만 하면 유지, 탭을 닫으면 삭제
        sessionStorage.setItem('harryPotterGameState', JSON.stringify(state));
    } catch (e) {
        console.error('게임 상태 저장 실패:', e);
    }
}

// 게임 상태 복원 함수 (sessionStorage에서 복원)
function loadGameState() {
    try {
        const saved = sessionStorage.getItem('harryPotterGameState');
        if (saved) {
            const state = JSON.parse(saved);
            // sessionStorage는 탭이 닫히면 자동으로 삭제되므로 timestamp 체크 불필요
            currentPart = state.currentPart || 1;
            currentCharacter = state.currentCharacter || null;
            currentEvent = state.currentEvent || 0;
            gameState = state.gameState || {
                friendship: 50,
                courage: 50,
                knowledge: 50
            };
            return true;
        }
    } catch (e) {
        console.error('게임 상태 복원 실패:', e);
    }
    return false;
}

// 게임 상태 초기화 함수
function clearGameState() {
    try {
        sessionStorage.removeItem('harryPotterGameState');
    } catch (e) {
        console.error('게임 상태 삭제 실패:', e);
    }
}

// 캐릭터 이름 매핑
const characterNames = {
    harry: '해리 포터',
    ron: '론 위즐리',
    hermione: '헤르미온느 그레인저'
};

// 편 제목 매핑
const partTitles = {
    1: '제 1편 : 마법사의 돌',
    2: '제 2편 : 비밀의 방',
    3: '제 3편 : 아즈카반의 죄수',
    4: '제 4편 : 불의 잔',
    5: '제 5편 : 불사조 기사단',
    6: '제 6편 : 혼혈 왕자',
    7: '제 7편 : 죽음의 성물'
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

// Web Audio API로 효과음 생성 함수
function createSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'click') {
            // 버튼 클릭 사운드 (짧고 높은 톤)
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } else if (type === 'transition') {
            // 화면 전환 사운드 (마법 효과)
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } else if (type === 'ending') {
            // 결말 사운드 (승리/성공)
            const times = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
            const frequencies = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, G5, C6, E6
            times.forEach(function(time, index) {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.setValueAtTime(frequencies[index], audioContext.currentTime + time);
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.2, audioContext.currentTime + time);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.2);
                osc.start(audioContext.currentTime + time);
                osc.stop(audioContext.currentTime + time + 0.2);
            });
        }
    } catch (err) {
        console.log('Web Audio API 오류:', err);
        // 폴백: 기본 clickSound 재생
        if (type === 'click') {
            playSound('clickSound');
        }
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

// 편 선택 함수
window.selectPart = function(partNumber) {
    createSound('click');
    currentPart = partNumber;
    saveGameState(); // 상태 저장
    
    const partSelection = document.getElementById('part-selection');
    const characterSelection = document.getElementById('character-selection');
    const partTitle = document.getElementById('part-title');
    
    if (!partSelection || !characterSelection || !partTitle) {
        console.error('화면 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 편 제목 업데이트
    partTitle.textContent = partTitles[partNumber];
    
    // 페이드 아웃 애니메이션
    partSelection.style.transition = 'opacity 0.5s ease';
    partSelection.style.opacity = '0';
    
    setTimeout(function() {
        partSelection.classList.remove('active');
        partSelection.style.display = 'none';
        characterSelection.classList.add('active');
        characterSelection.style.display = 'block';
        characterSelection.style.opacity = '0';
        characterSelection.style.transform = 'translateY(20px)';
        
        // 화면 전환 효과음
        createSound('transition');
        
        // 페이드 인 애니메이션
        setTimeout(function() {
            characterSelection.style.transition = 'all 0.5s ease';
            characterSelection.style.opacity = '1';
            characterSelection.style.transform = 'translateY(0)';
        }, 50);
    }, 500);
};

// 게임 데이터 - 각 편별, 각 주인공별 10개 이벤트 (중간 결말 포함, 질문 형태로 마무리)
const gameData = {
    1: { // 제 1편: 마법사의 돌
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
    },
    2: { // 제 2편: 비밀의 방
        harry: [
            {
                title: "여름 방학",
                story: "여름 방학 동안 더즐리 집에서 갇혀있던 나는 도비라는 집요정을 만났다. 도비는 내가 호그와트로 돌아가면 안 된다고 경고했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80",
                choices: [
                    { text: "도비의 경고를 무시하고 호그와트로 돌아간다", effects: { courage: 10 }, next: 1 },
                    { text: "도비의 말을 듣고 집에 남는다", effects: { courage: -15 }, ending: "stayed_home" },
                    { text: "도비에게 더 자세히 물어본다", effects: { knowledge: 10 }, next: 1 }
                ]
            },
            {
                title: "위즐리 집 탈출",
                story: "론의 형들이 나를 구하러 왔다! 더즐리 집에서 탈출해서 위즐리 집에서 지내게 되었다. 위즐리 집은 정말 따뜻하고 좋은 곳이었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
                choices: [
                    { text: "위즐리 가족에게 감사하며 지낸다", effects: { friendship: 15 }, next: 2 },
                    { text: "마법 세계의 일을 탐구한다", effects: { knowledge: 10 }, next: 2 },
                    { text: "조용히 지내며 방해하지 않는다", effects: { friendship: 5 }, next: 2 }
                ]
            },
            {
                title: "다이애건 앨리",
                story: "론과 함께 다이애건 앨리에 왔다. 지팡이를 수리하고 새 책을 사야 했다. 그런데 록하트 교수의 책을 너무 많이 샀다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
                choices: [
                    { text: "록하트의 책을 모두 산다", effects: { knowledge: 5 }, next: 3 },
                    { text: "필요한 것만 선택해서 산다", effects: { knowledge: 10 }, next: 3 },
                    { text: "론의 조언을 따른다", effects: { friendship: 10 }, next: 3 }
                ]
            },
            {
                title: "킹스 크로스 역",
                story: "9와 4분의 3 승강장에 들어가지 못했다! 벽이 막혀있었다. 론과 함께 어떻게든 호그와트 특급 열차에 탑승해야 했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
                choices: [
                    { text: "론과 함께 플라잉 카를 사용한다", effects: { courage: 15, friendship: 10 }, next: 4 },
                    { text: "어른들에게 도움을 요청한다", effects: { knowledge: 10, courage: -5 }, next: 4 },
                    { text: "집으로 돌아간다", effects: { courage: -20 }, ending: "gave_up_station" }
                ]
            },
            {
                title: "호그와트 도착",
                story: "호그와트에 도착했지만 위즐리 집 자동차 사고로 문제가 생겼다. 맥고나걸 교수님이 매우 화가 나셨다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80",
                choices: [
                    { text: "솔직하게 사과하고 책임을 진다", effects: { courage: 10, friendship: 5 }, next: 5 },
                    { text: "변명을 하지 않고 조용히 듣는다", effects: { knowledge: 5 }, next: 5 },
                    { text: "론에게 모든 책임을 돌린다", effects: { friendship: -20 }, ending: "blamed_ron" }
                ]
            },
            {
                title: "비밀의 방의 전설",
                story: "학교에 '비밀의 방이 열렸다'는 글이 발견되었다. 누군가가 마법사를 공격하고 있었다. 호그와트에 위험이 도사리고 있었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80",
                choices: [
                    { text: "사건을 조사하기 시작한다", effects: { courage: 15, knowledge: 10 }, next: 6 },
                    { text: "교사들에게 모든 것을 알린다", effects: { knowledge: 10, courage: -5 }, next: 6 },
                    { text: "두려워서 숨는다", effects: { courage: -20 }, ending: "hid_from_danger" }
                ]
            },
            {
                title: "뱀의 말",
                story: "듀얼 클럽에서 내가 뱀과 대화하는 것을 모두가 보았다. 모두가 내가 슬리데린의 후계자라고 생각하기 시작했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
                choices: [
                    { text: "사람들에게 설명하려고 노력한다", effects: { friendship: 10, knowledge: 5 }, next: 7 },
                    { text: "조사해서 진실을 찾아낸다", effects: { knowledge: 15, courage: 5 }, next: 7 },
                    { text: "포기하고 외톨이가 된다", effects: { friendship: -25 }, ending: "isolated" }
                ]
            },
            {
                title: "다이어리 발견",
                story: "화장실에서 이상한 다이어리를 발견했다. 톰 리들의 다이어리였다. 다이어리는 나에게 글을 쓰라고 했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
                choices: [
                    { text: "다이어리와 대화한다", effects: { knowledge: 10 }, next: 8 },
                    { text: "헤르미온느에게 보여준다", effects: { friendship: 15, knowledge: 5 }, next: 8 },
                    { text: "다이어리를 버린다", effects: { knowledge: -10 }, ending: "missed_diary" }
                ]
            },
            {
                title: "헤르미온느의 실종",
                story: "헤르미온느가 돌로 변해 실종되었다! 그녀가 남긴 메모로 거대한 거미를 찾아야 했다. 아라고그를 만나러 갔다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
                choices: [
                    { text: "용감하게 거미들의 거처로 간다", effects: { courage: 20, friendship: 15 }, next: 9 },
                    { text: "다른 방법을 찾는다", effects: { knowledge: 15 }, next: 9 },
                    { text: "두려워서 도망간다", effects: { courage: -25, friendship: -20 }, ending: "ran_from_spiders" }
                ]
            },
            {
                title: "비밀의 방",
                story: "비밀의 방에 들어갔다! 톰 리들이 나타났고, 그는 볼드모트의 16세 시절 모습이었다. 지니가 위험에 빠졌다. 나는 바실리스크와 맞서야 한다! 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80",
                choices: [
                    { text: "용감하게 바실리스크와 맞선다", effects: { courage: 25 }, ending: "courage" },
                    { text: "폭스를 불러 도움을 받는다", effects: { knowledge: 20, courage: 15 }, ending: "wisdom" },
                    { text: "지니와 함께 용감하게 맞선다", effects: { friendship: 25, courage: 10 }, ending: "friendship" }
                ]
            }
        ],
        ron: [
            {
                title: "여름 방학",
                story: "여름 방학 동안 집에서 지내고 있었다. 해리가 우리 집에 오기를 기다리고 있었다. 그런데 해리가 도비라는 집요정 때문에 문제가 생겼다는 편지를 받았다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80",
                choices: [
                    { text: "형들과 함께 해리를 구하러 간다", effects: { friendship: 15, courage: 10 }, next: 1 },
                    { text: "엄마에게 해리 문제를 말한다", effects: { friendship: 10 }, next: 1 },
                    { text: "기다리기만 한다", effects: { friendship: -10 }, ending: "waited_passively" }
                ]
            },
            {
                title: "해리의 도착",
                story: "해리가 우리 집에 왔다! 정말 기쁘다. 하지만 해리는 도비가 경고했다고 말했다. 호그와트에 위험이 있을 수 있다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
                choices: [
                    { text: "해리와 함께 조사하기로 한다", effects: { friendship: 15, courage: 5 }, next: 2 },
                    { text: "엄마에게 모든 것을 말한다", effects: { knowledge: 5 }, next: 2 },
                    { text: "무시하고 평소처럼 지낸다", effects: { friendship: -5 }, next: 2 }
                ]
            },
            {
                title: "킹스 크로스 역",
                story: "9와 4분의 3 승강장에 들어가지 못했다! 벽이 막혀있었다. 해리와 함께 어떻게든 호그와트 특급 열차에 탑승해야 했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
                choices: [
                    { text: "플라잉 카를 사용하자고 제안한다", effects: { courage: 15, friendship: 10 }, next: 3 },
                    { text: "어른들에게 도움을 요청한다", effects: { knowledge: 10, courage: -5 }, next: 3 },
                    { text: "두려워서 다른 방법을 찾는다", effects: { courage: -10 }, next: 3 }
                ]
            },
            {
                title: "플라잉 카 사고",
                story: "플라잉 카를 타고 호그와트에 도착했지만 위즐리 집 자동차와 충돌했다. 맥고나걸 교수님이 매우 화가 나셨다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80",
                choices: [
                    { text: "해리와 함께 책임을 진다", effects: { friendship: 15, courage: 10 }, next: 4 },
                    { text: "모든 책임을 자신이 진다", effects: { courage: 15, friendship: 10 }, next: 4 },
                    { text: "변명을 한다", effects: { friendship: -10 }, next: 4 }
                ]
            },
            {
                title: "비밀의 방",
                story: "학교에 '비밀의 방이 열렸다'는 글이 발견되었다. 모두가 해리가 슬리데린의 후계자라고 생각하기 시작했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80",
                choices: [
                    { text: "해리를 믿고 변호한다", effects: { friendship: 20, courage: 10 }, next: 5 },
                    { text: "해리와 함께 진실을 찾는다", effects: { friendship: 15, knowledge: 10 }, next: 5 },
                    { text: "의심하기 시작한다", effects: { friendship: -20 }, ending: "doubted_harry" }
                ]
            },
            {
                title: "듀얼 클럽",
                story: "듀얼 클럽에서 해리가 뱀과 대화하는 것을 보았다. 모두가 무서워했다. 나도 조금 무서웠지만 해리를 믿어야 했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
                choices: [
                    { text: "해리를 변호하고 옆에 선다", effects: { friendship: 20, courage: 15 }, next: 6 },
                    { text: "해리에게 뱀의 말에 대해 물어본다", effects: { friendship: 15, knowledge: 5 }, next: 6 },
                    { text: "조금 거리를 둔다", effects: { friendship: -15 }, ending: "distanced_self" }
                ]
            },
            {
                title: "다이어리 조사",
                story: "해리가 이상한 다이어리를 발견했다. 톰 리들의 다이어리였다. 헤르미온느와 함께 조사하기로 했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
                choices: [
                    { text: "해리와 헤르미온느와 함께 조사한다", effects: { friendship: 15, knowledge: 10 }, next: 7 },
                    { text: "혼자서 더 조사한다", effects: { knowledge: 15, friendship: -5 }, next: 7 },
                    { text: "교사들에게 말한다", effects: { knowledge: 10, friendship: -10 }, next: 7 }
                ]
            },
            {
                title: "헤르미온느 실종",
                story: "헤르미온느가 돌로 변해 실종되었다! 그녀가 남긴 메모를 발견했다. 거대한 거미를 찾아야 했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
                choices: [
                    { text: "해리와 함께 거미들의 거처로 간다", effects: { friendship: 20, courage: 15 }, next: 8 },
                    { text: "두려워하지만 해리를 따른다", effects: { courage: 10, friendship: 15 }, next: 8 },
                    { text: "너무 무서워서 가지 않는다", effects: { courage: -20, friendship: -20 }, ending: "too_scared" }
                ]
            },
            {
                title: "거미와의 대면",
                story: "거대한 거미 아라고그를 만났다. 거미들은 우리를 공격했다. 해리와 함께 도망쳐야 했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
                choices: [
                    { text: "용감하게 해리와 함께 싸운다", effects: { courage: 20, friendship: 20 }, next: 9 },
                    { text: "플라잉 카로 도망간다", effects: { courage: 15, friendship: 10 }, next: 9 },
                    { text: "무서워서 움직이지 못한다", effects: { courage: -25 }, ending: "frozen_fear" }
                ]
            },
            {
                title: "비밀의 방 구출",
                story: "해리가 비밀의 방에 들어갔다. 나는 지니를 구하기 위해 교사들에게 알리러 갔다. 하지만 해리를 기다리며 매우 걱정되었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80",
                choices: [
                    { text: "교사들에게 알리고 해리를 구하러 간다", effects: { friendship: 25, courage: 20 }, ending: "friendship" },
                    { text: "해리를 믿고 기다린다", effects: { friendship: 20, courage: 15 }, ending: "courage" },
                    { text: "혼자서 비밀의 방으로 들어간다", effects: { courage: 25, knowledge: 10 }, ending: "wisdom" }
                ]
            }
        ],
        hermione: [
            {
                title: "2학년 시작",
                story: "2학년이 시작되었다. 록하트 교수가 어둠의 마법 방어술 교수로 왔다. 나는 그의 책을 모두 읽었다. 하지만 뭔가 이상했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
                choices: [
                    { text: "록하트의 책을 더 자세히 연구한다", effects: { knowledge: 15 }, next: 1 },
                    { text: "해리와 론에게 록하트에 대해 말한다", effects: { friendship: 10, knowledge: 5 }, next: 1 },
                    { text: "의심하지 않고 록하트를 따른다", effects: { knowledge: -10 }, ending: "trusted_lockhart" }
                ]
            },
            {
                title: "비밀의 방",
                story: "학교에 '비밀의 방이 열렸다'는 글이 발견되었다. 나는 도서관에서 비밀의 방에 대해 조사하기 시작했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
                choices: [
                    { text: "도서관에서 집중적으로 조사한다", effects: { knowledge: 20 }, next: 2 },
                    { text: "해리와 론과 함께 조사한다", effects: { friendship: 15, knowledge: 10 }, next: 2 },
                    { text: "교사들에게 모든 것을 말한다", effects: { knowledge: 10, friendship: -5 }, next: 2 }
                ]
            },
            {
                title: "다이어리 발견",
                story: "해리가 이상한 다이어리를 발견했다. 톰 리들의 다이어리였다. 나는 이것이 매우 위험할 수 있다는 것을 직감했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
                choices: [
                    { text: "다이어리에 대해 깊이 연구한다", effects: { knowledge: 20, friendship: 5 }, next: 3 },
                    { text: "해리에게 다이어리를 버리라고 말한다", effects: { friendship: 15, knowledge: 10 }, next: 3 },
                    { text: "다이어리와 직접 대화해본다", effects: { knowledge: 15, courage: -10 }, ending: "talked_to_diary" }
                ]
            },
            {
                title: "폴리주스 물약",
                story: "드레이코 말포이가 의심스러웠다. 나는 폴리주스 물약을 만들어서 말포이를 직접 물어보기로 했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
                choices: [
                    { text: "폴리주스 물약을 완벽하게 만든다", effects: { knowledge: 20 }, next: 4 },
                    { text: "해리와 론과 함께 계획한다", effects: { friendship: 15, knowledge: 10 }, next: 4 },
                    { text: "말포이를 직접 물어본다", effects: { courage: 10, knowledge: -5 }, next: 4 }
                ]
            },
            {
                title: "실수",
                story: "폴리주스 물약을 만들 때 실수를 했다! 고양이 털을 넣었는데, 고양이가 아닌 사람 털이 필요했다. 나는 고양이 인간이 되었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
                choices: [
                    { text: "병원에 가서 치료를 받는다", effects: { knowledge: 10, courage: 5 }, next: 5 },
                    { text: "친구들에게 부끄러워서 숨는다", effects: { friendship: -15 }, ending: "hid_mistake" },
                    { text: "다시 시도해서 올바르게 만든다", effects: { knowledge: 15, courage: 10 }, next: 5 }
                ]
            },
            {
                title: "말포이 조사",
                story: "병원에서 나왔다. 말포이는 슬리데린의 후계자가 아니었다. 다른 단서를 찾아야 했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
                choices: [
                    { text: "도서관에서 더 깊이 조사한다", effects: { knowledge: 20 }, next: 6 },
                    { text: "해리와 론과 함께 다른 방법을 찾는다", effects: { friendship: 15, knowledge: 10 }, next: 6 },
                    { text: "포기하고 교사들에게 맡긴다", effects: { knowledge: -10, courage: -10 }, ending: "gave_up_investigation" }
                ]
            },
            {
                title: "바실리스크 단서",
                story: "도서관에서 바실리스크에 대한 정보를 찾았다! 거대한 뱀이었고, 시선으로 사람을 돌로 만들 수 있었다. 하지만 나는 이것을 직접 확인할 수 없었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
                choices: [
                    { text: "해리와 론에게 모든 정보를 알려준다", effects: { friendship: 20, knowledge: 15 }, next: 7 },
                    { text: "더 확실한 증거를 찾는다", effects: { knowledge: 20, friendship: -5 }, next: 7 },
                    { text: "교사들에게 즉시 알린다", effects: { knowledge: 15, friendship: -10 }, next: 7 }
                ]
            },
            {
                title: "마지막 실험",
                story: "바실리스크를 직접 보지 않고 거울을 통해 확인하려고 했다. 하지만 실수를 했다. 나는 돌로 변해버렸다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
                choices: [
                    { text: "메모를 남겨 친구들에게 단서를 준다", effects: { knowledge: 20, friendship: 20 }, next: 8 },
                    { text: "아무것도 하지 못한다", effects: { courage: -10 }, next: 8 },
                    { text: "두려워서 아무 정보도 남기지 않는다", effects: { friendship: -20 }, ending: "no_clue_left" }
                ]
            },
            {
                title: "병원",
                story: "병원에서 돌 상태로 누워있었다. 하지만 내가 남긴 메모가 해리와 론에게 도움이 되었을 것이다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
                choices: [
                    { text: "친구들을 믿고 기다린다", effects: { friendship: 20 }, next: 9 },
                    { text: "걱정되지만 아무것도 할 수 없다", effects: { courage: 5, friendship: 10 }, next: 9 },
                    { text: "자책하며 후회한다", effects: { courage: -15, knowledge: -10 }, next: 9 }
                ]
            },
            {
                title: "회복",
                story: "돌에서 풀려났다! 해리가 바실리스크를 물리치고 지니를 구했다. 나는 해리와 론에게 고마웠다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
                choices: [
                    { text: "친구들에게 깊이 감사한다", effects: { friendship: 25, courage: 10 }, ending: "friendship" },
                    { text: "앞으로 더 조심하겠다고 다짐한다", effects: { knowledge: 20, courage: 15 }, ending: "wisdom" },
                    { text: "친구들과 함께 모험을 계속한다", effects: { friendship: 20, courage: 20 }, ending: "courage" }
                ]
            }
        ]
    },
    3: { // 제 3편: 아즈카반의 죄수
        harry: [
            {
                title: "머글 여름",
                story: "여름 방학 동안 더즐리 집에서 지내고 있었다. 마법부가 마법 사용 금지 통지를 보냈다. 그런데 두들리의 고모 마지를 불어 날려버렸다! 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
                choices: [
                    { text: "집을 나가 도망간다", effects: { courage: 15 }, next: 1 },
                    { text: "마법부의 심판을 기다린다", effects: { knowledge: 10, courage: -5 }, ending: "waited_trial" },
                    { text: "위즐리 집으로 도망간다", effects: { friendship: 10, courage: 10 }, next: 1 }
                ]
            },
            {
                title: "나이트 버스",
                story: "나이트 버스에 탔다. 이상한 버스였지만 런던으로 갈 수 있었다. 위즐리 집으로 가서 상황을 설명해야 했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
                choices: [
                    { text: "위즐리 가족에게 솔직하게 설명한다", effects: { friendship: 15, courage: 5 }, next: 2 },
                    { text: "조금 숨기고 설명한다", effects: { friendship: 5 }, next: 2 },
                    { text: "아무 말도 하지 않는다", effects: { friendship: -10 }, next: 2 }
                ]
            },
            {
                title: "시리우스 블랙",
                story: "시리우스 블랙이 아즈카반에서 탈출했다는 소식이 들렸다. 그는 볼드모트의 오른팔이었고, 나의 부모님을 배신했다고 했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80",
                choices: [
                    { text: "시리우스를 찾아 복수하겠다", effects: { courage: 15, knowledge: -5 }, next: 3 },
                    { text: "진실을 조사한다", effects: { knowledge: 15, courage: 5 }, next: 3 },
                    { text: "두려워서 숨는다", effects: { courage: -20 }, ending: "hid_from_black" }
                ]
            },
            {
                title: "디멘터",
                story: "호그와트 특급 열차에서 디멘터를 만났다! 차가운 공기가 감돌았고, 나는 부모님이 죽는 소리를 다시 들었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
                choices: [
                    { text: "기절하지만 용기를 낸다", effects: { courage: 15 }, next: 4 },
                    { text: "루핀 교수에게 도움을 요청한다", effects: { knowledge: 10, friendship: 5 }, next: 4 },
                    { text: "두려워서 기절한다", effects: { courage: -15 }, next: 4 }
                ]
            },
            {
                title: "루핀 교수",
                story: "루핀 교수가 새로운 어둠의 마법 방어술 교수로 왔다. 그는 디멘터에 대해 가르쳐주었고, 패트로누스 마법을 알려주었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
                choices: [
                    { text: "루핀 교수에게 패트로누스를 열심히 배운다", effects: { knowledge: 15, courage: 10 }, next: 5 },
                    { text: "혼자서 연습한다", effects: { knowledge: 10, courage: 5 }, next: 5 },
                    { text: "포기하고 다른 방법을 찾는다", effects: { knowledge: -10, courage: -15 }, ending: "gave_up_patronus" }
                ]
            },
            {
                title: "마법 지도",
                story: "프레드와 조지에게서 마법 지도를 받았다. 호그와트의 모든 비밀 통로를 볼 수 있었다. 하지만 위험할 수도 있었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80",
                choices: [
                    { text: "지도를 사용해서 호그와트를 탐험한다", effects: { courage: 15, knowledge: 10 }, next: 6 },
                    { text: "친구들과 지도를 공유한다", effects: { friendship: 15, knowledge: 5 }, next: 6 },
                    { text: "지도를 버린다", effects: { knowledge: -10 }, ending: "threw_map" }
                ]
            },
            {
                title: "시리우스와의 대면",
                story: "시리우스 블랙을 만났다! 하지만 그는 나를 해치려 하지 않았다. 오히려 그는 진실을 말해주었다. 그는 배신자가 아니었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80",
                choices: [
                    { text: "시리우스를 믿는다", effects: { courage: 20, knowledge: 15 }, next: 7 },
                    { text: "의심하고 더 확인한다", effects: { knowledge: 15, courage: -5 }, next: 7 },
                    { text: "시리우스를 공격한다", effects: { courage: -20, knowledge: -15 }, ending: "attacked_sirius" }
                ]
            },
            {
                title: "피터 페티그루",
                story: "진짜 배신자는 피터 페티그루였다! 그는 아직 살아있었고, 쥐 스캐버스로 변신해서 론과 함께 있었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&q=80",
                choices: [
                    { text: "피터를 잡아서 진실을 밝힌다", effects: { courage: 20, friendship: 15 }, next: 8 },
                    { text: "론에게 스캐버스의 진실을 말한다", effects: { friendship: 20, knowledge: 10 }, next: 8 },
                    { text: "혼란스러워서 아무것도 하지 않는다", effects: { courage: -15, knowledge: -10 }, ending: "did_nothing" }
                ]
            },
            {
                title: "시간을 되돌리다",
                story: "헤르미온느와 함께 시간 변환기를 사용해서 과거로 돌아갔다. 버크와 시리우스를 구할 수 있었다. 하지만 시간 여행은 위험했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
                choices: [
                    { text: "과거를 바꾸기 위해 신중하게 행동한다", effects: { knowledge: 20, courage: 15 }, next: 9 },
                    { text: "용감하게 과거로 가서 구한다", effects: { courage: 20, friendship: 15 }, next: 9 },
                    { text: "두려워서 과거로 가지 않는다", effects: { courage: -20 }, ending: "didnt_time_travel" }
                ]
            },
            {
                title: "패트로누스",
                story: "과거의 자신을 구하기 위해 패트로누스를 시전해야 했다. 나는 강한 기억을 생각하며 패트로누스를 만들어냈다. 시리우스와 버크를 구했다! 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80",
                choices: [
                    { text: "시리우스와 버크를 구하는 데 성공한다", effects: { courage: 25, friendship: 20 }, ending: "courage" },
                    { text: "시간 여행의 지혜를 사용한다", effects: { knowledge: 25, courage: 15 }, ending: "wisdom" },
                    { text: "친구들과 함께 구한다", effects: { friendship: 25, courage: 20 }, ending: "friendship" }
                ]
            }
        ],
        ron: [
            {
                title: "이집트 여행",
                story: "가족과 함께 이집트로 여행을 갔다. 아빠가 로또에 당첨되어서 가능했다. 정말 즐거운 여행이었다. 해리에게도 선물을 샀다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73612?w=800&q=80",
                choices: [
                    { text: "해리에게 선물을 보낸다", effects: { friendship: 15 }, next: 1 },
                    { text: "이집트에서 더 많은 것을 본다", effects: { knowledge: 10 }, next: 1 },
                    { text: "여행만 즐긴다", effects: { friendship: 5 }, next: 1 }
                ]
            },
            {
                title: "스캐버스",
                story: "스캐버스가 아파 보였다. 내 쥐였고 정말 아꼈다. 하지만 크룩섕스가 스캐버스를 계속 쫓았다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
                choices: [
                    { text: "크룩섕스를 막고 스캐버스를 보호한다", effects: { courage: 10, friendship: -5 }, next: 2 },
                    { text: "크룩섕스에게 스캐버스를 숨긴다", effects: { knowledge: 5 }, next: 2 },
                    { text: "스캐버스가 아프다고 생각한다", effects: { friendship: 5 }, next: 2 }
                ]
            },
            {
                title: "시리우스 블랙",
                story: "시리우스 블랙이 아즈카반에서 탈출했다는 소식을 들었다. 그는 해리를 노리고 있었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80",
                choices: [
                    { text: "해리를 보호하겠다고 다짐한다", effects: { friendship: 20, courage: 15 }, next: 3 },
                    { text: "해리와 함께 조심한다", effects: { friendship: 15, courage: 10 }, next: 3 },
                    { text: "두려워한다", effects: { courage: -10 }, next: 3 }
                ]
            },
            {
                title: "크룩섕스",
                story: "크룩섕스를 받았다. 헤르미온느의 고양이였다. 크룩섕스는 스캐버스를 계속 쫓았다. 나는 화가 났다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
                choices: [
                    { text: "헤르미온느와 다툰다", effects: { friendship: -15 }, ending: "fought_hermione" },
                    { text: "크룩섕스를 이해하려고 노력한다", effects: { knowledge: 10, friendship: 5 }, next: 4 },
                    { text: "스캐버스를 더 잘 보호한다", effects: { courage: 5 }, next: 4 }
                ]
            },
            {
                title: "마법 지도",
                story: "프레드와 조지에게서 마법 지도를 받았다. 하지만 해리에게 주었다. 나는 해리를 믿었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80",
                choices: [
                    { text: "해리와 함께 지도를 사용한다", effects: { friendship: 15, courage: 10 }, next: 5 },
                    { text: "해리를 믿고 맡긴다", effects: { friendship: 20 }, next: 5 },
                    { text: "지도를 다시 받아온다", effects: { friendship: -10 }, ending: "took_map_back" }
                ]
            },
            {
                title: "퀴디치 경기",
                story: "해리의 퀴디치 경기 날이었다. 디멘터들이 나타났다. 해리가 떨어졌다. 나는 매우 걱정되었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&q=80",
                choices: [
                    { text: "해리를 도와주러 간다", effects: { friendship: 20, courage: 15 }, next: 6 },
                    { text: "교사들에게 도움을 요청한다", effects: { knowledge: 10, friendship: 10 }, next: 6 },
                    { text: "걱정하지만 기다린다", effects: { friendship: 10 }, next: 6 }
                ]
            },
            {
                title: "시리우스 발견",
                story: "시리우스 블랙을 발견했다! 해리와 함께 시리우스를 따라갔다. 시리우스가 해리를 공격할 것 같았다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80",
                choices: [
                    { text: "해리를 보호하고 시리우스와 맞선다", effects: { courage: 20, friendship: 25 }, next: 7 },
                    { text: "도움을 요청하러 간다", effects: { knowledge: 10, friendship: 15 }, next: 7 },
                    { text: "도망간다", effects: { courage: -20, friendship: -25 }, ending: "ran_away" }
                ]
            },
            {
                title: "스캐버스의 진실",
                story: "스캐버스가 사실 피터 페티그루였다! 그는 내 부모님을 배신했다. 나는 믿을 수 없었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
                choices: [
                    { text: "피터를 잡아서 진실을 밝힌다", effects: { courage: 20, friendship: 15 }, next: 8 },
                    { text: "믿을 수 없어서 확인한다", effects: { knowledge: 15, courage: 5 }, next: 8 },
                    { text: "충격에 빠져 아무것도 하지 않는다", effects: { courage: -15, knowledge: -10 }, ending: "shocked" }
                ]
            },
            {
                title: "시리우스 도움",
                story: "시리우스가 무죄라는 것을 알게 되었다. 그를 도와야 했다. 하지만 디멘터들이 다가오고 있었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80",
                choices: [
                    { text: "시리우스를 구하기 위해 싸운다", effects: { courage: 20, friendship: 20 }, next: 9 },
                    { text: "해리와 함께 시리우스를 구한다", effects: { friendship: 25, courage: 15 }, next: 9 },
                    { text: "두려워서 도망간다", effects: { courage: -20 }, ending: "fled_from_dementors" }
                ]
            },
            {
                title: "해피 엔딩",
                story: "피터는 도망갔지만 시리우스는 구했다. 해리에게 시리우스가 대부라는 것을 알려줄 수 있었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80",
                choices: [
                    { text: "해리에게 시리우스의 이야기를 전한다", effects: { friendship: 25, courage: 15 }, ending: "friendship" },
                    { text: "시리우스를 도와 탈출시킨다", effects: { courage: 25, friendship: 20 }, ending: "courage" },
                    { text: "진실을 찾아내는 데 성공한다", effects: { knowledge: 25, friendship: 15 }, ending: "wisdom" }
                ]
            }
        ],
        hermione: [
            {
                title: "3학년 시작",
                story: "3학년이 시작되었다. 나는 모든 과목을 듣고 싶었지만 시간이 부족했다. 그래서 시간 변환기를 받았다. 하지만 이것은 비밀이어야 했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
                choices: [
                    { text: "시간 변환기를 사용해서 모든 수업을 듣는다", effects: { knowledge: 20 }, next: 1 },
                    { text: "친구들에게 비밀로 한다", effects: { knowledge: 15, friendship: 5 }, next: 1 },
                    { text: "시간 변환기를 사용하지 않는다", effects: { knowledge: -15 }, ending: "no_time_turner" }
                ]
            },
            {
                title: "루핀 교수",
                story: "루핀 교수가 새로운 어둠의 마법 방어술 교수로 왔다. 그는 정말 좋은 교수였다. 나는 그의 수업을 좋아했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
                choices: [
                    { text: "루핀 교수의 수업에 열심히 참여한다", effects: { knowledge: 15, courage: 5 }, next: 2 },
                    { text: "루핀 교수에 대해 더 알아본다", effects: { knowledge: 15 }, next: 2 },
                    { text: "평소처럼 공부한다", effects: { knowledge: 10 }, next: 2 }
                ]
            },
            {
                title: "디멘터 수업",
                story: "루핀 교수가 보그트를 사용해서 디멘터를 가르쳐주었다. 나는 패트로누스 마법을 배우고 싶었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
                choices: [
                    { text: "패트로누스를 열심히 연습한다", effects: { knowledge: 20, courage: 15 }, next: 3 },
                    { text: "도서관에서 패트로누스에 대해 더 배운다", effects: { knowledge: 20 }, next: 3 },
                    { text: "해리와 론과 함께 연습한다", effects: { friendship: 15, knowledge: 10 }, next: 3 }
                ]
            },
            {
                title: "크룩섕스와 스캐버스",
                story: "크룩섕스가 스캐버스를 계속 쫓았다. 론이 화가 났다. 하지만 크룩섕스는 단순히 고양이가 아니었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
                choices: [
                    { text: "크룩섕스가 특별하다는 것을 직감한다", effects: { knowledge: 15 }, next: 4 },
                    { text: "론과 다툰다", effects: { friendship: -15 }, ending: "fought_ron" },
                    { text: "크룩섕스를 막으려고 노력한다", effects: { friendship: 5 }, next: 4 }
                ]
            },
            {
                title: "해리의 패트로누스",
                story: "해리가 패트로누스를 배우고 있었다. 그는 어려워했다. 나는 도와주고 싶었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&q=80",
                choices: [
                    { text: "해리에게 패트로누스 이론을 가르쳐준다", effects: { friendship: 15, knowledge: 10 }, next: 5 },
                    { text: "해리를 격려한다", effects: { friendship: 20, courage: 10 }, next: 5 },
                    { text: "해리가 스스로 배우도록 둔다", effects: { friendship: 5 }, next: 5 }
                ]
            },
            {
                title: "루핀의 비밀",
                story: "루핀 교수가 늑대인간이라는 것을 알게 되었다. 하지만 나는 그를 두려워하지 않았다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
                choices: [
                    { text: "루핀 교수를 그대로 받아들인다", effects: { knowledge: 15, courage: 10 }, next: 6 },
                    { text: "루핀 교수에 대해 더 연구한다", effects: { knowledge: 20 }, next: 6 },
                    { text: "두려워서 거리를 둔다", effects: { courage: -15, knowledge: -10 }, ending: "feared_lupin" }
                ]
            },
            {
                title: "시리우스 블랙",
                story: "시리우스 블랙을 만났다. 하지만 그는 해리를 해치려 하지 않았다. 오히려 진실을 말해주었다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80",
                choices: [
                    { text: "시리우스의 말을 분석한다", effects: { knowledge: 20, friendship: 10 }, next: 7 },
                    { text: "시리우스를 믿고 해리를 돕는다", effects: { friendship: 20, courage: 15 }, next: 7 },
                    { text: "의심한다", effects: { knowledge: 10, friendship: -5 }, next: 7 }
                ]
            },
            {
                title: "피터 페티그루",
                story: "피터 페티그루가 진짜 배신자였다! 스캐버스가 사실 피터였다. 나는 크룩섕스가 맞았다는 것을 깨달았다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
                choices: [
                    { text: "피터를 잡아서 진실을 밝힌다", effects: { knowledge: 20, courage: 15 }, next: 8 },
                    { text: "론에게 크룩섕스가 옳았다고 말한다", effects: { friendship: 15, knowledge: 10 }, next: 8 },
                    { text: "증거를 더 모은다", effects: { knowledge: 20, friendship: -5 }, next: 8 }
                ]
            },
            {
                title: "시간 변환기",
                story: "시간 변환기를 사용해서 과거로 돌아가야 했다. 버크와 시리우스를 구할 수 있었다. 하지만 시간 여행은 위험했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
                choices: [
                    { text: "신중하게 시간 여행을 계획한다", effects: { knowledge: 25, courage: 10 }, next: 9 },
                    { text: "해리와 함께 용감하게 간다", effects: { friendship: 20, courage: 20 }, next: 9 },
                    { text: "두려워서 가지 않는다", effects: { courage: -20 }, ending: "afraid_time_travel" }
                ]
            },
            {
                title: "시간 여행 성공",
                story: "시간 여행에 성공했다! 버크와 시리우스를 구했다. 나의 논리와 시간 변환기가 모든 것을 해결했다. 어떻게 할까?",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80",
                choices: [
                    { text: "시간 여행의 지혜를 사용한다", effects: { knowledge: 25, friendship: 15 }, ending: "wisdom" },
                    { text: "친구들과 함께 구한다", effects: { friendship: 25, courage: 20 }, ending: "friendship" },
                    { text: "용감하게 모든 위험을 감수한다", effects: { courage: 25, friendship: 15 }, ending: "courage" }
                ]
            }
        ]
    }
};

// 결말 텍스트 (편별로 구분)
const endings = {
    1: { // 제 1편: 마법사의 돌
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
            harry: 12
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
            harry: 32
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
            harry: 18
        },
        harry: "마법을 포기한 해리는 호그와트에서 제대로 된 교육을 받지 못했다. 다른 학생들보다 뒤처진 해리는 자신감을 잃었고, 결국 마법 세계에서 도망치듯 떠났다. 마법사의 피를 가지고도 마법을 사용하지 못하는 비극적인 결말이었다."
    },
    coward: {
        title: {
            harry: "😨 용기 없는 소년"
        },
        originalMatchRate: {
            harry: 25
        },
        harry: "트롤 앞에서 도망친 해리는 헤르미온느를 구하지 못했다. 론은 해리를 실망스러워했고, 해리는 자신의 용기 부족에 대해 깊이 후회했다. 이 사건 이후 해리는 친구들의 신뢰를 잃었고, 외로워졌다."
    },
    quit_quidditch: {
        title: {
            harry: "🏃 포기한 선수"
        },
        originalMatchRate: {
            harry: 28
        },
        harry: "퀴디치 경기를 포기한 해리는 그리핀도르 팀의 실망을 샀다. 퀴디치를 좋아했던 해리였지만, 두려움에 굴복한 선택은 해리의 명성을 손상시켰다. 이후 해리는 퀴디치를 다시 하지 않았다."
    },
    mirror_addiction: {
        title: {
            harry: "🪞 과거에 사로잡힌 소년"
        },
        originalMatchRate: {
            harry: 38
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
            ron: 12
        },
        ron: "부끄러워서 다른 칸으로 이동한 론은 해리와 친구가 되지 못했다. 론은 혼자서 호그와트 생활을 시작했고, 해리와 헤르미온느는 다른 친구들과 함께했다. 론의 수줍음이 큰 기회를 놓치게 했다."
    },
    ron_gave_up: {
        title: {
            ron: "💔 포기한 소년"
        },
        originalMatchRate: {
            ron: 18
        },
        ron: "마법을 포기한 론은 호그와트에서 제대로 된 교육을 받지 못했다. 형들처럼 뛰어난 마법사가 되고 싶었지만, 포기한 론은 점점 뒤처졌다. 론의 부모님은 실망했고, 론 자신도 자신감을 잃었다."
    },
    ron_coward: {
        title: {
            ron: "😨 용기 없는 소년"
        },
        originalMatchRate: {
            ron: 25
        },
        ron: "트롤 앞에서 도망친 론은 헤르미온느를 구하지 못했다. 해리는 론을 실망스러워했고, 론은 자신의 용기 부족에 대해 깊이 후회했다. 이 사건 이후 론은 해리와 헤르미온느의 신뢰를 잃었고, 외로워졌다."
    },
    ron_passive: {
        title: {
            ron: "😐 수동적인 친구"
        },
        originalMatchRate: {
            ron: 28
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
            ron: 42
        },
        ron: "교사들에게 알린 론은 해리와 헤르미온느의 모험을 막았다. 교사들이 개입하면서 마법사의 돌은 안전하게 보호되었지만, 론은 친구들의 신뢰를 잃었다. 때로는 규칙을 지키는 것보다 친구를 믿는 것이 중요하다는 것을 나중에 깨달았다."
    },
    // 헤르미온느의 결말들
    hermione_lonely: {
        title: {
            hermione: "😢 외로운 마법사"
        },
        originalMatchRate: {
            hermione: 33
        },
        hermione: "공부만 하고 친구를 사귀지 않은 헤르미온느는 호그와트에서 외로웠다. 똑똑했지만 친구가 없었던 헤르미온느는 많은 위기 상황에서 혼자서 해결해야 했다. 지식은 많았지만, 우정의 힘을 알지 못했다."
    },
    hermione_arrogant: {
        title: {
            hermione: "😤 자만심에 빠진 마법사"
        },
        originalMatchRate: {
            hermione: 25
        },
        hermione: "자만심에 빠진 헤르미온느는 공부를 게을리했다. 처음에는 뛰어났지만, 자만심으로 인해 다른 학생들에게 뒤처지기 시작했다. 겸손함의 중요성을 깨달았지만, 이미 늦었다."
    },
    hermione_hiding: {
        title: {
            hermione: "😰 숨어버린 마법사"
        },
        originalMatchRate: {
            hermione: 22
        },
        hermione: "화장실에 숨어있던 헤르미온느는 해리와 론이 트롤과 싸우는 것을 보았다. 하지만 그녀는 아무것도 하지 못했다. 용기를 내지 못한 헤르미온느는 자신의 한계를 깨달았고, 이후로도 용기 있는 선택을 하지 못했다."
    },
    hermione_stubborn: {
        title: {
            hermione: "🤦 고집스러운 마법사"
        },
        originalMatchRate: {
            hermione: 28
        },
        hermione: "실수를 인정하지 않은 헤르미온느는 고집스러운 태도로 친구들을 멀리했다. 자신의 실수를 인정하지 않으려는 헤르미온느는 점점 외로워졌고, 친구들의 신뢰를 잃었다. 때로는 실수를 인정하는 것이 더 큰 용기라는 것을 나중에 깨달았다."
    },
    hermione_secretive: {
        title: {
            hermione: "🤐 비밀스러운 마법사"
        },
        originalMatchRate: {
            hermione: 28
        },
        hermione: "정보를 혼자만 알고 행동한 헤르미온느는 해리와 론을 배제했다. 헤르미온느는 혼자서 문제를 해결하려고 했지만, 실패했다. 우정은 정보를 나누는 것에서 시작한다는 것을 깨달았지만, 이미 늦었다."
    },
    hermione_told_teachers: {
        title: {
            hermione: "📚 규칙을 따른 마법사"
        },
        originalMatchRate: {
            hermione: 48
        },
        hermione: "교사들에게 알린 헤르미온느는 해리와 론의 모험을 막았다. 규칙을 지키는 것이 중요하다고 생각했지만, 때로는 친구를 믿고 함께 위험을 감수하는 것이 더 중요하다는 것을 나중에 깨달았다."
        }
    },
    2: { // 제 2편: 비밀의 방
        // 성공 결말들
        courage: {
            title: {
                harry: "🏆 용감한 영웅",
                ron: "🏆 용감한 친구",
                hermione: "🏆 용감한 마법사"
            },
            originalMatchRate: {
                harry: 88,
                ron: 82,
                hermione: 80
            },
            harry: "용감하게 바실리스크와 맞선 해리는 비밀의 방의 위험을 물리쳤다! 그리핀도르의 검으로 바실리스크를 물리치고 지니를 구했다. 해리는 진정한 용기를 보여주었다.",
            ron: "용감하게 해리와 함께 거미들과 맞선 론은 친구를 구했다! 론의 용기는 그리핀도르의 진정한 정신을 보여주었다. 친구들은 론을 영웅으로 기억했다.",
            hermione: "용감하게 친구들과 함께 모험을 계속한 헤르미온느는 지식뿐만 아니라 용기도 가지고 있음을 증명했다! 그녀의 용기는 모든 것을 바꿨다."
        },
        wisdom: {
            title: {
                harry: "🧠 지혜로운 영웅",
                ron: "🧠 현명한 친구",
                hermione: "🧠 지혜로운 마법사"
            },
            originalMatchRate: {
                harry: 80,
                ron: 75,
                hermione: 92
            },
            harry: "지혜롭게 폭스를 불러 도움을 받은 해리는 바실리스크를 물리쳤다! 해리는 단순한 용기보다 더 큰 지혜를 보여주었다. 비밀의 방의 위험은 해결되었고, 해리는 현명한 선택을 했다.",
            ron: "론은 다른 방법을 찾아 친구들을 구했다! 때로는 직접 맞서는 것보다 더 현명한 방법이 있다는 것을 보여주었다. 론의 지혜는 모두를 구했다.",
            hermione: "헤르미온느의 지식과 논리적 사고가 모든 것을 해결했다! 그녀가 남긴 메모가 해리와 론에게 중요한 단서를 주었다. 진정한 지혜의 승리였다!"
        },
        friendship: {
            title: {
                harry: "💝 우정 있는 영웅",
                ron: "💝 진실한 친구",
                hermione: "💝 우정 있는 마법사"
            },
            originalMatchRate: {
                harry: 85,
                ron: 88,
                hermione: 85
            },
            harry: "지니와 함께 용감하게 맞선 해리는 친구의 도움으로 위기를 극복했다! 해리는 혼자가 아니라는 것을 깨달았다. 진정한 우정의 힘이 톰 리들보다 강하다는 것을 증명했다.",
            ron: "론의 우정과 희생이 친구들을 구했다! 론은 해리를 믿고 기다렸고, 교사들에게 알려 해리를 구했다. 진정한 우정의 힘이 승리했다!",
            hermione: "헤르미온느의 지원과 우정이 해리를 구했다! 그녀가 남긴 메모와 정보가 친구들을 도왔다. 우정의 힘이 마법보다 강하다는 것을 증명했다!"
        },
        // 제 2편 비밀의 방 - 해리
        stayed_home: {
        title: {
            harry: "😔 집에 남은 소년"
        },
        originalMatchRate: {
            harry: 8
        },
        harry: "도비의 말을 듣고 집에 남은 해리는 호그와트로 돌아가지 않았다. 하지만 도비는 해리가 필요하다는 것을 알고 있었고, 해리는 중요한 모험을 놓쳤다."
    },
    gave_up_station: {
        title: {
            harry: "😰 포기한 소년"
        },
        originalMatchRate: {
            harry: 10
        },
        harry: "승강장에 들어가지 못하고 포기한 해리는 호그와트로 돌아가지 못했다. 하지만 해리의 친구들은 해리를 기다리고 있었다."
    },
    blamed_ron: {
        title: {
            harry: "😤 책임을 돌린 소년"
        },
        originalMatchRate: {
            harry: 15
        },
        harry: "론에게 모든 책임을 돌린 해리는 친구의 신뢰를 잃었다. 진정한 친구는 함께 책임을 진다는 것을 나중에 깨달았다."
    },
    hid_from_danger: {
        title: {
            harry: "😨 위험에서 숨은 소년"
        },
        originalMatchRate: {
            harry: 20
        },
        harry: "비밀의 방의 위험에서 숨은 해리는 문제를 해결하지 못했다. 용기를 내지 못한 해리는 자신의 한계를 깨달았다."
    },
    isolated: {
        title: {
            harry: "😢 외로운 소년"
        },
        originalMatchRate: {
            harry: 18
        },
        harry: "모두가 해리를 두려워하며 외톨이로 만든 해리는 친구들을 잃었다. 하지만 진정한 친구들은 해리를 믿었다."
    },
    missed_diary: {
        title: {
            harry: "📖 놓친 단서"
        },
        originalMatchRate: {
            harry: 25
        },
        harry: "다이어리를 버린 해리는 중요한 단서를 놓쳤다. 톰 리들의 비밀을 알아내지 못한 해리는 문제를 해결하는 데 어려움을 겪었다."
    },
    ran_from_spiders: {
        title: {
            harry: "🕷️ 거미에게서 도망친 소년"
        },
        originalMatchRate: {
            harry: 22
        },
        harry: "거미들 앞에서 도망친 해리는 헤르미온느를 구하지 못했다. 두려움에 굴복한 해리는 자신의 용기를 다시 생각해봐야 했다."
    },
    // 제 2편 - 론
    waited_passively: {
        title: {
            ron: "😐 수동적인 소년"
        },
        originalMatchRate: {
            ron: 12
        },
        ron: "기다리기만 한 론은 해리를 도와주지 못했다. 론의 수동적인 태도는 친구들에게 실망을 주었다."
    },
    doubted_harry: {
        title: {
            ron: "🤔 의심한 친구"
        },
        originalMatchRate: {
            ron: 20
        },
        ron: "해리를 의심한 론은 친구의 신뢰를 손상시켰다. 진정한 친구는 서로를 믿는다는 것을 깨달았다."
    },
    distanced_self: {
        title: {
            ron: "😔 거리를 둔 친구"
        },
        originalMatchRate: {
            ron: 15
        },
        ron: "해리와 거리를 둔 론은 친구의 곁에 서지 못했다. 진정한 우정은 어려울 때 함께하는 것이라는 것을 배웠다."
    },
    too_scared: {
        title: {
            ron: "😰 너무 무서워한 소년"
        },
        originalMatchRate: {
            ron: 18
        },
        ron: "너무 무서워서 해리와 함께 가지 못한 론은 친구를 혼자 두었다. 용기를 내지 못한 론은 후회했다."
    },
    frozen_fear: {
        title: {
            ron: "❄️ 두려움에 얼어버린 소년"
        },
        originalMatchRate: {
            ron: 15
        },
        ron: "두려움에 얼어버린 론은 아무것도 할 수 없었다. 하지만 해리는 론을 이해하고 있었다."
    },
    // 제 2편 - 헤르미온느
    trusted_lockhart: {
        title: {
            hermione: "📚 록하트를 신뢰한 마법사"
        },
        originalMatchRate: {
            hermione: 20
        },
        hermione: "록하트를 무조건 신뢰한 헤르미온느는 큰 실수를 했다. 때로는 비판적인 사고가 필요하다는 것을 배웠다."
    },
    talked_to_diary: {
        title: {
            hermione: "📖 다이어리와 대화한 마법사"
        },
        originalMatchRate: {
            hermione: 15
        },
        hermione: "다이어리와 직접 대화한 헤르미온느는 위험에 빠졌다. 경고를 무시한 것이 큰 실수였다."
    },
    hid_mistake: {
        title: {
            hermione: "😳 실수를 숨긴 마법사"
        },
        originalMatchRate: {
            hermione: 18
        },
        hermione: "폴리주스 물약 실수를 숨긴 헤르미온느는 친구들과의 신뢰를 손상시켰다. 실수를 인정하는 것이 용기라는 것을 배웠다."
    },
    gave_up_investigation: {
        title: {
            hermione: "💔 조사를 포기한 마법사"
        },
        originalMatchRate: {
            hermione: 20
        },
        hermione: "조사를 포기한 헤르미온느는 문제 해결을 포기했다. 하지만 때로는 포기하는 것도 현명한 선택일 수 있다."
    },
    no_clue_left: {
        title: {
            hermione: "📝 단서를 남기지 않은 마법사"
        },
        originalMatchRate: {
            hermione: 15
        },
        hermione: "단서를 남기지 않은 헤르미온느는 친구들을 도울 수 없었다. 협력의 중요성을 깨달았다."
        }
    },
    3: { // 제 3편: 아즈카반의 죄수
        // 성공 결말들
        courage: {
            title: {
                harry: "🏆 용감한 영웅",
                ron: "🏆 용감한 친구",
                hermione: "🏆 용감한 마법사"
            },
            originalMatchRate: {
                harry: 85,
                ron: 80,
                hermione: 78
            },
            harry: "용감하게 시리우스와 버크를 구한 해리는 패트로누스로 디멘터들을 물리쳤다! 해리는 진정한 그리핀도르의 용기를 보여주었다. 시리우스는 탈출했고, 해리는 대부를 찾았다.",
            ron: "용감하게 시리우스를 도와 탈출시킨 론은 친구를 구했다! 론의 용기는 그리핀도르의 진정한 정신을 보여주었다. 친구들은 론을 영웅으로 기억했다.",
            hermione: "용감하게 모든 위험을 감수한 헤르미온느는 시간 여행으로 시리우스를 구했다! 그녀의 용기는 모든 것을 바꿨다."
        },
        wisdom: {
            title: {
                harry: "🧠 지혜로운 영웅",
                ron: "🧠 현명한 친구",
                hermione: "🧠 지혜로운 마법사"
            },
            originalMatchRate: {
                harry: 78,
                ron: 72,
                hermione: 90
            },
            harry: "지혜롭게 시간 여행을 사용한 해리는 시리우스와 버크를 구했다! 해리는 단순한 용기보다 더 큰 지혜를 보여주었다. 시간의 힘을 현명하게 사용했다.",
            ron: "론은 진실을 찾아내는 데 성공했다! 때로는 직접 맞서는 것보다 더 현명한 방법이 있다는 것을 보여주었다. 론의 지혜는 모두를 구했다.",
            hermione: "헤르미온느의 지식과 시간 여행의 지혜가 모든 것을 해결했다! 그녀의 똑똑함이 친구들을 구했고, 시리우스도 안전하게 탈출했다. 진정한 지혜의 승리였다!"
        },
        friendship: {
            title: {
                harry: "💝 우정 있는 영웅",
                ron: "💝 진실한 친구",
                hermione: "💝 우정 있는 마법사"
            },
            originalMatchRate: {
                harry: 83,
                ron: 86,
                hermione: 84
            },
            harry: "친구들과 함께 시리우스를 구한 해리는 혼자가 아니라는 것을 깨달았다! 진정한 우정의 힘이 디멘터보다 강하다는 것을 증명했다.",
            ron: "론의 우정과 희생이 해리를 구했다! 론은 해리에게 시리우스의 이야기를 전하고 함께 시리우스를 도왔다. 진정한 우정의 힘이 승리했다!",
            hermione: "헤르미온느의 지원과 우정이 해리를 구했다! 그녀는 친구를 위해 시간 여행의 위험을 감수했다. 우정의 힘이 마법보다 강하다는 것을 증명했다!"
        },
        // 제 3편 조기 포기 결말들
        waited_trial: {
            title: {
                harry: "⚖️ 심판을 기다린 소년"
            },
            originalMatchRate: {
                harry: 25
            },
            harry: "마법부의 심판을 기다린 해리는 집에 남아야 했다. 하지만 때로는 규칙을 따르는 것이 필요하다."
        },
        hid_from_black: {
            title: {
                harry: "😨 블랙에게서 숨은 소년"
            },
            originalMatchRate: {
                harry: 20
            },
            harry: "시리우스 블랙에게서 숨은 해리는 진실을 알아내지 못했다. 두려움은 진실을 가린다는 것을 배웠다."
        },
        gave_up_patronus: {
            title: {
                harry: "💔 패트로누스를 포기한 소년"
            },
            originalMatchRate: {
                harry: 15
            },
            harry: "패트로누스를 포기한 해리는 디멘터에 대항할 수 없었다. 연습의 중요성을 깨달았다."
        },
        threw_map: {
            title: {
                harry: "🗺️ 지도를 버린 소년"
            },
            originalMatchRate: {
                harry: 18
            },
            harry: "마법 지도를 버린 해리는 호그와트의 비밀을 잃었다. 소중한 것을 함부로 버리지 말아야 한다는 것을 배웠다."
        },
        attacked_sirius: {
            title: {
                harry: "⚔️ 시리우스를 공격한 소년"
            },
            originalMatchRate: {
                harry: 10
            },
            harry: "시리우스를 공격한 해리는 큰 실수를 했다. 진실을 확인하기 전에 행동하지 말아야 한다는 것을 깨달았다."
        },
        did_nothing: {
            title: {
                harry: "😐 아무것도 하지 않은 소년"
            },
            originalMatchRate: {
                harry: 12
            },
            harry: "혼란스러워서 아무것도 하지 않은 해리는 중요한 순간을 놓쳤다. 행동하는 것이 때로는 필요하다는 것을 배웠다."
        },
        didnt_time_travel: {
            title: {
                harry: "⏰ 시간 여행을 하지 않은 소년"
            },
            originalMatchRate: {
                harry: 15
            },
            harry: "두려워서 시간 여행을 하지 않은 해리는 시리우스를 구하지 못했다. 용기를 내야 할 때가 있다는 것을 배웠다."
        },
        // 제 3편 - 론
        fought_hermione: {
            title: {
                ron: "😤 헤르미온느와 다툰 소년"
            },
            originalMatchRate: {
                ron: 18
            },
            ron: "크룩섕스 때문에 헤르미온느와 다툰 론은 친구의 신뢰를 잃었다. 작은 일로 큰 우정을 잃지 말아야 한다는 것을 배웠다."
        },
        took_map_back: {
            title: {
                ron: "🗺️ 지도를 다시 받아온 소년"
            },
            originalMatchRate: {
                ron: 15
            },
            ron: "지도를 다시 받아온 론은 해리의 신뢰를 손상시켰다. 친구를 믿는 것이 중요하다는 것을 깨달았다."
        },
        ran_away: {
            title: {
                ron: "🏃 도망친 소년"
            },
            originalMatchRate: {
                ron: 10
            },
            ron: "시리우스 앞에서 도망친 론은 해리를 혼자 두었다. 진정한 친구는 함께 위험을 감수한다는 것을 배웠다."
        },
        shocked: {
            title: {
                ron: "😱 충격에 빠진 소년"
            },
            originalMatchRate: {
                ron: 12
            },
            ron: "스캐버스의 진실에 충격받아 아무것도 하지 못한 론은 기회를 놓쳤다. 하지만 해리는 론을 이해했다."
        },
        fled_from_dementors: {
            title: {
                ron: "👻 디멘터에게서 도망친 소년"
            },
            originalMatchRate: {
                ron: 15
            },
            ron: "디멘터에게서 도망친 론은 시리우스를 구하지 못했다. 하지만 때로는 도망치는 것도 용기일 수 있다."
        },
        // 제 3편 - 헤르미온느
        no_time_turner: {
            title: {
                hermione: "⏰ 시간 변환기를 사용하지 않은 마법사"
            },
            originalMatchRate: {
                hermione: 15
            },
            hermione: "시간 변환기를 사용하지 않은 헤르미온느는 모든 수업을 들을 수 없었다. 하지만 때로는 선택이 필요하다는 것을 배웠다."
        },
        fought_ron: {
            title: {
                hermione: "😤 론과 다툰 마법사"
            },
            originalMatchRate: {
                hermione: 18
            },
            hermione: "크룩섕스 때문에 론과 다툰 헤르미온느는 친구의 신뢰를 잃었다. 작은 일로 우정을 해치지 말아야 한다는 것을 배웠다."
        },
        feared_lupin: {
            title: {
                hermione: "😨 루핀을 두려워한 마법사"
            },
            originalMatchRate: {
                hermione: 20
            },
            hermione: "루핀 교수가 늑대인간이라는 것을 알고 두려워한 헤르미온느는 좋은 교수를 잃었다. 진실을 이해하는 것이 중요하다는 것을 배웠다."
        },
        afraid_time_travel: {
            title: {
                hermione: "😰 시간 여행을 두려워한 마법사"
            },
            originalMatchRate: {
                hermione: 15
            },
            hermione: "두려워서 시간 여행을 하지 않은 헤르미온느는 시리우스를 구하지 못했다. 하지만 때로는 신중함이 필요하다는 것을 배웠다."
        }
    },
    4: { // 제 4편: 불의 잔
        courage: {
            title: {
                harry: "🏆 용감한 챔피언",
                ron: "🏆 용감한 친구",
                hermione: "🏆 용감한 지원자"
            },
            originalMatchRate: {
                harry: 92,
                ron: 88,
                hermione: 85
            },
            harry: "용감하게 트리위저드 시합을 완주하고 볼드모트와 맞선 해리는 진정한 챔피언이 되었다! 시드릭의 죽음은 슬펐지만, 해리는 용기로 승리했다.",
            ron: "용감하게 해리를 지지하고 함께 맞선 론은 진정한 친구임을 증명했다! 볼드모트의 부활이라는 위협 앞에서도 론은 해리 곁에 있었다.",
            hermione: "용감하게 해리를 지원하고 함께 맞선 헤르미온느는 진정한 친구임을 증명했다! 그녀의 용기와 지식이 해리를 도왔다."
        },
        wisdom: {
            title: {
                harry: "🧠 지혜로운 챔피언",
                ron: "🧠 현명한 친구",
                hermione: "🧠 지혜로운 지원자"
            },
            originalMatchRate: {
                harry: 78,
                ron: 75,
                hermione: 95
            },
            harry: "지혜롭게 트리위저드 시합을 완주하고 볼드모트와 맞선 해리는 진정한 챔피언이 되었다! 해리의 지혜가 모든 위험을 극복했다.",
            ron: "현명하게 해리를 도와준 론은 진정한 친구임을 증명했다! 론의 조언과 지원이 해리를 도왔다.",
            hermione: "지혜롭게 해리를 지원한 헤르미온느는 진정한 친구임을 증명했다! 그녀의 지식과 논리가 모든 문제를 해결했다."
        },
        friendship: {
            title: {
                harry: "💝 우정 있는 챔피언",
                ron: "💝 진실한 친구",
                hermione: "💝 우정 있는 지원자"
            },
            originalMatchRate: {
                harry: 85,
                ron: 90,
                hermione: 88
            },
            harry: "친구들의 도움으로 트리위저드 시합을 완주하고 볼드모트와 맞선 해리는 진정한 챔피언이 되었다! 우정의 힘이 승리했다.",
            ron: "해리를 진심으로 지지한 론은 진정한 친구임을 증명했다! 론의 우정이 해리를 강하게 만들었다.",
            hermione: "해리를 진심으로 지원한 헤르미온느는 진정한 친구임을 증명했다! 그녀의 우정과 지식이 해리를 도왔다."
        },
        early_quit: {
            title: {
                harry: "😔 포기한 챔피언",
                ron: "😔 포기한 친구",
                hermione: "😔 포기한 지원자"
            },
            originalMatchRate: {
                harry: 5,
                ron: 5,
                hermione: 5
            },
            harry: "두려워서 포기한 해리는 트리위저드 시합을 완주하지 못했다. 하지만 다음 기회에는 용기를 낼 수 있을 것이다.",
            ron: "두려워서 포기한 론은 해리를 도와주지 못했다. 하지만 다음에는 용기를 낼 수 있을 것이다.",
            hermione: "두려워서 포기한 헤르미온느는 해리를 도와주지 못했다. 하지만 다음에는 용기를 낼 수 있을 것이다."
        },
        gave_up: {
            title: {
                harry: "😔 포기한 챔피언",
                ron: "😔 포기한 친구",
                hermione: "😔 포기한 지원자"
            },
            originalMatchRate: {
                harry: 3,
                ron: 3,
                hermione: 3
            },
            harry: "중도에 포기한 해리는 트리위저드 시합을 완주하지 못했다. 하지만 다음 기회에는 끝까지 포기하지 않을 것이다.",
            ron: "중도에 포기한 론은 해리를 도와주지 못했다. 하지만 다음에는 끝까지 포기하지 않을 것이다.",
            hermione: "중도에 포기한 헤르미온느는 해리를 도와주지 못했다. 하지만 다음에는 끝까지 포기하지 않을 것이다."
        },
        jealous: {
            title: {
                harry: "😔 질투받은 챔피언",
                ron: "😔 질투한 친구",
                hermione: "😔 질투받은 지원자"
            },
            originalMatchRate: {
                harry: 0,
                ron: 8,
                hermione: 0
            },
            harry: "해리는 친구의 질투를 경험했다. 하지만 진정한 우정은 시련을 이겨낸다.",
            ron: "질투로 인해 해리를 의심한 론은 나중에 후회했다. 하지만 진정한 우정은 시련을 이겨낸다.",
            hermione: "해리는 친구의 질투를 경험했다. 하지만 진정한 우정은 시련을 이겨낸다."
        }
    },
    5: { // 제 5편: 불사조 기사단
        courage: {
            title: {
                harry: "🏆 용감한 전사",
                ron: "🏆 용감한 동지",
                hermione: "🏆 용감한 전사"
            },
            originalMatchRate: {
                harry: 90,
                ron: 85,
                hermione: 88
            },
            harry: "용감하게 신비사항부에서 싸우고 예언을 받아들인 해리는 진정한 전사가 되었다! 시리우스의 죽음은 슬펐지만, 해리는 계속 싸웠다.",
            ron: "용감하게 해리와 함께 싸운 론은 진정한 동지임을 증명했다! 론의 용기가 해리를 도왔다.",
            hermione: "용감하게 해리와 함께 싸운 헤르미온느는 진정한 전사임을 증명했다! 그녀의 용기와 지식이 해리를 도왔다."
        },
        wisdom: {
            title: {
                harry: "🧠 지혜로운 전사",
                ron: "🧠 현명한 동지",
                hermione: "🧠 지혜로운 전사"
            },
            originalMatchRate: {
                harry: 80,
                ron: 75,
                hermione: 95
            },
            harry: "지혜롭게 신비사항부에서 싸우고 예언을 받아들인 해리는 진정한 전사가 되었다! 해리의 지혜가 모든 위험을 극복했다.",
            ron: "현명하게 해리를 도와준 론은 진정한 동지임을 증명했다! 론의 조언이 해리를 도왔다.",
            hermione: "지혜롭게 해리를 도와준 헤르미온느는 진정한 전사임을 증명했다! 그녀의 지식과 논리가 모든 문제를 해결했다."
        },
        friendship: {
            title: {
                harry: "💝 우정 있는 전사",
                ron: "💝 진실한 동지",
                hermione: "💝 우정 있는 전사"
            },
            originalMatchRate: {
                harry: 88,
                ron: 92,
                hermione: 90
            },
            harry: "친구들의 도움으로 신비사항부에서 싸우고 예언을 받아들인 해리는 진정한 전사가 되었다! 우정의 힘이 승리했다.",
            ron: "해리를 진심으로 지지한 론은 진정한 동지임을 증명했다! 론의 우정이 해리를 강하게 만들었다.",
            hermione: "해리를 진심으로 지원한 헤르미온느는 진정한 전사임을 증명했다! 그녀의 우정과 지식이 해리를 도왔다."
        },
        early_quit: {
            title: {
                harry: "😔 포기한 전사",
                ron: "😔 포기한 동지",
                hermione: "😔 포기한 전사"
            },
            originalMatchRate: {
                harry: 5,
                ron: 5,
                hermione: 5
            },
            harry: "두려워서 포기한 해리는 신비사항부에서 싸우지 못했다. 하지만 다음 기회에는 용기를 낼 수 있을 것이다.",
            ron: "두려워서 포기한 론은 해리를 도와주지 못했다. 하지만 다음에는 용기를 낼 수 있을 것이다.",
            hermione: "두려워서 포기한 헤르미온느는 해리를 도와주지 못했다. 하지만 다음에는 용기를 낼 수 있을 것이다."
        },
        gave_up: {
            title: {
                harry: "😔 포기한 전사",
                ron: "😔 포기한 동지",
                hermione: "😔 포기한 전사"
            },
            originalMatchRate: {
                harry: 3,
                ron: 3,
                hermione: 3
            },
            harry: "중도에 포기한 해리는 신비사항부에서 싸우지 못했다. 하지만 다음 기회에는 끝까지 포기하지 않을 것이다.",
            ron: "중도에 포기한 론은 해리를 도와주지 못했다. 하지만 다음에는 끝까지 포기하지 않을 것이다.",
            hermione: "중도에 포기한 헤르미온느는 해리를 도와주지 못했다. 하지만 다음에는 끝까지 포기하지 않을 것이다."
        }
    },
    6: { // 제 6편: 혼혈 왕자
        courage: {
            title: {
                harry: "🏆 용감한 탐험가",
                ron: "🏆 용감한 동지",
                hermione: "🏆 용감한 탐험가"
            },
            originalMatchRate: {
                harry: 90,
                ron: 85,
                hermione: 88
            },
            harry: "용감하게 호크룩스를 찾기 시작한 해리는 진정한 탐험가가 되었다! 덤블도어의 죽음은 슬펐지만, 해리는 계속 나아갔다.",
            ron: "용감하게 해리를 지지한 론은 진정한 동지임을 증명했다! 론의 용기가 해리를 도왔다.",
            hermione: "용감하게 해리를 지원한 헤르미온느는 진정한 탐험가임을 증명했다! 그녀의 용기와 지식이 해리를 도왔다."
        },
        wisdom: {
            title: {
                harry: "🧠 지혜로운 탐험가",
                ron: "🧠 현명한 동지",
                hermione: "🧠 지혜로운 탐험가"
            },
            originalMatchRate: {
                harry: 85,
                ron: 75,
                hermione: 95
            },
            harry: "지혜롭게 호크룩스를 찾기 시작한 해리는 진정한 탐험가가 되었다! 해리의 지혜가 모든 위험을 극복했다.",
            ron: "현명하게 해리를 도와준 론은 진정한 동지임을 증명했다! 론의 조언이 해리를 도왔다.",
            hermione: "지혜롭게 해리를 도와준 헤르미온느는 진정한 탐험가임을 증명했다! 그녀의 지식과 논리가 모든 문제를 해결했다."
        },
        friendship: {
            title: {
                harry: "💝 우정 있는 탐험가",
                ron: "💝 진실한 동지",
                hermione: "💝 우정 있는 탐험가"
            },
            originalMatchRate: {
                harry: 88,
                ron: 92,
                hermione: 90
            },
            harry: "친구들의 도움으로 호크룩스를 찾기 시작한 해리는 진정한 탐험가가 되었다! 우정의 힘이 승리했다.",
            ron: "해리를 진심으로 지지한 론은 진정한 동지임을 증명했다! 론의 우정이 해리를 강하게 만들었다.",
            hermione: "해리를 진심으로 지원한 헤르미온느는 진정한 탐험가임을 증명했다! 그녀의 우정과 지식이 해리를 도왔다."
        },
        early_quit: {
            title: {
                harry: "😔 포기한 탐험가",
                ron: "😔 포기한 동지",
                hermione: "😔 포기한 탐험가"
            },
            originalMatchRate: {
                harry: 5,
                ron: 5,
                hermione: 5
            },
            harry: "두려워서 포기한 해리는 호크룩스를 찾지 못했다. 하지만 다음 기회에는 용기를 낼 수 있을 것이다.",
            ron: "두려워서 포기한 론은 해리를 도와주지 못했다. 하지만 다음에는 용기를 낼 수 있을 것이다.",
            hermione: "두려워서 포기한 헤르미온느는 해리를 도와주지 못했다. 하지만 다음에는 용기를 낼 수 있을 것이다."
        },
        gave_up: {
            title: {
                harry: "😔 포기한 탐험가",
                ron: "😔 포기한 동지",
                hermione: "😔 포기한 탐험가"
            },
            originalMatchRate: {
                harry: 3,
                ron: 3,
                hermione: 3
            },
            harry: "중도에 포기한 해리는 호크룩스를 찾지 못했다. 하지만 다음 기회에는 끝까지 포기하지 않을 것이다.",
            ron: "중도에 포기한 론은 해리를 도와주지 못했다. 하지만 다음에는 끝까지 포기하지 않을 것이다.",
            hermione: "중도에 포기한 헤르미온느는 해리를 도와주지 못했다. 하지만 다음에는 끝까지 포기하지 않을 것이다."
        }
    },
    7: { // 제 7편: 죽음의 성물
        courage: {
            title: {
                harry: "🏆 용감한 구세주",
                ron: "🏆 용감한 영웅",
                hermione: "🏆 용감한 구세주"
            },
            originalMatchRate: {
                harry: 95,
                ron: 90,
                hermione: 88
            },
            harry: "용감하게 볼드모트와 맞서 승리한 해리는 진정한 구세주가 되었다! 모든 호크룩스를 파괴하고 볼드모트를 물리쳤다. 마법 세계는 평화를 되찾았다!",
            ron: "용감하게 해리와 함께 볼드모트를 물리친 론은 진정한 영웅이 되었다! 론의 용기와 우정이 승리를 가져왔다.",
            hermione: "용감하게 해리와 함께 볼드모트를 물리친 헤르미온느는 진정한 구세주가 되었다! 그녀의 용기와 지식이 승리를 가져왔다."
        },
        wisdom: {
            title: {
                harry: "🧠 지혜로운 구세주",
                ron: "🧠 현명한 영웅",
                hermione: "🧠 지혜로운 구세주"
            },
            originalMatchRate: {
                harry: 88,
                ron: 80,
                hermione: 95
            },
            harry: "지혜롭게 볼드모트와 맞서 승리한 해리는 진정한 구세주가 되었다! 해리의 지혜가 모든 호크룩스를 파괴하고 볼드모트를 물리쳤다. 마법 세계는 평화를 되찾았다!",
            ron: "현명하게 해리를 도와 볼드모트를 물리친 론은 진정한 영웅이 되었다! 론의 조언과 지원이 승리를 가져왔다.",
            hermione: "지혜롭게 해리를 도와 볼드모트를 물리친 헤르미온느는 진정한 구세주가 되었다! 그녀의 지식과 논리가 승리를 가져왔다."
        },
        friendship: {
            title: {
                harry: "💝 우정 있는 구세주",
                ron: "💝 진실한 영웅",
                hermione: "💝 우정 있는 구세주"
            },
            originalMatchRate: {
                harry: 92,
                ron: 95,
                hermione: 90
            },
            harry: "친구들의 도움으로 볼드모트와 맞서 승리한 해리는 진정한 구세주가 되었다! 우정의 힘이 모든 호크룩스를 파괴하고 볼드모트를 물리쳤다. 마법 세계는 평화를 되찾았다!",
            ron: "해리를 진심으로 지지하여 볼드모트를 물리친 론은 진정한 영웅이 되었다! 론의 우정이 승리를 가져왔다.",
            hermione: "해리를 진심으로 지원하여 볼드모트를 물리친 헤르미온느는 진정한 구세주가 되었다! 그녀의 우정과 지식이 승리를 가져왔다."
        },
        early_quit: {
            title: {
                harry: "😔 포기한 구세주",
                ron: "😔 포기한 영웅",
                hermione: "😔 포기한 구세주"
            },
            originalMatchRate: {
                harry: 2,
                ron: 2,
                hermione: 2
            },
            harry: "두려워서 포기한 해리는 볼드모트를 물리치지 못했다. 하지만 다음 기회에는 용기를 낼 수 있을 것이다.",
            ron: "두려워서 포기한 론은 해리를 도와주지 못했다. 하지만 다음에는 용기를 낼 수 있을 것이다.",
            hermione: "두려워서 포기한 헤르미온느는 해리를 도와주지 못했다. 하지만 다음에는 용기를 낼 수 있을 것이다."
        },
        gave_up: {
            title: {
                harry: "😔 포기한 구세주",
                ron: "😔 포기한 영웅",
                hermione: "😔 포기한 구세주"
            },
            originalMatchRate: {
                harry: 1,
                ron: 1,
                hermione: 1
            },
            harry: "중도에 포기한 해리는 볼드모트를 물리치지 못했다. 하지만 다음 기회에는 끝까지 포기하지 않을 것이다.",
            ron: "중도에 포기한 론은 해리를 도와주지 못했다. 하지만 다음에는 끝까지 포기하지 않을 것이다.",
            hermione: "중도에 포기한 헤르미온느는 해리를 도와주지 못했다. 하지만 다음에는 끝까지 포기하지 않을 것이다."
        }
    }
};

// 선택 확인 화면 표시
function showChoiceConfirm(choice) {
    pendingChoice = choice;
    const confirmScreen = document.getElementById('choice-confirm-screen');
    const confirmText = document.getElementById('confirm-choice-text');
    
    if (confirmScreen && confirmText) {
        // 선택한 내용을 표시 (예: "기다리기만 한다를 선택하시겠습니까?")
        confirmText.textContent = '"' + choice.text + '"를 선택하시겠습니까?';
        confirmScreen.style.display = 'flex';
        confirmScreen.style.opacity = '0';
        createSound('click');
        
        // 페이드 인 애니메이션
        setTimeout(function() {
            confirmScreen.style.transition = 'opacity 0.3s ease';
            confirmScreen.style.opacity = '1';
        }, 10);
    }
}

// 선택 확인 화면 닫기
function closeChoiceConfirm() {
    const confirmScreen = document.getElementById('choice-confirm-screen');
    
    if (confirmScreen) {
        // 페이드 아웃 애니메이션
        confirmScreen.style.transition = 'opacity 0.3s ease';
        confirmScreen.style.opacity = '0';
        
        setTimeout(function() {
            confirmScreen.style.display = 'none';
        }, 300);
        createSound('click');
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
    saveGameState(); // 상태 저장

    // 결말인지 확인
    if (choice.ending) {
        setTimeout(function() {
            showEnding(choice.ending);
        }, 500);
    } else if (choice.next !== undefined) {
        setTimeout(function() {
            createSound('transition');
            currentEvent = choice.next;
            saveGameState(); // 상태 저장
            showEvent();
        }, 500);
    } else {
        setTimeout(function() {
            currentEvent++;
            saveGameState(); // 상태 저장
            if (currentEvent >= gameData[currentPart][currentCharacter].length) {
                // 기본 결말 (가장 높은 수치에 따라)
                const maxStat = Object.keys(gameState).reduce(function(a, b) {
                    return gameState[a] > gameState[b] ? a : b;
                });
                const endingType = maxStat === 'courage' ? 'courage' : (maxStat === 'knowledge' ? 'wisdom' : 'friendship');
                showEnding(endingType);
            } else {
                createSound('transition');
                showEvent();
            }
        }, 500);
    }
}

// 이벤트 표시 함수
function showEvent() {
    if (!currentCharacter || !currentPart || !gameData[currentPart] || !gameData[currentPart][currentCharacter]) {
        console.error('게임 데이터를 찾을 수 없습니다.');
        return;
    }
    
    const event = gameData[currentPart][currentCharacter][currentEvent];
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
    
    // 캐릭터 정보 표시 (새로고침 후에도 유지)
    const characterNameElement = document.getElementById('current-character-name');
    const characterIconElement = document.getElementById('current-character-icon');
    if (characterNameElement) {
        characterNameElement.textContent = characterNames[currentCharacter];
    }
    if (characterIconElement) {
        const iconPaths = {
            harry: 'image/Harry.png',
            ron: 'image/Ron.png',
            hermione: 'image/Hermione.png'
        };
        if (iconPaths[currentCharacter]) {
            characterIconElement.src = iconPaths[currentCharacter];
            characterIconElement.alt = characterNames[currentCharacter];
            characterIconElement.style.display = 'block';
        } else {
            characterIconElement.style.display = 'none';
        }
    }

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
            createSound('click');
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
        // 이벤트 전환 효과음 (첫 이벤트가 아닐 때만)
        if (currentEvent > 0) {
            createSound('transition');
        }
        
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

    // 일치율 값 가져오기 (편별로 구분)
    const matchRate = endings[currentPart] && endings[currentPart][endingType] && endings[currentPart][endingType].originalMatchRate && endings[currentPart][endingType].originalMatchRate[currentCharacter]
        ? endings[currentPart][endingType].originalMatchRate[currentCharacter]
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
    if (confirmScreen && confirmScreen.style.display !== 'none') {
        closeChoiceConfirm();
    }

    // 결말 제목 표시 (편별로 구분)
    const endingTitleText = endings[currentPart] && endings[currentPart][endingType] && endings[currentPart][endingType].title && endings[currentPart][endingType].title[currentCharacter]
        ? endings[currentPart][endingType].title[currentCharacter]
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

    // 결말 텍스트 (편별로 구분)
    const endingText = endings[currentPart] && endings[currentPart][endingType] && endings[currentPart][endingType][currentCharacter] 
        ? endings[currentPart][endingType][currentCharacter] 
        : '게임이 끝났습니다.';

    // 페이드 인 애니메이션
    if (storyContainer) {
        storyContainer.style.opacity = '0';
        storyContainer.style.transform = 'translateY(20px)';
    }

    storyText.textContent = endingText;
    choicesContainer.innerHTML = '';
    
    // 결말 효과음 재생
    createSound('ending');
    
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
        // 게임 상태 초기화
        clearGameState();
        createSound('click');
        
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
            const partSelectionScreen = document.getElementById('part-selection');
            if (gameScreen) {
                gameScreen.classList.remove('active');
                gameScreen.style.display = 'none';
            }
            if (partSelectionScreen) {
                partSelectionScreen.classList.add('active');
                partSelectionScreen.style.display = 'block';
                partSelectionScreen.style.opacity = '0';
                
                // 화면 전환 효과음
                createSound('transition');
                
                setTimeout(function() {
                    partSelectionScreen.style.transition = 'opacity 0.5s ease';
                    partSelectionScreen.style.opacity = '1';
                }, 50);
            }
            
            // 편 선택 화면으로 돌아가기
            
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
    console.log('편:', currentPart);
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
    
    if (!currentPart || !gameData[currentPart]) {
        console.error('편이 선택되지 않았습니다.');
        alert('편을 선택해주세요.');
        return;
    }
    
    createSound('click');
    
    currentCharacter = character;
    currentEvent = 0;
    gameState = {
        friendship: 50,
        courage: 50,
        knowledge: 50
    };
    saveGameState(); // 상태 저장

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
        
        // 화면 전환 효과음
        createSound('transition');
        
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
