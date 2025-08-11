class DogWalkingCalculator {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.formData = {};
        this.mapboxAccessToken = 'pk.eyJ1IjoidmVlcmluZ251Z2dldCIsImEiOiJjbWU2c3Q4a2IwMGFmMnBzbGxhaWluN2h2In0.i0c0idtr0_-Oywdt2AuQKg';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgress();
        this.initializeMapbox();
    }

    initializeMapbox() {
        // Initialize with your API token
        this.setupLocationAutocomplete();
    }

    setupLocationFallback() {
        const locationInput = document.getElementById('locationInput');
        const suggestionsContainer = document.getElementById('locationSuggestions');
        const nextBtn = document.getElementById('nextBtn1');
        
        // Mock locations for demo
        const mockLocations = [
            'London, UK',
            'Manchester, UK',
            'Birmingham, UK',
            'Edinburgh, UK',
            'Bristol, UK',
            'Liverpool, UK',
            'Leeds, UK',
            'Sheffield, UK',
            'Newcastle, UK',
            'Cardiff, UK'
        ];

        locationInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                suggestionsContainer.style.display = 'none';
                nextBtn.disabled = true;
                return;
            }

            const filteredLocations = mockLocations.filter(location => 
                location.toLowerCase().includes(query)
            );

            if (filteredLocations.length > 0) {
                this.displaySuggestions(filteredLocations, suggestionsContainer);
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.location-input-container')) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }

    setupLocationAutocomplete() {
        const locationInput = document.getElementById('locationInput');
        const suggestionsContainer = document.getElementById('locationSuggestions');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const nextBtn = document.getElementById('nextBtn1');
        
        let timeoutId;

        locationInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                suggestionsContainer.style.display = 'none';
                nextBtn.disabled = true;
                return;
            }

            // Clear previous timeout
            clearTimeout(timeoutId);
            
            // Set a delay to avoid too many API calls
            timeoutId = setTimeout(() => {
                this.searchLocations(query, suggestionsContainer, loadingSpinner);
            }, 300);
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.location-input-container')) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }

    async searchLocations(query, suggestionsContainer, loadingSpinner) {
        loadingSpinner.style.display = 'block';
        
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.mapboxAccessToken}&country=GB&types=place,locality,neighborhood`
            );
            
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                const locations = data.features.map(feature => feature.place_name);
                this.displaySuggestions(locations.slice(0, 5), suggestionsContainer);
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
            suggestionsContainer.style.display = 'none';
        }
        
        loadingSpinner.style.display = 'none';
    }

    displaySuggestions(locations, container) {
        container.innerHTML = '';
        
        locations.forEach(location => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.textContent = location;
            
            suggestionItem.addEventListener('click', () => {
                document.getElementById('locationInput').value = location;
                container.style.display = 'none';
                this.formData.location = location;
                document.getElementById('nextBtn1').disabled = false;
            });
            
            container.appendChild(suggestionItem);
        });
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('backBtn2').addEventListener('click', () => this.goToStep(1));
        document.getElementById('backBtn3').addEventListener('click', () => this.goToStep(2));
        document.getElementById('backBtn4').addEventListener('click', () => this.goToStep(3));
        document.getElementById('backBtn5').addEventListener('click', () => this.goToStep(4));

        document.getElementById('nextBtn1').addEventListener('click', () => this.handleStep1());
        document.getElementById('nextBtn2').addEventListener('click', () => this.handleStep2());
        document.getElementById('nextBtn3').addEventListener('click', () => this.handleStep3());
        document.getElementById('nextBtn4').addEventListener('click', () => this.handleStep4());
        document.getElementById('calculateBtn').addEventListener('click', () => this.handleStep5());

        // Form validation
        document.querySelectorAll('input[name="experience"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById('nextBtn2').disabled = false;
            });
        });

        document.querySelectorAll('input[name="firstAid"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById('nextBtn3').disabled = false;
            });
        });

        document.querySelectorAll('input[name="walkType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleWalkTypeChange(e.target.value);
            });
        });

        document.getElementById('groupSize').addEventListener('change', () => {
            this.validateStep4();
        });

        document.querySelectorAll('input[name="walkLength"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById('calculateBtn').disabled = false;
            });
        });

        // Results actions
        document.getElementById('startOverBtn').addEventListener('click', () => this.startOver());
    }

    handleWalkTypeChange(walkType) {
        const groupSizeSection = document.getElementById('groupSizeSection');
        const nextBtn = document.getElementById('nextBtn4');
        
        if (walkType === 'group') {
            groupSizeSection.style.display = 'block';
            nextBtn.disabled = true;
        } else {
            groupSizeSection.style.display = 'none';
            nextBtn.disabled = false;
        }
    }

    validateStep4() {
        const walkType = document.querySelector('input[name="walkType"]:checked')?.value;
        const groupSize = document.getElementById('groupSize').value;
        const nextBtn = document.getElementById('nextBtn4');
        
        if (walkType === 'solo') {
            nextBtn.disabled = false;
        } else if (walkType === 'group' && groupSize) {
            nextBtn.disabled = false;
        } else {
            nextBtn.disabled = true;
        }
    }

    handleStep1() {
        const location = document.getElementById('locationInput').value.trim();
        if (location) {
            this.formData.location = location;
            this.goToStep(2);
        }
    }

    handleStep2() {
        const experience = document.querySelector('input[name="experience"]:checked')?.value;
        if (experience) {
            this.formData.experience = experience;
            this.goToStep(3);
        }
    }

    handleStep3() {
        const firstAid = document.querySelector('input[name="firstAid"]:checked')?.value;
        if (firstAid) {
            this.formData.firstAid = firstAid;
            this.goToStep(4);
        }
    }

    handleStep4() {
        const walkType = document.querySelector('input[name="walkType"]:checked')?.value;
        if (walkType) {
            this.formData.walkType = walkType;
            if (walkType === 'group') {
                this.formData.groupSize = document.getElementById('groupSize').value;
            }
            this.goToStep(5);
        }
    }

    handleStep5() {
        const walkLength = document.querySelector('input[name="walkLength"]:checked')?.value;
        if (walkLength) {
            this.formData.walkLength = parseInt(walkLength);
            this.calculatePrice();
        }
    }

    goToStep(stepNumber) {
        const currentStepEl = document.getElementById(`step${this.currentStep}`);
        const nextStepEl = stepNumber <= this.totalSteps ? document.getElementById(`step${stepNumber}`) : document.getElementById('results');
        
        // Add slide-out animation to current step
        currentStepEl.classList.add('slide-out');
        
        setTimeout(() => {
            currentStepEl.classList.remove('active', 'slide-out');
            nextStepEl.classList.add('active');
            
            this.currentStep = stepNumber;
            this.updateProgress();
        }, 300);
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const currentStepEl = document.getElementById('currentStep');
        
        const progressPercent = (this.currentStep / this.totalSteps) * 100;
        progressFill.style.width = `${progressPercent}%`;
        currentStepEl.textContent = this.currentStep;
    }

    calculatePrice() {
        const baseRate = 15; // £15 for 30min solo walk in standard area
        let totalPrice = baseRate;
        const breakdown = [];

        // Base rate
        breakdown.push({
            label: 'Base rate (30min solo walk)',
            value: `£${baseRate}`
        });

        // Location multiplier
        const locationMultiplier = this.getLocationMultiplier(this.formData.location);
        const locationAdjustment = Math.round(baseRate * (locationMultiplier - 1) * 100) / 100;
        if (locationAdjustment !== 0) {
            breakdown.push({
                label: `Location adjustment (${this.getLocationName(this.formData.location)})`,
                value: `${locationAdjustment >= 0 ? '+' : ''}£${locationAdjustment.toFixed(2)}`
            });
            totalPrice += locationAdjustment;
        }

        // Experience multiplier
        const experienceMultiplier = this.getExperienceMultiplier(this.formData.experience);
        const experienceAdjustment = Math.round(baseRate * (experienceMultiplier - 1) * 100) / 100;
        if (experienceAdjustment !== 0) {
            breakdown.push({
                label: `Experience bonus (${this.getExperienceText(this.formData.experience)})`,
                value: `+£${experienceAdjustment.toFixed(2)}`
            });
            totalPrice += experienceAdjustment;
        }

        // First aid bonus
        if (this.formData.firstAid === 'yes') {
            const firstAidBonus = 3;
            breakdown.push({
                label: 'First aid certification bonus',
                value: `+£${firstAidBonus}`
            });
            totalPrice += firstAidBonus;
        }

        // Walk type adjustment
        if (this.formData.walkType === 'group') {
            const groupMultiplier = this.getGroupMultiplier(this.formData.groupSize);
            const groupAdjustment = Math.round((totalPrice * groupMultiplier - totalPrice) * 100) / 100;
            breakdown.push({
                label: `Group walk adjustment (${this.formData.groupSize} dogs)`,
                value: `${groupAdjustment >= 0 ? '+' : ''}£${groupAdjustment.toFixed(2)}`
            });
            totalPrice = totalPrice * groupMultiplier;
        }

        // Length multiplier (this is applied last)
        const lengthMultiplier = this.getLengthMultiplier(this.formData.walkLength);
        if (lengthMultiplier !== 1) {
            const lengthAdjustment = Math.round((totalPrice * lengthMultiplier - totalPrice) * 100) / 100;
            breakdown.push({
                label: `Duration adjustment (${this.formData.walkLength} minutes)`,
                value: `${lengthAdjustment >= 0 ? '+' : ''}£${lengthAdjustment.toFixed(2)}`
            });
            totalPrice *= lengthMultiplier;
        }

        this.displayResults(Math.round(totalPrice * 100) / 100, breakdown);
    }

    getLocationMultiplier(location) {
        const locationLower = location.toLowerCase();
        
        if (locationLower.includes('london')) return 1.5;
        if (locationLower.includes('oxford') || locationLower.includes('cambridge')) return 1.3;
        if (locationLower.includes('bristol') || locationLower.includes('bath')) return 1.25;
        if (locationLower.includes('manchester') || locationLower.includes('birmingham')) return 1.15;
        if (locationLower.includes('edinburgh') || locationLower.includes('glasgow')) return 1.1;
        
        return 1.0; // Standard rate for other areas
    }

    getLocationName(location) {
        const locationLower = location.toLowerCase();
        
        if (locationLower.includes('london')) return 'London premium';
        if (locationLower.includes('oxford') || locationLower.includes('cambridge')) return 'University city';
        if (locationLower.includes('bristol') || locationLower.includes('bath')) return 'High-cost area';
        if (locationLower.includes('manchester') || locationLower.includes('birmingham')) return 'Major city';
        if (locationLower.includes('edinburgh') || locationLower.includes('glasgow')) return 'Scottish city';
        
        return 'Standard area';
    }

    getExperienceMultiplier(experience) {
        switch (experience) {
            case 'under1': return 0.9;
            case '2-5': return 1.1;
            case '5+': return 1.25;
            default: return 1.0;
        }
    }

    getExperienceText(experience) {
        switch (experience) {
            case 'under1': return 'Under 1 year';
            case '2-5': return '2-5 years';
            case '5+': return '5+ years';
            default: return '';
        }
    }

    getGroupMultiplier(groupSize) {
        const size = parseInt(groupSize);
        switch (size) {
            case 2: return 1.6; // 80% per dog (2 * 0.8)
            case 3: return 2.1; // 70% per dog (3 * 0.7)
            case 4: return 2.4; // 60% per dog (4 * 0.6)
            case 5: return 2.75; // 55% per dog (5 * 0.55)
            case 6: return 3.0; // 50% per dog (6 * 0.5)
            default: return 1;
        }
    }

    getLengthMultiplier(length) {
        switch (length) {
            case 30: return 1.0;
            case 60: return 1.8;
            case 90: return 2.5;
            default: return 1.0;
        }
    }

    displayResults(price, breakdown) {
        document.getElementById('finalPrice').textContent = price.toFixed(2);
        
        const walkType = this.formData.walkType === 'group' ? 
            ` (${this.formData.groupSize} dogs)` : '';
        document.getElementById('priceDuration').textContent = `per ${this.formData.walkLength}min walk${walkType}`;
        
        const breakdownList = document.getElementById('breakdownList');
        breakdownList.innerHTML = '';
        
        breakdown.forEach(item => {
            const div = document.createElement('div');
            div.className = 'breakdown-item';
            div.innerHTML = `
                <span class="breakdown-label">${item.label}</span>
                <span class="breakdown-value">${item.value}</span>
            `;
            breakdownList.appendChild(div);
        });
        
        document.getElementById('breakdownTotal').textContent = price.toFixed(2);
        
        // Show results
        const currentStepEl = document.getElementById(`step${this.currentStep}`);
        const resultsEl = document.getElementById('results');
        
        // Add slide-out animation to current step
        currentStepEl.classList.add('slide-out');
        
        setTimeout(() => {
            currentStepEl.classList.remove('active', 'slide-out');
            resultsEl.style.display = 'block';
            resultsEl.classList.add('show', 'active');
        }, 300);
        
        // Update progress to 100%
        document.getElementById('progressFill').style.width = '100%';
        document.getElementById('currentStep').textContent = 'Complete';
    }

startOver() {
    this.currentStep = 1;
    this.formData = {};

    // Reset all form inputs
    document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
    document.getElementById('locationInput').value = '';
    document.getElementById('groupSize').value = '';

    // Reset button states
    document.querySelectorAll('.btn-primary').forEach(btn => btn.disabled = true);

    // Specifically enable first step's next button only when input entered
    document.getElementById('nextBtn1').disabled = true;

    // Hide group size section (in case it was shown)
    document.getElementById('groupSizeSection').style.display = 'none';

    // Hide results panel
    const resultsEl = document.getElementById('results');
    resultsEl.style.display = 'none';
    resultsEl.classList.remove('show', 'active');

    // Hide all steps and only show step1
    for (let i = 1; i <= this.totalSteps; i++) {
        const stepEl = document.getElementById(`step${i}`);
        if (stepEl) {
            stepEl.classList.remove('active', 'slide-out');
            stepEl.style.display = 'none';
        }
    }
    const step1El = document.getElementById('step1');
    step1El.style.display = 'block';
    step1El.classList.add('active');

    // Reset progress bar and step label
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('currentStep').textContent = '1';

    // Also, disable calculate button on step 5, just in case
    document.getElementById('calculateBtn').disabled = true;
}
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DogWalkingCalculator();
});
