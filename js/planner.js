/**
 * Fully Interactive AI Planner
 */

window.Planner = {
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadSchedule();
    },

    cacheDOM() {
        this.btnGenerate = document.getElementById('btn-generate-plan');
        this.timeline = document.getElementById('planner-timeline');
    },

    bindEvents() {
        this.btnGenerate.addEventListener('click', () => this.generatePlan());
        this.timeline.addEventListener('click', (e) => this.handleTimelineClick(e));
    },

    loadSchedule() {
        this.scheduleEvents = window.Storage.get('lifeos_planner_schedule');
        if (!this.scheduleEvents || this.scheduleEvents.length === 0) {
            this.timeline.innerHTML = `<li class="empty-state">No schedule generated yet. Click Generate below!</li>`;
        } else {
            this.btnGenerate.innerHTML = `<i class="ph ph-arrows-clockwise"></i> Regenerate Plan`;
            this.renderTimeline();
        }
    },

    saveSchedule() {
        window.Storage.set('lifeos_planner_schedule', this.scheduleEvents);
    },

    generatePlan() {
        this.btnGenerate.innerHTML = `<i class="ph ph-spinner ph-spin"></i> Generating...`;
        this.btnGenerate.disabled = true;

        setTimeout(() => {
            const tasks = window.Storage.get(window.STORAGE_KEYS.TASKS) || [];
            const activeTasks = tasks.filter(t => !t.completed);
            
            let newSchedule = [];

            if (activeTasks.length > 0) {
                newSchedule = [
                    { id: Date.now() + '1', time: "08:00 AM", task: "Morning routine & goal review" },
                    { id: Date.now() + '2', time: "09:00 AM", task: `Deep work session: ${activeTasks[0].title}` },
                    { id: Date.now() + '3', time: "01:00 PM", task: "Lunch & break" },
                    { id: Date.now() + '4', time: "02:00 PM", task: `Light tasks ${activeTasks.length > 1 ? '& ' + activeTasks[1].title : '/ learning'}` },
                    { id: Date.now() + '5', time: "06:00 PM", task: "Exercise / refresh" },
                    { id: Date.now() + '6', time: "09:00 PM", task: "Review & plan tomorrow" }
                ];
            } else {
                newSchedule = [
                    { id: Date.now() + '1', time: "08:00 AM", task: "Morning routine & goal review" },
                    { id: Date.now() + '2', time: "09:00 AM", task: "Productivity sprint (Skill building)" },
                    { id: Date.now() + '3', time: "01:00 PM", task: "Lunch & offline break" },
                    { id: Date.now() + '4', time: "02:00 PM", task: "Deep work on side projects" },
                    { id: Date.now() + '5', time: "06:00 PM", task: "Exercise / outdoor walk" },
                    { id: Date.now() + '6', time: "09:00 PM", task: "Review & plan tomorrow" }
                ];
            }

            this.scheduleEvents = newSchedule;
            this.saveSchedule();
            this.renderTimeline();

            this.btnGenerate.innerHTML = `<i class="ph ph-arrows-clockwise"></i> Regenerate Plan`;
            this.btnGenerate.disabled = false;

        }, 1200);
    },

    renderTimeline() {
        this.timeline.innerHTML = '';
        
        this.scheduleEvents.forEach((ev) => {
            const li = document.createElement('li');
            li.dataset.id = ev.id;
            
            // Editable Block
            li.innerHTML = `
                <div style="display: flex; gap: var(--spacing-md); width: 100%; align-items: center; position: relative;">
                    <div style="font-weight: 600; color: var(--text-secondary); min-width: 90px; text-align: right; font-variant-numeric: tabular-nums;" class="display-time">${ev.time}</div>
                    
                    <div class="item-content-block" style="flex: 1; display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-sm) var(--spacing-md); background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); transition: transform var(--transition-fast);">
                        <span class="text-text-primary display-task" style="font-weight: 500;">${ev.task}</span>
                        
                        <div class="item-actions" style="opacity: 0; transition: opacity 0.2s;">
                            <button class="btn-icon btn-ghost edit-item" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                            <button class="btn-icon btn-ghost delete-item" title="Delete"><i class="ph ph-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
            
            // Hover logic for actions
            const contentBlock = li.querySelector('.item-content-block');
            const actions = li.querySelector('.item-actions');
            contentBlock.addEventListener('mouseenter', () => {
                contentBlock.style.transform = 'translateY(-2px)';
                actions.style.opacity = '1';
            });
            contentBlock.addEventListener('mouseleave', () => {
                contentBlock.style.transform = 'none';
                actions.style.opacity = '0';
            });

            this.timeline.appendChild(li);
        });

        // Add 'Add Task' Block at the bottom
        const addLi = document.createElement('li');
        addLi.style.cssText = "background: transparent; border: 1px dashed var(--border-color); align-items: center; justify-content: center; cursor: pointer; padding: var(--spacing-sm); border-radius: var(--radius-md); transition: background 0.2s;";
        addLi.innerHTML = `<span class="text-accent" style="font-weight: 600;"><i class="ph ph-plus"></i> Add Item</span>`;
        addLi.addEventListener('mouseenter', () => addLi.style.background = 'rgba(255,255,255,0.02)');
        addLi.addEventListener('mouseleave', () => addLi.style.background = 'transparent');
        addLi.addEventListener('click', () => this.showAddForm());
        
        this.timeline.appendChild(addLi);
    },

    handleTimelineClick(e) {
        const li = e.target.closest('li[data-id]');
        if (!li) return;
        const id = li.dataset.id;
        
        if (e.target.closest('.delete-item')) {
            this.scheduleEvents = this.scheduleEvents.filter(ev => ev.id !== id);
            this.saveSchedule();
            this.renderTimeline();
        } 
        else if (e.target.closest('.edit-item')) {
            this.convertToEditForm(li, id);
        }
        else if (e.target.closest('.save-edit')) {
            const timeInput = li.querySelector('.edit-time-input').value;
            const taskInput = li.querySelector('.edit-task-input').value;
            
            const eventIndex = this.scheduleEvents.findIndex(ev => ev.id === id);
            if (eventIndex > -1) {
                this.scheduleEvents[eventIndex].time = timeInput;
                this.scheduleEvents[eventIndex].task = taskInput;
                this.saveSchedule();
                this.renderTimeline();
            }
        }
        else if (e.target.closest('.cancel-edit')) {
            this.renderTimeline(); // re-render discards inputs
        }
    },

    convertToEditForm(li, id) {
        const event = this.scheduleEvents.find(ev => ev.id === id);
        if (!event) return;

        li.innerHTML = `
            <div style="display: flex; gap: var(--spacing-sm); width: 100%; align-items: center;">
                <input type="text" class="edit-time-input" value="${event.time}" style="width: 100px; padding: 0.4rem; font-size: 0.85rem;" placeholder="08:00 AM">
                <input type="text" class="edit-task-input" value="${event.task}" style="flex: 1; padding: 0.4rem; font-size: 0.85rem;" placeholder="Task description">
                <button class="btn btn-primary btn-icon save-edit" style="padding: 0.4rem;"><i class="ph ph-check"></i></button>
                <button class="btn btn-ghost btn-icon cancel-edit" style="padding: 0.4rem;"><i class="ph ph-x"></i></button>
            </div>
        `;
    },

    showAddForm() {
        const id = Date.now().toString();
        
        const newEvent = { id: id, time: "12:00 PM", task: "New Task" };
        this.scheduleEvents.push(newEvent);
        
        this.renderTimeline();
        
        // Immediately place it into edit mode
        const newLi = this.timeline.querySelector(`li[data-id="${id}"]`);
        if(newLi) {
            this.convertToEditForm(newLi, id);
            newLi.querySelector('.edit-task-input').focus();
            newLi.querySelector('.edit-task-input').select();
        }
    }
};
