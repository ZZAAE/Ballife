// [더미 데이터 시작] 게시판 백엔드 연결 전 임시 목록/상세 데이터
export const DUMMY_POSTS = [
  {
    id: 101,
    category: "DIABETES",
    userId: 1,
    userNickname: "아이제로",
    title: "혈당 수치 이거 정상인가?",
    content:
      "안녕하세요. 오늘 아침 공복 혈당을 쟀을 때는 95 정도로 정상권이었는데, 점심식사 후 2시간 정도 지나고 다시 측정한 수치가 사진처럼 나왔습니다.\n\n점심식사로는 국이랑 밥 위주로 먹었는데, 평소보다 조금 더 높은 것 같아서 걱정되네요. 이 정도면 괜찮은 수준인지 비슷한 경험 있으신 분들 의견 부탁드려요.",
    imageUrl:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=80",
    viewCount: 34,
    upVote: 7,
    createdAt: "2026-05-14T09:10:00",
    comments: [
      {
        id: 1,
        author: "콩콩이식사",
        content:
          "다음 검사까지 스트레스를 줄이고 같은 시간대에 한두 번 더 재보세요. 식후 140 전후는 식단에 따라 일시적으로 올라갈 수도 있어요.",
        createdAt: "2026-05-14T10:24:00",
      },
      {
        id: 2,
        author: "정상범위체크",
        content:
          "식후 2시간 수치면 140 전후로 나올 때도 있습니다. 며칠 연속으로 비슷하게 높게 나오지만 않으면 너무 불안해하지 않으셔도 됩니다.",
        createdAt: "2026-05-14T11:40:00",
      },
      {
        id: 3,
        author: "아이제로",
        content: "감사합니다. 며칠 같은 시간대에 다시 측정해볼게요.",
        createdAt: "2026-05-14T12:15:00",
      },
    ],
  },
  {
    id: 102,
    category: "DIABETES",
    userId: 2,
    userNickname: "포도당관리",
    title: "식후 혈당 기록 어떻게 남기세요?",
    content:
      "식사 직후, 1시간 후, 2시간 후 중 어떤 시점 기록을 가장 중점적으로 보시는지 궁금합니다.\n\n앱에 기록할 때 기준을 통일하고 싶어서 다른 분들 패턴이 궁금해요.",
    imageUrl: "",
    viewCount: 52,
    upVote: 11,
    createdAt: "2026-05-13T14:20:00",
  },
  {
    id: 103,
    category: "HYPERTENSION",
    userId: 3,
    userNickname: "120_80",
    title: "혈압약 복용 시간 바꾸신 분 계신가요?",
    content:
      "아침 복용 중인데 저녁으로 옮겨도 되는지 병원 가기 전에 경험을 들어보고 싶습니다.\n\n물론 최종 판단은 의사 상담 후에 하려 합니다.",
    imageUrl: "",
    viewCount: 41,
    upVote: 5,
    createdAt: "2026-05-12T20:35:00",
  },
  {
    id: 104,
    category: "OBESITY",
    userId: 4,
    userNickname: "다이어트중",
    title: "저녁 식단 추천 부탁드려요",
    content:
      "늦은 시간에 먹어도 부담 적은 식단 추천 부탁드립니다.\n\n단백질은 챙기고 싶고 나트륨은 줄이고 싶어요.",
    imageUrl: "",
    viewCount: 67,
    upVote: 15,
    createdAt: "2026-05-11T18:00:00",
  },
  {
    id: 105,
    category: "QNA",
    userId: 5,
    userNickname: "초보회원",
    title: "기록 페이지는 하루에 몇 번까지 입력 가능한가요?",
    content:
      "혈압이나 혈당을 하루 여러 번 측정하는데, 앱에 입력 횟수 제한이 있는지 궁금합니다.",
    imageUrl: "",
    viewCount: 19,
    upVote: 2,
    createdAt: "2026-05-10T11:45:00",
  },
  {
    id: 106,
    category: "GOUT",
    userId: 6,
    userNickname: "통풍조심",
    title: "맥주 대신 마실 음료 추천해주세요",
    content:
      "통풍 때문에 음료 선택을 조심하고 있는데, 탄산이 당길 때 대체해서 드시는 음료가 있으면 추천 부탁드립니다.",
    imageUrl: "",
    viewCount: 29,
    upVote: 6,
    createdAt: "2026-05-09T16:30:00",
  },
  {
    id: 107,
    category: "OSTEOPOROSIS",
    userId: 7,
    userNickname: "튼튼뼈",
    title: "칼슘 영양제는 언제 드시는 편인가요?",
    content:
      "식후에 먹는 편인데 저녁이 더 낫다는 이야기도 있어서 복용 타이밍이 궁금합니다.",
    imageUrl: "",
    viewCount: 23,
    upVote: 4,
    createdAt: "2026-05-08T08:05:00",
  },
  {
    id: 108,
    category: "HYPERLIPIDEMIA",
    userId: 8,
    userNickname: "콜레스테롤다운",
    title: "점심 외식할 때 메뉴 선택 팁 공유해요",
    content:
      "기름진 메뉴를 피하면서도 포만감을 챙길 수 있는 외식 메뉴 팁을 같이 공유하면 좋겠습니다.",
    imageUrl: "",
    viewCount: 48,
    upVote: 9,
    createdAt: "2026-05-07T12:15:00",
  },
  {
    id: 109,
    category: "GENERAL",
    userId: 9,
    userNickname: "산책좋아",
    title: "저녁 산책 30분만 해도 확실히 다르네요",
    content:
      "자기 전에 가볍게 걷는 습관을 들였더니 수면의 질이 좋아진 느낌입니다.\n\n비슷한 경험 있으신 분 계신가요?",
    imageUrl: "",
    viewCount: 56,
    upVote: 13,
    createdAt: "2026-05-06T19:40:00",
  },
  {
    id: 110,
    category: "QNA",
    userId: 10,
    userNickname: "질문있어요",
    title: "건강 기록은 수정도 가능한가요?",
    content:
      "오입력한 기록을 나중에 수정할 수 있는지 궁금합니다. 삭제 후 재입력만 가능한지도 알고 싶어요.",
    imageUrl: "",
    viewCount: 15,
    upVote: 1,
    createdAt: "2026-05-05T10:00:00",
  },
  {
    id: 111,
    category: "DIABETES",
    userId: 11,
    userNickname: "식단메모",
    title: "당뇨 식단에서 과일은 어느 정도까지 괜찮을까요?",
    content:
      "사과나 블루베리를 먹고 싶은데 양 조절을 어떻게 하는지 경험담이 궁금합니다.",
    imageUrl: "",
    viewCount: 38,
    upVote: 8,
    createdAt: "2026-05-04T07:30:00",
  },
  {
    id: 112,
    category: "HYPERTENSION",
    userId: 12,
    userNickname: "아침혈압",
    title: "아침 측정 혈압이 저녁보다 높은데 정상인가요?",
    content:
      "같은 자세로 측정해도 아침 혈압이 조금 더 높게 나옵니다. 일반적인 패턴인지 궁금합니다.",
    imageUrl: "",
    viewCount: 44,
    upVote: 10,
    createdAt: "2026-05-03T21:20:00",
  },
];

export const PAGE_SIZE = 10;
// [더미 데이터 끝]
