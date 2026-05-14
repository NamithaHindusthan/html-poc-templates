// Image Upload Functionality
document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            showNotification('Please upload a valid image file', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image size should be less than 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const profileImage = document.getElementById('profileImage');
            const uploadPrompt = document.getElementById('uploadPrompt');
            
            profileImage.src = e.target.result;
            profileImage.classList.remove('hidden');
            uploadPrompt.style.display = 'none';
            
            showNotification('Profile photo updated successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }
});

// AmCharts Configuration
am5.ready(function() {
    var root = am5.Root.new("chartdiv");
    root.setThemes([am5themes_Animated.new(root)]);
    
    var chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none"
    }));
    
    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));
    cursor.lineY.set("visible", false);
    cursor.lineX.set("visible", false);
    
    var xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 50 });
    xRenderer.labels.template.setAll({
        fontSize: 12,
        fontWeight: "600",
        fill: am5.color("#6F4E37")
    });
    
    var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: xRenderer
    }));
    
    var yRenderer = am5xy.AxisRendererY.new(root, {});
    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: yRenderer }));
    
    var series = chart.series.push(am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "category"
    }));
    
    series.columns.template.setAll({ 
        cornerRadiusTL: 6, 
        cornerRadiusTR: 6,
        fill: am5.color("#8B4513")
    });
    
    var data = [
        { category: "Experience (Years)", value: 12 },
        { category: "Client Satisfaction (%)", value: 98 },
        { category: "Policies Sold (100s)", value: 15 },
        { category: "Active Clients (100s)", value: 8 }
    ];
    
    xAxis.data.setAll(data);
    series.data.setAll(data);
    series.appear(1000);
    chart.appear(1000, 100);
});

// Show/Hide Vehicle Type based on Insurance Type
document.getElementById('insuranceType').addEventListener('change', function() {
    const vehicleTypeDiv = document.getElementById('vehicleTypeDiv');
    if (this.value === 'Vehicle Insurance') {
        vehicleTypeDiv.style.display = 'block';
    } else {
        vehicleTypeDiv.style.display = 'none';
    }
});

// WhatsApp Form Submission
document.getElementById('consultationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-3"></i>Preparing Message...';
    submitBtn.disabled = true;
    
    const formData = new FormData(this);
    const data = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        insuranceType: formData.get('insuranceType'),
        vehicleType: formData.get('vehicleType') || '',
        preferredDateTime: formData.get('preferredDateTime') || 'Not specified',
        message: formData.get('message') || 'No additional message'
    };
    
    // Validate form
    if (!validateForm(data)) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
    }
    
    // Create professional WhatsApp message
    let whatsappMessage = `Hi Gagan! 👋

I hope you're doing well. I would like to book a consultation for insurance.

📋 **CONSULTATION REQUEST**
================================
👤 **Name:** ${data.firstName} ${data.lastName}
📧 **Email:** ${data.email}
📱 **Phone:** ${data.phone}
🏥 **Insurance Type:** ${data.insuranceType}`;

    // Add vehicle type if applicable
    if (data.vehicleType) {
        whatsappMessage += `\n🚗 **Vehicle Type:** ${data.vehicleType}`;
    }

    whatsappMessage += `
📅 **Preferred Time:** ${data.preferredDateTime}
💬 **Message:** ${data.message}

⏰ **Submitted:** ${new Date().toLocaleString('en-IN')}
================================

Please let me know your availability for the consultation. I'm looking forward to discussing my insurance needs with you.

Thank you! 🙏`;

    // Store consultation locally
    storeConsultationLocally(data);
    
    // Copy to clipboard as backup
    navigator.clipboard.writeText(`NEW CONSULTATION: ${data.firstName} ${data.lastName} - ${data.insuranceType} - ${data.phone}`);
    
    setTimeout(() => {
        // Open WhatsApp with message (REPLACE WITH YOUR ACTUAL WHATSAPP NUMBER)
        const yourWhatsAppNumber = "919741655833"; // 👈 REPLACE THIS WITH YOUR NUMBER
        const whatsappURL = `https://wa.me/${yourWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        
        window.open(whatsappURL, '_blank');
        
        showNotification(`Thank you ${data.firstName}! WhatsApp opened with your consultation request. Please click "Send" to complete.`, 'success');
        this.reset();
        document.getElementById('vehicleTypeDiv').style.display = 'none';
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
});

// Form validation
function validateForm(data) {
    if (!data.firstName.trim() || !data.lastName.trim()) {
        showNotification('Please enter your full name', 'error');
        return false;
    }
    
    if (!data.email.trim()) {
        showNotification('Please enter your email address', 'error');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    if (!data.phone.trim()) {
        showNotification('Please enter your phone number', 'error');
        return false;
    }
    
    if (!data.insuranceType) {
        showNotification('Please select an insurance type', 'error');
        return false;
    }
    
    return true;
}

// Store consultation locally
function storeConsultationLocally(data) {
    try {
        const consultations = JSON.parse(localStorage.getItem('consultations') || '[]');
        const consultation = {
            ...data,
            id: Date.now(),
            timestamp: new Date().toLocaleString('en-IN'),
            status: 'sent_via_whatsapp'
        };
        
        consultations.unshift(consultation);
        
        if (consultations.length > 50) {
            consultations.splice(50);
        }
        
        localStorage.setItem('consultations', JSON.stringify(consultations));
    } catch (error) {
        console.log('Local storage not available');
    }
}

// Service-specific consultation buttons
document.querySelectorAll('.consultation-btn').forEach(button => {
    button.addEventListener('click', function() {
        const service = this.getAttribute('data-service');
        const form = document.querySelector('#consultationForm');
        const insuranceSelect = document.getElementById('insuranceType');
        
        insuranceSelect.value = service;
        
        // Show vehicle type if vehicle insurance
        if (service === 'Vehicle Insurance') {
            document.getElementById('vehicleTypeDiv').style.display = 'block';
        }
        
        // Smooth scroll to form
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        setTimeout(() => {
            document.querySelector('input[name="firstName"]').focus();
            showNotification(`${service} consultation selected. Please fill in your details.`, 'success');
        }, 1000);
    });
});

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, type === 'success' ? 5000 : 4000);
}

// Hover effects
document.querySelectorAll('.hover-lift').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Set minimum date for consultation
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.querySelector('input[name="preferredDateTime"]');
    if (dateInput) {
        const now = new Date();
        const minDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        dateInput.setAttribute('min', minDate.toISOString().slice(0, 16));
        
        // Set default to tomorrow 10 AM
        const tomorrow = new Date(minDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        dateInput.value = tomorrow.toISOString().slice(0, 16);
    }
});

// Admin function to view all consultations
function viewConsultations() {
    const consultations = JSON.parse(localStorage.getItem('consultations') || '[]');
    console.table(consultations);
    return consultations;
}

// Make admin function available globally
window.viewConsultations = viewConsultations;
