export function renderSidebar(container, lessons, activeId, onSelect) {
  container.replaceChildren();
  const brand = document.createElement('div');
  brand.className = 'brand';
  const brandTitle = document.createElement('strong');
  brandTitle.textContent = 'Rational Numbers Quick Check';
  const brandSupport = document.createElement('span');
  brandSupport.textContent = '有理数计算 · 课堂快速检测';
  brand.append(brandTitle, brandSupport);
  container.append(brand);
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Lesson Navigation');
  lessons.forEach(lesson => {
    const button = document.createElement('button');
    button.className = 'lesson-item' + (lesson.id === activeId ? ' active' : '');
    button.type = 'button';
    const number = document.createElement('span');
    number.className = 'lesson-number';
    number.textContent = 'Lesson ' + lesson.number;
    const english = document.createElement('strong');
    english.textContent = lesson.englishName;
    const chinese = document.createElement('small');
    chinese.textContent = lesson.chineseName;
    button.append(number, english, chinese);
    button.addEventListener('click', () => onSelect(lesson.id));
    nav.append(button);
  });
  container.append(nav);
}
