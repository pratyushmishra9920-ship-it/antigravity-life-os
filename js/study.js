/**
 * Smart Study Assistant (Simulated AI)
 */

window.Study = {
    init() {
        this.cacheDOM();
        this.bindEvents();
    },

    cacheDOM() {
        this.notesInput = document.getElementById('study-notes-input');
        this.btnProcess = document.getElementById('btn-process-notes');
        this.resultsArea = document.getElementById('study-results');
        this.summaryOutput = document.getElementById('study-summary-output');
        this.questionsOutput = document.getElementById('study-questions-output');
    },

    bindEvents() {
        this.btnProcess.addEventListener('click', () => this.processNotes());
    },

    processNotes() {
        const text = this.notesInput.value.trim();
        
        if (!text) {
            alert("Please paste some notes first.");
            return;
        }

        // Simulating AI Processing Time
        this.btnProcess.innerHTML = `<i class="ph ph-spinner ph-spin"></i> Analyzing...`;
        this.btnProcess.disabled = true;

        setTimeout(() => {
            // Simulated Mock Response based on length and content
            const wordArr = text.split(/\s+/).filter(w => w.length > 4); // focus on larger words
            const wordsCount = text.split(/\s+/).length;
            
            // Extract a pseudo-topic if possible (most frequent longer word, simplified)
            let hintWord = "the core concepts";
            if (wordArr.length > 5) {
                hintWord = wordArr[Math.floor(Math.random() * (wordArr.length/2))];
            }

            this.summaryOutput.innerHTML = `
                <p>This text appears to be a study of <strong>${hintWord}</strong>. It introduces the foundational concepts and critical mechanisms that drive this topic.</p>
                <p>Throughout the material, several key arguments are made regarding its practical applications and theoretical limits. Memorizing these examples will be essential.</p>
                <p>Finally, the text challenges existing notions, suggesting that further review of <em>${hintWord}</em> is necessary for complete comprehension.</p>
            `;

            // Generate exactly 3 questions
            const numQuestions = 3;
            let qsHTML = "";
            for (let i = 0; i < numQuestions; i++) {
                const qType = ["What is the main significance of", "How would you define", "Can you explain the relationship between"][i % 3];
                let targetWord = wordArr.length > i*2 ? wordArr[wordArr.length - 1 - (i*2)] : 'the topic';
                
                qsHTML += `
                <li>
                    <div style="width: 100%">
                        <strong>Q${i+1}: ${qType} ${targetWord.replace(/[.,!?]/g, '')}?</strong>
                        <p style="color: var(--text-muted); margin-top: 5px; font-size: 0.9em; font-style: italic;">A: (Reflect and formulate an answer...)</p>
                    </div>
                </li>
                `;
            }

            this.questionsOutput.innerHTML = qsHTML;

            this.resultsArea.classList.remove('hidden');

            this.btnProcess.innerHTML = `<i class="ph ph-brain"></i> Analyze Notes`;
            this.btnProcess.disabled = false;

        }, 1500);
    }
};
