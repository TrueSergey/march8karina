// Список комплиментов
const compliments = [
    "Твоя улыбка озаряет мой мир!",
    "Ты самая прекрасная и удивительная!",
    "Твои глаза — как звезды в ночи!",
    "Ты делаешь каждый день особенным!",
    "Ты моя муза и вдохновение!",
    "Твоя красота затмевает весенние цветы!",
    "Ты — моя любимая загадка!",
    "С тобой мир становится ярче!",
    "Твой смех — лучшая мелодия!",
    "Ты — самое ценное в моей жизни!",
    "Ты прекрасна во всех смыслах!",
    "Твоя душа чиста, как весеннее небо!",
    "Ты украшаешь все вокруг своим присутствием!",
    "Твои объятия — мой любимый уголок в мире!",
    "Ты делаешь невозможное возможным!",
    "Ты моя любимая история!",
    "Ты восхитительна во всем!",
    "Твоя нежность покоряет мое сердце!",
    "Ты моя любимая причина для улыбки!",
    "Ты как весна — несешь тепло и радость!"
];

// Глобальные переменные
let backgroundMusic;
let mediaElements = [];
let currentMediaIndex = 0;
let mediaLoaded = false;
let allResourcesLoaded = false;
let loadingProgress = 0;

// Создаем звезды
function createStars() {
    const starsContainer = document.querySelector('.stars');
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.top = `${Math.random() * 100}vh`;
        star.style.left = `${Math.random() * 100}vw`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starsContainer.appendChild(star);
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    createStars();
    const openBtn = document.getElementById('openBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Обработчик для открытия поздравления
    openBtn.addEventListener('click', function() {
        // Начинаем предзагрузку всех медиа при нажатии на кнопку
        showLoadingIndicator();
        preloadAllResources().then(() => {
            hideLoadingIndicator();
            showCongratsScreen();
			
        });
    });

    // Начинаем воспроизведение музыки по клику на страницу
    initializeAudio();

    // Эффект параллакса для звезд
    document.addEventListener('mousemove', (e) => {
        const stars = document.querySelector('.stars');
        const x = e.clientX / window.innerWidth * 10;
        const y = e.clientY / window.innerHeight * 10;
        stars.style.transform = `translate(${x}px, ${y}px)`;
    });

    // Обработчик для розы
    document.getElementById('bouquet-btn').addEventListener('click', function(e) {
        createParticles(e.clientX, e.clientY);
        for (let i = 0; i < 10; i++) setTimeout(createPetal, i * 100);
        showRandomCompliment();
    });

    // Переход на экран воспоминаний
    nextBtn.addEventListener('click', function() {
        document.querySelector('.congrats-screen').classList.remove('visible');
        document.querySelector('.memories-screen').style.display = 'block';
        if (allResourcesLoaded) {
            showCurrentMedia();
        }
    });

    // Обработчик для просмотра медиа
    document.getElementById('media-display').addEventListener('click', (e) => {
        e.preventDefault(); // Блокировка стандартных действий
        currentMediaIndex = (currentMediaIndex + 1) % mediaData.length;
        showCurrentMedia();
    });

    // Начальные лепестки
    setInterval(createPetal, 1000);
    
    // Изначально скрываем кнопку "Далее"
    if (nextBtn) {
        nextBtn.style.display = 'none';
    }
});

// Инициализация аудио
function initializeAudio() {
    backgroundMusic = new Audio('images/audio.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.7;
    backgroundMusic.preload = 'auto';
    
    // Пытаемся запустить воспроизведение по взаимодействию с документом
    const startAudio = function() {
        backgroundMusic.play().catch(error => {
            console.log('Автовоспроизведение заблокировано. Нужно взаимодействие пользователя.', error);
        });
        document.removeEventListener('click', startAudio);
        document.removeEventListener('touchstart', startAudio);
    };
    
    document.addEventListener('click', startAudio);
    document.addEventListener('touchstart', startAudio);
}

// Показать экран поздравления
function showCongratsScreen() {
    document.querySelector('.intro-screen').style.opacity = '0';
    setTimeout(() => {
        document.querySelector('.intro-screen').style.display = 'none';
        document.querySelector('.congrats-screen').classList.add('visible');
        document.getElementById('nextBtn').style.display = 'block';
        
        // Увеличиваем интенсивность лепестков
        setInterval(createPetal, 600);
    }, 1000);
}

// Функция для предзагрузки всех ресурсов
function preloadAllResources() {
    return new Promise((resolve) => {
        const totalResources = mediaData.length;
        let loadedResources = 0;
        
        // Предзагрузка медиа-элементов
        mediaData.forEach((item, index) => {
            if (item.type === 'image') {
                const img = new Image();
                img.src = item.src;
                img.onload = () => {
                    mediaElements[index] = img;
                    loadedResources++;
                    updateLoadingProgress(loadedResources, totalResources);
                    if (loadedResources === totalResources) {
                        allResourcesLoaded = true;
                        resolve();
                    }
                };
                img.onerror = () => {
                    console.error("Ошибка загрузки изображения:", item.src);
                    loadedResources++;
                    updateLoadingProgress(loadedResources, totalResources);
                    if (loadedResources === totalResources) {
                        allResourcesLoaded = true;
                        resolve();
                    }
                };
            } else if (item.type === 'video') {
                const video = document.createElement('video');
                video.src = item.src;
                video.muted = false;
                video.preload = 'auto';
                
                // Исправляем кроссбраузерную совместимость
                video.setAttribute('playsinline', '');
                video.setAttribute('webkit-playsinline', '');
                
                // Событие при возможности воспроизведения
                video.addEventListener('canplaythrough', function onCanPlay() {
                    mediaElements[index] = video;
                    loadedResources++;
                    updateLoadingProgress(loadedResources, totalResources);
                    if (loadedResources === totalResources) {
                        allResourcesLoaded = true;
                        resolve();
                    }
                    video.removeEventListener('canplaythrough', onCanPlay);
                }, { once: true });
                
                video.addEventListener('error', () => {
                    console.error("Ошибка загрузки видео:", item.src);
                    loadedResources++;
                    updateLoadingProgress(loadedResources, totalResources);
                    if (loadedResources === totalResources) {
                        allResourcesLoaded = true;
                        resolve();
                    }
                });
                
                // Принудительная загрузка
                video.load();
            }
        });
        
        // Если нет медиа-элементов, завершаем загрузку
        if (totalResources === 0) {
            allResourcesLoaded = true;
            resolve();
        }
    });
}

// Обновление прогресса загрузки
function updateLoadingProgress(loaded, total) {
    loadingProgress = Math.floor((loaded / total) * 100);
    const progressElement = document.getElementById('loading-progress');
    if (progressElement) {
        progressElement.textContent = `${loadingProgress}%`;
    }
}

// Показать индикатор загрузки
function showLoadingIndicator() {
    // Создаем индикатор, если его нет
    if (!document.getElementById('loading-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Загрузка медиа... <span id="loading-progress">0%</span></div>
        `;
        document.body.appendChild(overlay);
    }
}

// Скрыть индикатор загрузки
function hideLoadingIndicator() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
    }
}

// Функция создания частиц при клике
function createParticles(x, y) {
    const container = document.body;
    const count = 30; // Количество частиц

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Случайный размер частицы (от 5px до 10px)
        const size = Math.random() * 8 + 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Случайный цвет частицы (оттенки розового и красного)
        const hue = Math.floor(Math.random() * 40) + 340; // от 340 до 380 (20) по шкале HSL
        const saturation = Math.floor(Math.random() * 30) + 70; // от 70% до 100%
        const lightness = Math.floor(Math.random() * 20) + 60; // от 60% до 80%
        particle.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        // Размещаем частицу в месте клика
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        // Задаем случайное направление и расстояние движения
        const tx = (Math.random() - 0.5) * 200; // Смещение по X (-100px до 100px)
        const ty = (Math.random() - 0.5) * 200; // Смещение по Y (-100px до 100px)
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        // Добавляем частицу на страницу
        container.appendChild(particle);

        // Удаляем частицу после завершения анимации
        particle.addEventListener('animationend', () => {
            particle.remove();
        });
    }
}

// Функция для создания лепестка
function createPetal() {
    const petal = document.createElement('img');
    // Используем data URI вместо файла для надежности
    petal.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><path d="M15 0 C20 10 25 15 15 30 C5 15 10 10 15 0" fill="%23ff6f61" opacity="0.7"/></svg>';
    petal.classList.add('petal');

    // Случайный размер лепестка (от 20px до 50px)
    const size = Math.floor(Math.random() * 30) + 20;
    petal.style.width = `${size}px`;

    // Случайная начальная позиция по X (в пределах ширины экрана)
    const x = Math.random() * window.innerWidth;
    petal.style.left = `${x}px`;

    // Начальная позиция по Y (над верхней границей экрана)
    petal.style.top = `-50px`;

    // Случайное направление вращения (влево или вправо)
    const rotationDirection = Math.random() > 0.5 ? 1 : -1;
    const rotationSpeed = Math.random() * 360; // Случайная скорость вращения

    // Случайное отклонение по горизонтали
    const horizontalDrift = (Math.random() - 0.5) * 200; // Отклонение от -100px до 100px

    // Добавляем лепесток в контейнер
    const petalsContainer = document.getElementById('petals-container');
    if (petalsContainer) {
        petalsContainer.appendChild(petal);
    }

    // Анимация падения
    const animationDuration = Math.random() * 3 + 2; // Случайная длительность падения (2-5 секунд)
    petal.style.animation = `fall ${animationDuration}s linear forwards`;

    // Управление отклонением по горизонтали
    petal.style.setProperty('--drift', `${horizontalDrift}px`);

    // Удаляем лепесток после завершения анимации
    petal.addEventListener('animationend', () => {
        petal.remove();
    });

    // Вращение лепестка
    let rotation = 0;
    const rotatePetal = () => {
        rotation += rotationSpeed * rotationDirection * 0.01;
        petal.style.transform = `rotate(${rotation}deg)`;
        requestAnimationFrame(rotatePetal);
    };
    requestAnimationFrame(rotatePetal);
}

// Функция для показа случайного комплимента
function showRandomCompliment() {
    const complimentElement = document.getElementById('compliment');
    if (!complimentElement) return;

    // Удаляем класс показа, если он есть
    complimentElement.classList.remove('show');

    // Ожидаем, пока анимация исчезновения завершится
    setTimeout(() => {
        // Выбираем случайный комплимент
        const randomIndex = Math.floor(Math.random() * compliments.length);
        complimentElement.textContent = compliments[randomIndex];

        // Добавляем класс для показа комплимента
        complimentElement.classList.add('show');
    }, 100); // Короткая задержка для сброса анимации
}

// Данные для медиа (10 элементов)
const mediaData = [
    {
        type: 'image',
        src: 'images/photo1.jpg',
        comment: 'Ай ну красатулька 🌸'
    },
    {
        type: 'video',
        src: 'images/video1.mp4',
        comment: 'Глазки, хлоп-хлоп❤️)',
        muted: false
    },
    {
        type: 'image',
        src: 'images/photo2.jpg',
        comment: 'Красота в любом виде'
    },
    {
        type: 'video',
        src: 'images/video2.mp4',
        comment: 'Учение во всем <3',
        muted: false
    },
    {
        type: 'image',
        src: 'images/photo3.jpg',
        comment: 'Немного ЧСВ, но прикольно🌸'
    },
    {
        type: 'video',
        src: 'images/video3.mp4',
        comment: 'Носок зачет "-"',
        muted: false
    },
    {
        type: 'image',
        src: 'images/photo4.jpg',
        comment: 'Ась? Шо смотришь? '
    },
    {
        type: 'video',
        src: 'images/video4.mp4',
        comment: 'Плавать не умею, но я поплыл',
        muted: false
    },
    {
        type: 'image',
        src: 'images/photo5.jpg',
        comment: 'Эшкаре? чиназес? хеви метал?'
    },
    {
        type: 'video',
        src: 'images/video5.mp4',
        comment: '-Нос? -какой нос? -Челка? -какая челка? ты прекрастна' ,
        muted: false
    },
    {
        type: 'image',
        src: 'images/photo6.jpg',
        comment: 'Теплые и приятные слова греют душу. Жалко что редко, но за-то метко'
    },
    {
        type: 'video',
        src: 'images/video6.mp4',
        comment: 'Папам, папам, пам. За-то весело ;)',
        muted: false
    },
    {
        type: 'image',
        src: 'images/photo7.jpg',
        comment: 'Моя любимая'
    },
    {
        type: 'video',
        src: 'images/video7.mp4',
        comment: 'Ну, если запреты, то только такие) xd',
        muted: false
    },
    {
        type: 'image',
        src: 'images/photo8.jpg',
        comment: 'Пикачу, я выбираю тебя. виу-виу, бам-бам. Вот так появилась ты'
    },
    {
        type: 'video',
        src: 'images/video8.mp4',
        comment: 'А я считаюсь олдом?;)',
        muted: false
    },
    {
        type: 'image',
        src: 'images/photo9.jpg',
        comment: 'Эстетик? неее, я знаю что ты любишь пиво и рыбку'
    },
    {
        type: 'video',
        src: 'images/video9.mp4',
        comment: 'Теперь я знаю что это, ЛИПСИНК, , нэ помню;)',
        muted: false
    }
];

// Показать текущее медиа
function showCurrentMedia() {
    if (!allResourcesLoaded) return;
    
    const container = document.getElementById('media-display');
    if (!container) return;
    
    // Останавливаем предыдущее видео и очищаем контейнер
    const previousVideo = container.querySelector('video');
    if (previousVideo) previousVideo.pause();
    container.innerHTML = '';

    // Проверяем, загружен ли элемент
    const mediaElement = mediaElements[currentMediaIndex];
    if (!mediaElement) {
        console.error('Медиа-элемент не загружен:', currentMediaIndex);
        return;
    }

    const media = mediaElement.cloneNode(true);
    media.classList.add('active');

    if (media.tagName === 'VIDEO') {
        // Настройки видео
        media.autoplay = true;
        media.muted = false;
        media.setAttribute('playsinline', '');
        media.setAttribute('webkit-playsinline', '');
        media.loop = true;
        
        // Блокировка контекстного меню
        media.oncontextmenu = (e) => {
            e.preventDefault();
            return false;
        };

        // Приглушаем фоновую музыку при просмотре видео
        if (backgroundMusic && !backgroundMusic.paused) {
            // Плавное уменьшение громкости
            const fadeAudio = setInterval(() => {
                if (backgroundMusic.volume > 0.1) {
                    backgroundMusic.volume -= 0.1;
                } else {
                    backgroundMusic.volume = 0.1;
                    clearInterval(fadeAudio);
                }
            }, 100);
        }

        // Принудительный запуск для мобильных устройств
        media.play().catch(error => {
            console.log('Автовоспроизведение заблокировано. Нужно взаимодействие пользователя.');
        });
    } else {
        // Возвращаем громкость фоновой музыки при просмотре изображений
        if (backgroundMusic && !backgroundMusic.paused && backgroundMusic.volume < 0.7) {
            // Плавное увеличение громкости
            const fadeInAudio = setInterval(() => {
                if (backgroundMusic.volume < 0.6) {
                    backgroundMusic.volume += 0.1;
                } else {
                    backgroundMusic.volume = 0.7;
                    clearInterval(fadeInAudio);
                }
            }, 100);
        }
    }
    
    // Создаем и добавляем медиа-элемент в контейнер
    const wrapper = document.createElement('div');
    wrapper.className = 'media-wrapper';
    wrapper.appendChild(media);
    container.appendChild(wrapper);

    // Анимация комментария
    const comment = document.getElementById('media-comment');
    comment.classList.remove('show');
    setTimeout(() => {
        comment.textContent = mediaData[currentMediaIndex].comment;
        comment.classList.add('show');
    }, 300);
}

let isMusicPlaying = false;

function createMusicControls() {
    const musicBtn = document.getElementById('musicBtn');
    
    musicBtn.addEventListener('click', function() {
        if(!backgroundMusic.paused) {
            backgroundMusic.pause();
            this.classList.remove('active');
        } else {
            backgroundMusic.play()
                .then(() => this.classList.add('active'))
                .catch(error => {
                    console.error('Ошибка воспроизведения:', error);
                    alert('Нажмите разрешить автовоспроизведение в браузере');
                });
        }
    });
}