export interface LessonMeta {
  num: string;
  title: string;
  sub: string;
  hint: string;
}

export const LESSONS: LessonMeta[] = [
  { num: "", title: "", sub: "", hint: "" }, // cover
  {
    num: "First Lesson",
    title: "The Most Beautiful of Theories",
    sub: "일반상대성이론 — 공간은 텅 빈 무대가 아니라, 질량이 있으면 휘어지는 부드러운 직물이다.",
    hint: "누른 채 드래그하면 보이지 않는 질량이 공간을 휘게 합니다",
  },
  {
    num: "Second Lesson",
    title: "Quanta",
    sub: "양자역학 — 입자는 상호작용할 때만 존재한다. 그 사이에는 위치조차 없다. 세계는 연속이 아니라 불쑥 나타나는 도약들이다.",
    hint: "꾹 누르고 있어 보세요 — 관측하는 동안만 그 자리에 입자들이 존재합니다",
  },
  {
    num: "Third Lesson",
    title: "The Architecture of the Cosmos",
    sub: "우주의 구조 — 땅 위의 하늘에서 시작해 한 걸음씩 물러나면, 우리는 천억 개의 은하 중 하나, 그 가장자리에 있다.",
    hint: "클릭할 때마다 한 걸음씩 물러납니다",
  },
  {
    num: "Fourth Lesson",
    title: "Particles",
    sub: "입자 — 세계는 사물이 아니라 사건들의 그물이다. 입자는 장(場)의 양자, 태어나자마자 사라지는 덧없는 존재다.",
    hint: "클릭하세요 — 사건이 일어나면 그 자리의 입자들이 들떠 반짝입니다",
  },
  {
    num: "Fifth Lesson",
    title: "Grains of Space",
    sub: "공간의 알갱이 — 루프양자중력이 말하기를, 공간 자체도 무한히 나눌 수 없는 알갱이들의 그물로 짜여 있다.",
    hint: "드래그해서 돌려 보세요 — 알갱이들의 그물, 이것이 공간의 조직입니다",
  },
  {
    num: "Sixth Lesson",
    title: "Probability, Time and the Heat of Black Holes",
    sub: "시간은 열에서 태어난다 — 불티는 떠오르며 식어갈 뿐, 다시 타오르지 않는다. 열이 흐르는 그 한 방향이 과거와 미래를 가른다.",
    hint: "꾹 눌러 불씨를 지펴 보세요 — 불티는 떠오르고, 식고, 돌아오지 않습니다",
  },
  {
    num: "Seventh Lesson",
    title: "Ourselves",
    sub: "우리 자신 — 우리는 자연을 바라보는 관찰자가 아니라 자연의 일부다. 별을 만든 바로 그 입자들로 만들어져 있다.",
    hint: "마우스로 입자를 흩어 보세요 — 다시 모여듭니다",
  },
];
