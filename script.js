class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTodos();
        this.updateStats();
    }

    bindEvents() {
        // 입력 이벤트
        const todoInput = document.getElementById('todoInput');
        const addBtn = document.getElementById('addBtn');

        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // 필터 버튼 이벤트
        const filterInputs = document.querySelectorAll('input[name="filter"]');
        filterInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.setFilter(e.target.value);
            });
        });

        // 전체 삭제 버튼 이벤트
        document.getElementById('clearCompleted').addEventListener('click', () => {
            this.clearCompleted();
        });

        document.getElementById('clearAll').addEventListener('click', () => {
            this.clearAll();
        });
    }

    addTodo() {
        const todoInput = document.getElementById('todoInput');
        const text = todoInput.value.trim();

        if (text === '') {
            this.showSweetAlert('warning', '입력 오류', '할 일을 입력해주세요!');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.renderTodos();
        this.updateStats();

        todoInput.value = '';
        this.showSweetAlert('success', '추가 완료', '할 일이 추가되었습니다!');
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            
            const message = todo.completed ? '완료되었습니다!' : '진행중으로 변경되었습니다!';
            this.showSweetAlert('info', '상태 변경', message);
        }
    }

    deleteTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        
        Swal.fire({
            title: '삭제 확인',
            text: `"${todo.text}" 할 일을 삭제하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveTodos();
                this.renderTodos();
                this.updateStats();
                this.showSweetAlert('success', '삭제 완료', '할 일이 삭제되었습니다!');
            }
        });
    }

    editTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim() !== '') {
            todo.text = newText.trim();
            this.saveTodos();
            this.renderTodos();
            this.showSweetAlert('success', '수정 완료', '할 일이 수정되었습니다!');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.renderTodos();
    }

    clearCompleted() {
        const completedTodos = this.todos.filter(t => t.completed);
        
        if (completedTodos.length === 0) {
            this.showSweetAlert('info', '알림', '완료된 할 일이 없습니다!');
            return;
        }

        Swal.fire({
            title: '완료된 항목 삭제',
            text: `${completedTodos.length}개의 완료된 할 일을 삭제하시겠습니까?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                this.todos = this.todos.filter(t => !t.completed);
                this.saveTodos();
                this.renderTodos();
                this.updateStats();
                this.showSweetAlert('success', '삭제 완료', `${completedTodos.length}개의 완료된 할 일이 삭제되었습니다!`);
            }
        });
    }

    clearAll() {
        if (this.todos.length === 0) {
            this.showSweetAlert('info', '알림', '삭제할 할 일이 없습니다!');
            return;
        }

        Swal.fire({
            title: '전체 삭제',
            text: `모든 할 일(${this.todos.length}개)을 삭제하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '전체 삭제',
            cancelButtonText: '취소',
            reverseButtons: true,
            dangerMode: true
        }).then((result) => {
            if (result.isConfirmed) {
                const count = this.todos.length;
                this.todos = [];
                this.saveTodos();
                this.renderTodos();
                this.updateStats();
                this.showSweetAlert('success', '삭제 완료', `${count}개의 할 일이 모두 삭제되었습니다!`);
            }
        });
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    renderTodos() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            const emptyMessage = this.currentFilter === 'all' 
                ? '할 일을 추가해보세요!' 
                : this.currentFilter === 'active' 
                    ? '진행중인 할 일이 없습니다!' 
                    : '완료된 할 일이 없습니다!';
            
            todoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>${emptyMessage}</p>
                </div>
            `;
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => this.createTodoElement(todo)).join('');
        
        // 이벤트 리스너 추가
        this.addTodoEventListeners();
    }

    createTodoElement(todo) {
        const createdAt = new Date(todo.createdAt).toLocaleDateString('ko-KR');
        
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="edit-btn" title="수정">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" title="삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <small class="todo-date">
                    ${createdAt}
                </small>
            </div>
        `;
    }

    addTodoEventListeners() {
        // 체크박스 이벤트
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const todoId = parseInt(e.target.closest('.todo-item').dataset.id);
                this.toggleTodo(todoId);
            });
        });

        // 삭제 버튼 이벤트
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoId = parseInt(e.target.closest('.todo-item').dataset.id);
                this.deleteTodo(todoId);
            });
        });

        // 수정 버튼 이벤트
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoItem = e.target.closest('.todo-item');
                const todoId = parseInt(todoItem.dataset.id);
                const todoText = todoItem.querySelector('.todo-text');
                const currentText = todoText.textContent;
                
                this.startEdit(todoText, todoId, currentText);
            });
        });
    }

    startEdit(todoTextElement, todoId, currentText) {
        Swal.fire({
            title: '할 일 수정',
            input: 'text',
            inputValue: currentText,
            inputPlaceholder: '할 일을 입력하세요...',
            showCancelButton: true,
            confirmButtonText: '수정',
            cancelButtonText: '취소',
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#6b7280',
            inputValidator: (value) => {
                if (!value.trim()) {
                    return '할 일을 입력해주세요!';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.editTodo(todoId, result.value);
            }
        });
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;

        document.getElementById('totalCount').textContent = total;
        document.getElementById('activeCount').textContent = active;
        document.getElementById('completedCount').textContent = completed;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSweetAlert(icon, title, text) {
        Swal.fire({
            icon: icon,
            title: title,
            text: text,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#fff',
            color: '#1f2937',
            customClass: {
                popup: 'swal2-toast'
            }
        });
    }

    // 통계 애니메이션 효과
    animateStats() {
        const statElements = document.querySelectorAll('.stat-info h4');
        statElements.forEach(element => {
            const target = parseInt(element.textContent);
            let current = 0;
            const increment = target / 20;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current);
            }, 50);
        });
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    const app = new TodoApp();
    
    // SweetAlert2 기본 설정
    Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
});
