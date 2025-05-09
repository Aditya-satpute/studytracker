// Function to load saved data from localStorage or use defaults
function loadSavedData(defaultChapters) {
    const savedData = localStorage.getItem('studyTrackerData');
    
    let subjects;
    
    if (savedData) {
        try {
            subjects = JSON.parse(savedData);
        } catch (error) {
            console.error('Error parsing saved data:', error);
            subjects = defaultChapters;
        }
    } else {
        subjects = defaultChapters;
    }
    
    // Clear existing chapters
    document.getElementById('physics-chapters').innerHTML = '';
    document.getElementById('chemistry-chapters').innerHTML = '';
    
    // Add Physics chapters
    if (subjects.physics && subjects.physics.length > 0) {
        subjects.physics.forEach(chapter => {
            addChapterFromData(chapter, 'physics');
        });
    } else if (defaultChapters.physics) {
        defaultChapters.physics.forEach(chapter => {
            addDefaultChapter(chapter, 'physics');
        });
    }
    
    // Add Chemistry chapters
    if (subjects.chemistry && subjects.chemistry.length > 0) {
        subjects.chemistry.forEach(chapter => {
            addChapterFromData(chapter, 'chemistry');
        });
    } else if (defaultChapters.chemistry) {
        defaultChapters.chemistry.forEach(chapter => {
            addDefaultChapter(chapter, 'chemistry');
        });
    }
    
    // Update visual indicators
    updateCompletionStatus();
}

// Function to add a default chapter
function addDefaultChapter(chapterData, subject) {
    // Create a new chapter card from the template
    const template = document.getElementById('chapter-template');
    const clone = document.importNode(template.content, true);
    
    // Set the chapter title and important info
    clone.querySelector('.chapter-title').textContent = chapterData.title;
    clone.querySelector('.chapter-important-info').value = chapterData.importantInfo || '';
    
    // Add a unique ID to the chapter card for data saving
    const chapterId = subject + '-chapter-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    clone.querySelector('.chapter-card').dataset.id = chapterId;
    clone.querySelector('.chapter-card').dataset.subject = subject;
    
    // Add the chapter to the appropriate subject container
    document.getElementById(subject + '-chapters').appendChild(clone);
}

// Function to add a chapter from saved data
function addChapterFromData(chapter, subject) {
    // Create a new chapter card from the template
    const template = document.getElementById('chapter-template');
    const clone = document.importNode(template.content, true);
    
    // Set the chapter ID and title
    const chapterCard = clone.querySelector('.chapter-card');
    chapterCard.dataset.id = chapter.id;
    chapterCard.dataset.subject = subject;
    clone.querySelector('.chapter-title').textContent = chapter.title;
    
    // Set important info if available
    if (chapter.importantInfo) {
        clone.querySelector('.chapter-important-info').value = chapter.importantInfo;
    }
    
    // Set collapsed state
    if (chapter.collapsed) {
        chapterCard.classList.add('collapsed');
        clone.querySelector('.collapse-btn').textContent = 'Expand';
    }
    
    // Set checkboxes
    if (chapter.theory) {
        clone.querySelector('.theory-allen').checked = chapter.theory.allen;
        clone.querySelector('.theory-bt').checked = chapter.theory.bt;
    }
    
    if (chapter.practice) {
        if (chapter.practice.allen) {
            clone.querySelector('.practice-allen').checked = chapter.practice.allen.completed;
            clone.querySelector('.remarks-allen').value = chapter.practice.allen.remarks || '';
        }
        
        if (chapter.practice.sqb) {
            clone.querySelector('.practice-sqb').checked = chapter.practice.sqb.completed;
            clone.querySelector('.remarks-sqb').value = chapter.practice.sqb.remarks || '';
        }
        
        if (chapter.practice.bt) {
            if (chapter.practice.bt.ex1) {
                clone.querySelector('.practice-bt-ex1').checked = chapter.practice.bt.ex1.completed;
                clone.querySelector('.remarks-bt-ex1').value = chapter.practice.bt.ex1.remarks || '';
            }
            
            if (chapter.practice.bt.ex2) {
                clone.querySelector('.practice-bt-ex2').checked = chapter.practice.bt.ex2.completed;
                clone.querySelector('.remarks-bt-ex2').value = chapter.practice.bt.ex2.remarks || '';
            }
        }
    }
    
    // Add the chapter to the appropriate subject container
    document.getElementById(subject + '-chapters').appendChild(clone);
}

// Function to update visual completion status
function updateCompletionStatus() {
    const chapterCards = document.querySelectorAll('.chapter-card');
    
    chapterCards.forEach(card => {
        const subsections = card.querySelectorAll('.subsection');
        
        subsections.forEach(subsection => {
            const checkbox = subsection.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                subsection.classList.add('completed');
            } else {
                subsection.classList.remove('completed');
            }
        });
        
        const btExercises = card.querySelectorAll('.bt-exercise');
        btExercises.forEach(exercise => {
            const checkbox = exercise.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                exercise.classList.add('completed');
            } else {
                exercise.classList.remove('completed');
            }
        });
    });
}// Function to add a new chapter
function addChapter() {
    const chapterName = document.getElementById('chapter-name').value.trim();
    const subject = document.getElementById('subject-select').value;
    
    if (!chapterName) {
        alert('Please enter a chapter name');
        return;
    }
    
    // Create a new chapter card from the template
    const template = document.getElementById('chapter-template');
    const clone = document.importNode(template.content, true);
    
    // Set the chapter title
    const titleElement = clone.querySelector('.chapter-title');
    titleElement.textContent = chapterName;
    
    // Add a unique ID to the chapter card for data saving
    const chapterId = subject + '-chapter-' + Date.now();
    clone.querySelector('.chapter-card').dataset.id = chapterId;
    clone.querySelector('.chapter-card').dataset.subject = subject;
    
    // Add the new chapter to the subject container
    document.getElementById(subject + '-chapters').appendChild(clone);
    
    // Clear the input field
    document.getElementById('chapter-name').value = '';
    
    // Save data
    saveData();
}

// Function to handle all actions (collapse, delete, collapse subject)
function handleActions(event) {
    const target = event.target;
    
    // Handle chapter collapse button
    if (target.classList.contains('collapse-btn')) {
        const chapterCard = target.closest('.chapter-card');
        chapterCard.classList.toggle('collapsed');
        
        // Update button text
        if (chapterCard.classList.contains('collapsed')) {
            target.textContent = 'Expand';
        } else {
            target.textContent = 'Collapse';
        }
        return;
    }
    
    // Handle subject collapse button
    if (target.classList.contains('collapse-subject-btn')) {
        const subject = target.dataset.subject;
        const subjectContainer = document.getElementById(subject + '-container');
        subjectContainer.classList.toggle('collapsed-subject');
        
        // Update button text
        if (subjectContainer.classList.contains('collapsed-subject')) {
            target.textContent = 'Expand All';
        } else {
            target.textContent = 'Collapse All';
        }
        return;
    }
    
    // Handle delete button
    if (target.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this chapter?')) {
            const chapterCard = target.closest('.chapter-card');
            chapterCard.remove();
            saveData();
        }
        return;
    }
}

// Function to save data to localStorage
function saveData() {
    const subjects = {
        physics: [],
        chemistry: []
    };
    
    // Process physics chapters
    const physicsChapters = document.querySelectorAll('#physics-chapters .chapter-card');
    physicsChapters.forEach(card => processChapterCard(card, 'physics', subjects.physics));
    
    // Process chemistry chapters
    const chemistryChapters = document.querySelectorAll('#chemistry-chapters .chapter-card');
    chemistryChapters.forEach(card => processChapterCard(card, 'chemistry', subjects.chemistry));
    
    // Save to localStorage
    localStorage.setItem('studyTrackerData', JSON.stringify(subjects));
    
    // Update visual indicators
    updateCompletionStatus();
}

// Helper function to process a chapter card and extract data
function processChapterCard(card, subject, chaptersArray) {
    const chapterId = card.dataset.id;
    const chapterTitle = card.querySelector('.chapter-title').textContent;
    const isCollapsed = card.classList.contains('collapsed');
    const importantInfo = card.querySelector('.chapter-important-info').value;
    
    // Get all checkbox values
    const theoryAllen = card.querySelector('.theory-allen').checked;
    const theoryBT = card.querySelector('.theory-bt').checked;
    const practiceAllen = card.querySelector('.practice-allen').checked;
    const practiceSQB = card.querySelector('.practice-sqb').checked;
    const practiceBTEx1 = card.querySelector('.practice-bt-ex1').checked;
    const practiceBTEx2 = card.querySelector('.practice-bt-ex2').checked;
    
    // Get all remarks
    const remarksAllen = card.querySelector('.remarks-allen').value;
    const remarksSQB = card.querySelector('.remarks-sqb').value;
    const remarksBTEx1 = card.querySelector('.remarks-bt-ex1').value;
    const remarksBTEx2 = card.querySelector('.remarks-bt-ex2').value;
    
    // Create chapter object
    const chapter = {
        id: chapterId,
        title: chapterTitle,
        subject: subject,
        collapsed: isCollapsed,
        importantInfo: importantInfo,
        theory: {
            allen: theoryAllen,
            bt: theoryBT
        },
        practice: {
            allen: {
                completed: practiceAllen,
                remarks: remarksAllen
            },
            sqb: {
                completed: practiceSQB,
                remarks: remarksSQB
            },
            bt: {
                ex1: {
                    completed: practiceBTEx1,
                    remarks: remarksBTEx1
                },
                ex2: {
                    completed: practiceBTEx2,
                    remarks: remarksBTEx2
                }
            }
        }
    };
    
    chaptersArray.push(chapter);
}document.addEventListener('DOMContentLoaded', function() {
    // Define some default chapters for each subject
    const defaultChapters = {
        physics: [
            {
                title: "Kinematics",
                importantInfo: "Foundation of mechanics. Focus on differentiating between average and instantaneous values."
            },
            {
                title: "Laws of Motion",
                importantInfo: "Remember to draw free body diagrams for all force problems."
            },
            {
                title: "Work, Energy and Power",
                importantInfo: "Conservation of energy is key to solving many problems."
            },
            {
                title: "Rotational Motion",
                importantInfo: "Analogous to linear motion, but with angular quantities."
            }
        ],
        chemistry: [
            {
                title: "Atomic Structure",
                importantInfo: "Important concepts: quantum numbers, electronic configuration."
            },
            {
                title: "Chemical Bonding",
                importantInfo: "VSEPR theory is crucial for predicting molecular geometry."
            },
            {
                title: "Thermodynamics",
                importantInfo: "First law relates to energy conservation, second law to entropy."
            }
        ]
    };
    
    // Load saved data from localStorage or use defaults
    loadSavedData(defaultChapters);
    
    // Add event listener for adding new chapters
    document.getElementById('add-chapter').addEventListener('click', addChapter);
    
    // Add event delegation for chapter actions (collapse, delete)
    document.querySelector('.subject-container').addEventListener('click', handleActions);
    
    // Add event delegation for input changes to save data
    document.querySelector('.subject-container').addEventListener('change', saveData);
    document.querySelector('.subject-container').addEventListener('input', saveData);
});
