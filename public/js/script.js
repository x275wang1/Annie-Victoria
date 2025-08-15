// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 云朵切入动画
    const cloudSplash = document.getElementById('cloud-splash');
    const cloudImage = cloudSplash.querySelector('img');
    
    // 显示云朵图片
    setTimeout(() => {
        cloudImage.style.opacity = '1';
    }, 100);
    
    // 3秒后淡出云朵背景
    setTimeout(() => {
        cloudSplash.style.opacity = '0';
        cloudSplash.style.transition = 'opacity 1s ease-out';
        
        // 完全隐藏后移除元素
        setTimeout(() => {
            cloudSplash.style.display = 'none';
        }, 1000);
    }, 3000);
    
    // 滚动动画触发
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    function checkScroll() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight * 0.85) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    // 初始检查
    checkScroll();
    
    // 滚动时检查
    window.addEventListener('scroll', checkScroll);
    // 兔子说话内容数组
    const bunnyMessages = [
        "嗨～ 今天也要开心呀！",
        "Victoria和Annie的友谊真好！",
        "记得多拍照记录美好瞬间哦～",
        "要一直这么好下去呀！",
        "今天有没有想对方呀？",
        "一起创造更多回忆吧！",
        "看到你们开心我也开心～"
    ];
    
    // 兔子说话功能
    const bunny = document.getElementById('talkingBunny');
    const bunnySpeech = document.getElementById('bunnySpeech');
    
    if (bunny && bunnySpeech) {
        // 鼠标悬停时随机显示一句话
        bunny.addEventListener('mouseenter', function() {
            const randomMessage = bunnyMessages[Math.floor(Math.random() * bunnyMessages.length)];
            bunnySpeech.querySelector('p').textContent = randomMessage;
        });
    }
    
    // 点赞功能
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const id = this.getAttribute('data-id');
            const userId = document.querySelector('#memory-uploader').value; // 使用当前选中的用户
            
            // 发送点赞请求
            fetch('/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type, id, user: userId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 更新点赞数
                    const likeCount = this.querySelector('.like-count');
                    likeCount.textContent = data.likes;
                    
                    // 切换点赞状态样式
                    this.classList.toggle('liked');
                    const icon = this.querySelector('i');
                    if (this.classList.contains('liked')) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                    }
                }
            })
            .catch(error => console.error('点赞失败:', error));
        });
    });
    
    // 初始化点赞状态
    likeButtons.forEach(button => {
        const type = button.getAttribute('data-type');
        const id = button.getAttribute('data-id');
        const userId = document.querySelector('#memory-uploader').value;
        
        // 使用从index.ejs传递的点赞数据
        // 如果页面没有提供likesData，则使用空数组
        const likesData = window.likesData || [];
        const hasLiked = likesData.some(like => 
            like.type === type && like.id === id && like.user === userId
        );
        
        if (hasLiked) {
            button.classList.add('liked');
            const icon = button.querySelector('i');
            icon.classList.remove('far');
            icon.classList.add('fas');
        }
    });
    
    // 待办事项状态切换
    const todoCheckboxes = document.querySelectorAll('.todo-checkbox input');
    todoCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const id = this.getAttribute('data-id');
            
            fetch('/toggle-todo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 更新UI状态
                    const todoCard = this.closest('.todo-card');
                    todoCard.classList.toggle('completed', data.completed);
                    todoCard.setAttribute('data-status', data.completed ? 'completed' : 'pending');
                }
            })
            .catch(error => console.error('更新待办事项失败:', error));
        });
    });
    
    // 待办事项筛选
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 更新按钮状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            const todoCards = document.querySelectorAll('.todo-card');
            
            // 筛选待办事项
            todoCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-status') === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 消息表单提交后滚动到底部
    const messageForm = document.getElementById('message-form');
    if (messageForm) {
        messageForm.addEventListener('submit', function() {
            setTimeout(() => {
                const messagesContainer = document.querySelector('.messages-container');
                if (messagesContainer) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }, 100);
        });
    }
    
    // 初始滚动消息到底部
    setTimeout(() => {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, 500);
});
