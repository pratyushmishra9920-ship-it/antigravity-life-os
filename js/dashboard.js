/**
 * Dashboard Logic for Life OS
 */

const Dashboard = {
    init() {
        this.tasks = window.Storage.get(window.STORAGE_KEYS.TASKS) || [];
        this.habits = window.Storage.get(window.STORAGE_KEYS.HABITS) || [];
        let rawGoals = window.Storage.get(window.STORAGE_KEYS.GOALS) || [];
        // Normalization
        this.goals = rawGoals.map(g => g.id ? g : { ...g, id: Date.now().toString() + Math.random() });

        this.cacheDOM();
        this.bindEvents();
        this.renderAll();
    },

    cacheDOM() {
        this.taskList = document.getElementById('task-list');
        this.habitList = document.getElementById('habit-list');
        this.goalList = document.getElementById('goal-list');
        this.taskCount = document.getElementById('task-count');
        this.btnNewTask = document.getElementById('btn-new-task');
        this.taskModal = document.getElementById('task-modal');
        this.taskForm = document.getElementById('task-form');
        this.closeModalBtn = this.taskModal.querySelector('.close-modal');
        this.btnAddGoal = document.getElementById('btn-add-goal');
    },

    bindEvents() {
        this.btnNewTask.addEventListener('click', () => window.UI.openModal('task-modal'));
        this.closeModalBtn.addEventListener('click', () => window.UI.closeModal('task-modal'));
        
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Delegate clicks for tasks/habits/goals
        this.taskList.addEventListener('click', (e) => this.handleTaskClick(e));
        this.habitList.addEventListener('click', (e) => this.handleHabitClick(e));

        // Goals Event Binding
        if (this.btnAddGoal) {
            this.btnAddGoal.addEventListener('click', () => {
                const newId = Date.now().toString();
                this.goals.push({ id: newId, title: 'New Focus Area', progress: 0 });
                this.saveGoals();
                this.renderGoals();
                const newLi = this.goalList.querySelector(`li[data-goal-id="${newId}"]`);
                if (newLi) this.convertToGoalEditForm(newLi, newId);
            });
        }

        this.goalList.addEventListener('click', (e) => this.handleGoalClick(e));

        // Listen for storage updates to refresh insight
        document.addEventListener('lifeos_storage_updated', () => {
             this.updateAIInsight();
        });
    },

    renderAll() {
        this.renderTasks();
        this.renderHabits();
        this.renderGoals();
        this.updateAIInsight();
    },

    updateAIInsight() {
        const hour = new Date().getHours();
        const activeTasks = this.tasks.filter(t => !t.completed).length;
        const totalHabits = this.habits.length;
        const completedHabits = this.habits.filter(h => h.completedToday).length;
        
        const insightEl = document.getElementById('daily-insight');
        if (!insightEl) return;

        let timeOfDay = 'morning';
        if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
        if (hour >= 17) timeOfDay = 'evening';

        let message = '';

        if (activeTasks > 4) {
            message = `You have ${activeTasks} tasks on your plate. To avoid overwhelm, prioritize the top 2 and defer the rest!`;
        } else if (completedHabits < totalHabits && activeTasks > 0) {
            message = `You're making progress with ${activeTasks} tasks left, but don't forget to maintain consistency with your daily habits today.`;
        } else if (completedHabits < totalHabits && activeTasks === 0) {
             message = `Task list is clear! Focus on maintaining consistency by checking off your remaining daily habits.`;
        } else if (activeTasks === 0) {
            message = `Your schedule is completely clear! Consider using this free time for a productive side-project or learning a new skill.`;
        } else {
            message = `You have ${activeTasks} tasks remaining. Focus and knock them out!`;
        }

        // Add a nice visual refresh animation
        insightEl.style.opacity = '0';
        setTimeout(() => {
            insightEl.innerText = message;
            insightEl.style.opacity = '1';
            insightEl.style.transition = 'opacity 0.4s ease';
        }, 200);
    },

    // --- Tasks ---
    renderTasks(newId = null) {
        this.taskList.innerHTML = '';
        
        const todayTasks = this.tasks; 
        
        if (todayTasks.length === 0) {
            this.taskList.innerHTML = `<li class="empty-state">No tasks for today. Time to relax!</li>`;
            this.taskCount.textContent = '0/0';
            return;
        }

        const completed = todayTasks.filter(t => t.completed).length;
        this.taskCount.textContent = `${completed}/${todayTasks.length}`;

        todayTasks.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = task.id;
            if (task.id === newId) {
                li.classList.add('new-item-pop');
            }
            
            const checkboxIcon = task.completed ? 'ph-check-circle text-accent' : 'ph-circle';
            const textStyle = task.completed ? 'text-decoration: line-through; opacity: 0.6;' : '';

            li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <i class="ph ${checkboxIcon} task-toggle" style="font-size: 1.5rem; cursor: pointer;"></i>
                    <span style="${textStyle}">${task.title}</span>
                </div>
                <div style="display: flex; gap: 0.5rem">
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--bg-elevated)">${task.priority}</span>
                    <button class="btn-icon btn-ghost task-delete"><i class="ph ph-trash"></i></button>
                </div>
            `;
            this.taskList.appendChild(li);
        });
    },

    addTask() {
        const titleInput = document.getElementById('task-title');
        const priorityInput = document.getElementById('task-priority');

        const newTask = {
            id: Date.now().toString(),
            title: titleInput.value.trim(),
            priority: priorityInput.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.saveTasks();
        
        titleInput.value = '';
        window.UI.closeModal('task-modal');
        this.renderTasks(newTask.id);
    },

    handleTaskClick(e) {
        const li = e.target.closest('li');
        if (!li || !li.dataset.id) return;
        
        const id = li.dataset.id;
        const taskIndex = this.tasks.findIndex(t => t.id === id);

        if (e.target.classList.contains('task-toggle') || e.target.parentElement.classList.contains('task-toggle')) {
            this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
            this.saveTasks();
            this.renderTasks();
        } else if (e.target.classList.contains('ph-trash')) {
            this.tasks.splice(taskIndex, 1);
            this.saveTasks();
            this.renderTasks();
        }
    },

    saveTasks() {
        window.Storage.set(window.STORAGE_KEYS.TASKS, this.tasks);
    },

    // --- Habits ---
    renderHabits() {
        this.habitList.innerHTML = '';
        
        this.habits.forEach(habit => {
            const div = document.createElement('div');
            div.className = 'habit-item';
            div.dataset.id = habit.id;
            
            const color = habit.completedToday ? 'var(--accent-success)' : 'inherit';
            const bgClass = habit.completedToday ? 'glassmorphism' : '';

            div.innerHTML = `
                <i class="ph ${habit.icon}" style="font-size: 2rem; color: ${color}; margin-bottom: 0.5rem"></i>
                <div style="font-size: 0.85rem; font-weight: 500">${habit.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted)">🔥 ${habit.streak}</div>
            `;
            
            if (habit.completedToday) {
                div.style.borderColor = 'var(--accent-success)';
                div.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            }

            this.habitList.appendChild(div);
        });
    },

    handleHabitClick(e) {
        const item = e.target.closest('.habit-item');
        if (!item) return;

        const id = item.dataset.id;
        const habit = this.habits.find(h => h.id === id);
        
        if (habit) {
            habit.completedToday = !habit.completedToday;
            if (habit.completedToday) {
                habit.streak++;
            } else {
                habit.streak = Math.max(0, habit.streak - 1);
            }
            window.Storage.set(window.STORAGE_KEYS.HABITS, this.habits);
            this.renderHabits();
        }
    },

    // --- Goals ---
    renderGoals() {
        this.goalList.innerHTML = '';
        
        if (this.goals.length === 0) {
            this.goalList.innerHTML = `<li class="empty-state" style="border: 1px dashed rgba(255,255,255,0.1); background: transparent; justify-content: center; transform: none; box-shadow: none;">No active goals yet. Add one!</li>`;
            return;
        }

        this.goals.forEach(goal => {
            const li = document.createElement('li');
            li.dataset.goalId = goal.id;
            li.style.cssText = 'margin-bottom: 1.2rem; position: relative; padding: var(--spacing-sm) var(--spacing-md); background: rgba(255,255,255,0.02); border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.03); transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease; box-shadow: inset 0 1px 2px rgba(255,255,255,0.01); list-style: none;';
            
            li.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.6rem; align-items: center;">
                    <span style="font-weight: 600; font-size: 0.95rem;">${goal.title}</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="text-accent" style="font-weight: 700; font-size: 0.95rem;">${goal.progress}%</span>
                        <div class="goal-actions" style="opacity: 0; transition: opacity 0.2s; display: flex;">
                            <button class="btn-icon btn-ghost edit-goal" style="padding: 4px; font-size: 1.1rem;"><i class="ph ph-pencil-simple"></i></button>
                            <button class="btn-icon btn-ghost delete-goal" style="padding: 4px; font-size: 1.1rem; color: var(--accent-danger);"><i class="ph ph-trash"></i></button>
                        </div>
                    </div>
                </div>
                <div style="height: 6px; background: rgba(0,0,0,0.3); border-radius: var(--radius-pill); overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);">
                    <div style="width: ${goal.progress}%; height: 100%; background: var(--accent-gradient); border-radius: var(--radius-pill); transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);"></div>
                </div>
            `;
            
            li.addEventListener('mouseenter', () => {
                li.style.transform = 'translateY(-2px) scale(1.01)';
                li.style.borderColor = 'rgba(255,255,255,0.1)';
                const acts = li.querySelector('.goal-actions');
                if(acts) acts.style.opacity = '1';
            });
            li.addEventListener('mouseleave', () => {
                li.style.transform = 'none';
                li.style.borderColor = 'rgba(255,255,255,0.03)';
                const acts = li.querySelector('.goal-actions');
                if(acts) acts.style.opacity = '0';
            });
            
            this.goalList.appendChild(li);
        });
    },

    convertToGoalEditForm(li, id) {
        const goal = this.goals.find(g => g.id === id);
        if (!goal) return;

        li.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm); padding: var(--spacing-xs) 0;">
                <input type="text" class="edit-goal-title" value="${goal.title}" placeholder="Goal Title" style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); font-size: 0.9rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: white;">
                <div style="display: flex; gap: var(--spacing-sm); align-items: center;">
                    <div style="position: relative;">
                         <input type="number" class="edit-goal-progress" value="${goal.progress}" min="0" max="100" style="width: 80px; padding: 0.6rem; padding-right: 25px; border-radius: var(--radius-sm); background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: white; display: inline-block;">
                         <span style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 0.85rem; color: var(--text-muted); pointer-events: none;">%</span>
                    </div>
                    <div style="flex: 1;"></div>
                    <button class="btn btn-primary save-goal" style="padding: 0.5rem 1rem;"><i class="ph ph-check"></i></button>
                    <button class="btn btn-ghost cancel-goal" style="padding: 0.5rem 1rem;"><i class="ph ph-x"></i></button>
                </div>
            </div>
        `;
        li.style.transform = 'none'; // reset hover transform during edit
    },

    handleGoalClick(e) {
        const li = e.target.closest('li[data-goal-id]');
        if (!li) return;
        const id = li.dataset.goalId;

        if (e.target.closest('.delete-goal')) {
            this.goals = this.goals.filter(g => g.id !== id);
            this.saveGoals();
            this.renderGoals();
        } else if (e.target.closest('.edit-goal')) {
            this.convertToGoalEditForm(li, id);
        } else if (e.target.closest('.save-goal')) {
            const titleInput = li.querySelector('.edit-goal-title');
            const progInput = li.querySelector('.edit-goal-progress');
            if(!titleInput || !progInput) return;
            
            const title = titleInput.value.trim() || 'Untitled Goal';
            let progress = parseInt(progInput.value) || 0;
            progress = Math.min(100, Math.max(0, progress));
            
            const idx = this.goals.findIndex(g => g.id === id);
            if (idx > -1) {
                this.goals[idx].title = title;
                this.goals[idx].progress = progress;
                this.saveGoals();
            }
            this.renderGoals();
        } else if (e.target.closest('.cancel-goal')) {
            this.renderGoals(); // reverts to read-only view
        }
    },

    saveGoals() {
        window.Storage.set(window.STORAGE_KEYS.GOALS, this.goals);
    }
};

window.Dashboard = Dashboard;
